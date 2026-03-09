import introfImg from "../assets/introf.webp";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [devUserId, setDevUserId] = useState("");
  const navigate = useNavigate();

  const styles: Record<string, React.CSSProperties> = {
    backgroundContainer: {
      position: "relative",
      height: `calc(200 * var(--custom-vh))`,
      width: "100%",
      overflow: "hidden",
    },
    backgroundLayer: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: `calc(105 * var(--custom-vh))`,
      transform: "scale(1.1)",
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
    },
    buttoncontainer: {
      position: "absolute",
      height: `calc(6 * var(--custom-vh))`,
      zIndex: 2,
      color: "#fff",
      right: `calc(8 * var(--custom-vh))`,
      bottom: `calc(35 * var(--custom-vh))`,
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    devInput: {
      padding: "8px 12px",
      border: "1px solid #ccc",
      borderRadius: "5px",
      backgroundColor: "white",
      color: "#333",
      width: "60px",
    },
    devButton: {
      padding: "8px 12px",
      backgroundColor: "#4CAF50",
      color: "white",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      fontWeight: "bold",
    }
  };

  const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID;
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
  const KAKAO_REDIRECT_URI = `${API_BASE_URL}/auth/kakao/callback`;

  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URI}`;
  const DEMO_MODE =
    (import.meta as any).env?.VITE_DISABLE_AUTH === "true" ||
    (import.meta as any).env?.VITE_DEMO_MODE === "true";
  const loginHref = DEMO_MODE ? undefined : kakaoAuthUrl;

  const handleDemoLogin = () => {
    const inputId = window.prompt("테스트할 유저 ID를 입력하세요", "1");
    if (inputId && !isNaN(Number(inputId))) {
      localStorage.setItem("devUserId", inputId.trim());
      localStorage.setItem("userToken", "dev");
      navigate("/home");
    } else if (inputId !== null) {
      alert("유효한 숫자 ID를 입력해주세요");
    }
  };

  const handleKakaoLogin = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (DEMO_MODE) {
      e.preventDefault();
      handleDemoLogin();
    }
  };

  return (
    <div style={styles.backgroundContainer}>
      <div
        style={{
          ...styles.backgroundLayer,
          backgroundImage: `url(${introfImg})`,
        }}
      />
      <div style={styles.buttoncontainer}>
        <a
          href={kakaoAuthUrl}
          onClick={handleKakaoLogin}
          style={{
            display: "inline-block",
            padding: "10px 15px",
            backgroundColor: "#FEE500",
            color: "#391B1B",
            textDecoration: "none",
            borderRadius: "5px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          카카오로 로그인하기
        </a>
      </div>
    </div>
  );
};

export default Login;
