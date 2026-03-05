import { useState, useEffect, useCallback } from "react";
import { useTrail } from "@react-spring/web";
import { fetchMyAnswerList, searchMyAnswers } from "../api/mySushiApi"; // 기존 API
import { deleteAnswer } from "../api/answerApi"; // 삭제 API 추가 (경로 확인 필요)
import type { MyAnswer } from "../types/mySushi";

export const useMyAnswerList = () => {
  const [answerList, setAnswerList] = useState<MyAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<MyAnswer | null>(null);

  // 검색 함수
  const fetchAnswers = useCallback(async () => {
    try {
      let data;
      if (searchTerm && searchTerm.trim()) {
        const result = await searchMyAnswers(searchTerm);
        data = result.answers;
      } else {
        data = await fetchMyAnswerList();
      }
      setAnswerList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  // 1. 초기 데이터 로딩 및 검색어 변경 시 데이터 재로딩
  useEffect(() => {
    setLoading(true);
    fetchAnswers();
  }, [fetchAnswers]);

  // 1-1. 수정 완료 이벤트 수신 시 리스트 재요청
  useEffect(() => {
    const onUpdated = () => {
      fetchAnswers();
    };
    window.addEventListener("myAnswerUpdated", onUpdated);
    return () => window.removeEventListener("myAnswerUpdated", onUpdated);
  }, [fetchAnswers]);

  // 2. 삭제 처리 함수 추가
  const handleDelete = async (answerId: number) => {
    try {
      // API 호출
      await deleteAnswer(answerId);
      
      // 성공 시: 상태값에서 해당 항목 제거 (화면 업데이트)
      setAnswerList((prev) => prev.filter((item) => item.id !== answerId));
      
      // 만약 모달이 열려있는 상태에서 삭제했다면 모달도 닫아줌
      if (selectedAnswer?.id === answerId) {
        closeModal();
      }
      
      alert("답변이 성공적으로 삭제되었습니다.");
    } catch (err: any) {
      console.error("삭제 실패:", err);
      alert(err.message || "삭제 중 오류가 발생했습니다.");
    }
  };

  const handleCardClick = (answer: MyAnswer) => {
    setSelectedAnswer(answer);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAnswer(null);
  };

  const reorderAnswerList = (fromIndex: number, toIndex: number) => {
    setAnswerList(prev => {
      if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= prev.length || toIndex >= prev.length) {
        return prev;
      }
      const next = prev.slice();
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };
  const trail = useTrail(answerList.length, {
    opacity: 1,
    transform: "translateY(0px)",
    from: { opacity: 0, transform: "translateY(50px)" },
    config: { tension: 250, friction: 25 },
  });

  const scrollToTop = () => {
    const container = document.getElementById("my-answer-list-background");
    if (container) {
      container.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // handleDelete를 return에 포함시킴
  return {
    answerList,
    loading,
    searchTerm,
    setSearchTerm,
    isModalOpen,
    selectedAnswer,
    trail,
    handleCardClick,
    handleDelete, // 추가됨
    closeModal,
    scrollToTop,
    reorderAnswerList,
    fetchAnswers
  };
};
