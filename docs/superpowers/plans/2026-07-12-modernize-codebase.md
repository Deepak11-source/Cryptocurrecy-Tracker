# Modernize Cryptocurrency Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate this CRA-based crypto tracker to Vite, bump every dependency to current stable, add ESLint/Prettier/Vitest tooling, and fix the real bugs/duplication found in the existing code — with no behavior or visual changes beyond the bug fixes.

**Architecture:** Same component tree and routing as today (`App` → `Header` + `Routes` → `Homepage`/`CP`). The only structural additions are `src/theme.js` (one shared MUI theme), `src/hooks/useFetch.js` (one shared data-fetching hook consumed by `Carousel`, `CoinsTable`, `CP`, `CoinInfo`), and `src/utils/formatNumber.js` (one shared number formatter). Build/test tooling moves from `react-scripts` to Vite + Vitest.

**Tech Stack:** React 18.3, MUI 9, react-router-dom 7, Vite 8, Vitest 4 + @testing-library/react 16, ESLint 10 (flat config) + Prettier 3.

## Global Constraints

- Stay on JavaScript — no TypeScript conversion (per approved design).
- Stay on React `^18.3.1` (not 19) — MUI 9 supports either, design chose 18 to minimize churn.
- No visual/behavioral changes except the two explicitly-listed bug fixes (pagination `Math.ceil`, search resets `page` to 1).
- No new features, no SSR/Next.js migration, no backend changes.
- Package manager: npm (existing `package-lock.json`).
- Every dependency version below is exact-pinned to what was verified available via `npm view <pkg> version` on 2026-07-12; use these exact versions (as `^`-ranges) rather than re-resolving "latest" mid-plan.

---

### Task 1: Vite scaffold — replace CRA entry points, rename JSX files

**Files:**

- Create: `vite.config.js`
- Create: `index.html` (project root)
- Create: `src/main.jsx` (replaces `src/index.js`)
- Delete: `src/index.js`
- Delete: `public/index.html`
- Rename: `src/App.js` → `src/App.jsx`
- Rename: `src/CryptoContext.js` → `src/CryptoContext.jsx`
- Rename: `src/Pages/Homepage.js` → `src/Pages/Homepage.jsx`
- Rename: `src/Pages/CP.js` → `src/Pages/CP.jsx`
- Rename: `src/components/Banner.js` → `src/components/Banner.jsx`
- Rename: `src/components/Carousel.js` → `src/components/Carousel.jsx`
- Rename: `src/components/CoinInfo.js` → `src/components/CoinInfo.jsx`
- Rename: `src/components/CoinsTable.js` → `src/components/CoinsTable.jsx`
- Rename: `src/components/Header.js` → `src/components/Header.jsx`
- Rename: `src/components/SelectButton.js` → `src/components/SelectButton.jsx`
- Modify: `package.json` (scripts + deps — full replacement shown in Task 2, this task only needs `dev`/`build`/`preview` scripts and the two new deps below to boot)

**Interfaces:**

- Produces: `npm run dev` boots a Vite dev server serving the existing app unchanged at `http://localhost:5173/` and `http://localhost:5173/coins/:id`.

- [ ] **Step 1: Rename every JSX-containing `.js` file to `.jsx`**

```bash
git mv src/App.js src/App.jsx
git mv src/CryptoContext.js src/CryptoContext.jsx
git mv src/Pages/Homepage.js src/Pages/Homepage.jsx
git mv src/Pages/CP.js src/Pages/CP.jsx
git mv src/components/Banner.js src/components/Banner.jsx
git mv src/components/Carousel.js src/components/Carousel.jsx
git mv src/components/CoinInfo.js src/components/CoinInfo.jsx
git mv src/components/CoinsTable.js src/components/CoinsTable.jsx
git mv src/components/Header.js src/components/Header.jsx
git mv src/components/SelectButton.js src/components/SelectButton.jsx
```

`src/config/api.js` and `src/config/Chartdata.js` contain no JSX — leave them as `.js`.

- [ ] **Step 2: Fix internal imports that reference the renamed files by relative path**

Extensionless imports (e.g. `import Header from './components/Header'`) keep working unchanged under Vite's resolver — no import-path edits are needed for the rename itself. Confirm by searching for any import that hardcodes a `.js` extension on a renamed file:

```bash
grep -rn "from '.*/(App|CryptoContext|Homepage|CP|Banner|Carousel|CoinInfo|CoinsTable|Header|SelectButton)\.js'" src/
```

Expected: no output. (If any match, drop the `.js` extension in that import.)

- [ ] **Step 3: Create `src/main.jsx` (replaces `src/index.js`)**

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import CryptoContext from './CryptoContext';
import 'react-alice-carousel/lib/alice-carousel.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <CryptoContext>
      <App />
    </CryptoContext>
  </React.StrictMode>
);
```

- [ ] **Step 4: Delete the old CRA entry point**

```bash
git rm src/index.js
```

- [ ] **Step 5: Create root `index.html`, delete `public/index.html`**

```bash
git rm public/index.html
```

Create `index.html` at the project root:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Cryptocurrency Tracker" />
    <link rel="apple-touch-icon" href="/logo192.png" />
    <link rel="manifest" href="/manifest.json" />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap"
    />
    <title>Crytocurrency Tracker</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

(`public/banner2.jpg`, `public/favicon.ico`, `public/logo192.png`, `public/logo512.png`, `public/manifest.json`, `public/robots.txt` all stay where they are — Vite serves the whole `public/` directory at `/` automatically.)

- [ ] **Step 6: Create `vite.config.js`**

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
```

- [ ] **Step 7: Install Vite and the React plugin, update scripts**

```bash
npm install --save-dev vite@^8.1.4 @vitejs/plugin-react@^6.0.3
```

