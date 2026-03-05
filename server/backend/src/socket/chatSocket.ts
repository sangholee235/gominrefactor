import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { env } from '../config/env';
import { verifyAccessToken } from '../lib/jwt';
import { deleteMessage, editMessage, saveMessage } from '../services/chatService';

// Socket에 userId 정보를 추가하기 위한 인터페이스 확장
interface AuthenticatedSocket extends Socket {
    userId?: number;
}

export const initChatSocket = (httpServer: HttpServer) => {
    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: env.clientUrl,
            credentials: true,
        },
        path: '/socket.io',
    });

    // 인증 미들웨어: 소켓 연결 시 JWT 토큰 검증
    io.use((socket: AuthenticatedSocket, next) => {
        const token =
            (socket.handshake.auth as { token?: string }).token ||
            (socket.handshake.headers.authorization as string | undefined)?.replace(
                'Bearer ',
                '',
            );

        if (!token) {
            // 개발 환경 우회
            if (env.devAuthBypass && env.nodeEnv !== 'production') {
                const queryDevId = socket.handshake.auth.devUserId || socket.handshake.query.devUserId;
                const devId = queryDevId ? parseInt(queryDevId as string, 10) : env.devUserId;
                socket.userId = isNaN(devId) ? env.devUserId : devId;
                return next();
            }
            return next(new Error('인증 토큰이 필요합니다.'));
        }

        try {
            const payload = verifyAccessToken(token);
            if (payload.type !== 'access') {
                return next(new Error('잘못된 토큰 유형입니다.'));
            }
            socket.userId = payload.sub;
            return next();
        } catch {
            if (env.devAuthBypass && env.nodeEnv !== 'production') {
                const queryDevId = socket.handshake.auth.devUserId || socket.handshake.query.devUserId;
                const devId = queryDevId ? parseInt(queryDevId as string, 10) : env.devUserId;
                socket.userId = isNaN(devId) ? env.devUserId : devId;
                return next();
            }
            return next(new Error('유효하지 않은 토큰입니다.'));
        }
    });

    // 글로벌 채팅방 이름
    const GLOBAL_ROOM = 'global';

    const broadcastUserCount = () => {
        const count = io.sockets.adapter.rooms.get(GLOBAL_ROOM)?.size || 0;
        io.to(GLOBAL_ROOM).emit('user_count', { count });
    };

    io.on('connection', (socket: AuthenticatedSocket) => {
        const userId = socket.userId!;
        console.log(`[Chat] 사용자 #${userId} 연결됨 (socket: ${socket.id})`);

        // 연결 즉시 글로벌 방에 참가
        socket.join(GLOBAL_ROOM);
        socket.emit('joined', { room: GLOBAL_ROOM, userId });
        broadcastUserCount();

        // 메시지 전송 이벤트 처리
        socket.on('send_message', async (data: { content: string; type?: string; sushiId?: number }) => {
            if (!data?.content?.trim() && data?.type !== 'SUSHI_SHARE') return;

            const content = data.content?.trim() || '';
            const type = data.type || 'TEXT';
            const sushiId = data.sushiId;

            // 메시지 길이 제한
            if (content.length > 500) {
                socket.emit('error', { message: '메시지는 500자 이하여야 합니다.' });
                return;
            }

            try {
                // DB에 메시지 저장
                const savedMessage = await saveMessage(userId, content, type, sushiId);

                if (!savedMessage.user) {
                    console.error('[Chat] 메시지 저장 후 사용자 정보를 가져오는데 실패했습니다.');
                    socket.emit('error', { message: '메시지 전송에 실패했습니다.' });
                    return;
                }

                // 글로벌 방의 모든 클라이언트에게 브로드캐스트
                io.to(GLOBAL_ROOM).emit('new_message', {
                    id: savedMessage.id,
                    content: savedMessage.content,
                    type: savedMessage.type,
                    sushiId: savedMessage.sushiId,
                    sushi: savedMessage.sushi,
                    createdAt: savedMessage.createdAt,
                    updatedAt: savedMessage.updatedAt,
                    deletedAt: savedMessage.deletedAt,
                    userId: savedMessage.user.id,
                    provider: savedMessage.user.provider,
                    nickname: savedMessage.user.nickname,
                    userDeletedAt: savedMessage.user.deletedAt,
                });
            } catch (err) {
                console.error('[Chat] 메시지 저장 실패:', err);
                socket.emit('error', { message: '메시지 전송에 실패했습니다.' });
            }
        });

        // 📝 메시지 수정 이벤트
        socket.on('edit_message', async (data: { messageId: number; content: string }) => {
            if (!data?.content?.trim()) return;

            const content = data.content.trim();
            if (content.length > 500) {
                socket.emit('error', { message: '메시지는 500자 이하여야 합니다.' });
                return;
            }

            try {
                const updatedMessage = await editMessage(data.messageId, userId, content);
                io.to(GLOBAL_ROOM).emit('message_edited', {
                    id: updatedMessage.id,
                    content: updatedMessage.content,
                    updatedAt: updatedMessage.updatedAt,
                });
            } catch (err: any) {
                console.error('[Chat] 메시지 수정 실패:', err);
                socket.emit('error', { message: err.message || '메시지 수정에 실패했습니다.' });
            }
        });

        // 🗑️ 메시지 삭제 이벤트
        socket.on('delete_message', async (data: { messageId: number }) => {
            try {
                const deletedMessage = await deleteMessage(data.messageId, userId);
                io.to(GLOBAL_ROOM).emit('message_deleted', {
                    id: deletedMessage.id,
                    deletedAt: deletedMessage.deletedAt,
                });
            } catch (err: any) {
                console.error('[Chat] 메시지 삭제 실패:', err);
                socket.emit('error', { message: err.message || '메시지 삭제에 실패했습니다.' });
            }
        });

        // ⌨️ 타이핑 상태 감지
        socket.on('typing', (data: { nickname: string | undefined }) => {
            socket.to(GLOBAL_ROOM).emit('typing', {
                userId,
                nickname: data.nickname,
            });
        });

        socket.on('stop_typing', () => {
            socket.to(GLOBAL_ROOM).emit('stop_typing', { userId });
        });

        // 연결 종료
        socket.on('disconnect', (reason) => {
            console.log(`[Chat] 사용자 #${userId} 연결 종료 (reason: ${reason})`);
            socket.to(GLOBAL_ROOM).emit('stop_typing', { userId }); // 퇴장 시 타이핑 해제
            broadcastUserCount();
        });
    });

    console.log('[Chat] Socket.io 채팅 서버 초기화 완료');
    return io;
};
