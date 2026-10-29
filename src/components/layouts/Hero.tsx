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
      className="w-full bg-cover bg-center bg-no-repeat relative overflow-hidden bg-[url(/bottles.webp)]"
      id="hero"
    >
      <div
        aria-hidden="true"
        className="absolute lg:hidden block inset-0 bg-black opacity-70 mt-20"
      ></div>
      {/* Main content */}
      <div className="min-h-screen relative z-10 flex items-center">
        <div className="container mx-auto px-8 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Bottles */}
            <div aria-hidden="true" className="flex justify-center lg:justify-start">
              <div className="relative">
                {/* Splash effects */}
                <div className="absolute -top-10 -left-10 w-32 h-32 opacity-30">
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-transparent rounded-full blur-xl"></div>
                </div>
                <div className="absolute top-20 -right-8 w-24 h-24 opacity-40">
                  <div className="w-full h-full bg-gradient-to-br from-orange-400 to-transparent rounded-full blur-lg"></div>
                </div>
              </div>
            </div>

            {/* Right side - Text content */}
            <div className="text-white space-y-6 lg:pl-8">
              <div className="space-y-2">
                <p className="text-red-500 text-2xl lg:text-3xl font-bold tracking-wide">
                  {heroData?.title}
                </p>
                <h1 className="text-white text-4xl lg:text-6xl font-bold leading-tight">
                  {heroData?.subtitle}
                </h1>
              </div>

              {heroData?.description && (
                <div
                  className="text-shadow "
                  dangerouslySetInnerHTML={{
                    __html: sanitize(heroData.description),
                  }}
                />
              )}

              <Button
                label="Découvrez Nos Produits"
                variant="secondary"
                fitContent={false}
                btnSize="2"
                btnClass="text-lg font-bold"
                asLink
                to="#ourProducts"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Additional decorative elements */}
      <div aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-orange-400 rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-blue-400 rounded-full opacity-80 animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-red-400 rounded-full opacity-40 animate-pulse delay-500"></div>
      </div>
    </section>
  );
};

export default Hero;
