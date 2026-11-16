// Pure helpers shared by checkout and webhook. Never return credentials.
export function paymentDiagnostics(e:Record<string,unknown>){return {keyConfigured:typeof e.INFINITEPAY_API_KEY==='string'&&e.INFINITEPAY_API_KEY.trim().length>0,paymentsEnabled:e.PAYMENTS_ENABLED==='true'};}
export function checkoutPayload(o:{id:string;total:number;customer:string},origin:string,handle:string,mode='pix'){
 if(!Number.isSafeInteger(o.total)||o.total<100)throw Error('Total inválido.');
 const c=JSON.parse(o.customer);const digits=String(c.phone).replace(/\D/g,'');
 const phone_number='+'+(digits.length===10||digits.length===11?'55':'')+digits;
 return {handle,order_nsu:o.id,redirect_url:new URL('/?retorno=1',origin).href,webhook:{url:new URL('/api/infinitepay/webhook',origin).href,events:['paid']},items:[{quantity:1,price:o.total,description:'Entre Almas • '+o.id}],customer:{name:c.name,email:c.email,phone_number},options:{single_payment:true,assured_installments:0,payment_methods_enabled:mode==='card'?['credit_card']:['credit_card','pix']}};
}
export function webhookReference(b:any){
 const slug=b?.invoice_slug??b?.slug;
 if(typeof b?.order_nsu!=='string'||!b.order_nsu||b.order_nsu.length>100||typeof b.transaction_nsu!=='string'||!b.transaction_nsu||b.transaction_nsu.length>200||typeof slug!=='string'||!slug||slug.length>200)throw Error('Referência inválida.');
 return {order_nsu:b.order_nsu,transaction_nsu:b.transaction_nsu,slug};
}
export function confirmedPayment(ok:boolean,d:any,total:number){return ok&&d?.success===true&&d?.paid===true&&Number.isSafeInteger(total)&&total>0&&Number(d.amount)===total;}

export function paymentModes(e:Record<string,unknown>){const on=e.PAYMENTS_ENABLED==='true';return {pix:on&&e.PIX_ENABLED==='true',pix2:false,card:on&&e.CARD_ENABLED==='true'}}
