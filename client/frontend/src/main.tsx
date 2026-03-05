import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import App from "./App.tsx";
import AppProvider from "./providers/AppProvider.tsx";

declare global {
  interface Window {
    Kakao: any;
  }
}

// Kakao SDK 초기화
if (window.Kakao && !window.Kakao.isInitialized()) {
  const kakaoAppKey = import.meta.env.VITE_KAKAO_APP_KEY;
  if (kakaoAppKey) {
    window.Kakao.init(kakaoAppKey);
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>,
);
