// interface HeroProps {}

import Button from "../common/Button";

const Hero = () => {
  return (
    <section
      className="w-full bg-cover bg-center bg-no-repeat relative overflow-hidden bg-[url(/herobg.png)]"
      id="hero"
    >
      <div className="absolute lg:hidden block inset-0 bg-black opacity-70 mt-20"></div>
      {/* Main content */}
      <div className="min-h-screen relative z-10 flex items-center">
        <div className="container mx-auto px-8 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Bottles */}
            <div className="flex justify-center lg:justify-start">
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
                <h1 className="text-red-500 text-2xl lg:text-3xl font-bold tracking-wide">
                  LA BOISSON
                </h1>
                <h2 className="text-white text-4xl lg:text-6xl font-bold leading-tight">
                  DES PUISSANTS
                </h2>
              </div>

              <p className="text-gray-200 text-lg lg:text-xl leading-relaxed max-w-lg">
                <strong className="text-secondary">Boisson SolutionX </strong>
                vise à offrir un coup de pouce énergétique plus sain, tout en
                améliorant la vigilance et la performance physique, et en
                soutenant le bien-être à long terme.
              </p>

              <Button
                label="Découvrez Notre Produit"
                variant="secondary"
                fitContent={false}
                btnSize="2"
                btnClass="text-lg font-bold"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Additional decorative elements */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-orange-400 rounded-full opacity-60 animate-pulse"></div>
      <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-blue-400 rounded-full opacity-80 animate-pulse delay-1000"></div>
      <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-red-400 rounded-full opacity-40 animate-pulse delay-500"></div>
    </section>
  );
};

export default Hero;
