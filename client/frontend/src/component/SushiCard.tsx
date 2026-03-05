import React, { useState, useEffect, memo } from "react";
import Sushi from "./Sushi";

interface SushiCardProps {
  id: number;
  title: string;
  content: string;
  category: number;
  sushiType: number;
  showHeart?: boolean;
  remainingAnswers: number;
  maxAnswers: number;
  isClosed: boolean;
  expirationTime: string;
  onClick: (id: number) => void;
  onDelete?: (id: number) => void;
}

const SushiCardComponent = ({
  id,
  title,
  content,
  category = 1,
  sushiType = 1,
  showHeart = false,
  remainingAnswers,
  maxAnswers,
  isClosed,
  expirationTime,
  onClick,
  onDelete,
}: SushiCardProps) => {
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    const expirationDate = new Date(expirationTime).getTime();
    const currentTime = new Date().getTime();
    const initialTimeLeft = expirationDate - currentTime;
    
    if (initialTimeLeft <= 0) {
      setRemainingTime(0);
      return;
    }
    
    setRemainingTime(Math.floor(initialTimeLeft / 1000));

    // 시간 업데이트 로직 (성능 최적화 포함)
    const intervalId = setInterval(() => {
      const now = new Date().getTime();
      const timeLeft = expirationDate - now;

      if (timeLeft <= 0) {
        clearInterval(intervalId);
        setRemainingTime(0);
      } else {
        setRemainingTime(Math.floor(timeLeft / 1000));
      }
    }, initialTimeLeft > 60000 ? 60000 : 1000);

    return () => clearInterval(intervalId);
  }, [expirationTime]);

  const handleClick = () => {
    if (!id) return;
    onClick(id);
  };

  /** [추가] 삭제 핸들러: 확인 및 완료 알림 포함 */
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 카드 클릭(상세보기) 이벤트 전파 방지
    
    if (onDelete && id) {
      // 1. 삭제 확인 창
      const isConfirmed = window.confirm(
        "정말 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다."
      );
      
      if (isConfirmed) {
        onDelete(id);
        // 2. 삭제 완료 창 (onDelete가 비동기인 경우 부모에서 띄우는 것이 더 정확하지만, 요청에 따라 여기서 처리)
        window.alert("정상적으로 삭제되었습니다.");
      }
    }
  };

  return (
    <div style={outerContainerStyle} onClick={handleClick}>
      <div style={middleContainerStyle}>
        <div style={innerContainerStyle}>
          {showHeart && <span style={heartIconStyle}>❤️</span>}
          
          {/* 삭제 버튼 */}
          {onDelete && (
            <button 
              style={deleteButtonStyle}
              onClick={handleDeleteClick}
              title="스시 삭제"
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
                onSushiClick={() => {}} 
              />
            </div>
            {!isClosed ? (
              <>
                <div style={remainingAnswersStyle}>
                  {maxAnswers - remainingAnswers}/{maxAnswers}
                </div>
                {remainingTime <= 10800 && remainingTime > 0 && (
                  <div style={remainingTimeStyle}>마감 임박!</div>
                )}
              </>
            ) : (
              <>
                <div style={remainingAnswersStyle}>
                  {maxAnswers - remainingAnswers}
                </div>
                <div style={soldoutStyle}>SOLD OUT</div>
              </>
            )}
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

// --- 스타일 정의 (기본값 유지) ---

const heartIconStyle: React.CSSProperties = {
  position: "absolute",
  top: `calc(0.8 * var(--custom-vh))`,
  right: `calc(0.8 * var(--custom-vh))`,
  fontSize: `calc(1.3 * var(--custom-vh))`,
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
  WebkitLineClamp: 1,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
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

const dividerStyle: React.CSSProperties = {
  width: `calc(24 * var(--custom-vh))`,
  border: "0.5px solid #BCBCBC",
  margin: `calc(1 * var(--custom-vh)) 0`,
};

const remainingAnswersStyle: React.CSSProperties = {
  position: "relative",
  textAlign: "right",
  bottom: 0,
  color: "#f0f0f0",
  marginTop: `calc(5.8 * var(--custom-vh))`,
  marginLeft: `calc(10 * var(--custom-vh))`,
  padding: `0 calc(1 * var(--custom-vh))`,
  height: `calc(3 * var(--custom-vh))`,
  minWidth: `calc(1 * var(--custom-vh))`,
  width: "auto",
  border: "none",
  borderRadius: `calc(1 * var(--custom-vh))`,
  fontSize: `calc(2.2 * var(--custom-vh))`,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#E86100",
};

const remainingTimeStyle: React.CSSProperties = {
  position: "absolute",
  top: `calc(1.7 * var(--custom-vh))`,
  left: `calc(1.3 * var(--custom-vh))`,
  backgroundColor: "#454545",
  fontSize: `calc(2 * var(--custom-vh))`,
  border: "none",
  borderRadius: `calc(0.5 * var(--custom-vh))`,
  width: "auto",
  height: `calc(3 * var(--custom-vh))`,
  color: "#f0f0f0",
  marginTop: `calc(0.8 * var(--custom-vh))`,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: `0 calc(1 * var(--custom-vh))`,
  transform: "rotate(-25deg)",
};

const soldoutStyle: React.CSSProperties = {
  position: "absolute",
  top: `calc(4 * var(--custom-vh))`,
  left: `calc(1.5 * var(--custom-vh))`,
  fontWeight: "bold",
  fontSize: `calc(2 * var(--custom-vh))`,
  textShadow: `
    calc(0.3 * var(--custom-vh)) calc(0.3 * var(--custom-vh)) calc(0.6 * var(--custom-vh)) rgb(255, 255, 255),
    calc(-0.3 * var(--custom-vh)) calc(-0.3 * var(--custom-vh)) calc(0.6 * var(--custom-vh)) rgb(255, 255, 255)
  `,
  border: `calc(0.5 * var(--custom-vh)) solid #454545`,
  borderRadius: `calc(0.5 * var(--custom-vh))`,
  width: "auto",
  height: `calc(3 * var(--custom-vh))`,
  color: "#454545",
  marginTop: `calc(0.8 * var(--custom-vh))`,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: `0 calc(0.5 * var(--custom-vh))`,
  transform: "rotate(-15deg)",
};

const SushiCard = memo(SushiCardComponent);
export default SushiCard;
