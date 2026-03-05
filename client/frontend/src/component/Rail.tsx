import { useMemo } from "react";
import "../styles/Home.css";
import Sushi from "./Sushi";
import { useFetchRandomSushiRail } from "../hooks/useSushi";
import type { SushiItem } from "../types/sushi";
import type { SushiClickPayload } from "../types/sushi";

type RailProps = {
  onSushiClick?: (payload: SushiClickPayload) => void;
};

const Rail = ({ onSushiClick }: RailProps) => {
  const {
    data: sushiList = [],
    isLoading,
    error,
  } = useFetchRandomSushiRail(15);

  // API 데이터를 SushiItem 형식으로 변환하고 delay 추가
  const sushiWithDelay: SushiItem[] = useMemo(() => {
    return sushiList.map((sushi, index) => ({
      sushiId: sushi.sushiId,
      category: sushi.category,
      sushiType: sushi.sushiType,
      remainingAnswers: sushi.remainingAnswers ?? 0,
      expirationTime: sushi.expirationTime,
      delay: index * 3,
    }));
  }, [sushiList]);

  const handleSushiClick = (payload: SushiClickPayload) => {
    onSushiClick?.(payload);
  };


  // 로딩 중 또는 에러 발생 시
  if (isLoading) {
    return (
      <div className="home-rail-container">
        <div style={{ textAlign: "center", padding: "20px", color: "#999" }}>
          초밥을 준비 중입니다...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-rail-container">
        <div style={{ textAlign: "center", padding: "20px", color: "#ff0000" }}>
          데이터 로드 실패
        </div>
      </div>
    );
  }

  return (
    <div
      className="home-rail-container"
      style={{
        position: "relative",
        overflow: "hidden",
      }}
    >
      {sushiWithDelay.map((item, index) => (
        <div
          key={`${item.sushiId}-${index}`}
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            transform: "translateY(-50%)",
          }}
        >
          <div
            style={{
              animation: "rail-sushi-slide 12s linear infinite",
              animationDelay: `${item.delay}s`,
              willChange: "transform",
            }}
          >
            <Sushi
              sushiId={item.sushiId}
              category={item.category}
              sushiType={item.sushiType}
              remainingAnswers={item.remainingAnswers}
              expirationTime={item.expirationTime}
              onSushiClick={handleSushiClick}
            />
          </div>
        </div>
      ))}
      <style>{`
        @keyframes rail-sushi-slide {
          0% {
            transform: translateX(-600px);
          }
          100% {
            transform: translateX(calc(100% + 1200px));
          }
        }
      `}</style>
    </div>
  );
};

export default Rail;
