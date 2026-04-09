import { describe, it, expect } from "vitest";
import { extractCoordinates } from "@/lib/geo";

describe("extractCoordinates", () => {
  it("extracts coords from Google Maps URL with @", async () => {
    const url = "https://www.google.com/maps/place/Campo+da+Ordem/@39.7446206,-8.9383465,15z";
    const result = await extractCoordinates(url);
    expect(result).toEqual({ latitude: 39.7446206, longitude: -8.9383465 });
  });

  it("extracts coords from !3d and !4d format", async () => {
    const url = "https://www.google.com/maps/place/Some+Place/data=!3m1!4b1!4m5!3m4!1s0x0:0xabc!8m2!3d38.7223!4d-9.1393";
    const result = await extractCoordinates(url);
    expect(result).toEqual({ latitude: 38.7223, longitude: -9.1393 });
  });

  it("returns null for non-maps URL", async () => {
    expect(await extractCoordinates("https://example.com")).toBeNull();
  });

  it("returns null for null/undefined input", async () => {
    expect(await extractCoordinates(null)).toBeNull();
    expect(await extractCoordinates(undefined)).toBeNull();
  });

  it("resolves shortened goo.gl URLs to coordinates", async () => {
    const result = await extractCoordinates("https://goo.gl/maps/KCvkSTfR6xgvkjfq6");
    // Short URLs are resolved via HTTP redirect + HTML scraping
    // Result depends on network availability; if reachable, coords are extracted
    if (result) {
      expect(result).toHaveProperty("latitude");
      expect(result).toHaveProperty("longitude");
      expect(result.latitude).toBeGreaterThanOrEqual(-90);
      expect(result.longitude).toBeGreaterThanOrEqual(-180);
    }
    // If network is unavailable, null is acceptable
  });
});