In `package.json`, update the `"scripts"` block to:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}
```

(Test scripts are added in Task 4; lint script in Task 3. `start`/`eject` are removed — CRA-specific.)

- [ ] **Step 8: Verify the dev server boots and renders the unchanged app**

Run: `npm run dev`
Expected: Vite prints a local URL (e.g. `http://localhost:5173/`). Open it — the homepage banner, coin table, and carousel render exactly as before. Navigate to a coin (click a row) — the `/coins/:id` detail page renders. No console errors. Stop the dev server (Ctrl+C) once confirmed.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "Migrate build tooling from CRA to Vite"
```

---

### Task 2: Dependency version bumps

**Files:**

- Modify: `package.json`

**Interfaces:**

- Consumes: nothing new (pure dependency version bump, same import surface).
- Produces: `npm run build` succeeds on the new dependency versions, confirming no breaking-change fallout before further refactor work begins.

- [ ] **Step 1: Remove unused/CRA-only packages**

```bash
npm uninstall @mui/lab react-scripts web-vitals
```

(`@mui/lab` grep-confirmed unused in `src/`; `react-scripts`/`web-vitals` are CRA-only.)

- [ ] **Step 2: Bump every remaining runtime dependency to the versions verified via `npm view <pkg> version` on 2026-07-12**

```bash
npm install \
  react@^18.3.1 \
  react-dom@^18.3.1 \
  @mui/material@^9.2.0 \
  @mui/system@^9.2.0 \
  @emotion/react@^11.14.0 \
  @emotion/styled@^11.14.1 \
  react-router-dom@^7.18.1 \
  axios@^1.18.1 \
  chart.js@^4.5.1 \
  react-chartjs-2@^5.3.1 \
  dompurify@^3.4.12 \
  react-alice-carousel@^2.9.1
```

- [ ] **Step 3: Remove the CRA-only config blocks from `package.json`**

Delete the `"eslintConfig"` and `"browserslist"` top-level keys from `package.json` (ESLint config moves to `eslint.config.js` in Task 3; Vite doesn't use `browserslist`).

- [ ] **Step 4: Build and smoke-test**

Run: `npm run build`
Expected: build completes with no errors (warnings about chunk size are fine — this app has no code-splitting and that's out of scope).

Run: `npm run preview`, open the printed URL.
Expected: homepage, coin table, carousel, and a coin detail page all render with no console errors — no MUI v9, router v7, or other API breaks. (None of `<Routes>/<Route>` declarative routing, `ThemeProvider`/`createTheme`, `styled()`, or the `axios.get`/`Chart`/`DOMPurify.sanitize` calls used in this codebase were affected by the major bumps between the old and new versions.) Stop the preview server once confirmed.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Bump dependencies to current stable versions; drop unused @mui/lab"
```

---

### Task 3: ESLint (flat config) + Prettier

**Files:**

- Create: `eslint.config.js`
- Create: `.prettierrc`
- Create: `.editorconfig`
- Modify: `package.json` (add `lint` script + devDependencies)

**Interfaces:**

- Produces: `npm run lint` — runs ESLint over `src/`.

- [ ] **Step 1: Install lint/format tooling**

```bash
npm install --save-dev \
  eslint@^10.7.0 \
  @eslint/js@^10.0.1 \
  eslint-plugin-react@^7.37.5 \
  eslint-plugin-react-hooks@^7.1.1 \
  eslint-plugin-react-refresh@^0.5.3 \
  eslint-config-prettier@^10.1.8 \
  globals@^17.7.0 \
  prettier@^3.9.5
```

- [ ] **Step 2: Create `eslint.config.js`**

```js
import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  { ignores: ['dist/**', 'node_modules/**'] },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/prop-types': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  {
    files: ['**/*.test.{js,jsx}'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  prettier,
];
```

- [ ] **Step 3: Create `.prettierrc`**

```json
{
  "singleQuote": true,
  "semi": true,
  "trailingComma": "es5",
  "printWidth": 80
}
```

- [ ] **Step 4: Create `.editorconfig`**

```ini
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
```

- [ ] **Step 5: Add the `lint` script**

In `package.json` `"scripts"`, add:

```json
"lint": "eslint ."
```

- [ ] **Step 6: Run lint, fix any findings**

Run: `npm run lint`
Expected: some findings against the current code are likely (e.g. `react-hooks/exhaustive-deps` warnings on the `// eslint-disable-next-line` lines in `Carousel.jsx`/`CoinsTable.jsx`/`CP.jsx`). Leave those specific disables in place for now — Tasks 6–11 replace the underlying `useEffect`+`axios` calls with `useFetch`, which removes the need for them. Fix only findings unrelated to the upcoming refactor (e.g. formatting — run `npx prettier --write .` to auto-fix style issues).

Run: `npx prettier --write .`
Run: `npm run lint` again.
Expected: no errors (warnings tied to the pre-refactor `useEffect` deps are acceptable at this point in the plan).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Add ESLint flat config and Prettier"
```

---

### Task 4: Vitest test infrastructure

**Files:**

- Modify: `vite.config.js` (add `test` config)
- Create: `src/setupTests.js`
- Create: `src/config/api.test.js`
- Modify: `package.json` (add `test`/`test:watch` scripts + devDependencies)

**Interfaces:**

- Produces: `npm test` runs Vitest once; `npm run test:watch` runs it in watch mode. `src/setupTests.js` is the shared setup file all future tests rely on.

- [ ] **Step 1: Install Vitest and testing libraries**

```bash
npm install --save-dev \
  vitest@^4.1.10 \
  jsdom@^29.1.1 \
  @testing-library/react@^16.3.2 \
  @testing-library/jest-dom@^6.9.1 \
  @testing-library/user-event@^14.6.1
```

(`@testing-library/react`/`jest-dom`/`user-event` already exist in `package.json` at older CRA-era versions — this bumps them.)

- [ ] **Step 2: Add `test` config to `vite.config.js`**

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  },
});
```

- [ ] **Step 3: Create `src/setupTests.js`**

```js
import '@testing-library/jest-dom/vitest';
```

