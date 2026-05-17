/** Runs before paint to avoid a flash of the wrong theme. */
export default function ThemeInitScript() {
  const script = `(function(){try{var k="cc-theme";var t=localStorage.getItem(k);if(t!=="dark"&&t!=="light"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}document.documentElement.setAttribute("data-theme",t);document.documentElement.style.colorScheme=t;}catch(e){document.documentElement.setAttribute("data-theme","light");document.documentElement.style.colorScheme="light";}})();`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
