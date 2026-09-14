import { describe, it, expect } from "vitest";
import { THEMES, getThemeById } from "@/features/settings/themes";

describe("themes registry", () => {
  it("contains all required themes", () => {
    const ids = THEMES.map((t) => t.id);
    expect(ids).toContain("slate");
    expect(ids).toContain("github");
    expect(ids).toContain("dracula");
    expect(ids).toContain("tokyo");
    expect(ids).toContain("flame");
    expect(ids).toContain("monochrome");
  });

  it("has exactly 6 themes", () => {
    expect(THEMES).toHaveLength(6);
  });

  it("each theme has required fields", () => {
    THEMES.forEach((theme) => {
      expect(theme.id).toBeTruthy();
      expect(theme.name).toBeTruthy();
      expect(theme.description).toBeTruthy();
      expect(theme.accent).toMatch(/^#[0-9a-f]{6}$/i);
      expect(theme.accentDim).toMatch(/^#[0-9a-f]{6}$/i);
      expect(theme.bg).toMatch(/^#[0-9a-f]{6}$/i);
      expect(theme.bgElevated).toMatch(/^#[0-9a-f]{6}$/i);
      expect(theme.heatLevels).toHaveLength(5);
      expect(theme.previewColors.length).toBeGreaterThan(0);
    });
  });

  it("each heat level is a valid hex color", () => {
    THEMES.forEach((theme) => {
      theme.heatLevels.forEach((color) => {
        expect(color).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });
  });

  it("theme IDs are unique", () => {
    const ids = THEMES.map((t) => t.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
});

describe("getThemeById", () => {
  it("returns the correct theme for a valid ID", () => {
    const theme = getThemeById("github");
    expect(theme.id).toBe("github");
    expect(theme.name).toBe("GitHub Classic");
  });

  it("returns the first theme (slate) as fallback for an unknown ID", () => {
    const theme = getThemeById("nonexistent");
    expect(theme.id).toBe("slate");
  });

  it("returns the first theme for an empty string", () => {
    const theme = getThemeById("");
    expect(theme.id).toBe("slate");
  });

  it("returns each theme by its ID", () => {
    THEMES.forEach((expected) => {
      const found = getThemeById(expected.id);
      expect(found.id).toBe(expected.id);
      expect(found.name).toBe(expected.name);
    });
  });
});
