import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import Home from "./Home";
import { useEffect } from "react";
import Navbar from "./component/Navbar";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import MySushiList from "./pages/MySushiList";
import MyAnswerList from "./pages/MyAnswerList";
import ProtectedRoute from "./component/ProtectedRoute";
import SushiDetail from "./pages/SushiDetail";
import ShareSushi from "./pages/ShareSushi";
import Chat from "./pages/Chat";

function Empty() {
  return null;
}

function Layout() {
  const location = useLocation();
  useEffect(() => {
    const updateCustomVh = () => {
      const container = document.querySelector(".container");
      if (container instanceof HTMLElement) {
        const containerHeight = container.offsetHeight;
        const customVh = containerHeight / 100;
        document.documentElement.style.setProperty(
          "--custom-vh",
          `${customVh}px`,
        );
      }
    };

    updateCustomVh();
    window.addEventListener("resize", updateCustomVh);

    return () => window.removeEventListener("resize", updateCustomVh);
  }, []);

  return (
    <div className="vh-container">
      <div className="container">
        {location.pathname !== "/login" && <Navbar />}
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/finalize" element={<AuthCallback />} />
          <Route path="/share/:token" element={<ShareSushi />} />
          <Route path="/mysushilist" element={<MySushiList />} />
          <Route path="/myanswerlist" element={<MyAnswerList />} />
          <Route
            path="/sushi/:sushiId"
            element={
              <ProtectedRoute>
                <SushiDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Empty />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
