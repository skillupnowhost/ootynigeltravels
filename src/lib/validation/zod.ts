import { z } from "zod";
import { isValidE164 } from "./phone";
import { isValidEmail } from "./email";

/** A phone value already assembled as E.164 by the PhoneInput component, re-checked against the same rules server-side. */
export const strictPhone = () =>
  z
    .string()
    .trim()
    .refine((v) => isValidE164(v), { message: "Please enter a valid phone number" });

/** Same as {@link strictPhone} but allows an empty string for optional fields. */
export const strictPhoneOptional = () =>
  z
    .string()
    .trim()
    .refine((v) => v === "" || isValidE164(v), { message: "Please enter a valid phone number" });

export const strictEmail = () =>
  z
    .string()
    .trim()
    .refine((v) => isValidEmail(v), { message: "Please enter a valid email address" });

/** Same as {@link strictEmail} but allows an empty string for optional fields. */
export const strictEmailOptional = () =>
  z
    .string()
    .trim()
    .refine((v) => v === "" || isValidEmail(v), { message: "Please enter a valid email address" })
    .optional()
    .or(z.literal(""));
