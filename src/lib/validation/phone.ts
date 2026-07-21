/**
 * International phone number validation.
 *
 * Countries are selected from a fixed dropdown (dial code is never typed by
 * the user), so E.164 assembly is just `+${dialCode}${nationalDigits}`.
 * Four countries have exact numbering-plan rules per product spec; every
 * other country falls back to the generic ITU-ish rule: 8-15 total digits
 * after the leading `+`.
 */

export interface Country {
  iso2: string;
  name: string;
  dialCode: string;
}

export const COUNTRIES: Country[] = [
  { iso2: "IN", name: "India", dialCode: "91" },
  { iso2: "US", name: "United States", dialCode: "1" },
  { iso2: "GB", name: "United Kingdom", dialCode: "44" },
  { iso2: "AE", name: "United Arab Emirates", dialCode: "971" },
  { iso2: "CA", name: "Canada", dialCode: "1" },
  { iso2: "AU", name: "Australia", dialCode: "61" },
  { iso2: "AF", name: "Afghanistan", dialCode: "93" },
  { iso2: "AL", name: "Albania", dialCode: "355" },
  { iso2: "DZ", name: "Algeria", dialCode: "213" },
  { iso2: "AR", name: "Argentina", dialCode: "54" },
  { iso2: "AM", name: "Armenia", dialCode: "374" },
  { iso2: "AT", name: "Austria", dialCode: "43" },
  { iso2: "AZ", name: "Azerbaijan", dialCode: "994" },
  { iso2: "BH", name: "Bahrain", dialCode: "973" },
  { iso2: "BD", name: "Bangladesh", dialCode: "880" },
  { iso2: "BY", name: "Belarus", dialCode: "375" },
  { iso2: "BE", name: "Belgium", dialCode: "32" },
  { iso2: "BT", name: "Bhutan", dialCode: "975" },
  { iso2: "BO", name: "Bolivia", dialCode: "591" },
  { iso2: "BA", name: "Bosnia and Herzegovina", dialCode: "387" },
  { iso2: "BR", name: "Brazil", dialCode: "55" },
  { iso2: "BN", name: "Brunei", dialCode: "673" },
  { iso2: "BG", name: "Bulgaria", dialCode: "359" },
  { iso2: "KH", name: "Cambodia", dialCode: "855" },
  { iso2: "CM", name: "Cameroon", dialCode: "237" },
  { iso2: "CL", name: "Chile", dialCode: "56" },
  { iso2: "CN", name: "China", dialCode: "86" },
  { iso2: "CO", name: "Colombia", dialCode: "57" },
  { iso2: "CR", name: "Costa Rica", dialCode: "506" },
  { iso2: "HR", name: "Croatia", dialCode: "385" },
  { iso2: "CU", name: "Cuba", dialCode: "53" },
  { iso2: "CY", name: "Cyprus", dialCode: "357" },
  { iso2: "CZ", name: "Czech Republic", dialCode: "420" },
  { iso2: "DK", name: "Denmark", dialCode: "45" },
  { iso2: "EC", name: "Ecuador", dialCode: "593" },
  { iso2: "EG", name: "Egypt", dialCode: "20" },
  { iso2: "EE", name: "Estonia", dialCode: "372" },
  { iso2: "ET", name: "Ethiopia", dialCode: "251" },
  { iso2: "FJ", name: "Fiji", dialCode: "679" },
  { iso2: "FI", name: "Finland", dialCode: "358" },
  { iso2: "FR", name: "France", dialCode: "33" },
  { iso2: "GE", name: "Georgia", dialCode: "995" },
  { iso2: "DE", name: "Germany", dialCode: "49" },
  { iso2: "GH", name: "Ghana", dialCode: "233" },
  { iso2: "GR", name: "Greece", dialCode: "30" },
  { iso2: "HK", name: "Hong Kong", dialCode: "852" },
  { iso2: "HU", name: "Hungary", dialCode: "36" },
  { iso2: "IS", name: "Iceland", dialCode: "354" },
  { iso2: "ID", name: "Indonesia", dialCode: "62" },
  { iso2: "IR", name: "Iran", dialCode: "98" },
  { iso2: "IQ", name: "Iraq", dialCode: "964" },
  { iso2: "IE", name: "Ireland", dialCode: "353" },
  { iso2: "IL", name: "Israel", dialCode: "972" },
  { iso2: "IT", name: "Italy", dialCode: "39" },
  { iso2: "JM", name: "Jamaica", dialCode: "1876" },
  { iso2: "JP", name: "Japan", dialCode: "81" },
  { iso2: "JO", name: "Jordan", dialCode: "962" },
  { iso2: "KZ", name: "Kazakhstan", dialCode: "7" },
  { iso2: "KE", name: "Kenya", dialCode: "254" },
  { iso2: "KW", name: "Kuwait", dialCode: "965" },
  { iso2: "KG", name: "Kyrgyzstan", dialCode: "996" },
  { iso2: "LA", name: "Laos", dialCode: "856" },
  { iso2: "LV", name: "Latvia", dialCode: "371" },
  { iso2: "LB", name: "Lebanon", dialCode: "961" },
  { iso2: "LY", name: "Libya", dialCode: "218" },
  { iso2: "LI", name: "Liechtenstein", dialCode: "423" },
  { iso2: "LT", name: "Lithuania", dialCode: "370" },
  { iso2: "LU", name: "Luxembourg", dialCode: "352" },
  { iso2: "MO", name: "Macau", dialCode: "853" },
  { iso2: "MY", name: "Malaysia", dialCode: "60" },
  { iso2: "MV", name: "Maldives", dialCode: "960" },
  { iso2: "MT", name: "Malta", dialCode: "356" },
  { iso2: "MU", name: "Mauritius", dialCode: "230" },
  { iso2: "MX", name: "Mexico", dialCode: "52" },
  { iso2: "MD", name: "Moldova", dialCode: "373" },
  { iso2: "MC", name: "Monaco", dialCode: "377" },
  { iso2: "MN", name: "Mongolia", dialCode: "976" },
  { iso2: "ME", name: "Montenegro", dialCode: "382" },
  { iso2: "MA", name: "Morocco", dialCode: "212" },
  { iso2: "MM", name: "Myanmar", dialCode: "95" },
  { iso2: "NA", name: "Namibia", dialCode: "264" },
  { iso2: "NP", name: "Nepal", dialCode: "977" },
  { iso2: "NL", name: "Netherlands", dialCode: "31" },
  { iso2: "NZ", name: "New Zealand", dialCode: "64" },
  { iso2: "NG", name: "Nigeria", dialCode: "234" },
  { iso2: "NO", name: "Norway", dialCode: "47" },
  { iso2: "OM", name: "Oman", dialCode: "968" },
  { iso2: "PK", name: "Pakistan", dialCode: "92" },
  { iso2: "PA", name: "Panama", dialCode: "507" },
  { iso2: "PG", name: "Papua New Guinea", dialCode: "675" },
  { iso2: "PY", name: "Paraguay", dialCode: "595" },
  { iso2: "PE", name: "Peru", dialCode: "51" },
  { iso2: "PH", name: "Philippines", dialCode: "63" },
  { iso2: "PL", name: "Poland", dialCode: "48" },
  { iso2: "PT", name: "Portugal", dialCode: "351" },
  { iso2: "QA", name: "Qatar", dialCode: "974" },
  { iso2: "RO", name: "Romania", dialCode: "40" },
  { iso2: "RU", name: "Russia", dialCode: "7" },
  { iso2: "RW", name: "Rwanda", dialCode: "250" },
  { iso2: "SA", name: "Saudi Arabia", dialCode: "966" },
  { iso2: "RS", name: "Serbia", dialCode: "381" },
  { iso2: "SG", name: "Singapore", dialCode: "65" },
  { iso2: "SK", name: "Slovakia", dialCode: "421" },
  { iso2: "SI", name: "Slovenia", dialCode: "386" },
  { iso2: "ZA", name: "South Africa", dialCode: "27" },
  { iso2: "KR", name: "South Korea", dialCode: "82" },
  { iso2: "ES", name: "Spain", dialCode: "34" },
  { iso2: "LK", name: "Sri Lanka", dialCode: "94" },
  { iso2: "SE", name: "Sweden", dialCode: "46" },
  { iso2: "CH", name: "Switzerland", dialCode: "41" },
  { iso2: "TW", name: "Taiwan", dialCode: "886" },
  { iso2: "TZ", name: "Tanzania", dialCode: "255" },
  { iso2: "TH", name: "Thailand", dialCode: "66" },
  { iso2: "TN", name: "Tunisia", dialCode: "216" },
  { iso2: "TR", name: "Turkey", dialCode: "90" },
  { iso2: "UG", name: "Uganda", dialCode: "256" },
  { iso2: "UA", name: "Ukraine", dialCode: "380" },
  { iso2: "UY", name: "Uruguay", dialCode: "598" },
  { iso2: "UZ", name: "Uzbekistan", dialCode: "998" },
  { iso2: "VE", name: "Venezuela", dialCode: "58" },
  { iso2: "VN", name: "Vietnam", dialCode: "84" },
  { iso2: "YE", name: "Yemen", dialCode: "967" },
  { iso2: "ZM", name: "Zambia", dialCode: "260" },
  { iso2: "ZW", name: "Zimbabwe", dialCode: "263" },
];

