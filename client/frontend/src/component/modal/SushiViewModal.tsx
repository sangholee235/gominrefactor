import React from 'react';
import { useFetchRailSushiDetail } from '../../hooks/useSushi';
import '../../styles/SushiViewModal.css';

interface SushiViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    sushiId: number | null;
}

const SushiViewModal: React.FC<SushiViewModalProps> = ({ isOpen, onClose, sushiId }) => {
    const { data: sushi, isLoading, error } = useFetchRailSushiDetail(sushiId, isOpen && sushiId !== null);

    if (!isOpen) return null;

    return (
        <div className="sushi-view-modal-overlay" onClick={onClose}>
            <div className="sushi-view-modal" onClick={(e) => e.stopPropagation()}>
                <div className="sushi-view-modal-container">
                    <div className="sushi-view-modal-header">
                        <div className="sushi-view-modal-header-spacer"></div>
                        <h3 className="sushi-view-modal-title">{sushi ? sushi.title : '고민 상세보기'}</h3>
                        <button className="sushi-view-modal-close" onClick={onClose}>X</button>
                    </div>

                    <div className="sushi-view-content-wrapper">
                        {isLoading && (
                            <div className="loading-text">로딩 중...</div>
                        )}

                        {error && (
                            <div className="error-text">고민 정보를 불러오는데 실패했습니다.</div>
                        )}

                        {sushi && (
                            <div className="sushi-view-text-section">
                                <div className="sushi-view-text-content">
                                    {sushi.content}
                                </div>
                                <div className="sushi-view-text-footer">
                                    <small className="sushi-view-date">
                                        작성일: {sushi.createdAt ? new Date(sushi.createdAt).toLocaleDateString('ko-KR') : '날짜 정보 없음'}
                                    </small>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SushiViewModal;