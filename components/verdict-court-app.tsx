"use client";

import Image from "next/image";
import { FormEvent, useMemo, useState } from "react";
import { canTransition, type CaseMode, type CaseStatus } from "@/lib/case-state";

const tabs = [
  ["home", "⚖", "Today’s Docket"],
  ["case", "◇", "Case Chamber"],
  ["file", "+", "File a Case"],
  ["jury", "◎", "Jury Room"],
  ["live", "●", "Live Court"],
  ["verdict", "◆", "Verdict Reveal"],
  ["bench", "▣", "Admin Bench"],
] as const;

type Tab = (typeof tabs)[number][0];

type DraftCase = {
  title: string;
  juryQuestion: string;
  statement: string;
  requestedOutcome: string;
  mode: CaseMode;
  respondentInvited: boolean;
  adultConfirmed: boolean;
};

const initialDraft: DraftCase = {
  title: "",
  juryQuestion: "",
  statement: "",
  requestedOutcome: "",
  mode: "hypothetical",
  respondentInvited: false,
  adultConfirmed: false,
};

export function VerdictCourtApp() {
  const [tab, setTab] = useState<Tab>("home");
  const [ageAccepted, setAgeAccepted] = useState(false);
  const [draft, setDraft] = useState(initialDraft);
  const [caseStatus, setCaseStatus] = useState<CaseStatus>("draft");
  const [benchApproved, setBenchApproved] = useState(false);
  const [respondentConsented, setRespondentConsented] = useState(false);
  const [recordLocked, setRecordLocked] = useState(false);
  const [notice, setNotice] = useState("Prototype data only — no real filing is published from VC-01.");

  const transitionSummary = useMemo(() => ({
    benchToRecordLock: canTransition(caseStatus, "record_lock", {
      mode: draft.mode,
      respondentConsented,
      benchApproved,
      recordLocked,
    }),
  }), [benchApproved, caseStatus, draft.mode, recordLocked, respondentConsented]);

  function go(next: Tab) {
    setTab(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function submitDraft(event: FormEvent) {
    event.preventDefault();
    if (!ageAccepted || !draft.adultConfirmed) {
      setNotice("Adult confirmation is required before a case may enter Bench Review.");
      return;
    }
    if (!draft.title.trim() || !draft.juryQuestion.trim() || !draft.statement.trim()) {
      setNotice("Case title, exact jury question, and statement are required.");
      return;
    }
    setCaseStatus("bench_review");
    setNotice("Draft moved to private Bench Review. It is not public and cannot open voting from this state.");
    go("bench");
  }

  function approveBench() {
    if (caseStatus !== "bench_review") return;
    setBenchApproved(true);
    if (draft.mode === "public_two_sided") {
      setCaseStatus("respondent_pending");
      setNotice("Bench Review approved. Named two-sided case is still private pending respondent consent.");
    } else {
      setRecordLocked(true);
      setCaseStatus("record_lock");
      setNotice("Bench Review approved for anonymized hypothetical mode. Moderated record is now locked for the next gate.");
    }
  }

  function recordConsent() {
    setRespondentConsented(true);
    setRecordLocked(true);
    setCaseStatus("record_lock");
    setNotice("Respondent consent recorded. Moderated record locked; deliberation may be opened only after this gate.");
  }

  if (!ageAccepted) {
    return (
      <main className="age-gate">
        <div className="gate-card">
          <Image src="/verdict-court-logo.svg" alt="Verdict Court" width={128} height={128} priority />
          <div className="kicker">Verdict Court · VC-01</div>
          <h1>Adult Pilot Gate</h1>
          <p>Verdict Court is a structured social-decision and entertainment platform. It is not a court, law firm, arbitration service, or source of legal advice.</p>
          <p className="muted">The MVP is limited to consenting adult users and low-risk interpersonal disputes. Serious criminal, sexual, child-safety, active-litigation, medical, intimate-image and other prohibited matters are not eligible.</p>
          <button className="btn" onClick={() => setAgeAccepted(true)}>I am 18 or older — enter prototype</button>
        </div>
      </main>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <Image src="/verdict-court-logo.svg" alt="Verdict Court logo" width={52} height={52} />
          <div><h1>VERDICT COURT</h1><small>THE RUSSELL MADISON GROUP</small></div>
        </div>
        <nav className="nav">
          {tabs.map(([id, icon, label]) => (
            <button key={id} className={tab === id ? "active" : ""} onClick={() => go(id)}>
              <span>{icon}</span>{label}
            </button>
          ))}
        </nav>
        <div className="status-card">
          <small>VC-01 CASE STATE</small>
          <strong>{caseStatus.replaceAll("_", " ")}</strong>
          <span>{notice}</span>
        </div>
        <p className="sidebar-foot">Entertainment & structured community deliberation only. Not a court, arbitration service, or source of legal advice.</p>
      </aside>

      <main className="main">
        {tab === "home" && <Home go={go} />}
        {tab === "case" && <CaseChamber />}
        {tab === "file" && <FileCase draft={draft} setDraft={setDraft} submitDraft={submitDraft} />}
        {tab === "jury" && <JuryRoom />}
        {tab === "live" && <LiveCourt />}
        {tab === "verdict" && <VerdictReveal />}
        {tab === "bench" && (
          <AdminBench
            status={caseStatus}
            mode={draft.mode}
            benchApproved={benchApproved}
            respondentConsented={respondentConsented}
            recordLocked={recordLocked}
            approveBench={approveBench}
            recordConsent={recordConsent}
            mayLock={transitionSummary.benchToRecordLock}
          />
        )}
      </main>
    </div>
  );
}

function Header({ kicker, title, subtitle, action }: { kicker: string; title: string; subtitle: string; action?: React.ReactNode }) {
  return <div className="topbar"><div><div className="kicker">{kicker}</div><div className="title">{title}</div><div className="subtitle">{subtitle}</div></div>{action}</div>;
}

function Home({ go }: { go: (tab: Tab) => void }) {
  return <>
    <Header kicker="The Court Is Now In Session" title="Today’s Docket" subtitle="High-stakes everyday disputes, structured into clean arguments, evidence, deliberation, and a community verdict." action={<button className="btn" onClick={() => go("file")}>File a Case</button>} />
    <div className="grid">
      <article className="card hero"><div className="case-no">CASE VC-0926-1842 · FEATURED</div><div className="case-title">The Wedding Invite That Split a Family</div><div className="meta">Petitioner and Respondent both verified · 8 exhibits admitted · deliberation closes tonight</div><div className="pills"><span>Family</span><span>Two-Sided Case</span><span>Clerk Summary Ready</span></div><div className="progress"><i /></div><div className="statrow"><Stat value="18.4K" label="Jurors"/><Stat value="63%" label="Petitioner"/><Stat value="04:12" label="Time Left"/></div></article>
      <article className="card side"><div className="kicker">Court Clerk Brief</div><h2>What matters most</h2><p className="meta">Both parties agree the invitation was withdrawn. They dispute whether the reason was financial, retaliatory, or based on prior conduct.</p><div className="pills"><span>3 agreed facts</span><span>2 disputed facts</span><span>1 credibility issue</span></div><button className="btn secondary" onClick={() => go("case")}>Open Case Chamber</button></article>
      <article className="card full"><div className="kicker">Trending Cases</div><div className="docket"><Docket no="#1841" title="Roommate moved out and left the full final month’s rent" meta="Housing · Two-sided · 7.1K jurors" state="Deliberating"/><Docket no="#1837" title="Friend exposed a private voice note in a group chat" meta="Friendship · Consent review passed · 13.6K jurors" state="Verdict Soon"/><Docket no="#1829" title="Who actually broke the ‘no exes at the party’ agreement?" meta="Relationships · Redacted evidence · 22.3K jurors" state="Hot Docket"/></div></article>
    </div>
  </>;
}

function CaseChamber() {
  return <>
    <Header kicker="Case Chamber" title="VC-0926-1842" subtitle="A structured, two-sided case file. Claims, responses, exhibits, neutral clerk brief, and jury questions stay separated so theatrics never replace facts."/>
    <div className="grid">
      <article className="card full scene-card scene-judges chamber-scene">
        <div className="kicker">Judges’ Chambers Snapshot</div>
        <div className="feature-pills two-col chamber-pills">
          <FeaturePill title="Petitioner Record" text="Primary claim, supporting timeline, and admitted motive theory are surfaced before emotion takes over the room." />
          <FeaturePill title="Respondent Position" text="Response, stated rationale, and direct rebuttal stay equally visible so the jury sees both sides in full." />
          <FeaturePill title="Admitted Exhibits" text="Only reviewed screenshots, message logs, and corroborating documents move forward into the public-facing record." />
          <FeaturePill title="Clerk Brief Ready" text="Neutral framing and open questions stay layered above the dispute so jurors can deliberate, not just react." />
        </div>
      </article>
      <article className="card half"><div className="kicker">Petitioner</div><h2>“The invite was pulled to punish me.”</h2><p className="meta">Statement locked after respondent joined. Edits are versioned and visible.</p></article>
      <article className="card half"><div className="kicker">Respondent</div><h2>“It was a budget decision, not retaliation.”</h2><p className="meta">Respondent disputes motive, not the withdrawal itself.</p></article>
      <article className="card full"><div className="kicker">Evidence Locker</div><div className="evidence"><Evidence label="EXHIBIT A" title="Invitation Screenshot"/><Evidence label="EXHIBIT B" title="Text Message Thread"/><Evidence label="EXHIBIT C" title="Budget Spreadsheet"/></div><p className="safety-note">VC-01 rule: exhibits remain private until moderation state is approved/redacted. Public case views never expose raw moderation fields or unreviewed storage objects.</p></article>
    </div>
  </>;
}

function FileCase({ draft, setDraft, submitDraft }: { draft: DraftCase; setDraft: React.Dispatch<React.SetStateAction<DraftCase>>; submitDraft: (e: FormEvent) => void }) {
  return <>
    <Header kicker="File a Case" title="Build the record before the drama." subtitle="A guided intake prevents vague accusations, strips unnecessary personal information, and distinguishes opinion from verifiable claims."/>
    <div className="grid">
      <article className="card third scene-card scene-lawyer intake-scene">
        <div className="kicker">Filing Sequence</div>
        <div className="feature-pills numbered-pills">
          <NumberedPill number="1" title="Choose Mode" text="Named public cases require respondent consent. Otherwise use anonymized hypothetical mode." />
          <NumberedPill number="2" title="State the Question" text="Frame one precise issue the jury can answer without guessing or wandering into unrelated conflict." />
          <NumberedPill number="3" title="Bench Review" text="Every filing stays private until moderation, consent, eligibility, and safety checks all pass." />
          <NumberedPill number="4" title="Admit Evidence" text="Media is scanned, redacted, classified, and reviewed before any public release or deliberation." />
        </div>
      </article>
      <article className="card form-card"><form className="form" onSubmit={submitDraft}>
        <label className="field"><span>Case mode</span><select value={draft.mode} onChange={e => setDraft(v => ({...v, mode: e.target.value as CaseMode, respondentInvited: e.target.value === "public_two_sided"}))}><option value="hypothetical">Hypothetical / anonymized</option><option value="public_two_sided">Public two-sided / consent required</option></select></label>
        <label className="field"><span>Case title</span><input value={draft.title} onChange={e => setDraft(v => ({...v, title:e.target.value}))} placeholder="Describe the dispute without unnecessary identifiers"/></label>
        <label className="field"><span>The exact question for the jury</span><input value={draft.juryQuestion} onChange={e => setDraft(v => ({...v, juryQuestion:e.target.value}))} placeholder="One answerable issue"/></label>
        <label className="field"><span>Your statement</span><textarea value={draft.statement} onChange={e => setDraft(v => ({...v, statement:e.target.value}))} placeholder="State facts, what is agreed, what is disputed, and your position."/></label>
        <label className="field"><span>Requested outcome</span><input value={draft.requestedOutcome} onChange={e => setDraft(v => ({...v, requestedOutcome:e.target.value}))} placeholder="Community opinion, apology, boundary clarification, etc."/></label>
        <label className="check"><input type="checkbox" checked={draft.adultConfirmed} onChange={e => setDraft(v => ({...v, adultConfirmed:e.target.checked}))}/><span>I confirm every submitted party is an adult and I will not submit prohibited or identifying material outside the consent rules.</span></label>
        <button className="btn">Send to private Bench Review</button>
      </form></article>
    </div>
  </>;
}

function JuryRoom() {
  return <>
    <Header kicker="Jury Room" title="Deliberate, don’t dogpile." subtitle="Jurors answer structured questions first, then may comment. Qualified voting requires both sides, required exhibits and comprehension."/>
    <div className="grid">
      <article className="card half vote"><h2>Petitioner</h2><div className="meter"><span style={{width:"63%"}}/></div><p className="meta">63% · 11,592 qualified jurors</p></article>
      <article className="card half vote"><h2>Respondent</h2><div className="meter"><span style={{width:"37%"}}/></div><p className="meta">37% · 6,808 qualified jurors</p></article>
      <article className="card full scene-card scene-jury questions-scene">
        <div className="kicker">Clerk-Generated Jury Questions</div>
        <div className="feature-pills question-pills">
          <FeaturePill title="1. Which explanation is better supported by the admitted timeline?" text="Start with the sequence of events before weighing emotional reactions or assumptions." />
          <FeaturePill title="2. Does Exhibit C materially weaken the retaliation claim?" text="Measure how much the admitted budget evidence changes your confidence in motive." />
          <FeaturePill title="3. Which fact would most change your verdict if disproven?" text="Identify the hinge fact so your vote rests on the strongest issue in the record." />
        </div>
        <p className="safety-note">AI-assisted summary — review the original statements and admitted exhibits before voting.</p>
      </article>
    </div>
  </>;
}
function LiveCourt() {
  return <>
    <Header kicker="Live Court" title="The lights come up. The record stays clean." subtitle="Hosted hearings use timed openings, moderator-selected questions and a hard evidence boundary. MVP uses external video/recorded media rather than proprietary livestream infrastructure." action={<button className="btn red">LIVE · DEMO</button>}/>
    <div className="grid">
      <article className="card hero scene-card scene-court live-scene">
        <div className="case-no">LIVE HEARING</div>
        <div className="case-title">Opening Statements</div>
        <div className="feature-pills two-col live-pills compact-pills">
          <FeaturePill title="Join the stream" text="Enter at the scheduled call time and review the hearing rules before participation begins." />
          <FeaturePill title="Follow the timer" text="Speakers rotate automatically so neither side can monopolize the floor." />
          <FeaturePill title="Stay on the record" text="Only issues already admitted into the case file are in bounds during live court." />
          <FeaturePill title="Submit moderated questions" text="Juror questions go to the moderator first and only approved prompts reach the hearing." />
        </div>
        <div className="progress"><i style={{width:"48%"}}/></div>
        <div className="meta">01:26 remaining · microphones alternate automatically · moderator may pause for safety review</div>
      </article>
      <article className="card side live-guide-card">
        <div className="kicker">Hearing Order</div>
        <div className="steps"><Step title="Petitioner" text="2:00 opening"/><Step title="Respondent" text="2:00 opening"/><Step title="Rebuttals" text="1:00 each"/><Step title="Jury Q&A" text="3 moderated questions"/></div>
      </article>
      <article className="card full">
        <div className="kicker">How to use Live Court</div>
        <div className="feature-pills three-col live-instructions">
          <FeaturePill title="1. Enter prepared" text="Review the Clerk brief, admitted exhibits, and both statements before opening the hearing." />
          <FeaturePill title="2. Listen for new clarity" text="Live Court is for explanation and moderation, not for surprise evidence dumps or personal attacks." />
          <FeaturePill title="3. Use the record" text="When testimony conflicts, compare it against the case chamber record rather than instinct alone." />
          <FeaturePill title="4. Respect moderator cues" text="The moderator can pause, redirect, mute, or end a hearing if boundaries or safety rules are violated." />
          <FeaturePill title="5. Ask sharper jury questions" text="Submit concise questions that help resolve the central issue instead of escalating the conflict." />
          <FeaturePill title="6. Return to deliberation" text="After the hearing closes, jurors move back into structured voting and comment flow in the Jury Room." />
        </div>
      </article>
    </div>
  </>;
}
function VerdictReveal() {
  return <>
    <Header kicker="Verdict Reveal" title="The room goes quiet." subtitle="A cinematic reveal delivers the vote, strongest reasons on both sides, and what evidence actually moved the jury."/>
    <article className="card verdict scene-card scene-bailiff verdict-scene">
      <div className="verdict-badge">Community Verdict</div>
      <div className="seal seal-sm">V</div>
      <div className="title small-title">For the Petitioner</div>
      <p className="subtitle centered">By a 63% to 37% vote, the qualified jury found retaliation more persuasive than the stated budget explanation.</p>
      <div className="statrow verdict-stats"><Stat value="18,400" label="Qualified Votes"/><Stat value="81%" label="Read Both Sides"/><Stat value="7/8" label="Exhibits Viewed"/></div>
      <div className="disclaimer">Verdicts reflect community opinion for entertainment and structured discussion. They are not legal findings, arbitration awards, professional conclusions, or proof.</div>
    </article>
  </>;
}

function AdminBench({ status, mode, benchApproved, respondentConsented, recordLocked, approveBench, recordConsent, mayLock }: { status: CaseStatus; mode: CaseMode; benchApproved:boolean; respondentConsented:boolean; recordLocked:boolean; approveBench:()=>void; recordConsent:()=>void; mayLock:boolean }) {
  return <><Header kicker="Admin Bench" title="Private pre-publication control" subtitle="Nothing becomes public from VC-01 until eligibility, identity exposure, consent, evidence and prohibited-subject checks clear."/><div className="grid"><article className="card half"><div className="kicker">Current Gate</div><h2>{status.replaceAll("_", " ")}</h2><ul className="audit-list"><li>Adult-only pilot</li><li>Bench Review cannot be bypassed</li><li>Named public mode requires respondent consent</li><li>Hypothetical mode requires de-identification</li><li>Raw evidence remains private until moderated</li></ul>{status === "bench_review" && <button className="btn" onClick={approveBench}>Approve eligible demo filing</button>}{status === "respondent_pending" && <button className="btn" onClick={recordConsent}>Record demo respondent consent</button>}</article><article className="card half"><div className="kicker">Gate Telemetry</div><div className="gate-grid"><Gate label="Mode" value={mode}/><Gate label="Bench approved" value={benchApproved ? "yes":"no"}/><Gate label="Respondent consent" value={respondentConsented ? "yes":"no"}/><Gate label="Record locked" value={recordLocked ? "yes":"no"}/><Gate label="Direct lock allowed" value={mayLock ? "yes":"no"}/></div></article><article className="card full"><div className="kicker">Prohibited MVP categories</div><p className="meta">Violent or sexual-crime allegations, child abuse, domestic-violence adjudication, active litigation/restraining orders, immigration status, medical diagnosis disputes, intimate imagery, minors as parties, self-harm threats, exact financial account data and professional malpractice claims remain out of scope.</p></article></div></>;
}

function FeaturePill({ title, text }: { title: string; text: string }) {
  return <div className="feature-pill"><b>{title}</b><span>{text}</span></div>;
}
function NumberedPill({ number, title, text }: { number: string; title: string; text: string }) {
  return <div className="feature-pill numbered-pill"><em>{number}</em><b>{title}</b><span>{text}</span></div>;
}
function Stat({value,label}:{value:string;label:string}) { return <div className="stat"><b>{value}</b><span>{label}</span></div>; }
function Docket({no,title,meta,state}:{no:string;title:string;meta:string;state:string}) { return <div className="docket-item"><div className="badge">{no}</div><div><b>{title}</b><div className="meta">{meta}</div></div><span className="pill-single">{state}</span></div>; }
function Evidence({label,title}:{label:string;title:string}) { return <div className="tile"><span className="meta">{label}</span><b>{title}</b></div>; }
function Step({title,text}:{title:string;text:string}) { return <div className="step"><div><b>{title}</b><span className="meta">{text}</span></div></div>; }
function Gate({label,value}:{label:string;value:string}) { return <div className="gate"><span>{label}</span><strong>{value}</strong></div>; }
