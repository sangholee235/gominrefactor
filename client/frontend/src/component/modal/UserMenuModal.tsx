import "../../styles/Navbar.css";
import { useLogout, useWithdraw, useUpdateNickname } from "../../hooks/useAuth";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";

type UserMenuModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const UserMenuModal = ({ isOpen, onClose }: UserMenuModalProps) => {
  const { user } = useAuth();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const { mutate: withdraw, isPending: isWithdrawing } = useWithdraw();
  const { mutate: updateNickname, isPending: isUpdatingNickname } = useUpdateNickname();

  const [nicknameInput, setNicknameInput] = useState("");

  // 모달 열 때 현재 닉네임으로 인풋 초기화
  useEffect(() => {
    if (isOpen && user?.nickname) {
      setNicknameInput(user.nickname);
    } else if (isOpen) {
      setNicknameInput("");
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleLogout = () => {
    logout();
    onClose();
  };

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        "정말로 회원탈퇴 하시겠습니까?\n탈퇴 시 모든 데이터가 삭제됩니다.",
      )
    ) {
      withdraw();
      onClose();
    }
  };

  const handleUpdateNickname = () => {
    if (!nicknameInput.trim()) {
      alert("닉네임을 입력해주세요.");
      return;
    }
    if (nicknameInput.trim().length > 16) {
      alert("닉네임은 16자 이하로 입력해주세요.");
      return;
    }
    updateNickname(nicknameInput.trim(), {
      onSuccess: () => {
        onClose();
      }
    });
  };

  const isPending = isLoggingOut || isWithdrawing || isUpdatingNickname;

  return (
    <div className="user-menu-overlay" onClick={onClose}>
      <div className="user-menu-modal" onClick={(e) => e.stopPropagation()}>
        <div className="user-menu-content">
          <div className="user-menu-nickname-section" style={{ padding: '10px 15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '1.4vh', color: '#8b6b3e', fontWeight: 'bold' }}>닉네임 설정</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={nicknameInput}
                onChange={(e) => setNicknameInput(e.target.value)}
                placeholder="새 닉네임"
                maxLength={16}
                style={{
                  flex: 1,
                  padding: '5px 10px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  outline: 'none',
                  fontSize: '1.4vh',
                }}
              />
              <button
                onClick={handleUpdateNickname}
                disabled={isPending || nicknameInput === user?.nickname}
                style={{
                  padding: '5px 10px',
                  backgroundColor: '#b2975c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: (isPending || nicknameInput === user?.nickname) ? 'not-allowed' : 'pointer',
                  fontSize: '1.4vh',
                  opacity: (isPending || nicknameInput === user?.nickname) ? 0.6 : 1
                }}
              >
                변경
              </button>
            </div>
          </div>
          <div className="user-menu-divider" />
          <button
            className="user-menu-item"
            onClick={handleLogout}
            disabled={isPending}
          >
            {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
          </button>
          <div className="user-menu-divider" />
          <button
            className="user-menu-item delete"
            onClick={handleDeleteAccount}
            disabled={isPending}
          >
            {isWithdrawing ? "탈퇴 처리 중..." : "회원탈퇴"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserMenuModal;
