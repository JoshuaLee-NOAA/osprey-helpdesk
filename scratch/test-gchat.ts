import { sendGChatMessage } from "../src/lib/workspace";

async function runTest() {
  console.log("====================================================");
  console.log("🚀 DISPATCHING GOOGLE CHAT WEBHOOK TEST MESSAGE...");
  console.log("====================================================");
  
  const result = await sendGChatMessage(
    "🔔 Hello from Osprey IT Helpdesk! This is a live connectivity verification of your Google Chat space integration. Live agent alerts are now active! 🎉"
  );
  
  if (result.success) {
    console.log("✅ SUCCESS! Google Chat webhook dispatched cleanly.");
  } else {
    console.error("❌ FAILED:", result.error);
  }
  console.log("====================================================");
}

runTest();
