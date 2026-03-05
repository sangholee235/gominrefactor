import { useShareSushi } from "../hooks/useShareSushi";
import { useChatSocket } from "../hooks/useChatSocket";
import { useNavigate } from "react-router-dom";
import "../styles/SushiView.css";
import "../styles/ShareSushi.css";

const ShareSushi = () => {
  const navigate = useNavigate();
  const { sushi, loading, error, handleAnswerClick, handleClose } = useShareSushi();
  const { sendMessage, isConnected } = useChatSocket();

  const handleShareToChat = () => {
    if (sushi && isConnected) {
      sendMessage(`[고민 공유] ${sushi.title}`, 'SUSHI_SHARE', sushi.id);
      if (window.confirm("채팅방에 공유되었습니다! 채팅방으로 이동하시겠습니까?")) {
        navigate('/chat');
      }
    }
  };

  if (loading) return <div className="share-sushi-loading">로딩 중...</div>;
  if (error) return <div className="share-sushi-error">{error}</div>;
  if (!sushi) return <div className="share-sushi-error">고민을 찾을 수 없습니다.</div>;

  const getShadowClass = (category?: number) => {
    if (!category) return "title-shadow-default";
    if (category >= 1 && category <= 6) return `title-shadow-${category}`;
    return "title-shadow-default";
  };

  return (
    <div className="share-sushi-page">
      {/* 종이 질감 컨테이너 재사용 */}
      <div className="sushi-view-container share-sushi-paper-container">
        {/* 상단 버튼 Row */}
        <div className="sushi-view-button-row">
          <div className="share-sushi-header-spacer" />

          <h3
            className={`sushi-view-title sushi-view-title--header ${getShadowClass(sushi.category)}`}
          >
            {sushi.title}
          </h3>

          <button className="sushi-view-icon-button" onClick={handleClose}>
            X
          </button>
        </div>

        {/* 본문 내용 */}
        <div className="share-sushi-content-wrapper">
          <p className="sushi-view-text" style={{ whiteSpace: "pre-wrap" }}>
            {sushi.content}
          </p>
        </div>

        {/* 답변하기 버튼 또는 완료 메시지 */}
        <div className="share-sushi-actions">
          {(sushi.remainingAnswers ?? 0) <= 0 || sushi.isClosed ? (
            <div className="share-sushi-closed-badge">
              해결 완료된 고민이에요 ✅
            </div>
          ) : (
            <button
              className="sushi-view-action share-sushi-answer-btn"
              onClick={handleAnswerClick}
            >
              이 고민 해결해주기 🍣
            </button>
          )}

          <button
            className="sushi-view-action share-sushi-chat-btn"
            onClick={handleShareToChat}
            disabled={!isConnected}
            style={{
              marginTop: '10px',
              backgroundColor: '#3a2c1a',
              color: 'white',
              opacity: isConnected ? 1 : 0.5
            }}
          >
            {isConnected ? '채팅방에 공유하기 💬' : '채팅 서버 연결 중...'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareSushi;

