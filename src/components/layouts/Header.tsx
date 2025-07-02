import { useNavigate } from "react-router-dom";
import type { Menu } from "../../type";
import Button from "../common/Button";
import HamburgerMenu from "../common/HamburgerMenu";
import HeaderMenu from "../common/HeaderMenu";
import HeaderLogo from "../common/HearderLogo";

const Header = () => {
  const navigate = useNavigate();

  const menu: Menu[] = [
    {
      name: "Acceuil",
      link: "#",
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

  const handleClick = () => {
    navigate("/#contactForm");
    const section = document.getElementById("contactForm");
    if (section) {
      section.scrollIntoView({ behavior: "instant" });
    }
  };

  return (
    <header className="bg-gray-900 fixed top-0 left-0 w-full z-50 opacity-95">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="flex py-4 items-center justify-between">
          <HeaderLogo alt="Boissson SolutionX" link="#" logo="/bsx-logo.webp" />
          <HeaderMenu color="primary" menu={menu} />

          <div className="flex items-center gap-4 ml-12">
            <Button label="Contact" variant="primary" onClick={handleClick} />
            <HamburgerMenu menu={menu} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
