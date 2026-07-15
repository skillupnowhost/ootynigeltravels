type IconProps = { size?: number; className?: string };

export function InstagramIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
    </svg>
  );
}

export function FacebookIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M14.5 8.5H16.5V5.3C16.16 5.25 15 5.15 13.65 5.15C10.83 5.15 8.9 6.88 8.9 10.03V12.7H5.8V16.27H8.9V22H12.6V16.27H15.68L16.16 12.7H12.6V10.4C12.6 9.36 12.88 8.5 14.5 8.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The WhatsApp "phone handset in a speech bubble" mark, single-color (currentColor) —
 * designed to sit directly on the brand-green circular button, matching how the previous
 * lucide MessageCircle icon was used there. */
export function WhatsAppGlyphIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12.02 2.5a9.48 9.48 0 0 0-8.2 14.24L2.5 21.5l4.9-1.28a9.48 9.48 0 1 0 4.62-17.72Zm0 1.7a7.77 7.77 0 0 1 6.7 11.7 7.77 7.77 0 0 1-11.9 2.05l-.28-.24-2.9.76.77-2.83-.25-.29A7.77 7.77 0 0 1 12.02 4.2Z" />
      <path d="M9.1 7.4c-.22-.5-.4-.5-.6-.51h-.5c-.18 0-.46.07-.7.32-.24.25-.92.9-.92 2.2 0 1.3.94 2.55 1.07 2.72.13.18 1.83 2.9 4.5 4 2.2.92 2.9.75 3.4.7.7-.07 2.25-.92 2.57-1.82.31-.9.31-1.66.22-1.82-.09-.15-.33-.25-.7-.44-.36-.18-2.16-1.06-2.5-1.18-.33-.12-.57-.18-.82.18-.24.36-.93 1.18-1.14 1.42-.21.24-.42.27-.78.09-.36-.18-1.53-.56-2.9-1.8-1.08-.96-1.8-2.14-2.02-2.5-.2-.36-.02-.55.16-.73.16-.16.36-.42.54-.63.18-.2.24-.36.36-.6.12-.24.06-.45-.03-.63-.09-.18-.79-1.98-1.1-2.7Z" />
    </svg>
  );
}

export function YoutubeIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="2.5" y="6" width="19" height="12" rx="4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10.5 9.5L15 12L10.5 14.5V9.5Z" fill="currentColor" />
    </svg>
  );
}

export function TelegramIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M21.5 3.5 2.7 10.9c-1.2.47-1.2 1.13-.22 1.43l4.8 1.5 1.86 5.66c.22.62.38.86.78.86.32 0 .47-.15.65-.33l1.86-1.8 3.87 2.86c.71.4 1.22.19 1.4-.66l2.53-11.9c.28-1.13-.3-1.6-1.15-1.27ZM8.7 14.15l9.3-5.87c.44-.27.84-.12.51.18l-7.95 7.17-.31 3.36-1.4-4.34Z" />
    </svg>
  );
}
