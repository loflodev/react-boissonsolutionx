import { useEffect, useRef, useState } from "react";
import type { Menu } from "../../type";

interface HamburgerMenuProps {
  menu: Menu[];
  activeLink: string | null;
}

const MOBILE_MENU_ID = "mobile-menu";

const HamburgerMenu = ({ menu, activeLink }: HamburgerMenuProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  // Close with Escape, or by pressing anywhere outside the menu and its button
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (navRef.current?.contains(target)) return;
      if (buttonRef.current?.contains(target)) return;
      setIsOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen]);

  return (
    <>
      <div className="block md:hidden">
        <button
          ref={buttonRef}
          type="button"
          className="cursor-pointer rounded-sm p-2 bg-gray-800 hover:bg-gray-100 text-white hover:text-gray-600 transition-[scale,background-color,color] duration-100 ease-out active:scale-[0.94]"
          aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={isOpen}
          aria-controls={MOBILE_MENU_ID}
          onClick={toggleMenu}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="size-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d={isOpen ? "M6 6l12 12M6 18L18 6" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>
      </div>

      {/* Always mounted so opening and closing travel the same path, and a
          toggle mid-transition reverses from wherever the menu currently is */}
      <nav
        ref={navRef}
        id={MOBILE_MENU_ID}
        aria-label="Menu mobile"
        inert={!isOpen}
        data-open={isOpen}
        className="material-chrome isolate absolute top-full left-0 w-full md:hidden origin-top py-4 transition-[translate,opacity] duration-200 ease-out -translate-y-2 opacity-0 pointer-events-none data-[open=true]:translate-y-0 data-[open=true]:opacity-100 data-[open=true]:pointer-events-auto"
      >
        <ul className="space-y-1 flex flex-col grow">
          {menu.map((item, index) => {
            const isActive = item.link === activeLink;
            return (
              <li key={`${item.name}-${index}`}>
                <a
                  href={item.link}
                  className={`block px-8 py-3 text-lg font-medium hover:text-secondary transition-colors ${isActive ? "text-secondary" : "text-gray-200"}`}
                  aria-current={isActive ? "true" : undefined}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
};

export default HamburgerMenu;
