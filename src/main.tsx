import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import "./incident-room.css";
import "./scene.css";
import "./reduced-motion.css";
import { INSTRUCTOR_PIN, POLL_INTERVAL_MS } from "./config";
import { allQuestions, competencies, scenarios } from "./data/scenarios";
import * as api from "./api";
import { band, blankProgress, POINTS, resultFor } from "./scoring";
import type {
  Attempt,
  Progress,
  Question,
  Result,
  ScenarioId,
  Student,
} from "./types";
const scenario = (id: ScenarioId) => scenarios.find((s) => s.id === id)!;
const attemptsFor = (p: Progress, q: Question) =>
  p.attempts.filter((a) => a.questionId === q.id);
const outcome = (p: Progress, q: Question) =>
  attemptsFor(p, q).find((a) => a.questionCompleted);
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <div className="ambient-grid" aria-hidden="true" />
      <div className="scan-orbit" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <header>
        <div className="brand">
          <span className="mark">
            <i />
            IR
          </span>
          <div>
            <b>INTEROPERABILITY INCIDENT ROOM</b>
            <small>Radiology information integrity response unit</small>
          </div>
        </div>
        <div className="system-state">
          <i /> SYSTEM LINK ACTIVE
        </div>
        <span className="institution">DLSMHSI · MS Radiologic Technology</span>
      </header>
      <main>{children}</main>
    </div>
  );
}
function Login({
  onStudent,
  onInstructor,
}: {
  onStudent: (p: Progress) => void;
  onInstructor: () => void;
}) {
  const [mode, setMode] = useState<"student" | "instructor">("student");
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    api.ensureBackend().catch(() => {});
  }, []);
  async function go(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      if (mode === "instructor") {
        if (p !== INSTRUCTOR_PIN) throw Error("Incorrect instructor PIN.");
        onInstructor();
      } else {
        if (u.trim().length < 2) throw Error("Enter your full student name.");
        if (p.trim().length < 4)
          throw Error("Choose a PIN with at least 4 characters.");
        const r = await api.login(u.trim(), p.trim());
        onStudent(
          r.progress ||
            api.cached(r.student.studentId) ||
            blankProgress(r.student),
        );
      }
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Login failed.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Shell>
      <section className="hero">
        <p className="eyebrow">Scenario assessment</p>
        <h1>
          Protect the meaning,
          <br />
          not only the message.
        </h1>
        <p>
          Investigate five stages of an imaging interoperability project. Follow
          the information, validate the workflow and make the safest next
          decision.
        </p>
      </section>
      <section className="login card">
        <div className="seg">
          <button
            className={mode === "student" ? "active" : ""}
            onClick={() => setMode("student")}
          >
            Student sign up / login
          </button>
          <button
            className={mode === "instructor" ? "active" : ""}
            onClick={() => setMode("instructor")}
          >
            Instructor login
          </button>
        </div>
        <form onSubmit={go}>
          <h2>
            {mode === "student"
              ? "Enter the incident room"
              : "Instructor access"}
          </h2>
          {mode === "student" && (
            <>
              <p className="muted">
                First visit: enter your name and choose a PIN. Returning
                students must use the same name and PIN to restore progress.
              </p>
              <label>
                Student name
                <input
                  required
                  value={u}
                  onChange={(e) => setU(e.target.value)}
                  autoComplete="name"
                  placeholder="Your full name"
                />
              </label>
            </>
          )}
          <label>
            {mode === "student" ? "PIN" : "Instructor PIN"}
            <input
              required
              type="password"
              value={p}
              onChange={(e) => setP(e.target.value)}
              autoComplete={
                mode === "student" ? "new-password" : "current-password"
              }
              placeholder={mode === "student" ? "Choose or enter your PIN" : ""}
            />
          </label>
          {msg && (
            <p className="error" role="alert">
              {msg}
            </p>
          )}
          <button className="primary" disabled={busy}>
            {busy
              ? "Checking…"
              : mode === "student"
                ? "Continue"
                : "Enter control room"}
          </button>
        </form>
      </section>
    </Shell>
  );
}
const roomObjects = [
  ["VENDOR TERMINAL", "CONFORMANCE FILE", "ACQUISITION CONSOLE"],
  ["ORDER GATEWAY", "WORKLIST CONSOLE", "MAPPING TABLE"],
  ["PATIENT WRISTBAND", "ORDER JACKET", "PACS VIEWER"],
  ["AUDIT LOG", "IDENTITY BOARD", "WORKFLOW TRACE"],
  ["CODING LEDGER", "NETWORK MAP", "RELEASE CONTROL"],
];
function RoomScene({
  roomNumber,
  questionNumber,
  onOpen,
}: {
  roomNumber: number;
  questionNumber: number;
  onOpen: () => void;
}) {
  const active = (questionNumber - 1) % 3;
  return (
    <section className={`escape-scene room-theme-${roomNumber}`}>
      <div className="scene-noise" />
      <div className="scene-ceiling">
        <i />
        <i />
        <i />
      </div>
      <div className="scene-title">
        <small>YOU ARE INSIDE</small>
        <b>ROOM 0{roomNumber}</b>
        <span>Locate the active evidence station and resolve its lock.</span>
      </div>
      <div className="pacs-wall">
        <div className="monitor">
          <span className="dicom-image">
            <i />
            <i />
            <i />
          </span>
          <em>DICOM STUDY · HOLD</em>
        </div>
        <div className="monitor orders">
          <span>
            <b>RIS / ORDER FEED</b>
            <i />
            <i />
            <i />
            <i />
          </span>
          <em>ASSOCIATION CHECK</em>
        </div>
      </div>
      <div className="scene-floor" />
      <div className="object-row">
        {roomObjects[roomNumber - 1].map((name, i) => (
          <button
            key={name}
            disabled={i > active}
            className={
              i === active
                ? "hotspot active-object"
                : i < active
                  ? "hotspot solved-object"
                  : "hotspot locked-object"
            }
            onClick={i === active ? onOpen : undefined}
          >
            <span className="object-icon">
              {i < active ? "✓" : i === active ? "!" : "⌁"}
            </span>
            <b>{name}</b>
            <small>
              {i < active
                ? "CLEARED"
                : i === active
                  ? "EVIDENCE DETECTED"
                  : "ENCRYPTED"}
            </small>
            {i === active && <i className="radar-ring" />}
          </button>
        ))}
      </div>
      <div className="scene-instruction">
        <span>◉</span> Select the pulsing evidence station to investigate
      </div>
    </section>
  );
}
function StudentApp({
  initial,
  onExit,
}: {
  initial: Progress;
  onExit: () => void;
}) {
  const [p, setP] = useState(initial);
  const [selected, setSelected] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [sceneOpen, setSceneOpen] = useState(false);
  const s = scenario(p.student.scenarioId),
    qs = allQuestions(s),
    q = qs[p.currentQuestion] || qs[14],
    prior = attemptsFor(p, q),
    done = outcome(p, q),
    room = s.rooms[(Math.floor(q.number - 1) / 3) | 0];
  async function answer() {
    if (!selected || busy || done) return;
    setBusy(true);
    setMsg("");
    const attemptNumber = prior.length + 1,
      correct = selected === q.correctOptionId,
      completed = correct || attemptNumber === 3,
      points = correct ? POINTS[attemptNumber - 1] : 0;
    const a: Attempt = {
      timestamp: new Date().toISOString(),
      studentId: p.student.studentId,
      studentName: p.student.displayName,
      scenarioId: s.id,
      questionId: q.id,
      competencyId: q.competencyId,
      attemptNumber,
      selectedOption: selected,
      correct,
      questionCompleted: completed,
      pointsEarnedWhenCompleted: points,
    };
    const next = { ...p, attempts: [...p.attempts, a] };
    try {
      await api.saveAttempt(a, next);
      setP(next);
      setSelected("");
    } catch {
      setMsg("Your response could not be saved. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  async function next() {
    let np = { ...p, currentQuestion: Math.min(14, p.currentQuestion + 1) };
    if (p.currentQuestion === 14) {
      const r = resultFor(p.student, p.attempts);
      np = { ...p, completed: true, result: r };
      try {
        await api.saveResult(r, np);
      } catch {
        setMsg("Your completed result could not be saved. Please try again.");
        return;
      }
    }
    setP(np);
    setSceneOpen(false);
  }
  if (p.completed && p.result) return <ResultView p={p} onExit={onExit} />;
  const remaining = 3 - prior.length,
    max = POINTS[Math.min(prior.length, 2)];
  return (
    <Shell>
      <div className="studentbar">
        <span className="case-id">
          CASE {s.id} · SUBJECT <b>{p.student.displayName}</b>
        </span>
        <button onClick={onExit}>Exit room</button>
      </div>
      <section className="roomhead">
        <div className="room-copy">
          <p className="eyebrow">SECURED ZONE · ROOM {room.number} OF 5</p>
          <h1>
            <span className="room-number">0{room.number}</span>
            {room.title}
          </h1>
          <p>{room.narrativeIntro}</p>
        </div>
        <div className="modality-view" aria-hidden="true">
          <div className="xray">
            <span />
            <span />
            <span />
          </div>
          <small>IMAGING FEED · LIVE</small>
        </div>
      </section>
      <div className="corridor" aria-label={`Room ${room.number} of 5`}>
        {s.rooms.map((r) => (
          <div
            key={r.id}
            className={
              r.number === room.number
                ? "now"
                : r.number < room.number
                  ? "past"
                  : ""
            }
          >
            <span>
              {r.number < room.number
                ? "✓"
                : r.number === room.number
                  ? "◉"
                  : "⌑"}
            </span>
            <small>
              {r.number < room.number
                ? "CLEARED"
                : r.number === room.number
                  ? "ACTIVE"
                  : "LOCKED"}
            </small>
          </div>
        ))}
      </div>
      <RoomScene
        roomNumber={room.number}
        questionNumber={q.number}
        onOpen={() => setSceneOpen(true)}
      />
      {sceneOpen ? <section className={`question card evidence investigation-panel ${done ? "resolved" : ""}`}>
        <button className="close-investigation" onClick={() => setSceneOpen(false)} aria-label="Return to room">×</button>
        <div className="evidence-tab">EVIDENCE FILE · {q.id}</div>
        <div className="qmeta">
          <span>NODE {q.number} / 15</span>
          <span>TRIES {done ? 0 : remaining}</span>
          <span>VALUE {done ? "0.00" : max.toFixed(2)}</span>
        </div>
        <p className="context">{q.context}</p>
        <h2>{q.prompt}</h2>
        <fieldset disabled={busy || !!done}>
          {q.options.map((o) => {
            const used = prior.some((a) => a.selectedOption === o.id);
            return (
              <label
                className={`option ${selected === o.id ? "chosen" : ""} ${used ? "used" : ""}`}
                key={o.id}
              >
                <input
                  type="radio"
                  name="answer"
                  checked={selected === o.id}
                  disabled={used}
                  onChange={() => setSelected(o.id)}
                />
                <b>{o.id}</b>
                <span>{o.text}</span>
                {used && <small>Rejected</small>}
              </label>
            );
          })}
        </fieldset>
        {msg && (
          <p className="error" role="alert">
            {msg}
          </p>
        )}
        {!done && prior.length > 0 && (
          <aside className="feedback">
            <b>
              ACCESS DENIED · {remaining} attempt{remaining === 1 ? "" : "s"}{" "}
              remaining · Maximum {max.toFixed(2)}
            </b>
            <p>
              {prior.length === 1
                ? q.hintAfterFirstWrong
                : q.hintAfterSecondWrong}
            </p>
          </aside>
        )}
        {done && (
          <aside className={done.correct ? "feedback good" : "feedback"}>
            <b>
              {done.correct
                ? `LOCK RELEASED · ${done.pointsEarnedWhenCompleted.toFixed(2)} points`
                : "LOCK OVERRIDDEN · 0.00 points"}
            </b>
            <p>
              Correct answer: {q.correctOptionId}.{" "}
              {q.options.find((o) => o.id === q.correctOptionId)?.text}
            </p>
            <p>{q.explanation}</p>
          </aside>
        )}
        <div className="actions">
          {!done ? (
            <button
              className="primary unlock"
              disabled={!selected || busy}
              onClick={answer}
            >
              {busy ? "VALIDATING…" : "VALIDATE ACCESS CODE"}
            </button>
          ) : (
            <button className="primary unlock" onClick={next}>
              {q.number === 15 ? "OPEN FINAL EXIT" : "ENTER NEXT CHAMBER"}
            </button>
          )}
        </div>
      </section> : <div className="awaiting-clue"><span>ROOM ACTIVE</span><b>Find the highlighted evidence station to continue.</b></div>}
    </Shell>
  );
}
function ResultView({ p, onExit }: { p: Progress; onExit: () => void }) {
  const [r, setReview] = useState(false),
    x = p.result!,
    s = scenario(x.scenarioId),
    b = band(x.transmutedGrade);
  return (
    <Shell>
      <section className="result card">
        <p className="eyebrow">Incident report complete</p>
        <h1>{b[0]}</h1>
        <h2>{b[1]}</h2>
        <p>{b[2]}</p>
        <div className="scoregrid">
          <div>
            <small>Student</small>
            <b>{x.displayName}</b>
          </div>
          <div>
            <small>Scenario</small>
            <b>{s.title}</b>
          </div>
          <div>
            <small>Weighted raw score</small>
            <b>{x.weightedRawScore.toFixed(2)} / 15</b>
          </div>
          <div>
            <small>Transmuted grade</small>
            <b>{x.transmutedGrade.toFixed(2)}</b>
          </div>
        </div>
        <p>
          First: {x.firstAttemptCount} · Second: {x.secondAttemptCount} · Third:{" "}
          {x.thirdAttemptCount} · Missed: {x.missedCount}
        </p>
        <div className="actions">
          <button className="primary" onClick={() => setReview(!r)}>
            {r ? "Close review" : "Review my incident"}
          </button>
          <button onClick={onExit}>Sign out</button>
        </div>
        {r && <Review progress={p} />}
      </section>
    </Shell>
  );
}
function Review({ progress }: { progress: Progress }) {
  const qs = allQuestions(scenario(progress.student.scenarioId));
  return (
    <div className="review">
      {qs.map((q) => {
        const tried = attemptsFor(progress, q),
          d = outcome(progress, q);
        return (
          <article key={q.id}>
            <p className="eyebrow">
              Q{q.number} · {q.competency}
            </p>
            <h3>{q.prompt}</h3>
            {tried.map((a) => (
              <p key={a.timestamp}>
                Attempt {a.attemptNumber}: {a.selectedOption} ·{" "}
                {a.correct ? "Correct" : "Incorrect"}
              </p>
            ))}
            <p>
              <b>Correct:</b> {q.correctOptionId}.{" "}
              {q.options.find((o) => o.id === q.correctOptionId)?.text}
            </p>
            <p>{q.explanation}</p>
            <b>Points: {d?.pointsEarnedWhenCompleted.toFixed(2) || "0.00"}</b>
          </article>
        );
      })}
    </div>
  );
}
function Instructor({ onExit }: { onExit: () => void }) {
  const [data, setData] = useState<{
      students: Student[];
      progress: Progress[];
      attempts: Attempt[];
      results: Result[];
    }>({ students: [], progress: [], attempts: [], results: [] }),
    [tab, setTab] = useState("dashboard"),
    [pick, setPick] = useState("1"),
    [student, setStudent] = useState(""),
    [scenarioPick, setScenarioPick] = useState("A");
  async function refresh() {
    try {
      const r = await api.instructorData();
      setData(r);
    } catch {}
  }
  useEffect(() => {
    refresh();
    const t = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(t);
  }, []);
  const avg = data.results.length
    ? data.results.reduce((a, b) => a + b.transmutedGrade, 0) /
      data.results.length
    : 0;
  const selectedP = data.progress.find((p) => p.student.studentId === student);
  return (
    <Shell>
      <div className="studentbar">
        <b>INSTRUCTOR CONTROL ROOM</b>
        <button onClick={onExit}>Sign out</button>
      </div>
      <nav>
        {["dashboard", "matrix", "class review", "scenario review"].map((t) => (
          <button
            className={tab === t ? "active" : ""}
            onClick={() => setTab(t)}
            key={t}
          >
            {t}
          </button>
        ))}
      </nav>
      {tab === "dashboard" && (
        <>
          <section className="stats">
            <Stat n={data.students.length} l="Students assigned" />
            <Stat n={data.results.length} l="Completed" />
            <Stat
              n={
                data.progress.filter((p) => !p.completed && p.attempts.length)
                  .length
              }
              l="In progress"
            />
            <Stat n={avg.toFixed(2)} l="Class average" />
            <Stat n={data.results.filter((r) => r.passed).length} l="Pass" />
            <Stat n={data.results.filter((r) => !r.passed).length} l="Fail" />
          </section>
          <StudentTable
            data={data}
            onPick={(id) => {
              setStudent(id);
              setTab("student");
            }}
          />
        </>
      )}
      {tab === "matrix" && <Matrix data={data} />}{" "}
      {tab === "student" && selectedP && (
        <section className="card">
          <button onClick={() => setTab("dashboard")}>Back</button>
          <h1>{selectedP.student.displayName}</h1>
          {selectedP.result && (
            <p>
              {selectedP.result.weightedRawScore.toFixed(2)} / 15 ·{" "}
              {selectedP.result.transmutedGrade.toFixed(2)} ·{" "}
              {selectedP.result.passed ? "PASS" : "FAIL"}
            </p>
          )}
          <button
            className="danger"
            onClick={async () => {
              if (confirm("Reset this student attempt?")) {
                await api.resetStudent(selectedP.student.studentId);
                refresh();
                setTab("dashboard");
              }
            }}
          >
            Reset student attempt
          </button>
          <Review progress={selectedP} />
        </section>
      )}
      {tab === "class review" && (
        <ClassReview
          n={+pick}
          setPick={setPick}
          attempts={data.attempts}
          students={data.students}
        />
      )}{" "}
      {tab === "scenario review" && (
        <ScenarioReview id={scenarioPick} setId={setScenarioPick} />
      )}
    </Shell>
  );
}
function Stat({ n, l }: { n: string | number; l: string }) {
  return (
    <div className="card stat">
      <b>{n}</b>
      <small>{l}</small>
    </div>
  );
}
function StudentTable({
  data,
  onPick,
}: {
  data: any;
  onPick: (x: string) => void;
}) {
  return (
    <section className="card tablewrap">
      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Scenario</th>
            <th>Progress</th>
            <th>Raw</th>
            <th>Grade</th>
            <th>Result</th>
            <th>1st</th>
            <th>2nd</th>
            <th>3rd</th>
            <th>Missed</th>
          </tr>
        </thead>
        <tbody>
          {data.students.map((s: Student) => {
            const p = data.progress.find(
                (x: Progress) => x.student.studentId === s.studentId,
              ),
              r = data.results.find((x: Result) => x.studentId === s.studentId);
            return (
              <tr
                tabIndex={0}
                onClick={() => p && onPick(s.studentId)}
                key={s.studentId}
              >
                <td>{s.displayName}</td>
                <td>{s.scenarioId}</td>
                <td>
                  {p
                    ? p.attempts.filter((a: Attempt) => a.questionCompleted)
                        .length
                    : 0}
                  /15
                </td>
                <td>{r?.weightedRawScore.toFixed(2) || "·"}</td>
                <td>{r?.transmutedGrade.toFixed(2) || "·"}</td>
                <td>{r ? (r.passed ? "PASS" : "FAIL") : "·"}</td>
                <td>{r?.firstAttemptCount ?? "·"}</td>
                <td>{r?.secondAttemptCount ?? "·"}</td>
                <td>{r?.thirdAttemptCount ?? "·"}</td>
                <td>{r?.missedCount ?? "·"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
function Matrix({ data }: { data: any }) {
  return (
    <section className="card tablewrap">
      <table className="matrix">
        <thead>
          <tr>
            <th>Student</th>
            {competencies.map((_, i) => (
              <th key={i}>Q{i + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.students.map((s: Student) => {
            const p = data.progress.find(
              (x: Progress) => x.student.studentId === s.studentId,
            );
            return (
              <tr key={s.studentId}>
                <td>{s.displayName}</td>
                {Array.from({ length: 15 }, (_, i) => {
                  const q = allQuestions(scenario(s.scenarioId))[i],
                    d = p && outcome(p, q);
                  return (
                    <td key={i}>
                      {!d
                        ? "·"
                        : d.correct
                          ? `${d.attemptNumber}${["st", "nd", "rd"][d.attemptNumber - 1]}`
                          : "X"}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
function ClassReview({
  n,
  setPick,
  attempts,
  students,
}: {
  n: number;
  setPick: (x: string) => void;
  attempts: Attempt[];
  students: Student[];
}) {
  return (
    <section>
      <label>
        Question
        <select value={n} onChange={(e) => setPick(e.target.value)}>
          {Array.from({ length: 15 }, (_, i) => (
            <option key={i}>{i + 1}</option>
          ))}
        </select>
      </label>
      <div className="variants">
        {scenarios.map((s) => {
          const q = allQuestions(s)[n - 1],
            assigned = students.filter((x) => x.scenarioId === s.id).length,
            aa = attempts.filter((a) => a.questionId === q.id),
            done = aa.filter((a) => a.questionCompleted);
          return (
            <article className="card" key={s.id}>
              <p className="eyebrow">
                Scenario {s.id} · {q.competency}
              </p>
              <h2>{s.title}</h2>
              <p>{q.prompt}</p>
              <ol type="A">
                {q.options.map((o) => (
                  <li
                    className={o.id === q.correctOptionId ? "correct" : ""}
                    key={o.id}
                  >
                    {o.text}
                  </li>
                ))}
              </ol>
              <p>
                <b>Correct: {q.correctOptionId}</b> · {q.explanation}
              </p>
              <small>
                Assigned: {assigned} · First attempt:{" "}
                {assigned
                  ? Math.round(
                      (done.filter((a) => a.correct && a.attemptNumber === 1)
                        .length /
                        assigned) *
                        100,
                    )
                  : 0}
                % · By third:{" "}
                {assigned
                  ? Math.round(
                      (done.filter((a) => a.correct).length / assigned) * 100,
                    )
                  : 0}
                % · Never correct:{" "}
                {assigned
                  ? Math.round(
                      (done.filter((a) => !a.correct).length / assigned) * 100,
                    )
                  : 0}
                %
              </small>
            </article>
          );
        })}
      </div>
    </section>
  );
}
function ScenarioReview({
  id,
  setId,
}: {
  id: string;
  setId: (x: string) => void;
}) {
  const s = scenario(id as ScenarioId);
  return (
    <section>
      <label>
        Scenario
        <select value={id} onChange={(e) => setId(e.target.value)}>
          {scenarios.map((x) => (
            <option key={x.id} value={x.id}>
              {x.id} · {x.title}
            </option>
          ))}
        </select>
      </label>
      <div className="review">
        {s.rooms.map((r) => (
          <section key={r.id}>
            <h1>
              Room {r.number}: {r.title}
            </h1>
            <p>{r.narrativeIntro}</p>
            {r.questions.map((q) => (
              <article key={q.id}>
                <p className="eyebrow">
                  Q{q.number} · {q.competency}
                </p>
                <h3>{q.prompt}</h3>
                <ol type="A">
                  {q.options.map((o) => (
                    <li
                      className={o.id === q.correctOptionId ? "correct" : ""}
                      key={o.id}
                    >
                      {o.text}
                    </li>
                  ))}
                </ol>
                <p>{q.explanation}</p>
              </article>
            ))}
          </section>
        ))}
      </div>
    </section>
  );
}
function App() {
  const [p, setP] = useState<Progress | null>(null),
    [inst, setInst] = useState(false);
  if (p) return <StudentApp initial={p} onExit={() => setP(null)} />;
  if (inst) return <Instructor onExit={() => setInst(false)} />;
  return <Login onStudent={setP} onInstructor={() => setInst(true)} />;
}
createRoot(document.getElementById("root")!).render(<App />);
