import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

describe("ProtectedRoute", () => {
  it("로그인 상태면 children을 렌더링한다", async () => {
    vi.resetModules();
    vi.doMock("../../context/AuthContext", () => ({
      useAuth: () => ({ isLoggedIn: true }),
    }));
    const { default: ProtectedRoute } = await import("../ProtectedRoute");
    render(
      <MemoryRouter initialEntries={["/home"]}>
        <ProtectedRoute>
          <div>secret</div>
        </ProtectedRoute>
      </MemoryRouter>,
    );
    expect(screen.getByText("secret")).toBeInTheDocument();
  });

  it("비로그인 상태면 /login으로 리다이렉트된다", async () => {
    vi.resetModules();
    vi.doMock("../../context/AuthContext", () => ({
      useAuth: () => ({ isLoggedIn: false }),
    }));
    const { default: ProtectedRoute } = await import("../ProtectedRoute");
    render(
      <MemoryRouter initialEntries={["/home"]}>
        <ProtectedRoute>
          <div>hidden</div>
        </ProtectedRoute>
      </MemoryRouter>,
    );
    expect(screen.queryByText("hidden")).toBeNull();
  });
});
