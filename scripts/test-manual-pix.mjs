import {DatabaseSync} from 'node:sqlite';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import {splitAmounts} from '../lib/commerce-rules.ts';
const sql=new DatabaseSync(':memory:');
for(const f of ['0000_aromatic_salo.sql','0001_wakeful_guardsmen.sql'])sql.exec(fs.readFileSync('drizzle/'+f,'utf8'));
const stmt=(s,...args)=>({s,args});
const one=async(s,...args)=>sql.prepare(s).get(...args);
const rows=async(s,...args)=>sql.prepare(s).all(...args);
const db=()=>({batch:async statements=>{sql.exec('BEGIN');try{for(const q of statements)sql.prepare(q.s).run(...q.args);sql.exec('COMMIT')}catch(e){sql.exec('ROLLBACK');throw e}}});
const exports={};new Function('require','exports',ts.transpile(fs.readFileSync('lib/settlement.ts','utf8'),{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}))(name=>name==='./store'?{db,stmt,one,E:()=>({})}:{},exports);
const source=fs.readFileSync('app/api/shop/route.ts','utf8');assert.match(source,/\['settings'.*'manualPix'[^\]]*\]\.includes\(b.action\)&&!isAdmin/);
const branch=source.slice(source.indexOf(" if(b.action==='manualPix')"),source.indexOf(" if(b.action==='due')"));
const invoke=new (Object.getPrototypeOf(async function(){}).constructor)('b','o','splitAmounts','db','stmt','rows','validDate','recordPayment','out','fail','owner','now',ts.transpile(branch,{target:ts.ScriptTarget.ES2022}));
function create(id){sql.prepare("INSERT INTO orders(id,owner,customer,items,subtotal,fees,total,status,created,payment_mode) VALUES(?,?,?,?,?,0,?,'Aguardando pagamento',?,'pix2')").run(id,'client',JSON.stringify({secondDue:'2026-12-01'}),JSON.stringify([{id:'p1',kind:'consulta',qty:1,points:1}]),3501,3501,new Date().toISOString())}
const ref=n=>'E'+String(n).padStart(31,'0');
async function confirm(id,part,reference,amount,confirmed=true){return invoke({action:'manualPix',part,reference,amount,confirmed},await one('SELECT * FROM orders WHERE id=?',id),splitAmounts,db,stmt,rows,s=>/^\d{4}-\d{2}-\d{2}$/.test(s),exports.recordPayment,x=>x,s=>{throw Error(s)},'admin',new Date().toISOString())}
create('A');create('B');
await assert.rejects(confirm('A',2,ref(2),1751),/primeira/);
await assert.rejects(confirm('A',1,ref(1),1750,false),/Confira/);
await assert.rejects(confirm('A',1,ref(1),1),/valor/);
let result=await confirm('A',1,ref(1),1750);assert.equal(result.paid,0);assert.equal(result.status,'Aguardando quitação');assert.equal(result.settled_at,null);assert.equal((await rows('SELECT * FROM loyalty')).length,0);
await confirm('A',1,ref(1),1750);assert.equal((await one('SELECT paid_amount FROM orders WHERE id=?','A')).paid_amount,1750);
await assert.rejects(confirm('B',1,ref(1),1750));assert.equal((await one('SELECT paid_amount FROM orders WHERE id=?','B')).paid_amount,0);
result=await confirm('A',2,ref(2),1751);assert.equal(result.paid,1);assert.equal(result.balance,0);assert.ok(result.settled_at);assert.equal((await one('SELECT SUM(points) n FROM loyalty')).n,1);
await confirm('A',2,ref(2),1751);assert.equal((await one('SELECT SUM(points) n FROM loyalty')).n,1);assert.equal((await rows("SELECT * FROM services WHERE id LIKE '__audit-%'")).length,2);
console.log('Manual PIX: admin guard, exact cents, receipt deduplication, audit, 50% pending, 100% release, loyalty once. Local SQLite only.');
