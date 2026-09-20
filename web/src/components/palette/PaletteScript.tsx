/**
 * Runs before first paint so a chosen palette never flashes the default.
 * Order of precedence: ?palette= in the URL → saved choice → "volt".
 */
const script = `
(function(){try{
  var q=new URLSearchParams(location.search).get('palette');
  var s=null;try{s=localStorage.getItem('f7-palette')}catch(e){}
  var p=q||s||'volt';
  if(q){try{localStorage.setItem('f7-palette',q)}catch(e){}}
  if(p!=='volt')document.documentElement.setAttribute('data-palette',p);
}catch(e){}})();
`;

export function PaletteScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
