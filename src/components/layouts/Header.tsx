// interface HeaderProps {}

import type { Menu } from "../../type";
import HamburgerMenu from "../common/HamburgerMenu";
import HeaderMenu from "../common/HeaderMenu";

const Header = () => {
  const menu: Menu[] = [
    {
      name: "Acceuil",
      link: "#",
    },
    {
      name: "Produits",
      link: "#",
    },
    {
      name: "À propos de nous",
      link: "#",
    },
    {
      name: "Où acheter",
      link: "#",
    },
  ];
  return (
    <header className="bg-gray-900">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-22 items-center justify-between">
          <div className="md:flex md:items-center md:gap-12">
            <a className="block text-teal-600 dark:text-teal-600" href="#">
              <span className="sr-only">Home</span>
              <img
                className="w-[180px] md:w-auto"
                src="/bsx-logo.webp"
                alt="Boisson Solution X Logo"
              />
            </a>
          </div>
          <HeaderMenu color="primary" menu={menu} />

          <div className="flex items-center gap-4 ml-12">
            <div className="sm:flex sm:gap-4">
              <a
                className="rounded-full bg-secondary px-8 py-2.5 text-lg font-medium text-dark shadow-sm dark:hover:bg-btn-hover"
                href="#"
              >
                Contact
              </a>
            </div>

            {/* <div className="block md:hidden">
              <button className="rounded-sm bg-gray-100 p-2 text-gray-600 transition hover:text-gray-600/75 dark:bg-gray-800 dark:text-white dark:hover:text-white/75">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div> */}
            <HamburgerMenu menu={menu} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
