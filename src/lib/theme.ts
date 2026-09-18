export const THEME_STORAGE_KEY = "mod-app-theme";

/**
 * Runs synchronously before paint (see the inline <script> in
 * src/app/layout.tsx) so the correct theme applies immediately — no
 * flash of the wrong theme on load. Defaults to dark (this site's base
 * look) unless the visitor has explicitly chosen light before.
 */
export const themeInitScript = `
(function () {
  try {
    var theme = localStorage.getItem("${THEME_STORAGE_KEY}");
    if (theme === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    }
  } catch (e) {}
})();
`;
