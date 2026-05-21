# Daily & Weekly Check-In Sheets

Snapshot of how the daily and weekly check-in flows work today: what
triggers them, what gets rendered, what data they read/write, and where
each piece lives in the code. Treat this as the source of truth so we
don't lose context the next time the repo or a deployed snapshot
disagrees.

---

## 1. Entry points (home tiles)

Both flows start as tiles on `/home`. The tile renders via
`<FeedbackCard>` and is wrapped in `<FeedbackCardSheet>`, which is the
button that opens the sheet.

| Tile     | Label                         | Pill                         | Trigger                |
| -------- | ----------------------------- | ---------------------------- | ---------------------- |
| Daily    | "Daily · Optional"            | `dailyStatus(submittedToday)`| Tap to open the sheet  |
| Weekly   | "Weekly · Required"           | `weeklyStatus(...)`          | Tap to open the sheet  |

- **Tile visual** — `bg-#141414`, `rounded-3xl`, `min-h-[172px]`,
  `p-6`, headline + subtitle pinned to the bottom via `mt-auto`. Tiles
  sit 8px from the screen edge (`-mx-2` on the section over the page's
  `px-4` wrapper).
- **Status pill** — outlined gray (`border-#595959`), `#B8B8B8` 12px
  Cash Sans Mono label, trailing colored dot. Dot colors:
  - Ready (daily): `#00C611`
  - Due Friday (weekly): `#F97316`
  - Overdue (weekly, Saturday only): `#F25B3D`
  - Complete: `#595959`
- **Disabled when done** — once submitted, the button below the card is
  disabled (`done && !open`); the tile opacity drops to 70% and it
  drops to the bottom of the list via the `.sort((a,b)=>Number(a.done)
  - Number(b.done))` on home.

Code:
- [`src/app/(authed)/home/page.tsx`](../src/app/(authed)/home/page.tsx)
- [`src/components/FeedbackCard.tsx`](../src/components/FeedbackCard.tsx)
- [`src/components/FeedbackCardSheet.tsx`](../src/components/FeedbackCardSheet.tsx)
- [`src/components/StatusPill.tsx`](../src/components/StatusPill.tsx)
- [`src/lib/status.ts`](../src/lib/status.ts)

---

## 2. Sheet shell

Tapping a tile opens `<Sheet open>` (full variant) which renders
`<QuestionRunner variant="sheet" />` inside.

- **Backdrop** — `bg-black/60`, click-to-dismiss.
- **Sheet surface** — `bg-#141414`, `rounded-t-3xl`, slides up from
  `translate-y-full` to `translate-y-0` over 300ms ease-out.
- **Top offset** — full variant uses inline `top: 72px`, so all sheets
  sit 72px below the top of the page.
- **Body scroll lock** — `document.body.style.overflow = "hidden"`
  while open.
- **Close** — `<CloseIcon>` X button in the top right, plus Escape.

Code:
- [`src/components/Sheet.tsx`](../src/components/Sheet.tsx)
- [`src/components/QuestionRunner.tsx`](../src/components/QuestionRunner.tsx)

---

## 3. Question runner header

Each sheet renders the same three-row header at the top:

1. **Top bar** — `1 / 3` step counter (left) · "Daily update" or
   "Weekly update" title (center) · X close (right).
2. **Progress bar** — `<SegmentedProgress current={step+1} total={n}>`.
3. **Question body** — varies by question type (see below).

Pinned at the bottom: a single full-width action button on a
`bg-#141414` strip. Label and behavior:

| State                | Label         | Background                       |
| -------------------- | ------------- | -------------------------------- |
| Mid-flow             | "Next"        | white when answered, #1A1A1A otherwise |
| Last question        | "Submit"      | same                             |
| Submitting           | "Submitting…" | disabled                         |
| After submit         | "Back to home"| white                            |

Done state replaces the question body with a check icon + "Thanks!
Your note is in." / "The K1 team will see this in real time."

---

## 4. Question types

`Question` is a discriminated union in
[`src/lib/questions.ts`](../src/lib/questions.ts):

### 4a. `multiple_choice`

Renders via `<MultipleChoiceQuestion>`: a vertical stack of pill rows.

- **Spacing** — `space-y-1` (4px gap between rows).
- **Row** — `w-full`, `px-6`, `min-h-[64px]`, `rounded-full`, 16px
  medium label.
- **Unselected** — `bg-#1A1A1A`, hover `#222`.
- **Selected** — `bg-white text-black`.
- **Behavior** — single-select, advances via the Next button (no
  auto-advance). Submit button stays disabled until a choice is made.

### 4b. `open` (free text + voice + attachments)

Renders via `<OpenAnswerInput>` (or the inline equivalent on
`/spontaneous`).

- **Layout** — the prompt becomes a centered hero (`text-[28px]
  leading-[32px] font-normal`) that fills the empty space; the input
  card is pinned at the bottom.
- **Card** — `bg-#1a1a1a`, `rounded-3xl`, `p-3`. Inner column with
  `gap-3` between the attachment tray + textarea, and `gap-[56px]`
  between that block and the button row.
