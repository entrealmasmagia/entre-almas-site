import {env} from 'cloudflare:workers';
import {products,Product,commerceDefaults,duration} from './catalog';
import {defaults} from './settings';
import {verifyAdminSession} from './admin-auth';
export {duration};
export const E=()=>env as any;
export const db=()=>{if(!E().DB)throw Error('Banco indisponível.');return E().DB as D1Database};
export const stmt=(sql:string,...args:any[])=>db().prepare(sql).bind(...args);
export async function rows(sql:string,...args:any[]){return (await stmt(sql,...args).all()).results as any[]}
export async function one(sql:string,...args:any[]){return await stmt(sql,...args).first() as any}
export const identity=(r:Request)=>r.headers.get('oai-authenticated-user-id');

export const admin=(r:Request)=>verifyAdminSession(r,String(E().ADMIN_SESSION_SECRET||''));
export const out=(d:any,status=200)=>Response.json(d,{status,headers:{'Cache-Control':'no-store'}});
export async function saved(id:string){const r=await one('SELECT data FROM services WHERE id=?',id);return r?JSON.parse(r.data):{}}
export async function put(id:string,data:any){await stmt('INSERT INTO services(id,data) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data',id,JSON.stringify(data)).run()}
export async function catalog(){const map=new Map(products.map(p=>[p.id,{...p}]));for(const r of await rows('SELECT * FROM services')){if(r.id.startsWith('__')||r.id==='simples')continue;map.set(r.id,{...map.get(r.id),...JSON.parse(r.data),id:r.id})}const p=map.get('afastamento');if(p?.name==='Afastamento de Rivais'){const base=products.find(p=>p.id==='afastamento')!;map.set(p.id,{...p,name:base.name,description:base.description})}return [...map.values()].filter(p=>!p.deleted&&p.name&&p.kind) as Product[]}
export async function settings(){const s=await saved('__site');return {...defaults,...s,...(s._contentRevision===3?{}:{about:defaults.about,aboutTitle:defaults.aboutTitle,urgentTimeline:defaults.urgentTimeline})}}
export async function commerce(){return {...commerceDefaults,...await saved('__commerce')}}
export function validDate(s:any){return typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s+'T12:00:00Z'))&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s}
export function stamp(d:string,t:string){if(!validDate(d)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(t))throw Error('Data ou horário inválido.');return Date.parse(`${d}T${t}:00-03:00`)}
export function segments(start:number,mins:number){if(!Number.isInteger(mins)||mins<15||mins>240||mins%15||start%900000)throw Error('Use intervalos de 15 minutos.');return Array.from({length:mins/15},(_,i)=>start+i*900000)}
export function safeImage(s:any){return typeof s==='string'&&(/^\/(?:api\/media\/|ritual-|janaina|altar)/.test(s)||/^https:\/\//.test(s))}
export async function availableSlots(p:Product,month:string){if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(mon
