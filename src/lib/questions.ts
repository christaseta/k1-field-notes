/**
 * Question authoring lives here for the v1 alpha. Research + Design own this
 * file. Editing: change a prompt, add an option, swap a question, then redeploy.
 *
 * Once the question set stabilizes we can move authoring to a Supabase table
 * with an admin UI; for now keeping it as code keeps reviews + history obvious.
 */

export type Choice = { value: string; label: string };

export type Question =
  | {
      id: string;
      type: "multiple_choice";
      prompt: string;
      choices: Choice[];
      // If set, this question is only shown when the parent's answer matches one of `whenAnswerIn`.
      showWhen?: { questionId: string; whenAnswerIn: string[] };
    }
  | {
      id: string;
      type: "open";
      prompt: string;
      placeholder?: string;
      showWhen?: { questionId: string; whenAnswerIn: string[] };
    };

export type QuestionSet = {
  id: string;
  title: string;
  questions: Question[];
};

// ─── Daily check-in ─────────────────────────────────────────────────────────
// Shown when the seller opens the app on a given day. Optional; no penalty for skipping.
export const dailyQuestionSet: QuestionSet = {
  id: "daily-default",
  title: "Daily check-in",
  questions: [
    {
      id: "kiosk_usage",
      type: "multiple_choice",
      prompt: "How many times did customers use the kiosk today?",
      choices: [
        { value: "most_or_all", label: "Most or all orders went through it" },
        { value: "half", label: "About half and half" },
        { value: "few", label: "A few customers used it" },
        { value: "none", label: "No one really used it today" },
        { value: "not_around", label: "I wasn't around the kiosk much today" },
      ],
    },
    {
      id: "kiosk_experience",
      type: "multiple_choice",
      prompt: "How did it go with customers who tried the kiosk?",
      choices: [
        { value: "smooth", label: "Smooth, most got through without help" },
        { value: "nudge", label: "A few needed a nudge or question answered" },
        { value: "stuck", label: "Many got stuck and needed help" },
        { value: "rough", label: "It was a rough day at the kiosk" },
      ],
    },
    {
      id: "kiosk_moment",
      type: "open",
      prompt: "What kept coming up? Walk us through one moment that stood out.",
      placeholder: "A specific moment, customer reaction, or pattern you noticed…",
      showWhen: {
        questionId: "kiosk_experience",
        whenAnswerIn: ["stuck", "rough"],
      },
    },
    {
      id: "voice_usage",
      type: "multiple_choice",
      prompt: "Were customers talking to the AI voice today?",
      choices: [
        { value: "most", label: "Yes, most were talking to it" },
        { value: "mixed", label: "Mixed, some were, some weren't" },
        { value: "few", label: "A few tried it, but most stayed silent or tapped instead" },
        { value: "avoided", label: "Not really, customers mostly avoided the voice altogether" },
      ],
    },
    {
      id: "voice_observation",
      type: "open",
      prompt:
        "What specifically did you notice when customers heard the kiosk speak to them or they spoke to it? Describe what you saw or heard.",
      placeholder: "What you saw or heard…",
    },
  ],
};

// ─── Weekly check-in ────────────────────────────────────────────────────────
// Required, ~5 minutes. Versioned by week so the dashboard can show how
// questions changed over time. Add a new entry each week.
export const weeklyQuestionSets: QuestionSet[] = [
  {
    id: "weekly-2026-w22",
    title: "Weekly check-in — Week 1",
    questions: [
      {
        id: "kiosk_avoidance",
        type: "multiple_choice",
        prompt:
          "How often, if at all, did customers choose to avoid the kiosk and come to you/your staff instead this week?",
        choices: [
          { value: "rarely", label: "Rarely" },
          { value: "few", label: "A few times" },
          { value: "often", label: "Pretty often" },
          { value: "daily", label: "Daily" },
        ],
      },
      {
        id: "stuck_point",
        type: "open",
        prompt:
          "What's the most common point where customers seem to get stuck or confused at the kiosk?",
        placeholder: "Where in the flow does it happen, and what do they do?",
      },
    ],
  },
];

// Returns the "current" weekly set. For now: the most recent entry. Later we
// can match to the seller's current week by date.
export function currentWeeklySet(): QuestionSet {
  const set = weeklyQuestionSets[weeklyQuestionSets.length - 1];
  if (!set) throw new Error("No weekly question sets configured");
  return set;
}

export const SPONTANEOUS_PROMPT =
  "See something at the kiosk? Just hit record and tell us about it — no need to organize your thoughts, just talk.";
