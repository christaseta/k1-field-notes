import { NextResponse } from "next/server";
import { sendSlackNotification } from "@/lib/slack";

export async function GET() {
  try {
    console.log("Starting test slack submission...");
    
    // Simulate a weekly submission
    await sendSlackNotification({
      kind: "weekly",
      seller: {
        display_name: "Test Seller",
        business_name: "Test Business",
      },
      answers: [
        {
          question_id: "test-q1",
          prompt: "How was your week?",
          type: "open",
          answer: "It was great!",
          input_method: "text",
        },
        {
          question_id: "test-q2", 
          prompt: "Any issues?",
          type: "multiple_choice",
          answer: "none",
          input_method: "choice",
        },
      ],
      note: null,
      tags: [],
    });
    
    console.log("Test slack submission completed!");
    
    return NextResponse.json({ success: true, message: "Slack notification sent!" });
  } catch (error) {
    console.error("Test slack submission error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
}
