import { render, screen, fireEvent } from "@testing-library/react";
import Rail from "../Rail";
import { useFetchRandomSushiRail } from "../../hooks/useSushi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("../../hooks/useSushi", () => ({
  useFetchRandomSushiRail: vi.fn(),
}));

describe("Rail component", () => {
  beforeEach(() => {
    (useFetchRandomSushiRail as any).mockReset?.();
  });

  it("로딩 상태에서 안내 문구를 보여준다", () => {
    (useFetchRandomSushiRail as any).mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
    });

    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <Rail />
      </QueryClientProvider>,
    );
    expect(screen.getByText("초밥을 준비 중입니다...")).toBeInTheDocument();
  });

  it("에러 상태에서 에러 문구를 보여준다", () => {
    (useFetchRandomSushiRail as any).mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error("네트워크 에러"),
    });

    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <Rail />
      </QueryClientProvider>,
    );
    expect(screen.getByText("데이터 로드 실패")).toBeInTheDocument();
  });

  it("데이터가 있으면 초밥들이 렌더링되고 클릭 핸들러가 호출된다", () => {
    const onSushiClick = vi.fn();
    (useFetchRandomSushiRail as any).mockReturnValue({
      data: [
        {
          sushiId: 1,
          category: 1,
          sushiType: 1,
          remainingAnswers: 5,
          expirationTime: "2030-01-01",
        },
        {
          sushiId: 2,
          category: 2,
          sushiType: 2,
          remainingAnswers: 3,
          expirationTime: "2030-01-01",
        },
      ],
      isLoading: false,
      error: null,
    });

    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <Rail onSushiClick={onSushiClick} />
      </QueryClientProvider>,
    );

    expect(screen.getByAltText(/Plate for 사랑/)).toBeInTheDocument();
    expect(screen.getByAltText("계란")).toBeInTheDocument();
    expect(screen.getByAltText(/Plate for 금전/)).toBeInTheDocument();
    expect(screen.getByAltText("연어")).toBeInTheDocument();

    fireEvent.click(screen.getByAltText("연어"));
    expect(onSushiClick).toHaveBeenCalledTimes(1);
    expect(onSushiClick).toHaveBeenCalledWith({
      sushiId: 2,
      category: 2,
      sushiType: 2,
      remainingAnswers: 3,
      expirationTime: "2030-01-01",
    });
  });
});