- **Textarea** — `rows={2}`, autofocus, transparent background, 16px
  text, placeholder `#595959`.
- **+ menu** — 40×40 `bg-#2a2a2a` round button. Opens an inline
  popover (no sheet) with two items:
  - "Take photo or video" → hidden `<input type=file accept=image/*,
    video/*" capture=environment>`
  - "Choose from library" → hidden `<input type=file multiple
    accept=image/*,video/*">`
  - Both gray out at the 4-file cap.
- **Mic button** — 40×40 white circle with black mic icon when idle;
  inverts to black circle + white icon while listening.
- **Send button** — 40×40 white circle with up-arrow. Enabled when
  the textarea has text OR there is at least one attachment.
- **Attachment chips** — 56×56 thumbnail above the textarea, video
  gets a play-triangle overlay, X to remove. Max 4 attachments.
- **Conditional questions** — open questions can declare `showWhen:
  { questionId, whenAnswerIn: [...] }` to only appear after a
  matching multiple-choice answer.

Code:
- [`src/components/OpenAnswerInput.tsx`](../src/components/OpenAnswerInput.tsx)
- [`src/components/AttachmentTray.tsx`](../src/components/AttachmentTray.tsx)
- [`src/components/MultipleChoiceQuestion.tsx`](../src/components/MultipleChoiceQuestion.tsx)
- [`src/hooks/useSpeechRecognition.ts`](../src/hooks/useSpeechRecognition.ts)

---

## 5. Current question content

Defined in [`src/lib/questions.ts`](../src/lib/questions.ts). The
weekly set is selected by `currentWeeklySet()` keyed off the program
week.

### Daily (`dailyQuestionSet`, id `daily-default`)

1. **kiosk_interactions** — multiple choice
   - Prompt: "How did customer interactions with the kiosk go today?"
   - Choices: No issues · Minor hiccups · Noticeable friction · Significant problems
2. **kiosk_moment** — open (conditional)
   - Prompt: "What kept coming up? Describe one moment that stood out."
   - Placeholder: "A specific moment, customer reaction, or pattern you noticed…"
   - Shown when kiosk_interactions ∈ { minor, noticeable, significant }
3. **voice_comfort** — multiple choice
   - Prompt: "On the whole did customers seem comfortable talking to the AI voice, or did they hesitate?"
   - Choices: Comfortable · Hesitant at first, then okay · Uncomfortable · Mixed

### Weekly — Week 1 (`weekly-2026-w22`)

1. **kiosk_avoidance** — multiple choice
   - Prompt: "How often, if at all, did customers choose to avoid the kiosk and come to you/your staff instead this week?"
   - Choices: Rarely · A few times · Pretty often · Daily
2. **stuck_point** — open
   - Prompt: "What's the most common point where customers seem to get stuck or confused at the kiosk?"
   - Placeholder: "Where in the flow does it happen, and what do they do?"

The weekly set is a single object today. To rotate weekly content,
either edit it in-place or add the `WEEKLY_SETS` lookup keyed by ISO
week and update `currentWeeklySet()` to return the right set.

---

## 6. Submission + status

On Submit, the runner calls `submitFeedback({ kind, answers,
inputMethods })` which inserts into the Supabase `submissions` table.

- **Demo mode** — when the `demo=true` cookie is present (set by
  visiting `?demo=true` once),
  [`src/app/actions/submit.ts`](../src/app/actions/submit.ts) returns
  early without writing, so demo reviewers can complete the flow
  without polluting real data.
- **Daily status** — `dailyStatus(submittedToday)` flips to `complete`
  the moment the daily submission lands.
- **Weekly status** — `weeklyStatus(submittedThisWeek, now)`:
  - `complete` once submitted this period
  - `overdue` on Saturday before the new week rolls over Sunday
  - otherwise `due` (label "DUE FRIDAY")
- The home tiles re-read these on the next request via
  `supabase.from("submissions").select(...).limit(1)` on
  `kind = 'daily'` (today) and `kind = 'weekly'` + matching
  `question_set_id`.

---

## 7. Transitions & polish

- Home → sheet — Sheet slides up over 300ms ease-out, backdrop fades in
  over 200ms.
- Sheet close — X (top right) reverses the slide; outside-click or
  Escape do the same.
- Question step → next step — `.animate-step-enter` (220ms cubic-bezier
  fade + 12px translate-x reveal) on the question body.
- Done state — `.animate-fade-in` (260ms ease-out) on the thanks panel.

CSS lives in [`src/app/globals.css`](../src/app/globals.css).

---

## 8. Open work (not in this PR)

- Attachment uploads are currently Phase-1 (UI only — files held in
  component state as Blob URLs). Phase 2 is wiring up Supabase
  Storage + persisting attachment URLs on the submission row.
- Tags on open answers are not collected today (the `tags: []` field
  is submitted empty for spontaneous; daily/weekly never had a tag
  picker).
- Weekly content beyond Week 1 isn't authored yet — the weekly set
  needs additional entries in `questions.ts` or a database-backed
  lookup before the pilot moves past week 1.
