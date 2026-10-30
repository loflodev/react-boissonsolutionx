import type { ReactNode, Ref } from "react";
import Reveal from "./Reveal";

type SectionTone = "base" | "raised";

interface SectionProps {
  children: ReactNode;
  tone?: SectionTone;
  eyebrow?: string;
  sectionTitle?: string;
  // Decorative background layers (see Decor.tsx), drawn behind the content
  decor?: ReactNode;
  id?: string;
  ref?: Ref<HTMLElement>;
}

// Alternating ink tones give the page rhythm without breaking the dark mood
const TONE_CLASSES: Record<SectionTone, string> = {
  base: "bg-ink",
  raised: "bg-ink-raised",
};

const Section = ({
  children,
  tone = "base",
  eyebrow,
  sectionTitle,
  decor,
  id,
  ref,
}: SectionProps) => {
  return (
    <section
      className={`relative isolate overflow-hidden border-t border-line py-24 md:py-36 ${TONE_CLASSES[tone]}`}
      id={id}
      ref={ref}
    >
      {decor && <div className="absolute inset-0 -z-10">{decor}</div>}
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        {(eyebrow || sectionTitle) && (
          <Reveal className="mb-14 md:mb-20 max-w-3xl">
            {eyebrow && <p className="eyebrow mb-5">{eyebrow}</p>}
            {sectionTitle && (
              <h2 className="display text-cream text-[clamp(2.25rem,4.5vw,3.5rem)]">
                {sectionTitle}
              </h2>
            )}
          </Reveal>
        )}
        {children}
      </div>
    </section>
  );
};

export default Section;
