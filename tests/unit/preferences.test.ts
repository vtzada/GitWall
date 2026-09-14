import { describe, it, expect } from "vitest";
import {
  DEFAULT_PREFERENCES,
  BACKGROUND_POSITIONS,
  type UserPreferences,
  type BackgroundType,
  type BackgroundPosition,
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

  it("defaults to top-left position", () => {
    expect(DEFAULT_PREFERENCES.backgroundPosition).toBe("top-left");
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

describe("BACKGROUND_POSITIONS", () => {
  it("contains all 9 positions", () => {
    expect(BACKGROUND_POSITIONS).toHaveLength(9);
  });

  it("each position has a value and label", () => {
    BACKGROUND_POSITIONS.forEach((pos) => {
      expect(pos.value).toBeTruthy();
      expect(pos.label).toBeTruthy();
    });
  });

  it("contains all required position values", () => {
    const values = BACKGROUND_POSITIONS.map((p) => p.value);
    expect(values).toContain("top-left");
    expect(values).toContain("top-center");
    expect(values).toContain("top-right");
    expect(values).toContain("center-left");
    expect(values).toContain("center");
    expect(values).toContain("center-right");
    expect(values).toContain("bottom-left");
    expect(values).toContain("bottom-center");
    expect(values).toContain("bottom-right");
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

  it("accepts all valid background positions", () => {
    const positions: BackgroundPosition[] = [
      "top-left", "top-center", "top-right",
      "center-left", "center", "center-right",
      "bottom-left", "bottom-center", "bottom-right",
    ];

    positions.forEach((pos) => {
      const prefs: UserPreferences = { ...DEFAULT_PREFERENCES, backgroundPosition: pos };
      expect(prefs.backgroundPosition).toBe(pos);
    });
  });

  it("preserves all fields when spreading defaults", () => {
    const custom: UserPreferences = {
      ...DEFAULT_PREFERENCES,
      themeId: "dracula",
      backgroundType: "translucent",
      backgroundPosition: "center",
      backgroundImage: "data:image/png;base64,abc",
      backgroundOverlay: 0.8,
      backgroundBlur: 12,
    };

    expect(custom.themeId).toBe("dracula");
    expect(custom.backgroundType).toBe("translucent");
    expect(custom.backgroundPosition).toBe("center");
    expect(custom.backgroundImage).toContain("data:image");
    expect(custom.backgroundOverlay).toBe(0.8);
    expect(custom.backgroundBlur).toBe(12);
  });
});
