import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "[Supabase] Missing env vars. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env"
  );
}

const sleep = (ms: number) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });

const customFetch: typeof fetch = async (input, init) => {
  const method = init?.method ?? "GET";
  const requestUrl = typeof input === "string" ? input : input.url;
  const maxRetries = method === "GET" ? 2 : 0;
  let attempt = 0;

  while (true) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(input, {
        ...init,
        signal: controller.signal,
      });

      window.clearTimeout(timeout);
      return response;
    } catch (error: any) {
      window.clearTimeout(timeout);

      const isAbort = error?.name === "AbortError";
      const isNetworkError =
        isAbort ||
        error instanceof TypeError ||
        String(error?.message || "").toLowerCase().includes("failed to fetch");

      if (isNetworkError && attempt < maxRetries) {
        attempt += 1;
        console.warn(
          `[Supabase] ${method} retry ${attempt}/${maxRetries} after network failure: ${requestUrl}`
        );
        await sleep(400 * attempt);
        continue;
      }

      console.error("[Supabase] Network request failed", {
        url: requestUrl,
        method,
        online: navigator.onLine,
        message: error?.message || "Unknown fetch error",
      });

      throw error;
    }
  }
};

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "", {
  global: {
    fetch: customFetch,
  },
}) as any;
