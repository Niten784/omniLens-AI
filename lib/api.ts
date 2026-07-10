const FALLBACK_DOMAIN = "1628c922-7e4a-427c-83a7-b32ecfabf099-00-15aw55u3ar6li.pike.replit.dev";

export function getApiBaseUrl(): string {
  const domain = process.env.EXPO_PUBLIC_DOMAIN || FALLBACK_DOMAIN;
  return `https://${domain}`;
}

export interface VisionTag {
  label: string;
  category: string;
  detail: string;
  confidence: number;
}

export interface VisionAnalyzeResult {
  summary: string;
  tags: VisionTag[];
}

export async function analyzeVisionFrame(
  imageBase64: string,
  focus: string | null,
): Promise<VisionAnalyzeResult> {
  const res = await fetch(`${getApiBaseUrl()}/api/vision/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64, focus, mimeType: "image/jpeg" }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: `Request failed (${res.status})` }));
    throw new Error(body.error || `Request failed (${res.status})`);
  }

  return res.json();
}
