import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const accessToken = params.get('accessToken');
    const userStr = params.get('user');

    if (accessToken && userStr) {
      try {
        const user = JSON.parse(userStr);
        // AuthContext를 통해 로그인 상태를 업데이트합니다.
        login({ accessToken, user });
        
        // 로그인 전 보던 페이지가 있다면 그곳으로 이동, 없으면 홈으로 이동
        const redirectUrl = sessionStorage.getItem('redirectUrl');
        if (redirectUrl) {
          sessionStorage.removeItem('redirectUrl');
          navigate(redirectUrl);
        } else {
          navigate('/home');
        }
      } catch (error) {
        console.error('사용자 정보 파싱 중 오류 발생:', error);
        alert('로그인 처리에 실패했습니다. 다시 시도해주세요.');
        navigate('/login');
      }
    } else {
      // 토큰 또는 사용자 정보가 없는 경우
      alert('로그인에 필요한 정보가 없습니다.');
      navigate('/login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 이 useEffect는 컴포넌트 마운트 시 한 번만 실행되어야 합니다.

  return (
    <div>
      <p>로그인 정보를 처리 중입니다. 잠시만 기다려주세요...</p>
    </div>
  );
};

export default AuthCallback;
