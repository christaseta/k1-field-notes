import Link from "next/link";
import "../dashboard.css";
import "./invite.css";
import InviteForm from "./InviteForm";
import CopyLinkButton from "./CopyLinkButton";
import { listSellers } from "@/lib/admin-queries";

export const dynamic = "force-dynamic";

export default async function InvitePage() {
  const sellers = await listSellers();
  const sorted = [...sellers].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <div className="wf-app">
      <header className="wf-topbar">
        <div className="wf-topbar__row">
          <div className="wf-brand">Field notes</div>
          <div className="wf-crumb">
            <b>Invite a seller</b>
          </div>
          <div className="wf-stats">
            <Link href="/admin" className="invite__backlink">
              ← Dashboard
            </Link>
          </div>
        </div>
      </header>
      <main className="wf-page">
        <InviteForm />

        <section className="invite__listSection">
          <h2 className="invite__listHead">
            Invited sellers <span className="invite__listCount">{sorted.length}</span>
          </h2>
          {sorted.length === 0 ? (
            <p className="invite__hint" style={{ paddingLeft: 4 }}>
              No sellers yet. Use the form above to invite the first one.
            </p>
          ) : (
            <div className="invite__list">
              <div className="invite__listRow invite__listRow--head">
                <span>Name</span>
                <span>Business</span>
                <span>Email</span>
                <span>Submissions</span>
                <span>Joined</span>
                <span>Invite link</span>
              </div>
              {sorted.map((s) => (
                <div className="invite__listRow" key={s.id}>
                  <span className="invite__cellStrong">
                    {s.display_name || <em className="invite__cellMuted">—</em>}
                  </span>
                  <span>
                    {s.business_name || <em className="invite__cellMuted">—</em>}
                  </span>
                  <span className="invite__cellMono">{s.email}</span>
                  <span className="invite__cellMono">{s.submission_count}</span>
                  <span className="invite__cellMuted">
                    {new Date(s.created_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span>
                    <CopyLinkButton email={s.email} />
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
