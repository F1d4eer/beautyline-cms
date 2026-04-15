/**
 * Returns a scrollTo function that smoothly scrolls to an anchor section,
 * accounting for the fixed header height automatically.
 */
export const useSmoothScroll = () => {
  const scrollTo = (href: string) => {
    const id = href.startsWith("#") ? href.slice(1) : href;
    const target = document.getElementById(id);
    if (!target) return;

    const header = document.querySelector("header");
    const offset = header ? header.offsetHeight + 8 : 80;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({ top, behavior: "smooth" });
  };

  return scrollTo;
};