const COUNTRY_BY_ISO2 = new Map(COUNTRIES.map((c) => [c.iso2, c]));

export function getCountry(iso2: string): Country {
  return COUNTRY_BY_ISO2.get(iso2) ?? COUNTRIES[0];
}

/** Renders an ISO 3166-1 alpha-2 code as its flag emoji via regional indicator symbols. */
export function flagEmoji(iso2: string): string {
  return iso2
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

interface SpecialRule {
  regex: RegExp;
  message: string;
  example: string;
}

const SPECIAL_RULES: Record<string, SpecialRule> = {
  IN: {
    regex: /^\+91[6-9]\d{9}$/,
    message: "India numbers must contain exactly 10 digits and start with 6, 7, 8, or 9",
    example: "98765 43210",
  },
  GB: {
    regex: /^\+44\d{9,10}$/,
    message: "UK number format is invalid",
    example: "7700 900123",
  },
  US: {
    regex: /^\+1[2-9]\d{9}$/,
    message: "Please enter a valid US phone number",
    example: "212 555 7890",
  },
  CA: {
    regex: /^\+1[2-9]\d{9}$/,
    message: "Please enter a valid Canadian phone number",
    example: "416 555 0123",
  },
  AE: {
    regex: /^\+9715[024568]\d{7}$/,
    message: "UAE mobile number is invalid",
    example: "50 123 4567",
  },
};

const GENERIC_REGEX = /^\+[1-9]\d{7,14}$/;
const GENERIC_EXAMPLE = "123 456 789";

export function examplePlaceholder(iso2: string): string {
  return SPECIAL_RULES[iso2]?.example ?? GENERIC_EXAMPLE;
}

export interface PhoneValidationResult {
  valid: boolean;
  /** null when the field is simply empty — callers decide whether that's an error (required vs optional) */
  error: string | null;
  /** E.164 value, or "" when there are no digits at all */
  e164: string;
}

/** `national` is the raw text typed into the number field — spaces/hyphens/parens are stripped before validation. */
export function validatePhone(iso2: string, national: string): PhoneValidationResult {
  const digits = national.replace(/\D/g, "");
  const country = getCountry(iso2);

  if (!digits) {
    return { valid: false, error: null, e164: "" };
  }

  const e164 = `+${country.dialCode}${digits}`;
  const totalDigits = country.dialCode.length + digits.length;

  if (totalDigits < 8) {
    return { valid: false, error: "Phone number is too short", e164 };
  }
  if (totalDigits > 15) {
    return { valid: false, error: "Phone number is too long", e164 };
  }

  const rule = SPECIAL_RULES[iso2];
  if (rule) {
    if (!rule.regex.test(e164)) {
      return { valid: false, error: rule.message, e164 };
    }
    return { valid: true, error: null, e164 };
  }

  if (!GENERIC_REGEX.test(e164)) {
    return { valid: false, error: "Please enter a valid phone number", e164 };
  }
  return { valid: true, error: null, e164 };
}

/** Server-side re-validation of an already-assembled E.164 string (no country context needed). */
export function isValidE164(value: string): boolean {
  const trimmed = value.trim();
  for (const [iso2, rule] of Object.entries(SPECIAL_RULES)) {
    const dialCode = getCountry(iso2).dialCode;
    if (trimmed.startsWith(`+${dialCode}`)) {
      if (rule.regex.test(trimmed)) return true;
    }
  }
  return GENERIC_REGEX.test(trimmed);
}

/** Best-effort guess at the country for an already-assembled E.164 number, longest dial code first. */
export function guessCountry(e164: string): Country | null {
  const trimmed = e164.trim();
  if (!trimmed.startsWith("+")) return null;
  const sorted = [...COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length);
  for (const country of sorted) {
    if (trimmed.startsWith(`+${country.dialCode}`)) return country;
  }
  return null;
}
