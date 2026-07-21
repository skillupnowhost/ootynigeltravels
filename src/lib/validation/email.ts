/** Strict, professional email validation — used identically on the client (real-time UI) and server (final gate). */

const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export interface EmailValidationResult {
  valid: boolean;
  /** null when the field is simply empty */
  error: string | null;
  /** trimmed, domain-lowercased value — only meaningful when valid */
  normalized: string;
}

export function validateEmail(raw: string): EmailValidationResult {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { valid: false, error: null, normalized: "" };
  }
  if (/\s/.test(trimmed)) {
    return { valid: false, error: "Spaces are not allowed in email addresses", normalized: "" };
  }

  const atCount = (trimmed.match(/@/g) ?? []).length;
  if (atCount === 0) {
    return { valid: false, error: "Email must contain @", normalized: "" };
  }
  if (atCount > 1) {
    return { valid: false, error: "Please enter a valid email address", normalized: "" };
  }

  const [local, domain] = trimmed.split("@");
  if (!local || !domain) {
    return { valid: false, error: "Please enter a valid email address", normalized: "" };
  }
  if (local.startsWith(".") || local.endsWith(".")) {
    return { valid: false, error: "Please enter a valid email address", normalized: "" };
  }
  if (local.includes("..") || domain.includes("..")) {
    return { valid: false, error: "Consecutive dots are not allowed", normalized: "" };
  }

  const domainLabels = domain.split(".");
  if (domainLabels.length < 2 || domainLabels.some((label) => label.length === 0)) {
    return { valid: false, error: "Invalid domain name", normalized: "" };
  }

  const tld = domainLabels[domainLabels.length - 1];
  if (!/^[A-Za-z]{2,}$/.test(tld)) {
    return { valid: false, error: "Invalid email extension", normalized: "" };
  }

  if (!EMAIL_RE.test(trimmed)) {
    return { valid: false, error: "Please enter a valid email address", normalized: "" };
  }

  return { valid: true, error: null, normalized: `${local}@${domain.toLowerCase()}` };
}

export function isValidEmail(raw: string): boolean {
  return validateEmail(raw).valid;
}
