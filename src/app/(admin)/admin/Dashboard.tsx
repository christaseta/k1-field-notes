"use client";

import { Fragment, useMemo, useState } from "react";
import {
  PARTICIPANTS,
  QUESTIONS,
  Q1_DIST,
  SAMPLE_QUOTES,
  STUDY,
  TAGS,
  WEEKS,
  type Participant,
  type Question,
  type Sentiment as SentimentValue,
} from "./mock-data";

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

export default function Dashboard() {
  const [tab, setTab] = useState<TabId>("digest");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  return (
    <div className="wf-app">
      <header className="wf-topbar">
        <div className="wf-topbar__row">
          <div className="wf-brand">Field notes</div>
          <div className="wf-crumb">
            <b>{STUDY.name}</b>
          </div>
          <div className="wf-stats">
            <span>
              <b>{STUDY.participants}</b>participants
            </span>
            <span>
              <b>{STUDY.weeks}</b>weeks
            </span>
            <span>
              <b>{STUDY.entries}</b>entries
            </span>
            <span>
              <b>{Math.round(STUDY.responseRate * 100)}%</b>response
            </span>
            <span>
              <b>{STUDY.flagged}</b>flagged
            </span>
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

      <FilterBar filters={filters} setFilters={setFilters} />

      <main className="wf-page">
        {tab === "digest" ? <WeeklyDigest /> : <QuestionCompare />}
      </main>
    </div>
  );
}

