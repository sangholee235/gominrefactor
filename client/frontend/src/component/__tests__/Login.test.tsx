import { render, screen } from "@testing-library/react";
import Login from "../../pages/Login";

beforeAll(() => {
  (import.meta as any).env = {
    VITE_KAKAO_CLIENT_ID: "TEST_CLIENT_ID",
    VITE_API_BASE_URL: "http://localhost:3000/api",
  };
});

describe("Login page", () => {
  it("버튼 텍스트가 보인다", () => {
    render(<Login />);
    expect(screen.getByText("카카오로 로그인하기")).toBeInTheDocument();
  });

  it("카카오 인증 링크가 올바르다", () => {
    render(<Login />);
    const link = screen.getByText("카카오로 로그인하기").closest("a")!;
    const expected = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${import.meta.env.VITE_KAKAO_CLIENT_ID}&redirect_uri=${import.meta.env.VITE_API_BASE_URL}/auth/kakao/callback`;
    expect(link).toHaveAttribute("href", expected);
  });

  it("버튼 컨테이너가 우측하단 배치 스타일을 갖는다", () => {
    render(<Login />);
    const loginLink = screen.getByText("카카오로 로그인하기").closest("a")!;
    const buttonContainer = loginLink.parentElement as HTMLElement;
    expect(buttonContainer.style.position).toBe("absolute");
    expect(buttonContainer.style.right).toBe("calc(8 * var(--custom-vh))");
    expect(buttonContainer.style.bottom).toBe("calc(35 * var(--custom-vh))");
  });

  it("배경 레이어가 존재하고 cover로 설정되어 있다", () => {
    const { container } = render(<Login />);
    const bgContainer = container.firstElementChild as HTMLElement;
    const bgLayer = bgContainer.children[0] as HTMLElement;
    expect(bgLayer.style.position).toBe("absolute");
    expect(bgLayer.style.backgroundSize).toBe("cover");
    expect(bgLayer.style.transform).toBe("scale(1.1)");
  });
});
