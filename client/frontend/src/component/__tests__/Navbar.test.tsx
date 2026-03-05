import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Navbar from "../Navbar";

describe("Navbar", () => {
  it("경로에 따라 배경 이미지가 변경된다 (/home)", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/home"]}>
        <Navbar />
      </MemoryRouter>,
    );
    const nav = container.querySelector("nav") as HTMLElement;
    expect(nav).toBeInTheDocument();
    expect(nav.style.backgroundImage).toMatch(/^url\(.+\)$/);
  });

  it("기본 경로에서는 기본 배경 이미지가 적용된다 (/unknown)", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/unknown"]}>
        <Navbar />
      </MemoryRouter>,
    );
    const nav = container.querySelector("nav") as HTMLElement;
    expect(nav).toBeInTheDocument();
    expect(nav.style.backgroundImage).toMatch(/^url\(.+\)$/);
  });
});
