export type FeedbackKind = "daily" | "weekly" | "spontaneous";

export type StoredAnswer = {
  question_id: string;
  prompt: string;
  type: "multiple_choice" | "open";
  answer: string | null;
  input_method: "voice" | "text" | "choice";
};

export type Seller = {
  id: string;
  email: string;
  display_name: string | null;
  weekly_day_pref: number | null;
  timezone: string;
  created_at: string;
};

export type Submission = {
  id: string;
  seller_id: string;
  kind: FeedbackKind;
  question_set_id: string | null;
  answers: StoredAnswer[];
  note: string | null;
  tags: string[];
  submitted_at: string;
};