(The `/vitest` subpath self-registers jest-dom's matchers on Vitest's own `expect` import — it doesn't require `globals: true` in `vite.config.js`. The plain `@testing-library/jest-dom` entry point expects a global `expect`, which this project's config deliberately does not enable, since every test file explicitly imports `describe`/`it`/`expect`/`vi` from `vitest`.)

- [ ] **Step 4: Add test scripts to `package.json`**

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Write the first test — `src/config/api.test.js`**

```js
import { describe, it, expect } from 'vitest';
import { CoinList, SingleCoin, HistoricalChart, TrendingCoins } from './api';

describe('api URL builders', () => {
  it('CoinList interpolates currency', () => {
    expect(CoinList('usd')).toBe(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false'
    );
  });

  it('SingleCoin interpolates id', () => {
    expect(SingleCoin('bitcoin')).toBe(
      'https://api.coingecko.com/api/v3/coins/bitcoin'
    );
  });

  it('HistoricalChart interpolates id, days, and currency', () => {
    expect(HistoricalChart('bitcoin', 30, 'usd')).toBe(
      'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30'
    );
  });

  it('HistoricalChart defaults days to 365', () => {
    expect(HistoricalChart('bitcoin', undefined, 'usd')).toContain('days=365');
  });

  it('TrendingCoins interpolates currency', () => {
    expect(TrendingCoins('inr')).toBe(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=inr&order=gecko_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h'
    );
  });
});
```

- [ ] **Step 6: Run the test, verify it passes**

Run: `npm test`
Expected: `5 passed` (or similar), no errors.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Add Vitest test infrastructure"
```

---

### Task 5: Extract `src/utils/formatNumber.js`

**Files:**

- Create: `src/utils/formatNumber.js`
- Create: `src/utils/formatNumber.test.js`
- Modify: `src/components/CoinsTable.jsx` (remove local `numberWithCommas`, import shared one)
- Modify: `src/components/Carousel.jsx` (remove local `numberWithCommas`, import shared one)
- Modify: `src/Pages/CP.jsx` (remove local `numberWithCommas`, import shared one)

**Interfaces:**

- Produces: `formatNumber(x: number | string): string` — the canonical comma-formatter (the `CP.jsx` version's `parseFloat`/NaN-guard behavior, since it's the most defensive of the three duplicates). Default export.

- [ ] **Step 1: Write the failing test — `src/utils/formatNumber.test.js`**

```js
import { describe, it, expect } from 'vitest';
import formatNumber from './formatNumber';

