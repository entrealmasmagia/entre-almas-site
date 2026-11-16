import {E,out,db,stmt,one} from '../../../../lib/store';
// Public, sanitized health check. Never creates links or queries actual orders.
// A database lock limits the two provider reads to once per diagnostic revision.
const ID='__infinitepay-health-v8';
export async function GET(){
 try{
  const cached=await one('SELECT data FROM services WHERE id=?',ID);
  if(cached)return out({...JSON.parse(cached.data),paymentsEnabled:E().PAYMENTS_ENABLED==='true'});
  const pending={status:'checking',paymentsEnabled:E().PAYMENTS_ENABLED==='true',checkedAt:new Date().toISOString()};
  const claim=await stmt('INSERT OR IGNORE INTO services(id,data) VALUES(?,?) RETURNING id',ID,JSON.stringify(pending)).all();
  if(!claim.results.length)return out(pending);
  const key=E().INFINITEPAY_API_KEY;
  const result:any={...pending,keyConfigured:typeof key==='string'&&key.trim().length>0,status:'missing_key',createsCharges:false};
  if(result.keyConfigured){
   const body=JSON.stringify({handle:E().INFINITEPAY_HANDLE||'salade_sinais',order_nsu:'EA-NONEXISTENT-TECHNICAL-CHECK',transaction_nsu:'00000000-0000-4000-8000-000000000000',slug:'nonexistent-technical-check'});
   async function check(apiKey:string){
    const response=await fetch('https://api.checkout.infinitepay.io/payment_check',{method:'POST',headers:{'Content-Type':'application/json','X-Api-Key':apiKey},body,signal:AbortSignal.timeout(10000)});
    const data:any=await response.json().catch(()=>({}));
    return {httpStatus:response.status,success:data.success===true,paid:data.paid===true};
   }
   try{result.provider=await check(key);result.invalidKeyControl=await check('inchk_invalid_technical_control');
    result.status=result.provider.httpStatus===200&&[401,403].includes(result.invalidKeyControl.httpStatus)?'authentication_accepted': [401,403].includes(result.provider.httpStatus)?'authentication_rejected':'communication_only_authentication_unconfirmed';
   }catch{result.status='communication_failed'}
  }
  await stmt('UPDATE services SET data=? WHERE id=?',JSON.stringify(result),ID).run();
  return out(result);
 }catch{return out({status:'diagnostics_unavailable',createsCharges:false},503)}
}
