import React from "react";
import { useNavigate } from "react-router-dom";
import Sushi from "./Sushi";

type SushiAnswerCardProps = {
  id: number;
  title: string;
  category: number;
  content: string;
  sushiType: number;
  showHeart?: boolean;
  onClick?: (id: number) => void;
  onDelete?: (id: number) => void; // 삭제 프롭스 추가
};

const SushiAnswerCard = ({
  id,
  title,
  category,
  content,
  sushiType,
  showHeart = false,
  onClick,
  onDelete, // 삭제 함수 받아옴
}: SushiAnswerCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!id) {
      alert("초밥 데이터가 존재하지 않습니다.");
      return;
    }
    
    if (onClick) {
      onClick(id);
    } else {
      navigate(`/sushi/${id}`);
    }
  };

  // 삭제 버튼 클릭 이벤트 및 window.confirm 모달
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 카드 클릭(이동) 이벤트 방지
    
    if (onDelete && id) {
      const isConfirmed = window.confirm(
        "정말 이 답변을 삭제하시겠습니까?\n삭제하면 다시 복구할 수 없습니다."
      );
      
      if (isConfirmed) {
        onDelete(id);
      }
    }
  };

  return (
    <div style={outerContainerStyle} onClick={handleClick}>
      <div style={middleContainerStyle}>
        <div style={innerContainerStyle}>
          {showHeart && <span style={heartIconStyle}>❤️</span>}
          
          {/* 삭제 버튼: onDelete 프롭이 있을 때만 렌더링 */}
          {onDelete && (
            <button 
              style={deleteButtonStyle} 
              onClick={handleDeleteClick}
              title="답변 삭제"
            >
              🗑️
            </button>
          )}

          <div style={sushiOuterImageStyle}>
            <div style={sushiImageStyle}>
              <Sushi
                sushiId={id}
                category={category}
                sushiType={sushiType}
                // 아래 두 값은 카드에서는 크게 중요하지 않으므로 기본값 처리
                remainingAnswers={0}
                expirationTime=""
                // 클릭 이벤트는 상위 div에서 처리하므로 빈 함수 전달
                onSushiClick={() => {}}
              />
            </div>
          </div>

          <div style={textContainerStyle}>
            <div style={titleStyle}>{title}</div>
            <hr style={dividerStyle} />
            <div style={contentStyle}>{content}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Styles ---

const heartIconStyle: React.CSSProperties = {
  position: "absolute",
  top: `calc(1 * var(--custom-vh))`,
  right: `calc(1 * var(--custom-vh))`,
  fontSize: `calc(2.7 * var(--custom-vh))`,
  zIndex: 10,
};

const outerContainerStyle: React.CSSProperties = {
  position: "relative",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: `calc(49 * var(--custom-vh))`,
  margin: `calc(0.5 * var(--custom-vh)) auto`,
  padding: `calc(0.8 * var(--custom-vh))`,
  backgroundColor: "#906C48",
  borderRadius: `calc(1.3 * var(--custom-vh))`,
  boxSizing: "border-box",
  cursor: "pointer",
};

const middleContainerStyle: React.CSSProperties = {
  width: `calc(47.5 * var(--custom-vh))`,
  backgroundColor: "#B2975C",
  borderRadius: `calc(0.8 * var(--custom-vh))`,
  padding: `calc(1.1 * var(--custom-vh))`,
  boxSizing: "border-box",
};

const innerContainerStyle: React.CSSProperties = {
  position: "relative",
  width: `calc(45.3 * var(--custom-vh))`,
  backgroundColor: "#FFFFF0",
  borderRadius: `calc(0.6 * var(--custom-vh))`,
  padding: "0px",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
};

/**스시 이미지 감싸는 테두리 */
const sushiOuterImageStyle: React.CSSProperties = {
  width: `calc(15 * var(--custom-vh))`,
  height: `calc(15 * var(--custom-vh))`,
  overflow: "hidden",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  borderRadius: `calc(2 * var(--custom-vh))`,
  position: "relative",
  backgroundColor: "#FFFFF0",
};

/**스시 사진 크기 조절 */
const sushiImageStyle: React.CSSProperties = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%) scale(0.8)",
  width: "100%",
  height: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const textContainerStyle: React.CSSProperties = {
  flex: 1,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  marginLeft: `calc(1.5 * var(--custom-vh))`,
};

const titleStyle: React.CSSProperties = {
  width: `calc(20 * var(--custom-vh))`,
  fontSize: `calc(3 * var(--custom-vh))`,
  fontWeight: "bold",
  color: "#5A4628",
  margin: `calc(0.5 * var(--custom-vh)) 0 0 0`,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const contentStyle: React.CSSProperties = {
  width: `calc(23 * var(--custom-vh))`,
  fontSize: `calc(2.5 * var(--custom-vh))`,
  color: "#8D7B7B",
  lineHeight: "1.4",
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

const dividerStyle: React.CSSProperties = {
  width: `calc(24 * var(--custom-vh))`,
  border: `calc(0.05 * var(--custom-vh)) solid #BCBCBC`,
  margin: `calc(1 * var(--custom-vh)) 0`,
};

const deleteButtonStyle: React.CSSProperties = {
  position: "absolute",
  top: `calc(0.8 * var(--custom-vh))`,
  right: `calc(0.8 * var(--custom-vh))`,
  fontSize: `calc(1.3 * var(--custom-vh))`,
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: `calc(0.2 * var(--custom-vh))`,
  borderRadius: "50%",
  backgroundColor: "rgba(255, 0, 0, 0.8)",
  width: `calc(2.5 * var(--custom-vh))`,
  height: `calc(2.5 * var(--custom-vh))`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 2,
};

export default SushiAnswerCard;
