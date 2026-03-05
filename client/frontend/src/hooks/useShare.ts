import { useCallback } from 'react';

declare global {
  interface Window {
    Kakao: any;
  }
}

interface ShareKakaoProps {
  title: string;
  description: string;
  imageUrl: string;
  webUrl: string;
}

export const useShare = () => {
  const shareToKakao = useCallback(({ title, imageUrl, webUrl }: ShareKakaoProps) => {
    if (!window.Kakao || !window.Kakao.isInitialized()) {
      alert("카카오톡 공유 기능을 사용할 수 없습니다.");
      return;
    }

    window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: "고민이 도착했습니다!",
        description: title,
        imageUrl: imageUrl,
        link: {
          mobileWebUrl: webUrl,
          webUrl: webUrl,
        },
      },
      buttons: [
        {
          title: "고민 해결해주기",
          link: {
            mobileWebUrl: webUrl,
            webUrl: webUrl,
          },
        },
      ],
    });
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          document.body.removeChild(textArea);
          return true;
        } catch (err) {
          console.error("Fallback 복사 실패:", err);
          document.body.removeChild(textArea);
          return false;
        }
      }
    } catch (error) {
      console.error("복사 과정 에러:", error);
      return false;
    }
  }, []);

  const shareToFacebook = useCallback((url: string) => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      "_blank",
    );
  }, []);

  const shareToTwitter = useCallback((url: string) => {
    window.open(
        `https://x.com/intent/tweet?text=Check%20out%20this%20sushi%20post!&url=${url}`,
        "_blank"
    );
  }, []);

  return {
    shareToKakao,
    copyToClipboard,
    shareToFacebook,
    shareToTwitter
  };
};
