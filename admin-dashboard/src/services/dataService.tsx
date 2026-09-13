import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { backendApi } from './backendApiService';
import { Collector, Recycler, Material, Lot, Transaction, Handover, Price, FlaggedRecord, AdminUser, RecyclerVerificationStatus, LotStatus, CollectorAccountStatus, PaymentStatus, RecyclerAccountStatus } from '../types';
import { INITIAL_ADMIN, INITIAL_COLLECTORS, INITIAL_RECYCLERS, INITIAL_MATERIALS, INITIAL_LOTS, INITIAL_TRANSACTIONS, INITIAL_HANDOVERS, INITIAL_PRICES, INITIAL_FLAGGED_RECORDS } from '../data/mockData';

interface DataContextType {
 admin: AdminUser; collectors: Collector[]; recyclers: Recycler[]; materials: Material[]; lots: Lot[]; transactions: Transaction[]; handovers: Handover[]; prices: Price[]; flaggedRecords: FlaggedRecord[];
 login:(email:string,pass:string)=>boolean; logout:()=>void; updateAdminProfile:(updated:Partial<AdminUser>)=>void;
 updateCollectorStatus:(id:string,status:CollectorAccountStatus)=>void; updateRecyclerVerification:(id:string,status:RecyclerVerificationStatus,reason?:string)=>void; updateRecyclerAccountStatus:(id:string,status:RecyclerAccountStatus)=>void;
 updateLotStatus:(id:string,status:LotStatus,recyclerId?:string,finalPrice?:number)=>void; updateTransactionPayment:(id:string,status:PaymentStatus,utr?:string)=>void; confirmHandover:(id:string,w:number,name:string)=>void;
 updatePriceRate:(id:string,b:number,min:number,max:number)=>void; addPriceRate:(price:Omit<Price,'price_id'>)=>void; resolveFlaggedRecord:(id:string,notes:string,action:'Resolved'|'Overridden')=>void; resetAllData:()=>void;
}
const STORAGE_KEY='kabadiwala_connect_admin_data_v1';
const DataContext=createContext<DataContextType|undefined>(undefined);

