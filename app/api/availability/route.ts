import {out,catalog,availableSlots} from '../../../lib/store';
export async function GET(r:Request){try{const u=new URL(r.url),p=(await catalog()).find(p=>p.id===u.searchParams.get('service')&&p.active!==false);if(!p)return out({error:'Serviço indisponível.'},404);return out({slots:await availableSlots(p,u.searchParams.get('month')||'')})}catch{return out({error:'Agenda indisponível.'},503)}}
