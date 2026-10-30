import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  // Position in a group, used to stagger siblings (80ms each)
  index?: number;
  className?: string;
  as?: "div" | "li";
}

// Fades and lifts its content into place the first time it scrolls into view.
// The hidden state only applies under html.js-reveal (see index.css)
const Reveal = ({ children, index = 0, className, as: Tag = "div" }: RevealProps) => {
  const ref = useRef<HTMLDivElement & HTMLLIElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      data-reveal=""
      data-visible={isVisible}
      className={className}
      style={{ "--i": index } as CSSProperties}
    >
      {children}
    </Tag>
  );
};

export default Reveal;
