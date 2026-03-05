import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import "../../styles/PostSushiModal.css";
import { useShare } from "../../hooks/useShare";

import cuttleImg from "../../assets/sushi/cuttle.webp";
import eelImg from "../../assets/sushi/eel.webp";
import eggImg from "../../assets/sushi/egg.webp";
import octopusImg from "../../assets/sushi/octopus.webp";
import salmonImg from "../../assets/sushi/salmon.webp";
import shrimpImg from "../../assets/sushi/shrimp.webp";
import wagyuImg from "../../assets/sushi/wagyu.webp";
import scallopImg from "../../assets/sushi/scallop.webp";
import flatfishImg from "../../assets/sushi/flatfish.webp";
import uniImg from "../../assets/sushi/uni.webp";
import tunaImg from "../../assets/sushi/tuna.webp";
import salmonRoeImg from "../../assets/sushi/salmon-roe.webp";

import { useCreateSushi } from "../../hooks/useSushi";
import { createShareToken } from "../../api/shareApi";

type PostSushiModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
};

type SushiImage = {
  id: number;
  src: string;
  name: string;
  fileName: string;
};

const CATEGORIES = [
  { id: 1, label: "사람 관계" },
  { id: 2, label: "금전 문제" },
  { id: 3, label: "건강 및 생활" },
  { id: 4, label: "공부 및 진로" },
  { id: 5, label: "자아실현" },
  { id: 6, label: "기타" },
];

