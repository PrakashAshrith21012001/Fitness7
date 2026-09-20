/**
 * Runs before first paint so the chosen theme never flashes.
 * Saved choice wins; otherwise the OS preference; otherwise dark.
 */
const script = `
(function(){try{
  var s=null;try{s=localStorage.getItem('f7-theme')}catch(e){}
  var t=s||(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');
  document.documentElement.setAttribute('data-theme',t);
}catch(e){document.documentElement.setAttribute('data-theme','dark')}})();
`;
export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
