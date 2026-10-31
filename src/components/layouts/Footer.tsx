import { ArrowUp } from "lucide-react";
import { useLocation } from "react-router-dom";
import { PRIVACY_PATH } from "../../entry-shared";
import { menu } from "../../menu";

const Footer = () => {
  const { pathname } = useLocation();

  return (
    <footer className="border-t border-line bg-ink">
      <div className="mx-auto max-w-6xl px-6 md:px-10 py-16">
        <div className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
          <a href="/#hero" className="block w-fit">
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
            href="#main"
          >
            <span className="sr-only">Retour en haut</span>
            <ArrowUp aria-hidden="true" className="size-4" />
          </a>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-line pt-8 text-sm md:flex-row md:items-center md:justify-between">
          <p className="text-cream/60">
            Copyright &copy; {new Date().getFullYear()} Boisson SolutionX. Tous droits réservés. Développé par{" "}
            <a className="underline underline-offset-4 hover:text-cream transition-colors" href="https://loflodev.com" target="_blank" rel="noopener">
              Louis Jr Florival
            </a>
          </p>

          <nav aria-label="Liens légaux">
            <a
              href={PRIVACY_PATH}
              aria-current={pathname === PRIVACY_PATH ? "page" : undefined}
              className="text-cream/70 underline-offset-4 hover:text-cream hover:underline transition-colors aria-[current=page]:text-secondary"
            >
              Politique de confidentialité
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
