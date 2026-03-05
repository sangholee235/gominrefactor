import "../styles/SushiView.css";
import { useSushiViewLogic } from "../hooks/useSushiViewLogic";

type SushiData = {
  sushiId?: number;
  title?: string;
  content?: string;
  category?: number;
};

type SushiViewProps = {
  isOpen: boolean;
  onClose: () => void;
  sushi?: SushiData | null;
  onSubmit?: (content: string) => void;
};

const SushiView = (props: SushiViewProps) => {
  const {
    detail,
    content,
    setContent,
    showAnswerInput,
    setShowAnswerInput,
    showTopFade,
    showBottomFade,
    opacity,
    contentRef,
    handleScroll,
    handleClose,
    handleBack,
    handleSubmit,
    displayContent,
    titleShadowColor,
  } = useSushiViewLogic(props);

  if (!props.isOpen) return null;

  return (
    <div
      className="sushi-view-overlay"
      style={{ opacity, transition: "opacity 0.3s ease-in-out" }}
    >
      <div
        className="sushi-view-modal"
        style={{
          opacity,
          transform: `translateY(${20 - opacity * 20}px)`,
          transition: "opacity 0.3s ease-in-out, transform 0.3s ease-in-out",
        }}
      >
        <div className="sushi-view-container">
          <div className="sushi-view-button-row">
            <button className="sushi-view-icon-button" onClick={handleBack}>
              {"<"}
            </button>
            {!showAnswerInput ? (
              <h3
                className="sushi-view-title sushi-view-title--header"
                style={{
                  boxShadow: `0 calc(0.5 * var(--custom-vh)) 0px ${titleShadowColor}`,
                }}
              >
                {detail?.title ?? props.sushi?.title ?? ""}
              </h3>
            ) : (
              <div className="sushi-view-title-spacer" />
            )}
            <button className="sushi-view-icon-button" onClick={handleClose}>
              X
            </button>
          </div>

          {!showAnswerInput ? (
            <>
              <div className="sushi-view-content-container">
                <div className="sushi-view-content-wrapper">
                  {showTopFade && <div className="sushi-view-fade-top" />}
                  <div
                    ref={contentRef}
                    className="sushi-view-content"
                    onScroll={handleScroll}
                  >
                    <p className="sushi-view-text">{displayContent}</p>
                  </div>
                  {showBottomFade && <div className="sushi-view-fade-bottom" />}
                </div>
              </div>
            </>
          ) : (
            <>
              <textarea
                className="sushi-view-textarea"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="고민에 대한 의견을 나눠주세요"
                maxLength={500}
              />
              <div className="sushi-view-counter">{content.length} / 500</div>
            </>
          )}

          {!showAnswerInput ? (
            <button
              className="sushi-view-action"
              onClick={() => setShowAnswerInput(true)}
            >
              답변 작성
            </button>
          ) : (
            <button className="sushi-view-action" onClick={handleSubmit}>
              제출하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SushiView;
