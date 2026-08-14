import { NextResponse } from "next/server";

export async function GET() {
  const aiKey = process.env.AI_GATEWAY_API_KEY || "";
  const vercelAiKey = process.env.VERCEL_AI_GATEWAY_API_KEY || "";

  return NextResponse.json({
    status: "ok",
    nodeEnv: process.env.NODE_ENV || "unknown",
    vercelEnv: process.env.VERCEL_ENV || "local",
    aiGatewayKey: {
      present: Boolean(aiKey),
      prefix: aiKey ? aiKey.slice(0, 6) + "..." : "NONE",
      length: aiKey.length,
      validFormat: aiKey.startsWith("vck_"),
    },
    vercelAiGatewayKey: {
      present: Boolean(vercelAiKey),
      prefix: vercelAiKey ? vercelAiKey.slice(0, 6) + "..." : "NONE",
      length: vercelAiKey.length,
      validFormat: vercelAiKey.startsWith("vck_"),
    },
    timestamp: new Date().toISOString(),
  });
}
