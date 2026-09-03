import {APP_ID,APPS_SCRIPT_URL,INSTRUCTOR_PIN} from './config';import type {Attempt,Progress,Result,Student} from './types';
async function post<T>(action:string,payload:object):Promise<T>{const r=await fetch(APPS_SCRIPT_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({app:APP_ID,action,...payload})});if(!r.ok)throw new Error('network');const j=await r.json();if(!j.ok)throw new Error(j.error||'request_failed');return j}
const key=(id:string)=>`interop_progress_${id}`;
export async function ensureBackend(){const r=await fetch(`${APPS_SCRIPT_URL}?app=${encodeURIComponent(APP_ID)}`,{cache:'no-store'});if(!r.ok)throw new Error('backend_unavailable');const j=await r.json();if(!j.ok)throw new Error(j.error||'backend_not_ready');return j}
export async function login(studentName:string,pin:string){return post<{ok:true,student:Student,progress?:Progress,newStudent?:boolean}>('studentLogin',{studentName,pin})}
export async function saveAttempt(attempt:Attempt,progress:Progress){const old=localStorage.getItem(key(progress.student.studentId));await post('saveAttempt',{attempt,progress});localStorage.setItem(key(progress.student.studentId),JSON.stringify(progress));return old}
export async function saveResult(result:Result,progress:Progress){await post('saveResult',{result,progress});localStorage.setItem(key(progress.student.studentId),JSON.stringify(progress))}
export function cached(id:string){try{return JSON.parse(localStorage.getItem(key(id))||'null') as Progress|null}catch{return null}}
export async function instructorData(){return post<{ok:true,students:Student[],progress:Progress[],attempts:Attempt[],results:Result[]}>('instructorData',{pin:INSTRUCTOR_PIN})}
export async function resetStudent(studentId:string){return post('resetStudent',{pin:INSTRUCTOR_PIN,studentId})}
