import { useState, useEffect } from 'react';
import { fetchMySushiDetail } from '../api/mySushiApi';
import type { MySushiDetail, AnswerDetail } from '../types/mySushi';
// Post-it images import
import postIt1 from '../assets/postIt/postIt1.webp';
import postIt2 from '../assets/postIt/postIt2.webp';
import postIt3 from '../assets/postIt/postIt3.webp';
import postIt4 from '../assets/postIt/postIt4.webp';
import postIt5 from '../assets/postIt/postIt5.webp';

// Post-it images array
export const postItImages = [postIt1, postIt2, postIt3, postIt4, postIt5];

export const useMySushiDetail = (isOpen: boolean, sushiId: number | null) => {
  const [sushi, setSushi] = useState<MySushiDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<{ data: AnswerDetail, image: string } | null>(null);

  useEffect(() => {
    if (isOpen && sushiId) {
      const getSushiDetail = async () => {
        try {
          setLoading(true);
          setError(null);
          const data = await fetchMySushiDetail(sushiId);
          setSushi(data);
        } catch (err: any) {
          setError(err.message || '고민 정보를 불러오는 데 실패했습니다.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      getSushiDetail();
    } else {
        // 모달 닫힐 때 상태 초기화
        setSushi(null);
        setSelectedAnswer(null);
    }
  }, [isOpen, sushiId]);

  return {
    sushi,
    loading,
    error,
    selectedAnswer,
    setSelectedAnswer,
  };
};
