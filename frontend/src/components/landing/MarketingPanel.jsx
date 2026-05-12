/** Left strip: full-bleed artwork + dark blue gradient (no blur). */
const BG = "/marketing/landing-bg.png";

const bgStyle = {
  backgroundImage: `url(${BG})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
};

export default function MarketingPanel({ children, className = "" }) {
  return (
    <div className={`relative min-h-[280px] overflow-hidden ${className}`} style={bgStyle}>
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0a1931]/90 via-[#0b1535]/78 to-[#0f2744]/82"
        aria-hidden
      />
      <div className="relative z-10 flex h-full min-h-[inherit] flex-col">{children}</div>
    </div>
  );
}
