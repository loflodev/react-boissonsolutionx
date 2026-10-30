interface HeroProps {
  heroData: HeroSection | undefined;
}
import DOMPurify from "dompurify";
import Button from "../common/Button";
import type { HeroSection } from "../../type";

// DOMPurify needs a DOM; during the build-time prerender the HTML comes
// straight from our own WordPress, so it is passed through as-is there
const sanitize = (html: string) =>
  typeof window === "undefined" ? html : DOMPurify.sanitize(html);

const Hero = ({ heroData }: HeroProps) => {
  return (
    <section
      className="relative isolate w-full min-h-svh overflow-hidden bg-ink bg-[url(/bottles.webp)] bg-cover bg-[position:30%_top] lg:bg-left bg-no-repeat"
      id="hero"
    >
      {/* Scrims: the bottles sit left, so the text side darkens on desktop;
          on mobile the copy sits under the bottles, so it darkens from below
          (strong enough at 60% for the small eyebrow over the orange bottle) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-t from-ink from-35% via-ink/90 via-60% to-ink/10 lg:bg-gradient-to-l lg:from-ink lg:from-30% lg:via-ink/80 lg:via-50% lg:to-transparent lg:to-75%"
      ></div>
      {/* The header is clear over the hero: keep its links off the splashes */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-32 bg-gradient-to-b from-ink/85 to-transparent"
      ></div>
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-ink to-transparent"
      ></div>

      <div className="mx-auto flex min-h-svh max-w-6xl items-end lg:items-center px-6 md:px-10 pt-32 pb-20 lg:py-0">
        <div className="w-full lg:w-1/2 lg:ml-auto space-y-8">
          <div className="space-y-4">
            <p className="eyebrow">{heroData?.title}</p>
            <h1 className="display text-cream text-[clamp(3.25rem,8vw,6.5rem)]">
              {heroData?.subtitle}
            </h1>
          </div>

          {heroData?.description && (
            <div
              className="max-w-prose text-muted text-lg leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: sanitize(heroData.description),
              }}
            />
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              label="Découvrez nos produits"
              variant="primary"
              size="lg"
              withArrow
              asLink
              to="#ourProducts"
            />
            <Button
              label="Où acheter"
              variant="secondary"
              size="lg"
              asLink
              to="#contact"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
