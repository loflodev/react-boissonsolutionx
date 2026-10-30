import useActiveSection from "../../hooks/useActiveSection";
import type { Menu } from "../../type";
import Button from "../common/Button";
import HamburgerMenu from "../common/HamburgerMenu";
import HeaderMenu from "../common/HeaderMenu";
import HeaderLogo from "../common/HearderLogo";

const menu: Menu[] = [
  {
    name: "Accueil",
    link: "#hero",
  },
  {
    name: "Produits",
    link: "#ourProducts",
  },
  {
    name: "À propos de nous",
    link: "#about",
  },
  {
    name: "Où acheter",
    link: "#contact",
  },
];

const sectionIds = menu.map((item) => item.link.slice(1));

const Header = () => {
  const activeId = useActiveSection(sectionIds);
  const activeLink = activeId ? `#${activeId}` : null;

  return (
    <header className="material-chrome fixed top-0 left-0 w-full z-50">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-dark"
      >
        Aller au contenu
      </a>
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="flex py-4 items-center justify-between">
          <HeaderLogo alt="Boisson SolutionX – Accueil" link="#hero" logo="/bsx-logo.webp" />
          <HeaderMenu color="primary" menu={menu} activeLink={activeLink} />

          <div className="flex items-center gap-4 ml-12">
            <Button label="Contact" variant="primary" asLink to="#contactForm" />
            <HamburgerMenu menu={menu} activeLink={activeLink} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
