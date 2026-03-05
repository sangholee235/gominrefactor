import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatSocket } from '../hooks/useChatSocket';
import { useAuth } from '../context/AuthContext';
import SushiSelectionModal from '../component/modal/SushiSelectionModal';
import '../styles/Chat.css';
import '../styles/SushiDetail.css'; // 스시 카드 스타일 재사용을 위해 추가

const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
};

const Chat = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { messages, isConnected, error, sendMessage, editMessage, deleteMessage, sendTyping, sendStopTyping, socketUserId, typingUsers, userCount } = useChatSocket();
    const [inputValue, setInputValue] = useState('');
    const [editingMsgId, setEditingMsgId] = useState<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [isSushiModalOpen, setIsSushiModalOpen] = useState(false);

    // 새 메시지 도착 또는 처음 로딩 시 100ms 지연하여 자동 스크롤 확실하게 적용
    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, typingUsers]);

    const handleSend = () => {
        const content = inputValue.trim();
        if (!content || !isConnected) return;

        if (editingMsgId) {
            editMessage(editingMsgId, content);
            setEditingMsgId(null);
        } else {
            sendMessage(content);
        }

        setInputValue('');
        sendStopTyping();
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        // textarea 높이 초기화
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleInput = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }

        // 타이핑 상태 브로드캐스트 (내 닉네임) 디바운스
        sendTyping(user?.nickname);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            sendStopTyping();
        }, 2000); // 2초간 입력 없으면 타이핑 중지
    };

    const handleSushiSelect = (sushi: { id: number; title: string; content: string }) => {
        sendMessage(`[고민 공유] ${sushi.title}`, 'SUSHI_SHARE', sushi.id);
        setIsSushiModalOpen(false);
    };

    const handleEditClick = (msgId: number, currentContent: string) => {
        setEditingMsgId(msgId);
        setInputValue(currentContent);
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    };

    const handleDeleteClick = (msgId: number) => {
        if (window.confirm("메시지를 삭제하시겠습니까? (삭제 후 복구할 수 없습니다)")) {
            deleteMessage(msgId);
        }
    };

    // 사용자 정보 로딩 중일 때 표시
    // - 카카오 로그인했다면: user 정보는 곧 채워짐
    // - DEV_MODE/토큰우회: user가 평생 안 들어오고 isLoggedIn만 true이거나 둘 다 false일 수 있음.
    // => 무한 로딩 방지를 위해 3초가 지나거나 초기 인증 여부에 의존하는 방식으로 우회 필요.
    const [isUserLoading, setIsUserLoading] = useState(true);

    useEffect(() => {
        // 1초 뒤에는 로딩 화면 해제 (네트워크 지연 고려)
        const timer = setTimeout(() => setIsUserLoading(false), 1000);
        if (user) setIsUserLoading(false);
        // 소켓 정보가 로드되었다면 로딩 해제 (서버에서 내 정보 인지 완료)
        if (socketUserId) setIsUserLoading(false);
        return () => clearTimeout(timer);
    }, [user, socketUserId]);

    if (!user && !socketUserId && isUserLoading) {
        return (
            <div className="chat-wrapper" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <span style={{ color: '#b2975c' }}>사용자 정보를 불러오는 중입니다...</span>
            </div>
        );
    }

    // 소켓이 제공하는 확실한 내 ID (없으면 인증 정보 기반 렌더링 폴백)
    const currentUserId = socketUserId || user?.id;

    return (
        <div className="chat-wrapper">
            {/* 헤더 */}
            <div className="chat-header">
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '2vh',
                        color: '#3a2c1a',
                        padding: 0,
                    }}
                >
                    ←
                </button>
                <div className="chat-header-title-container">
                    <span className="chat-header-title">💬 글로벌 채팅</span>
                    {userCount > 0 && <span className="chat-header-user-count">{userCount}</span>}
                </div>
                <div className={`chat-status-dot ${isConnected ? 'connected' : ''}`} />
                <span className="chat-status-text">
                    {isConnected ? '연결됨' : '연결 중...'}
                </span>
            </div>

            {/* 에러 배너 */}
            {error && <div className="chat-error-banner">⚠️ {error}</div>}

            {/* 메시지 목록 */}
            <div className="chat-messages">
                {messages.length === 0 ? (
                    <div className="chat-empty">
                        <span className="chat-empty-icon">💭</span>
                        <span className="chat-empty-text">첫 번째 메시지를 남겨보세요!</span>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMine = Number(currentUserId) === Number(msg.userId);
                        const isDeleted = !!msg.deletedAt;

                        if (msg.type === 'SYSTEM') {
                            return (
                                <div key={msg.id} className="chat-system-message">
                                    <span className="chat-system-message-text">{msg.content}</span>
                                </div>
                            );
                        }

                        return (
                            <div
                                key={msg.id}
                                className={`chat-message ${isMine ? 'mine' : 'others'} ${isDeleted ? 'deleted' : ''}`}
                            >
                                {!isMine && (
                                    <div className="chat-message-user">
                                        {!msg.userId || msg.userDeletedAt ? "(탈퇴한 사용자)" : (msg.nickname ? msg.nickname : `#${msg.userId}`)}
                                    </div>
                                )}
                                <div className="chat-message-content-wrapper">
                                    {isMine && !isDeleted && (
                                        <div className="chat-message-actions">
                                            <button onClick={() => handleDeleteClick(msg.id)}>삭제</button>
                                            {msg.type !== 'SUSHI_SHARE' && (
                                                <button onClick={() => handleEditClick(msg.id, msg.content)}>수정</button>
                                            )}
                                            <span className="chat-message-time">
                                                {formatTime(msg.createdAt)}
                                            </span>
                                        </div>
                                    )}
                                    {isMine && isDeleted && (
                                        <span className="chat-message-time">
                                            {formatTime(msg.createdAt)}
                                        </span>
                                    )}
                                    <div className="chat-message-bubble">
                                        {isDeleted ? (
                                            <span style={{ fontStyle: 'italic', color: '#999' }}>삭제된 메시지입니다.</span>
                                        ) : msg.type === 'SUSHI_SHARE' && msg.sushi ? (
                                            <div
                                                className="chat-sushi-card"
                                                onClick={() => navigate(`/sushi/${msg.sushiId}`)}
                                            >
                                                <div className="chat-sushi-card-header">
                                                    <span>🍣</span> {msg.sushi.title}
                                                </div>
                                                <div className="chat-sushi-card-content">
                                                    {msg.sushi.content}
                                                </div>
                                                <div className="chat-sushi-card-footer">
                                                    상세보기 &gt;
                                                </div>
                                            </div>
                                        ) : (
                                            msg.content
                                        )}
                                        {!isDeleted && msg.updatedAt && msg.updatedAt !== msg.createdAt && (
                                            <span style={{ fontSize: '0.7em', color: '#777', marginLeft: '8px' }}>(수정됨)</span>
                                        )}
                                    </div>
                                    {!isMine && (
                                        <span className="chat-message-time">
                                            {formatTime(msg.createdAt)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* 입력 중 텍스트 (하단 고정) */}
            {Object.keys(typingUsers).length > 0 && (
                <div style={{ padding: '4px 16px', fontSize: '0.8rem', color: '#888', fontStyle: 'italic' }}>
                    {Object.values(typingUsers).join(', ')} 님이 입력 중입니다...
                </div>
            )}

            {/* 입력 영역 */}
            <div className="chat-input-area" style={editingMsgId ? { backgroundColor: '#fffae8', borderTop: '2px solid #e1d3a5', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' } : {}}>
                {editingMsgId && (
                    <div style={{ width: '100%', fontSize: '0.8rem', color: '#b99523', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>✏️ 메시지를 수정하고 있습니다.</span>
                        <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => { setEditingMsgId(null); setInputValue(''); }}>취소</span>
                    </div>
                )}
                <div style={{ display: 'flex', width: '100%', gap: '1.5vw', alignItems: 'center' }}>
                    <button
                        className="chat-sushi-share-btn"
                        onClick={() => setIsSushiModalOpen(true)}
                        title="내 고민 공유하기"
                    >
                        🍣
                    </button>
                    <textarea
                        ref={textareaRef}
                        className="chat-input"
                        placeholder={isConnected ? '메시지를 입력하세요...' : '연결 중...'}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onInput={handleInput}
                        disabled={!isConnected}
                        rows={1}
                        maxLength={500}
                    />
                    <button
                        className="chat-send-btn"
                        onClick={handleSend}
                        disabled={!isConnected || !inputValue.trim()}
                        aria-label="메시지 전송"
                    >
                        <svg className="chat-send-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                        </svg>
                    </button>
                </div>
            </div>

            <SushiSelectionModal
                isOpen={isSushiModalOpen}
                onClose={() => setIsSushiModalOpen(false)}
                onSelect={handleSushiSelect}
            />
        </div>
    );
};

export default Chat;
