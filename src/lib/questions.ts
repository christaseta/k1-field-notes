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
        id: "kiosk_vs_counter",
        type: "multiple_choice",
        prompt:
          "This week, how would you describe the mix between customers using the kiosk vs. coming to the counter?",
        choices: [
          { value: "almost_all_kiosk", label: "Almost everyone went to the kiosk" },
          { value: "more_kiosk", label: "More kiosk than counter" },
          { value: "even", label: "Pretty even split" },
          { value: "more_counter", label: "More counter than kiosk" },
          { value: "almost_all_counter", label: "Almost everyone came to the counter" },
        ],
      },
      {
        id: "stuck_point",
        type: "open",
        prompt:
          "Think about the moments this week where customers got confused or stuck. What's the most common place that happens?",
        placeholder: "Where in the flow does it happen, and what do they do?",
      },
      {
        id: "seller_preparedness",
        type: "multiple_choice",
        prompt:
          "This week, how prepared did you feel to support customers who had trouble with the kiosk?",
        choices: [
          { value: "very", label: "Very prepared, I knew what to do" },
          { value: "mostly", label: "Mostly prepared, a few things caught me off guard" },
          { value: "somewhat", label: "Somewhat prepared, I was figuring it out as I went" },
          { value: "not_very", label: "Not very prepared, I wasn't sure how to help" },
        ],
      },
      {
        id: "team_should_know",
        type: "open",
        prompt:
          "What's one thing that happened this week — good or bad — that you think the team building this kiosk should know about?",
        placeholder: "Share a moment, observation, or piece of feedback…",
      },
      {
        id: "week_easier_harder",
        type: "multiple_choice",
        prompt: "Did the kiosk make your week easier or harder?",
        choices: [
          { value: "way_easier", label: "Way easier" },
          { value: "little_easier", label: "A little easier" },
          { value: "no_difference", label: "No difference yet" },
          { value: "little_harder", label: "A little harder" },
          { value: "lot_harder", label: "A lot harder" },
        ],
      },
      {
        id: "easier_harder_why",
        type: "open",
        prompt:
          "What's making it feel that way? Please share one example from this week.",
        placeholder: "One specific example from this week…",
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
