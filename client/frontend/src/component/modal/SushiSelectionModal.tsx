import React from 'react';
import { useMySushiList } from '../../hooks/useMySushiList';
import SushiCard from '../SushiCard';
import '../../styles/MySushiList.css';
import '../../styles/SushiSelectionModal.css';

interface SushiSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (sushi: { id: number; title: string; content: string }) => void;
}

const SushiSelectionModal: React.FC<SushiSelectionModalProps> = ({ isOpen, onClose, onSelect }) => {
    const {
        sushiList,
        loading,
        searchTerm,
        setSearchTerm,
        scrollRef,
        fetchSushi,
    } = useMySushiList();

    if (!isOpen) return null;

    return (
        <div className="my-sushi-modal-overlay">
            <div className="my-sushi-modal selection-modal">
                <div className="my-sushi-modal-header">
                    <div className="my-sushi-modal-header-spacer"></div>
                    <h3 className="my-sushi-modal-title">공유할 고민 선택</h3>
                    {/* <button className="my-sushi-modal-close" onClick={onClose}>X</button> */}
                </div>

                <div className="my-sushi-list-search-container">
                    <div className="my-sushi-list-input-wrapper">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="고민을 검색해 보세요"
                            className="my-sushi-list-search-input"
                        />
                        <span className="my-sushi-list-search-icon" onClick={() => fetchSushi(1, false)}>
                            🔍
                        </span>
                    </div>
                </div>

                <div
                    ref={scrollRef}
                    className="selection-modal-content"
                >
                    {loading ? (
                        <div className="my-sushi-list-loading">로딩 중...</div>
                    ) : sushiList.length > 0 ? (
                        <ul className="selection-sushi-list">
                            {sushiList.map((sushi) => (
                                <li key={sushi.id} className="selection-sushi-item">
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
                                        onClick={() => onSelect({ id: sushi.id, title: sushi.title, content: sushi.content })}
                                    />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="my-sushi-list-no-result">
                            {searchTerm ? '검색 결과가 없습니다.' : '등록된 고민이 없습니다.'}
                        </div>
                    )}
                </div>

                <div className="selection-modal-footer">
                    <button
                        onClick={onClose}
                        className="selection-modal-close-btn"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SushiSelectionModal;