describe('formatNumber', () => {
  it('adds thousands separators', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('accepts numeric strings', () => {
    expect(formatNumber('1234567.89')).toBe(
      '1234567.89'.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    );
  });

  it('returns "Invalid Number" for non-numeric input', () => {
    expect(formatNumber('not-a-number')).toBe('Invalid Number');
  });

  it('returns "Invalid Number" for undefined', () => {
    expect(formatNumber(undefined)).toBe('Invalid Number');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/utils/formatNumber.test.js`
Expected: FAIL — `Failed to resolve import "./formatNumber"`.

- [ ] **Step 3: Create `src/utils/formatNumber.js`**

```js
export default function formatNumber(x) {
  const parsedNumber = parseFloat(x);
  if (isNaN(parsedNumber)) {
    return 'Invalid Number';
  }
  return parsedNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/utils/formatNumber.test.js`
Expected: `4 passed`.

- [ ] **Step 5: Wire `formatNumber` into `CoinsTable.jsx`**

Remove:

```js
export function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
```

Add near the top with the other imports:

```js
import formatNumber from '../utils/formatNumber';
```

Replace both call sites (`numberWithCommas(row.current_price.toFixed(2))` and `numberWithCommas(row.market_cap.toString().slice(0, -6))`) with `formatNumber(...)`.

- [ ] **Step 6: Wire `formatNumber` into `Carousel.jsx`**

Remove:

```js
export function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
```

Add:

```js
import formatNumber from '../utils/formatNumber';
```

Replace `numberWithCommas(coin?.current_price.toFixed(2))` with `formatNumber(coin?.current_price.toFixed(2))`.

- [ ] **Step 7: Wire `formatNumber` into `CP.jsx`**

Remove the local:

```js
export function numberWithCommas(x) {
  const parsedNumber = parseFloat(x);
  if (isNaN(parsedNumber)) {
    return 'Invalid Number';
  }
  return parsedNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
```

Add:

```js
import formatNumber from '../utils/formatNumber';
```

Replace both `numberWithCommas(...)` call sites with `formatNumber(...)`.

- [ ] **Step 8: Run the full test suite and lint**

Run: `npm test`
Expected: all tests pass.

Run: `npm run lint`
Expected: no new errors.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "Extract shared formatNumber util, remove 3 duplicate implementations"
```

---

### Task 6: Extract `src/hooks/useFetch.js`

**Files:**

- Create: `src/hooks/useFetch.js`
- Create: `src/hooks/useFetch.test.js`

**Interfaces:**

- Consumes: `axios` (mocked in the test via `vi.mock('axios')`).
- Produces: `useFetch(url)` — a hook returning `{ data, loading, error }`. `data` starts `null`, `loading` starts `true`. Re-fetches whenever `url` changes (`url` itself is the effect dependency — callers build the full URL string, e.g. `CoinList(currency)`, before passing it in, so a currency change naturally changes the string and re-triggers the effect). On success: `{ data: <response.data>, loading: false, error: null }`. On failure: `{ data: null, loading: false, error: <caught error> }`. Passing `url` as `null`/`undefined` skips the fetch entirely and leaves `loading: false, data: null, error: null` (used by `CoinInfo`, which has no id until `coin` loads).

- [ ] **Step 1: Write the failing test — `src/hooks/useFetch.test.js`**

```js
import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import axios from 'axios';
import useFetch from './useFetch';

vi.mock('axios');

afterEach(() => {
  vi.resetAllMocks();
});

describe('useFetch', () => {
  it('starts in a loading state with no data', () => {
    axios.get.mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useFetch('https://example.com/data'));
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);
  });

  it('resolves to data on success', async () => {
    axios.get.mockResolvedValue({ data: { hello: 'world' } });
    const { result } = renderHook(() => useFetch('https://example.com/data'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual({ hello: 'world' });
    expect(result.current.error).toBe(null);
  });

  it('resolves to an error on failure', async () => {
    const err = new Error('network down');
    axios.get.mockRejectedValue(err);
    const { result } = renderHook(() => useFetch('https://example.com/data'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(err);
  });

  it('skips fetching when url is falsy', () => {
    const { result } = renderHook(() => useFetch(null));
    expect(axios.get).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBe(null);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/hooks/useFetch.test.js`
Expected: FAIL — `Failed to resolve import "./useFetch"`.

- [ ] **Step 3: Create `src/hooks/useFetch.js`**

```js
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(url));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    axios
      .get(url)
      .then((response) => {
        if (!cancelled) {
          setData(response.data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return { data, loading, error };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/hooks/useFetch.test.js`
Expected: `4 passed`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Add shared useFetch hook with loading/error state"
```

---

### Task 7: Consolidate theme into `src/theme.js`; wrap `App` once

**Files:**

- Create: `src/theme.js`
- Modify: `src/App.jsx` (wrap in the single `ThemeProvider`)
- Modify: `src/components/Header.jsx` (remove local theme + `ThemeProvider`, remove stray `console.log`)
- Modify: `src/components/CoinsTable.jsx` (remove local theme + `ThemeProvider`)
- Modify: `src/components/CoinInfo.jsx` (remove local theme + `ThemeProvider`)

**Interfaces:**

- Produces: `src/theme.js` exports `darkTheme` (default export) — the same `createTheme({ palette: { primary: { main: '#fff' }, mode: 'dark' } })` object all four components previously built separately.

- [ ] **Step 1: Create `src/theme.js`**

```js
import { createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
  palette: {
    primary: {
      main: '#fff',
    },
    mode: 'dark',
  },
});

export default darkTheme;
```

- [ ] **Step 2: Wrap `App.jsx` in the single `ThemeProvider`**

```jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { styled } from '@mui/system';
import { ThemeProvider } from '@mui/material/styles';
import darkTheme from './theme';
import Header from './components/Header';
import Homepage from './Pages/Homepage';
import CP from './Pages/CP';

const StyledAppContainer = styled('div')({
  backgroundColor: '#14161a',
  color: 'white',
  minHeight: '100vh',
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <BrowserRouter>
        <StyledAppContainer>
          <Header />
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/coins/:id" element={<CP />} />
          </Routes>
        </StyledAppContainer>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
```

- [ ] **Step 3: Remove the local theme + `console.log` from `Header.jsx`**

Remove the `console.log(currency);` line, the `createTheme`/`ThemeProvider` imports, the `darkTheme` definition, and the `<ThemeProvider>` wrapper (keep its child `<AppBar>...</AppBar>` as the direct return value):

```jsx
import React from 'react';
import {
  AppBar,
  Container,
  MenuItem,
  Select,
  Toolbar,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useCryptoState } from '../CryptoContext';

const Header = () => {
  const { currency, setCurrency } = useCryptoState();
  const navigate = useNavigate();

  return (
    <AppBar color="transparent" position="static">
      <Container>
        <Toolbar>
          <Typography
            sx={{
              flex: 1,
              color: 'gold',
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/')}
            variant="h6"
          >
            CryptoTracker
          </Typography>
          <Select
            variant="outlined"
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            style={{ width: 100, height: 40, marginLeft: 15 }}
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <MenuItem value={'USD'}>USD</MenuItem>
            <MenuItem value={'INR'}>INR</MenuItem>
          </Select>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
```

- [ ] **Step 4: Remove the local theme from `CoinsTable.jsx`**

Remove the `createTheme`/`ThemeProvider` import line, the `darkTheme` definition inside the component, and the `<ThemeProvider>` wrapper — return the `<Container>...</Container>` directly instead. (The rest of `CoinsTable.jsx`'s refactor — `useFetch`, bug fixes, `console.log` removal — happens in Task 9; this step touches only the theme lines so the diff stays reviewable.)

- [ ] **Step 5: Remove the local theme from `CoinInfo.jsx`**

Remove the `createTheme`/`ThemeProvider` import line, the `darkTheme` definition inside the component, and the `<ThemeProvider>` wrapper — return the `<Container>...</Container>` directly instead. (The rest of `CoinInfo.jsx`'s refactor happens in Task 11.)

- [ ] **Step 6: Verify visually**

Run: `npm run dev`, open the app.
Expected: identical dark theme/colors on the homepage, coin table, header, and a coin detail page (all four previously used byte-identical theme objects, so there is no visual change). No console errors, and `Header`'s currency-switch `console.log` no longer appears in devtools.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Consolidate 4 duplicate MUI themes into one shared theme.js"
```

---

### Task 8: Refactor `Carousel.jsx` to use `useFetch`

**Files:**

- Modify: `src/components/Carousel.jsx`

**Interfaces:**

- Consumes: `useFetch(url)` from Task 6 (`{ data, loading, error }`); `formatNumber` from Task 5.

- [ ] **Step 1: Replace the hand-rolled fetch with `useFetch`**

```jsx
import React from 'react';
import './Carousel.css';
import { TrendingCoins } from '../config/api';
import { useCryptoState } from '../CryptoContext';
import useFetch from '../hooks/useFetch';
import formatNumber from '../utils/formatNumber';
import AliceCarousel from 'react-alice-carousel';
import { Link } from 'react-router-dom';
import { Typography } from '@mui/material';

const Carousel = () => {
  const { currency, symbol } = useCryptoState();
  const { data: trending, loading, error } = useFetch(TrendingCoins(currency));

  if (error) {
    return (
      <Typography sx={{ color: 'red', textAlign: 'center' }}>
        Couldn't load trending coins. Please try again later.
      </Typography>
    );
  }

  if (loading || !trending) {
    return null;
  }

  const items = trending.map((coin) => {
    let profit = coin.price_change_percentage_24h >= 0;
    return (
      <Link className="carouselItem" to={`/coins/${coin.id}`} key={coin.id}>
        <img
          src={coin?.image}
          alt={coin.name}
          height="80"
          style={{ marginBottom: 10 }}
        />
        <span>
          {coin?.symbol}
          &nbsp;
          <span
            style={{
              color: profit > 0 ? 'rgb(14, 203, 129)' : 'red',
              fontWeight: 500,
            }}
          >
            {profit && '+'}
            {coin?.price_change_percentage_24h?.toFixed(2)}%
          </span>
        </span>
        <span style={{ fontSize: 22, fontWeight: 500 }}>
          {symbol} {formatNumber(coin?.current_price.toFixed(2))}
        </span>
      </Link>
    );
  });

  const responsive = {
    0: {
      items: 2,
    },
    512: {
      items: 4,
    },
  };

  return (
    <div className="carousel">
      <AliceCarousel
        mouseTracking
        infinite
        autoPlayInterval={1000}
        animationDuration={1500}
        disableDotsControls
        disableButtonsControls
        responsive={responsive}
        autoPlay
        items={items}
      />
    </div>
  );
};

export default Carousel;
```

Note: this also fixes a pre-existing bug where each carousel `<Link>` was missing a `key` prop (React would have warned in the console).

- [ ] **Step 2: Verify visually**

Run: `npm run dev`, open the homepage.
Expected: trending carousel renders and auto-scrolls as before; switching currency (USD/INR) in the header updates carousel prices; no console warnings about missing `key` props.

- [ ] **Step 3: Run lint and tests**

Run: `npm run lint && npm test`
Expected: no errors; all existing tests still pass.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Refactor Carousel to use useFetch, add missing key prop, add error state"
```

---

### Task 9: Refactor `CoinsTable.jsx` — `useFetch`, bug fixes, cleanup

**Files:**

- Modify: `src/components/CoinsTable.jsx`

**Interfaces:**

- Consumes: `useFetch(url)` from Task 6; `formatNumber` from Task 5.

- [ ] **Step 1: Rewrite `CoinsTable.jsx`**

```jsx
import React, { useState } from 'react';
import { CoinList } from '../config/api';
import { useCryptoState } from '../CryptoContext';
import { Container } from '@mui/system';
import {
  LinearProgress,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import formatNumber from '../utils/formatNumber';

const CoinsTable = () => {
  const { currency, symbol } = useCryptoState();
  const { data: coins, loading, error } = useFetch(CoinList(currency));
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!coins) return [];
    return coins.filter(
      (coin) =>
        coin.name.toLowerCase().includes(search) ||
        coin.symbol.toLowerCase().includes(search)
    );
  };

  const filtered = handleSearch();

  return (
    <Container sx={{ textAlign: 'center' }}>
      <Typography
        variant="h4"
        sx={{ margin: '18px', fontFamily: 'Montserrat' }}
      >
        Cryptocurrency prices by Market Cap
      </Typography>
      <TextField
        variant="outlined"
        label="Search for Crypto Currency...."
        sx={{ width: '100%', marginBottom: '20px' }}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />
      {error ? (
        <Typography sx={{ color: 'red', margin: '20px' }}>
          Couldn't load coin prices. Please try again later.
        </Typography>
      ) : (
        <TableContainer>
          {loading ? (
            <LinearProgress sx={{ backgroundColor: 'gold' }} />
          ) : (
            <Table>
              <TableHead sx={{ backgroundColor: '#EEBC1D' }}>
                <TableRow>
                  {['Coin', 'Price', '24h Change', 'Market Cap'].map((head) => (
                    <TableCell
                      sx={{
                        color: 'black',
                        fontWeight: '700',
                        fontFamily: 'Montserrat',
                      }}
                      key={head}
                      align={head === 'Coin' ? '' : 'right'}
                    >
                      {head}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered
                  .slice((page - 1) * 10, (page - 1) * 10 + 10)
                  .map((row) => {
                    const profit = row.price_change_percentage_24h > 0;
                    return (
                      <TableRow
                        onClick={() => navigate(`/coins/${row.id}`)}
                        sx={{
                          backgroundColor: '#16171a',
                          cursor: 'pointer',
                          fontFamily: 'Montserrat',
                          '&:hover': {
                            backgroundColor: '#131111',
                          },
                        }}
                        key={row.name}
                      >
                        <TableCell
                          component="th"
                          scope="row"
                          sx={{
                            display: 'flex',
                            gap: '15px',
                          }}
                        >
                          <img
                            src={row?.image}
                            alt={row.name}
                            height="50px"
                            style={{ marginBottom: '10px' }}
                          />
                          <div
                            style={{ display: 'flex', flexDirection: 'column' }}
                          >
                            <span
                              style={{
                                textTransform: 'uppercase',
                                fontSize: '22px',
                              }}
                            >
                              {row.symbol}
                            </span>
                            <span style={{ color: 'darkgrey' }}>
                              {row.name}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell align="right">
                          {symbol} {formatNumber(row.current_price.toFixed(2))}
                        </TableCell>

                        <TableCell
                          align="right"
                          sx={{
                            color: profit ? 'rgb(14, 203, 129)' : 'red',
                            fontWeight: '500',
                          }}
                        >
                          {profit && '+'}
                          {row.price_change_percentage_24h.toFixed(2)}%
                        </TableCell>

                        <TableCell align="right">
                          {symbol}{' '}
                          {formatNumber(row.market_cap.toString().slice(0, -6))}
                          M
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      )}
      <Pagination
        sx={{
          padding: '20px',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          '& .MuiPaginationItem-root': {
            color: 'gold',
          },
        }}
        page={page}
        count={Math.ceil(filtered.length / 10)}
        onChange={(_, value) => {
          setPage(value);
          window.scroll(0, 450);
        }}
      />
    </Container>
  );
};

export default CoinsTable;
```

This fixes, in order: the `console.log(coins)` debug line (removed), the pagination rounding bug (`Math.ceil` instead of `.toFixed(0)`), and the search-doesn't-reset-page bug (`setPage(1)` added to the search `onChange`). It also adds `page={page}` to `<Pagination>` so the control stays in sync when `setPage(1)` fires from search (previously `<Pagination>` was uncontrolled/display-only for the current page).

- [ ] **Step 2: Verify the two bug fixes manually**

Run: `npm run dev`, open the homepage.

- Type a search query that filters down to a number of results not a clean multiple of 10 (e.g. search "a" — should match many coins with a non-multiple-of-10 count). Confirm the pagination control shows the correct number of pages (`Math.ceil(n/10)`) and the last page shows the remainder rows, not a blank page.
- While on page 2 of the unfiltered list, type a search query. Confirm the view jumps back to page 1's results instead of showing an empty table.

- [ ] **Step 3: Run lint and tests**

Run: `npm run lint && npm test`
Expected: no errors; all tests pass.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Refactor CoinsTable to useFetch; fix pagination rounding and search-reset-page bugs"
```

---

### Task 10: Refactor `CP.jsx` — `useFetch`, hoist `styled()` definitions

**Files:**

- Modify: `src/Pages/CP.jsx`

**Interfaces:**

- Consumes: `useFetch(url)` from Task 6; `formatNumber` from Task 5.

- [ ] **Step 1: Rewrite `CP.jsx`**

```jsx
import React from 'react';
import { useCryptoState } from '../CryptoContext';
import { useParams } from 'react-router-dom';
import { SingleCoin } from '../config/api';
import CoinInfo from '../components/CoinInfo';
import DOMPurify from 'dompurify';
import { styled } from '@mui/system';
import { CircularProgress, Typography } from '@mui/material';
import useFetch from '../hooks/useFetch';
import formatNumber from '../utils/formatNumber';

const StyledDiv = styled('div')({
  display: 'flex',
  '@media (max-width: 960px)': {
    flexDirection: 'column',
    alignItems: 'center',
  },
});

const SidebarDiv = styled('div')({
  width: '30%',
  '@media (max-width: 960px)': {
    width: '100%',
  },
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginTop: 25,
  borderRight: '2px solid grey',
});

const MarketDataDiv = styled('div')({
  alignSelf: 'start',
  padding: 25,
  paddingTop: 10,
  width: '100%',
  '@media (max-width: 960px)': {
    display: 'flex',
    justifyContent: 'space-around',
  },
  '@media (max-width: 600px)': {
    flexDirection: 'column',
    alignItems: 'center',
  },
  '@media (max-width: 400px)': {
    alignItems: 'start',
  },
});

const CP = () => {
  const { id } = useParams();
  const { currency, symbol } = useCryptoState();
  const { data: coin, loading, error } = useFetch(SingleCoin(id));

  if (error) {
    return (
      <Typography sx={{ color: 'red', textAlign: 'center', marginTop: '40px' }}>
        Couldn't load this coin. Please try again later.
      </Typography>
    );
  }

  if (loading || !coin) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
        <CircularProgress style={{ color: 'gold' }} size={100} thickness={2} />
      </div>
    );
  }

  return (
    <StyledDiv>
      <SidebarDiv>
        <img
          src={coin?.image.large}
          alt={coin?.name}
          height="200px"
          style={{ marginBottom: '20px' }}
        />
        <Typography
          variant="h3"
          sx={{
            fontWeight: 'bold',
            marginBottom: '20px',
            fontFamily: 'Montserrat',
          }}
        >
          {coin?.name}
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{
            width: '100%',
            fontFamily: 'Montserrat',
            padding: '25px',
            paddingBottom: '15px',
            paddingTop: '0',
            textAlign: 'justify',
          }}
        >
          {coin?.description.en.split('. ')[0] && (
            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(coin.description.en.split('. ')[0]),
              }}
            />
          )}
        </Typography>

        <MarketDataDiv>
          <span style={{ display: 'flex' }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 'bold',
                marginBottom: '20px',
                fontFamily: 'Montserrat',
              }}
            >
              Rank:
            </Typography>
            &nbsp; &nbsp;
            <Typography variant="h5" style={{ fontFamily: 'Montserrat' }}>
              {formatNumber(coin?.market_cap_rank)}
            </Typography>
          </span>

          <span style={{ display: 'flex' }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 'bold',
                marginBottom: '20px',
                fontFamily: 'Montserrat',
              }}
            >
              Current Price:
            </Typography>
            &nbsp; &nbsp;
            <Typography variant="h5" style={{ fontFamily: 'Montserrat' }}>
              {symbol}{' '}
              {coin?.market_data.current_price[currency.toLowerCase()] !==
              undefined
                ? formatNumber(
                    coin?.market_data.current_price[currency.toLowerCase()]
                  )
                : 'N/A'}
            </Typography>
          </span>
          <span style={{ display: 'flex' }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 'bold',
                marginBottom: '20px',
                fontFamily: 'Montserrat',
              }}
            >
              Market Cap:
            </Typography>
            &nbsp; &nbsp;
            <Typography variant="h5" style={{ fontFamily: 'Montserrat' }}>
              {symbol}{' '}
              {coin?.market_data.market_cap[currency.toLowerCase()] !==
              undefined
                ? formatNumber(
                    coin?.market_data.market_cap[currency.toLowerCase()]
                      .toString()
                      .slice(0, -6)
                  )
                : 'N/A'}{' '}
              M
            </Typography>
          </span>
        </MarketDataDiv>
      </SidebarDiv>
      <CoinInfo coin={coin} />
    </StyledDiv>
  );
};

export default CP;
```

Note: this replaces the previous silent-forever-`undefined` loading state (`coin` starts `undefined` and the whole component crashed on `coin?.image.large` type access patterns relying on optional chaining) with an explicit loading spinner and error message, and hoists `StyledDiv`/`SidebarDiv`/`MarketDataDiv` out of the component body so they aren't recreated on every render.

- [ ] **Step 2: Verify visually**

Run: `npm run dev`, click into a coin from the homepage table.
Expected: brief loading spinner, then the coin detail page renders identically to before (image, name, description snippet, rank/price/market-cap, chart on the right). Switching currency updates price/market cap. Navigating directly to a bad id (e.g. `/coins/not-a-real-coin`) shows the red error message instead of a blank/broken page.

- [ ] **Step 3: Run lint and tests**

Run: `npm run lint && npm test`
Expected: no errors; all tests pass.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Refactor CP to useFetch, hoist styled() definitions, add loading/error states"
```

---

### Task 11: Refactor `CoinInfo.jsx` — `useFetch` for historic data, hoist `styled()`

**Files:**

- Modify: `src/components/CoinInfo.jsx`

**Interfaces:**

- Consumes: `useFetch(url)` from Task 6. `useFetch` is only called when `coin` exists — pass `coin ? HistoricalChart(coin.id, days, currency) : null` so it respects the "skip when url is falsy" behavior from Task 6.

- [ ] **Step 1: Rewrite `CoinInfo.jsx`**

```jsx
import React, { useEffect, useRef } from 'react';
import { useCryptoState } from '../CryptoContext';
import { HistoricalChart } from '../config/api';
import { CircularProgress, Typography } from '@mui/material';
import Chart from 'chart.js/auto';
import { chartDays } from '../config/Chartdata';
import SelectButton from './SelectButton';
import { styled } from '@mui/system';
import useFetch from '../hooks/useFetch';
import { useState } from 'react';

const Container = styled('div')({
  width: '75%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 25,
  padding: 40,
  '@media (max-width: 960px)': {
    width: '100%',
    marginTop: 0,
    padding: 20,
    paddingTop: 0,
  },
});

const CoinInfo = ({ coin }) => {
  const [days, setDays] = useState(1);
  const { currency } = useCryptoState();
  const chartRef = useRef(null);

  const {
    data: historicChart,
    loading,
    error,
  } = useFetch(coin ? HistoricalChart(coin.id, days, currency) : null);
  const historicData = historicChart?.prices;

  useEffect(() => {
    if (!chartRef.current || !historicData) return;

    const ctx = chartRef.current.getContext('2d');
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: historicData.map((entry) => {
          const date = new Date(entry[0]);
          const time =
            date.getHours() > 12
              ? `${date.getHours() - 12}:${date.getMinutes()} PM`
              : `${date.getHours()}:${date.getMinutes()} AM`;
          return days === 1 ? time : date.toLocaleDateString();
        }),
        datasets: [
          {
            data: historicData.map((entry) => entry[1]),
            label: `Price (Past ${days} Days) in ${currency}`,
            borderColor: '#EEBC1D',
          },
        ],
      },
      options: {
        elements: {
          point: {
            radius: 1,
          },
        },
      },
    });

    return () => chart.destroy();
  }, [historicData, days, currency]);

  if (error) {
    return (
      <Container>
        <Typography sx={{ color: 'red' }}>
          Couldn't load the price chart. Please try again later.
        </Typography>
      </Container>
    );
  }

  return (
    <Container>
      {loading || !historicData ? (
        <CircularProgress style={{ color: 'gold' }} size={250} thickness={1} />
      ) : (
        <>
          <canvas ref={chartRef} width="400" height="180"></canvas>
          <div
            style={{
              display: 'flex',
              marginTop: 20,
              justifyContent: 'space-around',
              width: '100%',
            }}
          >
            {chartDays.map((day) => (
              <SelectButton
                key={day.value}
                onClick={() => setDays(day.value)}
                selected={day.value === days}
              >
                {day.label}
              </SelectButton>
            ))}
          </div>
        </>
      )}
    </Container>
  );
};

export default CoinInfo;
```

This replaces the old `flag` boolean (a workaround for `useFetch` not existing yet — it forced a two-`useEffect` dance to know when to (re)build the chart) with a single `useEffect` keyed on `historicData`/`days`/`currency`, and adds `chart.destroy()` cleanup so switching the days filter doesn't leak the previous Chart.js instance (previously `new Chart(...)` was called again on the same canvas context without destroying the prior chart — a real memory/rendering-stack bug in the original code once you clicked between day ranges a few times).

- [ ] **Step 2: Verify visually**

Run: `npm run dev`, open a coin detail page.
Expected: loading spinner, then the price chart renders. Click each of the 4 day-range buttons (24 Hours / 30 Days / 3 Months / 1 Year) — the chart updates each time with no visual artifacts, ghosting, or console errors (this is the manual check that `chart.destroy()` cleanup is working).

- [ ] **Step 3: Run lint and tests**

Run: `npm run lint && npm test`
Expected: no errors; all tests pass.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Refactor CoinInfo to useFetch, hoist styled Container, fix chart-instance leak on day-range change"
```

---

### Task 12: Hoist `SelectButton`'s `styled()` to module scope

**Files:**

- Modify: `src/components/SelectButton.jsx`

- [ ] **Step 1: Rewrite `SelectButton.jsx`**

```jsx
import React from 'react';
import { styled } from '@mui/system';

const StyledSelectButton = styled('span')(({ selected }) => ({
  border: '1px solid gold',
  borderRadius: 5,
  padding: 10,
  paddingLeft: 20,
  paddingRight: 20,
  fontFamily: 'Montserrat',
  cursor: 'pointer',
  backgroundColor: selected ? 'gold' : '',
  color: selected ? 'black' : '',
  fontWeight: selected ? 700 : 500,
  margin: '10px',
  '&:hover': {
    backgroundColor: 'gold',
    color: 'black',
  },
  width: '22%',
}));

const SelectButton = ({ children, selected, onClick }) => {
  return (
    <StyledSelectButton selected={selected} onClick={onClick}>
      {children}
    </StyledSelectButton>
  );
};

export default SelectButton;
```

(The original nested a `styled` component named identically to its parent, `SelectButton`, inside the `SelectButton` function body — same name, different scope, recreated every render. This hoists it to module scope under a distinct name, `StyledSelectButton`, so it's built once and it's clear which identifier is the component vs. the styled primitive.)

- [ ] **Step 2: Verify visually**

Run: `npm run dev`, open a coin detail page.
Expected: the four day-range buttons render identically (gold border, selected state highlighted gold) and still respond to clicks.

- [ ] **Step 3: Run lint and tests**

Run: `npm run lint && npm test`
Expected: no errors; all tests pass.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Hoist SelectButton's styled() definition to module scope"
```

---

### Task 13: Component tests for `Header` and `CoinsTable`

**Files:**

- Create: `src/components/Header.test.jsx`
- Create: `src/components/CoinsTable.test.jsx`

**Interfaces:**

- Consumes: `CryptoContext`/`useCryptoState` (unchanged since Task 1's rename), `useFetch` (mocked via `vi.mock('../hooks/useFetch')` in the `CoinsTable` test — this isolates the component test from real network calls without needing to mock `axios` directly).

- [ ] **Step 1: Write `src/components/Header.test.jsx`**

```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';
import CryptoContext from '../CryptoContext';

function renderHeader() {
  return render(
    <MemoryRouter>
      <CryptoContext>
        <Header />
      </CryptoContext>
    </MemoryRouter>
  );
}

describe('Header', () => {
  it('renders the app title and defaults to INR', () => {
    renderHeader();
    expect(screen.getByText('CryptoTracker')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveTextContent('INR');
  });

  it('switches currency to USD when selected', async () => {
    renderHeader();
    const user = userEvent.setup();
    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: 'USD' }));
    expect(screen.getByRole('combobox')).toHaveTextContent('USD');
  });
});
```

- [ ] **Step 2: Run test, verify it passes**

Run: `npx vitest run src/components/Header.test.jsx`
Expected: `2 passed`.

- [ ] **Step 3: Write `src/components/CoinsTable.test.jsx`**

```jsx
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import CoinsTable from './CoinsTable';
import CryptoContext from '../CryptoContext';
import useFetch from '../hooks/useFetch';

vi.mock('../hooks/useFetch');

const MOCK_COINS = [
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'btc',
    image: 'bitcoin.png',
    current_price: 50000,
    price_change_percentage_24h: 2.5,
    market_cap: 900000000000,
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'eth',
    image: 'ethereum.png',
    current_price: 3000,
    price_change_percentage_24h: -1.2,
    market_cap: 400000000000,
  },
];

function renderTable() {
  return render(
    <MemoryRouter>
      <CryptoContext>
        <CoinsTable />
      </CryptoContext>
    </MemoryRouter>
  );
}

afterEach(() => {
  vi.resetAllMocks();
});

describe('CoinsTable', () => {
  it('renders a row per coin once loaded', () => {
    useFetch.mockReturnValue({ data: MOCK_COINS, loading: false, error: null });
    renderTable();
    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    expect(screen.getByText('Ethereum')).toBeInTheDocument();
  });

  it('filters rows via the search box', async () => {
    useFetch.mockReturnValue({ data: MOCK_COINS, loading: false, error: null });
    renderTable();
    const user = userEvent.setup();
    await user.type(
      screen.getByLabelText('Search for Crypto Currency....'),
      'bitcoin'
    );
    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    expect(screen.queryByText('Ethereum')).not.toBeInTheDocument();
  });

  it('shows an error message when the fetch fails', () => {
    useFetch.mockReturnValue({
      data: null,
      loading: false,
      error: new Error('network down'),
    });
    renderTable();
    expect(
      screen.getByText("Couldn't load coin prices. Please try again later.")
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Run test, verify it passes**

Run: `npx vitest run src/components/CoinsTable.test.jsx`
Expected: `3 passed`.

- [ ] **Step 5: Run the full test suite**

Run: `npm test`
Expected: all tests across the project pass (api, formatNumber, useFetch, Header, CoinsTable).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Add component tests for Header and CoinsTable"
```

---

### Task 14: Final verification pass

**Files:** none (verification only)

- [ ] **Step 1: Full lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 2: Full test suite**

Run: `npm test`
Expected: all tests pass.

- [ ] **Step 3: Production build + preview**

Run: `npm run build`
Expected: succeeds with no errors.

Run: `npm run preview`, open the printed URL.

- [ ] **Step 4: Manual smoke test against the preview build**

Walk through, in the browser:

1. Homepage loads: banner, trending carousel (auto-scrolling), coin table.
2. Switch currency USD ↔ INR in the header — carousel and table prices update.
3. Search for a coin whose filtered result count isn't a multiple of 10 — pagination page count and last page are correct (Task 9 fix).
4. While on page 2+, change the search text — view resets to page 1 (Task 9 fix).
5. Click into a coin — detail page loads with image/description/rank/price/market-cap and a price chart.
6. Click through all 4 chart day-range buttons — chart updates cleanly each time, no console errors (Task 11 fix).
7. Navigate to `/coins/not-a-real-id` directly — error message shown, not a blank/broken page (Task 10 addition).
8. Open devtools console throughout — confirm no errors and no leftover `console.log` output.

- [ ] **Step 5: Commit (only if step 4 surfaced fixes; otherwise nothing to commit)**

If any issues were found and fixed during manual verification:

```bash
git add -A
git commit -m "Fix issues found during final modernization verification"
```
