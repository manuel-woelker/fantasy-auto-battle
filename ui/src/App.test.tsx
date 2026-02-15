import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  it("renders the title", () => {
    render(<App />);
    expect(
      screen.getByText("Fantasy Auto Battle - Card Browser"),
    ).toBeInTheDocument();
  });

  it("renders card browser with search and filters", () => {
    render(<App />);
    expect(
      screen.getByPlaceholderText("Search by name..."),
    ).toBeInTheDocument();
    expect(screen.getByText("All Types")).toBeInTheDocument();
    expect(screen.getByText("All Rarities")).toBeInTheDocument();
  });
});
