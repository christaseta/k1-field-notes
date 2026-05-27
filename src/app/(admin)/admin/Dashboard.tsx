"use client";

import Link from "next/link";
import { Fragment, useMemo, useState } from "react";

export type ParticipantSummary = { id: string; name: string; initials: string };

export type Spotlight = {
  submissionId: string;
  sellerId: string;
  sellerName: string;
  sellerInitials: string;
  questionId: string | null;
  questionPrompt: string | null;
  text: string;
  flagged: boolean;
};

export type WeekDigest = {
  weekId: string;
  responding: number;
  entries: number;
  flagged: number;
  themes: { label: string; count: number }[];
  spotlights: Spotlight[];
};

export type CompareQuestion = {
  id: string;
  kind: "MC" | "OPEN";
  prompt: string;
  choices?: { value: string; label: string }[];
  source: "daily" | "weekly" | "spontaneous";
};

export type CompareResponse = {
  submissionId: string;
  sellerId: string;
  sellerName: string;
  sellerInitials: string;
  weekId: string;
  weekShort: string;
  text: string | null;
  choiceValue: string | null;
  choiceLabel: string | null;
  flagged: boolean;
};

export type QuestionCompareData = {
  questions: CompareQuestion[];
  dist: Record<string, Record<string, Record<string, number>>>;
  responses: Record<string, CompareResponse[]>;
};

export type Study = {
  name: string;
  weeks: number;
  participants: number;
  entries: number;
  responseRate: number;
  flagged: number;
};

export type Week = {
  id: string;
  label: string;
  dates: string;
  startISO?: string;
  endISO?: string;
  theme?: string;
};

type Filters = {
  week: string;
  question: string;
  participant: string;
  hasMedia: boolean;
  flagged: boolean;
  search: string;
};

const DEFAULT_FILTERS: Filters = {
  week: "ALL",
  question: "ALL",
  participant: "ALL",
  hasMedia: false,
  flagged: false,
  search: "",
};

type TabId = "digest" | "compare";

const TABS: { id: TabId; label: string; hint: string }[] = [
  { id: "digest", label: "Weekly digest", hint: "Home" },
  { id: "compare", label: "Question compare", hint: "By prompt" },
];

