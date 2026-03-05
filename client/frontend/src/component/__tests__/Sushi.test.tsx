import { render, screen, fireEvent } from "@testing-library/react";
import Sushi from "../Sushi";

describe("Sushi component", () => {
  it("카테고리/초밥 타입에 맞는 이미지와 alt가 렌더링된다", () => {
    const handleClick = vi.fn();
    render(
      <Sushi
        sushiId={1}
        category={1} // 사라
        sushiType={2} // 연어
        remainingAnswers={3}
        expirationTime={"2026-01-01"}
        onSushiClick={handleClick}
      />,
    );

    // 접시 alt는 카테고리명 포함
    expect(screen.getByAltText(/Plate for 사랑/)).toBeInTheDocument();
    // 초밥 alt는 초밥 이름
    expect(screen.getByAltText("연어")).toBeInTheDocument();
  });

  it("초밥 이미지를 클릭하면 onSushiClick이 payload와 함께 호출된다", () => {
    const handleClick = vi.fn();
    render(
      <Sushi
        sushiId={10}
        category={5}
        sushiType={11}
        remainingAnswers={7}
        expirationTime={"2030-12-31"}
        onSushiClick={handleClick}
      />,
    );

    const sushiImg = screen.getByAltText("참치");
    fireEvent.click(sushiImg);

    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith({
      sushiId: 10,
      category: 5,
      sushiType: 11,
      remainingAnswers: 7,
      expirationTime: "2030-12-31",
    });
  });

  it("알 수 없는 타입이면 초밥 이미지는 렌더링되지 않는다", () => {
    const handleClick = vi.fn();
    render(
      <Sushi
        sushiId={99}
        category={2}
        sushiType={999}
        remainingAnswers={0}
        expirationTime={""}
        onSushiClick={handleClick}
      />,
    );

    // 접시는 렌더링되지만 초밥 이미지는 없음
    expect(screen.getByAltText(/Plate for 금전/)).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: /알 수 없는 초밥/ })).toBeNull();
  });

  it("알 수 없는 카테고리면 alt에 '알 수 없는 카테고리'가 표시된다", () => {
    const handleClick = vi.fn();
    render(
      <Sushi
        sushiId={123}
        category={999}
        sushiType={2}
        remainingAnswers={0}
        expirationTime={""}
        onSushiClick={handleClick}
      />,
    );

    expect(
      screen.getByAltText("Plate for 알 수 없는 카테고리"),
    ).toBeInTheDocument();
  });
});
