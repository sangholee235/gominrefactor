import React from 'react';
import '../../styles/MySushiDetailModal.css';

interface AnswerDetail {
  id: number;
  content: string;
  createdAt: string;
}

interface PostItAnswerViewProps {
  title: string;
  answer: AnswerDetail;
  onBack: () => void;
  onEdit?: () => void;
}

const PostItAnswerView: React.FC<PostItAnswerViewProps> = ({ title, answer, onBack, onEdit }) => {
  return (
    <div className="postit-answer-view-container">
      <div className="my-sushi-modal-header">
        <button 
          onClick={onBack}
          className="postit-answer-back-btn"
        >
          &lt;
        </button>
        
        <h3 
            className="my-sushi-modal-title"
            style={{ boxShadow: 'none' }}
        >
            {title}
        </h3>
        
        <div className="postit-answer-header-spacer"></div>
      </div>

      <div className="my-sushi-content-wrapper">
        <div className="my-sushi-text-section full-height">
            <div className="my-sushi-text-scroll">
              <p className="my-sushi-text">{answer.content}</p>
            </div>
            <div className="my-sushi-text-footer">
              {onEdit && (
                <button 
                  onClick={onEdit}
                  className="my-sushi-edit-text-btn"
                >
                  수정
                </button>
              )}
              <small className="my-sushi-date align-right">
                작성일: {new Date(answer.createdAt).toLocaleDateString()}
              </small>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PostItAnswerView;
