import { useEffect, useState } from "react";

// Track which section sits under the header so the nav can answer "where am I?".
// Runs only in the browser (effects never run during the prerender).
const useActiveSection = (ids: string[]) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const idsKey = ids.join(",");

  useEffect(() => {
    const ids = idsKey.split(",");
    const observed = new Set<string>();

    // A thin band just below the header: whichever section crosses it is current
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-30% 0px -65% 0px" }
    );

    // CMS sections (hero, products) mount only once WordPress data arrives,
    // after this effect, so keep looking until every section has been found
    const observeNew = () => {
      ids.forEach((id) => {
        const el = document.getElementById(id);
        if (!el || observed.has(id)) return;
        observed.add(id);
        observer.observe(el);
      });
      if (observed.size === ids.length) mutations.disconnect();
    };
    const mutations = new MutationObserver(observeNew);
    mutations.observe(document.body, { childList: true, subtree: true });
    observeNew();

    return () => {
      mutations.disconnect();
      observer.disconnect();
    };
  }, [idsKey]);

  return activeId;
};

export default useActiveSection;
