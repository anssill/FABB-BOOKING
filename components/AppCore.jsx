'use client'
// components/AppCore.jsx — Fabb.booking · Full Booqable Clone
import { useState, useRef, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

/* ─── SUPABASE CLIENT ─────────────────────────────────────────── */
const SB_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL  || "";
const SB_KEY  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const sb = SB_URL && SB_KEY ? createClient(SB_URL, SB_KEY) : null;

/* ─── DESIGN TOKENS ──────────────────────────────────────────── */
const T = {
  o:"#FF6B35", oH:"#E85C28", oL:"#FFF1EB", oB:"#FFD4C0",
  navy:"#1C2237", navyH:"rgba(255,255,255,0.07)",
  bg:"#F4F5F8", white:"#FFFFFF",
  bdr:"#E5E7EB", bdr2:"#D1D5DB",
  text:"#111827", tMd:"#374151", tSm:"#6B7280", tXs:"#9CA3AF",
  green:"#059669", gL:"#D1FAE5", gB:"#6EE7B7",
  blue:"#1D4ED8",  bL:"#DBEAFE", bB:"#93C5FD",
  yel:"#B45309",   yL:"#FEF3C7", yB:"#FCD34D",
  red:"#DC2626",   rL:"#FEE2E2", rB:"#FCA5A5",
  pur:"#6D28D9",   pL:"#EDE9FE",
  teal:"#0D9488",  tL:"#CCFBF1",
  pink:"#BE185D",  pkL:"#FCE7F3",
};

/* ─── CONSTANTS ──────────────────────────────────────────────── */
const CATS = ["Sherwani","Achkan","Suit","Kurtha","Loafer","Indo-Western","Bridal","Kids Wear","Saree","Accessories","Other"];
const WASH_STAGES = ["Pending Wash","Washing","Drying","Ironing","Ready","In Stock"];
const WASH_COLOR = {"Pending Wash":T.yel,"Washing":T.blue,"Drying":T.teal,"Ironing":T.pur,"Ready":T.green,"In Stock":T.tSm};
const WASH_BG    = {"Pending Wash":T.yL,"Washing":T.bL,"Drying":T.tL,"Ironing":T.pL,"Ready":T.gL,"In Stock":"#F1F5F9"};
const WASH_ICON  = {"Pending Wash":"🧺","Washing":"🌀","Drying":"💨","Ironing":"🔥","Ready":"✅","In Stock":"📦"};
const ID_TYPES   = ["Aadhaar Card","Passport","Voter ID","Driver's License","PAN Card","Employee ID","Other"];
const DEP_METHODS = ["Cash","UPI","Bank Transfer","Cheque","Other"];
const CONTACT_TYPES = ["Phone","WhatsApp","Email","Work Phone","Emergency","Other"];
const STATUS_META = {
  concept:  {label:"Quote",    bg:"#F1F5F9", cl:T.tSm,  bd:"#E2E8F0"},
  reserved: {label:"Reserved", bg:T.bL,      cl:T.blue,  bd:T.bB},
  active:   {label:"Active",   bg:T.gL,      cl:T.green, bd:T.gB},
  returned: {label:"Returned", bg:"#F1F5F9", cl:T.tSm,   bd:"#E2E8F0"},
  cancelled:{label:"Cancelled",bg:T.rL,      cl:T.red,   bd:T.rB},
};
const MONTH_ABBR = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const PIE_COLORS = [T.o,"#7C3AED","#10B981","#3B82F6","#F59E0B","#EF4444","#EC4899","#06B6D4"];
const DEFAULT_SETTINGS = {
  bizName:"Fabb.booking", phone:"", whatsapp:"", email:"",
  address:"", city:"Palakkad", state:"Kerala", pincode:"",
  gst:"", penaltyRate:50, depositPct:20, taxRate:0,
  invoicePrefix:"INV", quotePrefix:"QUO",
  contractText:"1. Items must be returned in clean condition.\n2. Damage to items will be charged separately.\n3. Security deposit will be refunded on return of items in good condition.\n4. Late returns will attract a penalty of ₹50 per day per item.",
  staff:["Seema","Ravi","Mohan"], upiId:"",
  ga4Id:"", zapierWebhook:"", mailchimpApiKey:"", metaPixelId:"",
  resendApiKey:"", notificationEmail:"",
  notifyBookingConfirmed:true, notifyReminder24h:true, notifyReturnDue:true, notifyOverdue:true,
};

/* ─── UTILITIES ──────────────────────────────────────────────── */
const today = () => new Date().toISOString().slice(0,10);
const ddays = (a,b) => Math.max(1,Math.round((new Date(b)-new Date(a))/86400000));
const p2 = n => String(n).padStart(2,"0");
const fmt = n => `₹${Number(n||0).toLocaleString("en-IN")}`;
const overdueDays = (end) => {
  const t = new Date().setHours(0,0,0,0);
  const e = new Date(end).setHours(0,0,0,0);
  return Math.max(0, Math.round((t-e)/86400000));
};
const genId = () => Math.random().toString(36).slice(2,10);

/* ─── DATA NORMALIZERS (DB → App format) ─────────────────────── */
const normItem = (i) => ({
  id: i.id, name: i.name, cat: i.category || "Other",
  qty: i.qty, avail: i.available, daily: Number(i.daily_rate),
  deposit: Number(i.deposit), sku: i.sku || "", desc: i.description || "",
  sizes: i.sizes || "", altNotes: i.alt_notes || "",
  barcode: i.barcode || "", minDays: i.min_rental_days || 1,
  status: i.status, customFields: i.custom_field_values || {},
});
const normCust = (c) => ({
  id: c.id, name: c.name, phone: c.phone, phone2: c.phone2 || "",
  phone2type: c.phone2_type || "WhatsApp", phone3: c.phone3 || "",
  phone3type: c.phone3_type || "Email", email: c.email || "",
  company: c.company || "", address: c.address || "",
  city: c.city || "Palakkad", state: c.state || "Kerala", pincode: c.pincode || "",
  idType: c.id_type || "", idNum: c.id_number || "",
  idExpiry: c.id_expiry || "", idPhoto: c.id_photo_url || "",
  notes: c.notes || "", tags: c.tags || [],
  joined: c.created_at?.slice(0,10) || today(),
  customFields: c.custom_field_values || {},
});
const normOrder = (o, lines=[]) => ({
  id: o.id, num: o.order_number, custId: o.customer_id,
  custName: o.customer_name || "", custPhone: o.customer_phone || "",
  custPhone2: o.customer_phone2 || "", custPhone2type: o.customer_phone2_type || "",
  custCity: o.customer_city || "", custIdType: o.customer_id_type || "",
  custIdNum: o.customer_id_number || "", custIdPhoto: o.customer_id_photo || "",
  start: o.start_date, end: o.end_date, status: o.status, type: o.type || "order",
  lines: lines.map(l=>({
    iid: l.item_id, name: l.item_name, qty: l.qty,
    daily: Number(l.daily_rate), days: l.days, subtotal: Number(l.subtotal),
    altNote: l.alt_note || "", lineId: l.id,
  })),
  discount: Number(o.discount) || 0, discountType: o.discount_type || "flat",
  penalty: Number(o.penalty) || 0, penaltyPaid: o.penalty_paid || false,
  dep: Number(o.deposit) || 0, depMethod: o.deposit_method || "",
  depPaid: o.deposit_paid || false, depRef: o.deposit_ref || "",
  subtotal: Number(o.subtotal) || 0, total: Number(o.total) || 0,
  paid: Number(o.paid_amount) || 0, notes: o.notes || "",
  source: o.source || "manual", customFields: o.custom_field_values || {},
  createdAt: o.created_at?.slice(0,10) || today(),
});
const normWash = (w) => ({
  id: w.id, oid: w.order_id, iid: w.item_id,
  name: w.item_name, cust: w.customer_name || "",
  returned: w.returned_date, stage: w.stage,
  staff: w.staff || "", notes: w.notes || "",
});
const normSettings = (s) => !s ? DEFAULT_SETTINGS : ({
  bizName: s.biz_name || "Fabb.booking", phone: s.phone || "",
  whatsapp: s.whatsapp || "", email: s.email || "",
  address: s.address || "", city: s.city || "Palakkad",
  state: s.state || "Kerala", pincode: s.pincode || "",
  gst: s.gst || "", penaltyRate: s.penalty_rate || 50,
  depositPct: s.deposit_pct || 20, taxRate: s.tax_rate || 0,
  invoicePrefix: s.invoice_prefix || "INV", quotePrefix: s.quote_prefix || "QUO",
  contractText: s.contract_text || DEFAULT_SETTINGS.contractText,
  staff: s.staff_names || ["Seema","Ravi","Mohan"], upiId: s.upi_id || "",
  ga4Id: s.ga4_id || "", zapierWebhook: s.zapier_webhook || "",
  mailchimpApiKey: s.mailchimp_api_key || "", metaPixelId: s.meta_pixel_id || "",
  resendApiKey: s.resend_api_key || "", notificationEmail: s.notification_email || "",
  notifyBookingConfirmed: s.notify_booking_confirmed !== false,
  notifyReminder24h: s.notify_reminder_24h !== false,
  notifyReturnDue: s.notify_return_due !== false,
  notifyOverdue: s.notify_overdue !== false,
  _id: s.id,
});

/* ─── DENORMALIZERS (App format → DB) ─────────────────────────── */
const denormItem = (i) => ({
  name: i.name, category: i.cat, sku: i.sku || null,
  qty: +i.qty, available: +i.avail, daily_rate: +i.daily,
  deposit: +i.deposit, description: i.desc || null,
  sizes: i.sizes || null, alt_notes: i.altNotes || null,
  barcode: i.barcode || null, min_rental_days: +i.minDays || 1,
  status: i.status,
});
const denormCust = (c) => ({
  name: c.name, phone: c.phone, phone2: c.phone2 || null,
  phone2_type: c.phone2type || "WhatsApp", phone3: c.phone3 || null,
  phone3_type: c.phone3type || "Email", email: c.email || null,
  company: c.company || null, address: c.address || null,
  city: c.city || null, state: c.state || null, pincode: c.pincode || null,
  id_type: c.idType || null, id_number: c.idNum || null,
  id_expiry: c.idExpiry || null, id_photo_url: c.idPhoto || null,
  notes: c.notes || null, tags: c.tags || [],
});
const denormOrder = (o, customerId) => ({
  order_number: o.num, type: o.type || "order", customer_id: customerId || o.custId,
  start_date: o.start, end_date: o.end, status: o.status,
  subtotal: +o.subtotal, discount: +o.discount || 0,
  discount_type: o.discountType || "flat",
  penalty: +o.penalty || 0, penalty_paid: o.penaltyPaid || false,
  total: +o.total, paid_amount: +o.paid || 0,
  deposit: +o.dep || 0, deposit_method: o.depMethod || null,
  deposit_paid: o.depPaid || false, deposit_ref: o.depRef || null,
  notes: o.notes || null, source: o.source || "manual",
  custom_field_values: o.customFields || {},
});
const denormLine = (l, orderId) => ({
  order_id: orderId, item_id: l.iid, item_name: l.name,
  qty: +l.qty, days: +l.days, daily_rate: +l.daily, subtotal: +l.subtotal,
  alt_note: l.altNote || null,
});

/* ─── ATOMS / UI COMPONENTS ─────────────────────────────────── */
const INP = {width:"100%",padding:"8px 11px",border:`1px solid ${T.bdr}`,borderRadius:6,fontSize:13,color:T.text,fontFamily:"inherit",outline:"none",background:"#fff",boxSizing:"border-box"};

function FLabel({text, required}) {
  return <label style={{display:"block",fontSize:12,fontWeight:600,color:T.tMd,marginBottom:5}}>{text}{required&&<span style={{color:T.red,marginLeft:2}}>*</span>}</label>;
}
function FInp({label,required,tip,...p}) {
  const [f,setF]=useState(false);
  return (
    <div style={{marginBottom:14}}>
      {label&&<FLabel text={label} required={required}/>}
      {tip&&<p style={{fontSize:11,color:T.tXs,margin:"-3px 0 5px"}}>{tip}</p>}
      <input {...p} style={{...INP,borderColor:f?T.o:T.bdr,...p.style}} onFocus={()=>setF(true)} onBlur={()=>setF(false)}/>
    </div>
  );
}
function FSel({label,required,children,...p}) {
  const [f,setF]=useState(false);
  return (
    <div style={{marginBottom:14}}>
      {label&&<FLabel text={label} required={required}/>}
      <select {...p} style={{...INP,cursor:"pointer",borderColor:f?T.o:T.bdr,...p.style}} onFocus={()=>setF(true)} onBlur={()=>setF(false)}>{children}</select>
    </div>
  );
}
function FTxt({label,...p}) {
  const [f,setF]=useState(false);
  return (
    <div style={{marginBottom:14}}>
      {label&&<FLabel text={label}/>}
      <textarea {...p} style={{...INP,minHeight:64,resize:"vertical",borderColor:f?T.o:T.bdr,...p.style}} onFocus={()=>setF(true)} onBlur={()=>setF(false)}/>
    </div>
  );
}
function Btn({children,variant="primary",sm,full,...p}) {
  const V={primary:{bg:T.o,cl:"#fff",bd:"none",hov:T.oH},secondary:{bg:"#fff",cl:T.tMd,bd:`1px solid ${T.bdr}`,hov:"#F9FAFB"},danger:{bg:T.red,cl:"#fff",bd:"none",hov:"#B91C1C"},success:{bg:T.green,cl:"#fff",bd:"none",hov:"#047857"},ghost:{bg:"transparent",cl:T.tMd,bd:`1px solid ${T.bdr}`,hov:"#F9FAFB"},green:{bg:T.green,cl:"#fff",bd:"none",hov:"#047857"},wa:{bg:"#25D366",cl:"#fff",bd:"none",hov:"#1fad54"},blue:{bg:T.blue,cl:"#fff",bd:"none",hov:"#1e40af"}};
  const s=V[variant]||V.primary;
  return <button {...p} style={{background:s.bg,color:s.cl,border:s.bd,padding:sm?"5px 10px":"8px 16px",fontSize:sm?11:13,fontWeight:600,borderRadius:6,cursor:"pointer",fontFamily:"inherit",width:full?"100%":undefined,...p.style}} onMouseEnter={e=>e.currentTarget.style.background=s.hov} onMouseLeave={e=>e.currentTarget.style.background=s.bg}>{children}</button>;
}
function Card({children,padding,style}) {
  return <div style={{background:T.white,border:`1px solid ${T.bdr}`,borderRadius:8,padding:padding!==undefined?padding:20,boxShadow:"0 1px 3px rgba(0,0,0,0.06)",...style}}>{children}</div>;
}
function StatusBadge({status}) {
  const m=STATUS_META[status]||STATUS_META.concept;
  return <span style={{background:m.bg,color:m.cl,border:`1px solid ${m.bd}`,padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:600}}>{m.label}</span>;
}
function WBadge({stage}) {
  return <span style={{background:WASH_BG[stage]||"#f1f5f9",color:WASH_COLOR[stage]||T.tSm,padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:600}}>{stage}</span>;
}
function Badge({label,color}) {
  const M={orange:{bg:T.oL,cl:T.o},green:{bg:T.gL,cl:T.green},blue:{bg:T.bL,cl:T.blue},gray:{bg:"#F1F5F9",cl:T.tSm},red:{bg:T.rL,cl:T.red},pink:{bg:T.pkL,cl:T.pink},purple:{bg:T.pL,cl:T.pur},teal:{bg:T.tL,cl:T.teal}};
  const s=M[color||"gray"];
  return <span style={{background:s.bg,color:s.cl,padding:"2px 8px",borderRadius:16,fontSize:11,fontWeight:600}}>{label}</span>;
}
function Toggle({checked,onChange}) {
  return <div onClick={()=>onChange(!checked)} style={{width:40,height:22,background:checked?T.o:T.bdr,borderRadius:11,position:"relative",cursor:"pointer",flexShrink:0,transition:"background 0.2s"}}><div style={{width:16,height:16,background:"#fff",borderRadius:"50%",position:"absolute",top:3,left:checked?20:3,transition:"left 0.2s",boxShadow:"0 1px 3px rgba(0,0,0,0.2)"}}/></div>;
}
function Modal({title,subtitle,onClose,children,footer,width}) {
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:1000,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"28px 16px",backdropFilter:"blur(2px)"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:10,width:"100%",maxWidth:width||600,maxHeight:"93vh",boxShadow:"0 20px 60px rgba(0,0,0,0.2)",display:"flex",flexDirection:"column"}}>
        <div style={{padding:"16px 22px",borderBottom:`1px solid ${T.bdr}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div><h3 style={{fontSize:16,fontWeight:700,color:T.text,margin:0}}>{title}</h3>{subtitle&&<p style={{fontSize:12,color:T.tSm,margin:"2px 0 0"}}>{subtitle}</p>}</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:T.tSm,lineHeight:1}}>×</button>
        </div>
        <div style={{padding:22,overflowY:"auto",flex:1}}>{children}</div>
        {footer&&<div style={{padding:"12px 22px",borderTop:`1px solid ${T.bdr}`,display:"flex",justifyContent:"flex-end",gap:8,flexShrink:0}}>{footer}</div>}
      </div>
    </div>
  );
}
function TabBar({tabs,active,onChange}) {
  return (
    <div style={{display:"flex",gap:1,borderBottom:`2px solid ${T.bdr}`,marginBottom:18}}>
      {tabs.map(t=>(
        <button key={t.id} onClick={()=>onChange(t.id)} style={{padding:"9px 16px",fontSize:13,fontWeight:600,border:"none",background:"transparent",cursor:"pointer",color:active===t.id?T.o:T.tSm,borderBottom:active===t.id?`2px solid ${T.o}`:"2px solid transparent",marginBottom:-2}}>
          {t.label}{t.count!==undefined&&<span style={{marginLeft:5,background:active===t.id?T.oL:T.bg,color:active===t.id?T.o:T.tSm,padding:"1px 6px",borderRadius:10,fontSize:11,fontWeight:700}}>{t.count}</span>}
        </button>
      ))}
    </div>
  );
}
function PageHeader({title,sub,actions}) {
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
      <div><h1 style={{fontSize:22,fontWeight:700,color:T.text,margin:0}}>{title}</h1>{sub&&<p style={{fontSize:13,color:T.tSm,margin:"4px 0 0"}}>{sub}</p>}</div>
      {actions&&<div style={{display:"flex",gap:8,alignItems:"center"}}>{actions}</div>}
    </div>
  );
}
function SLabel({children,action}) {
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,paddingBottom:8,borderBottom:`1px solid ${T.bdr}`}}>
      <span style={{fontSize:11,fontWeight:700,color:T.tSm,textTransform:"uppercase",letterSpacing:"0.6px"}}>{children}</span>
      {action}
    </div>
  );
}
function KpiCard({label,value,icon,color,sub,onClick}) {
  return (
    <Card padding={18} style={{cursor:onClick?"pointer":"default"}} onClick={onClick}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div><p style={{fontSize:11,color:T.tXs,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px",margin:"0 0 8px"}}>{label}</p><p style={{fontSize:26,fontWeight:700,color:T.text,margin:0,lineHeight:1}}>{value}</p>{sub&&<p style={{fontSize:11,color:color||T.tSm,margin:"5px 0 0"}}>{sub}</p>}</div>
        <div style={{width:40,height:40,borderRadius:8,background:`${color||T.o}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{icon}</div>
      </div>
    </Card>
  );
}
function IDUpload({url,onChange}) {
  const ref=useRef();
  function handleFile(e) {
    const f=e.target.files[0]; if(!f) return;
    const r=new FileReader(); r.onload=ev=>onChange(ev.target.result); r.readAsDataURL(f);
  }
  return (
    <div style={{marginBottom:14}}>
      <FLabel text="ID Photo / Document Scan"/>
      {url
        ?<div style={{position:"relative",borderRadius:6,overflow:"hidden",border:`1px solid ${T.bdr}`,maxWidth:280}}>
          <img src={url} alt="ID" style={{width:"100%",maxHeight:150,objectFit:"cover",display:"block"}}/>
          <div style={{position:"absolute",top:6,right:6,display:"flex",gap:4}}>
            <button onClick={()=>ref.current.click()} style={{background:"rgba(0,0,0,0.6)",color:"#fff",border:"none",borderRadius:5,padding:"3px 8px",fontSize:10,cursor:"pointer"}}>Change</button>
            <button onClick={()=>onChange("")} style={{background:"rgba(220,38,38,0.8)",color:"#fff",border:"none",borderRadius:5,padding:"3px 8px",fontSize:10,cursor:"pointer"}}>Remove</button>
          </div>
        </div>
        :<div onClick={()=>ref.current.click()} style={{border:`2px dashed ${T.bdr2}`,borderRadius:6,padding:"20px 16px",textAlign:"center",cursor:"pointer",background:T.bg}} onMouseEnter={e=>{e.currentTarget.style.borderColor=T.o;e.currentTarget.style.background=T.oL;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.bdr2;e.currentTarget.style.background=T.bg;}}>
          <div style={{fontSize:26,marginBottom:6}}>📎</div>
          <p style={{fontSize:12,fontWeight:600,color:T.tMd,margin:0}}>Click to upload Aadhaar / ID</p>
          <p style={{fontSize:11,color:T.tSm,margin:"3px 0 0"}}>JPG, PNG or PDF</p>
        </div>}
      <input type="file" accept="image/*,.pdf" ref={ref} onChange={handleFile} style={{display:"none"}}/>
    </div>
  );
}
function WABtn({phone,message}) {
  const num=(phone||"").replace(/\D/g,"");
  const url=`https://wa.me/${num}${message?`?text=${encodeURIComponent(message)}`:""}`;
  return <a href={url} target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:5,background:"#25D366",color:"#fff",padding:"5px 11px",borderRadius:6,fontSize:12,fontWeight:600,textDecoration:"none"}}><span style={{fontSize:14}}>💬</span>WhatsApp</a>;
}
function DepPanel({form,setForm,subtotal}) {
  return (
    <div style={{background:"#F0FDF4",border:`1px solid ${T.gB}`,borderRadius:8,padding:16}}>
      <p style={{fontSize:12,fontWeight:700,color:"#166534",textTransform:"uppercase",letterSpacing:"0.5px",margin:"0 0 12px"}}>🔒 Security Deposit</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>
        <FInp label="Amount (₹)" type="number" value={form.dep||""} onChange={e=>setForm(p=>({...p,dep:+e.target.value}))}/>
        <FSel label="Method" value={form.depMethod||""} onChange={e=>setForm(p=>({...p,depMethod:e.target.value}))}>
          <option value="">— Select —</option>
          {DEP_METHODS.map(m=><option key={m}>{m}</option>)}
        </FSel>
        <FInp label="UPI / Receipt Ref." value={form.depRef||""} onChange={e=>setForm(p=>({...p,depRef:e.target.value}))} placeholder="e.g. UPI-8821930"/>
        <div style={{display:"flex",alignItems:"flex-end",paddingBottom:14}}>
          <label style={{display:"flex",alignItems:"center",gap:7,cursor:"pointer",fontSize:13,fontWeight:600,color:"#166534"}}>
            <input type="checkbox" checked={!!form.depPaid} onChange={e=>setForm(p=>({...p,depPaid:e.target.checked}))} style={{width:15,height:15,accentColor:T.green}}/>Collected
          </label>
        </div>
      </div>
      {subtotal>0&&(
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:2}}>
          <span style={{fontSize:11,color:"#166534",fontWeight:600,marginRight:2}}>Quick set:</span>
          {[10,15,20,25,30].map(pct=>{const amt=Math.round(subtotal*pct/100);const active=form.dep===amt;return(
            <button key={pct} onClick={()=>setForm(p=>({...p,dep:amt}))} style={{padding:"3px 9px",borderRadius:14,fontSize:11,fontWeight:600,cursor:"pointer",border:`1px solid ${active?T.green:T.gB}`,background:active?T.green:"#fff",color:active?"#fff":"#166534"}}>{pct}% · {fmt(amt)}</button>
          );})}
        </div>
      )}
    </div>
  );
}
function DiscountPenaltyPanel({form,setForm}) {
  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>
      <div style={{background:T.oL,border:`1px solid ${T.oB}`,borderRadius:8,padding:14}}>
        <p style={{fontSize:12,fontWeight:700,color:T.o,textTransform:"uppercase",letterSpacing:"0.5px",margin:"0 0 10px"}}>🎁 Discount / Offer</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 8px"}}>
          <FInp label="Amount" type="number" value={form.discount||""} onChange={e=>setForm(p=>({...p,discount:+e.target.value}))} placeholder="0"/>
          <FSel label="Type" value={form.discountType||"flat"} onChange={e=>setForm(p=>({...p,discountType:e.target.value}))}>
            <option value="flat">Flat ₹</option><option value="pct">Percent %</option>
          </FSel>
        </div>
      </div>
      <div style={{background:T.rL,border:`1px solid ${T.rB}`,borderRadius:8,padding:14}}>
        <p style={{fontSize:12,fontWeight:700,color:T.red,textTransform:"uppercase",letterSpacing:"0.5px",margin:"0 0 10px"}}>⏰ Late Return Penalty</p>
        <FInp label="Penalty Amount (₹)" type="number" value={form.penalty||""} onChange={e=>setForm(p=>({...p,penalty:+e.target.value}))} placeholder="0"/>
        <label style={{display:"flex",alignItems:"center",gap:7,cursor:"pointer",fontSize:12,fontWeight:600,color:T.red}}>
          <input type="checkbox" checked={!!form.penaltyPaid} onChange={e=>setForm(p=>({...p,penaltyPaid:e.target.checked}))} style={{width:14,height:14,accentColor:T.red}}/>Penalty collected
        </label>
      </div>
    </div>
  );
}
function TH({label}) { return <th style={{padding:"9px 14px",fontSize:11,fontWeight:700,color:T.tXs,textAlign:"left",textTransform:"uppercase",letterSpacing:"0.5px",borderBottom:`1px solid ${T.bdr}`,background:T.bg,whiteSpace:"nowrap"}}>{label}</th>; }
function TR({children,onClick}) {
  return <tr onClick={onClick} style={{borderBottom:`1px solid ${T.bdr}`,cursor:onClick?"pointer":"default",transition:"background 0.1s"}} onMouseEnter={e=>e.currentTarget.style.background="#FAFBFC"} onMouseLeave={e=>e.currentTarget.style.background="#fff"}>{children}</tr>;
}
function TD({children,style}) { return <td style={{padding:"12px 14px",fontSize:13,color:T.text,verticalAlign:"middle",...style}}>{children}</td>; }

