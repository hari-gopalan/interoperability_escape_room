import { APP_ID, APPS_SCRIPT_URL, INSTRUCTOR_PIN } from "./config";
import type { Attempt, Progress, Result, Student } from "./types";
let writeQueue: Promise<unknown> = Promise.resolve();
function enqueue<T>(job: () => Promise<T>) {
  const run = writeQueue.then(job, job);
  writeQueue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}
async function post<T>(action: string, payload: object): Promise<T> {
  let r: Response;
  try {
    r = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ app: APP_ID, action, ...payload }),
    });
  } catch {
    throw new Error(
      "Cannot reach Google Sheets. Check your connection, then try again.",
    );
  }
  if (!r.ok)
    throw new Error(
      `Google Sheets returned HTTP ${r.status}. Please try again.`,
    );
  let j;
  try {
    j = await r.json();
  } catch {
    throw new Error(
      "Google Sheets returned an unreadable response. Please try again.",
    );
  }
  if (!j.ok) throw new Error(j.error || "request_failed");
  return j;
}
async function retryPost<T>(action: string, payload: object) {
  try {
    return await post<T>(action, payload);
  } catch (firstError) {
    const message = firstError instanceof Error ? firstError.message : "";
    if (
      !message.startsWith("Cannot reach") &&
      !message.startsWith("Google Sheets returned")
    )
      throw firstError;
    await new Promise((resolve) => setTimeout(resolve, 900));
    try {
      return await post<T>(action, payload);
    } catch {
      throw firstError;
    }
  }
}
const key = (id: string) => `interop_progress_${id}`;
export async function ensureBackend() {
  const r = await fetch(
    `${APPS_SCRIPT_URL}?app=${encodeURIComponent(APP_ID)}`,
    { cache: "no-store" },
  );
  if (!r.ok) throw new Error("backend_unavailable");
  const j = await r.json();
  if (!j.ok) throw new Error(j.error || "backend_not_ready");
  return j;
}
export async function login(studentName: string, pin: string) {
  return retryPost<{
    ok: true;
    student: Student;
    progress?: Progress;
    newStudent?: boolean;
  }>("studentLogin", { studentName, pin });
}
export function saveAttempt(attempt: Attempt, progress: Progress) {
  const old = localStorage.getItem(key(progress.student.studentId));
  localStorage.setItem(
    key(progress.student.studentId),
    JSON.stringify(progress),
  );
  return enqueue(async () => {
    await post("saveAttempt", { attempt, progress });
    return old;
  });
}
export function saveResult(result: Result, progress: Progress) {
  localStorage.setItem(
    key(progress.student.studentId),
    JSON.stringify(progress),
  );
  return enqueue(() => post("saveResult", { result, progress }));
}
export function cached(id: string) {
  try {
    return JSON.parse(
      localStorage.getItem(key(id)) || "null",
    ) as Progress | null;
  } catch {
    return null;
  }
}
export async function instructorData() {
  return retryPost<{
    ok: true;
    students: Student[];
    progress: Progress[];
    attempts: Attempt[];
    results: Result[];
  }>("instructorData", { pin: INSTRUCTOR_PIN });
}
export async function resetStudent(studentId: string) {
  return post("resetStudent", { pin: INSTRUCTOR_PIN, studentId });
}
