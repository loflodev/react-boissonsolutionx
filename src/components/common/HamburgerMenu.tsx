import { useState } from "react";
import type { Menu } from "../../type";

interface HamburgerMenuProps {
  menu: Menu[];
}

const HamburgerMenu = ({ menu }: HamburgerMenuProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      <div className="block md:hidden">
        <button
          className="cursor-pointer rounded-sm p-2 transition bg-gray-800 hover:bg-gray-100 text-white hover:text-gray-600"
          onClick={toggleMenu}
        >
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
      </div>

      {isOpen && (
        <div className="absolute top-20 left-[50%] w-screen h-[35vh] transform -translate-x-1/2 md:hidden bg-gray-900 opacity-95">
          <ul className="space-y-1 flex flex-col grow">
            {menu.map((item, index) => (
              <li key={`${item.name}-${index}`}>
                <a
                  href={item.link}
                  className="block px-8 py-2 text-lg font-medium hover:text-secondary text-gray-400"
                  onClick={toggleMenu}
                >
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default HamburgerMenu;
