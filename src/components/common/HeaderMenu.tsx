import type { Menu } from "../../type";

type TextColorType = "primary";

interface HeaderMenuProps {
  color: TextColorType;
  menu: Menu[];
}

const HeaderMenu = ({ color, menu }: HeaderMenuProps) => {
  const colorOptions: Record<TextColorType, string> = {
    primary: "hover:text-gray-500/75 text-white",
  };

  return (
    <div className="hidden md:block ml-auto">
      <nav aria-label="Global">
        <ul className="flex items-center gap-12 text-sm">
          {menu.map((item, index) => (
            <li key={`${item.name}-${index}`}>
              <a
                className={`${colorOptions[color]} transition`}
                href={item.link}
              >
                {item.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default HeaderMenu;
