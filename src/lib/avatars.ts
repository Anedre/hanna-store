/**
 * DiceBear Avatar Generator
 *
 * Generates unique, deterministic avatars using the DiceBear API.
 * No API key required - it's free and URL-based.
 *
 * @see https://www.dicebear.com/
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type AvatarStyle =
  | "adventurer"
  | "adventurer-neutral"
  | "avataaars"
  | "avataaars-neutral"
  | "big-ears"
  | "big-ears-neutral"
  | "big-smile"
  | "bottts"
  | "bottts-neutral"
  | "croodles"
  | "croodles-neutral"
  | "dylan"
  | "fun-emoji"
  | "glass"
  | "icons"
  | "identicon"
  | "initials"
  | "lorelei"
  | "lorelei-neutral"
  | "micah"
  | "miniavs"
  | "notionists"
  | "notionists-neutral"
  | "open-peeps"
  | "personas"
  | "pixel-art"
  | "pixel-art-neutral"
  | "rings"
  | "shapes"
  | "thumbs";

interface AvatarOptions {
  /** Seed for deterministic generation (name, email, or any string) */
  seed: string;
  /** DiceBear style collection (default: "adventurer") */
  style?: AvatarStyle;
  /** Size in pixels (default: 128) */
  size?: number;
  /** Background color without # (default: "00B4A0" — HANNA teal) */
  backgroundColor?: string;
  /** Border radius 0-50 (default: 50 for circle) */
  radius?: number;
  /** Flip horizontally (default: false) */
  flip?: boolean;
  /** Output format (default: "svg") */
  format?: "svg" | "png" | "jpg";
}

// ---------------------------------------------------------------------------
// Core function
// ---------------------------------------------------------------------------
export function generateAvatar(options: AvatarOptions): string {
  const {
    seed,
    style = "adventurer",
    size = 128,
    backgroundColor,
    radius = 50,
    flip = false,
    format = "svg",
  } = options;

  const params = new URLSearchParams();
  params.set("seed", seed);
  if (size) params.set("size", String(size));
  if (backgroundColor) params.set("backgroundColor", backgroundColor);
  if (radius !== undefined) params.set("radius", String(radius));
  if (flip) params.set("flip", "true");

  return `https://api.dicebear.com/9.x/${style}/${format}?${params.toString()}`;
}

// ---------------------------------------------------------------------------
// Convenience helpers
// ---------------------------------------------------------------------------

/** Generate avatar from user name */
export function avatarFromName(name: string, style?: AvatarStyle): string {
  return generateAvatar({ seed: name, style: style || "adventurer" });
}

/** Generate avatar from email */
export function avatarFromEmail(email: string, style?: AvatarStyle): string {
  return generateAvatar({ seed: email, style: style || "bottts" });
}

/** Generate initials avatar (2 letters on colored background) */
export function avatarInitials(
  name: string,
  bgColor: string = "00B4A0"
): string {
  return generateAvatar({
    seed: name,
    style: "initials",
    backgroundColor: bgColor,
    radius: 50,
  });
}

/** Generate a set of random avatars for testimonials / demo data */
export function generateAvatarSet(
  names: string[],
  style: AvatarStyle = "adventurer"
): { name: string; avatar: string }[] {
  return names.map((name) => ({
    name,
    avatar: generateAvatar({ seed: name, style }),
  }));
}

// ---------------------------------------------------------------------------
// Preset sets for the HANNA store
// ---------------------------------------------------------------------------
export const HANNA_TESTIMONIAL_AVATARS = generateAvatarSet(
  [
    "Maria Gutierrez",
    "Carlos Mendoza",
    "Ana Rodriguez",
    "Jorge Castillo",
    "Lucia Fernandez",
    "Pedro Ramirez",
  ],
  "adventurer"
);

export const HANNA_TEAM_AVATARS = generateAvatarSet(
  ["CEO Hanna", "CTO Hanna", "Design Lead", "Customer Success"],
  "big-smile"
);
