import type { ReactNode, Ref } from "react";

type ColorVariants = "dark" | "white" | "lightgray";

interface SectionProps {
  children: ReactNode;
  backgroundColor: ColorVariants;
  sectionTitle?: string;
  fullVh?: boolean;
  id?: string;
  ref?: Ref<HTMLElement>;
}

const Section = ({
  children,
  sectionTitle,
  backgroundColor,
  fullVh = false,
  id,
  ref,
}: SectionProps) => {
  const bgcolors: Record<ColorVariants, string> = {
    dark: "bg-gray-900",
    white: "white",
    lightgray: "bg-[#F9FAFB]",
  };

  const secTitleColors: Record<ColorVariants, string> = {
    dark: "text-white",
    white: "text-[#000]",
    lightgray: "text-[#000]",
  };

  const hScreen = fullVh ? "h-screen" : "";
  return (
    <section
      className={`flex items-center md:px-30 px-4 md:py-42 py-16 ${bgcolors[backgroundColor]} ${hScreen}`}
      id={id}
      ref={ref}
    >
      <div className="grow">
        {sectionTitle && (
          <h2
            className={`${secTitleColors[backgroundColor]} text-2xl lg:text-3xl font-bold tracking-wide text-center mb-22`}
          >
            {sectionTitle}
          </h2>
        )}
        {children}
      </div>
    </section>
  );
};

export default Section;
