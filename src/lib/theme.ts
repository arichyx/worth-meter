export type Theme = 'light' | 'dark' | 'system';

export const THEME_COOKIE_NAME = 'worth-meter-theme';
export const DEFAULT_THEME: Theme = 'system';

export const THEME_OPTIONS: { value: Theme; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'system', label: 'System' },
  { value: 'dark', label: 'Dark' },
];

export function isValidTheme(v: string | null | undefined): v is Theme {
  return v === 'light' || v === 'dark' || v === 'system';
}

/**
 * The SSR className for <html>. 'system' and unknown values fall back to dark
 * on the server (first-impression impact); the inline client script refines to
 * prefers-color-scheme before first paint, so there is no flash of wrong theme.
 */
export function htmlThemeClass(theme: Theme | null): string {
  return theme === 'light' ? '' : 'dark';
}

/**
 * Inline, synchronous, runs during HTML parse (before paint). Resolves the
 * stored cookie -> prefers-color-scheme -> dark fallback, and sets the `dark`
 * class on <html>. Kept dependency-free and tiny. Any error is swallowed so it
 * can never block rendering.
 */
export const THEME_INIT_SCRIPT = [
  '(function(){try{',
  `var n='${THEME_COOKIE_NAME}';`,
  "var t='',s=document.cookie.split(';');",
  'for(var i=0;i<s.length;i++){var p=s[i].trim();if(p.indexOf(n+"=")===0){t=decodeURIComponent(p.slice(n.length+1));break}}',
  "var dark=t==='dark'||((t===''||t==='system')&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches);",
  'document.documentElement.classList.toggle("dark",!!dark);',
  '}catch(e){}})();',
].join('');
