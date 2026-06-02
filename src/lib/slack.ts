/**
 * Slack integration for K1 Field Notes
 * Sends notifications to Slack when sellers submit feedback
 */

import type { FeedbackKind, StoredAnswer, Seller } from "./db-types";
import { displayAnswer } from "./questions";

// Read inside function to ensure it's available in serverless environment
function getSlackWebhookUrl() {
  return process.env.SLACK_WEBHOOK_URL;
}

type SlackBlock =
  | { type: "header"; text: { type: "plain_text"; text: string; emoji?: boolean } }
  | { type: "section"; text: { type: "mrkdwn"; text: string }; accessory?: object }
  | { type: "divider" }
  | { type: "context"; elements: Array<{ type: "mrkdwn"; text: string }> }
  | { type: "image"; image_url: string; alt_text: string; title?: { type: "plain_text"; text: string } };

type SubmissionNotification = {
  kind: FeedbackKind;
  seller: Pick<Seller, "display_name" | "business_name">;
  answers?: StoredAnswer[];
  note?: string | null;
  tags?: string[];
  mediaUrls?: string[];
};

function formatKindEmoji(kind: FeedbackKind): string {
  switch (kind) {
    case "daily":
      return "☀️";
    case "weekly":
      return "📅";
    case "spontaneous":
      return "💡";
  }
}

function formatKindLabel(kind: FeedbackKind): string {
  switch (kind) {
    case "daily":
      return "Daily Check-in";
    case "weekly":
      return "Weekly Check-in";
    case "spontaneous":
      return "Spontaneous Note";
  }
}

function buildSlackBlocks(notification: SubmissionNotification): SlackBlock[] {
  const { kind, seller, answers, note, tags } = notification;
  const blocks: SlackBlock[] = [];

  // Header
  blocks.push({
    type: "header",
    text: {
      type: "plain_text",
      text: `${formatKindEmoji(kind)} New ${formatKindLabel(kind)} Submission`,
      emoji: true,
    },
  });

  // Seller info
  const sellerName = seller.display_name || "Unknown Seller";
  const businessName = seller.business_name || "Unknown Business";
  blocks.push({
    type: "section",
    text: {
      type: "mrkdwn",
      text: `*Seller:* ${sellerName}\n*Business:* ${businessName}`,
    },
  });

  blocks.push({ type: "divider" });

  // For daily/weekly: show Q&A pairs
  if (answers && answers.length > 0) {
    for (const answer of answers) {
      const displayedAnswer = displayAnswer(answer) || "_No response_";
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Q: ${answer.prompt}*\n${displayedAnswer}`,
        },
      });
    }
  }

  // For spontaneous: show the note
  if (kind === "spontaneous" && note) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Note:*\n${note}`,
      },
    });

    // Show tags if present
    if (tags && tags.length > 0) {
      blocks.push({
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `🏷️ Tags: ${tags.map((t) => `\`${t}\``).join(" ")}`,
          },
        ],
      });
    }
  }

  // Media attachments (photos/videos)
  if (notification.mediaUrls && notification.mediaUrls.length > 0) {
    blocks.push({ type: "divider" });
    
    // Add a label for media section
    blocks.push({
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `📎 *${notification.mediaUrls.length} attachment${notification.mediaUrls.length > 1 ? "s" : ""}*`,
        },
      ],
    });

    for (let i = 0; i < notification.mediaUrls.length; i++) {
      const url = notification.mediaUrls[i];
      const isVideo = url.match(/\.(mp4|mov|webm|avi)$/i);
      
      if (isVideo) {
        // Slack webhooks don't support video blocks, so we link to it
        blocks.push({
          type: "section",
          text: {
            type: "mrkdwn",
            text: `🎥 <${url}|Video ${i + 1}>`,
          },
        });
      } else {
        // Images can be displayed inline
        blocks.push({
          type: "image",
          image_url: url,
          alt_text: `Attachment ${i + 1}`,
          title: {
            type: "plain_text",
            text: `Photo ${i + 1}`,
          },
        });
      }
    }
  }

  // Timestamp footer
  blocks.push({
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: `Submitted at ${new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })} PT`,
      },
    ],
  });

  return blocks;
}

export async function sendSlackNotification(
  notification: SubmissionNotification
): Promise<void> {
  const webhookUrl = getSlackWebhookUrl();
  
  console.log("sendSlackNotification called with:", JSON.stringify(notification));
  console.log("SLACK_WEBHOOK_URL exists:", !!webhookUrl);
  console.log("SLACK_WEBHOOK_URL value:", webhookUrl ? webhookUrl.substring(0, 50) + "..." : "NOT SET");
  
  if (!webhookUrl) {
    console.warn("SLACK_WEBHOOK_URL not configured, skipping notification");
    return;
  }

  const blocks = buildSlackBlocks(notification);

  try {
    console.log("Sending Slack notification...");
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        blocks,
        // Fallback text for notifications
        text: `New ${formatKindLabel(notification.kind)} from ${notification.seller.display_name || "a seller"}`,
      }),
    });

    console.log("Slack response status:", response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Slack notification failed:", response.status, errorText);
    } else {
      console.log("Slack notification sent successfully!");
    }
  } catch (error) {
    // Don't throw - we don't want Slack failures to break submissions
    console.error("Failed to send Slack notification:", error);
  }
}
