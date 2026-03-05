import { useState, useEffect } from 'react';
import { fetchRailSushiDetail } from '../api/sushiApi';
import { updateAnswer, deleteAnswer } from '../api/answerApi'; // 이미 만드신 API 함수만 가져옵니다.

interface SushiDetail {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  category: {
      id: number;
      name: string;
  } | null;
}

export const useMyAnswerDetail = (isOpen: boolean, sushiId: number | null) => {
  const [sushi, setSushi] = useState<SushiDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAnswerDetail, setShowAnswerDetail] = useState(false);

  // 로딩 상태 관리를 위해 추가
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (isOpen && sushiId) {
      const getSushiDetail = async () => {
        try {
          setLoading(true);
          setError(null);
          const data = await fetchRailSushiDetail(sushiId);
          
          setSushi({
            id: data.id ?? 0,
            title: data.title ?? "",
            content: data.content ?? "",
            createdAt: data.createdAt ?? "",
            category: typeof data.categoryId === "number" ? { id: data.categoryId, name: "" } : null,
          });
        } catch (err: any) {
          setError(err.message || '고민 정보를 불러오는 데 실패했습니다.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      getSushiDetail();
    } else {
        setSushi(null);
        setShowAnswerDetail(false);
    }
  }, [isOpen, sushiId]);

  /** * 답변 수정 핸들러
   * 이미 만드신 updateAnswer를 그대로 사용합니다.
   */
  const handleUpdate = async (answerId: number, content: string) => {
    try {
      setIsUpdating(true);
      const result = await updateAnswer(answerId, content);
      alert("성공적으로 수정되었습니다.");
      return result;
    } catch (err: any) {
      alert(err.message || "수정 중 오류가 발생했습니다.");
    } finally {
      setIsUpdating(false);
    }
  };

  /** * 답변 삭제 핸들러 
   */
  const handleDelete = async (answerId: number) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deleteAnswer(answerId);
      alert("삭제되었습니다.");
      // 삭제 후 로직 (예: 모달 닫기 등)
    } catch (err: any) {
      alert(err.message || "삭제 중 오류가 발생했습니다.");
    }
  };

  return {
    sushi,
    loading,
    error,
    showAnswerDetail,
    setShowAnswerDetail,
    updateAnswer: handleUpdate, // 컴포넌트에서 호출할 이름
    deleteAnswer: handleDelete,
    isUpdating
  };
};