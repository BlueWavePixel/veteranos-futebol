import { describe, it, expect } from "vitest";
import { cleanPhone, parseExcelRow } from "@/scripts/import-excel";

describe("cleanPhone", () => {
  it("converts float phone to string", () => {
    expect(cleanPhone(934151187.0)).toBe("934151187");
  });

  it("handles string phone", () => {
    expect(cleanPhone("934151187")).toBe("934151187");
  });

  it("handles null", () => {
    expect(cleanPhone(null)).toBeNull();
  });
});

describe("parseExcelRow", () => {
  it("maps Excel columns to team data", () => {
    const row = [
      "2022-12-08 14:40:04",
      "test@gmail.com",
      "https://drive.google.com/open?id=abc",
      "Test Team FC",
      "John Doe",
      null,
      934151187.0,
      null,
      "Sim",
      "Red",
      "Blue",
      "Campo Test",
      "Rua Test",
      "Lisboa",
      "https://www.google.com/maps/place/Test/@38.7,-9.1,15z",
      "Notes here",
    ];
    const result = parseExcelRow(row);
    expect(result.name).toBe("Test Team FC");
    expect(result.coordinatorEmail).toBe("test@gmail.com");
    expect(result.coordinatorPhone).toBe("934151187");
    expect(result.dinnerThirdParty).toBe(true);
    expect(result.latitude).toBe("38.7");
    expect(result.longitude).toBe("-9.1");
  });
});
