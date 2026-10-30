import type { Menu } from "../../type";

type TextColorType = "primary";

interface HeaderMenuProps {
  color: TextColorType;
  menu: Menu[];
  activeLink: string | null;
}

const HeaderMenu = ({ color, menu, activeLink }: HeaderMenuProps) => {
  const colorOptions: Record<TextColorType, string> = {
    primary: "hover:text-secondary text-white",
  };

  return (
    <div className="hidden md:block ml-auto">
      <nav aria-label="Navigation principale">
        <ul className="flex items-center gap-12 text-sm">
          {menu.map((item, index) => {
            const isActive = item.link === activeLink;
            return (
              <li key={`${item.name}-${index}`}>
                <a
                  className={`${isActive ? "text-secondary" : colorOptions[color]} transition-colors`}
                  href={item.link}
                  aria-current={isActive ? "true" : undefined}
                >
                  {item.name}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default HeaderMenu;
