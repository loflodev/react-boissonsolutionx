// Static, decorative layers for section backgrounds. All aria-hidden and
// pointer-events-none; Section renders them behind its content.

const LAYER = "pointer-events-none absolute select-none";

// Fine film grain over the whole section, so flat ink reads as a material
export const Grain = () => (
  <div aria-hidden="true" className={`${LAYER} inset-0 decor-grain`} />
);

interface GlowProps {
  className: string;
  color: "brand" | "secondary";
}

// A soft pool of light, echoing the colored splashes in the photography
export const Glow = ({ className, color }: GlowProps) => (
  <div
    aria-hidden="true"
    className={`${LAYER} rounded-full blur-3xl ${
      color === "brand" ? "bg-brand/15" : "bg-secondary/10"
    } ${className}`}
  />
);

// Oversized outlined word, cropped by the section edge
export const Watermark = ({ text, className }: { text: string; className: string }) => (
  <p aria-hidden="true" className={`${LAYER} decor-watermark ${className}`}>
    {text}
  </p>
);

// Concentric hairline rings, like ripples from a drop, fading toward the edge
export const Rings = ({ className }: { className: string }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 800 800"
    fill="none"
    className={`${LAYER} decor-fade ${className}`}
  >
    {Array.from({ length: 9 }, (_, i) => (
      <circle
        key={i}
        cx="400"
        cy="400"
        r={60 + i * 42}
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray={i % 3 === 2 ? "2 6" : undefined}
      />
    ))}
    <circle cx="400" cy="400" r="6" fill="var(--color-secondary)" fillOpacity="0.6" />
  </svg>
);
