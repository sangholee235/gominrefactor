import { useRef } from 'react';
import SushiCard from '../component/SushiCard';
import MySushiDetailModal from '../component/modal/MySushiDetailModal';
import directionIcon from '../assets/direction.svg';
import { useMySushiList } from '../hooks/useMySushiList';
import '../styles/MySushiList.css';

const MySushiList = () => {
  const {
    sushiList,
    loading,
    loadingMore,
    searchTerm,
    setSearchTerm,
    selectedSushiId,
    isModalOpen,
    scrollRef,
    fetchSushi,
    handleScrollToTop,
    handleCardClick,
    closeModal,
    handleDeleteSushi,
    reorderSushiList,
  } = useMySushiList();

  const dragIndexRef = useRef<number | null>(null);

  return (
    <>
      <div 
        className="my-sushi-list-background"
        ref={scrollRef}
      >
        <div className="my-sushi-list-container">
          {/* 검색창 */}
          <div className="my-sushi-list-search-container">
            <div className="my-sushi-list-input-wrapper">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="고민을 검색해주세요"
                className="my-sushi-list-search-input"
              />
              <span className="my-sushi-list-search-icon" onClick={() => fetchSushi(1, false)}>
                 🔍
              </span>
            </div>
          </div>

          {loading ? (
            <div className="my-sushi-list-loading">로딩 중...</div>
          ) : sushiList.length > 0 ? (
            <>
              <ul className="my-sushi-list-items">
                {sushiList.map((sushi, index) => (
                  <li
                    key={sushi.id}
                    className="my-sushi-list-item-wrapper"
                    draggable
                    onDragStart={() => {
                      dragIndexRef.current = index;
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                    }}
                    onDrop={() => {
                      if (dragIndexRef.current !== null) {
                        reorderSushiList(dragIndexRef.current, index);
                        dragIndexRef.current = null;
                      }
                    }}
                  >
                    <SushiCard
                      id={sushi.id}
                      title={sushi.title}
                      content={sushi.content}
                      category={sushi.categoryId ?? 0}
                      sushiType={sushi.sushiTypeId ?? 0}
                      remainingAnswers={sushi.remainingAnswers}
                      maxAnswers={sushi.maxAnswers}
                      isClosed={sushi.isClosed}
                      expirationTime={sushi.expireTime}
                      onClick={handleCardClick}
                      onDelete={handleDeleteSushi}
                    />
                  </li>
                ))}
              </ul>
              {loadingMore && (
                <div className="my-sushi-list-loading">더 불러오는 중...</div>
              )}
            </>
          ) : (
            <div className="my-sushi-list-no-result">
              {searchTerm ? '검색 결과가 없습니다.' : '등록된 고민이 없습니다.'}
            </div>
          )}
        </div>

        {/* 최상단 스크롤 버튼 */}
        <button onClick={handleScrollToTop} className="my-sushi-list-scroll-top">
          <img
            src={directionIcon}
            alt="위로 가기"
            className="my-sushi-list-scroll-icon"
          />
        </button>
      </div>

      {/* 상세 조회 모달 */}
      <MySushiDetailModal 
        isOpen={isModalOpen}
        onClose={closeModal}
        sushiId={selectedSushiId}
      />
    </>
  );
};

export default MySushiList;
