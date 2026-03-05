import introfImg from "../assets/introf.webp";

const Login = () => {
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
    },
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

  const handleDemoLogin = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (DEMO_MODE) {
      e.preventDefault();
      const inputId = window.prompt("테스트할 유저 ID를 입력하세요", "2");
      if (inputId && !isNaN(Number(inputId))) {
        localStorage.setItem("devUserId", inputId.trim());
        localStorage.setItem("userToken", "dummy-demo-token"); // 우회용 토큰
        window.location.href = "/home";
      }
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
          href={loginHref}
          onClick={DEMO_MODE ? handleDemoLogin : undefined}
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
