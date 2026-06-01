import { NextResponse } from "next/server";

export async function GET() {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  
  const debug = {
    webhookExists: !!webhookUrl,
    webhookPrefix: webhookUrl ? webhookUrl.substring(0, 40) + "..." : "NOT SET",
    allEnvKeys: Object.keys(process.env).filter(k => k.includes("SLACK") || k.includes("slack")),
  };
  
  // If webhook exists, try to send a test message
  if (webhookUrl) {
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "✅ Debug endpoint test - Slack integration is working!",
        }),
      });
      
      return NextResponse.json({
        ...debug,
        testResult: response.ok ? "SUCCESS" : `FAILED: ${response.status}`,
      });
    } catch (error) {
      return NextResponse.json({
        ...debug,
        testResult: `ERROR: ${error}`,
      });
    }
  }
  
  return NextResponse.json(debug);
}
