import { useState, useEffect, useRef } from "react";
import { useFetchRailSushiDetail } from "./useSushi";

type SushiData = {
  sushiId?: number;
  title?: string;
  content?: string;
  category?: number;
};

type UseSushiViewLogicProps = {
  isOpen: boolean;
  onClose: () => void;
  sushi?: SushiData | null;
  onSubmit?: (content: string) => void;
};

const titleShadowColors: Record<number, string> = {
  1: "rgba(255, 0, 0, 0.4)",
  2: "rgba(255, 255, 0, 0.4)",
  3: "rgba(83, 178, 0, 0.4)",
  4: "rgba(0, 179, 255, 0.4)",
  5: "rgba(183, 6, 227, 0.4)",
  6: "rgba(157, 157, 157, 0.4)",
};

const fallbackContent =
  "갑자기 불안해질 때가 있어요.\n" +
  "괜히 작은 말에도 상처받고 하루가 무너지는 느낌이 들 때가 있는데,\n" +
  "이럴 때 마음을 회복하는 나만의 방법이 있을까요?";

export const useSushiViewLogic = ({
  isOpen,
  onClose,
  sushi,
  onSubmit,
}: UseSushiViewLogicProps) => {
  const [content, setContent] = useState("");
  const [showAnswerInput, setShowAnswerInput] = useState(false);
  const [showTopFade, setShowTopFade] = useState(false);
  const [showBottomFade, setShowBottomFade] = useState(true);
  const [opacity, setOpacity] = useState(0);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const { data: detail } = useFetchRailSushiDetail(
    sushi?.sushiId ?? null,
    isOpen && !!sushi?.sushiId,
  );

  // 애니메이션 (등장)
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setOpacity(0);
    const timer = window.setTimeout(() => setOpacity(1), 50);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  // 모달 닫힐 때 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      setShowAnswerInput(false);
      setContent("");
    }
  }, [isOpen]);

  const displayContent =
    sushi?.content?.trim() || detail?.content?.trim() || fallbackContent;

  const handleScroll = () => {
    if (!contentRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
    const isScrollable = scrollHeight > clientHeight;
    if (isScrollable) {
      setShowTopFade(scrollTop > 10);
      setShowBottomFade(scrollTop < scrollHeight - clientHeight - 10);
    } else {
      setShowTopFade(false);
      setShowBottomFade(false);
    }
  };

  // 컨텐츠가 변경되거나 모달이 열릴 때 스크롤 상태 체크
  useEffect(() => {
    handleScroll();
  }, [displayContent, isOpen]);

  const handleClose = () => {
    setOpacity(0);
    window.setTimeout(() => {
      setShowAnswerInput(false);
      setContent("");
      onClose();
    }, 300);
  };

  const handleBack = () => {
    if (showAnswerInput) {
      setShowAnswerInput(false);
      return;
    }
    handleClose();
  };

  const handleSubmit = () => {
    if (!content.trim()) {
      return;
    }
    onSubmit?.(content.trim());
    setShowAnswerInput(false);
    setContent("");
  };

  const titleShadowColor =
    ((detail?.category ?? sushi?.category) &&
      titleShadowColors[detail?.category ?? (sushi?.category as number)]) ||
    "rgba(255, 255, 255, 0.4)";

  return {
    detail,
    content,
    setContent,
    showAnswerInput,
    setShowAnswerInput,
    showTopFade,
    showBottomFade,
    opacity,
    contentRef,
    handleScroll,
    handleClose,
    handleBack,
    handleSubmit,
    displayContent,
    titleShadowColor,
  };
};
