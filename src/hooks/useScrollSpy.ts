import { useEffect, useState } from "react";

// Share of the viewport, from the top, where a section counts as "being read"
const READING_LINE = 0.3;

// Which of `ids` is being read: the last one whose top has scrolled above the
// reading line. Unlike useActiveSection's thin band, this stays right between
// short headings and when scrolling back up. At the very bottom the last id
// wins, since a short final section may never reach the line.
// Runs only in the browser (effects never run during the prerender).
const useScrollSpy = (ids: string[]) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const idsKey = ids.join(",");

  useEffect(() => {
    const ids = idsKey.split(",").filter(Boolean);
    let frame = 0;

    const update = () => {
      frame = 0;
      const line = window.innerHeight * READING_LINE;
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;

      let current: string | null = null;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      setActiveId(atBottom && current ? ids[ids.length - 1] : current);
    };

    // At most one measure per frame, however fast the scroll events come
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [idsKey]);

  return activeId;
};

export default useScrollSpy;
