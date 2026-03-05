import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { getChatHistory, type ChatMessage } from '../api/chatApi';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL.replace('/api', '')
    : 'http://localhost:3000';

export const useChatSocket = () => {
    const socketRef = useRef<Socket | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [socketUserId, setSocketUserId] = useState<number | null>(null);
    const [typingUsers, setTypingUsers] = useState<{ [userId: number]: string }>({});
    const [userCount, setUserCount] = useState(0);

    useEffect(() => {
        const token = localStorage.getItem('userToken');
        const devUserId = localStorage.getItem('devUserId');

        // 히스토리 먼저 로드
        getChatHistory(50)
            .then((history) => setMessages(history))
            .catch(() => setError('이전 채팅 기록을 불러오지 못했습니다.'));

        // Socket.io 연결
        const socket = io(SOCKET_URL, {
            auth: { token: token ?? '', devUserId: devUserId ?? undefined },
            transports: ['websocket', 'polling'],
        });

        socket.on('connect', () => {
            setIsConnected(true);
            setError(null);
        });

        socket.on('joined', (data: { room: string; userId: number }) => {
            setSocketUserId(data.userId);
        });

        socket.on('user_count', (data: { count: number }) => {
            setUserCount(data.count);
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
            setSocketUserId(null);
        });

        socket.on('new_message', (msg: ChatMessage) => {
            setMessages((prev) => [...prev, msg]);
        });

        socket.on('message_edited', (data: { id: number; content: string; updatedAt: string }) => {
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === data.id ? { ...msg, content: data.content, updatedAt: data.updatedAt } : msg
                )
            );
        });

        socket.on('message_deleted', (data: { id: number; deletedAt: string }) => {
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === data.id ? { ...msg, deletedAt: data.deletedAt } : msg
                )
            );
        });

        socket.on('nickname_changed', (data: { userId: number; oldNickname: string | null; newNickname: string }) => {
            const systemMsg: ChatMessage = {
                id: Date.now(), // 클라이언트 사이드 고유 ID
                content: `${data.oldNickname || `#${data.userId}`}님이 ${data.newNickname}로 닉네임을 변경하셨습니다.`,
                type: 'SYSTEM',
                createdAt: new Date().toISOString(),
                userId: 0, // 시스템 메시지용 가상 ID
                provider: 'system',
            };
            setMessages((prev) => [...prev, systemMsg]);
        });

        socket.on('typing', (data: { userId: number; nickname: string | undefined }) => {
            setTypingUsers((prev) => ({
                ...prev,
                [data.userId]: data.nickname || `#${data.userId}`,
            }));
        });

        socket.on('stop_typing', (data: { userId: number }) => {
            setTypingUsers((prev) => {
                const newState = { ...prev };
                delete newState[data.userId];
                return newState;
            });
        });

        socket.on('error', (err: { message: string }) => {
            setError(err.message);
        });

        socket.on('connect_error', (err) => {
            setError(`연결 오류: ${err.message}`);
        });

        socketRef.current = socket;

        return () => {
            socket.disconnect();
        };
    }, []);

    const sendMessage = useCallback((content: string, type: 'TEXT' | 'SUSHI_SHARE' = 'TEXT', sushiId?: number) => {
        if (!socketRef.current?.connected) return;
        socketRef.current.emit('send_message', { content, type, sushiId });
    }, []);

    const editMessage = useCallback((messageId: number, content: string) => {
        if (!socketRef.current?.connected) return;
        socketRef.current.emit('edit_message', { messageId, content });
    }, []);

    const deleteMessage = useCallback((messageId: number) => {
        if (!socketRef.current?.connected) return;
        socketRef.current.emit('delete_message', { messageId });
    }, []);

    const sendTyping = useCallback((nickname?: string | null) => {
        if (!socketRef.current?.connected) return;
        socketRef.current.emit('typing', { nickname });
    }, []);

    const sendStopTyping = useCallback(() => {
        if (!socketRef.current?.connected) return;
        socketRef.current.emit('stop_typing');
    }, []);

    return {
        messages,
        isConnected,
        error,
        sendMessage,
        editMessage,
        deleteMessage,
        sendTyping,
        sendStopTyping,
        socketUserId,
        typingUsers,
        userCount
    };
};
