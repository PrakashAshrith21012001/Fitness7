/**
 * Runs before first paint so the chosen theme never flashes.
 * Light is the default; a saved choice (the toggle in the nav) overrides it.
 */
const script = `
(function(){try{
  var s=null;try{s=localStorage.getItem('f7-theme')}catch(e){}
  var t=(s==='light'||s==='dark')?s:'light';
  document.documentElement.setAttribute('data-theme',t);
}catch(e){document.documentElement.setAttribute('data-theme','light')}})();
`;
export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
