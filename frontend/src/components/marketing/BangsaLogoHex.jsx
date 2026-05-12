/** White hex mark with house motif (marketing mockups). */
export default function BangsaLogoHex({ className = "h-14 w-14" }) {
  return (
    <svg className={className} viewBox="0 0 56 56" aria-hidden>
      <polygon points="28,2 51,16.5 51,39.5 28,54 5,39.5 5,16.5" fill="white" />
      <path
        fill="#1d4ed8"
        d="M28 17l-9 6.5h3.5V38h11V23.5H37L28 17zm-3.5 9.5h7v8h-7v-8z"
      />
    </svg>
  );
}
