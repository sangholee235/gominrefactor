import React, { useState } from 'react';
import PostItAnswerView from './PostItAnswerView';
import postItImage from '../../assets/postIt.webp';
import '../../styles/MySushiDetailModal.css';
import { useMyAnswerDetail } from '../../hooks/useMyAnswerDetail';
import type { MyAnswer } from '../../types/mySushi';

interface MyAnswerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  answer: MyAnswer | null;
  sushiId: number | null;
}

const titleShadowColors: Record<number, string> = {
  1: "rgba(255, 0, 0, 0.4)",
  2: "rgba(255, 255, 0, 0.4)",
  3: "rgba(83, 178, 0, 0.4)",
  4: "rgba(0, 179, 255, 0.4)",
  5: "rgba(183, 6, 227, 0.4)",
  6: "rgba(157, 157, 157, 0.4)",
};

const MyAnswerDetailModal = ({ isOpen, onClose, answer, sushiId }: MyAnswerDetailModalProps) => {
  const {
    sushi,
    loading,
    error,
    showAnswerDetail,
    setShowAnswerDetail,
    updateAnswer,
    isUpdating
  } = useMyAnswerDetail(isOpen, sushiId);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      if (showAnswerDetail) {
        setShowAnswerDetail(false);
      } else {
        onClose();
      }
    }
  };

  const categoryId = sushi?.category?.id || 0;
  const titleShadowColor =
    (categoryId && titleShadowColors[categoryId]) ||
    "rgba(255, 255, 255, 0.4)";

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [override, setOverride] = useState<{ id: number; content: string } | null>(null);

  const openEditLayer = () => {
    const currentContent =
      override && answer && override.id === answer.id
        ? override.content
        : (answer?.content ?? "");
    setEditContent(currentContent);
    setIsEditOpen(true);
  };

  const handleUpdateSubmit = async () => {
    if (!answer) return;
    const content = editContent.trim();
    if (!content) {
      alert("내용을 입력하세요.");
      return;
    }
    const updated = await updateAnswer(answer.id, content);
    if (!updated) return;
    setOverride({ id: answer.id, content: updated.content });
    window.dispatchEvent(new CustomEvent('myAnswerUpdated'));
    setIsEditOpen(false);
    if (showAnswerDetail) {
      setShowAnswerDetail(true);
    }
  };

  const getPostItContent = (content: string) => {
    if (content.length > 500) return "답변 확인하기";
    return content;
  };

  if (!isOpen) return null;

  return (
    <div className="my-sushi-modal-overlay" onClick={handleOverlayClick}>
      <div className="my-sushi-modal">
        <div className="my-sushi-modal-container">
          <style>{`
            .edit-layer-overlay {
              position: absolute;
              top: 0; left: 0; width: 100%; height: 100%;
              background: transparent;
              display: flex; justify-content: center; align-items: center;
              z-index: 100; border-radius: inherit;
            }
            .edit-layer-content {
              background: #FFFFF0;
              width: 90%;
              max-width: calc(40 * var(--custom-vh));
              padding: calc(2.5 * var(--custom-vh));
              border-radius: 15px;
              border: 2px solid #B2975C;
              box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            }
            .edit-textarea-field {
              width: 100%; padding: 10px; margin-bottom: 12px;
              border: 1px solid #B2975C; border-radius: 8px;
              font-size: calc(1.8 * var(--custom-vh));
              box-sizing: border-box; outline: none;
              height: calc(15 * var(--custom-vh)); resize: none;
            }
            .edit-layer-btns { display: flex; justify-content: center; gap: 10px; }
            .layer-cancel-btn, .layer-save-btn {
              padding: 8px 20px; border-radius: 6px; border: none;
              font-weight: bold; cursor: pointer;
            }
            .layer-cancel-btn { background: #E0E0E0; }
            .layer-save-btn { background: #B2975C; color: white; }
            .answer-actions { margin-top: calc(1 * var(--custom-vh)); display: flex; justify-content: space-between; align-items: flex-end; }
            .answer-edit-btn {
              background: none; border: none; color: #8D7B7B;
              text-decoration: underline; font-size: calc(1.5 * var(--custom-vh));
              cursor: pointer; padding: 0;
            }
            .answer-edit-btn:hover { color: #B2975C; }
          `}</style>

          {isEditOpen && (
            <div className="edit-layer-overlay">
              <div className="edit-layer-content" onClick={(e) => e.stopPropagation()}>
                <h3 style={{textAlign:'center', color:'#5A4628', marginBottom:'15px'}}>답변 수정</h3>
                <div className="edit-textarea-container">
                  <textarea
                    className="edit-textarea-field"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="답변 내용을 입력하세요"
                    maxLength={500}
                  />
                  <div className="character-count">
                    {editContent.length}/500자
                  </div>
                </div>
                <div className="edit-layer-btns">
                  <button onClick={() => setIsEditOpen(false)} className="layer-cancel-btn">취소</button>
                  <button onClick={handleUpdateSubmit} disabled={isUpdating} className="layer-save-btn">
                    {isUpdating ? "저장 중..." : "수정 완료"}
                  </button>
                </div>
              </div>
            </div>
          )}
          {showAnswerDetail && sushi && answer ? (
            <PostItAnswerView 
                title={sushi.title}
                answer={{
                  id: answer.id,
                  content:
                    override && override.id === answer.id
                      ? override.content
                      : answer.content,
                  createdAt: answer.createdAt
                }}
                onBack={() => setShowAnswerDetail(false)}
                onEdit={openEditLayer}
            />
          ) : (
            <>
              <div className="my-sushi-modal-header">
                <div style={{ width: 'calc(2.5 * var(--custom-vh))' }}></div>
                
                {sushi ? (
                    <h3 
                        className="my-sushi-modal-title"
                        style={{
                            boxShadow: `0 calc(0.5 * var(--custom-vh)) 0px ${titleShadowColor}`,
                        }}
                    >
                        {sushi.title}
                    </h3>
                ) : (
                    <div className="my-sushi-modal-title">...</div>
                )}
                
                <button className="my-sushi-modal-close" onClick={onClose}>X</button>
              </div>

              <div className="my-sushi-content-wrapper">
                {loading ? (
                  <div className="loading-text">로딩 중...</div>
                ) : error ? (
                  <div className="error-text">{error}</div>
                ) : sushi && answer ? (
                  <>
                    <div className="my-sushi-text-section">
                      <p className="my-sushi-text">{sushi.content}</p>
                      <small style={{ color: '#999', fontSize: '1.2vh', marginTop: '1vh', display: 'block' }}>
                        작성일: {new Date(sushi.createdAt).toLocaleDateString()}
                      </small>
                    </div>

                    <div className="my-sushi-answers-section">
                      <h4 className="my-sushi-answers-title">내가 보낸 답변</h4>
                      <div 
                        className="postit-container" 
                        onClick={() => setShowAnswerDetail(true)}
                        style={{ cursor: 'pointer' }}
                      >
                        <img src={postItImage} alt="Post-it" className="postit-image" />
                        <div className="postit-text-wrapper">
                          <p className="postit-text">
                            {getPostItContent(
                              override && override.id === answer.id
                                ? override.content
                                : answer.content
                            )}
                          </p>
                        </div>
                      </div>
                      <span className="answer-date">
                        {new Date(answer.createdAt).toLocaleDateString()}
                      </span>
                      <div className="answer-actions">
                        <button className="answer-edit-btn" onClick={openEditLayer}>수정하기</button>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyAnswerDetailModal;
