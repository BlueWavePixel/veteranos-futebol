import { describe, it, expect } from "vitest";
import { generateSlug } from "@/lib/slug";

describe("generateSlug", () => {
  it("converts team name to URL-friendly slug", () => {
    expect(generateSlug("CCDBA - Centro Cultural Desportivo Brejos de Azeitão"))
      .toBe("ccdba-centro-cultural-desportivo-brejos-de-azeitao");
  });

  it("handles Portuguese characters", () => {
    expect(generateSlug("Veteranos São João da Madeira"))
      .toBe("veteranos-sao-joao-da-madeira");
  });

  it("removes extra spaces and special characters", () => {
    expect(generateSlug("  FC Porto (Veteranos)  "))
      .toBe("fc-porto-veteranos");
  });

  it("handles empty string", () => {
    expect(generateSlug("")).toBe("");
  });
});