export const DataProvider:React.FC<{children:React.ReactNode}>=({children})=>{
 const [admin,setAdmin]=useState<AdminUser>(()=>{const s=localStorage.getItem(`${STORAGE_KEY}_admin`);return s?JSON.parse(s):INITIAL_ADMIN});
 const [collectors,setCollectors]=useState<Collector[]>([]),[recyclers,setRecyclers]=useState<Recycler[]>([]),[materials,setMaterials]=useState<Material[]>(INITIAL_MATERIALS),[lots,setLots]=useState<Lot[]>([]),[transactions,setTransactions]=useState<Transaction[]>([]),[handovers,setHandovers]=useState<Handover[]>([]),[prices,setPrices]=useState<Price[]>(INITIAL_PRICES),[flaggedRecords,setFlaggedRecords]=useState<FlaggedRecord[]>(INITIAL_FLAGGED_RECORDS);
 const loadLive=useCallback(async()=>{
  try{
   const [cs,ls,rs,tx,hs]=await Promise.all([backendApi.getCollectors(),backendApi.getLots(),backendApi.getRecyclers(),backendApi.getTransactions(),backendApi.getHandovers()]);
   setCollectors((cs||[]).map((c:any)=>({collector_id:String(c.id),name:c.name,phone:c.phone,city:c.location||'Unknown',preferred_language:c.language||'Hindi',registration_date:'',total_lots:(ls||[]).filter((l:any)=>l.collector_id===c.id).length,completed_lots:(ls||[]).filter((l:any)=>l.collector_id===c.id&&String(l.status).toUpperCase()==='COMPLETED').length,total_earnings:(ls||[]).filter((l:any)=>l.collector_id===c.id).reduce((s:number,l:any)=>s+Number(l.final_price||l.quoted_price||0),0),account_status:'Active',last_active:'',kyc_status:'Verified'})));
   setLots((ls||[]).map((l:any)=>({lot_id:l.lot_id,collector_id:String(l.collector_id),material:l.material,material_category:l.material,weight_kg:l.weight,estimated_min_value:l.estimated_value||0,estimated_max_value:l.estimated_value||0,quoted_price:l.quoted_price||0,final_price:l.final_price||l.quoted_price||0,recycler_id:l.recycler_id?String(l.recycler_id):'',status:l.status,created_at:l.created_at||'',location:l.location||''})));
   setRecyclers((rs||[]).map((r:any)=>({recycler_id:String(r.id),organization_name:r.organization_name,contact_person:'',location:r.location||'',materials_accepted:r.materials_accepted?String(r.materials_accepted).split(','):[],authorization_number:`AUTH-${r.id}`,authorization_status:r.authorization_status==='VERIFIED'?'Verified':r.authorization_status||'Pending',authorization_expiry:'',offered_rate_summary:'',pickup_available:Boolean(r.pickup_available),service_area:[],account_status:'Active',phone:'',email:''})));
   setTransactions(tx||[]); setHandovers(hs||[]);
  }catch(e){console.warn('Backend refresh failed',e);}
 },[]);
 useEffect(()=>{loadLive();const t=window.setInterval(loadLive,5000);return()=>window.clearInterval(t)},[loadLive]);
 useEffect(()=>localStorage.setItem(`${STORAGE_KEY}_admin`,JSON.stringify(admin)),[admin]);
 const login=(email:string,_pass:string)=>{setAdmin(p=>({...p,email:email||p.email,is_logged_in:true,last_login:new Date().toISOString()}));return true};
 const logout=()=>setAdmin(p=>({...p,is_logged_in:false}));
 const updateAdminProfile=(u:Partial<AdminUser>)=>setAdmin(p=>({...p,...u}));
 const updateCollectorStatus=(id:string,status:CollectorAccountStatus)=>setCollectors(p=>p.map(x=>x.collector_id===id?{...x,account_status:status}:x));
 const updateRecyclerVerification=(id:string,status:RecyclerVerificationStatus,_reason?:string)=>setRecyclers(p=>p.map(x=>x.recycler_id===id?{...x,authorization_status:status,account_status:status==='Rejected'?'Suspended':status==='Verified'?'Active':x.account_status}:x));
 const updateRecyclerAccountStatus=(id:string,status:RecyclerAccountStatus)=>setRecyclers(p=>p.map(x=>x.recycler_id===id?{...x,account_status:status}:x));
 const updateLotStatus=async(id:string,status:LotStatus,recyclerId?:string,finalPrice?:number)=>{try{await backendApi.updateLotStatus(id,status,recyclerId?Number(recyclerId):undefined,finalPrice);await loadLive()}catch(e){console.error(e)}};
 const updateTransactionPayment=async(id:string,status:PaymentStatus,utr?:string)=>{try{await backendApi.updatePayment(id,String(status),utr);await loadLive()}catch(e){console.error(e)}};
 const confirmHandover=(id:string,w:number,name:string)=>setHandovers(p=>p.map(x=>x.handover_id===id?{...x,weight_confirmed:w,recycler_confirmation:true,status:'Verified',manifest_signoff_by:name}:x));
 const updatePriceRate=(id:string,b:number,min:number,max:number)=>setPrices(p=>p.map(x=>x.price_id===id?{...x,buying_price_per_kg:b,market_min:min,market_max:max}:x));
 const addPriceRate=(price:Omit<Price,'price_id'>)=>setPrices(p=>[{...price,price_id:`PRC-${Date.now()}`},...p]);
 const resolveFlaggedRecord=(id:string,notes:string,action:'Resolved'|'Overridden')=>setFlaggedRecords(p=>p.map(x=>x.issue_id===id?{...x,status:action,resolution_notes:notes,resolved_by:admin.name,resolved_at:new Date().toISOString()}:x));
 const resetAllData=()=>{setAdmin(INITIAL_ADMIN);setCollectors(INITIAL_COLLECTORS);setRecyclers(INITIAL_RECYCLERS);setMaterials(INITIAL_MATERIALS);setLots(INITIAL_LOTS);setTransactions(INITIAL_TRANSACTIONS);setHandovers(INITIAL_HANDOVERS);setPrices(INITIAL_PRICES);setFlaggedRecords(INITIAL_FLAGGED_RECORDS)};
 return <DataContext.Provider value={{admin,collectors,recyclers,materials,lots,transactions,handovers,prices,flaggedRecords,login,logout,updateAdminProfile,updateCollectorStatus,updateRecyclerVerification,updateRecyclerAccountStatus,updateLotStatus,updateTransactionPayment,confirmHandover,updatePriceRate,addPriceRate,resolveFlaggedRecord,resetAllData}}>{children}</DataContext.Provider>;
};
export const useData=()=>{const c=useContext(DataContext);if(!c)throw new Error('useData must be used within a DataProvider');return c};
