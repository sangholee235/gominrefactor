import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSushiByShareToken } from "../api/shareApi";
import type { Sushi } from "../types/api";
import { useAuth } from "../context/AuthContext";

export const useShareSushi = () => {
  const { token } = useParams<{ token: string }>();
  const [sushi, setSushi] = useState<Sushi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;

    const fetchSushi = async () => {
      try {
        setLoading(true);
        const data = await getSushiByShareToken(token);
        setSushi(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSushi();
  }, [token]);

  const handleAnswerClick = () => {
    if (!user) {
      sessionStorage.setItem("redirectUrl", `/share/${token}`);
      alert("로그인이 필요합니다.");
      navigate("/login");
    } else {
      if (sushi) {
        navigate(`/home?sushiId=${sushi.id}&category=${sushi.category || 6}`);
      }
    }
  };

  const handleClose = () => {
    navigate('/home');
  };

  return {
    sushi,
    loading,
    error,
    handleAnswerClick,
    handleClose
  };
};
