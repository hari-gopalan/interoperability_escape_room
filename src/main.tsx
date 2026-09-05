import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import "./incident-room.css";
import "./scene.css";
import "./radiology-celebration.css";
import "./fullscreen-room.css";
import "./audio.css";
import "./login-story.css";
import "./stage-graphics.css";
import "./class-review.css";
import "./reduced-motion.css";
import { INSTRUCTOR_PIN, POLL_INTERVAL_MS } from "./config";
import { allQuestions, competencies, scenarios } from "./data/scenarios";
import * as api from "./api";
import { band, blankProgress, POINTS, resultFor } from "./scoring";
import { armDefaultMusic, musicEnabled, playCue, setMusic } from "./audio";
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
function Shell({
  children,
  immersive = false,
}: {
  children: React.ReactNode;
  immersive?: boolean;
}) {
  const [music, setMusicState] = useState(musicEnabled());
  useEffect(() => armDefaultMusic(), []);
  return (
    <div className={`app-shell${immersive ? " immersive" : ""}`}>
      <div className="ambient-grid" aria-hidden="true" />
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
        <div className="audio-system">
          <button
            className="sound-toggle"
            onClick={() => setMusicState(setMusic(!music))}
            aria-pressed={music}
            aria-label={`${music ? "Turn off" : "Turn on"} background music`}
          >
            <span>{music ? "♫" : "♪"}</span> MUSIC {music ? "ON" : "OFF"}
          </button>
          <div className="system-state">
            <i /> SYSTEM LINK ACTIVE
          </div>
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
        setMusic(true);
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
      <div className="login-layout">
        <section className="hero">
          <div className="incident-ticket">
            <span>ACTIVE INCIDENT</span>
            <b>PACS-INT-05</b>
            <small>TRAINING ENVIRONMENT</small>
          </div>
          <p className="eyebrow">Scenario assessment</p>
          <h1>
            Protect the meaning,
            <br />
            not only the message.
          </h1>
          <div className="mission-brief">
            <span>YOUR ROLE</span>
            <h2>You are the PACS Administrator.</h2>
            <p>
              Your hospital is preparing a major imaging project. You have been
              asked to guide the team from procurement and workflow design
              through clinical validation and incident investigation.
            </p>
            <p>
              In each room, examine the available evidence, decide which
              standard or information should be checked, and protect the
              connection between the patient, the imaging order and the acquired
              study. Clear all five rooms to release the project safely.
            </p>
          </div>
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
                placeholder={
                  mode === "student" ? "Choose or enter your PIN" : ""
                }
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
      </div>
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
  scenarioId,
  onOpen,
}: {
  roomNumber: number;
  questionNumber: number;
  scenarioId: ScenarioId;
  onOpen: () => void;
}) {
  const active = (questionNumber - 1) % 3;
  return (
    <section
      className={`escape-scene room-theme-${roomNumber} scenario-${scenarioId}`}
    >
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
            onClick={
              i === active
                ? () => {
                    playCue("evidence");
                    onOpen();
                  }
                : undefined
            }
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
function UnlockModal({
  question,
  attempt,
  onContinue,
}: {
  question: Question;
  attempt: Attempt;
  onContinue: () => void;
}) {
  return (
    <div
      className="unlock-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="unlock-title"
    >
      <div className="celebration" aria-hidden="true">
        {Array.from({ length: 18 }, (_, i) => (
          <i key={i} />
        ))}
      </div>
      <section className="unlock-modal">
        <div className="lock-stage" aria-hidden="true">
          <div className="shackle" />
          <div className="lock-body">
            <span>✓</span>
          </div>
          <div className="unlock-wave" />
        </div>
        <p className="eyebrow">EVIDENCE VERIFIED</p>
        <h2 id="unlock-title">Lock released</h2>
        <p className="points-award">
          +{attempt.pointsEarnedWhenCompleted.toFixed(2)} POINTS
        </p>
        <div className="explanation-panel">
          <b>Correct answer: {question.correctOptionId}</b>
          <p>
            {
              question.options.find((o) => o.id === question.correctOptionId)
                ?.text
            }
          </p>
          <p>{question.explanation}</p>
        </div>
        <button className="primary unlock-next" onClick={onContinue}>
          {question.number === 15
            ? "OPEN FINAL EXIT"
            : "CONTINUE INVESTIGATION"}
        </button>
      </section>
    </div>
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
    playCue(correct ? "correct" : "wrong");
    setP(next);
    setSelected("");
    setBusy(false);
    void api.saveAttempt(a, next).catch(() => {
      setMsg(
        "The answer is stored on this device, but cloud sync is delayed. Keep using this browser until the connection is restored.",
      );
    });
  }
  async function next() {
    playCue("door");
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
  function previousQuestion() {
    if (p.currentQuestion === 0) return;
    setP({ ...p, currentQuestion: p.currentQuestion - 1 });
    setSceneOpen(true);
  }
  async function resetForTesting() {
    if (
      !confirm(
        "Reset this entire test attempt? All saved answers and the result will be removed.",
      )
    )
      return;
    setBusy(true);
    try {
      await api.resetStudent(p.student.studentId);
      setP(blankProgress(p.student));
      setSelected("");
      setSceneOpen(false);
      setMsg("");
    } catch {
      setMsg("The test reset could not be completed. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  if (p.completed && p.result)
    return <ResultView p={p} onExit={onExit} onReset={resetForTesting} />;
  const remaining = 3 - prior.length,
    max = POINTS[Math.min(prior.length, 2)];
  return (
    <Shell immersive>
      <div className="studentbar">
        <span className="case-id">
          CASE {s.id} · SUBJECT <b>{p.student.displayName}</b>
        </span>
        <div className="test-controls">
          <button onClick={previousQuestion} disabled={p.currentQuestion === 0}>
            ← Previous question
          </button>
          {p.student.displayName.trim().toLowerCase() === "hari" && (
            <button
              className="danger"
              onClick={resetForTesting}
              disabled={busy}
            >
              Reset quiz
            </button>
          )}
          <button onClick={onExit}>Exit room</button>
        </div>
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
        scenarioId={p.student.scenarioId}
        onOpen={() => setSceneOpen(true)}
      />
      {sceneOpen ? (
        <div className="question-modal-backdrop" role="presentation">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="current-question"
            className={`question card evidence investigation-panel ${done ? "resolved" : ""}`}
          >
            <button
              className="close-investigation"
              onClick={() => setSceneOpen(false)}
              aria-label="Return to room"
            >
              ×
            </button>
            <div className="evidence-tab">EVIDENCE FILE · {q.id}</div>
            <div className="qmeta">
              <span>NODE {q.number} / 15</span>
              <span>TRIES {done ? 0 : remaining}</span>
              <span>VALUE {done ? "0.00" : max.toFixed(2)}</span>
            </div>
            <div className="story-briefing">
              <span>CASE UPDATE</span>
              <p>{q.storyBeat}</p>
            </div>
            <p className="context">{q.context}</p>
            <h2 id="current-question">{q.prompt}</h2>
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
                      onChange={() => {
                        playCue("tap");
                        setSelected(o.id);
                      }}
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
                  ACCESS DENIED · {remaining} attempt
                  {remaining === 1 ? "" : "s"} remaining · Maximum{" "}
                  {max.toFixed(2)}
                </b>
                <p>
                  {prior.length === 1
                    ? q.hintAfterFirstWrong
                    : q.hintAfterSecondWrong}
                </p>
              </aside>
            )}
            {done && !done.correct && (
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
              ) : !done.correct ? (
                <button className="primary unlock" onClick={next}>
                  {q.number === 15 ? "OPEN FINAL EXIT" : "ENTER NEXT CHAMBER"}
                </button>
              ) : null}
            </div>
          </section>
        </div>
      ) : (
        <div className="awaiting-clue">
          <span>ROOM ACTIVE</span>
          <b>Find the highlighted evidence station to continue.</b>
        </div>
      )}
      {done?.correct && (
        <UnlockModal question={q} attempt={done} onContinue={next} />
      )}
    </Shell>
  );
}
function ResultView({
  p,
  onExit,
  onReset,
}: {
  p: Progress;
  onExit: () => void;
  onReset: () => Promise<void>;
}) {
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
          {p.student.displayName.trim().toLowerCase() === "hari" && (
            <button className="danger" onClick={onReset}>
              Reset and replay
            </button>
          )}
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
const demoQuestions = [
  {
    room: 1,
    title: "TRAINING CONSOLE",
    story:
      "This practice room is disconnected from the graded assessment. Show students how to inspect a station, choose an answer and validate their choice.",
    prompt:
      "Which glowing station should you inspect to begin an escape-room question?",
    options: [
      "The station marked EVIDENCE DETECTED",
      "Any locked station",
      "The exit button",
    ],
    answer: 0,
    explanation:
      "The pulsing EVIDENCE DETECTED station opens the question. Locked stations become available later.",
  },
  {
    room: 2,
    title: "PRACTICE ATTEMPT",
    story:
      "A practice lock is open. This example demonstrates answer selection and feedback without using any course question.",
    prompt: "What should a student do before pressing Validate Access Code?",
    options: ["Choose one answer", "Reset the whole quiz", "Close the browser"],
    answer: 0,
    explanation:
      "Students choose one option, then validate it. A wrong choice provides a hint and another attempt in the real activity.",
  },
  {
    room: 3,
    title: "LOCK RELEASE DEMO",
    story:
      "The final practice station demonstrates how a successful decision releases a lock and advances the investigation.",
    prompt: "What happens after a correct answer in the real escape room?",
    options: [
      "The lock releases and an explanation appears",
      "The grade is deleted",
      "The same screen freezes",
    ],
    answer: 0,
    explanation:
      "A correct response triggers the release animation, explains the answer and opens the next investigation step.",
  },
];

function InstructorSandbox() {
  const [step, setStep] = useState(0),
    [open, setOpen] = useState(false),
    [choice, setChoice] = useState<number | null>(null),
    [checked, setChecked] = useState(false);
  const q = demoQuestions[step],
    correct = checked && choice === q.answer;
  const restart = () => {
    setStep(0);
    setOpen(false);
    setChoice(null);
    setChecked(false);
  };
  return (
    <section className="instructor-sandbox">
      <div className="sandbox-toolbar">
        <div>
          <p className="eyebrow">Instructor demonstration sandbox</p>
          <h2>Student escape-room preview</h2>
          <p>
            Three ungraded practice questions. No account or Sheet data is used.
          </p>
        </div>
        <button onClick={restart}>Restart demo</button>
      </div>
      <div className="sandbox-room">
        <RoomScene
          roomNumber={q.room}
          questionNumber={1}
          scenarioId="A"
          onOpen={() => setOpen(true)}
        />
      </div>
      {open && (
        <div className="question-modal-backdrop sandbox-modal">
          <section className="question card evidence investigation-panel">
            <button
              className="close-investigation"
              onClick={() => setOpen(false)}
              aria-label="Close practice question"
            >
              ×
            </button>
            <div className="evidence-tab">PRACTICE FILE · DEMO-{step + 1}</div>
            <div className="story-briefing">
              <span>DEMONSTRATION UPDATE</span>
              <p>{q.story}</p>
            </div>
            <p className="context">{q.title}</p>
            <h2>{q.prompt}</h2>
            <fieldset disabled={correct}>
              {q.options.map((option, index) => (
                <label
                  className={`option ${choice === index ? "chosen" : ""}`}
                  key={option}
                >
                  <input
                    type="radio"
                    name="demo-answer"
                    checked={choice === index}
                    onChange={() => {
                      setChoice(index);
                      setChecked(false);
                    }}
                  />
                  <b>{String.fromCharCode(65 + index)}</b>
                  <span>{option}</span>
                </label>
              ))}
            </fieldset>
            {checked && (
              <aside className={correct ? "feedback good" : "feedback"}>
                <b>{correct ? "PRACTICE LOCK RELEASED" : "TRY AGAIN"}</b>
                <p>
                  {correct
                    ? q.explanation
                    : "That option is only a demonstration distractor. Select another answer."}
                </p>
              </aside>
            )}
            <div className="actions">
              {!correct ? (
                <button
                  className="primary"
                  disabled={choice === null}
                  onClick={() => setChecked(true)}
                >
                  VALIDATE PRACTICE CODE
                </button>
              ) : step < demoQuestions.length - 1 ? (
                <button
                  className="primary"
                  onClick={() => {
                    setStep(step + 1);
                    setOpen(false);
                    setChoice(null);
                    setChecked(false);
                  }}
                >
                  ENTER NEXT PRACTICE ROOM
                </button>
              ) : (
                <button className="primary" onClick={restart}>
                  REPLAY DEMONSTRATION
                </button>
              )}
            </div>
          </section>
        </div>
      )}
    </section>
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
        {[
          "dashboard",
          "student demo",
          "matrix",
          "class review",
          "scenario review",
        ].map((t) => (
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
      {tab === "student demo" && <InstructorSandbox />}
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
const genericReviewPrompts = [
  "Which interoperability standard should be checked first when imaging equipment must exchange images and examination information with PACS?",
  "If two systems both claim standards compliance, does that guarantee the hospital's complete workflow will operate correctly?",
  "What is the strongest way to confirm that a vendor's integration will work in the hospital's actual environment?",
  "How do HL7 and DICOM support different parts of an imaging workflow?",
  "Which user action creates the greatest patient-safety risk when a scheduled examination cannot be found on the modality worklist?",
  "What problem occurs when data is transmitted but two systems interpret the procedure differently?",
  "Which identifiers should be checked together to validate both the patient and imaging order?",
  "What should staff conclude when some identifiers match but important demographic or examination details conflict?",
  "What role does ICD play when diagnosis information is exchanged or reported?",
  "What is the safest conclusion when the hospital record and acquired study contain conflicting patient identities?",
  "What should staff do before correcting a suspected patient or study error in PACS?",
  "What response is appropriate when manual examination creation causes an imaging study to be associated incorrectly?",
  "What must be harmonized before diagnosis-coded information from several sites can become one reliable report?",
  "Why might FHIR be useful when another application requests selected health information?",
  "What combination of technical, semantic, workflow and governance practices best supports safe interoperability?",
];

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
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [reviewFilter, setReviewFilter] = useState<"all" | "wrong" | "correct">(
    "all",
  );
  const included = students.filter((s) => !excluded.has(s.studentId));
  const metrics = Array.from({ length: 15 }, (_, index) => {
    let answered = 0;
    const wrongStudents: Student[] = [];
    included.forEach((student) => {
      const questionId = allQuestions(scenario(student.scenarioId))[index].id;
      const aa = attempts.filter(
        (a) => a.studentId === student.studentId && a.questionId === questionId,
      );
      if (aa.length) answered += 1;
      if (aa.some((a) => !a.correct)) wrongStudents.push(student);
    });
    return {
      answered,
      wrongStudents,
      band: included.length
        ? Math.round((wrongStudents.length / included.length) * 4)
        : 0,
    };
  });
  const current = metrics[n - 1],
    exemplar = allQuestions(scenarios[0])[n - 1];
  const toggleStudent = (id: string) =>
    setExcluded((old) => {
      const next = new Set(old);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  return (
    <section className="class-review">
      <section className="student-selector card">
        <div>
          <p className="eyebrow">Student selector</p>
          <h2>Include in class analysis</h2>
          <p>Uncheck your test account or any student you want to exclude.</p>
        </div>
        <div className="student-checks">
          {students.map((student) => (
            <label key={student.studentId}>
              <input
                type="checkbox"
                checked={!excluded.has(student.studentId)}
                onChange={() => toggleStudent(student.studentId)}
              />
              <span>{student.displayName}</span>
            </label>
          ))}
        </div>
      </section>
      <div className="review-filters">
        <span>Show questions:</span>
        {(
          [
            ["all", "All"],
            ["wrong", "Needs review"],
            ["correct", "All correct"],
          ] as const
        ).map(([value, label]) => (
          <button
            className={reviewFilter === value ? "active" : ""}
            onClick={() => setReviewFilter(value)}
            key={value}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="question-heatmap">
        {metrics
          .map((metric, index) => ({ metric, index }))
          .filter(
            ({ metric }) =>
              reviewFilter === "all" ||
              (reviewFilter === "wrong"
                ? metric.wrongStudents.length > 0
                : metric.answered > 0 && metric.wrongStudents.length === 0),
          )
          .map(({ metric, index }) => (
            <button
              key={index}
              className={`${n === index + 1 ? "selected" : ""} review-band-${metric.answered ? metric.band : "empty"}`}
              onClick={() => setPick(String(index + 1))}
              title={`${metric.wrongStudents.length} of ${included.length} students made a mistake`}
            >
              {index + 1}
              <small>{metric.wrongStudents.length} wrong</small>
            </button>
          ))}
      </div>
      <article className="class-question card">
        <p className="eyebrow">
          Question {n} · {exemplar.competency}
        </p>
        <h2>{genericReviewPrompts[n - 1]}</h2>
        <div className="review-summary">
          <div>
            <b>{included.length}</b>
            <span>students included</span>
          </div>
          <div>
            <b>{current.answered}</b>
            <span>students answered</span>
          </div>
          <div
            className={
              current.wrongStudents.length ? "has-errors" : "all-clear"
            }
          >
            <b>{current.wrongStudents.length}</b>
            <span>students made a mistake</span>
          </div>
        </div>
        <section className="wrong-answer-list">
          <h3>
            {current.wrongStudents.length
              ? "Review with these students"
              : "No wrong answers to review"}
          </h3>
          {current.wrongStudents.length ? (
            <ul>
              {current.wrongStudents.map((student) => (
                <li key={student.studentId}>{student.displayName}</li>
              ))}
            </ul>
          ) : (
            <p>
              Everyone who answered selected the correct answer without a
              recorded mistake.
            </p>
          )}
        </section>
      </article>
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
