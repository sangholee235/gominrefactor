import React, { useState } from 'react';
import PostItAnswerView from './PostItAnswerView';
import { useMySushiDetail, postItImages } from '../../hooks/useMySushiDetail';
import { useUpdateSushi } from '../../hooks/useSushi'; // 기존 파일 참조 유지
import { useChatSocket } from '../../hooks/useChatSocket';
import { useNavigate } from 'react-router-dom';
// import { useQueryClient } from '@tanstack/react-query';

import '../../styles/MySushiDetailModal.css';

interface MySushiDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  sushiId: number | null;
}

const MySushiDetailModal = ({ isOpen, onClose, sushiId }: MySushiDetailModalProps) => {
  // const queryClient = useQueryClient();
  const {
    sushi,
    loading,
    error,
    selectedAnswer,
    setSelectedAnswer
  } = useMySushiDetail(isOpen, sushiId);

  const { sendMessage, isConnected } = useChatSocket();
  const navigate = useNavigate();

  const [isEditLayerOpen, setIsEditLayerOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [titleOverride, setTitleOverride] = useState<string | null>(null);
  const [contentOverride, setContentOverride] = useState<string | null>(null);

  const { mutate: updateSushi, isPending: isUpdating } = useUpdateSushi();

  const openEditLayer = () => {
    if (sushi) {
      // 항상 최신 제목과 내용으로 설정 (titleOverride/contentOverride 반영)
      setEditTitle(titleOverride ?? sushi.title);
      setEditContent(contentOverride ?? sushi.content);
      setIsEditLayerOpen(true);
    }
  };

  if (!isOpen) return null;

  const handleUpdateSubmit = () => {
    if (!sushiId || !editTitle.trim() || !editContent.trim()) return;

    updateSushi(
      { sushiId, title: editTitle, content: editContent },
      {
        onSuccess: (updatedSushi) => {
          setTitleOverride(updatedSushi.title ?? editTitle);
          setContentOverride(updatedSushi.content ?? editContent);
          setIsEditLayerOpen(false);
          alert("고민이 수정되었습니다.");
          window.dispatchEvent(new CustomEvent('mySushiUpdated'));
        },
        onError: (err: any) => {
          alert(err.message || "수정 중 오류가 발생했습니다.");
        }
      }
    );
  };

  const handleShareToChat = () => {
    if (sushi && isConnected) {
      sendMessage(`[고민 공유] ${sushi.title}`, 'SUSHI_SHARE', sushi.id);
      if (window.confirm("채팅방에 고민이 공유되었습니다! 채팅방으로 이동하시겠습니까?")) {
        onClose();
        navigate('/chat');
      }
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      if (selectedAnswer) {
        setSelectedAnswer(null);
      } else if (!isEditLayerOpen) {
        onClose();
      }
    }
  };

  // ... (getShadowClass, getPostItContent 동일)
  const getShadowClass = (category?: number) => {
    if (!category) return "title-shadow-default";
    if (category >= 1 && category <= 6) return `title-shadow-${category}`;
    return "title-shadow-default";
  };

  const getPostItContent = (content: string) => {
    if (content.length > 500) return "답변 확인하기";
    return content;
  };

  return (
    <>


      <div className="my-sushi-modal-overlay" onClick={handleOverlayClick}>
        <div className="my-sushi-modal">
          <div className="my-sushi-modal-container">

            {/* 수정용 독립 레이어 */}
            {isEditLayerOpen && (
              <div className="edit-layer-overlay">
                <div className="edit-layer-content" onClick={(e) => e.stopPropagation()}>
                  <h3 style={{ marginTop: 0, color: '#5A4628' }}>내용 수정</h3>
                  <div className="edit-input-container">
                    <input
                      className="edit-input-field"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      maxLength={100}
                    />
                    <div className="character-count">
                      {editTitle.length}/100자
                    </div>
                  </div>
                  <div className="edit-textarea-container">
                    <textarea
                      className="edit-textarea-field"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      maxLength={500}
                    />
                    <div className="character-count">
                      {editContent.length}/500자
                    </div>
                  </div>
                  <div className="edit-layer-btns">
                    <button onClick={() => setIsEditLayerOpen(false)} className="layer-cancel-btn">취소</button>
                    <button onClick={handleUpdateSubmit} disabled={isUpdating} className="layer-save-btn">
                      {isUpdating ? "저장 중..." : "수정 완료"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {selectedAnswer && sushi ? (
              <PostItAnswerView
                title={sushi.title}
                answer={selectedAnswer.data}
                onBack={() => setSelectedAnswer(null)}
              />
            ) : (
              <>
                <div className="my-sushi-modal-header">
                  <div className="my-sushi-modal-header-spacer"></div>
                  {sushi && (
                    <h3 className={`my-sushi-modal-title ${getShadowClass(sushi.category)}`}>
                      {titleOverride ?? sushi.title}
                    </h3>
                  )}
                  <button className="my-sushi-modal-close" onClick={onClose}>X</button>
                </div>

                <div className="my-sushi-content-wrapper">
                  {loading ? (
                    <div className="loading-text">로딩 중...</div>
                  ) : error ? (
                    <div className="error-text">{error}</div>
                  ) : sushi ? (
                    <>
                      <div className="my-sushi-text-section">
                        <p className="my-sushi-text">{contentOverride ?? sushi.content}</p>

                        <div className="my-sushi-text-footer">
                          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                            <button className="my-sushi-edit-text-btn" onClick={openEditLayer}>
                              수정하기
                            </button>
                            <button
                              className="my-sushi-edit-text-btn"
                              onClick={handleShareToChat}
                              style={{ color: '#b2975c' }}
                              disabled={!isConnected}
                            >
                              {isConnected ? "채팅방에 공유하기 💬" : "연결 중..."}
                            </button>
                          </div>

                          <small className="my-sushi-date">
                            작성일: {new Date(sushi.createdAt).toLocaleDateString()}
                          </small>
                        </div>
                      </div>

                      <div className="my-sushi-answers-section">
                        <h4 className="my-sushi-answers-title">도착한 답변 ({sushi.answers.length})</h4>
                        {/* 답변 목록... (기존과 동일) */}
                        {sushi.answers.length > 0 ? (
                          <div className="answers-scroll-area">
                            <div className="answers-postits-grid">
                              {sushi.answers.map((answer, index) => (
                                <div key={answer.id} className="postit-item" onClick={() => setSelectedAnswer({ data: answer, image: postItImages[index % 5] })}>
                                  <div className="postit-container small">
                                    <img src={postItImages[index % 5]} alt="Postit" className="postit-image" />
                                    <div className="postit-text-wrapper">
                                      <p className="postit-text small">{getPostItContent(answer.content)}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="empty-text">아직 도착한 답변이 없습니다.</div>
                        )}
                      </div>
                    </>
                  ) : null}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MySushiDetailModal;
