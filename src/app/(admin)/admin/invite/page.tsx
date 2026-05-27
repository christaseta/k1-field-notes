import Link from "next/link";
import "../dashboard.css";
import "./invite.css";
import InviteForm from "./InviteForm";

export const dynamic = "force-dynamic";

export default function InvitePage() {
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
      </main>
    </div>
  );
}
