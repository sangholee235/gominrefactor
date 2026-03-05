import { useState } from "react";
import { useSushiDetailLogic } from '../hooks/useSushiDetailLogic';
import { postItImages } from '../hooks/useMySushiDetail';
import PostItAnswerView from '../component/modal/PostItAnswerView';
import '../styles/SushiDetail.css';
import '../styles/MySushiDetailModal.css';

const SushiDetail = () => {
  const { sushi, loading, error, handleGoBack } = useSushiDetailLogic();
  const [selectedAnswer, setSelectedAnswer] = useState<{
    id: number;
    content: string;
    createdAt: string;
    image: string;
  } | null>(null);

  const getShadowClass = (category?: number) => {
    if (!category) return "title-shadow-default";
    if (category >= 1 && category <= 6) return `title-shadow-${category}`;
    return "title-shadow-default";
  };

  const getPostItContent = (content: string) => {
    if (content.length > 500) return "답변 확인하기";
    return content;
  };

  if (loading) {
    return <div className="sushi-detail-loading">로딩 중...</div>;
  }

  if (error) {
    return <div className="sushi-detail-error">{error}</div>;
  }

  if (!sushi) {
    return <div className="sushi-detail-error">고민 정보를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="sushi-detail-page">
      <div className="my-sushi-modal">
        <div className="my-sushi-modal-container">
          {selectedAnswer ? (
            <PostItAnswerView
              title={sushi.title}
              answer={{
                id: selectedAnswer.id,
                content: selectedAnswer.content,
                createdAt: selectedAnswer.createdAt,
              }}
              onBack={() => setSelectedAnswer(null)}
            />
          ) : (
            <>
              <div className="my-sushi-modal-header">
                <div className="my-sushi-modal-header-spacer"></div>
                <h3 className={`my-sushi-modal-title ${getShadowClass(sushi.category)}`}>
                  {sushi.title}
                </h3>
                <button className="my-sushi-modal-close" onClick={handleGoBack}>X</button>
              </div>

              <div className="my-sushi-content-wrapper">
                <div className="my-sushi-text-section">
                  <p className="my-sushi-text">{sushi.content}</p>
                  <small className="my-sushi-date">
                    작성일: {new Date(sushi.createdAt).toLocaleDateString()}
                  </small>
                </div>

                <div className="my-sushi-answers-section">
                  <h4 className="my-sushi-answers-title">도착한 답변 ({sushi.answers.length})</h4>
                  {sushi.answers.length > 0 ? (
                    <div className="answers-scroll-area">
                      <div className="answers-postits-grid">
                        {sushi.answers.map((answer, index) => (
                          <div
                            key={answer.id}
                            className="postit-item"
                            onClick={() =>
                              setSelectedAnswer({
                                id: answer.id,
                                content: answer.content,
                                createdAt: answer.createdAt,
                                image: postItImages[index % postItImages.length],
                              })
                            }
                          >
                            <div className="postit-container small" style={{ cursor: 'pointer' }}>
                              <img
                                src={postItImages[index % postItImages.length]}
                                alt={`Post-it ${index + 1}`}
                                className="postit-image"
                              />
                              <div className="postit-text-wrapper">
                                <p className="postit-text small">{getPostItContent(answer.content)}</p>
                              </div>
                            </div>
                            <span className="answer-date small">
                              {new Date(answer.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="empty-text">아직 도착한 답변이 없습니다.</div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SushiDetail;
