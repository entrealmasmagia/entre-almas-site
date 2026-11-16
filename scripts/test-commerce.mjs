import assert from 'node:assert/strict';
import {products,calculate} from '../lib/catalog.ts';
assert.equal(products.length,26);
assert.equal(calculate([{id:'p1',qty:1,extra:true}],products).total,6200);
assert.equal(calculate([{id:'harmonizacao',qty:1,extra:true}],products).total,87400);
assert.equal(calculate([{id:'harmonizacao',qty:1,extra:true}],products,5970).total,81430);
assert.equal(calculate([{id:'p1',qty:2,extra:true},{id:'vip',qty:1,extra:true}],products).total,16390);
assert.equal(calculate([{id:'p1',qty:1,price:1}],products).total,3500);
assert.equal(calculate([{id:'separacao',qty:1}],products).total,88700);
for(const qty of [-1,0,11,1.5,'1'])assert.throws(()=>calculate([{id:'p1',qty}],products));
assert.throws(()=>calculate([{id:'fake',qty:1}],products));
assert.throws(()=>calculate([{id:'p1',qty:1}],products.map(p=>p.id==='p1'?{...p,active:false}:p)));
assert.equal(products.filter(p=>p.link).length,10);
console.log('Passed: totals, distinct fees, discount base, quantities, tampering, hidden services and original checkout links.');

import {validateAppointments,scheduledIds,defaults} from '../lib/settings.ts';
assert.deepEqual(validateAppointments({},[{id:'p1'}]),{});
assert.throws(()=>validateAppointments({},[{id:'completa'}]));
assert.throws(()=>validateAppointments({completa:{date:'2020-01-01',time:'12:00'}},[{id:'completa'}]));
assert.equal(validateAppointments({completa:{date:'2026-12-01',time:'14:00'}},[{id:'completa'}],Date.parse('2026-11-13')).completa.status,'Solicitado');
assert.throws(()=>validateAppointments({completa:{date:'2026-12-01',time:'25:00'}},[{id:'completa'}],Date.parse('2026-11-13')));
console.log('Agendamento: datas futuras, horário válido e avulsas sem agenda verificados.');

assert.deepEqual([...scheduledIds].sort(),products.filter(p=>p.kind==='consulta'&&p.category!=='Perguntas avulsas').map(p=>p.id).sort());
for(const id of scheduledIds) assert.throws(()=>validateAppointments({},[{id}]));
for(const id of ['p1','p3','p5'])assert.deepEqual(validateAppointments({},[{id}]),{});
assert.equal(defaults.vipLink,'https://invoice.infinitepay.io/plans/salade_sinais/jJes23oSBV');
console.log('Todas as leituras agendáveis; avulsas sem agenda; link VIP preservado.');

assert.throws(()=>calculate([{id:'simples',qty:1}],products));
for(const d of [NaN,Infinity,1.5])assert.throws(()=>calculate([{id:'p1',qty:1}],products,d));
import {checkoutPayload,confirmedPayment,webhookReference,paymentDiagnostics} from '../lib/payments.ts';
const customer=JSON.stringify({name:'Teste',email:'test@example.com',phone:'(61) 99999-9999'});
for(const total of [6200,87400,81430,3500,12700]){
 const payload=checkoutPayload({id:'EA-test',total,customer},'https://example.com','salade_sinais');
 assert.equal(payload.items[0].price,total);assert.equal(payload.customer.phone_number,'+5561999999999');
 assert.deepEqual(payload.webhook,{url:'https://example.com/api/infinitepay/webhook',events:['paid']});
 assert.equal(payload.options.single_payment,true);
 assert.equal(confirmedPayment(true,{success:true,paid:true,amount:total,paid_amount:total+100},total),true);
 assert.equal(confirmedPayment(true,{success:true,paid:true,amount:total-1},total),false);
 assert.equal(confirmedPayment(true,{success:true,paid:false,amount:total},total),false);
 assert.equal(confirmedPayment(false,{success:true,paid:true,amount:total},total),false);
}
assert.deepEqual(webhookReference({order_nsu:'EA-test',transaction_nsu:'tx',invoice_slug:'invoice'}),{order_nsu:'EA-test',transaction_nsu:'tx',slug:'invoice'});
assert.equal(webhookReference({order_nsu:'EA-test',transaction_nsu:'tx',slug:'legacy'}).slug,'legacy');
assert.throws(()=>webhookReference({order_nsu:'EA-test',invoice_slug:'invoice'}));
assert.deepEqual(paymentDiagnostics({INFINITEPAY_API_KEY:'dummy-not-real'}),{keyConfigured:true,paymentsEnabled:false});
assert.deepEqual(paymentDiagnostics({}),{keyConfigured:false,paymentsEnabled:false});
console.log('Payment contract: cent amounts, Brazilian phone, webhook invoice_slug, paid and amount verification, safe diagnostics passed. No live charge sent.');
