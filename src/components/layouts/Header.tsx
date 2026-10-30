import { useEffect, useState } from "react";
import useActiveSection from "../../hooks/useActiveSection";
import { menu } from "../../menu";
import Button from "../common/Button";
import HamburgerMenu from "../common/HamburgerMenu";
import HeaderMenu from "../common/HeaderMenu";
import HeaderLogo from "../common/HearderLogo";

const sectionIds = menu.map((item) => item.link.slice(1));

const SCROLLED_THRESHOLD_PX = 24;

// True once the page has scrolled enough for content to sit under the header
const useHasScrolled = () => {
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const update = () => setHasScrolled(window.scrollY > SCROLLED_THRESHOLD_PX);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return hasScrolled;
};

const Header = () => {
  const activeId = useActiveSection(sectionIds);
  const activeLink = activeId ? `#${activeId}` : null;
  const hasScrolled = useHasScrolled();
  // The open menu hangs from the bar, so the bar must be material too
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header
      className="material-chrome fixed top-0 left-0 w-full z-50"
      data-scrolled={hasScrolled || isMenuOpen}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-dark"
      >
        Aller au contenu
      </a>
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <div className="flex py-3 items-center justify-between">
          <HeaderLogo alt="Boisson SolutionX – Accueil" link="#hero" logo="/bsx-logo.webp" />
          <HeaderMenu color="primary" menu={menu} activeLink={activeLink} />

          <div className="flex items-center gap-3 ml-10">
            <Button label="Contact" variant="primary" size="sm" asLink to="#contactForm" />
            <HamburgerMenu menu={menu} activeLink={activeLink} onOpenChange={setIsMenuOpen} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
