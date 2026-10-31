import type { Menu } from "./type";

// Shared by the header, mobile menu and footer. Rooted at "/" so they also
// lead back to the home sections from other pages (on "/" they only scroll)
export const menu: Menu[] = [
  {
    name: "Accueil",
    link: "/#hero",
  },
  {
    name: "Produits",
    link: "/#ourProducts",
  },
  {
    name: "À propos de nous",
    link: "/#about",
  },
  {
    name: "Où acheter",
    link: "/#contact",
  },
];