/* ───────────────── Shared components ───────────────── */

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
}: {
  filters: Filters;
  setFilters: (f: Filters) => void;
}) {
  const { week, question, participant, hasMedia, flagged, search } = filters;
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
            {WEEKS.map((w) => (
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
            {QUESTIONS.map((q) => (
              <option key={q.id} value={q.id}>
                {q.id} · {q.label}
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
            <option value="ALL">All 19 participants</option>
            {PARTICIPANTS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.id} · {p.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className={"wf-toggle" + (hasMedia ? " is-on" : "")}
          onClick={() => setFilters({ ...filters, hasMedia: !hasMedia })}
        >
          <span className="wf-toggle__box" />
          Has media
        </button>

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

function WeeklyDigest() {
  const themesByWeek = useMemo(() => {
    const out: Record<string, { label: string; count: number }[]> = {};
    WEEKS.forEach((w, wi) => {
      const slice = TAGS.slice(wi, wi + 6).concat(
        TAGS.slice(0, Math.max(0, 6 - (TAGS.length - wi))),
      );
      out[w.id] = slice.map((t, i) => ({
        label: t.label,
        count: Math.max(3, t.count - wi * 2 - i),
      }));
    });
    return out;
  }, []);

  const quotesByWeek = useMemo(() => {
    const out: Record<string, typeof SAMPLE_QUOTES> = {};
    WEEKS.forEach((w) => {
      out[w.id] = SAMPLE_QUOTES.filter((s) => s.wid === w.id).slice(0, 2);
    });
    return out;
  }, []);

  return (
    <div>
      <div className="digest">
        {WEEKS.map((w, wi) => {
          const themes = themesByWeek[w.id];
          const quotes = quotesByWeek[w.id];
          const responseRate = 0.95 - wi * 0.03;
          const flagged = 6 - wi;
          const media = 22 - wi * 2;
          return (
            <div className="weekblock" key={w.id}>
              <div className="weekblock__head">
                <div>
                  <div className="weekblock__num">{w.id}</div>
                  <div className="weekblock__numlabel">{w.dates}</div>
                </div>
                <div>
                  <h3 className="weekblock__theme">{w.theme}</h3>
                  <div className="weekblock__dates">
                    {Math.round(responseRate * PARTICIPANTS.length)} of {PARTICIPANTS.length}{" "}
                    participants responded · {flagged} entries flagged for follow-up · {media} media
                    uploads
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
                      <div
                        className="minibar__fill"
                        style={{ width: `${responseRate * 100}%` }}
                      />
                    </div>
                    <span className="minibar__num">{Math.round(responseRate * 100)}%</span>
                  </div>
                  <div className="minibar">
                    <span style={{ minWidth: 80 }}>Sentiment +</span>
                    <div className="minibar__track">
                      <div
                        className="minibar__fill"
                        style={{ width: `${60 - wi * 4}%`, background: "var(--wf-pos)" }}
                      />
                    </div>
                    <span className="minibar__num">{60 - wi * 4}%</span>
                  </div>
                  <div className="minibar">
                    <span style={{ minWidth: 80 }}>Sentiment −</span>
                    <div className="minibar__track">
                      <div
                        className="minibar__fill"
                        style={{ width: `${12 + wi * 5}%`, background: "var(--wf-neg)" }}
                      />
                    </div>
                    <span className="minibar__num">{12 + wi * 5}%</span>
                  </div>
                </div>
              </div>
              <div className="weekblock__body">
                <div className="weekblock__col">
                  <h4 className="weekblock__colhead">Spotlight responses</h4>
                  {quotes.length === 0 && (
                    <p style={{ color: "var(--wf-ink-3)", fontSize: 12 }}>
                      No spotlight responses yet.
                    </p>
                  )}
                  {quotes.map((qt, i) => {
                    const p = PARTICIPANTS.find((pp) => pp.id === qt.pid)!;
                    const q = QUESTIONS.find((qq) => qq.id === qt.qid)!;
                    return (
                      <div className="spotlight" key={i}>
                        <div className="spotlight__q">
                          {q.id} · {q.label}
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <Sentiment value={qt.sentiment} />
                          <div className="spotlight__body">&ldquo;{qt.text}&rdquo;</div>
                        </div>
                        <div className="spotlight__foot">
                          <PChipMini p={p} />
                          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                            {qt.flagged && (
                              <Chip kind="flag">
                                <IconStamp kind="flag" />
                              </Chip>
                            )}
                            {qt.media && (
                              <Chip kind="media">
                                <IconStamp kind="media" />
                              </Chip>
                            )}
                            <button type="button" className="qcard__expand">
                              Open →
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="weekblock__col">
                  <h4 className="weekblock__colhead">Themes this week</h4>
                  <div className="themelist">
                    {themes.slice(0, 6).map((t) => (
                      <div className="themerow" key={t.label}>
                        <span>{t.label}</span>
                        <div className="themerow__bar">
                          <span style={{ width: `${Math.min(100, t.count * 4)}%` }} />
                        </div>
                        <span className="themerow__num">{t.count}</span>
                      </div>
                    ))}
                  </div>
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

function QuestionCompare() {
  const [activeQId, setActiveQId] = useState("Q4");
  const q = QUESTIONS.find((qq) => qq.id === activeQId) as Question;

  const responses = useMemo(() => {
    return PARTICIPANTS.map((p, i) => {
      const sample = SAMPLE_QUOTES.find((s) => s.pid === p.id && s.qid === activeQId);
      const week = WEEKS[(i + activeQId.charCodeAt(1)) % WEEKS.length];
      const sentiment: SentimentValue = sample
        ? sample.sentiment
        : (["pos", "neu", "neg", "neu"] as const)[i % 4];
      return {
        p,
        week,
        sentiment,
        text: sample ? sample.text : null,
        media: sample ? sample.media : i % 5 === 0,
        flagged: sample ? sample.flagged : i % 8 === 0,
      };
    });
  }, [activeQId]);

  return (
    <div>
      <div className="qcompare">
        <div className="qlist">
          {QUESTIONS.map((qq) => (
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
                <div className="qlabel">{qq.label}</div>
                <div className="qmeta">{qq.id} · asked every week</div>
              </div>
            </div>
          ))}
        </div>

        <div className="qpanel">
          {q.kind === "MC" && q.options && (
            <div className="qdist">
              <div className="qdist__head">
                <div>
                  <h3 className="qdist__title">{q.label}</h3>
                  <span className="qdist__hint">
                    {q.kind} · stacked by week. Width = count of participants.
                  </span>
                </div>
                <Chip>{q.options.length} options</Chip>
              </div>
              <div className="qdist__grid">
                <div />
                {WEEKS.map((w) => (
                  <div className="qdist__wlabel" key={w.id}>
                    {w.id}
                  </div>
                ))}

                {q.options.map((opt) => (
                  <Fragment key={opt}>
                    <div className="qdist__rowlabel">{opt}</div>
                    {WEEKS.map((w) => {
                      const n = Q1_DIST[w.id][opt] || 0;
                      const pct = (n / PARTICIPANTS.length) * 100;
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

          {q.kind === "TAGS" && q.options && (
            <div className="qdist">
              <div className="qdist__head">
                <div>
                  <h3 className="qdist__title">{q.label}</h3>
                  <span className="qdist__hint">
                    {q.kind} · how often each tag was picked across all weeks
                  </span>
                </div>
              </div>
              <div className="themelist">
                {q.options.map((opt, i) => {
                  const n = 19 - (i * 2 + (i % 3));
                  return (
                    <div className="themerow" key={opt}>
                      <span>{opt}</span>
                      <div className="themerow__bar">
                        <span style={{ width: `${(n / 19) * 100}%` }} />
                      </div>
                      <span className="themerow__num">{n}/19</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {(q.kind === "SHORT" || q.kind === "LONG" || q.kind === "PHOTO") && (
            <div
              className="qdist"
              style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}
            >
              <div>
                <h3 className="qdist__title">{q.label}</h3>
                <span className="qdist__hint">
                  {q.kind === "PHOTO" ? "Photo upload" : "Free-text"} — no quant rollup, scroll for
                  individual responses
                </span>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", gap: 6, flexWrap: "wrap" }}>
                <Chip>{responses.filter((r) => r.text).length} answered</Chip>
                <Chip kind="flag">
                  <IconStamp kind="flag" /> {responses.filter((r) => r.flagged).length} flagged
                </Chip>
                {q.kind === "PHOTO" && (
                  <Chip kind="media">
                    <IconStamp kind="media" /> {responses.filter((r) => r.media).length} uploaded
                  </Chip>
                )}
              </div>
            </div>
          )}

          <div className="qresps">
            <div className="qresps__head">
              <div>
                <b>
                  Every response ·{" "}
                  {q.kind === "LONG" || q.kind === "SHORT"
                    ? "qualitative"
                    : q.kind === "MC"
                      ? "multiple choice"
                      : q.kind === "TAGS"
                        ? "tag selections"
                        : "photo uploads"}
                </b>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <select className="wf-select" defaultValue="week">
                  <option value="week">Sort: by week ↓</option>
                  <option value="participant">Sort: by participant</option>
                  <option value="sentiment">Sort: by sentiment</option>
                </select>
              </div>
            </div>
            {responses.slice(0, 12).map((r, i) => (
              <div className="qresps__row" key={r.p.id + i}>
                <PChip p={r.p} />
                <div className="qresps__week">
                  {r.week.id}
                  <br />
                  <span style={{ fontSize: 10, color: "var(--wf-ink-3)" }}>
                    {r.week.dates.split("–")[0]}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Sentiment value={r.sentiment} />
                  <div style={{ flex: 1 }}>
                    {q.kind === "MC" && q.options && (
                      <Chip>{q.options[i % q.options.length]}</Chip>
                    )}
                    {q.kind === "TAGS" && q.options && (
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {q.options.slice(i % 3, (i % 3) + 3).map((t) => (
                          <Chip key={t} kind="tag">
                            {t}
                          </Chip>
                        ))}
                      </div>
                    )}
                    {(q.kind === "SHORT" || q.kind === "LONG") &&
                      (r.text ? (
                        <div className="qresps__txt">&ldquo;{r.text}&rdquo;</div>
                      ) : (
                        <span
                          style={{
                            fontSize: 11,
                            color: "var(--wf-ink-3)",
                            fontStyle: "italic",
                          }}
                        >
                          no response
                        </span>
                      ))}
                    {q.kind === "PHOTO" &&
                      (r.media ? (
                        <span style={{ fontSize: 11, color: "var(--wf-ink-2)" }}>
                          📷 Photo uploaded
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: 11,
                            color: "var(--wf-ink-3)",
                            fontStyle: "italic",
                          }}
                        >
                          no upload
                        </span>
                      ))}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                  {r.flagged && (
                    <span style={{ color: "var(--wf-accent)" }}>
                      <IconStamp kind="flag" />
                    </span>
                  )}
                  {r.media && (
                    <span style={{ color: "var(--wf-ink-3)" }}>
                      <IconStamp kind="media" />
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div style={{ padding: "12px 16px", textAlign: "center" }}>
              <button type="button" className="qcard__expand">
                Show {PARTICIPANTS.length - 12} more responses
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
