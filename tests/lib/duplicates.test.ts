import { describe, it, expect } from "vitest";
import {
  normalizeText,
  normalizePhone,
  levenshtein,
  haversineDistance,
} from "@/lib/duplicates/detect";

describe("normalizeText", () => {
  it("strips accents and lowercases", () => {
    expect(normalizeText("São João")).toBe("sao joao");
    expect(normalizeText("Município")).toBe("municipio");
    expect(normalizeText("VETERANOS")).toBe("veteranos");
  });

  it("expands common abbreviations", () => {
    expect(normalizeText("Vet. Almada FC")).toBe(
      "veteranos almada futebol clube"
    );
    expect(normalizeText("GD Estrela")).toBe("grupo desportivo estrela");
    expect(normalizeText("CD Nacional")).toBe("clube desportivo nacional");
  });

  it("handles empty/null-like input", () => {
    expect(normalizeText("")).toBe("");
    expect(normalizeText("   ")).toBe("");
  });

  it("collapses multiple spaces", () => {
    expect(normalizeText("  Vet.   FC  Porto  ")).toBe(
      "veteranos futebol clube porto"
    );
  });
});

describe("normalizePhone", () => {
  it("handles plain 9-digit number", () => {
    expect(normalizePhone("912345678")).toBe("912345678");
  });

  it("strips spaces and dashes", () => {
    expect(normalizePhone("912 345 678")).toBe("912345678");
    expect(normalizePhone("912-345-678")).toBe("912345678");
  });

  it("removes +351 prefix", () => {
    expect(normalizePhone("+351912345678")).toBe("912345678");
  });

  it("removes 00351 prefix", () => {
    expect(normalizePhone("00351912345678")).toBe("912345678");
  });

  it("removes 351 prefix when number is longer than 9 digits", () => {
    expect(normalizePhone("351912345678")).toBe("912345678");
  });

  it("handles empty input", () => {
    expect(normalizePhone("")).toBe("");
  });

  it("handles formatted number with country code", () => {
    expect(normalizePhone("+351 912 345 678")).toBe("912345678");
  });
});

describe("levenshtein", () => {
  it("returns 0 for identical strings", () => {
    expect(levenshtein("abc", "abc")).toBe(0);
  });

  it("returns length of other string when one is empty", () => {
    expect(levenshtein("", "abc")).toBe(3);
    expect(levenshtein("abc", "")).toBe(3);
  });

  it("returns correct distance for single edit", () => {
    expect(levenshtein("kitten", "sitten")).toBe(1); // substitution
    expect(levenshtein("abc", "abcd")).toBe(1); // insertion
    expect(levenshtein("abcd", "abc")).toBe(1); // deletion
  });

  it("returns correct distance for multiple edits", () => {
    expect(levenshtein("kitten", "sitting")).toBe(3);
    expect(levenshtein("saturday", "sunday")).toBe(3);
  });
});

describe("haversineDistance", () => {
  it("returns 0 for same point", () => {
    expect(haversineDistance(38.7223, -9.1393, 38.7223, -9.1393)).toBe(0);
  });

  it("calculates Lisbon to Porto as approximately 274km", () => {
    // Lisbon: 38.7223, -9.1393
    // Porto: 41.1579, -8.6291
    const distance = haversineDistance(38.7223, -9.1393, 41.1579, -8.6291);
    const km = distance / 1000;
    expect(km).toBeGreaterThan(270);
    expect(km).toBeLessThan(280);
  });

  it("calculates nearby points as approximately 100m", () => {
    // Two points ~100m apart (roughly 0.001 degrees latitude)
    const lat1 = 38.7223;
    const lon1 = -9.1393;
    const lat2 = 38.7232; // ~100m north
    const lon2 = -9.1393;
    const distance = haversineDistance(lat1, lon1, lat2, lon2);
    expect(distance).toBeGreaterThan(80);
    expect(distance).toBeLessThan(120);
  });
});
