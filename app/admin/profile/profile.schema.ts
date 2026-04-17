import { z } from "zod";

export const MAX_PROFILE_PHOTO_FILE_BYTES = 1024 * 1024;
export const MAX_PROFILE_PHOTO_DATA_URL_LENGTH = 1_500_000;

const profilePhotoDataUrlSchema = z
  .string()
  .max(
    MAX_PROFILE_PHOTO_DATA_URL_LENGTH,
    "Keep the profile photo under 1MB before upload.",
  )
  .regex(
    /^data:image\/(?:png|jpe?g|webp|gif|svg\+xml);base64,[a-z0-9+/=]+$/i,
    "Upload a valid image data URL.",
  );

export const socialLinkSchema = z.object({
  label: z
    .string()
    .min(2, "Enter a label with at least 2 characters.")
    .max(24, "Keep the label under 24 characters."),
  href: z
    .string()
    .url("Enter a valid URL.")
    .max(120, "Keep the URL under 120 characters."),
});

export const profileStatSchema = z.object({
  label: z.string().min(1, "Enter a label.").max(40, "Keep the label under 40 characters."),
  value: z.string().min(1, "Enter a value.").max(20, "Keep the value under 20 characters."),
  detail: z.string().min(1, "Enter a detail message.").max(80, "Keep the detail under 80 characters."),
});

export const profileSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name is required.")
    .max(48, "Keep the name under 48 characters."),
  headline: z
    .string()
    .min(4, "Headline is required.")
    .max(72, "Keep the headline under 72 characters."),
  shortIntro: z
    .string()
    .min(24, "Short intro should be at least 24 characters.")
    .max(140, "Short intro should stay under 140 characters."),
  about: z
    .string()
    .min(80, "About section should be at least 80 characters.")
    .max(480, "About section should stay under 480 characters."),
  location: z
    .string()
    .min(2, "Location is required.")
    .max(48, "Keep the location under 48 characters."),
  email: z.string().email("Enter a valid email address."),
  phone: z
    .string()
    .min(8, "Phone number is required.")
    .max(24, "Keep the phone number under 24 characters."),
  availability: z
    .string()
    .min(4, "Availability is required.")
    .max(56, "Keep the availability note under 56 characters."),
  primaryCta: z
    .string()
    .min(4, "Primary CTA is required.")
    .max(40, "Keep the CTA under 40 characters."),
  profilePhotoUrl: z
    .union([profilePhotoDataUrlSchema, z.literal(""), z.null()])
    .transform((value) => (value === "" ? null : value)),
  socialLinks: z
    .array(socialLinkSchema)
    .min(1, "Add at least one social link.")
    .max(4, "Keep social links to four entries or fewer."),
  focus: z.array(z.string().min(2, "Focus area must be at least 2 chars.").max(60, "Focus area must be under 60 chars.")),
  stats: z.array(profileStatSchema),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
