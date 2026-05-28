# React + Vite + Supabase Debugging Guide

## Root Cause (Fixed)

**Your issue was caused by:** `HomePage.tsx` used `featuredProducts` and `newArrivals` which were **never defined**. When loading finished, `ProductCarousel` received `undefined`, causing `undefined.length` / `undefined.map` and a crash.

**Fix applied:** Define `featuredProducts` and `newArrivals` from the `products` state.

---

## Step-by-Step Debugging Checklist

### 1. Check Browser Console First

Open DevTools (F12) → Console tab. Look for:

| Error | Likely Cause | Fix |
|-------|--------------|-----|
| `TypeError: Cannot read property 'length' of undefined` | Passing undefined to component expecting array | Ensure all array props are defined or default to `[]` |
| `TypeError: Cannot read property 'map' of undefined` | Same as above | Add `products ?? []` or early return |
| `useAuth must be used within AuthProvider` | Using `useAuth()` without wrapping in `AuthProvider` | Add `AuthProvider` or remove auth usage |
| `Failed to fetch` / CORS | Supabase URL wrong or RLS blocking | See Supabase section below |
| `Invalid API key` | Wrong or missing `VITE_SUPABASE_ANON_KEY` | Check `.env` and restart dev server |

### 2. Check for Infinite Re-renders / useEffect Loops

**Symptoms:** Page freezes, browser tab becomes unresponsive, console floods with logs.

**Add this at top of suspicious components:**

```tsx
useEffect(() => {
  console.log('[ComponentName] render count');
});
```

If it logs hundreds of times per second → infinite loop.

**Common causes:**

- `useEffect` with object/array in deps that changes every render:

```tsx
// BAD
useEffect(() => { ... }, [{ id: 1 }]); // New object every render

// GOOD
useEffect(() => { ... }, []);
// or use stable reference: useMemo(() => ({ id: 1 }), [])
```

- `navigate()` or `setState` inside `useEffect` without proper guards:

```tsx
// BAD - can cause redirect loop
useEffect(() => {
  if (!user) navigate('/login');
}, [user, navigate]); // navigate changes? Re-runs effect

// BETTER
useEffect(() => {
  if (loading) return;
  if (!user && !isPublicRoute) navigate('/login', { replace: true });
}, [user, loading, location.pathname]);
```

### 3. Check Routing

**Catch-all redirect:**

Your `App.tsx` has:

```tsx
<Route path="*" element={<Navigate to="/" replace />} />
```

Any unknown path (typos, `/favicon.ico`, etc.) redirects to `/`. That’s expected.

**Auth redirect loop:** If `RouteGuard` redirects to `/login`, but `/login` also uses `RouteGuard` and redirects again → loop. Ensure `/login` is in `PUBLIC_ROUTES`.

### 4. Environment Variables

**Vite:** Only `VITE_` prefixed vars are exposed to the client.

**.env:**
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

**Validation in code:**

```tsx
// In supabase.ts or a debug component
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL ? '✓ Set' : '✗ Missing');
console.log('Anon Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing');
```

**Important:** Restart `npm run dev` after changing `.env`.

### 5. Supabase / RLS

**RLS (Row Level Security):** If enabled and no policy allows read, queries return empty or error.

**Safe debug helper** – add to your project and call from a page or `useEffect`:

```tsx
// src/utils/supabase-debug.ts
import { supabase } from '@/db/supabase';

export async function debugSupabaseConnection() {
  console.group('[Supabase Debug]');
  try {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    console.log('URL set:', !!url);
    console.log('Key set:', !!key);
    console.log('URL (safe):', url?.slice(0, 30) + '...');

    const { data, error } = await supabase.from('products').select('id').limit(1);
    console.log('Test query (products):', error ? 'FAILED' : 'OK', error?.message || '');
    if (error) console.error('Full error:', error);
    if (data) console.log('Sample row:', data[0]);
  } catch (e) {
    console.error('Supabase check failed:', e);
  }
  console.groupEnd();
}
```

**Usage:** A ready-to-use helper exists at `src/utils/supabase-debug.ts`. Call it once on app load:

```tsx
import { debugSupabaseConnection } from '@/utils/supabase-debug';

// In HomePage useEffect or main.tsx
useEffect(() => {
  debugSupabaseConnection();
}, []);
```

Check the browser console for the output.

**RLS check in Supabase Dashboard:**

1. Table Editor → your table (e.g. `products`)
2. Check if RLS is enabled
3. Policies → ensure there’s a policy that allows `SELECT` for `anon` (or `authenticated` if you require login)

---

## Quick Fixes for Common Issues

### Page reload loop

- Remove any `window.location.reload()` or `location.href = ...` in effects
- Ensure auth redirect logic doesn’t redirect from public routes

### Unexpected redirect

- Log in `RouteGuard` / auth logic: `console.log('Redirecting because', { user, pathname, isPublic })`
- Confirm `PUBLIC_ROUTES` includes all routes that should be public

### App crash after load

- Add error boundaries
- Use optional chaining: `products?.length ?? 0`
- Default arrays: `products ?? []`

---

## Best Practices to Prevent Future Issues

1. **Default array props:**
   ```tsx
   <ProductCarousel products={featuredProducts ?? []} />
   ```

2. **Optional chaining:**
   ```tsx
   products?.map(...) ?? []
   ```

3. **Error boundary** around the app:
   ```tsx
   <ErrorBoundary fallback={<div>Something went wrong</div>}>
     <App />
   </ErrorBoundary>
   ```

4. **Validate env on startup** (as in `supabase.ts`) so missing config fails fast with a clear message.

5. **Centralize Supabase calls** and handle errors consistently instead of only `console.log`.

6. **Stable `useEffect` deps:** Avoid objects/arrays in deps unless memoized.

---

## Safe Supabase Debugging in Frontend

- **Never log full API keys** – only check if they’re set (`!!key`).
- **Log URLs partially** – e.g. `url?.slice(0, 30) + '...'`.
- Use the `debugSupabaseConnection()` helper above for one-off checks.
- Use Supabase Dashboard → Logs for server-side and auth issues.
- In development, you can temporarily add permissive RLS policies to confirm the issue is RLS-related, then tighten them.
