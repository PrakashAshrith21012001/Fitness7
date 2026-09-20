/**
 * Runs before first paint so the chosen theme never flashes.
 * Dark is the brand's default; only a saved choice overrides it.
 */
const script = `
(function(){try{
  var s=null;try{s=localStorage.getItem('f7-theme')}catch(e){}
  var t=(s==='light'||s==='dark')?s:'dark';
  document.documentElement.setAttribute('data-theme',t);
}catch(e){document.documentElement.setAttribute('data-theme','dark')}})();
`;
export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
