import { useRef } from "react";
import SushiAnswerCard from "../component/SushiAnswerCard";
import MyAnswerDetailModal from "../component/modal/MyAnswerDetailModal";
import directionIcon from "../assets/direction.svg";
import { useMyAnswerList } from "../hooks/useMyAnswerList";
import "../styles/MyAnswerList.css";

const MyAnswerList = () => {
  const {
    answerList,
    loading,
    searchTerm,
    setSearchTerm,
    isModalOpen,
    selectedAnswer,
    handleCardClick,
    handleDelete, // 훅에서 가져오기
    closeModal,
    scrollToTop,
    reorderAnswerList,
    fetchAnswers
  } = useMyAnswerList();
  const dragIndexRef = useRef<number | null>(null);

  return (
    <div
      id="my-answer-list-background"
      className="my-answer-list-background"
    >
      <div className="my-answer-list-container">
        {/* 검색창 */}
        <div className="my-answer-list-search-container">
          <div className="my-answer-list-input-wrapper">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="답변을 검색해주세요"
              className="my-answer-list-search-input"
            />
            <span className="my-answer-list-search-icon" onClick={() => fetchAnswers()}>
              🔍
            </span>
          </div>
        </div>

        {/* <div>
          <div className="my-answer-outer-box">
            <div className="my-answer-inner-box">나의 답변</div>
          </div>
        </div> */}

        {loading ? (
          <div className="my-answer-loading-text">로딩 중...</div>
        ) : answerList.length > 0 ? (
          <ul className="my-answer-list">
            {answerList.map((answer, index) => (
              <li
                key={`${answer.id}-${index}`}
                className="my-answer-list-item"
                draggable
                onDragStart={() => {
                  dragIndexRef.current = index;
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragIndexRef.current !== null) {
                    reorderAnswerList(dragIndexRef.current, index);
                    dragIndexRef.current = null;
                  }
                }}
              >
                <SushiAnswerCard
                  id={answer.sushiId}
                  category={answer.sushi.categoryId ?? 0}
                  title={answer.sushi.title}
                  content={answer.content}
                  sushiType={answer.sushi.sushiTypeId ?? 0}
                  onClick={() => handleCardClick(answer)}
                  onDelete={() => handleDelete(answer.id)}
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="my-answer-no-result">작성한 답변이 없습니다.</div>
        )}
      </div>

      <button onClick={scrollToTop} className="my-answer-scroll-top-btn">
        <img
          src={directionIcon}
          alt="위로 가기"
          className="my-answer-scroll-icon"
        />
      </button>

      <MyAnswerDetailModal
        isOpen={isModalOpen}
        onClose={closeModal}
        answer={selectedAnswer}
        sushiId={selectedAnswer?.sushiId || null}
      />
    </div>
  );
};

export default MyAnswerList;