/* ─── TOAST NOTIFICATION ─────────────────────────────────────── */
function Toast({msg,type,onClose}) {
  useEffect(()=>{const t=setTimeout(onClose,3000);return()=>clearTimeout(t);},[onClose]);
  const bg={success:T.green,error:T.red,info:T.blue}[type]||T.green;
  return <div style={{position:"fixed",bottom:24,right:24,background:bg,color:"#fff",padding:"11px 18px",borderRadius:8,fontSize:13,fontWeight:600,zIndex:2000,boxShadow:"0 4px 16px rgba(0,0,0,0.15)",display:"flex",gap:10,alignItems:"center",maxWidth:360}}>{msg}<button onClick={onClose} style={{background:"none",border:"none",color:"rgba(255,255,255,0.7)",cursor:"pointer",fontSize:16,lineHeight:1}}>×</button></div>;
}

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════════════════ */
function Dashboard({orders,items,custs,wash,settings,setPage,actLog}) {
  const active   = orders.filter(o=>o.status==="active").length;
  const reserved = orders.filter(o=>o.status==="reserved").length;
  const overdue  = orders.filter(o=>o.status==="active"&&o.end<today()).length;
  const revenue  = orders.filter(o=>["active","returned"].includes(o.status)).reduce((s,o)=>s+o.total,0);
  const deposits = orders.filter(o=>o.depPaid).reduce((s,o)=>s+(o.dep||0),0);
  const pendWash = wash.filter(w=>w.stage!=="In Stock").length;
  const pendDep  = orders.filter(o=>!o.depPaid&&!["cancelled","returned"].includes(o.status)).length;
  const overduePenalty = orders.filter(o=>o.status==="active"&&o.end<today()).reduce((s,o)=>s+overdueDays(o.end)*(settings.penaltyRate||50),0);

  const upcoming  = [...orders].filter(o=>o.status==="reserved"&&o.start>=today()).sort((a,b)=>a.start.localeCompare(b.start)).slice(0,5);
  const returning = [...orders].filter(o=>o.status==="active").sort((a,b)=>a.end.localeCompare(b.end)).slice(0,5);

  const REV_DATA = MONTH_ABBR.map((m,i)=>({m,v:orders.filter(o=>new Date(o.createdAt||"2025-01-01").getMonth()===i&&["active","returned"].includes(o.status)).reduce((s,o)=>s+o.total,0)||0}));

  return (
    <div>
      <div style={{marginBottom:22}}>
        <h1 style={{fontSize:22,fontWeight:700,color:T.text,margin:0}}>{settings.bizName}</h1>
        <p style={{fontSize:13,color:T.tSm,margin:"4px 0 0"}}>Welcome back — rental management dashboard · {settings.city}, {settings.state}</p>
      </div>

      {overdue>0&&(
        <div style={{background:T.rL,border:`1px solid ${T.rB}`,borderRadius:8,padding:"12px 16px",marginBottom:18,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:18}}>⚠️</span>
          <div>
            <p style={{fontWeight:700,color:T.red,margin:0,fontSize:13}}>{overdue} order{overdue>1?"s":""} overdue — total penalty: {fmt(overduePenalty)}</p>
            <p style={{color:T.red,fontSize:12,margin:0}}>Each overdue day = {fmt(settings.penaltyRate||50)} penalty per order.</p>
          </div>
          <Btn variant="danger" sm style={{marginLeft:"auto"}} onClick={()=>setPage("orders")}>View Orders</Btn>
        </div>
      )}

      {/* Quick Actions */}
      <div style={{display:"flex",gap:8,marginBottom:18}}>
        <Btn onClick={()=>setPage("orders")} variant="primary">+ New Order</Btn>
        <Btn onClick={()=>setPage("customers")} variant="secondary">+ Add Customer</Btn>
        <Btn onClick={()=>setPage("inventory")} variant="secondary">+ Add Item</Btn>
        <Btn onClick={()=>setPage("washing")} variant="ghost">🫧 Washing Queue ({pendWash})</Btn>
      </div>

      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:14,marginBottom:22}}>
        <KpiCard label="Active Orders"  value={active}               icon="📋" color={T.o}     sub={`${reserved} reserved`}        onClick={()=>setPage("orders")}/>
        <KpiCard label="Revenue"        value={fmt(revenue)}          icon="💰" color={T.green}  sub="All orders"/>
        <KpiCard label="Deposits Held"  value={fmt(deposits)}         icon="🔒" color={T.blue}   sub="Collected"/>
        <KpiCard label="Pending Wash"   value={pendWash}              icon="🫧" color={T.pur}    sub="Garments in queue"             onClick={()=>setPage("washing")}/>
        <KpiCard label="Dep. Pending"   value={pendDep}               icon="⏳" color={T.yel}   sub="Deposits due"/>
      </div>

      {/* Charts */}
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:16,marginBottom:20}}>
        <Card padding={20}>
          <p style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:16}}>Revenue — This Year (₹)</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={REV_DATA}>
              <defs><linearGradient id="rGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={T.o} stopOpacity={0.15}/><stop offset="95%" stopColor={T.o} stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke={T.bdr} vertical={false}/>
              <XAxis dataKey="m" tick={{fontSize:11,fill:T.tXs}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:11,fill:T.tXs}} axisLine={false} tickLine={false} tickFormatter={v=>`₹${v/1000}k`}/>
              <Tooltip formatter={v=>[fmt(v),"Revenue"]} contentStyle={{borderRadius:6,border:`1px solid ${T.bdr}`,fontSize:12}}/>
              <Area type="monotone" dataKey="v" stroke={T.o} strokeWidth={2.5} fill="url(#rGrad)"/>
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card padding={20}>
          <p style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:14}}>Order Status</p>
          {[{s:"active",l:"Active",c:T.green},{s:"reserved",l:"Reserved",c:T.blue},{s:"concept",l:"Quotes",c:T.tSm},{s:"returned",l:"Returned",c:T.tXs},{s:"cancelled",l:"Cancelled",c:T.red}].map(x=>{
            const cnt=orders.filter(o=>o.status===x.s).length;
            const pct=orders.length?Math.round(cnt/orders.length*100):0;
            return(
              <div key={x.s} style={{marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
                  <span style={{color:x.c,fontWeight:600}}>{x.l}</span><span style={{color:T.tSm}}>{cnt}</span>
                </div>
                <div style={{height:5,background:T.bdr,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:x.c,borderRadius:3}}/></div>
              </div>
            );
          })}
        </Card>
      </div>

      {/* Upcoming + Returning */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
        <Card padding={0}>
          <div style={{padding:"12px 18px",borderBottom:`1px solid ${T.bdr}`}}><p style={{fontSize:13,fontWeight:700,color:T.text,margin:0}}>📅 Upcoming Pickups</p></div>
          {upcoming.length===0?<div style={{padding:"24px 0",textAlign:"center",color:T.tSm,fontSize:12}}>No upcoming pickups</div>
          :upcoming.map(o=>(
            <div key={o.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 18px",borderBottom:`1px solid ${T.bdr}`}}>
              <div><p style={{fontWeight:600,fontSize:13,margin:0}}>{o.custName||"—"}</p><p style={{fontSize:11,color:T.tSm,margin:0}}>{o.num} · {o.lines.reduce((s,l)=>s+l.qty,0)} items</p></div>
              <div style={{textAlign:"right"}}><p style={{fontSize:12,fontWeight:700,color:T.o,margin:0}}>{o.start}</p><StatusBadge status={o.status}/></div>
            </div>
          ))}
        </Card>
        <Card padding={0}>
          <div style={{padding:"12px 18px",borderBottom:`1px solid ${T.bdr}`}}><p style={{fontSize:13,fontWeight:700,color:T.text,margin:0}}>🔄 Due for Return</p></div>
          {returning.length===0?<div style={{padding:"24px 0",textAlign:"center",color:T.tSm,fontSize:12}}>No active rentals</div>
          :returning.map(o=>{
            const late=o.end<today(); const od=overdueDays(o.end);
            return(
              <div key={o.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 18px",borderBottom:`1px solid ${T.bdr}`}}>
                <div><p style={{fontWeight:600,fontSize:13,margin:0}}>{o.custName||"—"}</p><p style={{fontSize:11,color:T.tSm,margin:0}}>{o.num} · {fmt(o.total)}</p></div>
                <div style={{textAlign:"right"}}><p style={{fontSize:12,fontWeight:700,color:late?T.red:T.text,margin:0}}>{o.end}</p>{late&&<Badge label={`${od}d overdue`} color="red"/>}</div>
              </div>
            );
          })}
        </Card>
      </div>

      {/* Wash queue + Activity */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <Card padding={0}>
          <div style={{padding:"12px 18px",borderBottom:`1px solid ${T.bdr}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <p style={{fontSize:13,fontWeight:700,color:T.text,margin:0}}>🫧 Washing Queue</p>
            <Btn sm variant="secondary" onClick={()=>setPage("washing")}>View all</Btn>
          </div>
          {wash.filter(w=>w.stage!=="In Stock").slice(0,5).map(w=>(
            <div key={w.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 18px",borderBottom:`1px solid ${T.bdr}`}}>
              <div><p style={{fontWeight:600,fontSize:13,margin:0}}>{w.name}</p><p style={{fontSize:11,color:T.tSm,margin:0}}>{w.cust} · {w.returned}</p></div>
              <div style={{display:"flex",alignItems:"center",gap:10}}><WBadge stage={w.stage}/><p style={{fontSize:12,color:T.tSm,margin:0}}>{w.staff||"—"}</p></div>
            </div>
          ))}
          {wash.filter(w=>w.stage!=="In Stock").length===0&&<div style={{padding:"24px 0",textAlign:"center",color:T.tSm,fontSize:12}}>All garments clean ✓</div>}
        </Card>
        <Card padding={0}>
          <div style={{padding:"12px 18px",borderBottom:`1px solid ${T.bdr}`}}><p style={{fontSize:13,fontWeight:700,color:T.text,margin:0}}>📊 Recent Activity</p></div>
          {actLog.length===0?<div style={{padding:"24px 0",textAlign:"center",color:T.tSm,fontSize:12}}>No recent activity</div>
          :actLog.slice(0,8).map((a,i)=>(
            <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 18px",borderBottom:`1px solid ${T.bdr}`}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:T.oL,color:T.o,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,flexShrink:0}}>{(a.profiles?.name||"?")[0]}</div>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontSize:12,fontWeight:600,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.description||a.action}</p>
                <p style={{fontSize:10,color:T.tXs,margin:"2px 0 0"}}>{a.created_at?.slice(0,16)?.replace("T"," ")||""}</p>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   INVENTORY
═══════════════════════════════════════════════════════════════ */
function Inventory({items,onAdd,onUpdate,onDelete,showToast,customFields}) {
  const [cat,setCat]=useState("All");
  const [q,setQ]=useState("");
  const [modal,setModal]=useState(null);
  const [delId,setDelId]=useState(null);
  const [form,setForm]=useState({});
  const [fTab,setFTab]=useState("details");
  const [saving,setSaving]=useState(false);
  const [qrModal,setQrModal]=useState(null);
  const [qrUrl,setQrUrl]=useState("");

  const rows=items.filter(i=>(cat==="All"||i.cat===cat)&&i.name.toLowerCase().includes(q.toLowerCase()));

  function openNew() { setForm({name:"",cat:"Sherwani",qty:1,avail:1,daily:0,deposit:0,sku:"",desc:"",sizes:"",altNotes:"",barcode:"",minDays:1,status:"active",customFields:{}}); setFTab("details"); setModal("new"); }
  function openEdit(item) { setForm({...item}); setFTab("details"); setModal("edit"); }

  async function save() {
    if(!form.name){showToast("Item name is required","error");return;}
    setSaving(true);
    try {
      const data={name:form.name,cat:form.cat||"Sherwani",qty:+form.qty||1,avail:+form.avail||1,daily:+form.daily||0,deposit:+form.deposit||0,sku:form.sku||"",desc:form.desc||"",sizes:form.sizes||"",altNotes:form.altNotes||"",barcode:form.barcode||"",minDays:+form.minDays||1,status:form.status||"active",customFields:form.customFields||{}};
      if(modal==="new") { await onAdd(data); showToast("Item added","success"); }
      else { await onUpdate(form.id,data); showToast("Item saved","success"); }
      setModal(null);
    } catch(e){ showToast("Error: "+e.message,"error"); } finally{ setSaving(false); }
  }

  async function doDelete() {
    try{ await onDelete(delId); showToast("Item deleted","success"); setDelId(null); }
    catch(e){ showToast("Error: "+e.message,"error"); }
  }

  async function showQR(item) {
    setQrModal(item); setQrUrl("");
    const url=`/api/items/qr/${item.id}`;
    setQrUrl(url);
  }

  const f=(k,v)=>setForm(p=>({...p,[k]:v}));
  const allCats=["All",...CATS.filter(c=>items.some(i=>i.cat===c))];
  const orderCF=(customFields||[]).filter(cf=>cf.entity==="item"&&cf.active);

  return (
    <div>
      <PageHeader title="Inventory" sub={`${items.length} garments · ${items.reduce((s,i)=>s+(i.avail||0),0)} available`}
        actions={<Btn onClick={openNew}>+ Add Item</Btn>}/>
      <Card padding={14} style={{marginBottom:16}}>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="🔍 Search items…" style={{...INP,width:220,padding:"7px 11px"}}/>
          {allCats.map(c=>(
            <button key={c} onClick={()=>setCat(c)} style={{padding:"5px 12px",borderRadius:20,fontSize:12,fontWeight:600,cursor:"pointer",border:`1px solid ${cat===c?T.o:T.bdr}`,background:cat===c?T.o:"transparent",color:cat===c?"#fff":T.tMd}}>{c}</button>
          ))}
        </div>
      </Card>
      <Card padding={0}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH label="Item"/><TH label="Category"/><TH label="SKU"/><TH label="Daily"/><TH label="Deposit"/><TH label="Stock"/><TH label="Status"/><TH label=""/></tr></thead>
          <tbody>
            {rows.map(item=>{
              const util=Math.round(((item.qty-(item.avail||0))/Math.max(item.qty,1))*100)||0;
              return(
                <TR key={item.id} onClick={()=>openEdit(item)}>
                  <TD><div><p style={{fontWeight:600,fontSize:13,margin:0}}>{item.name}</p><p style={{fontSize:11,color:T.tSm,margin:0}}>{item.sizes?`Sizes: ${item.sizes}`:item.desc}</p>{item.altNotes&&<p style={{fontSize:10,color:T.o,margin:0}}>✂️ {item.altNotes}</p>}{item.barcode&&<p style={{fontSize:10,color:T.teal,margin:0}}>📊 {item.barcode}</p>}</div></TD>
                  <TD><Badge label={item.cat} color="orange"/></TD>
                  <TD><span style={{fontSize:12,color:T.tSm,fontFamily:"monospace"}}>{item.sku||"—"}</span></TD>
                  <TD><span style={{fontWeight:600}}>{fmt(item.daily)}</span>{item.minDays>1&&<p style={{fontSize:10,color:T.tSm,margin:0}}>Min {item.minDays}d</p>}</TD>
                  <TD><span style={{color:T.tMd}}>{fmt(item.deposit)}</span></TD>
                  <TD>
                    <p style={{margin:"0 0 4px",fontSize:12,fontWeight:700,color:(item.avail||0)===0?T.red:T.text}}>{item.avail||0}/{item.qty}</p>
                    <div style={{height:4,background:T.bdr,borderRadius:2,overflow:"hidden",width:80}}><div style={{height:"100%",width:`${util}%`,background:util>80?T.red:util>50?T.yel:T.green,borderRadius:2}}/></div>
                  </TD>
                  <TD><Badge label={item.status==="active"?"Active":"Archived"} color={item.status==="active"?"green":"gray"}/></TD>
                  <TD>
                    <div style={{display:"flex",gap:5}} onClick={e=>e.stopPropagation()}>
                      <Btn sm variant="ghost" onClick={()=>showQR(item)} title="Show QR Code">📱</Btn>
                      <Btn sm variant="secondary" onClick={()=>openEdit(item)}>Edit</Btn>
                      <Btn sm variant="danger" onClick={()=>setDelId(item.id)}>Del</Btn>
                    </div>
                  </TD>
                </TR>
              );
            })}
          </tbody>
        </table>
        {rows.length===0&&<div style={{padding:"36px 0",textAlign:"center",color:T.tSm}}>No items found</div>}
      </Card>

      {/* QR Code Modal */}
      {qrModal&&(
        <Modal title={`QR Code — ${qrModal.name}`} subtitle={`SKU: ${qrModal.sku||"—"}`} onClose={()=>{setQrModal(null);setQrUrl("");}}
          footer={<><Btn variant="ghost" onClick={()=>{setQrModal(null);setQrUrl("");}}>Close</Btn><Btn onClick={()=>window.print()}>🖨️ Print Label</Btn></>}>
          <div style={{textAlign:"center",padding:20}}>
            {qrUrl&&<img src={qrUrl} alt="QR Code" style={{width:200,height:200,border:`1px solid ${T.bdr}`,borderRadius:8,margin:"0 auto 16px",display:"block"}}/>}
            <div style={{background:T.bg,borderRadius:8,padding:16,maxWidth:300,margin:"0 auto"}}>
              <p style={{fontSize:18,fontWeight:700,margin:"0 0 4px"}}>{qrModal.name}</p>
              {qrModal.sku&&<p style={{fontSize:14,color:T.tSm,margin:"0 0 2px",fontFamily:"monospace"}}>{qrModal.sku}</p>}
              <p style={{fontSize:13,color:T.tMd,margin:0}}>{qrModal.cat} · {fmt(qrModal.daily)}/day</p>
            </div>
            <p style={{fontSize:11,color:T.tXs,marginTop:12}}>Scan this code to identify the item during check-in/checkout</p>
          </div>
        </Modal>
      )}

      {/* Add/Edit Modal */}
      {modal&&(
        <Modal title={modal==="new"?"New Item":"Edit Item"} onClose={()=>setModal(null)} width={700}
          footer={<><Btn variant="ghost" onClick={()=>setModal(null)}>Cancel</Btn><Btn onClick={save} style={{opacity:saving?0.7:1}}>{saving?"Saving…":modal==="new"?"Add Item":"Save"}</Btn></>}>
          <TabBar tabs={[{id:"details",label:"Details"},{id:"pricing",label:"Pricing & Stock"},{id:"alteration",label:"Alteration"},{id:"custom",label:"Custom Fields"}]} active={fTab} onChange={setFTab}/>

          {fTab==="details"&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px"}}>
              <div style={{gridColumn:"1/-1"}}><FInp label="Item Name" required value={form.name||""} onChange={e=>f("name",e.target.value)} placeholder="e.g. Sherwani - Royal Blue"/></div>
              <FSel label="Category" value={form.cat||"Sherwani"} onChange={e=>f("cat",e.target.value)}>{CATS.map(c=><option key={c}>{c}</option>)}</FSel>
              <FInp label="SKU / Code" value={form.sku||""} onChange={e=>f("sku",e.target.value)} placeholder="e.g. SH-001"/>
              <FInp label="Barcode" value={form.barcode||""} onChange={e=>f("barcode",e.target.value)} placeholder="Scan or type barcode"/>
              <div style={{gridColumn:"1/-1"}}><FInp label="Available Sizes" value={form.sizes||""} onChange={e=>f("sizes",e.target.value)} placeholder="e.g. S, M, L, XL, XXL"/></div>
              <div style={{gridColumn:"1/-1"}}><FTxt label="Description" value={form.desc||""} onChange={e=>f("desc",e.target.value)}/></div>
              <FSel label="Status" value={form.status||"active"} onChange={e=>f("status",e.target.value)}><option value="active">Active</option><option value="archived">Archived</option></FSel>
            </div>
          )}
          {fTab==="pricing"&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px"}}>
              <FInp label="Daily Rate (₹)" type="number" value={form.daily||""} onChange={e=>f("daily",e.target.value)}/>
              <FInp label="Security Deposit (₹)" type="number" value={form.deposit||""} onChange={e=>f("deposit",e.target.value)}/>
              <FInp label="Total Quantity" type="number" value={form.qty||""} onChange={e=>f("qty",e.target.value)}/>
              <FInp label="Currently Available" type="number" value={form.avail||""} onChange={e=>f("avail",e.target.value)}/>
              <FInp label="Minimum Rental Days" type="number" value={form.minDays||1} onChange={e=>f("minDays",e.target.value)} tip="Customer must rent for at least this many days"/>
              <div style={{gridColumn:"1/-1",background:T.bg,borderRadius:8,padding:14}}>
                <p style={{fontSize:12,fontWeight:600,color:T.tMd,marginBottom:8}}>Pricing preview</p>
                <div style={{display:"flex",gap:24}}>
                  {[["1 day",form.daily||0],["3 days",(+form.daily||0)*3],["7 days",(+form.daily||0)*7]].map(([l,v])=>(
                    <div key={l}><p style={{fontSize:11,color:T.tSm,margin:0}}>{l}</p><p style={{fontSize:18,fontWeight:700,color:T.o,margin:0}}>{fmt(+v||0)}</p></div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {fTab==="alteration"&&(
            <div>
              <p style={{fontSize:12,color:T.tSm,marginBottom:14}}>Add permanent alteration notes for this item.</p>
              <FTxt label="Alteration / Repair Notes" value={form.altNotes||""} onChange={e=>f("altNotes",e.target.value)} placeholder="e.g. Sleeve shortened, Embroidery patch…" style={{minHeight:100}}/>
            </div>
          )}
          {fTab==="custom"&&(
            <div>
              {orderCF.length===0?<p style={{color:T.tSm,fontSize:13}}>No custom fields defined for items. Add them in Settings → Custom Fields.</p>
              :orderCF.map(cf=>(
                <div key={cf.id} style={{marginBottom:14}}>
                  <FLabel text={cf.label} required={cf.required}/>
                  {cf.field_type==="select"?<select value={form.customFields?.[cf.id]||""} onChange={e=>f("customFields",{...(form.customFields||{}),[cf.id]:e.target.value})} style={INP}><option value="">— Select —</option>{(cf.options||[]).map(o=><option key={o}>{o}</option>)}</select>
                  :cf.field_type==="checkbox"?<label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}><input type="checkbox" checked={!!form.customFields?.[cf.id]} onChange={e=>f("customFields",{...(form.customFields||{}),[cf.id]:e.target.checked})}/>{cf.label}</label>
                  :cf.field_type==="textarea"?<textarea value={form.customFields?.[cf.id]||""} onChange={e=>f("customFields",{...(form.customFields||{}),[cf.id]:e.target.value})} style={{...INP,minHeight:64,resize:"vertical"}}/>
                  :<input type={cf.field_type==="number"?"number":cf.field_type==="date"?"date":"text"} value={form.customFields?.[cf.id]||""} onChange={e=>f("customFields",{...(form.customFields||{}),[cf.id]:e.target.value})} style={INP}/>}
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {delId&&(
        <Modal title="Delete item?" onClose={()=>setDelId(null)} footer={<><Btn variant="ghost" onClick={()=>setDelId(null)}>Cancel</Btn><Btn variant="danger" onClick={doDelete}>Delete</Btn></>}>
          <p style={{color:T.tMd}}>This will permanently delete this item. Orders referencing it will be unaffected.</p>
        </Modal>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ORDERS
═══════════════════════════════════════════════════════════════ */
function Orders({orders,onAddOrder,onUpdateOrder,onDeleteOrder,items,custs,onAddCust,onAddWash,settings,showToast,pricingRules,customFields}) {
  const [tab,setTab]=useState("all");
  const [q,setQ]=useState("");
  const [modal,setModal]=useState(null);
  const [detail,setDetail]=useState(null);
  const [oTab,setOTab]=useState("details");
  const [custMode,setCustMode]=useState("existing");
  const [saving,setSaving]=useState(false);
  const [emailModal,setEmailModal]=useState(null);
  const [emailSending,setEmailSending]=useState(false);
  const [scanInput,setScanInput]=useState("");

  const blankOrder=()=>({
    type:"order",custId:custs[0]?.id||"",
    nc:{name:"",phone:"",phone2:"",phone2type:"WhatsApp",phone3:"",phone3type:"Email",email:"",company:"",address:"",city:"",state:"",idType:"",idNum:"",idExpiry:"",idPhoto:"",notes:""},
    start:"",end:"",status:"reserved",lines:[],
    discount:0,discountType:"flat",penalty:0,penaltyPaid:false,
    dep:0,depMethod:"",depPaid:false,depRef:"",
    subtotal:0,total:0,paid:0,notes:"",customFields:{},
  });
  const [form,setForm]=useState(blankOrder());

  const STATUS_TABS=[
    {id:"all",label:"All",count:orders.length},
    {id:"concept",label:"Quotes",count:orders.filter(o=>o.status==="concept").length},
    {id:"reserved",label:"Reserved",count:orders.filter(o=>o.status==="reserved").length},
    {id:"active",label:"Active",count:orders.filter(o=>o.status==="active").length},
    {id:"returned",label:"Returned",count:orders.filter(o=>o.status==="returned").length},
    {id:"cancelled",label:"Cancelled",count:orders.filter(o=>o.status==="cancelled").length},
  ];

  const rows=orders.filter(o=>(tab==="all"||o.status===tab)&&
    (o.num?.toLowerCase().includes(q.toLowerCase())||o.custName?.toLowerCase().includes(q.toLowerCase())));

  function calcTotals(lines,discount,discountType,penalty) {
    const sub=lines.reduce((s,l)=>s+l.subtotal,0);
    let disc=0; if(discount>0) disc=discountType==="pct"?Math.round(sub*discount/100):discount;
    return {subtotal:sub,total:Math.max(0,sub-disc+(+penalty||0))};
  }

  function applyRules(item,days) {
    if(!pricingRules||!item) return {rate:item?.daily||0,ruleName:null};
    // Simple rule application
    const activeRules=(pricingRules||[]).filter(r=>r.active);
    for(const r of activeRules) {
      if(r.type==="duration_discount") {
        const meetsItem=!r.item_id||r.item_id===item.id;
        const meetsCat=!r.category||r.category===item.cat;
        if((meetsItem||meetsCat)&&(!r.min_days||days>=r.min_days)&&(!r.max_days||days<=r.max_days)) {
          if(r.discount_pct) return {rate:item.daily*(1-r.discount_pct/100),ruleName:r.name,discountPct:r.discount_pct};
        }
      }
    }
    return {rate:item?.daily||0,ruleName:null,discountPct:0};
  }

  function toggleItem(item) {
    setForm(p=>{
      const ex=p.lines.find(l=>l.iid===item.id);
      let newLines;
      if(ex) { newLines=p.lines.filter(l=>l.iid!==item.id); }
      else {
        const d=p.start&&p.end?ddays(p.start,p.end):1;
        const {rate,ruleName}=applyRules(item,d);
        newLines=[...p.lines,{iid:item.id,name:item.name,qty:1,daily:rate,days:d,subtotal:rate*d,altNote:item.altNotes||"",ruleApplied:ruleName}];
      }
      return {...p,lines:newLines,...calcTotals(newLines,p.discount,p.discountType,p.penalty)};
    });
  }

  function updateLine(iid,key,val) {
    setForm(p=>{
      const newLines=p.lines.map(l=>{
        if(l.iid!==iid) return l;
        const u={...l,[key]:+val}; u.subtotal=u.daily*u.qty*u.days; return u;
      });
      return {...p,lines:newLines,...calcTotals(newLines,p.discount,p.discountType,p.penalty)};
    });
  }

  function handleScan(e) {
    if(e.key==="Enter") {
      const barcode=scanInput.trim();
      if(!barcode) return;
      const item=items.find(i=>i.barcode===barcode||i.sku===barcode);
      if(item) { toggleItem(item); setScanInput(""); showToast(`Added: ${item.name}`,"success"); }
      else { showToast("Item not found for: "+barcode,"error"); }
    }
  }

  async function saveOrder() {
    if(form.lines.length===0){showToast("Add at least one item","error");return;}
    if(!form.start||!form.end){showToast("Select start and end dates","error");return;}
    setSaving(true);
    try {
      let custId=form.custId;
      if(custMode==="new") {
        if(!form.nc.name||!form.nc.phone){showToast("Customer name and phone required","error");setSaving(false);return;}
        const nc=await onAddCust({name:form.nc.name,phone:form.nc.phone,phone2:form.nc.phone2,phone2type:form.nc.phone2type,phone3:form.nc.phone3,phone3type:form.nc.phone3type,email:form.nc.email,company:form.nc.company,address:form.nc.address,city:form.nc.city||"Palakkad",state:form.nc.state||"Kerala",idType:form.nc.idType,idNum:form.nc.idNum,idExpiry:form.nc.idExpiry,idPhoto:form.nc.idPhoto,notes:form.nc.notes});
        custId=nc.id;
      }
      const prefix=form.type==="quote"?(settings.quotePrefix||"QUO"):(settings.invoicePrefix||"INV");
      const orderNum=`${prefix}-${Date.now().toString().slice(-6)}`;
      const newOrder=await onAddOrder({...form,num:orderNum,custId},form.lines);
      showToast("Order created","success");
      setModal(null); setForm(blankOrder()); setCustMode("existing");
    } catch(e){ showToast("Error: "+e.message,"error"); } finally{ setSaving(false); }
  }

  async function markReturned(order) {
    await onUpdateOrder(order.id,{status:"returned"});
    for(const l of order.lines) {
      await onAddWash({oid:order.id,iid:l.iid,name:l.name,cust:order.custName||"",returned:today(),stage:"Pending Wash",staff:"",notes:l.altNote||""});
    }
    showToast("Order marked returned, added to wash queue","success");
    if(detail?.id===order.id) setDetail(x=>({...x,status:"returned"}));
  }

  async function updateStatus(id,status) {
    await onUpdateOrder(id,{status});
    if(detail?.id===id) setDetail(x=>({...x,status}));
  }

  async function sendEmail(template) {
    if(!emailModal) return;
    const {order}=emailModal;
    const cust=custs.find(c=>c.id===order.custId);
    const email=cust?.email;
    if(!email){showToast("Customer has no email address","error");return;}
    setEmailSending(true);
    try {
      const res=await fetch("/api/email/send",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        to:email,template,orderId:order.id,customerId:order.custId,
        data:{customerName:cust.name,orderNumber:order.num,startDate:order.start,endDate:order.end,returnDate:order.end,
          items:order.lines.map(l=>l.name).join(", "),total:fmt(order.total).replace("₹",""),
          deposit:fmt(order.dep||0).replace("₹",""),businessName:settings.bizName,businessPhone:settings.phone,
          businessAddress:settings.address,overdueDays:String(overdueDays(order.end)),
          penalty:fmt(order.penalty||0).replace("₹",""),paymentMethod:order.depMethod,amount:fmt(order.paid||0).replace("₹","")},
      })});
      const data=await res.json();
      if(data.error) showToast("Email error: "+data.error,"error");
      else { showToast("Email sent to "+email,"success"); setEmailModal(null); }
    } finally{ setEmailSending(false); }
  }

  const det=detail;
  const detCust=det?custs.find(c=>c.id===det.custId):null;
  const orderCF=(customFields||[]).filter(cf=>cf.entity==="order"&&cf.active);

  return (
    <div>
      <PageHeader title="Orders" sub={`${orders.length} total orders`}
        actions={<div style={{display:"flex",gap:8}}>
          <Btn variant="secondary" onClick={()=>{setForm({...blankOrder(),type:"quote",status:"concept"});setCustMode("existing");setOTab("details");setModal("new");}}>+ Quote</Btn>
          <Btn onClick={()=>{setForm(blankOrder());setCustMode("existing");setOTab("details");setModal("new");}}>+ New Order</Btn>
        </div>}/>
      <Card padding={10} style={{marginBottom:14}}>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="🔍 Search by order # or customer name…" style={{...INP,width:300,padding:"7px 11px"}}/>
          <div style={{display:"flex",alignItems:"center",gap:6,marginLeft:"auto"}}>
            <span style={{fontSize:11,color:T.tSm}}>📊 Scan:</span>
            <input value={scanInput} onChange={e=>setScanInput(e.target.value)} onKeyDown={handleScan} placeholder="Barcode/SKU scan to add item…" style={{...INP,width:200,padding:"6px 9px",fontSize:12}}/>
          </div>
        </div>
      </Card>
      <TabBar tabs={STATUS_TABS} active={tab} onChange={setTab}/>
      <Card padding={0}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH label="Order #"/><TH label="Type"/><TH label="Customer"/><TH label="Items"/><TH label="Period"/><TH label="Total"/><TH label="Deposit"/><TH label="Status"/><TH label=""/></tr></thead>
          <tbody>
            {rows.map(o=>{
              const iCount=o.lines.reduce((s,l)=>s+l.qty,0);
              const d=o.start&&o.end?ddays(o.start,o.end):0;
              const od=o.status==="active"?overdueDays(o.end):0;
              return(
                <TR key={o.id} onClick={()=>setDetail(o)}>
                  <TD style={{color:T.o,fontWeight:700}}>{o.num}</TD>
                  <TD><Badge label={o.type==="quote"?"Quote":"Order"} color={o.type==="quote"?"blue":"orange"}/></TD>
                  <TD><p style={{fontWeight:600,fontSize:13,margin:0}}>{o.custName||"—"}</p><p style={{fontSize:11,color:T.tSm,margin:0}}>{o.custCity||""}</p></TD>
                  <TD style={{fontSize:12,color:T.tMd}}>{iCount} item{iCount>1?"s":""}</TD>
                  <TD><p style={{fontSize:12,margin:0}}>{o.start} – {o.end}</p><p style={{fontSize:11,color:od>0?T.red:T.tSm,margin:0}}>{d>0?`${d}d`:""}{od>0?` · ${od}d OVERDUE!`:""}</p></TD>
                  <TD><p style={{fontWeight:700,fontSize:13,margin:0}}>{fmt(o.total)}</p>{o.discount>0&&<p style={{fontSize:10,color:T.green,margin:0}}>-{fmt(o.discount)} off</p>}{o.penalty>0&&<p style={{fontSize:10,color:T.red,margin:0}}>+{fmt(o.penalty)} penalty</p>}</TD>
                  <TD><p style={{fontWeight:600,fontSize:12,margin:0,color:o.depPaid?T.green:T.yel}}>{fmt(o.dep||0)}</p><p style={{fontSize:10,color:T.tXs,margin:0}}>{o.depMethod||""}</p></TD>
                  <TD><StatusBadge status={o.status}/></TD>
                  <TD>
                    <div style={{display:"flex",gap:5}} onClick={e=>e.stopPropagation()}>
                      {o.status==="active"&&<Btn sm variant="success" onClick={()=>markReturned(o)}>Return ✓</Btn>}
                      <select value={o.status} onChange={e=>updateStatus(o.id,e.target.value)} style={{...INP,width:"auto",padding:"4px 6px",fontSize:11}}>
                        {Object.entries(STATUS_META).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                      </select>
                    </div>
                  </TD>
                </TR>
              );
            })}
          </tbody>
        </table>
        {rows.length===0&&<div style={{padding:"36px 0",textAlign:"center",color:T.tSm}}>No orders found</div>}
      </Card>

      {/* NEW ORDER MODAL */}
      {modal&&(
        <Modal title={form.type==="quote"?"New Quote":"New Order"} onClose={()=>setModal(null)} width={920}
          footer={<><Btn variant="ghost" onClick={()=>setModal(null)}>Cancel</Btn><Btn onClick={saveOrder} style={{opacity:saving?0.7:1}}>{saving?"Saving…":form.type==="quote"?"Create Quote":"Create Order"}</Btn></>}>
          <TabBar tabs={[{id:"details",label:"① Type & Dates"},{id:"customer",label:"② Customer"},{id:"items",label:"③ Items"},{id:"charges",label:"④ Deposit & Charges"},{id:"notes",label:"⑤ Notes"}]} active={oTab} onChange={setOTab}/>

          {oTab==="details"&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px"}}>
              <div style={{gridColumn:"1/-1",display:"flex",gap:8,marginBottom:14}}>
                {[["order","📋 Order"],["quote","📄 Quote"]].map(([type,label])=>(
                  <button key={type} onClick={()=>setForm(p=>({...p,type}))} style={{flex:1,padding:"10px",borderRadius:8,fontFamily:"inherit",cursor:"pointer",fontWeight:600,fontSize:13,border:`2px solid ${form.type===type?T.o:T.bdr}`,background:form.type===type?T.oL:"#fff",color:form.type===type?T.o:T.tMd}}>{label}</button>
                ))}
              </div>
              <FInp label="Start Date" required type="date" value={form.start} onChange={e=>setForm(p=>{const np={...p,start:e.target.value};if(np.end){const d=ddays(e.target.value,np.end);return{...np,lines:np.lines.map(l=>({...l,days:d,subtotal:l.daily*l.qty*d})),...calcTotals(np.lines.map(l=>({...l,days:d,subtotal:l.daily*l.qty*d})),np.discount,np.discountType,np.penalty)};}return np;})}/>
              <FInp label="End Date" required type="date" value={form.end} onChange={e=>setForm(p=>{const np={...p,end:e.target.value};if(np.start){const d=ddays(np.start,e.target.value);return{...np,lines:np.lines.map(l=>({...l,days:d,subtotal:l.daily*l.qty*d})),...calcTotals(np.lines.map(l=>({...l,days:d,subtotal:l.daily*l.qty*d})),np.discount,np.discountType,np.penalty)};}return np;})}/>
              <FSel label="Status" value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))}><option value="reserved">Reserved</option><option value="active">Active</option><option value="concept">Quote/Concept</option></FSel>
              {form.start&&form.end&&<div style={{display:"flex",flexDirection:"column",justifyContent:"flex-end",paddingBottom:14}}><div style={{background:T.oL,border:`1px solid ${T.oB}`,borderRadius:7,padding:"9px 14px",textAlign:"center"}}><p style={{fontSize:11,color:T.o,fontWeight:600,margin:0}}>Duration</p><p style={{fontSize:20,fontWeight:800,color:T.o,margin:0}}>{ddays(form.start,form.end)} days</p></div></div>}
            </div>
          )}

          {oTab==="customer"&&(
            <div>
              <div style={{display:"flex",gap:8,marginBottom:14}}>
                {["existing","new"].map(m=>(
                  <button key={m} onClick={()=>setCustMode(m)} style={{flex:1,padding:"9px",borderRadius:7,fontSize:12,fontWeight:600,cursor:"pointer",border:`1.5px solid ${custMode===m?T.o:T.bdr}`,background:custMode===m?T.oL:"#fff",color:custMode===m?T.o:T.tMd}}>
                    {m==="existing"?"👤 Existing Customer":"✨ New Customer"}
                  </button>
                ))}
              </div>
              {custMode==="existing"?(
                <FSel label="Select Customer" required value={form.custId} onChange={e=>setForm(p=>({...p,custId:e.target.value}))}>
                  {custs.map(c=><option key={c.id} value={c.id}>{c.name} — {c.phone}</option>)}
                </FSel>
              ):(
                <div style={{background:T.bg,borderRadius:8,padding:16}}>
                  <SLabel>Customer Details</SLabel>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>
                    <FInp label="Full Name" required value={form.nc.name} onChange={e=>setForm(p=>({...p,nc:{...p.nc,name:e.target.value}}))}/>
                    <FInp label="Company" value={form.nc.company} onChange={e=>setForm(p=>({...p,nc:{...p.nc,company:e.target.value}}))}/>
                    <FInp label="Phone (Primary) ✱" required value={form.nc.phone} onChange={e=>setForm(p=>({...p,nc:{...p.nc,phone:e.target.value}}))}/>
                    <FInp label="Email" type="email" value={form.nc.email} onChange={e=>setForm(p=>({...p,nc:{...p.nc,email:e.target.value}}))}/>
                    <FInp label="City" value={form.nc.city} onChange={e=>setForm(p=>({...p,nc:{...p.nc,city:e.target.value}}))}/>
                    <FSel label="ID Type" value={form.nc.idType} onChange={e=>setForm(p=>({...p,nc:{...p.nc,idType:e.target.value}}))}>
                      <option value="">— Select —</option>{ID_TYPES.map(t=><option key={t}>{t}</option>)}
                    </FSel>
                    <FInp label="ID Number" value={form.nc.idNum} onChange={e=>setForm(p=>({...p,nc:{...p.nc,idNum:e.target.value}}))}/>
                  </div>
                </div>
              )}
            </div>
          )}

          {oTab==="items"&&(
            <div>
              {form.lines.length>0&&(
                <div style={{marginBottom:16}}>
                  <SLabel>Order Lines</SLabel>
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead><tr style={{background:T.bg}}>{["Item","Alt. Note","Qty","Days","Rate (₹)","Rule","Subtotal",""].map(h=><th key={h} style={{padding:"7px 10px",fontSize:11,fontWeight:700,color:T.tXs,textAlign:"left",textTransform:"uppercase",letterSpacing:"0.5px",borderBottom:`1px solid ${T.bdr}`}}>{h}</th>)}</tr></thead>
                    <tbody>
                      {form.lines.map(l=>(
                        <tr key={l.iid} style={{borderBottom:`1px solid ${T.bdr}`}}>
                          <td style={{padding:"8px 10px",fontWeight:600,fontSize:13}}>{l.name}</td>
                          <td style={{padding:"8px 10px"}}><input value={l.altNote||""} onChange={e=>setForm(p=>({...p,lines:p.lines.map(x=>x.iid===l.iid?{...x,altNote:e.target.value}:x)}))} placeholder="Alt note…" style={{...INP,fontSize:11,padding:"4px 7px",width:120}}/></td>
                          <td style={{padding:"8px 10px"}}><input type="number" value={l.qty} min={1} onChange={e=>updateLine(l.iid,"qty",e.target.value)} style={{...INP,width:54,padding:"4px 7px",fontSize:12}}/></td>
                          <td style={{padding:"8px 10px",fontSize:12,color:T.tMd}}>{l.days}</td>
                          <td style={{padding:"8px 10px"}}><input type="number" value={l.daily} min={0} onChange={e=>updateLine(l.iid,"daily",e.target.value)} style={{...INP,width:70,padding:"4px 7px",fontSize:12}}/></td>
                          <td style={{padding:"8px 10px"}}>{l.ruleApplied&&<Badge label={l.ruleApplied} color="green"/>}</td>
                          <td style={{padding:"8px 10px",fontWeight:700,fontSize:13,color:T.green}}>{fmt(l.subtotal)}</td>
                          <td style={{padding:"8px 10px"}}><Btn sm variant="danger" onClick={()=>setForm(p=>{const nl=p.lines.filter(x=>x.iid!==l.iid);return{...p,lines:nl,...calcTotals(nl,p.discount,p.discountType,p.penalty)};})}>×</Btn></td>
                        </tr>
                      ))}
                      <tr><td colSpan={6} style={{padding:"10px",textAlign:"right",fontWeight:700,fontSize:13}}>Subtotal</td><td style={{padding:"10px",fontWeight:800,fontSize:15}}>{fmt(form.subtotal)}</td><td/></tr>
                    </tbody>
                  </table>
                </div>
              )}
              <SLabel>Add Items</SLabel>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,maxHeight:240,overflowY:"auto"}}>
                {items.filter(i=>i.status==="active").map(item=>{
                  const sel=form.lines.find(l=>l.iid===item.id);
                  return(
                    <div key={item.id} onClick={()=>toggleItem(item)} style={{border:`1.5px solid ${sel?T.o:T.bdr}`,borderRadius:8,padding:10,cursor:"pointer",background:sel?T.oL:"#fff",transition:"all 0.15s"}}>
                      <p style={{fontSize:11,fontWeight:700,margin:0,lineHeight:1.3}}>{item.name}</p>
                      <p style={{fontSize:10,color:T.tSm,margin:"3px 0 2px"}}>{item.cat} · {item.avail||0} avail</p>
                      <p style={{fontSize:12,fontWeight:700,color:T.o,margin:0}}>{fmt(item.daily)}/day</p>
                      {item.altNotes&&<p style={{fontSize:9,color:T.o,margin:"3px 0 0"}}>✂️ {item.altNotes.slice(0,30)}</p>}
                      {sel&&<span style={{color:T.o,fontSize:14}}>✓ Added</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {oTab==="charges"&&(
            <div>
              <SLabel>Discount / Offer</SLabel>
              <DiscountPenaltyPanel form={form} setForm={p=>{const np=typeof p==="function"?p(form):p;const tots=calcTotals(np.lines,np.discount,np.discountType,np.penalty);setForm({...np,...tots});}}/>
              <div style={{marginTop:14}}><SLabel>Security Deposit</SLabel></div>
              <DepPanel form={form} setForm={setForm} subtotal={form.subtotal}/>
              {form.subtotal>0&&(
                <div style={{background:T.oL,border:`1px solid ${T.oB}`,borderRadius:8,padding:14,marginTop:14}}>
                  <p style={{fontSize:12,fontWeight:700,color:T.o,margin:"0 0 8px"}}>Order Summary</p>
                  {[["Subtotal",form.subtotal],["Discount",form.discount>0?-(form.discountType==="pct"?Math.round(form.subtotal*form.discount/100):form.discount):0],["Late Penalty",form.penalty||0],["Total",form.total],["Deposit",form.dep||0]].filter(([,v])=>v!==0).map(([l,v])=>(
                    <div key={l} style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4}}>
                      <span style={{color:l==="Total"?T.text:T.tMd,fontWeight:l==="Total"?700:400}}>{l}</span>
                      <span style={{fontWeight:l==="Total"?800:600,color:l==="Discount"?T.green:l==="Late Penalty"?T.red:l==="Total"?T.o:T.text}}>{v<0?`-${fmt(-v)}`:fmt(v)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {oTab==="notes"&&(
            <div>
              <FTxt label="Internal Notes / Special Instructions" value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} placeholder="Delivery instructions, event details, special requests…" style={{minHeight:100}}/>
              {orderCF.length>0&&(
                <div>
                  <SLabel>Custom Fields</SLabel>
                  {orderCF.map(cf=>(
                    <div key={cf.id} style={{marginBottom:14}}>
                      <FLabel text={cf.label} required={cf.required}/>
                      {cf.field_type==="select"?<select value={form.customFields?.[cf.id]||""} onChange={e=>setForm(p=>({...p,customFields:{...(p.customFields||{}),[cf.id]:e.target.value}}))} style={INP}><option value="">— Select —</option>{(cf.options||[]).map(o=><option key={o}>{o}</option>)}</select>
                      :cf.field_type==="checkbox"?<label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}><input type="checkbox" checked={!!form.customFields?.[cf.id]} onChange={e=>setForm(p=>({...p,customFields:{...(p.customFields||{}),[cf.id]:e.target.checked}}))}/>{cf.label}</label>
                      :<input type={cf.field_type==="number"?"number":"text"} value={form.customFields?.[cf.id]||""} onChange={e=>setForm(p=>({...p,customFields:{...(p.customFields||{}),[cf.id]:e.target.value}}))} style={INP}/>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Modal>
      )}

      {/* ORDER DETAIL DRAWER */}
      {det&&(
        <div onClick={()=>setDetail(null)} style={{position:"fixed",inset:0,zIndex:900}}>
          <div onClick={e=>e.stopPropagation()} style={{position:"absolute",right:0,top:0,bottom:0,width:560,background:"#fff",boxShadow:"-4px 0 20px rgba(0,0,0,0.12)",display:"flex",flexDirection:"column",overflowY:"auto"}}>
            <div style={{padding:"16px 20px",borderBottom:`1px solid ${T.bdr}`,display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:"#fff",zIndex:1}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:17,fontWeight:800,color:T.o}}>{det.num}</span><StatusBadge status={det.status}/>{det.source==="online"&&<Badge label="Online" color="blue"/>}</div>
                <p style={{fontSize:12,color:T.tSm,margin:"3px 0 0"}}>{det.custName||""}</p>
              </div>
              <div style={{display:"flex",gap:6}}>
                <Btn sm variant="secondary" onClick={()=>setEmailModal({order:det})}>✉️ Email</Btn>
                <button onClick={()=>setDetail(null)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:T.tSm}}>×</button>
              </div>
            </div>
            <div style={{padding:20,flex:1}}>
              {/* Status change */}
              <Card padding={14} style={{marginBottom:14}}>
                <p style={{fontSize:11,fontWeight:700,color:T.tXs,textTransform:"uppercase",letterSpacing:"0.5px",margin:"0 0 10px"}}>Change Status</p>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {Object.entries(STATUS_META).map(([k,v])=>(
                    <button key={k} onClick={()=>updateStatus(det.id,k)} style={{padding:"5px 11px",borderRadius:20,fontSize:11,fontWeight:600,cursor:"pointer",border:`1px solid ${det.status===k?v.cl:T.bdr}`,background:det.status===k?v.bg:"transparent",color:det.status===k?v.cl:T.tMd}}>{v.label}</button>
                  ))}
                </div>
                {det.status==="active"&&<Btn variant="success" style={{marginTop:10,width:"100%"}} onClick={()=>markReturned(det)}>✓ Mark Returned & Add to Wash Queue</Btn>}
              </Card>
              {/* Customer */}
              {detCust&&(
                <Card padding={14} style={{marginBottom:14}}>
                  <p style={{fontSize:11,fontWeight:700,color:T.tXs,textTransform:"uppercase",letterSpacing:"0.5px",margin:"0 0 10px"}}>Customer</p>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                    <div style={{width:36,height:36,borderRadius:"50%",background:`${T.o}20`,color:T.o,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700}}>{detCust.name[0]}</div>
                    <div><p style={{fontWeight:700,fontSize:14,margin:0}}>{detCust.name}</p><p style={{fontSize:12,color:T.tMd,margin:0}}>{detCust.company||detCust.city||""}</p></div>
                    <WABtn phone={detCust.phone} message={`Hi ${detCust.name}, regarding your rental order ${det.num}`}/>
                  </div>
                  <p style={{fontSize:12,margin:"3px 0",color:T.text}}>📞 {detCust.phone}</p>
                  {detCust.phone2&&<p style={{fontSize:12,margin:"3px 0",color:T.tMd}}>{detCust.phone2type}: {detCust.phone2}</p>}
                  {detCust.idType&&<div style={{marginTop:8,padding:"8px 10px",background:"#FFFBEB",border:"1px solid #FDE68A",borderRadius:7}}><p style={{fontSize:10,fontWeight:700,color:"#92400E",margin:0}}>🪪 {detCust.idType}: <span style={{fontFamily:"monospace"}}>{detCust.idNum}</span></p></div>}
                </Card>
              )}
              {/* Period */}
              <Card padding={14} style={{marginBottom:14}}>
                <p style={{fontSize:11,fontWeight:700,color:T.tXs,textTransform:"uppercase",letterSpacing:"0.5px",margin:"0 0 6px"}}>Rental Period</p>
                <p style={{fontWeight:700,fontSize:14,margin:0}}>{det.start} → {det.end}</p>
                <p style={{fontSize:12,color:T.tMd,margin:"3px 0 0"}}>{det.start&&det.end?`${ddays(det.start,det.end)} days`:""}</p>
                {det.status==="active"&&overdueDays(det.end)>0&&<div style={{marginTop:8,background:T.rL,border:`1px solid ${T.rB}`,borderRadius:6,padding:"6px 10px"}}><p style={{fontSize:12,fontWeight:700,color:T.red,margin:0}}>⚠️ {overdueDays(det.end)} day{overdueDays(det.end)>1?"s":""} overdue · Penalty: {fmt(overdueDays(det.end)*(settings.penaltyRate||50))}</p></div>}
              </Card>
              {/* Deposit */}
              <div style={{background:"#F0FDF4",border:`1px solid ${T.gB}`,borderRadius:8,padding:14,marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><p style={{fontSize:10,fontWeight:700,color:"#166534",textTransform:"uppercase",letterSpacing:"0.5px",margin:"0 0 3px"}}>Security Deposit</p><p style={{fontSize:18,fontWeight:700,color:"#166534",margin:0}}>{fmt(det.dep||0)}</p><p style={{fontSize:11,color:"#4ADE80",margin:"2px 0 0"}}>{det.depMethod||"—"}{det.depRef?` · ${det.depRef}`:""}</p></div>
                <span style={{background:det.depPaid?T.green:T.yel,color:"#fff",fontSize:12,fontWeight:700,padding:"5px 12px",borderRadius:20}}>{det.depPaid?"✓ Collected":"⏳ Pending"}</span>
              </div>
              {/* Items */}
              <Card padding={14} style={{marginBottom:14}}>
                <p style={{fontSize:11,fontWeight:700,color:T.tXs,textTransform:"uppercase",letterSpacing:"0.5px",margin:"0 0 10px"}}>Items Rented</p>
                {det.lines.map(l=>(
                  <div key={l.iid} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"8px 0",borderBottom:`1px solid ${T.bdr}`}}>
                    <div><p style={{fontWeight:600,fontSize:13,margin:0}}>{l.name}</p><p style={{fontSize:11,color:T.tSm,margin:0}}>×{l.qty} · {l.days}d · {fmt(l.daily)}/day</p>{l.altNote&&<p style={{fontSize:11,color:T.o,margin:"2px 0 0"}}>✂️ {l.altNote}</p>}{l.ruleApplied&&<Badge label={l.ruleApplied} color="green"/>}</div>
                    <span style={{fontWeight:700,fontSize:13}}>{fmt(l.subtotal)}</span>
                  </div>
                ))}
                {det.discount>0&&<div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${T.bdr}`,fontSize:13,color:T.green}}><span>Discount</span><span>-{fmt(det.discountType==="pct"?Math.round(det.subtotal*det.discount/100):det.discount)}</span></div>}
                {det.penalty>0&&<div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${T.bdr}`,fontSize:13,color:T.red}}><span>Late Penalty {det.penaltyPaid?"✓":""}</span><span>+{fmt(det.penalty)}</span></div>}
                <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0 0",fontWeight:800,fontSize:16,color:T.text}}><span>Total</span><span style={{color:T.o}}>{fmt(det.total)}</span></div>
              </Card>
              {det.notes&&<div style={{background:T.bg,borderRadius:7,padding:10,borderLeft:`3px solid ${T.o}`,marginBottom:14}}><p style={{fontSize:12,color:T.tMd,margin:0}}>📝 {det.notes}</p></div>}
              <div style={{display:"flex",gap:8,justifyContent:"space-between"}}>
                <Btn variant="danger" sm onClick={async()=>{await onDeleteOrder(det.id);setDetail(null);showToast("Order deleted","success");}}>Delete</Btn>
                <div style={{display:"flex",gap:6}}>
                  <Btn variant="secondary" sm onClick={()=>setEmailModal({order:det})}>✉️ Email</Btn>
                  <WABtn phone={detCust?.phone} message={`Hi ${detCust?.name}, your order ${det.num}: ${det.start}→${det.end}, Total: ${fmt(det.total)}`}/>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EMAIL MODAL */}
      {emailModal&&(
        <Modal title="Send Email to Customer" onClose={()=>setEmailModal(null)} width={500}
          footer={<Btn variant="ghost" onClick={()=>setEmailModal(null)}>Cancel</Btn>}>
          <p style={{fontSize:13,color:T.tMd,marginBottom:16}}>Select email type to send to <strong>{custs.find(c=>c.id===emailModal.order.custId)?.name}</strong>:</p>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {[["booking_confirmed","✅ Booking Confirmation","Send order details and pickup date"],["reminder_24h","⏰ 24h Pickup Reminder","Remind customer about tomorrow's pickup"],["return_due","📦 Return Due Reminder","Remind about upcoming return deadline"],["overdue_notice","⚠️ Overdue Notice","Notify about overdue return and penalty"],["payment_receipt","🧾 Payment Receipt","Send receipt for amount paid"]].map(([template,title,desc])=>(
              <button key={template} onClick={()=>sendEmail(template)} disabled={emailSending} style={{padding:"12px 16px",borderRadius:8,border:`1px solid ${T.bdr}`,background:emailSending?"#f8f9fa":"#fff",cursor:emailSending?"not-allowed":"pointer",textAlign:"left",fontFamily:"inherit",transition:"all 0.15s"}} onMouseEnter={e=>{if(!emailSending)e.currentTarget.style.background=T.oL;}} onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
                <p style={{fontWeight:600,fontSize:13,margin:0}}>{title}</p>
                <p style={{fontSize:11,color:T.tSm,margin:"2px 0 0"}}>{desc}</p>
              </button>
            ))}
          </div>
          {emailSending&&<div style={{textAlign:"center",padding:12,fontSize:13,color:T.tSm}}>Sending email…</div>}
        </Modal>
      )}
    </div>
  );
}

// ============================================================
// CUSTOMERS COMPONENT
// ============================================================
function Customers({ custs, orders, pricingRules, customFields, onSave, onDelete, onSendEmail, showToast }) {
  const [q, setQ] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [det, setDet] = useState(null);
  const [activeTab, setActiveTab] = useState("info");
  const [saving, setSaving] = useState(false);
  const EMPTY = { name:"", phone:"", phone2:"", phone2type:"mobile", email:"", company:"", city:"", state:"", idType:"national_id", idNum:"", tags:[], notes:"", customFields:{} };
  const [form, setForm] = useState(EMPTY);
  const fld = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const custFields = customFields.filter(f => f.entity === "customer" && f.active);

  const filtered = custs.filter(c => {
    if (!q) return true;
    const s = q.toLowerCase();
    return (c.name||"").toLowerCase().includes(s) || (c.phone||"").includes(s) || (c.email||"").toLowerCase().includes(s) || (c.company||"").toLowerCase().includes(s);
  });

  const custOrders = (cid) => orders.filter(o => o.custId === cid);

  const openEdit = (c) => {
    setEditing(c.id);
    setForm({ name:c.name||"", phone:c.phone||"", phone2:c.phone2||"", phone2type:c.phone2type||"mobile", email:c.email||"", company:c.company||"", city:c.city||"", state:c.state||"", idType:c.idType||"national_id", idNum:c.idNum||"", tags:c.tags||[], notes:c.notes||"", customFields:c.customFields||{} });
    setShowForm(true);
  };

  const openNew = () => { setEditing(null); setForm(EMPTY); setShowForm(true); };

  const handleSave = async () => {
    if (!form.name.trim()) return showToast("Name required", "error");
    setSaving(true);
    await onSave({ ...form, id: editing });
    setSaving(false);
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this customer? This cannot be undone.")) return;
    await onDelete(id);
    setDet(null);
    showToast("Customer deleted", "success");
  };

  const totals = (cid) => {
    const cos = custOrders(cid);
    return { count: cos.length, spent: cos.reduce((s, o) => s + (o.total || 0), 0) };
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200 }}>
      <PageHeader title="Customers" subtitle={`${custs.length} total customers`}>
        <Btn onClick={openNew}>+ New Customer</Btn>
      </PageHeader>

      {/* Search */}
      <div style={{ marginBottom: 20, display: "flex", gap: 10 }}>
        <FInp placeholder="Search by name, phone, email, company…" value={q} onChange={e => setQ(e.target.value)} style={{ maxWidth: 360 }} />
      </div>

      {/* Table */}
      <Card padding={0}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: T.bg }}>
              <TH>Name</TH><TH>Phone</TH><TH>Email</TH><TH>Company</TH><TH>City</TH><TH>Orders</TH><TH>Actions</TH>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => {
              const { count, spent } = totals(c.id);
              return (
                <TR key={c.id}>
                  <TD><span style={{ fontWeight: 600, cursor: "pointer", color: T.o }} onClick={() => { setDet(c); setActiveTab("info"); }}>{c.name}</span>{c.tags && c.tags.length > 0 && <div style={{ display: "flex", gap: 4, marginTop: 2 }}>{c.tags.slice(0, 2).map(t => <Badge key={t} label={t} color="blue" />)}</div>}</TD>
                  <TD>{c.phone || "—"}</TD>
                  <TD><span style={{ fontSize: 12 }}>{c.email || "—"}</span></TD>
                  <TD>{c.company || "—"}</TD>
                  <TD>{[c.city, c.state].filter(Boolean).join(", ") || "—"}</TD>
                  <TD><span style={{ fontWeight: 600, fontSize: 13 }}>{count}</span><span style={{ fontSize: 11, color: T.tSm }}> · {fmt(spent)}</span></TD>
                  <TD>
                    <div style={{ display: "flex", gap: 4 }}>
                      <Btn variant="ghost" sm onClick={() => openEdit(c)}>Edit</Btn>
                      <Btn variant="ghost" sm onClick={() => { setDet(c); setActiveTab("info"); }}>View</Btn>
                    </div>
                  </TD>
                </TR>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", padding: 40, color: T.tSm, fontSize: 14 }}>No customers found</td></tr>}
          </tbody>
        </table>
      </Card>

      {/* Customer Detail Drawer */}
      {det && (
        <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 480, background: "#fff", boxShadow: "-4px 0 24px rgba(0,0,0,0.15)", zIndex: 200, overflowY: "auto", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.bdr}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: T.bg }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: 17, margin: 0 }}>{det.name}</p>
              <p style={{ fontSize: 12, color: T.tSm, margin: 0 }}>{det.company || "Individual customer"}</p>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <Btn variant="secondary" sm onClick={() => openEdit(det)}>Edit</Btn>
              <Btn variant="ghost" sm onClick={() => setDet(null)}>✕</Btn>
            </div>
          </div>

          <TabBar tabs={["info", "orders", "emails"]} active={activeTab} onChange={setActiveTab} labels={{ info: "Info", orders: "Orders", emails: "Emails" }} />

          <div style={{ padding: 20, flex: 1 }}>
            {activeTab === "info" && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                  {[["Phone", det.phone], ["Alt Phone", det.phone2], ["Email", det.email], ["City", [det.city, det.state].filter(Boolean).join(", ")], ["ID Type", det.idType], ["ID Number", det.idNum]].map(([l, v]) => v ? (
                    <div key={l}><p style={{ fontSize: 11, color: T.tXs, margin: "0 0 2px", fontWeight: 600 }}>{l}</p><p style={{ fontSize: 13, margin: 0 }}>{v}</p></div>
                  ) : null)}
                </div>
                {det.tags && det.tags.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <p style={{ fontSize: 11, color: T.tXs, margin: "0 0 6px", fontWeight: 600 }}>Tags</p>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{det.tags.map(t => <Badge key={t} label={t} color="blue" />)}</div>
                  </div>
                )}
                {det.notes && <div style={{ background: T.bg, borderRadius: 7, padding: 10, borderLeft: `3px solid ${T.o}` }}><p style={{ fontSize: 12, color: T.tMd, margin: 0 }}>📝 {det.notes}</p></div>}
                {custFields.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: T.tXs, textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 8px" }}>Custom Fields</p>
                    {custFields.map(f => (
                      <div key={f.id} style={{ marginBottom: 8 }}>
                        <p style={{ fontSize: 11, color: T.tXs, margin: "0 0 2px", fontWeight: 600 }}>{f.label}</p>
                        <p style={{ fontSize: 13, margin: 0 }}>{det.customFields?.[f.id] ?? "—"}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                  {det.email && <Btn variant="secondary" sm onClick={() => onSendEmail && onSendEmail(det)}>✉️ Send Email</Btn>}
                  {det.phone && <WABtn phone={det.phone} message={`Hi ${det.name}, `} sm />}
                  <Btn variant="danger" sm onClick={() => handleDelete(det.id)}>Delete</Btn>
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div>
                {custOrders(det.id).length === 0 ? (
                  <p style={{ color: T.tSm, fontSize: 14, textAlign: "center", padding: 24 }}>No orders yet</p>
                ) : custOrders(det.id).map(o => (
                  <div key={o.id} style={{ borderBottom: `1px solid ${T.bdr}`, padding: "12px 0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 13, margin: 0 }}>{o.num}</p>
                        <p style={{ fontSize: 11, color: T.tSm, margin: "2px 0 0" }}>{o.start} → {o.end}</p>
                        <p style={{ fontSize: 11, color: T.tSm, margin: "1px 0 0" }}>{o.lines?.length || 0} items</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <StatusBadge status={o.status} />
                        <p style={{ fontWeight: 700, fontSize: 14, margin: "4px 0 0", color: T.o }}>{fmt(o.total)}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: 12, padding: "12px 0", borderTop: `1px solid ${T.bdr}` }}>
                  <p style={{ fontSize: 13, fontWeight: 700 }}>Total spent: <span style={{ color: T.o }}>{fmt(custOrders(det.id).reduce((s, o) => s + (o.total || 0), 0))}</span></p>
                </div>
              </div>
            )}

            {activeTab === "emails" && (
              <div>
                <p style={{ color: T.tSm, fontSize: 13, textAlign: "center", padding: 24 }}>Email history is stored in the email log. Check Reports → Email Log for all sent emails.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Customer Form Modal */}
      {showForm && (
        <Modal title={editing ? "Edit Customer" : "New Customer"} onClose={() => setShowForm(false)} width={620}
          footer={<><Btn variant="ghost" onClick={() => setShowForm(false)}>Cancel</Btn><Btn onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save Customer"}</Btn></>}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ gridColumn: "1/-1" }}><FLabel>Full Name *</FLabel><FInp value={form.name} onChange={e => fld("name", e.target.value)} placeholder="Customer name" /></div>
            <div><FLabel>Phone</FLabel><FInp value={form.phone} onChange={e => fld("phone", e.target.value)} placeholder="+1234567890" /></div>
            <div>
              <FLabel>Alt Phone</FLabel>
              <div style={{ display: "flex", gap: 6 }}>
                <FSel value={form.phone2type} onChange={e => fld("phone2type", e.target.value)} style={{ width: 100 }}>{["mobile","home","work","whatsapp"].map(t => <option key={t}>{t}</option>)}</FSel>
                <FInp value={form.phone2} onChange={e => fld("phone2", e.target.value)} placeholder="Alt phone" />
              </div>
            </div>
            <div><FLabel>Email</FLabel><FInp type="email" value={form.email} onChange={e => fld("email", e.target.value)} placeholder="email@example.com" /></div>
            <div><FLabel>Company</FLabel><FInp value={form.company} onChange={e => fld("company", e.target.value)} placeholder="Company name" /></div>
            <div><FLabel>City</FLabel><FInp value={form.city} onChange={e => fld("city", e.target.value)} /></div>
            <div><FLabel>State</FLabel><FInp value={form.state} onChange={e => fld("state", e.target.value)} /></div>
            <div><FLabel>ID Type</FLabel><FSel value={form.idType} onChange={e => fld("idType", e.target.value)}>{["national_id","passport","driving_license","other"].map(t => <option key={t}>{t}</option>)}</FSel></div>
            <div><FLabel>ID Number</FLabel><FInp value={form.idNum} onChange={e => fld("idNum", e.target.value)} /></div>
            <div style={{ gridColumn: "1/-1" }}>
              <FLabel>Tags (comma separated)</FLabel>
              <FInp value={(form.tags || []).join(", ")} onChange={e => fld("tags", e.target.value.split(",").map(t => t.trim()).filter(Boolean))} placeholder="vip, regular, corporate" />
            </div>
            <div style={{ gridColumn: "1/-1" }}><FLabel>Notes</FLabel><FTxt value={form.notes} onChange={e => fld("notes", e.target.value)} rows={3} /></div>
            {custFields.map(f => (
              <div key={f.id}>
                <FLabel>{f.label}{f.required ? " *" : ""}</FLabel>
                {f.field_type === "textarea" ? <FTxt value={form.customFields?.[f.id] || ""} onChange={e => fld("customFields", { ...form.customFields, [f.id]: e.target.value })} rows={2} /> :
                  f.field_type === "select" ? <FSel value={form.customFields?.[f.id] || ""} onChange={e => fld("customFields", { ...form.customFields, [f.id]: e.target.value })}><option value="">Select…</option>{(f.options || []).map(o => <option key={o}>{o}</option>)}</FSel> :
                  f.field_type === "checkbox" ? <input type="checkbox" checked={!!form.customFields?.[f.id]} onChange={e => fld("customFields", { ...form.customFields, [f.id]: e.target.checked })} /> :
                  <FInp type={f.field_type === "number" ? "number" : f.field_type === "date" ? "date" : "text"} value={form.customFields?.[f.id] || ""} onChange={e => fld("customFields", { ...form.customFields, [f.id]: e.target.value })} />}
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}

// ============================================================
// WASHING / ALTERATIONS COMPONENT
// ============================================================
function Washing({ items, wash, onUpdate, onAdd, showToast }) {
  const [q, setQ] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ itemId: "", notes: "", qty: 1 });
  const [saving, setSaving] = useState(false);

  const filtered = wash.filter(w => {
    if (filterStatus !== "all" && w.status !== filterStatus) return false;
    if (q) {
      const item = items.find(i => i.id === w.itemId);
      const s = q.toLowerCase();
      return (item?.name || "").toLowerCase().includes(s) || (w.notes || "").toLowerCase().includes(s);
    }
    return true;
  });

  const counts = {
    all: wash.length,
    washing: wash.filter(w => w.status === "washing").length,
    ready: wash.filter(w => w.status === "ready").length,
    done: wash.filter(w => w.status === "done").length,
  };

  const handleAdd = async () => {
    if (!addForm.itemId) return showToast("Select an item", "error");
    setSaving(true);
    await onAdd({ ...addForm, status: "washing" });
    setSaving(false);
    setShowAddModal(false);
    setAddForm({ itemId: "", notes: "", qty: 1 });
    showToast("Added to wash queue", "success");
  };

  const nextStatus = { washing: "ready", ready: "done", done: "washing" };
  const nextLabel = { washing: "Mark Ready", ready: "Mark Done", done: "Re-queue" };
  const statusColors = { washing: T.blue, ready: T.green, done: T.tSm };

  return (
    <div style={{ padding: 24, maxWidth: 1100 }}>
      <PageHeader title="Washing & Alterations" subtitle="Track cleaning and alteration queue">
        <Btn onClick={() => setShowAddModal(true)}>+ Add to Queue</Btn>
      </PageHeader>

      {/* Status filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {["all", "washing", "ready", "done"].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: "7px 16px", borderRadius: 20, border: `2px solid ${filterStatus === s ? T.o : T.bdr}`, background: filterStatus === s ? T.oL : "#fff", color: filterStatus === s ? T.o : T.tMd, fontWeight: filterStatus === s ? 700 : 500, cursor: "pointer", fontSize: 13 }}>
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)} ({counts[s]})
          </button>
        ))}
        <FInp placeholder="Search items…" value={q} onChange={e => setQ(e.target.value)} style={{ marginLeft: "auto", maxWidth: 240 }} />
      </div>

      {/* Wash queue table */}
      <Card padding={0}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: T.bg }}>
              <TH>Item</TH><TH>Qty</TH><TH>Status</TH><TH>Notes</TH><TH>Added</TH><TH>Actions</TH>
            </tr>
          </thead>
          <tbody>
            {filtered.map(w => {
              const item = items.find(i => i.id === w.itemId);
              return (
                <TR key={w.id}>
                  <TD><p style={{ fontWeight: 600, margin: 0 }}>{item?.name || "Unknown Item"}</p>{item?.sku && <p style={{ fontSize: 11, color: T.tSm, margin: 0 }}>SKU: {item.sku}</p>}</TD>
                  <TD>{w.qty || 1}</TD>
                  <TD><span style={{ background: statusColors[w.status] + "22", color: statusColors[w.status], padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 700 }}>{w.status}</span></TD>
                  <TD><span style={{ fontSize: 12, color: T.tMd }}>{w.notes || "—"}</span></TD>
                  <TD><span style={{ fontSize: 12, color: T.tSm }}>{w.date || w.createdAt?.slice(0, 10) || "—"}</span></TD>
                  <TD>
                    <Btn variant="ghost" sm onClick={async () => { await onUpdate(w.id, { status: nextStatus[w.status] }); showToast(`Status updated to ${nextStatus[w.status]}`, "success"); }}>{nextLabel[w.status]}</Btn>
                  </TD>
                </TR>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: T.tSm, fontSize: 14 }}>No items in queue</td></tr>}
          </tbody>
        </table>
      </Card>

      {showAddModal && (
        <Modal title="Add to Wash Queue" onClose={() => setShowAddModal(false)} width={420}
          footer={<><Btn variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Btn><Btn onClick={handleAdd} disabled={saving}>{saving ? "Adding…" : "Add to Queue"}</Btn></>}>
          <FLabel>Item *</FLabel>
          <FSel value={addForm.itemId} onChange={e => setAddForm(f => ({ ...f, itemId: e.target.value }))}>
            <option value="">Select item…</option>
            {items.map(i => <option key={i.id} value={i.id}>{i.name}{i.sku ? ` (${i.sku})` : ""}</option>)}
          </FSel>
          <FLabel style={{ marginTop: 12 }}>Quantity</FLabel>
          <FInp type="number" min={1} value={addForm.qty} onChange={e => setAddForm(f => ({ ...f, qty: parseInt(e.target.value) || 1 }))} style={{ width: 80 }} />
          <FLabel style={{ marginTop: 12 }}>Notes (alteration details, etc.)</FLabel>
          <FTxt value={addForm.notes} onChange={e => setAddForm(f => ({ ...f, notes: e.target.value }))} rows={3} placeholder="e.g., Hem pants 2 inches, dry clean only" />
        </Modal>
      )}
    </div>
  );
}

// ============================================================
// CALENDAR COMPONENT
// ============================================================
function Calendar({ orders, custs, items }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [hoveredOrder, setHoveredOrder] = useState(null);

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const pad = (n) => String(n).padStart(2, "0");
  const dateStr = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;

  const getOrdersForDay = (d) => {
    const ds = dateStr(viewYear, viewMonth, d);
    return orders.filter(o => {
      const start = o.start?.slice(0, 10);
      const end = o.end?.slice(0, 10);
      return start <= ds && end >= ds && ["draft","active","returned"].includes(o.status);
    });
  };

  const orderColor = (status) => status === "active" ? T.blue : status === "returned" ? T.green : T.yel;

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };

  const cells = Array.from({ length: firstDay }, (_, i) => null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
  const rows = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  return (
    <div style={{ padding: 24, maxWidth: 1100 }}>
      <PageHeader title="Calendar" subtitle="Rental schedule overview">
        <div style={{ display: "flex", gap: 10 }}>
          <Btn variant="ghost" onClick={prevMonth}>‹ Prev</Btn>
          <span style={{ fontWeight: 700, fontSize: 16, alignSelf: "center" }}>{monthNames[viewMonth]} {viewYear}</span>
          <Btn variant="ghost" onClick={nextMonth}>Next ›</Btn>
        </div>
      </PageHeader>

      <Card padding={0}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
                <th key={d} style={{ padding: "10px 0", textAlign: "center", fontSize: 12, fontWeight: 700, color: T.tXs, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: `1px solid ${T.bdr}` }}>{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                {Array.from({ length: 7 }, (_, ci) => {
                  const d = row[ci];
                  const isToday = d && dateStr(viewYear, viewMonth, d) === today.toISOString().slice(0, 10);
                  const dayOrders = d ? getOrdersForDay(d) : [];
                  return (
                    <td key={ci} style={{ border: `1px solid ${T.bdr}`, padding: 6, verticalAlign: "top", minHeight: 90, width: "14.28%", background: isToday ? T.oL : "#fff" }}>
                      {d && (
                        <>
                          <div style={{ fontWeight: isToday ? 700 : 400, fontSize: 13, color: isToday ? T.o : T.text, marginBottom: 4, width: 24, height: 24, borderRadius: "50%", background: isToday ? T.o : "transparent", color: isToday ? "#fff" : T.text, display: "flex", alignItems: "center", justifyContent: "center" }}>{d}</div>
                          {dayOrders.slice(0, 3).map(o => {
                            const cust = custs.find(c => c.id === o.custId);
                            return (
                              <div key={o.id} onMouseEnter={() => setHoveredOrder(o)} onMouseLeave={() => setHoveredOrder(null)} style={{ background: orderColor(o.status) + "22", borderLeft: `3px solid ${orderColor(o.status)}`, padding: "2px 5px", borderRadius: 3, fontSize: 10, fontWeight: 600, color: orderColor(o.status), marginBottom: 2, cursor: "pointer", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {o.num} {cust ? `· ${cust.name.split(" ")[0]}` : ""}
                              </div>
                            );
                          })}
                          {dayOrders.length > 3 && <div style={{ fontSize: 10, color: T.tSm }}>+{dayOrders.length - 3} more</div>}
                        </>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, marginTop: 16, fontSize: 12, color: T.tMd }}>
        {[["Draft", T.yel], ["Active", T.blue], ["Returned", T.green]].map(([l, c]) => (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 12, height: 12, borderRadius: 2, background: c + "44", border: `2px solid ${c}` }} />
            <span>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// DOCUMENTS / RECEIPTS COMPONENT
// ============================================================
function Documents({ orders, custs, items, settings }) {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null);
  const bizName = settings?.bizName || "Fabb.booking";
  const bizPhone = settings?.phone || "";
  const bizAddress = settings?.address || "";

  const filteredOrders = orders.filter(o => {
    if (!q) return true;
    const s = q.toLowerCase();
    const cust = custs.find(c => c.id === o.custId);
    return (o.num || "").toLowerCase().includes(s) || (cust?.name || "").toLowerCase().includes(s);
  });

  const printOrder = (order) => {
    const cust = custs.find(c => c.id === order.custId);
    const printWin = window.open("", "_blank", "width=800,height=900");
    const html = `<!DOCTYPE html><html><head><title>Receipt ${order.num}</title><style>
      body{font-family:Arial,sans-serif;max-width:700px;margin:40px auto;padding:20px;color:#222}
      h1{font-size:22px;margin:0}h2{font-size:16px;color:#666;margin:4px 0 20px}
      .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #1a1a2e;padding-bottom:16px;margin-bottom:20px}
      .biz{color:#1a1a2e}.meta{text-align:right;font-size:13px;color:#666}
      table{width:100%;border-collapse:collapse;margin:20px 0}
      th{background:#1a1a2e;color:#fff;padding:8px 12px;text-align:left;font-size:12px}
      td{padding:8px 12px;border-bottom:1px solid #eee;font-size:13px}
      .totals{margin-left:auto;width:300px}.totals td{border:none;padding:5px 12px}
      .total-row td{font-weight:700;font-size:16px;color:#ff6b35;border-top:2px solid #1a1a2e}
      .footer{margin-top:30px;padding-top:16px;border-top:1px solid #eee;font-size:11px;color:#999;text-align:center}
      @media print{body{margin:0}}
    </style></head><body>
    <div class="header"><div class="biz"><h1>${bizName}</h1>${bizPhone ? `<p style="margin:4px 0;font-size:13px">${bizPhone}</p>` : ""}${bizAddress ? `<p style="margin:0;font-size:13px">${bizAddress}</p>` : ""}</div>
    <div class="meta"><p><strong>RENTAL RECEIPT</strong></p><p>Order: <strong>${order.num}</strong></p><p>Date: ${new Date().toLocaleDateString()}</p><p>Status: <strong>${order.status?.toUpperCase()}</strong></p></div></div>
    <div style="margin-bottom:20px"><p style="margin:0;font-size:14px"><strong>Customer:</strong> ${cust?.name || "—"}</p>${cust?.phone ? `<p style="margin:4px 0;font-size:13px"><strong>Phone:</strong> ${cust.phone}</p>` : ""}${cust?.email ? `<p style="margin:0;font-size:13px"><strong>Email:</strong> ${cust.email}</p>` : ""}</div>
    <div style="margin-bottom:20px"><p style="margin:0;font-size:13px"><strong>Period:</strong> ${order.start} to ${order.end} (${order.days || 0} days)</p></div>
    <table><thead><tr><th>Item</th><th>Qty</th><th>Days</th><th>Daily Rate</th><th>Subtotal</th></tr></thead><tbody>
    ${(order.lines || []).map(l => `<tr><td>${l.name}${l.altNote ? `<br><small style="color:#666">✂️ ${l.altNote}</small>` : ""}</td><td>${l.qty}</td><td>${l.days}</td><td>${fmtNum(l.daily)}</td><td>${fmtNum(l.subtotal)}</td></tr>`).join("")}
    </tbody></table>
    <table class="totals"><tbody>
    <tr><td>Subtotal</td><td style="text-align:right">${fmtNum(order.subtotal || 0)}</td></tr>
    ${order.discount > 0 ? `<tr><td>Discount</td><td style="text-align:right;color:green">-${fmtNum(order.discountType === "pct" ? Math.round((order.subtotal || 0) * order.discount / 100) : order.discount)}</td></tr>` : ""}
    ${order.penalty > 0 ? `<tr><td>Late Penalty</td><td style="text-align:right;color:red">+${fmtNum(order.penalty)}</td></tr>` : ""}
    <tr class="total-row"><td>TOTAL</td><td style="text-align:right">${fmtNum(order.total || 0)}</td></tr>
    ${order.paid > 0 ? `<tr><td>Amount Paid</td><td style="text-align:right">${fmtNum(order.paid)}</td></tr>` : ""}
    ${(order.total || 0) - (order.paid || 0) > 0 ? `<tr><td style="color:red">Balance Due</td><td style="text-align:right;color:red">${fmtNum((order.total || 0) - (order.paid || 0))}</td></tr>` : ""}
    </tbody></table>
    ${order.dep > 0 ? `<div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:12px;margin:16px 0"><p style="margin:0;font-size:13px"><strong>Security Deposit:</strong> ${fmtNum(order.dep)} — ${order.depPaid ? "✓ Collected" + (order.depMethod ? ` via ${order.depMethod}` : "") : "⏳ Pending"}</p></div>` : ""}
    ${order.notes ? `<div style="margin:16px 0;padding:12px;border-left:4px solid #ff6b35;background:#fff5f0"><p style="margin:0;font-size:12px;color:#666">Notes: ${order.notes}</p></div>` : ""}
    <div class="footer"><p>${bizName} · Thank you for your business!</p></div>
    </body></html>`;
    printWin.document.write(html);
    printWin.document.close();
    printWin.print();
  };

  function fmtNum(n) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n); }

  return (
    <div style={{ padding: 24, maxWidth: 1000 }}>
      <PageHeader title="Documents & Receipts" subtitle="Print receipts and rental agreements">
      </PageHeader>

      <div style={{ marginBottom: 16 }}>
        <FInp placeholder="Search orders by number or customer…" value={q} onChange={e => setQ(e.target.value)} style={{ maxWidth: 360 }} />
      </div>

      <Card padding={0}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ background: T.bg }}><TH>Order</TH><TH>Customer</TH><TH>Period</TH><TH>Total</TH><TH>Status</TH><TH>Actions</TH></tr></thead>
          <tbody>
            {filteredOrders.map(o => {
              const cust = custs.find(c => c.id === o.custId);
              return (
                <TR key={o.id}>
                  <TD><span style={{ fontWeight: 600 }}>{o.num}</span></TD>
                  <TD>{cust?.name || "Unknown"}</TD>
                  <TD><span style={{ fontSize: 12 }}>{o.start} → {o.end}</span></TD>
                  <TD style={{ fontWeight: 600, color: T.o }}>{fmt(o.total || 0)}</TD>
                  <TD><StatusBadge status={o.status} /></TD>
                  <TD>
                    <Btn variant="ghost" sm onClick={() => printOrder(o)}>🖨️ Print</Btn>
                  </TD>
                </TR>
              );
            })}
            {filteredOrders.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: T.tSm, fontSize: 14 }}>No orders found</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ============================================================
// REPORTS COMPONENT
// ============================================================
function Reports({ orders, custs, items, settings }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [range, setRange] = useState("30d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [exporting, setExporting] = useState(null);

  const today = new Date();
  const getRange = () => {
    const to = today.toISOString().slice(0, 10);
    if (range === "7d") return { from: new Date(today - 7 * 86400000).toISOString().slice(0, 10), to };
    if (range === "30d") return { from: new Date(today - 30 * 86400000).toISOString().slice(0, 10), to };
    if (range === "90d") return { from: new Date(today - 90 * 86400000).toISOString().slice(0, 10), to };
    if (range === "year") return { from: `${today.getFullYear()}-01-01`, to };
    return { from: customFrom, to: customTo };
  };

  const { from, to } = getRange();
  const inRange = orders.filter(o => {
    if (!from && !to) return true;
    const d = (o.start || "").slice(0, 10);
    if (from && d < from) return false;
    if (to && d > to) return false;
    return true;
  });

  const completed = inRange.filter(o => ["active", "returned"].includes(o.status));
  const totalRev = completed.reduce((s, o) => s + (o.total || 0), 0);
  const totalOrders = completed.length;
  const avgOrder = totalOrders > 0 ? totalRev / totalOrders : 0;
  const totalDeposits = completed.filter(o => o.depPaid).reduce((s, o) => s + (o.dep || 0), 0);
  const totalPenalties = completed.reduce((s, o) => s + (o.penalty || 0), 0);
  const overdue = orders.filter(o => o.status === "active" && o.end && o.end.slice(0, 10) < today.toISOString().slice(0, 10));

  // Monthly revenue chart data
  const monthly = {};
  for (const o of completed) {
    const m = (o.start || "").slice(0, 7);
    if (!m) continue;
    if (!monthly[m]) monthly[m] = { month: m, revenue: 0, orders: 0, penalties: 0 };
    monthly[m].revenue += o.total || 0;
    monthly[m].orders++;
    monthly[m].penalties += o.penalty || 0;
  }
  const monthlyData = Object.values(monthly).sort((a, b) => a.month.localeCompare(b.month)).slice(-12);

  // Category breakdown
  const catRev = {};
  for (const o of completed) {
    for (const l of (o.lines || [])) {
      const item = items.find(i => i.id === l.iid);
      const cat = item?.cat || "Other";
      catRev[cat] = (catRev[cat] || 0) + (l.subtotal || 0);
    }
  }
  const catData = Object.entries(catRev).sort((a, b) => b[1] - a[1]).slice(0, 8);

  // Inventory utilization
  const itemUsage = items.map(item => {
    const rented = orders.filter(o => ["active", "returned"].includes(o.status) && (o.lines || []).some(l => l.iid === item.id)).length;
    return { name: item.name, rented, total: item.qty, utilPct: item.qty > 0 ? Math.round((item.qty - item.avail) / item.qty * 100) : 0 };
  }).sort((a, b) => b.rented - a.rented).slice(0, 10);

  const exportCSV = async (type) => {
    setExporting(type);
    const params = new URLSearchParams({ type });
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    try {
      const res = await fetch(`/api/reports/export?${params}`);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Export failed: " + e.message);
    }
    setExporting(null);
  };

  const BAR_MAX = Math.max(...monthlyData.map(d => d.revenue), 1);

  return (
    <div style={{ padding: 24, maxWidth: 1200 }}>
      <PageHeader title="Reports & Analytics" subtitle="Business performance overview">
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="secondary" sm onClick={() => exportCSV("orders")} disabled={!!exporting}>{exporting === "orders" ? "…" : "⬇ Orders"}</Btn>
          <Btn variant="secondary" sm onClick={() => exportCSV("customers")} disabled={!!exporting}>{exporting === "customers" ? "…" : "⬇ Customers"}</Btn>
          <Btn variant="secondary" sm onClick={() => exportCSV("inventory")} disabled={!!exporting}>{exporting === "inventory" ? "…" : "⬇ Inventory"}</Btn>
          <Btn variant="secondary" sm onClick={() => exportCSV("revenue")} disabled={!!exporting}>{exporting === "revenue" ? "…" : "⬇ Revenue"}</Btn>
        </div>
      </PageHeader>

      {/* Date range filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
        {["7d", "30d", "90d", "year", "custom"].map(r => (
          <button key={r} onClick={() => setRange(r)} style={{ padding: "6px 14px", borderRadius: 20, border: `2px solid ${range === r ? T.o : T.bdr}`, background: range === r ? T.oL : "#fff", color: range === r ? T.o : T.tMd, fontWeight: range === r ? 700 : 500, cursor: "pointer", fontSize: 12 }}>
            {r === "7d" ? "7 days" : r === "30d" ? "30 days" : r === "90d" ? "90 days" : r === "year" ? "This year" : "Custom"}
          </button>
        ))}
        {range === "custom" && (
          <>
            <FInp type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} style={{ width: 150 }} />
            <span style={{ color: T.tSm, fontSize: 13 }}>to</span>
            <FInp type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} style={{ width: 150 }} />
          </>
        )}
      </div>

      <TabBar tabs={["overview", "monthly", "inventory", "email_log"]} active={activeTab} onChange={setActiveTab} labels={{ overview: "Overview", monthly: "Revenue Chart", inventory: "Inventory", email_log: "Email Log" }} />

      {activeTab === "overview" && (
        <div>
          {/* KPI cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
            <KpiCard label="Total Revenue" value={fmt(totalRev)} sub={`${totalOrders} orders`} />
            <KpiCard label="Avg Order Value" value={fmt(avgOrder)} sub="Per completed order" />
            <KpiCard label="Deposits Collected" value={fmt(totalDeposits)} sub="Security deposits" />
            <KpiCard label="Late Penalties" value={fmt(totalPenalties)} sub="Penalty charges" />
            <KpiCard label="Overdue Now" value={overdue.length} sub="Active past return date" color={overdue.length > 0 ? T.red : undefined} />
            <KpiCard label="Total Customers" value={custs.length} sub="All time" />
          </div>

          {/* Category breakdown */}
          {catData.length > 0 && (
            <Card style={{ marginBottom: 20 }}>
              <p style={{ fontWeight: 700, fontSize: 14, margin: "0 0 16px" }}>Revenue by Category</p>
              {catData.map(([cat, rev]) => (
                <div key={cat} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600 }}>{cat}</span>
                    <span style={{ color: T.o, fontWeight: 700 }}>{fmt(rev)}</span>
                  </div>
                  <div style={{ background: T.bdr, borderRadius: 4, height: 8 }}>
                    <div style={{ background: T.o, height: 8, borderRadius: 4, width: `${Math.round(rev / Math.max(...catData.map(d => d[1]), 1) * 100)}%`, transition: "width 0.4s" }} />
                  </div>
                </div>
              ))}
            </Card>
          )}

          {/* Overdue list */}
          {overdue.length > 0 && (
            <Card>
              <p style={{ fontWeight: 700, fontSize: 14, margin: "0 0 12px", color: T.red }}>⚠️ Overdue Orders ({overdue.length})</p>
              {overdue.map(o => {
                const cust = custs.find(c => c.id === o.custId);
                const daysLate = Math.floor((today - new Date(o.end)) / 86400000);
                return (
                  <div key={o.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.bdr}` }}>
                    <div><p style={{ fontWeight: 600, margin: 0, fontSize: 13 }}>{o.num} — {cust?.name || "—"}</p><p style={{ fontSize: 11, color: T.red, margin: 0 }}>Due: {o.end} ({daysLate}d late)</p></div>
                    <span style={{ fontWeight: 700, color: T.o }}>{fmt(o.total)}</span>
                  </div>
                );
              })}
            </Card>
          )}
        </div>
      )}

      {activeTab === "monthly" && (
        <Card>
          <p style={{ fontWeight: 700, fontSize: 14, margin: "0 0 20px" }}>Monthly Revenue</p>
          {monthlyData.length === 0 ? (
            <p style={{ color: T.tSm, textAlign: "center", padding: 32 }}>No data in selected range</p>
          ) : (
            <div>
              {/* Bar chart */}
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 200, marginBottom: 8, overflowX: "auto" }}>
                {monthlyData.map(d => (
                  <div key={d.month} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "1 0 auto", minWidth: 50 }}>
                    <span style={{ fontSize: 10, color: T.tSm, marginBottom: 4, fontWeight: 600 }}>{fmt(d.revenue).replace("$", "")}</span>
                    <div style={{ width: "100%", background: T.o, borderRadius: "4px 4px 0 0", height: `${Math.round(d.revenue / BAR_MAX * 160)}px`, minHeight: 4, transition: "height 0.3s" }} />
                    <span style={{ fontSize: 10, color: T.tSm, marginTop: 4 }}>{d.month.slice(5)}</span>
                  </div>
                ))}
              </div>
              {/* Table */}
              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}>
                <thead><tr style={{ background: T.bg }}><TH>Month</TH><TH>Orders</TH><TH>Revenue</TH><TH>Penalties</TH></tr></thead>
                <tbody>
                  {monthlyData.map(d => (
                    <TR key={d.month}>
                      <TD>{d.month}</TD>
                      <TD>{d.orders}</TD>
                      <TD style={{ fontWeight: 600, color: T.o }}>{fmt(d.revenue)}</TD>
                      <TD style={{ color: d.penalties > 0 ? T.red : T.tSm }}>{d.penalties > 0 ? fmt(d.penalties) : "—"}</TD>
                    </TR>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {activeTab === "inventory" && (
        <Card>
          <p style={{ fontWeight: 700, fontSize: 14, margin: "0 0 16px" }}>Inventory Utilization (Top 10 by Rentals)</p>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ background: T.bg }}><TH>Item</TH><TH>Total Qty</TH><TH>Available</TH><TH>Rented</TH><TH>Utilization</TH></tr></thead>
            <tbody>
              {itemUsage.map(i => (
                <TR key={i.name}>
                  <TD>{i.name}</TD>
                  <TD>{i.total}</TD>
                  <TD>{items.find(it => it.name === i.name)?.avail ?? "—"}</TD>
                  <TD>{i.rented}</TD>
                  <TD>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, background: T.bdr, borderRadius: 4, height: 8 }}>
                        <div style={{ width: `${i.utilPct}%`, background: i.utilPct > 80 ? T.red : i.utilPct > 50 ? T.yel : T.green, height: 8, borderRadius: 4 }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, minWidth: 32 }}>{i.utilPct}%</span>
                    </div>
                  </TD>
                </TR>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {activeTab === "email_log" && (
        <Card>
          <p style={{ fontWeight: 700, fontSize: 14, margin: "0 0 16px" }}>Email Log</p>
          <p style={{ color: T.tSm, fontSize: 13 }}>Email log records are stored in the database. View via Supabase dashboard or export from the Reports API.</p>
        </Card>
      )}
    </div>
  );
}

// ============================================================
// SETTINGS COMPONENT
// ============================================================
function Settings({ settings, onSave, pricingRules, onSavePricingRule, onDeletePricingRule, customFields, onSaveCustomField, onDeleteCustomField, team, onInviteTeam, onUpdateTeamMember, activityLog, showToast }) {
  const [activeTab, setActiveTab] = useState("general");
  const [form, setForm] = useState({ ...settings });
  const [saving, setSaving] = useState(false);
  const fld = (k, v) => setForm(f => ({ ...f, [k]: v }));

  React.useEffect(() => { setForm({ ...settings }); }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    await onSave(form);
    setSaving(false);
    showToast("Settings saved", "success");
  };

  // Pricing rule state
  const [prModal, setPrModal] = useState(null);
  const [prForm, setPrForm] = useState({ name:"", type:"duration_discount", category:"", min_days:"", max_days:"", discount_pct:"", flat_daily_rate:"", start_date:"", end_date:"", active:true });
  const [prSaving, setPrSaving] = useState(false);

  // Custom field state
  const [cfModal, setCfModal] = useState(null);
  const [cfForm, setCfForm] = useState({ entity:"order", label:"", field_type:"text", options:"", required:false, active:true });
  const [cfSaving, setCfSaving] = useState(false);

  // Team invite state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("staff");
  const [inviting, setInviting] = useState(false);

  const openPrEdit = (r) => {
    if (r) {
      setPrModal(r.id);
      setPrForm({ name:r.name, type:r.type, category:r.category||"", min_days:r.min_days||"", max_days:r.max_days||"", discount_pct:r.discount_pct||"", flat_daily_rate:r.flat_daily_rate||"", start_date:r.start_date||"", end_date:r.end_date||"", active:r.active!==false });
    } else {
      setPrModal("new");
      setPrForm({ name:"", type:"duration_discount", category:"", min_days:"", max_days:"", discount_pct:"", flat_daily_rate:"", start_date:"", end_date:"", active:true });
    }
  };

  const handleSavePr = async () => {
    if (!prForm.name.trim()) return showToast("Name required", "error");
    setPrSaving(true);
    await onSavePricingRule({ ...prForm, id: prModal === "new" ? undefined : prModal });
    setPrSaving(false);
    setPrModal(null);
    showToast("Pricing rule saved", "success");
  };

  const openCfEdit = (f) => {
    if (f) {
      setCfModal(f.id);
      setCfForm({ entity:f.entity, label:f.label, field_type:f.field_type, options:(f.options||[]).join(", "), required:!!f.required, active:f.active!==false });
    } else {
      setCfModal("new");
      setCfForm({ entity:"order", label:"", field_type:"text", options:"", required:false, active:true });
    }
  };

  const handleSaveCf = async () => {
    if (!cfForm.label.trim()) return showToast("Label required", "error");
    setCfSaving(true);
    const opts = cfForm.options ? cfForm.options.split(",").map(s => s.trim()).filter(Boolean) : [];
    await onSaveCustomField({ ...cfForm, options: opts, id: cfModal === "new" ? undefined : cfModal });
    setCfSaving(false);
    setCfModal(null);
    showToast("Custom field saved", "success");
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return showToast("Email required", "error");
    setInviting(true);
    await onInviteTeam(inviteEmail, inviteRole);
    setInviting(false);
    setInviteEmail("");
    showToast("Invite sent", "success");
  };

  return (
    <div style={{ padding: 24, maxWidth: 1000 }}>
      <PageHeader title="Settings" subtitle="Configure your rental business">
        {activeTab === "general" && <Btn onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save Changes"}</Btn>}
      </PageHeader>

      <TabBar tabs={["general","pricing","custom_fields","team","integrations","notifications"]} active={activeTab} onChange={setActiveTab} labels={{ general:"General", pricing:"Pricing Rules", custom_fields:"Custom Fields", team:"Team", integrations:"Integrations", notifications:"Notifications" }} />

      {/* GENERAL TAB */}
      {activeTab === "general" && (
        <Card>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ gridColumn: "1/-1" }}><FLabel>Business Name</FLabel><FInp value={form.bizName||""} onChange={e => fld("bizName", e.target.value)} /></div>
            <div><FLabel>Phone</FLabel><FInp value={form.phone||""} onChange={e => fld("phone", e.target.value)} /></div>
            <div><FLabel>Email</FLabel><FInp type="email" value={form.email||""} onChange={e => fld("email", e.target.value)} /></div>
            <div style={{ gridColumn: "1/-1" }}><FLabel>Address</FLabel><FTxt value={form.address||""} onChange={e => fld("address", e.target.value)} rows={2} /></div>
            <div><FLabel>Currency Symbol</FLabel><FInp value={form.currency||"$"} onChange={e => fld("currency", e.target.value)} style={{ width: 80 }} /></div>
            <div><FLabel>Date Format</FLabel><FSel value={form.dateFormat||"MM/DD/YYYY"} onChange={e => fld("dateFormat", e.target.value)}>{["MM/DD/YYYY","DD/MM/YYYY","YYYY-MM-DD"].map(d => <option key={d}>{d}</option>)}</FSel></div>
            <div><FLabel>Tax Name (e.g. VAT)</FLabel><FInp value={form.taxName||""} onChange={e => fld("taxName", e.target.value)} placeholder="VAT" /></div>
            <div><FLabel>Tax % (0 = disabled)</FLabel><FInp type="number" min={0} max={100} value={form.taxPct||0} onChange={e => fld("taxPct", parseFloat(e.target.value)||0)} /></div>
            <div><FLabel>Default Rental Days</FLabel><FInp type="number" min={1} value={form.defaultDays||1} onChange={e => fld("defaultDays", parseInt(e.target.value)||1)} /></div>
            <div><FLabel>Late Fee / Day</FLabel><FInp type="number" min={0} value={form.lateFee||0} onChange={e => fld("lateFee", parseFloat(e.target.value)||0)} /></div>
          </div>
        </Card>
      )}

      {/* PRICING RULES TAB */}
      {activeTab === "pricing" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <Btn onClick={() => openPrEdit(null)}>+ Add Rule</Btn>
          </div>
          <Card padding={0}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr style={{ background: T.bg }}><TH>Name</TH><TH>Type</TH><TH>Applies To</TH><TH>Discount</TH><TH>Days</TH><TH>Active</TH><TH>Actions</TH></tr></thead>
              <tbody>
                {(pricingRules || []).map(r => (
                  <TR key={r.id}>
                    <TD><span style={{ fontWeight: 600 }}>{r.name}</span></TD>
                    <TD><Badge label={r.type.replace("_", " ")} color="blue" /></TD>
                    <TD><span style={{ fontSize: 12 }}>{r.category || r.item_id ? (r.category || "Specific item") : "All items"}</span></TD>
                    <TD>{r.discount_pct ? `${r.discount_pct}%` : r.flat_daily_rate ? `${fmt(r.flat_daily_rate)}/day flat` : "—"}</TD>
                    <TD><span style={{ fontSize: 12 }}>{r.min_days ? `≥${r.min_days}d` : ""}{r.max_days ? ` ≤${r.max_days}d` : ""}</span></TD>
                    <TD><span style={{ color: r.active ? T.green : T.red, fontWeight: 700, fontSize: 12 }}>{r.active ? "✓" : "✗"}</span></TD>
                    <TD>
                      <div style={{ display: "flex", gap: 4 }}>
                        <Btn variant="ghost" sm onClick={() => openPrEdit(r)}>Edit</Btn>
                        <Btn variant="danger" sm onClick={async () => { if(confirm("Delete rule?")) { await onDeletePricingRule(r.id); showToast("Rule deleted", "success"); } }}>Del</Btn>
                      </div>
                    </TD>
                  </TR>
                ))}
                {(pricingRules || []).length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", padding: 32, color: T.tSm, fontSize: 13 }}>No pricing rules yet. Add one to apply automatic discounts.</td></tr>}
              </tbody>
            </table>
          </Card>

          {prModal && (
            <Modal title={prModal === "new" ? "New Pricing Rule" : "Edit Pricing Rule"} onClose={() => setPrModal(null)} width={540}
              footer={<><Btn variant="ghost" onClick={() => setPrModal(null)}>Cancel</Btn><Btn onClick={handleSavePr} disabled={prSaving}>{prSaving ? "Saving…" : "Save Rule"}</Btn></>}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ gridColumn: "1/-1" }}><FLabel>Rule Name *</FLabel><FInp value={prForm.name} onChange={e => setPrForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Weekly Discount" /></div>
                <div><FLabel>Type</FLabel>
                  <FSel value={prForm.type} onChange={e => setPrForm(f => ({ ...f, type: e.target.value }))}>
                    <option value="duration_discount">Duration Discount</option>
                    <option value="seasonal">Seasonal</option>
                    <option value="flat_rate">Flat Rate</option>
                    <option value="minimum_days">Minimum Days</option>
                  </FSel>
                </div>
                <div><FLabel>Category (leave blank for all)</FLabel><FInp value={prForm.category} onChange={e => setPrForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. Dresses" /></div>
                {(prForm.type === "duration_discount" || prForm.type === "flat_rate" || prForm.type === "minimum_days") && (
                  <><div><FLabel>Min Days</FLabel><FInp type="number" value={prForm.min_days} onChange={e => setPrForm(f => ({ ...f, min_days: e.target.value }))} /></div>
                  <div><FLabel>Max Days</FLabel><FInp type="number" value={prForm.max_days} onChange={e => setPrForm(f => ({ ...f, max_days: e.target.value }))} /></div></>
                )}
                {(prForm.type === "duration_discount" || prForm.type === "seasonal") && (
                  <div style={{ gridColumn: "1/-1" }}><FLabel>Discount %</FLabel><FInp type="number" min={0} max={100} value={prForm.discount_pct} onChange={e => setPrForm(f => ({ ...f, discount_pct: e.target.value }))} /></div>
                )}
                {prForm.type === "flat_rate" && (
                  <div style={{ gridColumn: "1/-1" }}><FLabel>Flat Daily Rate</FLabel><FInp type="number" step="0.01" value={prForm.flat_daily_rate} onChange={e => setPrForm(f => ({ ...f, flat_daily_rate: e.target.value }))} /></div>
                )}
                {prForm.type === "seasonal" && (
                  <><div><FLabel>Start Date</FLabel><FInp type="date" value={prForm.start_date} onChange={e => setPrForm(f => ({ ...f, start_date: e.target.value }))} /></div>
                  <div><FLabel>End Date</FLabel><FInp type="date" value={prForm.end_date} onChange={e => setPrForm(f => ({ ...f, end_date: e.target.value }))} /></div></>
                )}
                <div style={{ gridColumn: "1/-1", display: "flex", alignItems: "center", gap: 10 }}>
                  <Toggle checked={prForm.active} onChange={v => setPrForm(f => ({ ...f, active: v }))}/><span style={{ fontSize: 13 }}>Rule is active</span>
                </div>
              </div>
            </Modal>
          )}
        </div>
      )}

      {/* CUSTOM FIELDS TAB */}
      {activeTab === "custom_fields" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <Btn onClick={() => openCfEdit(null)}>+ Add Field</Btn>
          </div>
          {["order", "item", "customer"].map(entity => {
            const fields = (customFields || []).filter(f => f.entity === entity);
            return (
              <div key={entity} style={{ marginBottom: 20 }}>
                <p style={{ fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.5px", color: T.tXs, margin: "0 0 8px" }}>{entity} fields ({fields.length})</p>
                <Card padding={0}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead><tr style={{ background: T.bg }}><TH>Label</TH><TH>Type</TH><TH>Required</TH><TH>Active</TH><TH>Actions</TH></tr></thead>
                    <tbody>
                      {fields.map(f => (
                        <TR key={f.id}>
                          <TD style={{ fontWeight: 600 }}>{f.label}</TD>
                          <TD><Badge label={f.field_type} color="blue" /></TD>
                          <TD><span style={{ color: f.required ? T.o : T.tSm, fontSize: 12 }}>{f.required ? "Yes" : "No"}</span></TD>
                          <TD><span style={{ color: f.active ? T.green : T.red, fontWeight: 700, fontSize: 12 }}>{f.active ? "✓" : "✗"}</span></TD>
                          <TD>
                            <div style={{ display: "flex", gap: 4 }}>
                              <Btn variant="ghost" sm onClick={() => openCfEdit(f)}>Edit</Btn>
                              <Btn variant="danger" sm onClick={async () => { if(confirm("Delete field?")) { await onDeleteCustomField(f.id); showToast("Field deleted", "success"); } }}>Del</Btn>
                            </div>
                          </TD>
                        </TR>
                      ))}
                      {fields.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center", padding: 20, color: T.tSm, fontSize: 12 }}>No custom fields for {entity}s yet</td></tr>}
                    </tbody>
                  </table>
                </Card>
              </div>
            );
          })}

          {cfModal && (
            <Modal title={cfModal === "new" ? "New Custom Field" : "Edit Custom Field"} onClose={() => setCfModal(null)} width={460}
              footer={<><Btn variant="ghost" onClick={() => setCfModal(null)}>Cancel</Btn><Btn onClick={handleSaveCf} disabled={cfSaving}>{cfSaving ? "Saving…" : "Save Field"}</Btn></>}>
              <FLabel>Entity</FLabel>
              <FSel value={cfForm.entity} onChange={e => setCfForm(f => ({ ...f, entity: e.target.value }))}>
                <option value="order">Order</option><option value="item">Item</option><option value="customer">Customer</option>
              </FSel>
              <FLabel style={{ marginTop: 12 }}>Label *</FLabel>
              <FInp value={cfForm.label} onChange={e => setCfForm(f => ({ ...f, label: e.target.value }))} placeholder="e.g. Event Type" />
              <FLabel style={{ marginTop: 12 }}>Field Type</FLabel>
              <FSel value={cfForm.field_type} onChange={e => setCfForm(f => ({ ...f, field_type: e.target.value }))}>
                {["text","number","select","checkbox","date","textarea"].map(t => <option key={t}>{t}</option>)}
              </FSel>
              {cfForm.field_type === "select" && (
                <><FLabel style={{ marginTop: 12 }}>Options (comma separated)</FLabel><FInp value={cfForm.options} onChange={e => setCfForm(f => ({ ...f, options: e.target.value }))} placeholder="Option 1, Option 2, Option 3" /></>
              )}
              <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
                <Toggle checked={cfForm.required} onChange={v => setCfForm(f => ({ ...f, required: v }))}/><span style={{ fontSize: 13 }}>Required field</span>
              </div>
              <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
                <Toggle checked={cfForm.active} onChange={v => setCfForm(f => ({ ...f, active: v }))}/><span style={{ fontSize: 13 }}>Active</span>
              </div>
            </Modal>
          )}
        </div>
      )}

      {/* TEAM TAB */}
      {activeTab === "team" && (
        <div>
          <Card style={{ marginBottom: 20 }}>
            <p style={{ fontWeight: 700, fontSize: 14, margin: "0 0 12px" }}>Invite Team Member</p>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <div style={{ flex: 1 }}><FLabel>Email</FLabel><FInp type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="staff@example.com" /></div>
              <div style={{ width: 140 }}><FLabel>Role</FLabel><FSel value={inviteRole} onChange={e => setInviteRole(e.target.value)}><option value="staff">Staff</option><option value="admin">Admin</option><option value="viewer">Viewer</option></FSel></div>
              <Btn onClick={handleInvite} disabled={inviting}>{inviting ? "Sending…" : "Send Invite"}</Btn>
            </div>
          </Card>

          <Card padding={0} style={{ marginBottom: 20 }}>
            <p style={{ padding: "12px 16px", fontWeight: 700, fontSize: 14, margin: 0, borderBottom: `1px solid ${T.bdr}` }}>Team Members</p>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr style={{ background: T.bg }}><TH>Name</TH><TH>Email</TH><TH>Role</TH><TH>Status</TH></tr></thead>
              <tbody>
                {(team || []).map(m => (
                  <TR key={m.id}>
                    <TD style={{ fontWeight: 600 }}>{m.full_name || m.email?.split("@")[0]}</TD>
                    <TD style={{ fontSize: 12 }}>{m.email}</TD>
                    <TD><Badge label={m.role || "staff"} color={m.role === "admin" ? "orange" : "blue"} /></TD>
                    <TD><span style={{ color: m.active !== false ? T.green : T.red, fontSize: 12, fontWeight: 700 }}>{m.active !== false ? "Active" : "Inactive"}</span></TD>
                  </TR>
                ))}
                {(team || []).length === 0 && <tr><td colSpan={4} style={{ textAlign: "center", padding: 24, color: T.tSm, fontSize: 13 }}>No team members yet</td></tr>}
              </tbody>
            </table>
          </Card>

          <Card>
            <p style={{ fontWeight: 700, fontSize: 14, margin: "0 0 12px" }}>Recent Activity</p>
            {(activityLog || []).slice(0, 20).map(a => (
              <div key={a.id} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${T.bdr}` }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{a.description || a.action}</span>
                  {a.entity_type && <span style={{ fontSize: 11, color: T.tSm }}> · {a.entity_type}</span>}
                </div>
                <span style={{ fontSize: 11, color: T.tSm }}>{a.created_at?.slice(0, 16).replace("T", " ")}</span>
              </div>
            ))}
            {(activityLog || []).length === 0 && <p style={{ color: T.tSm, fontSize: 13, textAlign: "center", padding: 16 }}>No activity recorded yet</p>}
          </Card>
        </div>
      )}

      {/* INTEGRATIONS TAB */}
      {activeTab === "integrations" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { key: "resend_api_key", label: "Resend API Key", icon: "✉️", desc: "Required for sending email notifications. Get your key at resend.com", type: "password", placeholder: "re_..." },
            { key: "notification_email", label: "Notification Email", icon: "📧", desc: "Receive booking and alert notifications at this address", type: "email", placeholder: "you@example.com" },
            { key: "ga4_id", label: "Google Analytics 4 ID", icon: "📊", desc: "Track visitor analytics (Measurement ID from GA4)", type: "text", placeholder: "G-XXXXXXXXXX" },
            { key: "meta_pixel_id", label: "Meta Pixel ID", icon: "📘", desc: "Facebook/Instagram conversion tracking", type: "text", placeholder: "1234567890" },
            { key: "zapier_webhook", label: "Zapier Webhook URL", icon: "⚡", desc: "Trigger Zapier automations when orders are created", type: "url", placeholder: "https://hooks.zapier.com/..." },
            { key: "mailchimp_api_key", label: "Mailchimp API Key", icon: "🐵", desc: "Sync customers to Mailchimp mailing list", type: "password", placeholder: "abc123-us1" },
          ].map(({ key, label, icon, desc, type, placeholder }) => (
            <Card key={key}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, margin: "0 0 2px" }}>{icon} {label}</p>
                  <p style={{ fontSize: 12, color: T.tSm, margin: "0 0 10px" }}>{desc}</p>
                  <FInp type={type} value={form[key] || ""} onChange={e => fld(key, e.target.value)} placeholder={placeholder} />
                </div>
              </div>
            </Card>
          ))}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Btn onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save Integrations"}</Btn>
          </div>
        </div>
      )}

      {/* NOTIFICATIONS TAB */}
      {activeTab === "notifications" && (
        <Card>
          <p style={{ fontWeight: 700, fontSize: 14, margin: "0 0 16px" }}>Email Notification Triggers</p>
          {[
            { key: "notifyBooking", label: "Booking Confirmation", desc: "Send confirmation email when a new order is created" },
            { key: "notifyReminder", label: "24h Pickup Reminder", desc: "Remind customer the day before pickup" },
            { key: "notifyReturn", label: "Return Due Reminder", desc: "Remind customer when return is coming up" },
            { key: "notifyOverdue", label: "Overdue Notice", desc: "Alert customer when order is past return date" },
          ].map(({ key, label, desc }) => (
            <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${T.bdr}` }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>{label}</p>
                <p style={{ fontSize: 12, color: T.tSm, margin: "2px 0 0" }}>{desc}</p>
              </div>
              <Toggle checked={!!form[key]} onChange={v => fld(key, v)} />
            </div>
          ))}
          <div style={{ marginTop: 16 }}>
            <Btn onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save Notification Settings"}</Btn>
          </div>
        </Card>
      )}
    </div>
  );
}

// ============================================================
// MAIN APP COMPONENT
// ============================================================
const NAV_ITEMS = [
  { id: "dashboard", icon: "🏠", label: "Dashboard" },
  { id: "orders", icon: "📋", label: "Orders" },
  { id: "inventory", icon: "👗", label: "Inventory" },
  { id: "customers", icon: "👥", label: "Customers" },
  { id: "washing", icon: "🫧", label: "Washing" },
  { id: "calendar", icon: "📅", label: "Calendar" },
  { id: "documents", icon: "🖨️", label: "Documents" },
  { id: "reports", icon: "📊", label: "Reports" },
  { id: "settings", icon: "⚙️", label: "Settings" },
];

function App() {
  const [page, setPage] = useState("dashboard");
  const [items, setItems] = useState([]);
  const [custs, setCusts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [wash, setWash] = useState([]);
  const [settings, setSettings] = useState({ bizName: "Fabb.booking", currency: "$", defaultDays: 1 });
  const [pricingRules, setPricingRules] = useState([]);
  const [customFields, setCustomFields] = useState([]);
  const [team, setTeam] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const showToast = (msg, type = "info") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  // ── Supabase data fetching ──────────────────────────────────
  const fetchAll = async () => {
    if (!sb) { setLoading(false); return; }
    try {
      const [
        { data: iData },
        { data: cData },
        { data: oData },
        { data: wData },
        { data: sData },
        { data: lData },
        { data: prData },
        { data: cfData },
        { data: teamData },
        { data: alData },
      ] = await Promise.all([
        sb.from("items").select("*").order("created_at", { ascending: false }),
        sb.from("customers").select("*").order("created_at", { ascending: false }),
        sb.from("orders_with_customer").select("*").order("created_at", { ascending: false }),
        sb.from("wash_entries").select("*").order("created_at", { ascending: false }),
        sb.from("settings").select("*").single(),
        sb.from("order_lines").select("*"),
        sb.from("pricing_rules").select("*").order("created_at", { ascending: false }),
        sb.from("custom_fields").select("*").order("sort_order"),
        sb.from("profiles").select("*").order("created_at", { ascending: false }),
        sb.from("activity_log").select("*").order("created_at", { ascending: false }).limit(100),
      ]);

      const linesByOrder = {};
      for (const l of (lData || [])) {
        if (!linesByOrder[l.order_id]) linesByOrder[l.order_id] = [];
        linesByOrder[l.order_id].push(l);
      }

      setItems((iData || []).map(normItem));
      setCusts((cData || []).map(normCust));
      setOrders((oData || []).map(o => normOrder(o, linesByOrder[o.id] || [])));
      setWash((wData || []).map(normWash));
      if (sData) setSettings(normSettings(sData));
      setPricingRules(prData || []);
      setCustomFields(cfData || []);
      setTeam(teamData || []);
      setActivityLog(alData || []);
    } catch (e) {
      console.error("Error loading data:", e);
    }
    setLoading(false);
  };

  React.useEffect(() => { fetchAll(); }, []);

  // Real-time subscription for orders
  React.useEffect(() => {
    if (!sb) return;
    const channel = sb.channel("realtime-all")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => fetchAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "wash_entries" }, () => fetchAll())
      .subscribe();
    return () => { sb.removeChannel(channel); };
  }, []);

  // ── CRUD handlers ───────────────────────────────────────────

  // ITEMS
  const handleSaveItem = async (form) => {
    if (!sb) return;
    const d = denormItem(form);
    if (form.id) {
      const { error } = await sb.from("items").update(d).eq("id", form.id);
      if (error) { showToast("Error saving item: " + error.message, "error"); return; }
      setItems(items.map(i => i.id === form.id ? { ...i, ...normItem({ ...d, id: form.id }) } : i));
    } else {
      const { data, error } = await sb.from("items").insert({ ...d, available: d.qty }).select().single();
      if (error) { showToast("Error creating item: " + error.message, "error"); return; }
      setItems([normItem(data), ...items]);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!sb) return;
    const { error } = await sb.from("items").update({ status: "archived" }).eq("id", id);
    if (!error) setItems(items.filter(i => i.id !== id));
  };

  // CUSTOMERS
  const handleSaveCustomer = async (form) => {
    if (!sb) return;
    const d = denormCust(form);
    if (form.id) {
      const { error } = await sb.from("customers").update(d).eq("id", form.id);
      if (error) { showToast("Error saving customer: " + error.message, "error"); return; }
      setCusts(custs.map(c => c.id === form.id ? { ...c, ...normCust({ ...d, id: form.id }) } : c));
    } else {
      const { data, error } = await sb.from("customers").insert(d).select().single();
      if (error) { showToast("Error creating customer: " + error.message, "error"); return; }
      setCusts([normCust(data), ...custs]);
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (!sb) return;
    await sb.from("customers").delete().eq("id", id);
    setCusts(custs.filter(c => c.id !== id));
  };

  // ORDERS
  const handleSaveOrder = async (form, lines) => {
    if (!sb) return;
    let custId = form.custId;
    // If new customer object passed
    if (form.newCust) {
      const { data: nc } = await sb.from("customers").insert(denormCust(form.newCust)).select().single();
      if (nc) { custId = nc.id; setCusts([normCust(nc), ...custs]); }
    }

    const d = denormOrder(form, custId);
    let orderId = form.id;

    if (form.id) {
      const { error } = await sb.from("orders").update(d).eq("id", form.id);
      if (error) { showToast("Error saving order: " + error.message, "error"); return; }
    } else {
      // Generate order number
      const num = `ORD-${Date.now().toString(36).toUpperCase()}`;
      const { data: newOrd, error } = await sb.from("orders").insert({ ...d, order_number: num }).select().single();
      if (error) { showToast("Error creating order: " + error.message, "error"); return; }
      orderId = newOrd.id;
    }

    // Replace order lines
    if (lines !== undefined) {
      await sb.from("order_lines").delete().eq("order_id", orderId);
      if (lines.length > 0) {
        await sb.from("order_lines").insert(lines.map(l => denormLine(l, orderId)));
      }
    }

    await fetchAll();
  };

  const handleUpdateOrderStatus = async (id, status) => {
    if (!sb) return;
    await sb.from("orders").update({ status }).eq("id", id);
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
  };

  const handleDeleteOrder = async (id) => {
    if (!sb) return;
    await sb.from("order_lines").delete().eq("order_id", id);
    await sb.from("orders").delete().eq("id", id);
    setOrders(orders.filter(o => o.id !== id));
  };

  // WASHING
  const handleAddWash = async (form) => {
    if (!sb) return;
    const { data } = await sb.from("wash_entries").insert({ item_id: form.itemId, notes: form.notes, qty: form.qty || 1, status: "washing" }).select().single();
    if (data) setWash([normWash(data), ...wash]);
  };

  const handleUpdateWash = async (id, updates) => {
    if (!sb) return;
    await sb.from("wash_entries").update(updates).eq("id", id);
    setWash(wash.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  // SETTINGS
  const handleSaveSettings = async (form) => {
    if (!sb) return;
    const d = {
      biz_name: form.bizName, phone: form.phone, email: form.email, address: form.address,
      currency: form.currency, date_format: form.dateFormat, tax_name: form.taxName, tax_pct: form.taxPct,
      default_days: form.defaultDays, late_fee: form.lateFee,
      ga4_id: form.ga4_id, meta_pixel_id: form.meta_pixel_id, zapier_webhook: form.zapier_webhook,
      mailchimp_api_key: form.mailchimp_api_key, resend_api_key: form.resend_api_key,
      notification_email: form.notification_email,
      notify_booking: form.notifyBooking, notify_reminder: form.notifyReminder,
      notify_return: form.notifyReturn, notify_overdue: form.notifyOverdue,
    };
    await sb.from("settings").upsert(d);
    setSettings(form);
  };

  // PRICING RULES
  const handleSavePricingRule = async (form) => {
    if (!sb) return;
    const d = { name: form.name, type: form.type, category: form.category || null, min_days: form.min_days ? parseInt(form.min_days) : null, max_days: form.max_days ? parseInt(form.max_days) : null, discount_pct: form.discount_pct ? parseFloat(form.discount_pct) : null, flat_daily_rate: form.flat_daily_rate ? parseFloat(form.flat_daily_rate) : null, start_date: form.start_date || null, end_date: form.end_date || null, active: form.active };
    if (form.id) {
      await sb.from("pricing_rules").update(d).eq("id", form.id);
      setPricingRules(pricingRules.map(r => r.id === form.id ? { ...r, ...d } : r));
    } else {
      const { data } = await sb.from("pricing_rules").insert(d).select().single();
      if (data) setPricingRules([data, ...pricingRules]);
    }
  };

  const handleDeletePricingRule = async (id) => {
    if (!sb) return;
    await sb.from("pricing_rules").delete().eq("id", id);
    setPricingRules(pricingRules.filter(r => r.id !== id));
  };

  // CUSTOM FIELDS
  const handleSaveCustomField = async (form) => {
    if (!sb) return;
    const d = { entity: form.entity, label: form.label, field_type: form.field_type, options: form.options || [], required: !!form.required, active: form.active };
    if (form.id) {
      await sb.from("custom_fields").update(d).eq("id", form.id);
      setCustomFields(customFields.map(f => f.id === form.id ? { ...f, ...d } : f));
    } else {
      const { data } = await sb.from("custom_fields").insert(d).select().single();
      if (data) setCustomFields([...customFields, data]);
    }
  };

  const handleDeleteCustomField = async (id) => {
    if (!sb) return;
    await sb.from("custom_fields").delete().eq("id", id);
    setCustomFields(customFields.filter(f => f.id !== id));
  };

  // TEAM
  const handleInviteTeam = async (email, role) => {
    if (!sb) return;
    // In a real implementation, this would send an invite via Supabase Auth Admin
    // For now, just show a toast
    showToast(`Invite sent to ${email} as ${role}`, "success");
  };

  // EMAIL
  const handleSendEmail = async (cust) => {
    if (!cust?.email) return showToast("Customer has no email address", "error");
    // Trigger email send - this is handled per order in the Orders component
    showToast("Use the Send Email button in order details", "info");
  };

  // ── Render ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", flexDirection: "column", gap: 16, background: T.bg }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", border: `4px solid ${T.oL}`, borderTopColor: T.o, animation: "spin 0.8s linear infinite" }} />
        <p style={{ color: T.tMd, fontWeight: 600, fontSize: 15 }}>Loading Fabb.booking…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const pageProps = { items, custs, orders, wash, settings, pricingRules, customFields, team, activityLog, showToast };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", fontFamily: "'Inter', 'Segoe UI', sans-serif", background: T.bg }}>
      {/* Sidebar */}
      <div style={{ width: sidebarOpen ? 220 : 60, background: "#1a1a2e", display: "flex", flexDirection: "column", transition: "width 0.2s", flexShrink: 0, overflow: "hidden" }}>
        {/* Logo */}
        <div style={{ padding: sidebarOpen ? "20px 16px 16px" : "20px 12px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: T.o, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>F</div>
          {sidebarOpen && <div><p style={{ color: "#fff", fontWeight: 800, fontSize: 15, margin: 0 }}>Fabb.booking</p><p style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, margin: 0 }}>Rental Management</p></div>}
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: "10px 0", overflowY: "auto" }}>
          {NAV_ITEMS.map(({ id, icon, label }) => {
            const active = page === id;
            return (
              <button key={id} onClick={() => setPage(id)} title={!sidebarOpen ? label : undefined} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: sidebarOpen ? "10px 16px" : "10px 0", justifyContent: sidebarOpen ? "flex-start" : "center", background: active ? "rgba(255,107,53,0.15)" : "transparent", border: "none", color: active ? T.o : "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 13, fontWeight: active ? 700 : 500, transition: "all 0.15s", borderLeft: active ? `3px solid ${T.o}` : "3px solid transparent", fontFamily: "inherit" }}>
                <span style={{ fontSize: 16 }}>{icon}</span>
                {sidebarOpen && <span>{label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Sidebar toggle + user */}
        <div style={{ padding: sidebarOpen ? "12px 16px" : "12px 0", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: sidebarOpen ? "space-between" : "center" }}>
          {sidebarOpen && <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, margin: 0 }}>{settings?.bizName || "Fabb.booking"}</p>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 16, padding: 4 }} title="Toggle sidebar">
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflowY: "auto", position: "relative" }}>
        {page === "dashboard" && <Dashboard {...pageProps} onPage={setPage} onSaveOrder={handleSaveOrder} onUpdateStatus={handleUpdateOrderStatus} onDeleteOrder={handleDeleteOrder} />}
        {page === "inventory" && <Inventory {...pageProps} onSave={handleSaveItem} onDelete={handleDeleteItem} />}
        {page === "orders" && <Orders {...pageProps} onSave={handleSaveOrder} onUpdateStatus={handleUpdateOrderStatus} onDeleteOrder={handleDeleteOrder} />}
        {page === "customers" && <Customers {...pageProps} onSave={handleSaveCustomer} onDelete={handleDeleteCustomer} onSendEmail={handleSendEmail} />}
        {page === "washing" && <Washing {...pageProps} onUpdate={handleUpdateWash} onAdd={handleAddWash} />}
        {page === "calendar" && <Calendar {...pageProps} />}
        {page === "documents" && <Documents {...pageProps} />}
        {page === "reports" && <Reports {...pageProps} />}
        {page === "settings" && (
          <Settings
            {...pageProps}
            onSave={handleSaveSettings}
            onSavePricingRule={handleSavePricingRule}
            onDeletePricingRule={handleDeletePricingRule}
            onSaveCustomField={handleSaveCustomField}
            onDeleteCustomField={handleDeleteCustomField}
            onInviteTeam={handleInviteTeam}
            onUpdateTeamMember={() => {}}
          />
        )}
      </div>

      {/* Toast notification */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default App;
