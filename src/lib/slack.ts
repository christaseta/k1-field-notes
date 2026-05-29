/**
 * Slack integration for K1 Field Notes
 * Sends notifications to Slack when sellers submit feedback
 */

import type { FeedbackKind, StoredAnswer, Seller } from "./db-types";
import { displayAnswer } from "./questions";

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

type SlackBlock =
  | { type: "header"; text: { type: "plain_text"; text: string; emoji?: boolean } }
  | { type: "section"; text: { type: "mrkdwn"; text: string }; accessory?: object }
  | { type: "divider" }
  | { type: "context"; elements: Array<{ type: "mrkdwn"; text: string }> };

type SubmissionNotification = {
  kind: FeedbackKind;
  seller: Pick<Seller, "display_name" | "business_name">;
  answers?: StoredAnswer[];
  note?: string | null;
  tags?: string[];
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
  if (!SLACK_WEBHOOK_URL) {
    console.warn("SLACK_WEBHOOK_URL not configured, skipping notification");
    return;
  }

  const blocks = buildSlackBlocks(notification);

  try {
    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        blocks,
        // Fallback text for notifications
        text: `New ${formatKindLabel(notification.kind)} from ${notification.seller.display_name || "a seller"}`,
      }),
    });

    if (!response.ok) {
      console.error("Slack notification failed:", response.status, await response.text());
    }
  } catch (error) {
    // Don't throw - we don't want Slack failures to break submissions
    console.error("Failed to send Slack notification:", error);
  }
}
