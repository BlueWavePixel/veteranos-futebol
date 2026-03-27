import { describe, it, expect } from "vitest";
import { extractCoordinates } from "@/lib/geo";

describe("extractCoordinates", () => {
  it("extracts coords from Google Maps URL with @", () => {
    const url = "https://www.google.com/maps/place/Campo+da+Ordem/@39.7446206,-8.9383465,15z";
    const result = extractCoordinates(url);
    expect(result).toEqual({ latitude: 39.7446206, longitude: -8.9383465 });
  });

  it("extracts coords from !3d and !4d format", () => {
    const url = "https://www.google.com/maps/place/Some+Place/data=!3m1!4b1!4m5!3m4!1s0x0:0xabc!8m2!3d38.7223!4d-9.1393";
    const result = extractCoordinates(url);
    expect(result).toEqual({ latitude: 38.7223, longitude: -9.1393 });
  });

  it("returns null for non-maps URL", () => {
    expect(extractCoordinates("https://example.com")).toBeNull();
  });

  it("returns null for null/undefined input", () => {
    expect(extractCoordinates(null)).toBeNull();
    expect(extractCoordinates(undefined)).toBeNull();
  });

  it("returns null for shortened goo.gl URLs", () => {
    expect(extractCoordinates("https://goo.gl/maps/KCvkSTfR6xgvkjfq6")).toBeNull();
  });
});
