import { ACCESS_TOKEN_COOKIE } from "@/lib/session";
import { readCookie } from "@/services/session/state";

/**
 * The certified invoice PDF (`GET /orders/:orderId/download-invoice-pdf`),
 * saved by the browser (Phase 19). A file rather than JSON, so it is fetched
 * here instead of through the JSON client; the API's refusal is still read as
 * its own sentence. Measured: while `invoiceSync.isSynced` is false the API
 * answers 500 "Invoice is not synced yet with Pasta Digital.", which is why the
 * button only appears on an order whose invoice is synced.
 *
 * Resolves `null` on success, or the sentence to show.
 */
export async function downloadInvoice(orderId: string): Promise<string | null> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  const token = readCookie(ACCESS_TOKEN_COOKIE);
  if (!base || !token) return "";
  try {
    const response = await fetch(
      `${base}/orders/${encodeURIComponent(orderId)}/download-invoice-pdf`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Accept-Language": document.documentElement.lang.slice(0, 2) || "pt",
        },
      },
    );
    if (!response.ok || !response.headers.get("content-type")?.includes("pdf")) {
      const body = (await response.json().catch(() => ({}))) as { message?: string };
      return body.message ?? "";
    }
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement("a");
    link.href = url;
    link.download = `${orderId}.pdf`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
    return null;
  } catch {
    return "";
  }
}
