import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSaveAnswer } from "./hooks/useAnswer";
import bgImg from "./assets/home/back.webp";
import deskImg from "./assets/home/rail.webp";
import masterImg from "./assets/home/master.webp";
import bellImg from "./assets/home/bell.webp";
import Rail from "./component/Rail";
import SushiView from "./component/SushiView";
import PostSushiModal from "./component/modal/PostSushiModal";
import NotificationModal from "./component/modal/NotificationModal";
import NotificationBell from "./component/NotificationBell";
import "./styles/Home.css";
import { useNotifications } from "./hooks/useNotification";

import type { SushiClickPayload } from "./types/sushi";

const Home = () => {
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isSushiViewOpen, setIsSushiViewOpen] = useState(false);
  const [isNotiModalOpen, setIsNotiModalOpen] = useState(false);
  const { hasUnread } = useNotifications();
  const [selectedSushi, setSelectedSushi] = useState<{
    sushiId: number;
    title: string;
    content: string;
    category: number;
  } | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  const { mutate: saveAnswer } = useSaveAnswer(selectedSushi?.sushiId ?? 0);

  // URL 쿼리 파라미터 감지하여 모달 열기
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sushiId = params.get("sushiId");
    const category = params.get("category");

    if (sushiId && category) {
      setSelectedSushi({
        sushiId: Number(sushiId),
        title: `초밥 #${sushiId}`, // SushiView 내부에서 상세 정보를 다시 조회하므로 임시 제목
        content: "",
        category: Number(category),
      });
      setIsSushiViewOpen(true);
    }
  }, [location.search]);

  const handleSushiViewClose = () => {
    setIsSushiViewOpen(false);
    // 모달 닫을 때 쿼리 파라미터 제거
    const params = new URLSearchParams(location.search);
    if (params.has("sushiId")) {
      navigate("/home", { replace: true });
    }
  };

  const handleSushiClick = (payload: SushiClickPayload) => {
    // ✅ undefined 방어 (타입 에러 + 런타임 방지)
    if (
      payload.sushiId == null ||
      payload.category == null ||
      payload.sushiType == null
    ) {
      return;
    }

    setSelectedSushi({
      sushiId: payload.sushiId,
      title: `초밥 #${payload.sushiId}`,
      content: "",
      category: payload.category,
    });

    setIsSushiViewOpen(true);
  };

  const handleAnswerSubmit = (content: string) => {
    if (!selectedSushi?.sushiId) return;

    saveAnswer(
      { content },
      {
        onSuccess: () => {
          handleSushiViewClose(); // 닫기 핸들러 사용
          alert("답변이 작성되었습니다.");
        },
        onError: (error) => {
          alert(`답변 작성 실패: ${error.message}`);
        },
      },
    );
  };

  return (
    <>
      <div className="home-background-container">
        <div
          className="home-background-layer"
          style={{
            zIndex: 2,
            position: "absolute",
            backgroundImage: `url("${bgImg}")`,
            transform: "translateY(7%)",
          }}
        />
        <div
          className="home-background-layer"
          style={{
            backgroundImage: `url("${bgImg}")`,
            zIndex: 1,
            transform: "translateY(7%)",
          }}
        />
        <div
          className="home-background-layer"
          style={{
            backgroundImage: `url("${masterImg}")`,
            zIndex: 2,
            transform: "scale(1.2)",
          }}
        />

        <div className="home-desk-container">
          <img src={deskImg} alt="Desk" className="home-desk-image" />
          <div className="home-rail">
            {/* ✅ 타입 에러 여기서 더 이상 안 남 */}
            <Rail onSushiClick={handleSushiClick} />
          </div>
          <div className="home-bell">
            <div
              className="home-post-bell"
              onClick={() => setIsPostModalOpen(true)}
            >
              <img
                src={bellImg}
                alt="Post Sushi Bell"
                className="home-post-bell-image"
              />
            </div>
          </div>
        </div>

        {/* 채팅창 입장 플로팅 말풍선 버튼 */}
        <div
          className="home-chat-speech-bubble-button"
          onClick={() => navigate("/chat")}
        >
          채팅창 입장
          <div className="home-chat-speech-bubble-tail"></div>
        </div>
      </div>

      {/* 알림 벨 전용 레이어 (overflow hidden 영향 안 받음) */}
      <div className="home-alarm-layer">
        <div className="home-alarm">
          <NotificationBell
            onClick={() => setIsNotiModalOpen(true)}
            hasUnread={hasUnread}
          />
        </div>
      </div>

      <PostSushiModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
      />

      <SushiView
        isOpen={isSushiViewOpen}
        onClose={handleSushiViewClose}
        sushi={selectedSushi}
        onSubmit={handleAnswerSubmit}
      />

      <NotificationModal
        isOpen={isNotiModalOpen}
        onClose={() => setIsNotiModalOpen(false)}
      />
    </>
  );
};

export default Home;