export default function Dashboard({
  study,
  weeks,
  digests,
  compare,
  participants,
}: {
  study: Study;
  weeks: Week[];
  digests: WeekDigest[];
  compare: QuestionCompareData;
  participants: ParticipantSummary[];
}) {
  const [tab, setTab] = useState<TabId>("digest");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const activeFilterCount =
    (filters.week !== "ALL" ? 1 : 0) +
    (filters.question !== "ALL" ? 1 : 0) +
    (filters.participant !== "ALL" ? 1 : 0) +
    (filters.flagged ? 1 : 0) +
    (filters.search.trim() ? 1 : 0);

  return (
    <div className="wf-app">
      <header className="wf-topbar">
        <div className="wf-topbar__row">
          <div className="wf-brand">Field notes</div>
          <div className="wf-crumb">
            <b>{study.name}</b>
          </div>
          <div className="wf-stats">
            <span>
              <b>{study.participants}</b>participants
            </span>
            <span>
              <b>{study.weeks}</b>weeks
            </span>
            <span>
              <b>{study.entries}</b>entries
            </span>
            <span>
              <b>{Math.round(study.responseRate * 100)}%</b>response
            </span>
            <span>
              <b>{study.flagged}</b>flagged
            </span>
            <Link
              href="/admin/invite"
              style={{
                marginLeft: 12,
                padding: "6px 14px",
                borderRadius: 999,
                border: "1px solid var(--wf-line)",
                background: "var(--market-white)",
                color: "var(--wf-ink)",
                fontSize: 12,
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              + Invite seller
            </Link>
            {activeFilterCount > 0 && (
              <span
                style={{
                  marginLeft: 8,
                  padding: "3px 10px",
                  borderRadius: 999,
                  background: "var(--wf-ink)",
                  color: "var(--market-white)",
                  fontFamily: "var(--market-font-mono)",
                  fontSize: 11,
                }}
              >
                {activeFilterCount} filter{activeFilterCount === 1 ? "" : "s"} active
              </span>
            )}
          </div>
        </div>
      </header>

      <nav className="wf-tabs" aria-label="Dashboard view">
        <div className="wf-tabs__row">
          {TABS.map((v) => (
            <button
              key={v.id}
              type="button"
              className={"wf-tab" + (tab === v.id ? " is-active" : "")}
              onClick={() => setTab(v.id)}
            >
              {v.label}
            </button>
          ))}
        </div>
      </nav>

      <FilterBar
        filters={filters}
        setFilters={setFilters}
        weeks={weeks}
        study={study}
        questions={compare.questions}
        participants={participants}
      />

      <main className="wf-page">
        {tab === "digest" ? (
          <WeeklyDigest
            weeks={weeks}
            digests={digests}
            study={study}
            filters={filters}
          />
        ) : (
          <QuestionCompare
            weeks={weeks}
            compare={compare}
            study={study}
            filters={filters}
          />
        )}
      </main>
    </div>
  );
}

/* ───────────────── Shared components ───────────────── */

type Participant = { id: string; initials: string; name: string; role?: string; biz?: string };

function PChip({ p, size, hideMeta }: { p: Participant; size?: "lg" | "xl"; hideMeta?: boolean }) {
  return (
    <div className="pchip">
      <span className={"pchip__avatar" + (size === "lg" ? " lg" : size === "xl" ? " xl" : "")}>
        {p.initials}
      </span>
      <div>
        <div className="pchip__name">
          {p.name} <span className="pchip__id">{p.id}</span>
        </div>
        {!hideMeta && (
          <div className="pchip__meta">
            {p.role} · {p.biz}
          </div>
        )}
      </div>
    </div>
  );
}

function PChipMini({ p }: { p: Participant }) {
  return (
    <div className="pchip">
      <span className="pchip__avatar">{p.initials}</span>
      <span className="pchip__id">{p.id}</span>
    </div>
  );
}

function Chip({
  children,
  kind,
}: {
  children: React.ReactNode;
  kind?: "week" | "tag" | "flag" | "media";
}) {
  return <span className={"chip" + (kind ? " is-" + kind : "")}>{children}</span>;
}

type SentimentValue = "pos" | "neu" | "neg";

function Sentiment({ value }: { value: SentimentValue }) {
  return <span className={"sent is-" + value} />;
}

function IconStamp({ kind }: { kind: "media" | "flag" }) {
  return <span className={"ic ic--" + kind} aria-hidden="true" />;
}

function ViewTagline({
  kind,
  summary,
  count,
}: {
  kind: string;
  summary: string;
  count?: string | number;
}) {
  return (
    <div className="wf-tagline">
      <span className="wf-tagline__pill">VIEW · {kind}</span>
      <span>{summary}</span>
      {count != null && (
        <span className="wf-tagline__pill" style={{ marginLeft: "auto" }}>
          {count}
        </span>
      )}
    </div>
  );
}

function FilterBar({
  filters,
  setFilters,
  weeks,
  study,
  questions,
  participants,
}: {
  filters: Filters;
  setFilters: (f: Filters) => void;
  weeks: Week[];
  study: Study;
  questions: CompareQuestion[];
  participants: ParticipantSummary[];
}) {
  const { week, question, participant, flagged, search } = filters;
  const isAllWeeks = week === "ALL";

  return (
    <div className="wf-filters">
      <div className="wf-filters__row">
        <div className="wf-fgroup">
          <span className="wf-flabel">Week</span>
          <div className="wf-weekpills">
            <button
              type="button"
              className={"wf-weekpill" + (isAllWeeks ? " is-active" : "")}
              onClick={() => setFilters({ ...filters, week: "ALL" })}
            >
              All
            </button>
            {weeks.map((w) => (
              <button
                key={w.id}
                type="button"
                className={"wf-weekpill" + (week === w.id ? " is-active" : "")}
                onClick={() => setFilters({ ...filters, week: w.id })}
              >
                {w.id}
              </button>
            ))}
          </div>
        </div>

        <div className="wf-fgroup">
          <span className="wf-flabel">Question</span>
          <select
            className="wf-select"
            value={question}
            onChange={(e) => setFilters({ ...filters, question: e.target.value })}
          >
            <option value="ALL">All questions</option>
            {questions.map((q) => (
              <option key={q.id} value={q.id}>
                {q.kind} · {q.prompt}
              </option>
            ))}
          </select>
        </div>

        <div className="wf-fgroup">
          <span className="wf-flabel">Participant</span>
          <select
            className="wf-select"
            value={participant}
            onChange={(e) => setFilters({ ...filters, participant: e.target.value })}
          >
            <option value="ALL">All {study.participants} participants</option>
            {participants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className={"wf-toggle" + (flagged ? " is-on" : "")}
          onClick={() => setFilters({ ...filters, flagged: !flagged })}
        >
          <span className="wf-toggle__box" />
          Flagged
        </button>

        <input
          className="wf-search"
          type="text"
          placeholder="Search responses…"
          value={search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />

        <button
          type="button"
          className="wf-fbtn-clear"
          onClick={() => setFilters(DEFAULT_FILTERS)}
        >
          Clear filters
        </button>
      </div>
    </div>
  );
}

/* ───────────────── Weekly Digest ───────────────── */

function WeeklyDigest({
  weeks,
  digests,
  study,
  filters,
}: {
  weeks: Week[];
  digests: WeekDigest[];
  study: Study;
  filters: Filters;
}) {
  const digestById = useMemo(() => {
    const m = new Map<string, WeekDigest>();
    digests.forEach((d) => m.set(d.weekId, d));
    return m;
  }, [digests]);

  const maxThemeCount = useMemo(
    () => Math.max(1, ...digests.flatMap((d) => d.themes.map((t) => t.count))),
    [digests],
  );

  const visibleWeeks = useMemo(
    () => (filters.week === "ALL" ? weeks : weeks.filter((w) => w.id === filters.week)),
    [weeks, filters.week],
  );

  return (
    <div>
      {visibleWeeks.length === 0 && (
        <p style={{ color: "var(--wf-ink-3)", fontSize: 13, padding: "12px 0" }}>
          No week matches the selected filter.
        </p>
      )}
      <div className="digest">
        {visibleWeeks.map((w) => {
          const d = digestById.get(w.id);
          const responding = d?.responding ?? 0;
          const entries = d?.entries ?? 0;
          const flagged = d?.flagged ?? 0;
          const themes = d?.themes ?? [];
          const allSpotlights = d?.spotlights ?? [];
          const search = filters.search.trim().toLowerCase();
          const filteredSpotlights = allSpotlights.filter((s) => {
            if (filters.participant !== "ALL" && s.sellerId !== filters.participant) return false;
            if (filters.flagged && !s.flagged) return false;
            if (filters.question !== "ALL" && s.questionId !== filters.question) return false;
            if (search) {
              const hay = `${s.text} ${s.sellerName} ${s.questionPrompt ?? ""}`.toLowerCase();
              if (!hay.includes(search)) return false;
            }
            return true;
          });
          const anyFilter =
            filters.participant !== "ALL" ||
            filters.flagged ||
            filters.question !== "ALL" ||
            search.length > 0;
          const spotlights = anyFilter
            ? filteredSpotlights.slice(0, 4)
            : filteredSpotlights.slice(0, 2);
          const rate = study.participants > 0 ? responding / study.participants : 0;
          return (
            <div className="weekblock" key={w.id}>
              <div className="weekblock__head">
                <div>
                  <div className="weekblock__num">{w.id}</div>
                  <div className="weekblock__numlabel">{w.dates}</div>
                </div>
                <div>
                  <h3 className="weekblock__theme">{w.theme ?? w.label}</h3>
                  <div className="weekblock__dates">
                    {responding} of {study.participants} participants responded · {entries} entries
                    · {flagged} flagged for follow-up
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                    {themes.slice(0, 4).map((t) => (
                      <Chip key={t.label} kind="tag">
                        {t.label}
                      </Chip>
                    ))}
                  </div>
                </div>
                <div className="weekblock__stats">
                  <div className="minibar">
                    <span style={{ minWidth: 80 }}>Response rate</span>
                    <div className="minibar__track">
                      <div className="minibar__fill" style={{ width: `${rate * 100}%` }} />
                    </div>
                    <span className="minibar__num">{Math.round(rate * 100)}%</span>
                  </div>
                </div>
              </div>
              <div className="weekblock__body">
                <div className="weekblock__col">
                  <h4 className="weekblock__colhead">Spotlight responses</h4>
                  {spotlights.length === 0 && (
                    <p style={{ color: "var(--wf-ink-3)", fontSize: 12 }}>
                      No responses with notes yet for this week.
                    </p>
                  )}
                  {spotlights.map((s) => (
                    <div className="spotlight" key={s.submissionId}>
                      {s.questionPrompt && (
                        <div className="spotlight__q">
                          {s.questionId ? `${s.questionId} · ` : ""}
                          {s.questionPrompt}
                        </div>
                      )}
                      <div style={{ display: "flex", gap: 8 }}>
                        <Sentiment value="neu" />
                        <div className="spotlight__body">&ldquo;{s.text}&rdquo;</div>
                      </div>
                      <div className="spotlight__foot">
                        <div className="pchip">
                          <span className="pchip__avatar">{s.sellerInitials}</span>
                          <span className="pchip__id">{s.sellerName}</span>
                        </div>
                        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                          {s.flagged && (
                            <Chip kind="flag">
                              <IconStamp kind="flag" />
                            </Chip>
                          )}
                          <Link
                            href={`/admin/submissions/${s.submissionId}`}
                            className="qcard__expand"
                          >
                            Open →
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="weekblock__col">
                  <h4 className="weekblock__colhead">Themes this week</h4>
                  {themes.length === 0 ? (
                    <p style={{ color: "var(--wf-ink-3)", fontSize: 12 }}>
                      No tags applied yet.
                    </p>
                  ) : (
                    <div className="themelist">
                      {themes.slice(0, 6).map((t) => (
                        <div className="themerow" key={t.label}>
                          <span>{t.label}</span>
                          <div className="themerow__bar">
                            <span
                              style={{ width: `${Math.min(100, (t.count / maxThemeCount) * 100)}%` }}
                            />
                          </div>
                          <span className="themerow__num">{t.count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ───────────────── Question Compare ───────────────── */

function QuestionCompare({
  weeks,
  compare,
  study,
  filters,
}: {
  weeks: Week[];
  compare: QuestionCompareData;
  study: Study;
  filters: Filters;
}) {
  const { questions, dist, responses } = compare;
  const [localQId, setLocalQId] = useState<string>(questions[0]?.id ?? "");
  const activeQId = filters.question !== "ALL" ? filters.question : localQId;
  const setActiveQId = (id: string) => {
    setLocalQId(id);
    if (filters.question !== "ALL") {
      // keep the filter in sync when user clicks the rail
      // (clears the dropdown's specific selection back to ALL only on Clear filters)
    }
  };
  const q = questions.find((qq) => qq.id === activeQId) ?? questions[0];

  const allResponses = (q && responses[q.id]) || [];

  const filteredResponses = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return allResponses.filter((r) => {
      if (filters.week !== "ALL" && r.weekId !== filters.week) return false;
      if (filters.participant !== "ALL" && r.sellerId !== filters.participant) return false;
      if (filters.flagged && !r.flagged) return false;
      if (search) {
        const hay = `${r.text ?? ""} ${r.choiceLabel ?? ""} ${r.sellerName}`.toLowerCase();
        if (!hay.includes(search)) return false;
      }
      return true;
    });
  }, [allResponses, filters.week, filters.participant, filters.flagged, filters.search]);

  if (!q) {
    return (
      <p style={{ color: "var(--wf-ink-3)", fontSize: 13 }}>No questions configured.</p>
    );
  }

  const mcDist = q.kind === "MC" ? dist[q.id] : null;
  const visibleWeeks =
    filters.week === "ALL" ? weeks : weeks.filter((w) => w.id === filters.week);
  const flaggedCount = filteredResponses.filter((r) => r.flagged).length;
  const VISIBLE = 12;

  return (
    <div>
      <div className="qcompare">
        <div className="qlist">
          {questions.map((qq) => (
            <div
              key={qq.id}
              className={"qlist__item" + (qq.id === activeQId ? " is-active" : "")}
              onClick={() => setActiveQId(qq.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setActiveQId(qq.id);
              }}
            >
              <span className="qkind">{qq.kind}</span>
              <div style={{ flex: 1 }}>
                <div className="qlabel">{qq.prompt}</div>
                <div className="qmeta">
                  {qq.source === "spontaneous" ? "spontaneous notes" : `${qq.source} · ${qq.id}`}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="qpanel">
          {q.kind === "MC" && q.choices && mcDist && (
            <div className="qdist">
              <div className="qdist__head">
                <div>
                  <h3 className="qdist__title">{q.prompt}</h3>
                  <span className="qdist__hint">
                    Multiple choice · counts of participants per week.
                  </span>
                </div>
                <Chip>{q.choices.length} options</Chip>
              </div>
              <div className="qdist__grid">
                <div />
                {visibleWeeks.map((w) => (
                  <div className="qdist__wlabel" key={w.id}>
                    {w.id}
                  </div>
                ))}

                {q.choices.map((choice) => (
                  <Fragment key={choice.value}>
                    <div className="qdist__rowlabel">{choice.label}</div>
                    {visibleWeeks.map((w) => {
                      const n = mcDist[w.id]?.[choice.value] ?? 0;
                      const denom = Math.max(1, study.participants);
                      const pct = (n / denom) * 100;
                      return (
                        <div className="qdist__cell" key={w.id}>
                          {n > 0 && (
                            <div className="qdist__fill" style={{ width: `${pct}%` }} />
                          )}
                          {n > 0 && <span className="qdist__num">{n}</span>}
                        </div>
                      );
                    })}
                  </Fragment>
                ))}
              </div>
            </div>
          )}

          {q.kind === "OPEN" && (
            <div
              className="qdist"
              style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}
            >
              <div>
                <h3 className="qdist__title">{q.prompt}</h3>
                <span className="qdist__hint">
                  Free-text — no quant rollup, scroll for individual responses
                </span>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", gap: 6, flexWrap: "wrap" }}>
                <Chip>{filteredResponses.length} responses</Chip>
                {flaggedCount > 0 && (
                  <Chip kind="flag">
                    <IconStamp kind="flag" /> {flaggedCount} flagged
                  </Chip>
                )}
              </div>
            </div>
          )}

          <div className="qresps">
            <div className="qresps__head">
              <div>
                <b>
                  Every response · {q.kind === "OPEN" ? "qualitative" : "multiple choice"}
                </b>
              </div>
              <div className="qmeta" style={{ marginTop: 0 }}>
                {filteredResponses.length} total
              </div>
            </div>
            {filteredResponses.length === 0 && (
              <div style={{ padding: 24, textAlign: "center", color: "var(--wf-ink-3)", fontSize: 13 }}>
                No responses match the current filters.
              </div>
            )}
            {filteredResponses.slice(0, VISIBLE).map((r) => (
              <div className="qresps__row" key={r.submissionId + r.weekId}>
                <div className="pchip">
                  <span className="pchip__avatar">{r.sellerInitials}</span>
                  <div>
                    <div className="pchip__name">{r.sellerName}</div>
                  </div>
                </div>
                <div className="qresps__week">
                  {r.weekId}
                  <br />
                  <span style={{ fontSize: 10, color: "var(--wf-ink-3)" }}>{r.weekShort}</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Sentiment value="neu" />
                  <div style={{ flex: 1 }}>
                    {q.kind === "MC" && r.choiceLabel && <Chip>{r.choiceLabel}</Chip>}
                    {q.kind === "OPEN" &&
                      (r.text ? (
                        <div className="qresps__txt">&ldquo;{r.text}&rdquo;</div>
                      ) : (
                        <span
                          style={{ fontSize: 11, color: "var(--wf-ink-3)", fontStyle: "italic" }}
                        >
                          no response
                        </span>
                      ))}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", alignItems: "center" }}>
                  {r.flagged && (
                    <span style={{ color: "var(--wf-accent)" }}>
                      <IconStamp kind="flag" />
                    </span>
                  )}
                  <Link href={`/admin/submissions/${r.submissionId}`} className="qcard__expand">
                    Open →
                  </Link>
                </div>
              </div>
            ))}
            {filteredResponses.length > VISIBLE && (
              <div style={{ padding: "12px 16px", textAlign: "center" }}>
                <span className="qmeta">{filteredResponses.length - VISIBLE} more responses</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
