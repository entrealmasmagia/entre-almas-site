const cookieName='ea_visitor';
/** An unguessable, HttpOnly capability scopes anonymous purchases to this browser.
 * Only its SHA-256 digest is stored as an order owner. Admin identity is separate. */
export async function visitor(r:Request,authenticated:string|null,create=false){
 if(authenticated)return {owner:authenticated,cookie:null};
 let token=r.headers.get('cookie')?.split(';').map(v=>v.trim()).find(v=>v.startsWith(cookieName+'='))?.slice(cookieName.length+1);
 if(token&&!/^[a-f0-9]{64}$/.test(token))token=undefined;
 let cookie:string|null=null;
 if(!token&&create){token=Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');cookie=`${cookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000${new URL(r.url).protocol==='https:'?'; Secure':''}`;}
 if(!token)return {owner:null,cookie};
 const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token));
 return {owner:'guest:'+Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join(''),cookie};
}
export function visitorResponse(response:Response,cookie:string|null){if(cookie)response.headers.append('Set-Cookie',cookie);return response;}
export function validateSplit(mode:string,items:{kind:string}[]){if(mode==='pix2'&&(!items.length||items.some(i=>i.kind!=='ritual')))throw Error('PIX em 2 vezes é exclusivo para trabalhos espirituais. Separe as consultas em outro pedido.');}
