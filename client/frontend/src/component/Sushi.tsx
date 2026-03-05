import eggImg from "../assets/sushi/egg.webp";
import salmonImg from "../assets/sushi/salmon.webp";
import shrimpImg from "../assets/sushi/shrimp.webp";
import cuttleImg from "../assets/sushi/cuttle.webp";
import eelImg from "../assets/sushi/eel.webp";
import octopusImg from "../assets/sushi/octopus.webp";
import wagyuImg from "../assets/sushi/wagyu.webp";
import scallopImg from "../assets/sushi/scallop.webp";
import tunaImg from "../assets/sushi/tuna.webp";
import uniImg from "../assets/sushi/uni.webp";
import flatfishImg from "../assets/sushi/flatfish.webp";
import salmonRoeImg from "../assets/sushi/salmon-roe.webp";

import redImg from "../assets/plates/red.webp";
import yellowImg from "../assets/plates/yellow.webp";
import greenImg from "../assets/plates/green.webp";
import blueImg from "../assets/plates/blue.webp";
import violetImg from "../assets/plates/violet.webp";
import grayImg from "../assets/plates/gray.webp";
import whiteImg from "../assets/plates/white.webp";

import type { SushiClickPayload } from "../types/sushi";

type SushiProps = SushiClickPayload & {
  onSushiClick: (payload: SushiClickPayload) => void;
};

const Sushi = ({
  sushiId,
  category,
  sushiType,
  remainingAnswers,
  expirationTime,
  onSushiClick,
}: SushiProps) => {
  /** 기본값 보정 */
  const safeSushiId = sushiId ?? 0;
  const safeCategory = category ?? 0;
  const safeSushiType = sushiType ?? 0;
  const safeRemainingAnswers = remainingAnswers ?? 0;
  const safeExpirationTime = expirationTime ?? "";

  const categories: Record<number, string> = {
    1: "사랑",
    2: "금전",
    3: "건강",
    4: "진로",
    5: "자아",
    6: "기타",
  };

  const plates: Record<number, string> = {
    1: redImg,
    2: yellowImg,
    3: greenImg,
    4: blueImg,
    5: violetImg,
    6: grayImg,
  };

  const sushiTypes: Record<number, { name: string; image: string | null }> = {
    1: { name: "계란", image: eggImg },
    2: { name: "연어", image: salmonImg },
    3: { name: "새우", image: shrimpImg },
    4: { name: "한치", image: cuttleImg },
    5: { name: "문어", image: octopusImg },
    6: { name: "장어", image: eelImg },
    7: { name: "와규", image: wagyuImg },
    8: { name: "가리비", image: scallopImg },
    9: { name: "광어", image: flatfishImg },
    10: { name: "성게알", image: uniImg },
    11: { name: "참치", image: tunaImg },
    12: { name: "연어알", image: salmonRoeImg },
  };

  const categoryName = categories[safeCategory] ?? "알 수 없는 카테고리";

  const sushiInfo = sushiTypes[safeSushiType] ?? {
    name: "알 수 없는 초밥",
    image: null,
  };

  const plateImage = plates[safeCategory] ?? whiteImg;

  const handleSushiClick = () => {
    onSushiClick({
      sushiId: safeSushiId,
      category: safeCategory,
      sushiType: safeSushiType,
      remainingAnswers: safeRemainingAnswers,
      expirationTime: safeExpirationTime,
    });
  };

  return (
    <div
      className="sushi"
      style={{
        cursor: "pointer",
        textAlign: "center",
        width: "150px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "calc(19 * var(--custom-vh))",
          height: "calc(18 * var(--custom-vh))",
          overflow: "hidden",
        }}
      >
        <img
          src={plateImage}
          alt={`Plate for ${categoryName}`}
          style={{
            width: "calc(16 * var(--custom-vh))",
            height: "calc(15 * var(--custom-vh))",
            position: "absolute",
            top: "45%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
          }}
        />

        {sushiInfo.image && (
          <img
            onClick={handleSushiClick}
            src={sushiInfo.image}
            alt={sushiInfo.name}
            style={{
              width: "calc(46 * var(--custom-vh))",
              height: "calc(12 * var(--custom-vh))",
              objectFit: "cover",
              position: "absolute",
              top: "47.8%",
              left: "49%",
              transform: "translate(-50%, -50%)",
              transition: "all 0.3s ease",
              cursor: "pointer",
              willChange: "transform",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translate(-50%, -60%)";
              e.currentTarget.style.filter = "brightness(1.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translate(-50%, -50%)";
              e.currentTarget.style.filter = "brightness(1)";
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Sushi;
