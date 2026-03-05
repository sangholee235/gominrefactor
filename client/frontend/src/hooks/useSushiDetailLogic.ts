import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchMySushiDetail } from '../api/mySushiApi';
import type { MySushiDetail } from '../types/mySushi';

export const useSushiDetailLogic = () => {
  const { sushiId } = useParams<{ sushiId: string }>();
  const navigate = useNavigate();
  const [sushi, setSushi] = useState<MySushiDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sushiId) {
      navigate('/home');
      return;
    }

    const loadSushiDetail = async () => {
      try {
        setLoading(true);
        const data = await fetchMySushiDetail(Number(sushiId));
        setSushi(data);
      } catch (err: any) {
        setError(err.message || '고민 정보를 불러오는 데 실패했습니다.');
        console.error(err);
        
        // 남의 초밥 접근 시 alert 표시 및 뒤로 가기
        if (err.response?.status === 403 || err.response?.status === 404) {
          alert('접근할 수 없는 초밥입니다!');
          navigate(-1);
        }
      } finally {
        setLoading(false);
      }
    };

    loadSushiDetail();
  }, [sushiId, navigate]);

  const handleGoBack = () => {
    navigate(-1);
  };

  return {
    sushi,
    loading,
    error,
    handleGoBack
  };
};
