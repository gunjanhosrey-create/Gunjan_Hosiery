import { supabase } from "@/db/supabase";

/**
 * Safely debug Supabase connection. Call from useEffect on app load.
 * Check browser console for results. Never logs full API keys.
 */
export async function debugSupabaseConnection() {
  console.group("[Supabase Debug]");
  try {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    console.log("URL set:", !!url);
    console.log("Key set:", !!key);
    console.log("URL (safe):", url ? url.slice(0, 30) + "..." : "MISSING");

    const { data, error } = await supabase
      .from("products")
      .select("id")
      .limit(1);
    console.log(
      "Test query (products):",
      error ? "FAILED" : "OK",
      error?.message || ""
    );
    if (error) console.error("Full error:", error);
    if (data) console.log("Sample row:", data[0]);

    const { data: catData, error: catError } = await supabase
      .from("categories")
      .select("*");
    console.log("categories:", catData, catError);

    const { data: inquiryData, error: inquiryError } = await supabase
      .from("inquiries")
      .select("id, status, email")
      .limit(3);
    console.log(
      "Test query (inquiries):",
      inquiryError ? "FAILED" : "OK",
      inquiryError?.message || ""
    );
    if (inquiryError) console.error("Inquiries error:", inquiryError);
    if (inquiryData) console.log("Inquiry sample:", inquiryData);

    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("id, status, customer_name")
      .limit(3);
    console.log(
      "Test query (orders):",
      orderError ? "FAILED" : "OK",
      orderError?.message || ""
    );
    if (orderError) console.error("Orders error:", orderError);
    if (orderData) console.log("Order sample:", orderData);
  } catch (e) {
    console.error("Supabase check failed:", e);
  }
  console.groupEnd();
}
