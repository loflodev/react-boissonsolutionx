import { ArrowUp } from "lucide-react";
import { menu } from "../../menu";

const Footer = () => {
  return (
    <footer className="border-t border-line bg-ink">
      <div className="mx-auto max-w-6xl px-6 md:px-10 py-16">
        <div className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
          <a href="#hero" className="block w-fit">
            <img
              src="/bsx-logo.webp"
              alt="Boisson SolutionX – Accueil"
              width={229}
              height={84}
              loading="lazy"
              decoding="async"
              className="w-[150px] h-auto"
            />
          </a>

          <nav aria-label="Navigation du pied de page">
            <ul className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
              {menu.map((item) => (
                <li key={item.link}>
                  <a
                    href={item.link}
                    className="text-cream/70 hover:text-cream transition-colors"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <a
            className="grid size-11 place-items-center rounded-full border border-white/15 bg-white/[0.04] text-cream transition-[scale,background-color] duration-150 ease-out hover:bg-white/[0.08] motion-safe:active:scale-[0.94]"
            href="#hero"
          >
            <span className="sr-only">Retour en haut</span>
            <ArrowUp aria-hidden="true" className="size-4" />
          </a>
        </div>

        <p className="mt-12 border-t border-line pt-8 text-sm text-cream/60">
          Copyright &copy; {new Date().getFullYear()} Boisson SolutionX. Tous droits réservés. Développé par{" "}
          <a className="underline underline-offset-4 hover:text-cream transition-colors" href="https://www.instagram.com/louis_thereborn" target="_blank" rel="noopener noreferrer">
            Louis Jr Florival
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
