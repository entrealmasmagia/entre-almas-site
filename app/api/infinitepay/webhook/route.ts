import {E,out,one} from '../../../../lib/store';
import {webhookReference} from '../../../../lib/payments';
import {mayConfirmPayment} from '../../../../lib/payment-test';
import {settle} from '../../../../lib/settlement';
export async function POST(r:Request){try{
 const body=await r.text();if(body.length>10000)throw Error();
 const ref=webhookReference(JSON.parse(body));
 const order=await one('SELECT orders.* FROM orders JOIN installments ON installments.order_id=orders.id WHERE installments.id=?',ref.order_nsu);
 const bill=await one('SELECT * FROM installments WHERE id=?',ref.order_nsu);
 if(!order||!mayConfirmPayment(E(),order,bill))return out({error:'Pedido indisponível para confirmação.'},409);
 return out(await settle(ref,fetch,'webhook'));
}catch{return out({error:'Pagamento não confirmado.'},400)}}
export async function GET(){return out({reachable:true,paymentsEnabled:E().PAYMENTS_ENABLED==='true',confirmation:'POST verified by payment_check'})}