const PostSushiModal = ({
  isOpen,
  onClose,
  onComplete,
}: PostSushiModalProps) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [maxAnswers, setMaxAnswers] = useState(5);
  const [category, setCategory] = useState(0);
  const [sushiType, setSushiType] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [isClosing, setIsClosing] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const sliderRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const { mutate: createSushi, isPending } = useCreateSushi();
  const { shareToKakao } = useShare();

  const sushiImages = useMemo<SushiImage[]>(
    () => [
      { id: 1, src: eggImg, name: "계란초밥", fileName: "egg" },
      { id: 2, src: salmonImg, name: "연어초밥", fileName: "salmon" },
      { id: 3, src: shrimpImg, name: "새우초밥", fileName: "shrimp" },
      { id: 4, src: cuttleImg, name: "한치초밥", fileName: "cuttle" },
      { id: 5, src: octopusImg, name: "문어초밥", fileName: "octopus" },
      { id: 6, src: eelImg, name: "장어초밥", fileName: "eel" },
      { id: 7, src: wagyuImg, name: "와규초밥", fileName: "wagyu" },
      { id: 8, src: scallopImg, name: "가리비초밥", fileName: "scallop" },
      { id: 9, src: flatfishImg, name: "광어초밥", fileName: "flatfish" },
      { id: 10, src: uniImg, name: "성게알초밥", fileName: "uni" },
      { id: 11, src: tunaImg, name: "참치초밥", fileName: "tuna" },
      { id: 12, src: salmonRoeImg, name: "연어알초밥", fileName: "salmon-roe" },
    ],
    [],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setIsClosing(false);
    setStep(1);
    setTitle("");
    setContent("");
    setMaxAnswers(5);
    setCategory(0);
    setSushiType(sushiImages[0]?.id ?? 1);
    setShareUrl("");
    setShowConfirmModal(false);
    setShowCompleteModal(false);
    setAlertMessage(null);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, sushiImages]);

  if (!isOpen) {
    return null;
  }

  const showAlert = (message: string) => {
    setAlertMessage(message);
  };

  const handleCategoryChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCategory(Number(event.target.value));
  };

  const handleProgressChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMaxAnswers(Number(event.target.value));
  };

  const handleSushiTypeChange = (sushi: SushiImage) => {
    setSushiType(sushi.id);
  };

  const handleNext = () => {
    if (!category) {
      showAlert("카테고리를 설정해주세요.");
      return;
    }
    if (!sushiType) {
      showAlert("초밥을 골라주세요.");
      return;
    }
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      showAlert("제목과 내용을 모두 입력해주세요.");
      return;
    }
    if (title.length > 30) {
      showAlert("제목은 30자 이내로 입력해주세요.");
      return;
    }
    if (content.length > 500) {
      showAlert("내용은 500자 이내로 입력해주세요.");
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = () => {
    const expireTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    createSushi(
      {
        title,
        content,
        expireTime,
        maxAnswers,
        categoryId: category,
        sushiTypeId: sushiType,
      },
      {
        onSuccess: async (newSushi) => {
          const id = newSushi.id ?? newSushi.sushiId ?? null;
          if (id != null) {
            try {
              const { token } = await createShareToken(id);
              setShareUrl(`share/${token}`);
            } catch (err) {
              console.error("공유 토큰 발급 실패 (ID로 대체):", err);
              // 토큰 생성 실패 시 일반 ID 링크로 대체
              setShareUrl(`sushi/${id}`);
            }
          } else {
            console.error("생성된 스시의 ID를 찾을 수 없습니다.");
            const token = Math.random().toString(36).slice(2, 10);
            setShareUrl(`share/${token}`);
          }
          setShowConfirmModal(false);
          setShowCompleteModal(true);
          onComplete?.();
        },
        onError: (error) => {
          console.error("고민 생성 API 에러:", error);
          showAlert(error.message || "초밥 생성에 실패했습니다.");
          setShowConfirmModal(false);
        },
      },
    );
  };

  const handleCompleteClose = () => {
    setShowCompleteModal(false);
    onClose();
    onComplete?.();
  };

  const handleCancelSubmit = () => {
    setShowConfirmModal(false);
  };

  const handleKakaoShareClick = () => {
    const selectedSushi = sushiImages.find((s) => s.id === sushiType);
    const base = import.meta.env.DEV ? "http://localhost:5173" : window.location.origin;
    const imageUrl = `${base}/images/sushi/${selectedSushi?.fileName || "egg"}.webp`;
    const webUrl = `${base}/${shareUrl}`;

    shareToKakao({
      title: "고민이 도착했습니다!",
      description: title,
      imageUrl,
      webUrl
    });
  };

  const handleClose = () => {
    setIsClosing(true);
    window.setTimeout(() => {
      onClose();
    }, 700);
  };

  return (
    <>
      <div
        className={`post-sushi-overlay ${
          isClosing ? "post-sushi-overlay--closing" : ""
        }`}
        onClick={handleClose}
      >
        <div
          className={`post-sushi-modal ${
            isClosing ? "post-sushi-modal--closing" : ""
          }`}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="post-sushi-form">
            <div className="post-sushi-header">
              <div className="post-sushi-header-top">
                <p className="post-sushi-title">
                  마음속 이야기를 적는
                  <br /> 고민 작성서
                </p>
                <button
                  type="button"
                  className="post-sushi-close"
                  onClick={handleClose}
                >
                  ✖
                </button>
              </div>
              <p className="post-sushi-explain">
                유통기한이 임박한 초밥에는
                <br /> 마스터냥의 조언이 달릴 수 있습니다
              </p>
            </div>
            <hr className="post-sushi-divider" />
            <div className="post-sushi-body">
              {step === 1 ? (
                <>
                  <p className="post-sushi-section-title">질문 카테고리 설정</p>
                  <div className="post-sushi-radio-grid">
                    {CATEGORIES.map((item) => (
                      <label key={item.id} className="post-sushi-radio">
                        <input
                          className="post-sushi-radio-input"
                          type="radio"
                          name="category"
                          value={item.id}
                          checked={category === item.id}
                          onChange={handleCategoryChange}
                        />
                        <span className="post-sushi-radio-label">
                          {item.label}
                        </span>
                      </label>
                    ))}
                  </div>
                  <hr className="post-sushi-divider" />
                  <p className="post-sushi-section-title">인원수 설정</p>
                  <input
                    className="post-sushi-range"
                    type="range"
                    min="1"
                    max="10"
                    value={maxAnswers}
                    onChange={handleProgressChange}
                  />
                  <p className="post-sushi-range-value">{maxAnswers} / 10</p>
                  <hr className="post-sushi-divider" />
                  <p className="post-sushi-section-title">초밥 종류 선택</p>
                  <div className="post-sushi-grid" ref={sliderRef}>
                    {sushiImages.map((sushi, index) => {
                      const isSelected = sushiType === sushi.id;
                      return (
                        <button
                          key={sushi.id}
                          type="button"
                          className={`post-sushi-item ${
                            isSelected ? "post-sushi-item--selected" : ""
                          }`}
                          onClick={() => {
                            handleSushiTypeChange(sushi);
                          }}
                          ref={(node) => {
                            itemRefs.current[index] = node;
                          }}
                        >
                          <div className="post-sushi-item-media">
                            <img
                              className="post-sushi-item-image"
                              src={sushi.src}
                              alt={sushi.name}
                            />
                          </div>
                          <p className="post-sushi-item-name">{sushi.name}</p>
                        </button>
                      );
                    })}
                  </div>
                  <div className="post-sushi-footer">
                    <hr className="post-sushi-divider" />
                    <div className="post-sushi-footer-actions post-sushi-footer-actions--end">
                      <button
                        type="button"
                        className="post-sushi-text-button"
                        onClick={handleNext}
                      >
                        고민작성 &gt;
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p className="post-sushi-section-title">제목</p>
                  <hr className="post-sushi-divider" />
                  <textarea
                    className="post-sushi-input"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="고민의 제목을 입력하세요 (30자 이내)"
                    maxLength={30}
                  />
                  <p className="post-sushi-counter">{title.length} / 30</p>
                  <hr className="post-sushi-divider" />
                  <p className="post-sushi-section-title">내용</p>
                  <hr className="post-sushi-divider" />
                  <textarea
                    className="post-sushi-textarea"
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    placeholder="고민의 내용을 입력하세요 (500자 이내)"
                    maxLength={500}
                  />
                  <p className="post-sushi-counter">{content.length} / 500</p>
                  <div className="post-sushi-footer">
                    <hr className="post-sushi-divider" />
                    <div className="post-sushi-footer-actions post-sushi-footer-actions--between">
                      <button
                        type="button"
                        className="post-sushi-text-button"
                        onClick={handleBack}
                      >
                        &lt; 이전
                      </button>
                      <button
                        type="button"
                        className="post-sushi-text-button"
                        onClick={handleSubmit}
                      >
                        고민제출 &gt;
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {showConfirmModal && (
        <div className="post-sushi-confirm-overlay">
          <div className="post-sushi-confirm">
            <p>고민을 제출하고 난 후에는 수정할 수 없습니다.</p>
            <div className="post-sushi-confirm-actions">
              <button
                type="button"
                className="post-sushi-confirm-btn post-sushi-confirm-btn--cancel"
                onClick={handleCancelSubmit}
              >
                취소
              </button>
              <button
                type="button"
                className="post-sushi-confirm-btn post-sushi-confirm-btn--confirm"
                onClick={handleConfirmSubmit}
                disabled={isPending}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {showCompleteModal && (
        <div className="post-sushi-confirm-overlay">
          <div className="post-sushi-confirm">
            <p>제출이 완료되었습니다!</p>
            <button
              type="button"
              className="post-sushi-confirm-btn post-sushi-confirm-btn--close"
              onClick={handleCompleteClose}
            >
              확인
            </button>
            <p className="post-sushi-share-title">공유하기</p>
            <div className="post-sushi-share-actions">
              <button
                type="button"
                className="post-sushi-share-button"
                style={{ backgroundColor: "#FEE500", color: "#000000" }}
                onClick={handleKakaoShareClick}
              >
                Kakao
              </button>
            </div>
          </div>
        </div>
      )}

      {alertMessage && (
        <div className="post-sushi-alert-overlay">
          <div className="post-sushi-alert">
            <p>{alertMessage}</p>
            <button
              type="button"
              className="post-sushi-confirm-btn post-sushi-confirm-btn--close"
              onClick={() => setAlertMessage(null)}
            >
              확인
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PostSushiModal;
