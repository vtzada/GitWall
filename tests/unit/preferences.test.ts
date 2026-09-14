import { describe, it, expect } from "vitest";
import {
  DEFAULT_PREFERENCES,
  type UserPreferences,
  type BackgroundType,
} from "@/features/settings/preferences";

describe("DEFAULT_PREFERENCES", () => {
  it("has a valid default theme", () => {
    expect(DEFAULT_PREFERENCES.themeId).toBe("slate");
  });

  it("has a valid background type", () => {
    const validTypes: BackgroundType[] = ["solid", "image", "translucent"];
    expect(validTypes).toContain(DEFAULT_PREFERENCES.backgroundType);
  });

  it("defaults to solid background", () => {
    expect(DEFAULT_PREFERENCES.backgroundType).toBe("solid");
  });

  it("has no background image by default", () => {
    expect(DEFAULT_PREFERENCES.backgroundImage).toBeNull();
  });

  it("has valid overlay range (0..1)", () => {
    expect(DEFAULT_PREFERENCES.backgroundOverlay).toBeGreaterThanOrEqual(0);
    expect(DEFAULT_PREFERENCES.backgroundOverlay).toBeLessThanOrEqual(1);
  });

  it("has valid blur range (0..20)", () => {
    expect(DEFAULT_PREFERENCES.backgroundBlur).toBeGreaterThanOrEqual(0);
    expect(DEFAULT_PREFERENCES.backgroundBlur).toBeLessThanOrEqual(20);
  });
});

describe("UserPreferences type", () => {
  it("accepts all valid background types", () => {
    const solid: UserPreferences = { ...DEFAULT_PREFERENCES, backgroundType: "solid" };
    const image: UserPreferences = { ...DEFAULT_PREFERENCES, backgroundType: "image" };
    const translucent: UserPreferences = { ...DEFAULT_PREFERENCES, backgroundType: "translucent" };

    expect(solid.backgroundType).toBe("solid");
    expect(image.backgroundType).toBe("image");
    expect(translucent.backgroundType).toBe("translucent");
  });

  it("preserves all fields when spreading defaults", () => {
    const custom: UserPreferences = {
      ...DEFAULT_PREFERENCES,
      themeId: "dracula",
      backgroundType: "translucent",
      backgroundImage: "data:image/png;base64,abc",
      backgroundOverlay: 0.8,
      backgroundBlur: 12,
    };

    expect(custom.themeId).toBe("dracula");
    expect(custom.backgroundType).toBe("translucent");
    expect(custom.backgroundImage).toContain("data:image");
    expect(custom.backgroundOverlay).toBe(0.8);
    expect(custom.backgroundBlur).toBe(12);
  });
});
