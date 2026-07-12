# Modernize Cryptocurrency Tracker — Design

Date: 2026-07-12

## Context

This is a small (~14 file) client-only React app built 3 years ago with Create React App (`react-scripts` 5), MUI v5, react-router v6, axios, and Chart.js. It fetches public CoinGecko API data and displays a coin table, per-coin detail page, and a trending carousel. `react-scripts` is now unmaintained upstream; the app also has some real bugs and repeated logic worth cleaning up while touching this code. The app stays as JavaScript (no TypeScript conversion), per user decision.

## Goals

1. Replace CRA/`react-scripts` with Vite.
2. Update dependencies (React, MUI, router, axios, chart.js, dompurify, react-alice-carousel) to current stable versions; drop unused packages.
3. Add modern lint/format tooling (ESLint flat config + Prettier).
4. Clean up React patterns: shared theme, hoisted `styled()` calls, a shared data-fetching hook, consistent error handling, and fix two real bugs (pagination rounding, search not resetting page).
5. Add a Vitest + React Testing Library test setup with a first batch of tests.

## Non-goals

- No TypeScript conversion.
- No SSR / Next.js migration.
- No new features or visual redesign — behavior and look stay the same except for bug fixes explicitly listed below.
- No backend/API changes (still calls CoinGecko public API directly, client-side).

## 1. Build tooling: CRA → Vite

- Add `vite`, `@vitejs/plugin-react` as dev dependencies; remove `react-scripts`, `web-vitals`.
- Move `public/index.html` to project root `index.html`, update to Vite's module script entry (`<script type="module" src="/src/main.jsx">`).
- Rename `src/index.js` → `src/main.jsx`. All files containing JSX get a `.jsx` extension (Vite requires this without extra esbuild config); plain-logic files (`config/api.js`, `config/Chartdata.js`) stay `.js`.
- `vite.config.js` at project root with the React plugin.
- `package.json` scripts:
  - `dev`: `vite`
  - `build`: `vite build`
  - `preview`: `vite preview`
  - `test`: `vitest run`
- No env vars currently in use (`config/api.js` calls CoinGecko URLs directly with no `REACT_APP_*` prefix), so no `VITE_`-prefix migration is needed.
- `browserslist` config in `package.json` is CRA-specific and gets removed (Vite uses `esbuild`/`target` in `vite.config.js` instead, default target is fine for this app).

## 2. Dependency updates

- React/ReactDOM: bump within 18.x latest (not 19, to avoid MUI/testing-library churn).
- `@mui/material`, `@mui/system`: v5 → latest v6.
- `@emotion/react`, `@emotion/styled`: latest (MUI v6 peer requirement).
- `@mui/lab`: **removed** — not imported anywhere in `src/`.
- `react-router-dom`: v6 → latest v7 (declarative `<BrowserRouter>/<Routes>/<Route>` usage is unaffected by v7's opt-in data APIs).
- `axios`, `chart.js`, `react-chartjs-2`, `dompurify`, `react-alice-carousel`: bump to latest stable.
- Dev deps added: `vitest`, `@testing-library/jest-dom` (keep, already present), `jsdom`, `eslint` + plugins, `prettier`.
- `@testing-library/user-event` stays but bump to latest major.

## 3. Code quality tooling

- `eslint.config.js` (flat config): `@eslint/js` recommended + `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`.
- `.prettierrc` with project-standard formatting (2-space, single quotes to match existing style, no semi-colons debatable — keep semicolons since most files already use them).
- `eslint-config-prettier` to disable stylistic ESLint rules that conflict with Prettier.
- `.editorconfig` for consistent line endings/indentation.
- Remove the old CRA `eslintConfig` block from `package.json`.

## 4. React pattern cleanup

These are concrete issues found while reading the current code:

- **Duplicated theme**: `darkTheme` (identical `createTheme` call) is redefined inside `Header`, `CoinsTable`, and `CoinInfo`. Consolidate into one `src/theme.js`, and wrap the whole app once in `App.js` with a single `<ThemeProvider>`. Remove the per-component `ThemeProvider`/`createTheme` calls.
- **`styled()` defined inside component bodies**: `SelectButton`'s inner `SelectButton` styled-span, `CoinInfo`'s `Container`, and `CP`'s `StyledDiv`/`SidebarDiv`/`MarketDataDiv` are all recreated on every render. Hoist all of these to module scope (outside the component function), parameterizing with props (e.g. `selected`) via the styled-function's prop callback as already done for `SelectButton`.
- **Repeated data-fetching boilerplate**: `Carousel`, `CoinsTable`, `CP`, and `CoinInfo` each hand-roll `useState` + `useEffect` + `axios.get`. Extract `src/hooks/useFetch.js`:
  ```js
  function useFetch(url, deps) {
    // returns { data, loading, error }
  }
  ```
  Each of the four call sites is refactored to use it. `CoinInfo`'s chart-creation `useEffect` stays separate (it's not itself a fetch), but consumes `data`/`loading` from the hook instead of its own hand-rolled state.
- **No error handling**: currently a failed CoinGecko request just leaves the UI stuck in `loading` state forever or shows stale/empty data. `useFetch` returns an `error`; each consuming component renders a simple inline "Something went wrong, try again" message (MUI `Typography`, matching existing dark theme) when `error` is set. No retry/backoff logic — out of scope.
- **Pagination bug**: `CoinsTable`'s `<Pagination count={(handleSearch()?.length / 10).toFixed(0)} />` rounds to nearest page count instead of ceiling — e.g. 24 filtered results rounds to "2" pages, hiding results 21–24. Fix: `Math.ceil(handleSearch().length / 10)`.
- **Search doesn't reset page**: typing a new search query while on page 2+ can leave the user on an out-of-range page showing nothing. Fix: reset `page` to `1` in the `onChange` handler for the search `TextField`.
- **Duplicated `numberWithCommas`**: defined separately (with slightly different implementations — `CP`'s version also does `parseFloat`/`NaN` guarding) in `CoinsTable`, `CP`, and `Carousel`. Consolidate into `src/utils/formatNumber.js` using the more defensive `CP` version (parseFloat + NaN guard) as the canonical implementation, and update all three call sites to import it.
- **Stray `console.log`s**: remove the debug logs in `Header.js` (`console.log(currency)`) and `CoinsTable.js` (`console.log(coins)`).

## 5. Testing

- Replace CRA's built-in Jest/RTL wiring with Vitest: `vitest.config.js` (or merged into `vite.config.js`) with `environment: 'jsdom'`, `setupFiles` pointing at a small `src/setupTests.js` that imports `@testing-library/jest-dom`.
- First test batch (establishing the pattern, not full coverage):
  - `src/utils/formatNumber.test.js` — unit tests for comma formatting and the NaN-guard path.
  - `src/config/api.test.js` — unit tests that the URL builder functions interpolate currency/id/days correctly.
  - `src/hooks/useFetch.test.js` — mocks `axios`, asserts loading → data and loading → error transitions.
  - `src/components/Header.test.jsx` — renders with a test `CryptoContext` wrapper, asserts changing the currency `Select` updates context.
  - `src/components/CoinsTable.test.jsx` — mocks `axios.get` to return a small fixed coin list, asserts rows render and the search box filters them.

## Testing/verification for this migration itself

- `npm run dev` boots and the app loads at `/` and `/coins/:id` without console errors.
- `npm run build && npm run preview` produces a working production build.
- `npm run lint` passes.
- `npm test` (vitest run) passes.
- Manual check: currency switch (USD/INR), search + pagination edge case (a search producing a non-multiple-of-10 result count), and the trending carousel still work visually.
