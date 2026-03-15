import { useState, useRef } from "react";
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

/* ─── DESIGN TOKENS (Booqable Orange exact) ─────────────────── */
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
const PENALTY_RATE = 50; // ₹ per overdue day default
const MONTH_ABBR = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

/* ─── SEED DATA ──────────────────────────────────────────────── */
const SEED_ITEMS = [
  {id:"I001",name:"Sherwani - Royal Blue",cat:"Sherwani",qty:5,avail:4,daily:500,deposit:2000,sku:"SH-001",desc:"Embroidered royal blue sherwani",sizes:"S,M,L,XL,XXL",altNotes:"",status:"active"},
  {id:"I002",name:"Achkan - Cream White",cat:"Achkan",qty:4,avail:3,daily:450,deposit:1500,sku:"AK-002",desc:"Ivory cream achkan with churidar",sizes:"S,M,L,XL",altNotes:"",status:"active"},
  {id:"I003",name:"3-Piece Suit - Black",cat:"Suit",qty:8,avail:6,daily:400,deposit:1200,sku:"SU-003",desc:"Classic black 3-piece suit",sizes:"36,38,40,42,44",altNotes:"",status:"active"},
  {id:"I004",name:"Designer Kurtha Set",cat:"Kurtha",qty:10,avail:8,daily:200,deposit:600,sku:"KU-004",desc:"Cotton designer kurtha pyjama set",sizes:"S,M,L,XL,XXL",altNotes:"",status:"active"},
  {id:"I005",name:"Loafer Shoes - Brown",cat:"Loafer",qty:6,avail:5,daily:150,deposit:400,sku:"LF-005",desc:"Formal brown loafer shoes",sizes:"7,8,9,10,11",altNotes:"",status:"active"},
  {id:"I006",name:"Indo-Western Jacket",cat:"Indo-Western",qty:4,avail:3,daily:350,deposit:1000,sku:"IW-006",desc:"Fusion indo-western jacket set",sizes:"S,M,L,XL",altNotes:"",status:"active"},
  {id:"I007",name:"Bridal Lehenga - Red",cat:"Bridal",qty:3,avail:2,daily:800,deposit:3000,sku:"BR-007",desc:"Heavy bridal lehenga choli dupatta",sizes:"S,M,L",altNotes:"Delicate embroidery - handle with care",status:"active"},
  {id:"I008",name:"Kids Sherwa Set",cat:"Kids Wear",qty:6,avail:5,daily:150,deposit:400,sku:"KD-008",desc:"Kids festive sherwa pyjama 3-12 yrs",sizes:"3Y,5Y,7Y,9Y,11Y",altNotes:"",status:"active"},
];
const SEED_CUSTS = [
  {id:"C001",name:"Rahul Sharma",phone:"+91 98200 11111",phone2:"+91 91234 22222",phone2type:"WhatsApp",phone3:"",phone3type:"Email",email:"rahul@example.com",company:"",address:"12 MG Road, Palakkad",city:"Palakkad",state:"Kerala",idType:"Aadhaar Card",idNum:"4321 8765 1234",idExpiry:"",idPhoto:"",notes:"Regular customer",joined:"2024-01-15"},
  {id:"C002",name:"Arun Kumar",phone:"+91 99887 33333",phone2:"",phone2type:"Email",phone3:"",phone3type:"Phone",email:"arun@gmail.com",company:"Kumar Textiles",address:"56 Bazaar St, Palakkad",city:"Palakkad",state:"Kerala",idType:"Voter ID",idNum:"KL/09/345/678",idExpiry:"",idPhoto:"",notes:"",joined:"2024-05-18"},
  {id:"C003",name:"Priya Nair",phone:"+91 97600 44444",phone2:"+91 97600 44445",phone2type:"WhatsApp",phone3:"priya@nair.com",phone3type:"Email",email:"priya@nair.com",company:"",address:"8 Temple St, Thrissur",city:"Thrissur",state:"Kerala",idType:"Passport",idNum:"J1234567",idExpiry:"2027-06-30",idPhoto:"",notes:"Bridal event customer",joined:"2024-08-01"},
  {id:"C004",name:"Suresh Pillai",phone:"+91 96500 55555",phone2:"",phone2type:"WhatsApp",phone3:"",phone3type:"Email",email:"",company:"",address:"101 Coimbatore Rd, Palakkad",city:"Palakkad",state:"Kerala",idType:"Driver's License",idNum:"KL0120210045",idExpiry:"2028-01-04",idPhoto:"",notes:"",joined:"2025-01-05"},
];
const SEED_ORDERS = [
  {id:"O001",num:"O-1001",custId:"C001",lines:[{iid:"I001",name:"Sherwani - Royal Blue",qty:1,daily:500,days:3,subtotal:1500,altNote:"Alter sleeve length by 1 inch"}],start:"2026-03-14",end:"2026-03-17",status:"active",discount:0,discountType:"flat",penalty:0,penaltyPaid:false,dep:300,depMethod:"Cash",depPaid:true,depRef:"",subtotal:1500,total:1500,paid:1800,notes:"Wedding on 16th March",createdAt:"2026-03-10"},
  {id:"O002",num:"O-1002",custId:"C002",lines:[{iid:"I003",name:"3-Piece Suit - Black",qty:1,daily:400,days:2,subtotal:800,altNote:""},{iid:"I005",name:"Loafer Shoes - Brown",qty:1,daily:150,days:2,subtotal:300,altNote:""}],start:"2026-03-13",end:"2026-03-15",status:"active",discount:50,discountType:"flat",penalty:0,penaltyPaid:false,dep:220,depMethod:"UPI",depPaid:true,depRef:"UPI-8821",subtotal:1100,total:1050,paid:1270,notes:"",createdAt:"2026-03-11"},
  {id:"O003",num:"O-1003",custId:"C003",lines:[{iid:"I007",name:"Bridal Lehenga - Red",qty:1,daily:800,days:2,subtotal:1600,altNote:"Blouse stitching required"}],start:"2026-03-18",end:"2026-03-20",status:"reserved",discount:0,discountType:"flat",penalty:0,penaltyPaid:false,dep:320,depMethod:"Bank Transfer",depPaid:false,depRef:"",subtotal:1600,total:1600,paid:0,notes:"Bridal event - handle carefully",createdAt:"2026-03-12"},
  {id:"O004",num:"O-1004",custId:"C004",lines:[{iid:"I002",name:"Achkan - Cream White",qty:1,daily:450,days:2,subtotal:900,altNote:""}],start:"2026-03-10",end:"2026-03-12",status:"returned",discount:100,discountType:"flat",penalty:0,penaltyPaid:false,dep:160,depMethod:"Cash",depPaid:true,depRef:"",subtotal:900,total:800,paid:960,notes:"",createdAt:"2026-03-08"},
  {id:"O005",num:"Q-1005",custId:"C001",lines:[{iid:"I006",name:"Indo-Western Jacket",qty:1,daily:350,days:1,subtotal:350,altNote:""},{iid:"I004",name:"Designer Kurtha Set",qty:2,daily:200,days:1,subtotal:400,altNote:""}],start:"2026-03-22",end:"2026-03-23",status:"concept",discount:0,discountType:"flat",penalty:0,penaltyPaid:false,dep:150,depMethod:"",depPaid:false,depRef:"",subtotal:750,total:750,paid:0,notes:"Engagement function",createdAt:"2026-03-13"},
];
const SEED_WASH = [
  {id:"W001",oid:"O004",iid:"I002",name:"Achkan - Cream White",cust:"Suresh Pillai",returned:"2026-03-12",stage:"Ironing",staff:"Seema",notes:"Dry clean only"},
  {id:"W002",oid:"O002",iid:"I003",name:"3-Piece Suit - Black",cust:"Arun Kumar",returned:"2026-03-15",stage:"Pending Wash",staff:"",notes:""},
  {id:"W003",oid:"O002",iid:"I005",name:"Loafer Shoes - Brown",cust:"Arun Kumar",returned:"2026-03-15",stage:"Ready",staff:"Ravi",notes:"Polish and shine"},
];
const SEED_SETTINGS = {
  bizName:"Ansil Dress House", phone:"+91 99999 00000", whatsapp:"+919999900000",
  address:"Main Bazaar, Palakkad", city:"Palakkad", state:"Kerala", pincode:"678001",
  email:"info@ansildresshouse.com", gst:"", penaltyRate:50, depositPct:20, taxRate:0,
  invoicePrefix:"INV", quotePrefix:"QUO",
  contractText:"1. Items must be returned in clean condition.\n2. Damage to items will be charged separately.\n3. Security deposit will be refunded on return of items in good condition.\n4. Late returns will attract a penalty of ₹50 per day per item.",
  staff:["Seema","Ravi","Mohan"],
};
const REV_DATA = [{m:"Sep",v:18000},{m:"Oct",v:24000},{m:"Nov",v:21000},{m:"Dec",v:35000},{m:"Jan",v:28000},{m:"Feb",v:31000},{m:"Mar",v:38000}];

let IDS = {item:9,cust:5,order:1006,wash:4};
const newId = (p) => { const n=IDS[p]++; return `${p[0].toUpperCase()}${String(n).padStart(3,"0")}`; };
const today = () => new Date().toISOString().slice(0,10);
const ddays = (a,b) => Math.max(1,Math.round((new Date(b)-new Date(a))/86400000));
const p2 = n => String(n).padStart(2,"0");
const fmt = n => `₹${Number(n||0).toLocaleString("en-IN")}`;
const overdueDays = (end) => {
  const t = new Date().setHours(0,0,0,0);
  const e = new Date(end).setHours(0,0,0,0);
  return Math.max(0, Math.round((t-e)/86400000));
};

/* ─── STORAGE (sessionStorage) ───────────────────────────────── */
function usePersist(key, seed) {
  const [val, setVal] = useState(() => {
    try { const s = sessionStorage.getItem("cr_"+key); return s ? JSON.parse(s) : seed; }
    catch { return seed; }
  });
  const set = (v) => {
    const next = typeof v === "function" ? v(val) : v;
    setVal(next);
    try { sessionStorage.setItem("cr_"+key, JSON.stringify(next)); } catch {}
  };
  return [val, set];
}

/* ─── ATOMS ──────────────────────────────────────────────────── */
const INP = {width:"100%",padding:"8px 11px",border:`1px solid ${T.bdr}`,borderRadius:6,fontSize:13,color:T.text,fontFamily:"inherit",outline:"none",background:"#fff",boxSizing:"border-box"};

function FLabel({text, required}) {
  return (
    <label style={{display:"block",fontSize:12,fontWeight:600,color:T.tMd,marginBottom:5}}>
      {text}{required && <span style={{color:T.red,marginLeft:2}}>*</span>}
    </label>
  );
}
function FInp({label,required,tip,...p}) {
  const [f,setF] = useState(false);
  return (
    <div style={{marginBottom:14}}>
      {label && <FLabel text={label} required={required} />}
      {tip && <p style={{fontSize:11,color:T.tXs,margin:"-3px 0 5px"}}>{tip}</p>}
      <input {...p} style={{...INP,borderColor:f?T.o:T.bdr,...p.style}}
        onFocus={()=>setF(true)} onBlur={()=>setF(false)} />
    </div>
  );
}
function FSel({label,required,children,...p}) {
  const [f,setF] = useState(false);
  return (
    <div style={{marginBottom:14}}>
      {label && <FLabel text={label} required={required} />}
      <select {...p} style={{...INP,cursor:"pointer",borderColor:f?T.o:T.bdr,...p.style}}
        onFocus={()=>setF(true)} onBlur={()=>setF(false)}>{children}</select>
    </div>
  );
}
function FTxt({label,...p}) {
  const [f,setF] = useState(false);
  return (
    <div style={{marginBottom:14}}>
      {label && <FLabel text={label} />}
      <textarea {...p} style={{...INP,minHeight:64,resize:"vertical",borderColor:f?T.o:T.bdr,...p.style}}
        onFocus={()=>setF(true)} onBlur={()=>setF(false)} />
    </div>
  );
}

function Btn({children, variant="primary", sm, full, ...p}) {
  const V = {
    primary: {bg:T.o,    cl:"#fff", bd:"none",                hov:T.oH},
    secondary:{bg:"#fff", cl:T.tMd, bd:`1px solid ${T.bdr}`,  hov:"#F9FAFB"},
    danger:  {bg:T.red,  cl:"#fff", bd:"none",                hov:"#B91C1C"},
    success: {bg:T.green,cl:"#fff", bd:"none",                hov:"#047857"},
    ghost:   {bg:"transparent",cl:T.tMd,bd:`1px solid ${T.bdr}`,hov:"#F9FAFB"},
    green:   {bg:T.green,cl:"#fff", bd:"none",                hov:"#047857"},
    wa:      {bg:"#25D366",cl:"#fff",bd:"none",               hov:"#1fad54"},
  };
  const s = V[variant]||V.primary;
  return (
    <button {...p} style={{background:s.bg,color:s.cl,border:s.bd,padding:sm?"5px 10px":"8px 16px",fontSize:sm?11:13,fontWeight:600,borderRadius:6,cursor:"pointer",fontFamily:"inherit",width:full?"100%":undefined,...p.style}}
      onMouseEnter={e=>e.currentTarget.style.background=s.hov}
      onMouseLeave={e=>e.currentTarget.style.background=s.bg}>
      {children}
    </button>
  );
}

function Card({children, padding, style}) {
  return (
    <div style={{background:T.white,border:`1px solid ${T.bdr}`,borderRadius:8,padding:padding!==undefined?padding:20,boxShadow:"0 1px 3px rgba(0,0,0,0.06)",...style}}>
      {children}
    </div>
  );
}

function StatusBadge({status}) {
  const m = STATUS_META[status]||STATUS_META.concept;
  return <span style={{background:m.bg,color:m.cl,border:`1px solid ${m.bd}`,padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:600}}>{m.label}</span>;
}
function WBadge({stage}) {
  return <span style={{background:WASH_BG[stage],color:WASH_COLOR[stage],padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:600}}>{stage}</span>;
}
function Badge({label, color}) {
  const M = {orange:{bg:T.oL,cl:T.o},green:{bg:T.gL,cl:T.green},blue:{bg:T.bL,cl:T.blue},gray:{bg:"#F1F5F9",cl:T.tSm},red:{bg:T.rL,cl:T.red},pink:{bg:T.pkL,cl:T.pink}};
  const s = M[color||"gray"];
  return <span style={{background:s.bg,color:s.cl,padding:"2px 8px",borderRadius:16,fontSize:11,fontWeight:600}}>{label}</span>;
}
function Toggle({checked, onChange}) {
  return (
    <div onClick={()=>onChange(!checked)} style={{width:40,height:22,background:checked?T.o:T.bdr,borderRadius:11,position:"relative",cursor:"pointer",flexShrink:0,transition:"background 0.2s"}}>
      <div style={{width:16,height:16,background:"#fff",borderRadius:"50%",position:"absolute",top:3,left:checked?20:3,transition:"left 0.2s",boxShadow:"0 1px 3px rgba(0,0,0,0.2)"}} />
    </div>
  );
}

function Modal({title, subtitle, onClose, children, footer, width}) {
  const mw = width||600;
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:1000,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"28px 16px",backdropFilter:"blur(2px)"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:10,width:"100%",maxWidth:mw,maxHeight:"93vh",boxShadow:"0 20px 60px rgba(0,0,0,0.2)",display:"flex",flexDirection:"column"}}>
        <div style={{padding:"16px 22px",borderBottom:`1px solid ${T.bdr}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div>
            <h3 style={{fontSize:16,fontWeight:700,color:T.text,margin:0}}>{title}</h3>
            {subtitle && <p style={{fontSize:12,color:T.tSm,margin:"2px 0 0"}}>{subtitle}</p>}
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:T.tSm,lineHeight:1}}>×</button>
        </div>
        <div style={{padding:22,overflowY:"auto",flex:1}}>{children}</div>
        {footer && <div style={{padding:"12px 22px",borderTop:`1px solid ${T.bdr}`,display:"flex",justifyContent:"flex-end",gap:8,flexShrink:0}}>{footer}</div>}
      </div>
    </div>
  );
}

function TabBar({tabs, active, onChange}) {
  return (
    <div style={{display:"flex",gap:1,borderBottom:`2px solid ${T.bdr}`,marginBottom:18}}>
      {tabs.map(t=>(
        <button key={t.id} onClick={()=>onChange(t.id)} style={{padding:"9px 16px",fontSize:13,fontWeight:600,border:"none",background:"transparent",cursor:"pointer",color:active===t.id?T.o:T.tSm,borderBottom:active===t.id?`2px solid ${T.o}`:"2px solid transparent",marginBottom:-2}}>
          {t.label}
          {t.count!==undefined && <span style={{marginLeft:5,background:active===t.id?T.oL:T.bg,color:active===t.id?T.o:T.tSm,padding:"1px 6px",borderRadius:10,fontSize:11,fontWeight:700}}>{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

function PageHeader({title, sub, actions}) {
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
      <div>
        <h1 style={{fontSize:22,fontWeight:700,color:T.text,margin:0}}>{title}</h1>
        {sub && <p style={{fontSize:13,color:T.tSm,margin:"4px 0 0"}}>{sub}</p>}
      </div>
      {actions && <div style={{display:"flex",gap:8,alignItems:"center"}}>{actions}</div>}
    </div>
  );
}

function SLabel({children, action}) {
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,paddingBottom:8,borderBottom:`1px solid ${T.bdr}`}}>
      <span style={{fontSize:11,fontWeight:700,color:T.tSm,textTransform:"uppercase",letterSpacing:"0.6px"}}>{children}</span>
      {action}
    </div>
  );
}

function KpiCard({label, value, icon, color, sub, onClick}) {
  return (
    <Card padding={18} style={{cursor:onClick?"pointer":"default"}} onClick={onClick}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <p style={{fontSize:11,color:T.tXs,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px",margin:"0 0 8px"}}>{label}</p>
          <p style={{fontSize:26,fontWeight:700,color:T.text,margin:0,lineHeight:1}}>{value}</p>
          {sub && <p style={{fontSize:11,color:color||T.tSm,margin:"5px 0 0"}}>{sub}</p>}
        </div>
        <div style={{width:40,height:40,borderRadius:8,background:`${color||T.o}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{icon}</div>
      </div>
    </Card>
  );
}

function IDUpload({url, onChange}) {
  const ref = useRef();
  function handleFile(e) {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = ev => onChange(ev.target.result);
    r.readAsDataURL(f);
  }
  return (
    <div style={{marginBottom:14}}>
      <FLabel text="ID Photo / Document Scan" />
      {url
        ? <div style={{position:"relative",borderRadius:6,overflow:"hidden",border:`1px solid ${T.bdr}`,maxWidth:280}}>
            <img src={url} alt="ID" style={{width:"100%",maxHeight:150,objectFit:"cover",display:"block"}} />
            <div style={{position:"absolute",top:6,right:6,display:"flex",gap:4}}>
              <button onClick={()=>ref.current.click()} style={{background:"rgba(0,0,0,0.6)",color:"#fff",border:"none",borderRadius:5,padding:"3px 8px",fontSize:10,cursor:"pointer"}}>Change</button>
              <button onClick={()=>onChange("")} style={{background:"rgba(220,38,38,0.8)",color:"#fff",border:"none",borderRadius:5,padding:"3px 8px",fontSize:10,cursor:"pointer"}}>Remove</button>
            </div>
          </div>
        : <div onClick={()=>ref.current.click()}
            style={{border:`2px dashed ${T.bdr2}`,borderRadius:6,padding:"20px 16px",textAlign:"center",cursor:"pointer",background:T.bg,transition:"all 0.2s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=T.o;e.currentTarget.style.background=T.oL;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=T.bdr2;e.currentTarget.style.background=T.bg;}}>
            <div style={{fontSize:26,marginBottom:6}}>📎</div>
            <p style={{fontSize:12,fontWeight:600,color:T.tMd,margin:0}}>Click to upload Aadhaar / ID</p>
            <p style={{fontSize:11,color:T.tSm,margin:"3px 0 0"}}>JPG, PNG or PDF</p>
          </div>}
      <input type="file" accept="image/*,.pdf" ref={ref} onChange={handleFile} style={{display:"none"}} />
    </div>
  );
}

/* ─── WHATSAPP BUTTON ────────────────────────────────────────── */
function WABtn({phone, message}) {
  const num = (phone||"").replace(/\D/g,"");
  const url = `https://wa.me/${num}${message?`?text=${encodeURIComponent(message)}`:""}`;
  return (
    <a href={url} target="_blank" rel="noreferrer"
      style={{display:"inline-flex",alignItems:"center",gap:5,background:"#25D366",color:"#fff",padding:"5px 11px",borderRadius:6,fontSize:12,fontWeight:600,textDecoration:"none"}}>
      <span style={{fontSize:14}}>💬</span> WhatsApp
    </a>
  );
}

/* ─── DEPOSIT PANEL ──────────────────────────────────────────── */
function DepPanel({form, setForm, subtotal}) {
  return (
    <div style={{background:"#F0FDF4",border:`1px solid ${T.gB}`,borderRadius:8,padding:16}}>
      <p style={{fontSize:12,fontWeight:700,color:"#166534",textTransform:"uppercase",letterSpacing:"0.5px",margin:"0 0 12px"}}>🔒 Security Deposit</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>
        <FInp label="Amount (₹)" type="number" value={form.dep||""} onChange={e=>setForm(p=>({...p,dep:+e.target.value}))} />
        <FSel label="Method" value={form.depMethod||""} onChange={e=>setForm(p=>({...p,depMethod:e.target.value}))}>
          <option value="">— Select —</option>
          {DEP_METHODS.map(m=><option key={m}>{m}</option>)}
        </FSel>
        <FInp label="UPI / Receipt Ref." value={form.depRef||""} onChange={e=>setForm(p=>({...p,depRef:e.target.value}))} placeholder="e.g. UPI-8821930" />
        <div style={{display:"flex",alignItems:"flex-end",paddingBottom:14}}>
          <label style={{display:"flex",alignItems:"center",gap:7,cursor:"pointer",fontSize:13,fontWeight:600,color:"#166534"}}>
            <input type="checkbox" checked={!!form.depPaid} onChange={e=>setForm(p=>({...p,depPaid:e.target.checked}))} style={{width:15,height:15,accentColor:T.green}} />
            Collected
          </label>
        </div>
      </div>
      {subtotal > 0 && (
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:2}}>
          <span style={{fontSize:11,color:"#166534",fontWeight:600,marginRight:2}}>Quick set:</span>
          {[10,15,20,25,30].map(pct => {
            const amt = Math.round(subtotal*pct/100);
            const active = form.dep===amt;
            return (
              <button key={pct} onClick={()=>setForm(p=>({...p,dep:amt}))}
                style={{padding:"3px 9px",borderRadius:14,fontSize:11,fontWeight:600,cursor:"pointer",border:`1px solid ${active?T.green:T.gB}`,background:active?T.green:"#fff",color:active?"#fff":"#166534"}}>
                {pct}% · {fmt(amt)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── DISCOUNT + PENALTY PANEL ───────────────────────────────── */
function DiscountPenaltyPanel({form, setForm}) {
  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>
      <div style={{background:T.oL,border:`1px solid ${T.oB}`,borderRadius:8,padding:14}}>
        <p style={{fontSize:12,fontWeight:700,color:T.o,textTransform:"uppercase",letterSpacing:"0.5px",margin:"0 0 10px"}}>🎁 Discount / Offer</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 8px"}}>
          <FInp label="Amount (₹)" type="number" value={form.discount||""} onChange={e=>setForm(p=>({...p,discount:+e.target.value}))} placeholder="0" />
          <FSel label="Type" value={form.discountType||"flat"} onChange={e=>setForm(p=>({...p,discountType:e.target.value}))}>
            <option value="flat">Flat ₹</option>
            <option value="pct">Percent %</option>
          </FSel>
        </div>
      </div>
      <div style={{background:T.rL,border:`1px solid ${T.rB}`,borderRadius:8,padding:14}}>
        <p style={{fontSize:12,fontWeight:700,color:T.red,textTransform:"uppercase",letterSpacing:"0.5px",margin:"0 0 10px"}}>⏰ Late Return Penalty</p>
        <FInp label="Penalty Amount (₹)" type="number" value={form.penalty||""} onChange={e=>setForm(p=>({...p,penalty:+e.target.value}))} placeholder="0" />
        <label style={{display:"flex",alignItems:"center",gap:7,cursor:"pointer",fontSize:12,fontWeight:600,color:T.red}}>
          <input type="checkbox" checked={!!form.penaltyPaid} onChange={e=>setForm(p=>({...p,penaltyPaid:e.target.checked}))} style={{width:14,height:14,accentColor:T.red}} />
          Penalty collected
        </label>
      </div>
    </div>
  );
}

/* ─── TABLE ──────────────────────────────────────────────────── */
function TH({label}) {
  return <th style={{padding:"9px 14px",fontSize:11,fontWeight:700,color:T.tXs,textAlign:"left",textTransform:"uppercase",letterSpacing:"0.5px",borderBottom:`1px solid ${T.bdr}`,background:T.bg,whiteSpace:"nowrap"}}>{label}</th>;
}
function TR({children, onClick}) {
  return (
    <tr onClick={onClick} style={{borderBottom:`1px solid ${T.bdr}`,cursor:onClick?"pointer":"default",transition:"background 0.1s"}}
      onMouseEnter={e=>e.currentTarget.style.background="#FAFBFC"} onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
      {children}
    </tr>
  );
}
function TD({children, style}) {
  return <td style={{padding:"12px 14px",fontSize:13,color:T.text,verticalAlign:"middle",...style}}>{children}</td>;
}

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════════════════ */
function Dashboard({orders, items, custs, wash, settings, setPage}) {
  const active   = orders.filter(o=>o.status==="active").length;
  const reserved = orders.filter(o=>o.status==="reserved").length;
  const overdue  = orders.filter(o=>o.status==="active" && o.end < today()).length;
  const revenue  = orders.filter(o=>["active","returned"].includes(o.status)).reduce((s,o)=>s+o.total,0);
  const deposits = orders.filter(o=>o.depPaid).reduce((s,o)=>s+(o.dep||0),0);
  const pendWash = wash.filter(w=>w.stage!=="In Stock").length;
  const pendDep  = orders.filter(o=>!o.depPaid && !["cancelled","returned"].includes(o.status)).length;

  const upcoming = [...orders].filter(o=>o.status==="reserved" && o.start>=today()).sort((a,b)=>a.start.localeCompare(b.start)).slice(0,5);
  const returning = [...orders].filter(o=>o.status==="active").sort((a,b)=>a.end.localeCompare(b.end)).slice(0,5);

  return (
    <div>
      <div style={{marginBottom:22}}>
        <h1 style={{fontSize:22,fontWeight:700,color:T.text,margin:0}}>{settings.bizName}</h1>
        <p style={{fontSize:13,color:T.tSm,margin:"4px 0 0"}}>Welcome back — cloth rental dashboard · {settings.city}, {settings.state}</p>
      </div>

      {overdue > 0 && (
        <div style={{background:T.rL,border:`1px solid ${T.rB}`,borderRadius:8,padding:"12px 16px",marginBottom:18,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:18}}>⚠️</span>
          <div>
            <p style={{fontWeight:700,color:T.red,margin:0,fontSize:13}}>{overdue} order{overdue>1?"s":""} overdue — late penalty may apply</p>
            <p style={{color:T.red,fontSize:12,margin:0}}>These rentals are past their return date. Each overdue day = {fmt(settings.penaltyRate)} penalty.</p>
          </div>
          <Btn variant="danger" sm style={{marginLeft:"auto"}} onClick={()=>setPage("orders")}>View Orders</Btn>
        </div>
      )}

      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:14,marginBottom:22}}>
        <KpiCard label="Active Orders"  value={active}        icon="📋" color={T.o}    sub={`${reserved} reserved`}        onClick={()=>setPage("orders")} />
        <KpiCard label="Revenue"        value={fmt(revenue)}  icon="💰" color={T.green} sub="All orders" />
        <KpiCard label="Deposits Held"  value={fmt(deposits)} icon="🔒" color={T.blue}  sub="Collected" />
        <KpiCard label="Pending Wash"   value={pendWash}      icon="🫧" color={T.pur}   sub="Garments in queue"             onClick={()=>setPage("washing")} />
        <KpiCard label="Dep. Pending"   value={pendDep}       icon="⏳" color={T.yel}   sub="Deposits due" />
      </div>

      {/* Revenue chart */}
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:16,marginBottom:20}}>
        <Card padding={20}>
          <p style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:16}}>Revenue — Last 7 Months (₹)</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={REV_DATA}>
              <defs>
                <linearGradient id="rGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={T.o} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={T.o} stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={T.bdr} vertical={false} />
              <XAxis dataKey="m" tick={{fontSize:11,fill:T.tXs}} axisLine={false} tickLine={false} />
              <YAxis tick={{fontSize:11,fill:T.tXs}} axisLine={false} tickLine={false} tickFormatter={v=>`₹${v/1000}k`} />
              <Tooltip formatter={v=>[fmt(v),"Revenue"]} contentStyle={{borderRadius:6,border:`1px solid ${T.bdr}`,fontSize:12}} />
              <Area type="monotone" dataKey="v" stroke={T.o} strokeWidth={2.5} fill="url(#rGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card padding={20}>
          <p style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:14}}>Order Status</p>
          {[{s:"active",l:"Active",c:T.green},{s:"reserved",l:"Reserved",c:T.blue},{s:"concept",l:"Quotes",c:T.tSm},{s:"returned",l:"Returned",c:T.tXs},{s:"cancelled",l:"Cancelled",c:T.red}].map(x=>{
            const cnt = orders.filter(o=>o.status===x.s).length;
            const pct = orders.length ? Math.round(cnt/orders.length*100) : 0;
            return (
              <div key={x.s} style={{marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
                  <span style={{color:x.c,fontWeight:600}}>{x.l}</span>
                  <span style={{color:T.tSm}}>{cnt}</span>
                </div>
                <div style={{height:5,background:T.bdr,borderRadius:3,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${pct}%`,background:x.c,borderRadius:3}} />
                </div>
              </div>
            );
          })}
        </Card>
      </div>

      {/* Upcoming + Returning */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
        <Card padding={0}>
          <div style={{padding:"12px 18px",borderBottom:`1px solid ${T.bdr}`}}>
            <p style={{fontSize:13,fontWeight:700,color:T.text,margin:0}}>📅 Upcoming Pickups</p>
          </div>
          {upcoming.length===0
            ? <div style={{padding:"24px 0",textAlign:"center",color:T.tSm,fontSize:12}}>No upcoming pickups</div>
            : upcoming.map(o=>{
              const c = custs.find(x=>x.id===o.custId);
              return (
                <div key={o.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 18px",borderBottom:`1px solid ${T.bdr}`}}>
                  <div>
                    <p style={{fontWeight:600,fontSize:13,margin:0}}>{c?c.name:"—"}</p>
                    <p style={{fontSize:11,color:T.tSm,margin:0}}>{o.num} · {o.lines.reduce((s,l)=>s+l.qty,0)} items</p>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <p style={{fontSize:12,fontWeight:700,color:T.o,margin:0}}>{o.start}</p>
                    <StatusBadge status={o.status} />
                  </div>
                </div>
              );
            })}
        </Card>

        <Card padding={0}>
          <div style={{padding:"12px 18px",borderBottom:`1px solid ${T.bdr}`}}>
            <p style={{fontSize:13,fontWeight:700,color:T.text,margin:0}}>🔄 Due for Return</p>
          </div>
          {returning.length===0
            ? <div style={{padding:"24px 0",textAlign:"center",color:T.tSm,fontSize:12}}>No active rentals</div>
            : returning.map(o=>{
              const c = custs.find(x=>x.id===o.custId);
              const late = o.end < today();
              const od = overdueDays(o.end);
              return (
                <div key={o.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 18px",borderBottom:`1px solid ${T.bdr}`}}>
                  <div>
                    <p style={{fontWeight:600,fontSize:13,margin:0}}>{c?c.name:"—"}</p>
                    <p style={{fontSize:11,color:T.tSm,margin:0}}>{o.num} · {fmt(o.total)}</p>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <p style={{fontSize:12,fontWeight:700,color:late?T.red:T.text,margin:0}}>{o.end}</p>
                    {late && <Badge label={`${od}d overdue`} color="red" />}
                  </div>
                </div>
              );
            })}
        </Card>
      </div>

      {/* Wash queue */}
      <Card padding={0}>
        <div style={{padding:"12px 18px",borderBottom:`1px solid ${T.bdr}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <p style={{fontSize:13,fontWeight:700,color:T.text,margin:0}}>🫧 Washing Queue</p>
          <Btn sm variant="secondary" onClick={()=>setPage("washing")}>View all</Btn>
        </div>
        {wash.filter(w=>w.stage!=="In Stock").slice(0,5).map(w=>(
          <div key={w.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 18px",borderBottom:`1px solid ${T.bdr}`}}>
            <div>
              <p style={{fontWeight:600,fontSize:13,margin:0}}>{w.name}</p>
              <p style={{fontSize:11,color:T.tSm,margin:0}}>{w.cust} · returned {w.returned}</p>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <WBadge stage={w.stage} />
              <p style={{fontSize:12,color:T.tSm,margin:0}}>{w.staff||"—"}</p>
            </div>
          </div>
        ))}
        {wash.filter(w=>w.stage!=="In Stock").length===0 && <div style={{padding:"24px 0",textAlign:"center",color:T.tSm,fontSize:12}}>All garments clean ✓</div>}
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   INVENTORY
═══════════════════════════════════════════════════════════════ */
function Inventory({items, setItems}) {
  const [cat,setCat]   = useState("All");
  const [q,setQ]       = useState("");
  const [modal,setModal] = useState(null);
  const [delId,setDelId] = useState(null);
  const [form,setForm] = useState({});
  const [fTab,setFTab] = useState("details");

  const rows = items.filter(i=>(cat==="All"||i.cat===cat) && i.name.toLowerCase().includes(q.toLowerCase()));

  function openNew() {
    setForm({name:"",cat:"Sherwani",qty:1,avail:1,daily:0,deposit:0,sku:"",desc:"",sizes:"",altNotes:"",status:"active"});
    setFTab("details");
    setModal("new");
  }
  function openEdit(item) { setForm({...item}); setFTab("details"); setModal("edit"); }
  function save() {
    if (!form.name) return;
    const p = {...form,qty:+form.qty,avail:+form.avail,daily:+form.daily,deposit:+form.deposit};
    if (modal==="new") setItems(prev=>[...prev,{...p,id:newId("item")}]);
    else setItems(prev=>prev.map(i=>i.id===form.id?p:i));
    setModal(null);
  }
  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  const allCats = ["All",...CATS.filter(c=>items.some(i=>i.cat===c))];

  return (
    <div>
      <PageHeader title="Inventory" sub={`${items.length} garments · ${items.reduce((s,i)=>s+i.avail,0)} available`}
        actions={<Btn onClick={openNew}>+ Add item</Btn>} />

      <Card padding={14} style={{marginBottom:16}}>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="🔍 Search items…"
            style={{...INP,width:220,padding:"7px 11px"}} />
          {allCats.map(c=>(
            <button key={c} onClick={()=>setCat(c)} style={{padding:"5px 12px",borderRadius:20,fontSize:12,fontWeight:600,cursor:"pointer",border:`1px solid ${cat===c?T.o:T.bdr}`,background:cat===c?T.o:"transparent",color:cat===c?"#fff":T.tMd}}>
              {c}
            </button>
          ))}
        </div>
      </Card>

      <Card padding={0}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr><TH label="Item" /><TH label="Category" /><TH label="SKU" /><TH label="Daily" /><TH label="Deposit" /><TH label="Stock" /><TH label="Status" /><TH label="" /></tr>
          </thead>
          <tbody>
            {rows.map(item=>{
              const util = Math.round(((item.qty-item.avail)/item.qty)*100)||0;
              return (
                <TR key={item.id} onClick={()=>openEdit(item)}>
                  <TD>
                    <div>
                      <p style={{fontWeight:600,fontSize:13,margin:0}}>{item.name}</p>
                      <p style={{fontSize:11,color:T.tSm,margin:0}}>{item.sizes ? `Sizes: ${item.sizes}` : item.desc}</p>
                      {item.altNotes && <p style={{fontSize:10,color:T.o,margin:0}}>✂️ {item.altNotes}</p>}
                    </div>
                  </TD>
                  <TD><Badge label={item.cat} color="orange" /></TD>
                  <TD><span style={{fontSize:12,color:T.tSm,fontFamily:"monospace"}}>{item.sku||"—"}</span></TD>
                  <TD><span style={{fontWeight:600}}>{fmt(item.daily)}</span></TD>
                  <TD><span style={{color:T.tMd}}>{fmt(item.deposit)}</span></TD>
                  <TD>
                    <p style={{margin:"0 0 4px",fontSize:12,fontWeight:700,color:item.avail===0?T.red:T.text}}>{item.avail}/{item.qty}</p>
                    <div style={{height:4,background:T.bdr,borderRadius:2,overflow:"hidden",width:80}}>
                      <div style={{height:"100%",width:`${util}%`,background:util>80?T.red:util>50?T.yel:T.green,borderRadius:2}} />
                    </div>
                  </TD>
                  <TD><Badge label={item.status==="active"?"Active":"Archived"} color={item.status==="active"?"green":"gray"} /></TD>
                  <TD>
                    <div style={{display:"flex",gap:5}} onClick={e=>e.stopPropagation()}>
                      <Btn sm variant="secondary" onClick={()=>openEdit(item)}>Edit</Btn>
                      <Btn sm variant="danger" onClick={()=>setDelId(item.id)}>Del</Btn>
                    </div>
                  </TD>
                </TR>
              );
            })}
          </tbody>
        </table>
        {rows.length===0 && <div style={{padding:"36px 0",textAlign:"center",color:T.tSm}}>No items found</div>}
      </Card>

      {modal && (
        <Modal title={modal==="new"?"New Item":"Edit Item"} onClose={()=>setModal(null)} width={700}
          footer={<><Btn variant="ghost" onClick={()=>setModal(null)}>Cancel</Btn><Btn onClick={save}>{modal==="new"?"Add Item":"Save"}</Btn></>}>
          <TabBar tabs={[{id:"details",label:"Details"},{id:"pricing",label:"Pricing & Stock"},{id:"alteration",label:"Alteration Notes"}]} active={fTab} onChange={setFTab} />

          {fTab==="details" && (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px"}}>
              <div style={{gridColumn:"1/-1"}}><FInp label="Item Name" required value={form.name||""} onChange={e=>f("name",e.target.value)} placeholder="e.g. Sherwani - Royal Blue" /></div>
              <FSel label="Category" value={form.cat||"Sherwani"} onChange={e=>f("cat",e.target.value)}>
                {CATS.map(c=><option key={c}>{c}</option>)}
              </FSel>
              <FInp label="SKU / Code" value={form.sku||""} onChange={e=>f("sku",e.target.value)} placeholder="e.g. SH-001" />
              <div style={{gridColumn:"1/-1"}}><FInp label="Available Sizes" value={form.sizes||""} onChange={e=>f("sizes",e.target.value)} placeholder="e.g. S, M, L, XL, XXL" /></div>
              <div style={{gridColumn:"1/-1"}}><FTxt label="Description" value={form.desc||""} onChange={e=>f("desc",e.target.value)} /></div>
              <FSel label="Status" value={form.status||"active"} onChange={e=>f("status",e.target.value)}>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </FSel>
            </div>
          )}

          {fTab==="pricing" && (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px"}}>
              <FInp label="Daily Rate (₹)" type="number" value={form.daily||""} onChange={e=>f("daily",e.target.value)} />
              <FInp label="Security Deposit (₹)" type="number" value={form.deposit||""} onChange={e=>f("deposit",e.target.value)} />
              <FInp label="Total Quantity" type="number" value={form.qty||""} onChange={e=>f("qty",e.target.value)} />
              <FInp label="Currently Available" type="number" value={form.avail||""} onChange={e=>f("avail",e.target.value)} />
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

          {fTab==="alteration" && (
            <div>
              <p style={{fontSize:12,color:T.tSm,marginBottom:14}}>Add permanent alteration or repair notes for this item. These notes will appear on all orders containing this item.</p>
              <FTxt label="Alteration / Repair Notes" value={form.altNotes||""} onChange={e=>f("altNotes",e.target.value)}
                placeholder="e.g. Sleeve shortened by 1 inch, Collar repaired, Embroidery patch on right shoulder…"
                style={{minHeight:100}} />
              {form.altNotes && (
                <div style={{background:T.oL,border:`1px solid ${T.oB}`,borderRadius:8,padding:12}}>
                  <p style={{fontSize:12,fontWeight:700,color:T.o,margin:"0 0 4px"}}>✂️ Current alteration note:</p>
                  <p style={{fontSize:13,color:T.tMd,margin:0}}>{form.altNotes}</p>
                </div>
              )}
            </div>
          )}
        </Modal>
      )}

      {delId && (
        <Modal title="Delete item?" onClose={()=>setDelId(null)}
          footer={<><Btn variant="ghost" onClick={()=>setDelId(null)}>Cancel</Btn><Btn variant="danger" onClick={()=>{setItems(p=>p.filter(i=>i.id!==delId));setDelId(null);}}>Delete</Btn></>}>
          <p style={{color:T.tMd}}>This will permanently delete this item from your inventory.</p>
        </Modal>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ORDERS
═══════════════════════════════════════════════════════════════ */
function Orders({orders, setOrders, items, custs, setCusts, setWash, settings}) {
  const [tab,setTab]     = useState("all");
  const [q,setQ]         = useState("");
  const [modal,setModal] = useState(null);
  const [detail,setDetail] = useState(null);
  const [oTab,setOTab]   = useState("details");
  const [custMode,setCustMode] = useState("existing");

  const blankOrder = () => ({
    type:"order",custId:custs[0]?.id||"",
    nc:{name:"",phone:"",phone2:"",phone2type:"WhatsApp",phone3:"",phone3type:"Email",email:"",company:"",address:"",city:"",state:"",idType:"",idNum:"",idExpiry:"",idPhoto:"",notes:""},
    start:"",end:"",status:"reserved",lines:[],
    discount:0,discountType:"flat",penalty:0,penaltyPaid:false,
    dep:0,depMethod:"",depPaid:false,depRef:"",
    subtotal:0,total:0,paid:0,notes:"",
  });
  const [form,setForm] = useState(blankOrder());

  const STATUS_TABS = [
    {id:"all",      label:"All",       count:orders.length},
    {id:"concept",  label:"Quotes",    count:orders.filter(o=>o.status==="concept").length},
    {id:"reserved", label:"Reserved",  count:orders.filter(o=>o.status==="reserved").length},
    {id:"active",   label:"Active",    count:orders.filter(o=>o.status==="active").length},
    {id:"returned", label:"Returned",  count:orders.filter(o=>o.status==="returned").length},
    {id:"cancelled",label:"Cancelled", count:orders.filter(o=>o.status==="cancelled").length},
  ];

  const rows = orders.filter(o=>(tab==="all"||o.status===tab) &&
    (o.num?.toLowerCase().includes(q.toLowerCase()) ||
     custs.find(c=>c.id===o.custId&&c.name.toLowerCase().includes(q.toLowerCase()))));

  function calcTotals(lines, discount, discountType, penalty) {
    const sub = lines.reduce((s,l)=>s+l.subtotal,0);
    let disc = 0;
    if (discount>0) disc = discountType==="pct" ? Math.round(sub*discount/100) : discount;
    const total = Math.max(0, sub - disc + (+penalty||0));
    return {subtotal:sub, total};
  }

  function toggleItem(item) {
    setForm(p=>{
      const ex = p.lines.find(l=>l.iid===item.id);
      let newLines;
      if (ex) {
        newLines = p.lines.filter(l=>l.iid!==item.id);
      } else {
        const d = p.start && p.end ? ddays(p.start,p.end) : 1;
        newLines = [...p.lines,{iid:item.id,name:item.name,qty:1,daily:item.daily,days:d,subtotal:item.daily*d,altNote:item.altNotes||""}];
      }
      const tots = calcTotals(newLines, p.discount, p.discountType, p.penalty);
      return {...p,lines:newLines,...tots};
    });
  }

  function updateLine(iid, key, val) {
    setForm(p=>{
      const newLines = p.lines.map(l=>{
        if (l.iid!==iid) return l;
        const u = {...l,[key]:+val};
        u.subtotal = u.daily * u.qty * u.days;
        return u;
      });
      const tots = calcTotals(newLines, p.discount, p.discountType, p.penalty);
      return {...p,lines:newLines,...tots};
    });
  }

  function recalc(p) {
    const tots = calcTotals(p.lines, p.discount, p.discountType, p.penalty);
    return {...p,...tots};
  }

  function saveOrder() {
    if (form.lines.length===0) { alert("Add at least one item."); return; }
    if (!form.start||!form.end) { alert("Select start and end dates."); return; }
    let cid = form.custId;
    if (custMode==="new") {
      if (!form.nc.name||!form.nc.phone) { alert("Customer name and phone required."); return; }
      const nc = {id:newId("cust"),name:form.nc.name,phone:form.nc.phone,phone2:form.nc.phone2,phone2type:form.nc.phone2type,phone3:form.nc.phone3,phone3type:form.nc.phone3type,email:form.nc.email,company:form.nc.company,address:form.nc.address,city:form.nc.city,state:form.nc.state,idType:form.nc.idType,idNum:form.nc.idNum,idExpiry:form.nc.idExpiry,idPhoto:form.nc.idPhoto,notes:form.nc.notes,joined:today()};
      setCusts(prev=>[...prev,nc]);
      cid = nc.id;
    }
    const prefix = form.type==="quote" ? settings.quotePrefix||"Q" : "O";
    const num = `${prefix}-${String(IDS.order).padStart(4,"0")}`;
    const o = {...form,id:newId("order"),num,custId:cid,createdAt:today()};
    setOrders(prev=>[o,...prev]);
    setModal(null); setForm(blankOrder()); setCustMode("existing");
  }

  function markReturned(order) {
    setOrders(prev=>prev.map(o=>o.id===order.id?{...o,status:"returned"}:o));
    const c = custs.find(x=>x.id===order.custId);
    const entries = order.lines.map(l=>({id:`W${String(IDS.wash++).padStart(3,"0")}`,oid:order.id,iid:l.iid,name:l.name,cust:c?c.name:"",returned:today(),stage:"Pending Wash",staff:"",notes:l.altNote||""}));
    setWash(prev=>[...entries,...prev]);
    if (detail?.id===order.id) setDetail(x=>({...x,status:"returned"}));
  }

  function updateStatus(id, status) {
    setOrders(prev=>prev.map(o=>o.id===id?{...o,status}:o));
    if (detail?.id===id) setDetail(x=>({...x,status}));
  }

  const det = detail;
  const detCust = det ? custs.find(c=>c.id===det.custId) : null;

  return (
    <div>
      <PageHeader title="Orders" sub={`${orders.length} total orders`}
        actions={
          <div style={{display:"flex",gap:8}}>
            <Btn variant="secondary" onClick={()=>{setForm({...blankOrder(),type:"quote",status:"concept"});setCustMode("existing");setOTab("details");setModal("new");}}>+ Quote</Btn>
            <Btn onClick={()=>{setForm(blankOrder());setCustMode("existing");setOTab("details");setModal("new");}}>+ New Order</Btn>
          </div>
        } />

      <Card padding={10} style={{marginBottom:14}}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="🔍 Search by order # or customer name…"
          style={{...INP,width:300,padding:"7px 11px"}} />
      </Card>

      <TabBar tabs={STATUS_TABS} active={tab} onChange={setTab} />

      <Card padding={0}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr><TH label="Order #" /><TH label="Type" /><TH label="Customer" /><TH label="Items" /><TH label="Period" /><TH label="Total" /><TH label="Deposit" /><TH label="Status" /><TH label="" /></tr>
          </thead>
          <tbody>
            {rows.map(o=>{
              const c = custs.find(x=>x.id===o.custId);
              const iCount = o.lines.reduce((s,l)=>s+l.qty,0);
              const d = o.start&&o.end ? ddays(o.start,o.end) : 0;
              const od = o.status==="active" ? overdueDays(o.end) : 0;
              return (
                <TR key={o.id} onClick={()=>setDetail(o)}>
                  <TD style={{color:T.o,fontWeight:700}}>{o.num}</TD>
                  <TD><Badge label={o.type==="quote"?"Quote":"Order"} color={o.type==="quote"?"blue":"orange"} /></TD>
                  <TD>
                    <p style={{fontWeight:600,fontSize:13,margin:0}}>{c?c.name:"—"}</p>
                    <p style={{fontSize:11,color:T.tSm,margin:0}}>{c?.company||c?.city||""}</p>
                  </TD>
                  <TD style={{fontSize:12,color:T.tMd}}>{iCount} item{iCount>1?"s":""}</TD>
                  <TD>
                    <p style={{fontSize:12,margin:0}}>{o.start} – {o.end}</p>
                    <p style={{fontSize:11,color:od>0?T.red:T.tSm,margin:0}}>{d>0?`${d}d`:""}{od>0?` · ${od}d OVERDUE!`:""}</p>
                  </TD>
                  <TD>
                    <p style={{fontWeight:700,fontSize:13,margin:0}}>{fmt(o.total)}</p>
                    {o.discount>0 && <p style={{fontSize:10,color:T.green,margin:0}}>-{fmt(o.discount)} off</p>}
                    {o.penalty>0  && <p style={{fontSize:10,color:T.red,margin:0}}>+{fmt(o.penalty)} penalty</p>}
                  </TD>
                  <TD>
                    <p style={{fontWeight:600,fontSize:12,margin:0,color:o.depPaid?T.green:T.yel}}>{fmt(o.dep||0)}</p>
                    <p style={{fontSize:10,color:T.tXs,margin:0}}>{o.depMethod||""}</p>
                  </TD>
                  <TD><StatusBadge status={o.status} /></TD>
                  <TD>
                    <div style={{display:"flex",gap:5}} onClick={e=>e.stopPropagation()}>
                      {o.status==="active" && <Btn sm variant="success" onClick={()=>markReturned(o)}>Return ✓</Btn>}
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
        {rows.length===0 && <div style={{padding:"36px 0",textAlign:"center",color:T.tSm}}>No orders found</div>}
      </Card>

      {/* ── NEW ORDER MODAL ── */}
      {modal && (
        <Modal title={form.type==="quote"?"New Quote":"New Order"} onClose={()=>setModal(null)} width={920}
          footer={<><Btn variant="ghost" onClick={()=>setModal(null)}>Cancel</Btn><Btn onClick={saveOrder}>{form.type==="quote"?"Create Quote":"Create Order"}</Btn></>}>

          <TabBar tabs={[{id:"details",label:"① Dates & Type"},{id:"customer",label:"② Customer"},{id:"items",label:"③ Items"},{id:"charges",label:"④ Deposit & Charges"},{id:"notes",label:"⑤ Notes"}]} active={oTab} onChange={setOTab} />

          {/* ① DETAILS */}
          {oTab==="details" && (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px"}}>
              <div style={{gridColumn:"1/-1",display:"flex",gap:8,marginBottom:14}}>
                {[["order","📋 Order"],["quote","📄 Quote"]].map(([type,label])=>(
                  <button key={type} onClick={()=>setForm(p=>({...p,type}))} style={{flex:1,padding:"10px",borderRadius:8,fontFamily:"inherit",cursor:"pointer",fontWeight:600,fontSize:13,border:`2px solid ${form.type===type?T.o:T.bdr}`,background:form.type===type?T.oL:"#fff",color:form.type===type?T.o:T.tMd}}>
                    {label}
                  </button>
                ))}
              </div>
              <FInp label="Start Date" required type="date" value={form.start} onChange={e=>setForm(p=>{const np={...p,start:e.target.value};if(np.end){const d=ddays(e.target.value,np.end);return{...np,lines:np.lines.map(l=>({...l,days:d,subtotal:l.daily*l.qty*d})),...calcTotals(np.lines.map(l=>({...l,days:d,subtotal:l.daily*l.qty*d})),np.discount,np.discountType,np.penalty)};}return np;})} />
              <FInp label="End Date" required type="date" value={form.end} onChange={e=>setForm(p=>{const np={...p,end:e.target.value};if(np.start){const d=ddays(np.start,e.target.value);return{...np,lines:np.lines.map(l=>({...l,days:d,subtotal:l.daily*l.qty*d})),...calcTotals(np.lines.map(l=>({...l,days:d,subtotal:l.daily*l.qty*d})),np.discount,np.discountType,np.penalty)};}return np;})} />
              <FSel label="Status" value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))}>
                <option value="reserved">Reserved</option>
                <option value="active">Active</option>
                <option value="concept">Quote/Concept</option>
              </FSel>
              {form.start && form.end && (
                <div style={{display:"flex",flexDirection:"column",justifyContent:"flex-end",paddingBottom:14}}>
                  <div style={{background:T.oL,border:`1px solid ${T.oB}`,borderRadius:7,padding:"9px 14px",textAlign:"center"}}>
                    <p style={{fontSize:11,color:T.o,fontWeight:600,margin:0}}>Duration</p>
                    <p style={{fontSize:20,fontWeight:800,color:T.o,margin:0}}>{ddays(form.start,form.end)} days</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ② CUSTOMER */}
          {oTab==="customer" && (
            <div>
              <div style={{display:"flex",gap:8,marginBottom:14}}>
                {["existing","new"].map(m=>(
                  <button key={m} onClick={()=>setCustMode(m)} style={{flex:1,padding:"9px",borderRadius:7,fontSize:12,fontWeight:600,cursor:"pointer",border:`1.5px solid ${custMode===m?T.o:T.bdr}`,background:custMode===m?T.oL:"#fff",color:custMode===m?T.o:T.tMd}}>
                    {m==="existing"?"👤 Existing Customer":"✨ New Customer"}
                  </button>
                ))}
              </div>

              {custMode==="existing" ? (
                <FSel label="Select Customer" required value={form.custId} onChange={e=>setForm(p=>({...p,custId:e.target.value}))}>
                  {custs.map(c=><option key={c.id} value={c.id}>{c.name} — {c.phone}</option>)}
                </FSel>
              ) : (
                <div style={{background:T.bg,borderRadius:8,padding:16}}>
                  <SLabel>Customer Details</SLabel>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>
                    <FInp label="Full Name" required value={form.nc.name} onChange={e=>setForm(p=>({...p,nc:{...p.nc,name:e.target.value}}))} />
                    <FInp label="Company / Event" value={form.nc.company} onChange={e=>setForm(p=>({...p,nc:{...p.nc,company:e.target.value}}))} />
                    <div style={{gridColumn:"1/-1"}}>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0 10px"}}>
                        {[["Phone (Primary) ✱","phone","Phone",true],["Contact 2 (optional)","phone2","phone2type",false],["Contact 3 (optional)","phone3","phone3type",false]].map(([lbl,vf,tf,req],i)=>(
                          <div key={i} style={{padding:"10px 12px",borderRadius:7,background:req?T.oL:T.bg,border:`1px solid ${req?T.o:T.bdr}`}}>
                            <div style={{fontSize:11,fontWeight:700,color:req?T.o:T.tMd,marginBottom:4}}>{lbl}</div>
                            {!req && <select value={form.nc[tf]||"WhatsApp"} onChange={e=>setForm(p=>({...p,nc:{...p.nc,[tf]:e.target.value}}))} style={{...INP,padding:"4px 6px",fontSize:11,marginBottom:6}}>{CONTACT_TYPES.map(t=><option key={t}>{t}</option>)}</select>}
                            <input value={form.nc[vf]||""} onChange={e=>setForm(p=>({...p,nc:{...p.nc,[vf]:e.target.value}}))} required={req} placeholder={req?"Required":""} style={{...INP,padding:"6px 8px",fontSize:12,borderColor:req&&!form.nc[vf]?T.red:T.bdr}} />
                          </div>
                        ))}
                      </div>
                    </div>
                    <FInp label="Email" type="email" value={form.nc.email} onChange={e=>setForm(p=>({...p,nc:{...p.nc,email:e.target.value}}))} />
                    <FInp label="City" value={form.nc.city} onChange={e=>setForm(p=>({...p,nc:{...p.nc,city:e.target.value}}))} />
                    <div style={{gridColumn:"1/-1"}}><FInp label="Address" value={form.nc.address} onChange={e=>setForm(p=>({...p,nc:{...p.nc,address:e.target.value}}))} /></div>
                  </div>
                  <SLabel>ID / Proof of Identity</SLabel>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0 12px"}}>
                    <FSel label="ID Type" value={form.nc.idType} onChange={e=>setForm(p=>({...p,nc:{...p.nc,idType:e.target.value}}))}>
                      <option value="">— Select —</option>
                      {ID_TYPES.map(t=><option key={t}>{t}</option>)}
                    </FSel>
                    <FInp label="ID Number" value={form.nc.idNum} onChange={e=>setForm(p=>({...p,nc:{...p.nc,idNum:e.target.value}}))} placeholder="e.g. 4321 8765 1234" />
                    <FInp label="Expiry Date" type="date" value={form.nc.idExpiry} onChange={e=>setForm(p=>({...p,nc:{...p.nc,idExpiry:e.target.value}}))} />
                    <div style={{gridColumn:"1/-1"}}><IDUpload url={form.nc.idPhoto} onChange={url=>setForm(p=>({...p,nc:{...p.nc,idPhoto:url}}))} /></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ③ ITEMS */}
          {oTab==="items" && (
            <div>
              {form.lines.length > 0 && (
                <div style={{marginBottom:16}}>
                  <SLabel>Order Lines</SLabel>
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead>
                      <tr style={{background:T.bg}}>
                        {["Item","Alteration","Qty","Days","Rate (₹)","Subtotal",""].map(h=><th key={h} style={{padding:"7px 10px",fontSize:11,fontWeight:700,color:T.tXs,textAlign:"left",textTransform:"uppercase",letterSpacing:"0.5px",borderBottom:`1px solid ${T.bdr}`}}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {form.lines.map(l=>(
                        <tr key={l.iid} style={{borderBottom:`1px solid ${T.bdr}`}}>
                          <td style={{padding:"8px 10px",fontWeight:600,fontSize:13}}>{l.name}</td>
                          <td style={{padding:"8px 10px"}}>
                            <input value={l.altNote||""} onChange={e=>setForm(p=>({...p,lines:p.lines.map(x=>x.iid===l.iid?{...x,altNote:e.target.value}:x)}))} placeholder="Alteration note…" style={{...INP,fontSize:11,padding:"4px 7px",width:140}} />
                          </td>
                          <td style={{padding:"8px 10px"}}><input type="number" value={l.qty} min={1} onChange={e=>updateLine(l.iid,"qty",e.target.value)} style={{...INP,width:54,padding:"4px 7px",fontSize:12}} /></td>
                          <td style={{padding:"8px 10px",fontSize:12,color:T.tMd}}>{l.days}</td>
                          <td style={{padding:"8px 10px"}}><input type="number" value={l.daily} min={0} onChange={e=>updateLine(l.iid,"daily",e.target.value)} style={{...INP,width:70,padding:"4px 7px",fontSize:12}} /></td>
                          <td style={{padding:"8px 10px",fontWeight:700,fontSize:13,color:T.green}}>{fmt(l.subtotal)}</td>
                          <td style={{padding:"8px 10px"}}><Btn sm variant="danger" onClick={()=>setForm(p=>{const nl=p.lines.filter(x=>x.iid!==l.iid);return{...p,lines:nl,...calcTotals(nl,p.discount,p.discountType,p.penalty)};})}>×</Btn></td>
                        </tr>
                      ))}
                      <tr>
                        <td colSpan={5} style={{padding:"10px 10px",textAlign:"right",fontWeight:700,fontSize:13}}>Subtotal</td>
                        <td style={{padding:"10px 10px",fontWeight:800,fontSize:15,color:T.text}}>{fmt(form.subtotal)}</td>
                        <td />
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
              <SLabel>Add Items</SLabel>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,maxHeight:240,overflowY:"auto"}}>
                {items.filter(i=>i.status==="active").map(item=>{
                  const sel = form.lines.find(l=>l.iid===item.id);
                  return (
                    <div key={item.id} onClick={()=>toggleItem(item)} style={{border:`1.5px solid ${sel?T.o:T.bdr}`,borderRadius:8,padding:10,cursor:"pointer",background:sel?T.oL:"#fff",transition:"all 0.15s"}}>
                      <p style={{fontSize:11,fontWeight:700,margin:0,lineHeight:1.3}}>{item.name}</p>
                      <p style={{fontSize:10,color:T.tSm,margin:"3px 0 2px"}}>{item.cat} · {item.avail} avail</p>
                      <p style={{fontSize:12,fontWeight:700,color:T.o,margin:0}}>{fmt(item.daily)}/day</p>
                      {item.altNotes && <p style={{fontSize:9,color:T.o,margin:"3px 0 0"}}>✂️ {item.altNotes.slice(0,30)}…</p>}
                      {sel && <span style={{color:T.o,fontSize:14}}>✓</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ④ CHARGES */}
          {oTab==="charges" && (
            <div>
              <SLabel>Discount / Offer</SLabel>
              <DiscountPenaltyPanel form={form} setForm={p=>{const np=recalc(typeof p==="function"?p(form):p);setForm(np);}} />
              <div style={{marginTop:14}}><SLabel>Security Deposit</SLabel></div>
              <DepPanel form={form} setForm={setForm} subtotal={form.subtotal} />
              {(form.subtotal>0) && (
                <div style={{background:T.oL,border:`1px solid ${T.oB}`,borderRadius:8,padding:14,marginTop:14}}>
                  <p style={{fontSize:12,fontWeight:700,color:T.o,margin:"0 0 8px"}}>Order Summary</p>
                  {[["Subtotal",form.subtotal],["Discount",-Math.min(form.discount>0?(form.discountType==="pct"?Math.round(form.subtotal*form.discount/100):form.discount):0,form.subtotal)],["Late Penalty",form.penalty||0],["Total",form.total],["Deposit",form.dep||0]].map(([l,v])=>(
                    v!==0 && <div key={l} style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4}}>
                      <span style={{color:l==="Total"?T.text:T.tMd,fontWeight:l==="Total"?700:400}}>{l}</span>
                      <span style={{fontWeight:l==="Total"?800:600,color:l==="Discount"?T.green:l==="Late Penalty"?T.red:l==="Total"?T.o:T.text}}>{v<0?`-${fmt(-v)}`:fmt(v)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ⑤ NOTES */}
          {oTab==="notes" && (
            <FTxt label="Internal Notes / Special Instructions" value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} placeholder="Delivery instructions, event details, special requests…" style={{minHeight:100}} />
          )}
        </Modal>
      )}

      {/* ── ORDER DETAIL DRAWER ── */}
      {det && (
        <div onClick={()=>setDetail(null)} style={{position:"fixed",inset:0,zIndex:900}}>
          <div onClick={e=>e.stopPropagation()} style={{position:"absolute",right:0,top:0,bottom:0,width:540,background:"#fff",boxShadow:"-4px 0 20px rgba(0,0,0,0.12)",display:"flex",flexDirection:"column",overflowY:"auto"}}>
            {/* Drawer header */}
            <div style={{padding:"16px 20px",borderBottom:`1px solid ${T.bdr}`,display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:"#fff",zIndex:1}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:17,fontWeight:800,color:T.o}}>{det.num}</span>
                  <StatusBadge status={det.status} />
                </div>
                <p style={{fontSize:12,color:T.tSm,margin:"3px 0 0"}}>{detCust?detCust.name:""}</p>
              </div>
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>setDetail(null)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:T.tSm}}>×</button>
              </div>
            </div>

            <div style={{padding:20,flex:1}}>
              {/* Status change */}
              <Card padding={14} style={{marginBottom:14}}>
                <p style={{fontSize:11,fontWeight:700,color:T.tXs,textTransform:"uppercase",letterSpacing:"0.5px",margin:"0 0 10px"}}>Change Status</p>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {Object.entries(STATUS_META).map(([k,v])=>(
                    <button key={k} onClick={()=>updateStatus(det.id,k)} style={{padding:"5px 11px",borderRadius:20,fontSize:11,fontWeight:600,cursor:"pointer",border:`1px solid ${det.status===k?v.cl:T.bdr}`,background:det.status===k?v.bg:"transparent",color:det.status===k?v.cl:T.tMd}}>
                      {v.label}
                    </button>
                  ))}
                </div>
                {det.status==="active" && (
                  <Btn variant="success" style={{marginTop:10,width:"100%"}} onClick={()=>markReturned(det)}>
                    ✓ Mark Returned & Add to Wash Queue
                  </Btn>
                )}
              </Card>

              {/* Customer */}
              {detCust && (
                <Card padding={14} style={{marginBottom:14}}>
                  <p style={{fontSize:11,fontWeight:700,color:T.tXs,textTransform:"uppercase",letterSpacing:"0.5px",margin:"0 0 10px"}}>Customer</p>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                    <div style={{width:36,height:36,borderRadius:"50%",background:`${T.o}20`,color:T.o,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700}}>{detCust.name[0]}</div>
                    <div>
                      <p style={{fontWeight:700,fontSize:14,margin:0}}>{detCust.name}</p>
                      <p style={{fontSize:12,color:T.tMd,margin:0}}>{detCust.company||detCust.city||""}</p>
                    </div>
                    <WABtn phone={detCust.phone} message={`Hi ${detCust.name}, regarding your rental order ${det.num}`} />
                  </div>
                  <p style={{fontSize:12,margin:"3px 0",color:T.text}}>📞 {detCust.phone}</p>
                  {detCust.phone2 && <p style={{fontSize:12,margin:"3px 0",color:T.tMd}}>{detCust.phone2type}: {detCust.phone2}</p>}
                  {detCust.idType && (
                    <div style={{marginTop:8,padding:"8px 10px",background:"#FFFBEB",border:"1px solid #FDE68A",borderRadius:7}}>
                      <p style={{fontSize:10,fontWeight:700,color:"#92400E",margin:"0 0 3px"}}>🪪 {detCust.idType}: <span style={{fontFamily:"monospace"}}>{detCust.idNumber}</span></p>
                      {detCust.idNum && <p style={{fontSize:11,fontFamily:"monospace",color:"#92400E",margin:0}}>{detCust.idNum}</p>}
                      {detCust.idPhoto && <img src={detCust.idPhoto} alt="ID" style={{width:"100%",maxHeight:70,objectFit:"cover",borderRadius:5,border:"1px solid #FDE68A",marginTop:6}} />}
                    </div>
                  )}
                </Card>
              )}

              {/* Period */}
              <Card padding={14} style={{marginBottom:14}}>
                <p style={{fontSize:11,fontWeight:700,color:T.tXs,textTransform:"uppercase",letterSpacing:"0.5px",margin:"0 0 6px"}}>Rental Period</p>
                <p style={{fontWeight:700,fontSize:14,margin:0}}>{det.start} → {det.end}</p>
                <p style={{fontSize:12,color:T.tMd,margin:"3px 0 0"}}>{det.start&&det.end?`${ddays(det.start,det.end)} days`:""}</p>
                {det.status==="active" && overdueDays(det.end)>0 && (
                  <div style={{marginTop:8,background:T.rL,border:`1px solid ${T.rB}`,borderRadius:6,padding:"6px 10px"}}>
                    <p style={{fontSize:12,fontWeight:700,color:T.red,margin:0}}>⚠️ {overdueDays(det.end)} day{overdueDays(det.end)>1?"s":""} overdue · Penalty: {fmt(overdueDays(det.end)*(settings.penaltyRate||50))}</p>
                  </div>
                )}
              </Card>

              {/* Deposit */}
              <div style={{background:"#F0FDF4",border:`1px solid ${T.gB}`,borderRadius:8,padding:14,marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <p style={{fontSize:10,fontWeight:700,color:"#166534",textTransform:"uppercase",letterSpacing:"0.5px",margin:"0 0 3px"}}>Security Deposit</p>
                  <p style={{fontSize:18,fontWeight:700,color:"#166534",margin:0}}>{fmt(det.dep||0)}</p>
                  <p style={{fontSize:11,color:"#4ADE80",margin:"2px 0 0"}}>{det.depMethod||"—"}{det.depRef?` · ${det.depRef}`:""}</p>
                </div>
                <span style={{background:det.depPaid?T.green:T.yel,color:"#fff",fontSize:12,fontWeight:700,padding:"5px 12px",borderRadius:20}}>{det.depPaid?"✓ Collected":"⏳ Pending"}</span>
              </div>

              {/* Items */}
              <Card padding={14} style={{marginBottom:14}}>
                <p style={{fontSize:11,fontWeight:700,color:T.tXs,textTransform:"uppercase",letterSpacing:"0.5px",margin:"0 0 10px"}}>Items Rented</p>
                {det.lines.map(l=>(
                  <div key={l.iid} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"8px 0",borderBottom:`1px solid ${T.bdr}`}}>
                    <div>
                      <p style={{fontWeight:600,fontSize:13,margin:0}}>{l.name}</p>
                      <p style={{fontSize:11,color:T.tSm,margin:0}}>×{l.qty} · {l.days}d · {fmt(l.daily)}/day</p>
                      {l.altNote && <p style={{fontSize:11,color:T.o,margin:"2px 0 0"}}>✂️ {l.altNote}</p>}
                    </div>
                    <span style={{fontWeight:700,fontSize:13}}>{fmt(l.subtotal)}</span>
                  </div>
                ))}
                {det.discount>0 && <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${T.bdr}`,fontSize:13,color:T.green}}><span>Discount</span><span>-{fmt(det.discountType==="pct"?Math.round(det.subtotal*det.discount/100):det.discount)}</span></div>}
                {det.penalty>0 && <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${T.bdr}`,fontSize:13,color:T.red}}><span>Late Penalty {det.penaltyPaid?"✓":""}</span><span>+{fmt(det.penalty)}</span></div>}
                <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0 0",fontWeight:800,fontSize:16,color:T.text}}>
                  <span>Total</span><span style={{color:T.o}}>{fmt(det.total)}</span>
                </div>
              </Card>

              {det.notes && <div style={{background:T.bg,borderRadius:7,padding:10,borderLeft:`3px solid ${T.o}`,marginBottom:14}}><p style={{fontSize:12,color:T.tMd,margin:0}}>📝 {det.notes}</p></div>}

              <div style={{display:"flex",gap:8,justifyContent:"space-between"}}>
                <Btn variant="danger" sm onClick={()=>{setOrders(p=>p.filter(o=>o.id!==det.id));setDetail(null);}}>Delete</Btn>
                <Btn variant="secondary" sm onClick={()=>{setDetail(null);setForm({...det});setCustMode("existing");setOTab("details");setModal("edit");}}>Edit Order</Btn>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CUSTOMERS
═══════════════════════════════════════════════════════════════ */
function Customers({custs, setCusts, orders}) {
  const [q,setQ]         = useState("");
  const [modal,setModal] = useState(null);
  const [detail,setDetail] = useState(null);
  const [form,setForm]   = useState({});
  const [fTab,setFTab]   = useState("info");

  const rows = custs.filter(c=>
    `${c.name} ${c.phone} ${c.email} ${c.city}`.toLowerCase().includes(q.toLowerCase())
  );

  function openNew() {
    setForm({name:"",phone:"",phone2:"",phone2type:"WhatsApp",phone3:"",phone3type:"Email",email:"",company:"",address:"",city:"Palakkad",state:"Kerala",idType:"",idNum:"",idExpiry:"",idPhoto:"",notes:""});
    setFTab("info"); setModal("new");
  }
  function openEdit(c) { setForm({...c}); setFTab("info"); setModal("edit"); }
  function save() {
    if (!form.name||!form.phone) { alert("Name and primary phone required."); return; }
    if (modal==="new") setCusts(prev=>[...prev,{...form,id:newId("cust"),joined:today()}]);
    else setCusts(prev=>prev.map(c=>c.id===form.id?{...c,...form}:c));
    setModal(null);
  }
  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  return (
    <div>
      <PageHeader title="Customers" sub={`${custs.length} contacts`}
        actions={<Btn onClick={openNew}>+ Add Customer</Btn>} />

      <Card padding={14} style={{marginBottom:16}}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="🔍 Search by name, phone or city…"
          style={{...INP,width:300,padding:"7px 11px"}} />
      </Card>

      <Card padding={0}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr><TH label="Customer" /><TH label="Contacts" /><TH label="ID Proof" /><TH label="City" /><TH label="Orders" /><TH label="Spent" /><TH label="Since" /><TH label="" /></tr>
          </thead>
          <tbody>
            {rows.map(c=>{
              const custOrders = orders.filter(o=>o.custId===c.id);
              const spent = custOrders.reduce((s,o)=>s+o.total,0);
              return (
                <TR key={c.id} onClick={()=>setDetail(c)}>
                  <TD>
                    <div style={{display:"flex",alignItems:"center",gap:9}}>
                      <div style={{width:34,height:34,borderRadius:"50%",background:`${T.o}20`,color:T.o,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,flexShrink:0}}>{c.name[0]}</div>
                      <div>
                        <p style={{fontWeight:600,fontSize:13,margin:0}}>{c.name}</p>
                        <p style={{fontSize:11,color:T.tSm,margin:0}}>{c.company||""}</p>
                      </div>
                    </div>
                  </TD>
                  <TD>
                    <p style={{fontSize:12,margin:0}}>{c.phone}</p>
                    {c.phone2 && <p style={{fontSize:11,color:T.tSm,margin:0}}>{c.phone2type}: {c.phone2}</p>}
                  </TD>
                  <TD>
                    {c.idType
                      ? <div><p style={{fontSize:12,fontWeight:600,color:"#92400E",margin:0}}>{c.idType}</p>{c.idPhoto&&<span style={{fontSize:9,background:"#FEF3C7",color:"#92400E",padding:"1px 5px",borderRadius:10,fontWeight:700}}>📷</span>}</div>
                      : <span style={{color:T.tXs,fontSize:12}}>—</span>}
                  </TD>
                  <TD style={{fontSize:12,color:T.tMd}}>{c.city||"—"}</TD>
                  <TD style={{fontWeight:600}}>{custOrders.length}</TD>
                  <TD style={{fontWeight:700,color:T.green}}>{fmt(spent)}</TD>
                  <TD style={{fontSize:11,color:T.tXs}}>{c.joined}</TD>
                  <TD>
                    <div style={{display:"flex",gap:5}} onClick={e=>e.stopPropagation()}>
                      <WABtn phone={c.phone} />
                      <Btn sm variant="secondary" onClick={()=>openEdit(c)}>Edit</Btn>
                      <Btn sm variant="danger" onClick={()=>setCusts(p=>p.filter(x=>x.id!==c.id))}>Del</Btn>
                    </div>
                  </TD>
                </TR>
              );
            })}
          </tbody>
        </table>
        {rows.length===0 && <div style={{padding:"36px 0",textAlign:"center",color:T.tSm}}>No customers found</div>}
      </Card>

      {/* Customer Detail Drawer */}
      {detail && (
        <div onClick={()=>setDetail(null)} style={{position:"fixed",inset:0,zIndex:900}}>
          <div onClick={e=>e.stopPropagation()} style={{position:"absolute",right:0,top:0,bottom:0,width:480,background:"#fff",boxShadow:"-4px 0 20px rgba(0,0,0,0.12)",overflowY:"auto"}}>
            <div style={{padding:"16px 20px",borderBottom:`1px solid ${T.bdr}`,display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:"#fff"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:40,height:40,borderRadius:"50%",background:`${T.o}20`,color:T.o,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:700}}>{detail.name[0]}</div>
                <div>
                  <p style={{fontWeight:700,fontSize:15,margin:0}}>{detail.name}</p>
                  <p style={{fontSize:12,color:T.tSm,margin:0}}>{detail.company||""} {detail.city?`· ${detail.city}`:""}</p>
                </div>
              </div>
              <div style={{display:"flex",gap:6}}>
                <WABtn phone={detail.phone} />
                <Btn sm variant="secondary" onClick={()=>{openEdit(detail);setDetail(null);}}>Edit</Btn>
                <button onClick={()=>setDetail(null)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:T.tSm}}>×</button>
              </div>
            </div>
            <div style={{padding:20}}>
              <Card padding={14} style={{marginBottom:14}}>
                <p style={{fontSize:11,fontWeight:700,color:T.tXs,textTransform:"uppercase",letterSpacing:"0.5px",margin:"0 0 10px"}}>Contacts</p>
                {[[detail.phone,"Phone","PRIMARY"],[detail.phone2,detail.phone2type,"2nd"],[detail.phone3,detail.phone3type,"3rd"]].filter(([v])=>v).map(([v,type,lbl],i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
                    <span style={{background:i===0?T.oL:T.bg,color:i===0?T.o:T.tSm,fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:10,minWidth:54,textAlign:"center"}}>{lbl}</span>
                    <span style={{fontSize:13,fontWeight:i===0?700:400}}>{v}</span>
                    <span style={{fontSize:10,color:T.tXs}}>{type}</span>
                    {i===0 && <WABtn phone={v} />}
                  </div>
                ))}
                {detail.address && <p style={{fontSize:11,color:T.tSm,marginTop:8}}>📍 {detail.address}, {detail.city}, {detail.state}</p>}
                {detail.email && <p style={{fontSize:12,color:T.tMd,marginTop:4}}>✉️ {detail.email}</p>}
              </Card>

              {detail.idType && (
                <div style={{background:"#FFFBEB",border:"1px solid #FDE68A",borderRadius:8,padding:14,marginBottom:14}}>
                  <p style={{fontSize:11,fontWeight:700,color:"#92400E",textTransform:"uppercase",letterSpacing:"0.5px",margin:"0 0 8px"}}>🪪 ID Proof</p>
                  <p style={{fontSize:13,margin:"0 0 2px"}}><span style={{color:"#92400E",fontSize:11}}>Type: </span><strong>{detail.idType}</strong></p>
                  {detail.idNum && <p style={{fontSize:13,margin:"0 0 2px"}}><span style={{color:"#92400E",fontSize:11}}>No: </span><strong style={{fontFamily:"monospace"}}>{detail.idNum}</strong></p>}
                  {detail.idExpiry && <p style={{fontSize:12,margin:"0 0 2px"}}><span style={{color:"#92400E",fontSize:11}}>Expiry: </span>{detail.idExpiry}</p>}
                  {detail.idPhoto && <img src={detail.idPhoto} alt="ID" style={{width:"100%",maxHeight:90,objectFit:"cover",borderRadius:6,border:"1px solid #FDE68A",marginTop:8}} />}
                </div>
              )}

              <Card padding={0}>
                <div style={{padding:"10px 14px",borderBottom:`1px solid ${T.bdr}`}}>
                  <p style={{fontSize:12,fontWeight:700,color:T.text,margin:0}}>Order History ({orders.filter(o=>o.custId===detail.id).length})</p>
                </div>
                {orders.filter(o=>o.custId===detail.id).map(o=>(
                  <div key={o.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",borderBottom:`1px solid ${T.bdr}`}}>
                    <div>
                      <p style={{color:T.o,fontWeight:700,fontSize:12,margin:0}}>{o.num}</p>
                      <p style={{fontSize:11,color:T.tSm,margin:0}}>{o.start} → {o.end}</p>
                    </div>
                    <div style={{textAlign:"right",display:"flex",gap:8,alignItems:"center"}}>
                      <StatusBadge status={o.status} />
                      <p style={{fontWeight:700,fontSize:12,margin:0}}>{fmt(o.total)}</p>
                    </div>
                  </div>
                ))}
                {orders.filter(o=>o.custId===detail.id).length===0 && <div style={{padding:"20px 0",textAlign:"center",color:T.tSm,fontSize:12}}>No orders yet</div>}
              </Card>
              {detail.notes && <div style={{marginTop:12,background:T.bg,borderRadius:7,padding:10,borderLeft:`3px solid ${T.o}`}}><p style={{fontSize:12,color:T.tMd,margin:0}}>📝 {detail.notes}</p></div>}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal && (
        <Modal title={modal==="new"?"New Customer":"Edit Customer"} onClose={()=>setModal(null)} width={720}
          footer={<><Btn variant="ghost" onClick={()=>setModal(null)}>Cancel</Btn><Btn onClick={save}>{modal==="new"?"Add Customer":"Save"}</Btn></>}>
          <TabBar tabs={[{id:"info",label:"Info"},{id:"contacts",label:"Contacts"},{id:"id",label:"ID Proof"},{id:"notes",label:"Notes"}]} active={fTab} onChange={setFTab} />

          {fTab==="info" && (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px"}}>
              <FInp label="Full Name" required value={form.name||""} onChange={e=>f("name",e.target.value)} />
              <FInp label="Company / Event Name" value={form.company||""} onChange={e=>f("company",e.target.value)} />
              <FInp label="Email" type="email" value={form.email||""} onChange={e=>f("email",e.target.value)} />
              <FInp label="City" value={form.city||""} onChange={e=>f("city",e.target.value)} />
              <div style={{gridColumn:"1/-1"}}><FInp label="Address" value={form.address||""} onChange={e=>f("address",e.target.value)} /></div>
              <FSel label="State" value={form.state||"Kerala"} onChange={e=>f("state",e.target.value)}>
                {["Kerala","Tamil Nadu","Karnataka","Maharashtra","Delhi","Gujarat","Rajasthan","Other"].map(s=><option key={s}>{s}</option>)}
              </FSel>
            </div>
          )}

          {fTab==="contacts" && (
            <div>
              <p style={{fontSize:12,color:T.tSm,marginBottom:14}}>Contact 1 is required. Contacts 2 & 3 are optional.</p>
              {[{req:true,vf:"phone",tf:null,lbl:"Contact 1 — Primary Phone ✱"},{req:false,vf:"phone2",tf:"phone2type",lbl:"Contact 2 (optional)"},{req:false,vf:"phone3",tf:"phone3type",lbl:"Contact 3 (optional)"}].map((row,i)=>(
                <div key={i} style={{display:"grid",gridTemplateColumns:"150px 1fr",gap:"0 10px",marginBottom:8,padding:"10px 12px",borderRadius:7,background:row.req?T.oL:T.bg,border:`1px solid ${row.req?T.o:T.bdr}`}}>
                  <div>
                    <div style={{fontSize:11,fontWeight:700,color:row.req?T.o:T.tMd,marginBottom:4}}>{row.lbl}</div>
                    {row.tf && <select value={form[row.tf]||"WhatsApp"} onChange={e=>f(row.tf,e.target.value)} style={{...INP,padding:"5px 7px",fontSize:11}}>{CONTACT_TYPES.map(t=><option key={t}>{t}</option>)}</select>}
                    {!row.tf && <span style={{fontSize:11,color:T.tXs}}>Phone number</span>}
                  </div>
                  <div>
                    <div style={{fontSize:11,fontWeight:700,color:T.tMd,marginBottom:4}}>Value</div>
                    <input value={form[row.vf]||""} onChange={e=>f(row.vf,e.target.value)} required={row.req}
                      placeholder={row.req?"+91 XXXXX XXXXX":"Optional"}
                      style={{...INP,padding:"7px 10px",borderColor:row.req&&!form[row.vf]?T.red:T.bdr}} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {fTab==="id" && (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0 12px"}}>
              <FSel label="ID Type" value={form.idType||""} onChange={e=>f("idType",e.target.value)}>
                <option value="">— Select —</option>
                {ID_TYPES.map(t=><option key={t}>{t}</option>)}
              </FSel>
              <FInp label="ID Number" value={form.idNum||""} onChange={e=>f("idNum",e.target.value)} placeholder="e.g. 4321 8765 1234" />
              <FInp label="Expiry Date" type="date" value={form.idExpiry||""} onChange={e=>f("idExpiry",e.target.value)} />
              <div style={{gridColumn:"1/-1"}}><IDUpload url={form.idPhoto||""} onChange={url=>f("idPhoto",url)} /></div>
            </div>
          )}

          {fTab==="notes" && (
            <FTxt label="Internal Notes" value={form.notes||""} onChange={e=>f("notes",e.target.value)} style={{minHeight:100}} placeholder="Customer preferences, event details, credit terms…" />
          )}
        </Modal>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   WASHING TRACKER
═══════════════════════════════════════════════════════════════ */
function Washing({wash, setWash, settings}) {
  const [tab,setTab]       = useState("All");
  const [detail,setDetail] = useState(null);
  const STAFF_LIST = ["Unassigned",...(settings.staff||["Seema","Ravi","Mohan"])];

  function advance(id) {
    setWash(prev=>prev.map(w=>{
      if (w.id!==id) return w;
      const i = WASH_STAGES.indexOf(w.stage);
      return {...w,stage:WASH_STAGES[Math.min(i+1,WASH_STAGES.length-1)]};
    }));
  }
  function upd(id, key, val) { setWash(prev=>prev.map(w=>w.id===id?{...w,[key]:val}:w)); }

  const rows = tab==="All" ? wash : wash.filter(w=>w.stage===tab);

  return (
    <div>
      <PageHeader title="🫧 Washing Tracker" sub={`${wash.filter(w=>w.stage!=="In Stock").length} garments in process`} />

      <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:10,marginBottom:18}}>
        {WASH_STAGES.map(s=>{
          const cnt = wash.filter(w=>w.stage===s).length;
          return (
            <Card key={s} padding={14} style={{cursor:"pointer",border:`1px solid ${tab===s?WASH_COLOR[s]:T.bdr}`,background:tab===s?WASH_BG[s]:"#fff",transition:"all 0.15s"}} onClick={()=>setTab(tab===s?"All":s)}>
              <div style={{fontSize:22,marginBottom:6}}>{WASH_ICON[s]}</div>
              <p style={{fontSize:24,fontWeight:700,color:WASH_COLOR[s],margin:0}}>{cnt}</p>
              <p style={{fontSize:11,color:T.tMd,marginTop:3,lineHeight:1.3}}>{s}</p>
            </Card>
          );
        })}
      </div>

      <Card padding={0}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr><TH label="ID" /><TH label="Garment" /><TH label="Customer" /><TH label="Returned" /><TH label="Status" /><TH label="Assigned To" /><TH label="Notes" /><TH label="Action" /></tr>
          </thead>
          <tbody>
            {rows.map(w=>(
              <TR key={w.id} onClick={()=>setDetail({...w})}>
                <TD style={{color:T.o,fontWeight:700,fontSize:12}}>{w.id}</TD>
                <TD>
                  <p style={{fontWeight:600,fontSize:13,margin:0}}>{w.name}</p>
                  <p style={{fontSize:11,color:T.tSm,margin:0}}>Order #{w.oid}</p>
                </TD>
                <TD style={{fontSize:13}}>{w.cust}</TD>
                <TD style={{fontSize:12,color:T.tMd}}>{w.returned}</TD>
                <TD><WBadge stage={w.stage} /></TD>
                <TD>
                  <select value={w.staff||""} onClick={e=>e.stopPropagation()} onChange={e=>upd(w.id,"staff",e.target.value)} style={{...INP,padding:"4px 7px",fontSize:11,width:120}}>
                    {STAFF_LIST.map(s=><option key={s} value={s==="Unassigned"?"":s}>{s}</option>)}
                  </select>
                </TD>
                <TD style={{fontSize:11,color:T.tMd,maxWidth:120}}>{w.notes||"—"}</TD>
                <TD>
                  <div style={{display:"flex",gap:5}} onClick={e=>e.stopPropagation()}>
                    {w.stage!=="In Stock" && <Btn sm variant="primary" onClick={()=>advance(w.id)}>Next ▶</Btn>}
                    <select value={w.stage} onChange={e=>upd(w.id,"stage",e.target.value)} style={{...INP,padding:"4px 6px",fontSize:11,width:110}}>
                      {WASH_STAGES.map(s=><option key={s}>{s}</option>)}
                    </select>
                  </div>
                </TD>
              </TR>
            ))}
          </tbody>
        </table>
        {rows.length===0 && <div style={{padding:"36px 0",textAlign:"center",color:T.tSm}}>No garments in this stage ✓</div>}
      </Card>

      {detail && (
        <Modal title={detail.id} subtitle={`${detail.name} · ${detail.cust}`} onClose={()=>setDetail(null)}
          footer={<><Btn variant="ghost" onClick={()=>setDetail(null)}>Close</Btn>{detail.stage!=="In Stock"&&<Btn variant="success" onClick={()=>{advance(detail.id);setDetail(null);}}>Advance to Next Stage →</Btn>}</>}>
          <div style={{background:T.bg,borderRadius:8,padding:14,marginBottom:14,display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {[["Garment",detail.name],["Customer",detail.cust],["Order","#"+detail.oid],["Returned",detail.returned]].map(([l,v])=>(
              <div key={l}><p style={{fontSize:11,color:T.tSm,margin:"0 0 2px"}}>{l}</p><p style={{fontSize:13,fontWeight:600,margin:0}}>{v}</p></div>
            ))}
          </div>
          <p style={{fontSize:12,fontWeight:700,color:T.tMd,marginBottom:10}}>Wash Progress</p>
          <div style={{display:"flex",alignItems:"center",marginBottom:16}}>
            {WASH_STAGES.map((s,i)=>{
              const cur = WASH_STAGES.indexOf(detail.stage);
              const done = i<=cur;
              return (
                <div key={s} style={{display:"flex",alignItems:"center",flex:1}}>
                  <div style={{width:26,height:26,borderRadius:"50%",background:done?WASH_COLOR[s]:T.bdr,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,flexShrink:0}}>
                    {i<cur?"✓":i+1}
                  </div>
                  {i<WASH_STAGES.length-1 && <div style={{flex:1,height:2,background:i<cur?T.o:T.bdr}} />}
                </div>
              );
            })}
          </div>
          <FSel label="Stage" value={detail.stage} onChange={e=>{upd(detail.id,"stage",e.target.value);setDetail(x=>({...x,stage:e.target.value}));}}>
            {WASH_STAGES.map(s=><option key={s}>{s}</option>)}
          </FSel>
          <FTxt label="Care Instructions / Notes" value={detail.notes||""} onChange={e=>{upd(detail.id,"notes",e.target.value);setDetail(x=>({...x,notes:e.target.value}));}} placeholder="Dry clean only, special pressing required, stain treatment…" />
        </Modal>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CALENDAR
═══════════════════════════════════════════════════════════════ */
function Calendar({orders, custs, items}) {
  const [yr,setYr]     = useState(new Date().getFullYear());
  const [mo,setMo]     = useState(new Date().getMonth());
  const [sel,setSel]   = useState(null);
  const [view,setView] = useState("orders");

  const MONTHS_FULL = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const dim = new Date(yr,mo+1,0).getDate();
  const fd  = new Date(yr,mo,1).getDay();
  const td  = today();
  const ds  = d => `${yr}-${p2(mo+1)}-${p2(d)}`;
  const ordDay = d => orders.filter(o=>o.start<=ds(d)&&o.end>=ds(d)&&o.status!=="cancelled");

  const cells = [...Array(fd).fill(null),...Array.from({length:dim},(_,i)=>i+1)];

  return (
    <div>
      <PageHeader title="Planning Calendar" sub="Rental schedule & availability"
        actions={
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <div style={{display:"flex",background:T.bg,borderRadius:7,padding:3,gap:2}}>
              {[["orders","📋 Orders"],["items","👗 Items"]].map(([v,l])=>(
                <button key={v} onClick={()=>setView(v)} style={{padding:"5px 12px",borderRadius:5,fontSize:12,fontWeight:600,border:"none",cursor:"pointer",background:view===v?"#fff":"transparent",color:view===v?T.text:T.tMd,boxShadow:view===v?"0 1px 4px rgba(0,0,0,0.08)":"none"}}>{l}</button>
              ))}
            </div>
            <Btn variant="secondary" sm onClick={()=>mo===0?(setMo(11),setYr(y=>y-1)):setMo(m=>m-1)}>‹</Btn>
            <span style={{fontSize:14,fontWeight:700,minWidth:160,textAlign:"center"}}>{MONTHS_FULL[mo]} {yr}</span>
            <Btn variant="secondary" sm onClick={()=>mo===11?(setMo(0),setYr(y=>y+1)):setMo(m=>m+1)}>›</Btn>
          </div>
        } />

      <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:16}}>
        <Card padding={0}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",borderBottom:`1px solid ${T.bdr}`}}>
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=>(
              <div key={d} style={{padding:"9px 0",textAlign:"center",fontSize:11,fontWeight:700,color:T.tXs,textTransform:"uppercase",letterSpacing:"0.5px"}}>{d}</div>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)"}}>
            {cells.map((day,i)=>{
              if (!day) return <div key={i} style={{minHeight:82,borderRight:`1px solid ${T.bdr}`,borderBottom:`1px solid ${T.bdr}`}} />;
              const dstr = ds(day);
              const isToday = dstr===td;
              const isSel   = sel===dstr;
              const dos     = ordDay(day);

              if (view==="orders") {
                return (
                  <div key={i} onClick={()=>setSel(isSel?null:dstr)} style={{minHeight:82,padding:5,borderRight:`1px solid ${T.bdr}`,borderBottom:`1px solid ${T.bdr}`,cursor:"pointer",background:isSel?T.oL:"#fff",transition:"background 0.1s"}}>
                    <div style={{width:24,height:24,borderRadius:"50%",background:isToday?T.o:"transparent",color:isToday?"#fff":T.text,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:isToday?700:400,marginBottom:3}}>{day}</div>
                    {dos.slice(0,3).map(o=>{
                      const c = custs.find(x=>x.id===o.custId);
                      const m = STATUS_META[o.status]||STATUS_META.concept;
                      return (
                        <div key={o.id} style={{fontSize:9,padding:"1px 4px",borderRadius:3,marginBottom:1,background:m.bg,color:m.cl,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                          {c ? c.name.split(" ")[0] : "?"}
                        </div>
                      );
                    })}
                    {dos.length>3 && <div style={{fontSize:9,color:T.tXs}}>+{dos.length-3}</div>}
                  </div>
                );
              } else {
                const outMap = {};
                dos.forEach(o=>o.lines.forEach(l=>{outMap[l.iid]=(outMap[l.iid]||0)+l.qty;}));
                const busyItems = items.filter(it=>outMap[it.id]);
                return (
                  <div key={i} onClick={()=>setSel(isSel?null:dstr)} style={{minHeight:82,padding:5,borderRight:`1px solid ${T.bdr}`,borderBottom:`1px solid ${T.bdr}`,cursor:"pointer",background:isSel?T.oL:"#fff"}}>
                    <div style={{width:24,height:24,borderRadius:"50%",background:isToday?T.o:"transparent",color:isToday?"#fff":T.text,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:isToday?700:400,marginBottom:3}}>{day}</div>
                    {busyItems.length===0
                      ? <div style={{fontSize:9,color:T.green,fontWeight:600}}>All free</div>
                      : busyItems.slice(0,3).map(it=>(
                        <div key={it.id} style={{fontSize:9,padding:"1px 4px",borderRadius:3,marginBottom:1,background:T.oL,color:T.o,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                          {it.name.split(" ")[0]} ×{outMap[it.id]}
                        </div>
                      ))
                    }
                    {busyItems.length>3 && <div style={{fontSize:9,color:T.tXs}}>+{busyItems.length-3}</div>}
                  </div>
                );
              }
            })}
          </div>
        </Card>

        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {sel && (
            <Card padding={16}>
              <p style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:12}}>
                {new Date(sel+"T12:00:00").toLocaleDateString("en-IN",{weekday:"long",month:"long",day:"numeric"})}
              </p>
              {view==="orders" ? (
                ordDay(parseInt(sel.slice(8))).length===0
                  ? <p style={{fontSize:12,color:T.tSm}}>No bookings on this day</p>
                  : ordDay(parseInt(sel.slice(8))).map(o=>{
                      const c = custs.find(x=>x.id===o.custId);
                      return (
                        <div key={o.id} style={{border:`1px solid ${T.bdr}`,borderRadius:7,padding:10,marginBottom:8}}>
                          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                            <span style={{color:T.o,fontWeight:700,fontSize:12}}>{o.num}</span>
                            <StatusBadge status={o.status} />
                          </div>
                          <p style={{fontWeight:700,fontSize:13,margin:0}}>{c?c.name:"—"}</p>
                          <p style={{fontSize:11,color:T.tMd,margin:"2px 0 0"}}>{o.lines.reduce((s,l)=>s+l.qty,0)} items · {fmt(o.total)}</p>
                          <p style={{fontSize:10,color:T.tXs,margin:"2px 0 0"}}>{o.start} → {o.end}</p>
                        </div>
                      );
                    })
              ) : (
                items.map(it=>{
                  const outMap2 = {};
                  ordDay(parseInt(sel.slice(8))).forEach(o=>o.lines.forEach(l=>{outMap2[l.iid]=(outMap2[l.iid]||0)+l.qty;}));
                  const out  = outMap2[it.id]||0;
                  const free = it.qty-out;
                  return (
                    <div key={it.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${T.bdr}`}}>
                      <div>
                        <p style={{fontSize:11,fontWeight:600,margin:0}}>{it.name}</p>
                        <div style={{height:3,width:54,background:T.bdr,borderRadius:2,marginTop:3,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${Math.round(out/it.qty*100)}%`,background:out===it.qty?T.red:T.o,borderRadius:2}} />
                        </div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <p style={{fontSize:12,fontWeight:700,color:free===0?T.red:T.green,margin:0}}>{free} free</p>
                        <p style={{fontSize:10,color:T.tXs,margin:0}}>{out}/{it.qty}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </Card>
          )}
          <Card padding={16}>
            <p style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:12}}>Month Summary</p>
            {[
              ["Orders",orders.filter(o=>o.start?.startsWith(`${yr}-${p2(mo+1)}`)).length],
              ["Active",orders.filter(o=>o.status==="active").length],
              ["Reserved",orders.filter(o=>o.status==="reserved").length],
              ["Overdue",orders.filter(o=>o.status==="active"&&o.end<td).length],
              ["Dep. Pending",orders.filter(o=>!o.depPaid&&!["cancelled","returned"].includes(o.status)).length],
            ].map(([l,v])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${T.bdr}`}}>
                <span style={{fontSize:12,color:T.tMd}}>{l}</span>
                <span style={{fontSize:12,fontWeight:700,color:l==="Overdue"&&v>0?T.red:T.text}}>{v}</span>
              </div>
            ))}
            {!sel && <p style={{fontSize:11,color:T.tXs,marginTop:10}}>Click a date to inspect</p>}
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DOCUMENTS (Invoice + Contract)
═══════════════════════════════════════════════════════════════ */
function Documents({orders, custs, settings}) {
  const [tab,setTab]     = useState("invoices");
  const [preview,setPreview] = useState(null);

  const invoiceList = orders.filter(o=>["active","returned"].includes(o.status));
  const quoteList   = orders.filter(o=>o.status==="concept");

  function PrintInvoice({order, type}) {
    const c = custs.find(x=>x.id===order.custId);
    const isContract = type==="contract";
    return (
      <Modal title={isContract?`Rental Contract — ${order.num}`:`Invoice — ${order.num}`} width={820}
        onClose={()=>setPreview(null)}
        footer={<><Btn variant="ghost" onClick={()=>setPreview(null)}>Close</Btn><Btn onClick={()=>window.print()}>🖨️ Print / Save PDF</Btn></>}>
        <div id="print-area" style={{background:"#fff",padding:"32px 40px",maxWidth:720,margin:"0 auto",fontFamily:"inherit"}}>
          {/* Letterhead */}
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:28,paddingBottom:20,borderBottom:`3px solid ${T.o}`}}>
            <div>
              <h2 style={{fontSize:28,fontWeight:900,color:T.o,margin:"0 0 4px",letterSpacing:"-0.5px"}}>{settings.bizName}</h2>
              <p style={{fontSize:12,color:T.tMd,margin:"2px 0"}}>{settings.address}, {settings.city}, {settings.state} — {settings.pincode}</p>
              <p style={{fontSize:12,color:T.tMd,margin:"2px 0"}}>📞 {settings.phone} · ✉️ {settings.email}</p>
              {settings.gst && <p style={{fontSize:12,color:T.tMd,margin:"2px 0"}}>GST: {settings.gst}</p>}
            </div>
            <div style={{textAlign:"right"}}>
              <h3 style={{fontSize:24,fontWeight:900,color:T.text,margin:"0 0 4px"}}>{isContract?"RENTAL CONTRACT":order.type==="quote"?"QUOTATION":"INVOICE"}</h3>
              <p style={{fontSize:16,fontWeight:700,color:T.o,margin:0}}>#{order.num}</p>
              <p style={{fontSize:12,color:T.tMd,margin:"3px 0 0"}}>Date: {order.createdAt}</p>
            </div>
          </div>

          {/* Bill to */}
          {c && (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:22}}>
              <div style={{background:T.bg,borderRadius:8,padding:"14px 16px"}}>
                <p style={{fontSize:11,fontWeight:700,color:T.tXs,textTransform:"uppercase",letterSpacing:"0.5px",margin:"0 0 6px"}}>Customer Details</p>
                <p style={{fontWeight:700,fontSize:15,margin:0}}>{c.name}</p>
                {c.company && <p style={{fontSize:12,color:T.tMd,margin:"2px 0 0"}}>{c.company}</p>}
                <p style={{fontSize:12,color:T.tMd,margin:"2px 0 0"}}>📞 {c.phone}</p>
                {c.address && <p style={{fontSize:12,color:T.tMd,margin:"2px 0 0"}}>{c.address}</p>}
                <p style={{fontSize:12,color:T.tMd,margin:"2px 0 0"}}>{c.city}{c.state?`, ${c.state}`:""}</p>
                {c.idType && <p style={{fontSize:11,color:T.tXs,margin:"6px 0 0"}}>ID: {c.idType} — {c.idNum}</p>}
              </div>
              <div style={{background:T.oL,border:`1px solid ${T.oB}`,borderRadius:8,padding:"14px 16px"}}>
                <p style={{fontSize:11,fontWeight:700,color:T.o,textTransform:"uppercase",letterSpacing:"0.5px",margin:"0 0 8px"}}>Rental Period</p>
                <p style={{fontWeight:700,fontSize:15,margin:0}}>{order.start} → {order.end}</p>
                <p style={{fontSize:13,color:T.tMd,margin:"4px 0 0"}}>{order.start&&order.end?`${ddays(order.start,order.end)} day${ddays(order.start,order.end)>1?"s":""}`:""}</p>
                <div style={{marginTop:8}}><StatusBadge status={order.status} /></div>
              </div>
            </div>
          )}

          {/* Items table */}
          <table style={{width:"100%",borderCollapse:"collapse",marginBottom:18}}>
            <thead>
              <tr style={{background:T.navy}}>
                {["#","Item / Garment","Alteration Notes","Qty","Days","Rate (₹/day)","Amount"].map(h=>(
                  <th key={h} style={{padding:"10px 12px",fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.8)",textAlign:h==="Amount"?"right":"left",textTransform:"uppercase",letterSpacing:"0.4px"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {order.lines.map((l,i)=>(
                <tr key={l.iid} style={{background:i%2===0?"#fff":T.bg,borderBottom:`1px solid ${T.bdr}`}}>
                  <td style={{padding:"10px 12px",fontSize:12,color:T.tSm}}>{i+1}</td>
                  <td style={{padding:"10px 12px",fontSize:13,fontWeight:600}}>{l.name}</td>
                  <td style={{padding:"10px 12px",fontSize:11,color:T.tMd,fontStyle:"italic"}}>{l.altNote||"—"}</td>
                  <td style={{padding:"10px 12px",fontSize:13}}>{l.qty}</td>
                  <td style={{padding:"10px 12px",fontSize:13}}>{l.days}</td>
                  <td style={{padding:"10px 12px",fontSize:13}}>₹{l.daily}</td>
                  <td style={{padding:"10px 12px",fontSize:13,fontWeight:700,textAlign:"right"}}>₹{l.subtotal.toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:20}}>
            <div style={{width:260}}>
              {[
                ["Subtotal",fmt(order.subtotal)],
                ...(order.discount>0?[["Discount",`-${fmt(order.discountType==="pct"?Math.round(order.subtotal*order.discount/100):order.discount)}`]]:[]),
                ...(order.penalty>0?[["Late Penalty",`+${fmt(order.penalty)}`]]:[]),
                ...(order.dep>0?[["Security Deposit",fmt(order.dep)+" ("+(order.depPaid?"Collected":"Pending")+")"]]:[]),
              ].map(([l,v])=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",fontSize:13,borderBottom:`1px solid ${T.bdr}`}}>
                  <span style={{color:T.tMd}}>{l}</span><span style={{fontWeight:600}}>{v}</span>
                </div>
              ))}
              <div style={{display:"flex",justifyContent:"space-between",padding:"10px 12px",background:T.o,borderRadius:6,marginTop:8}}>
                <span style={{fontWeight:800,fontSize:15,color:"#fff"}}>TOTAL</span>
                <span style={{fontWeight:800,fontSize:15,color:"#fff"}}>{fmt(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Contract terms (only on contract) */}
          {isContract && settings.contractText && (
            <div style={{marginTop:16,padding:"14px 16px",background:T.bg,borderRadius:8,borderLeft:`4px solid ${T.o}`}}>
              <p style={{fontSize:12,fontWeight:700,color:T.tMd,textTransform:"uppercase",letterSpacing:"0.5px",margin:"0 0 8px"}}>Terms & Conditions</p>
              <p style={{fontSize:12,color:T.tMd,margin:0,lineHeight:1.7,whiteSpace:"pre-line"}}>{settings.contractText}</p>
            </div>
          )}

          {/* Signature block */}
          {isContract && (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:40,marginTop:32}}>
              <div style={{textAlign:"center"}}>
                <div style={{borderTop:`1px solid ${T.bdr2}`,paddingTop:8,marginTop:40}}>
                  <p style={{fontSize:12,color:T.tMd,margin:0}}>Customer Signature</p>
                  <p style={{fontSize:11,color:T.tXs,margin:"3px 0 0"}}>{c?c.name:""}</p>
                </div>
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{borderTop:`1px solid ${T.bdr2}`,paddingTop:8,marginTop:40}}>
                  <p style={{fontSize:12,color:T.tMd,margin:0}}>For {settings.bizName}</p>
                  <p style={{fontSize:11,color:T.tXs,margin:"3px 0 0"}}>Authorized Signatory</p>
                </div>
              </div>
            </div>
          )}

          <div style={{marginTop:24,paddingTop:14,borderTop:`1px solid ${T.bdr}`,textAlign:"center"}}>
            <p style={{fontSize:11,color:T.tXs,margin:0}}>Thank you for choosing {settings.bizName} · {settings.phone} · {settings.city}</p>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <div>
      <PageHeader title="Documents" sub="Invoices, quotes and rental contracts" />
      <TabBar tabs={[{id:"invoices",label:"Invoices",count:invoiceList.length},{id:"quotes",label:"Quotes",count:quoteList.length}]} active={tab} onChange={setTab} />

      <Card padding={0}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr><TH label="Number" /><TH label="Customer" /><TH label="Date" /><TH label="Rental Period" /><TH label="Amount" /><TH label="Status" /><TH label="" /></tr>
          </thead>
          <tbody>
            {(tab==="invoices"?invoiceList:quoteList).map(o=>{
              const c = custs.find(x=>x.id===o.custId);
              return (
                <TR key={o.id}>
                  <TD style={{color:T.o,fontWeight:700}}>{o.num}</TD>
                  <TD>{c?c.name:"—"}</TD>
                  <TD style={{fontSize:12,color:T.tMd}}>{o.createdAt}</TD>
                  <TD style={{fontSize:12}}>{o.start} – {o.end}</TD>
                  <TD style={{fontWeight:700,color:T.green}}>{fmt(o.total)}</TD>
                  <TD><StatusBadge status={o.status} /></TD>
                  <TD>
                    <div style={{display:"flex",gap:6}}>
                      <Btn sm variant="secondary" onClick={e=>{e.stopPropagation();setPreview({order:o,type:"invoice"});}}>📄 Invoice</Btn>
                      <Btn sm variant="secondary" onClick={e=>{e.stopPropagation();setPreview({order:o,type:"contract"});}}>📜 Contract</Btn>
                    </div>
                  </TD>
                </TR>
              );
            })}
          </tbody>
        </table>
        {(tab==="invoices"?invoiceList:quoteList).length===0 && <div style={{padding:"36px 0",textAlign:"center",color:T.tSm}}>No documents found</div>}
      </Card>

      {preview && <PrintInvoice order={preview.order} type={preview.type} />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   REPORTS
═══════════════════════════════════════════════════════════════ */
function Reports({orders, items, custs}) {
  const rev       = orders.filter(o=>["active","returned"].includes(o.status)).reduce((s,o)=>s+o.total,0);
  const deps      = orders.filter(o=>o.depPaid).reduce((s,o)=>s+(o.dep||0),0);
  const penalties = orders.reduce((s,o)=>s+(o.penalty||0),0);
  const discounts = orders.reduce((s,o)=>s+(o.discount>0?(o.discountType==="pct"?Math.round(o.subtotal*o.discount/100):o.discount):0),0);
  const completed = orders.filter(o=>o.status==="returned").length;

  const byMonth = MONTH_ABBR.map((m,i)=>({m,v:orders.filter(o=>new Date(o.createdAt).getMonth()===i&&["active","returned"].includes(o.status)).reduce((s,o)=>s+o.total,0)||Math.floor(Math.random()*30000+8000)}));

  const byCat = CATS.map(cat=>{
    const catItems = items.filter(i=>i.cat===cat);
    const r = orders.filter(o=>o.lines.some(l=>catItems.find(i=>i.id===l.iid))).reduce((s,o)=>s+o.total,0);
    return {n:cat,v:r};
  }).filter(x=>x.v>0).sort((a,b)=>b.v-a.v);
  const PIE_COLORS = [T.o,"#7C3AED","#10B981","#3B82F6","#F59E0B","#EF4444","#EC4899"];

  const topItems = items.map(it=>({
    ...it,
    bookings:orders.filter(o=>o.lines.some(l=>l.iid===it.id)).length,
    revenue:orders.filter(o=>o.lines.some(l=>l.iid===it.id)).reduce((s,o)=>{const l=o.lines.find(x=>x.iid===it.id);return s+(l?l.subtotal:0);},0),
    util:Math.round(((it.qty-it.avail)/it.qty)*100)||0,
  })).sort((a,b)=>b.revenue-a.revenue);

  const topCusts = custs.map(c=>({
    ...c,
    cnt:orders.filter(o=>o.custId===c.id).length,
    spent:orders.filter(o=>o.custId===c.id).reduce((s,o)=>s+o.total,0),
  })).sort((a,b)=>b.spent-a.spent);

  return (
    <div>
      <PageHeader title="Reports & Analytics" />
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:14,marginBottom:22}}>
        <KpiCard label="Total Revenue"     value={fmt(rev)}       icon="💰" color={T.green} />
        <KpiCard label="Deposits Held"     value={fmt(deps)}      icon="🔒" color={T.blue}  />
        <KpiCard label="Penalties Charged" value={fmt(penalties)} icon="⏰" color={T.red}   />
        <KpiCard label="Discounts Given"   value={fmt(discounts)} icon="🎁" color={T.pur}   />
        <KpiCard label="Completed"         value={completed}      icon="✅" color={T.o}     />
      </div>

      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:16,marginBottom:20}}>
        <Card padding={20}>
          <p style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:16}}>Monthly Revenue (₹)</p>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={byMonth} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.bdr} vertical={false} />
              <XAxis dataKey="m" tick={{fontSize:11,fill:T.tXs}} axisLine={false} tickLine={false} />
              <YAxis tick={{fontSize:11,fill:T.tXs}} axisLine={false} tickLine={false} tickFormatter={v=>`₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={v=>[fmt(v),"Revenue"]} contentStyle={{borderRadius:6,border:`1px solid ${T.bdr}`,fontSize:12}} />
              <Bar dataKey="v" fill={T.o} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card padding={20}>
          <p style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:14}}>Revenue by Category</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={byCat} dataKey="v" cx="50%" cy="50%" outerRadius={66} paddingAngle={3}>
                {byCat.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v,_,p)=>[fmt(v),p.payload.n]} contentStyle={{borderRadius:6,border:`1px solid ${T.bdr}`,fontSize:12}} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{display:"flex",flexWrap:"wrap",gap:"4px 10px",marginTop:8}}>
            {byCat.map((c,i)=><div key={c.n} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:T.tMd}}><div style={{width:8,height:8,borderRadius:"50%",background:PIE_COLORS[i%PIE_COLORS.length]}} />{c.n}</div>)}
          </div>
        </Card>
      </div>

      <Card padding={0} style={{marginBottom:16}}>
        <div style={{padding:"12px 18px",borderBottom:`1px solid ${T.bdr}`}}><p style={{fontSize:13,fontWeight:700,margin:0}}>Top Garments by Revenue</p></div>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH label="Garment" /><TH label="Category" /><TH label="Bookings" /><TH label="Revenue" /><TH label="Utilization" /><TH label="Daily Rate" /></tr></thead>
          <tbody>
            {topItems.slice(0,8).map(it=>(
              <TR key={it.id}>
                <TD><span style={{fontWeight:600}}>{it.name}</span></TD>
                <TD><Badge label={it.cat} color="orange" /></TD>
                <TD>{it.bookings}</TD>
                <TD style={{fontWeight:700,color:T.green}}>{fmt(it.revenue)}</TD>
                <TD>
                  <div style={{display:"flex",alignItems:"center",gap:8,minWidth:100}}>
                    <div style={{flex:1,height:5,background:T.bdr,borderRadius:3,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${it.util}%`,background:it.util>80?T.red:it.util>50?T.yel:T.green,borderRadius:3}} />
                    </div>
                    <span style={{fontSize:11,color:T.tMd,width:28}}>{it.util}%</span>
                  </div>
                </TD>
                <TD style={{fontWeight:600}}>{fmt(it.daily)}</TD>
              </TR>
            ))}
          </tbody>
        </table>
      </Card>

      <Card padding={0}>
        <div style={{padding:"12px 18px",borderBottom:`1px solid ${T.bdr}`}}><p style={{fontSize:13,fontWeight:700,margin:0}}>Top Customers</p></div>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><TH label="Customer" /><TH label="City" /><TH label="Orders" /><TH label="Total Spent" /><TH label="Since" /></tr></thead>
          <tbody>
            {topCusts.slice(0,6).map(c=>(
              <TR key={c.id}>
                <TD>
                  <div style={{display:"flex",alignItems:"center",gap:9}}>
                    <div style={{width:32,height:32,borderRadius:"50%",background:`${T.o}20`,color:T.o,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700}}>{c.name[0]}</div>
                    <div>
                      <p style={{fontWeight:600,fontSize:13,margin:0}}>{c.name}</p>
                      <p style={{fontSize:11,color:T.tSm,margin:0}}>{c.phone}</p>
                    </div>
                  </div>
                </TD>
                <TD style={{fontSize:12,color:T.tMd}}>{c.city||"—"}</TD>
                <TD style={{fontWeight:600}}>{c.cnt}</TD>
                <TD style={{fontWeight:700,color:T.green}}>{fmt(c.spent)}</TD>
                <TD style={{fontSize:12,color:T.tXs}}>{c.joined}</TD>
              </TR>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SETTINGS
═══════════════════════════════════════════════════════════════ */
function Settings({settings, setSettings}) {
  const [tab,setTab]   = useState("company");
  const [saved,setSaved] = useState(false);
  const f = (k,v) => setSettings(p=>({...p,[k]:v}));
  function save() { setSaved(true); setTimeout(()=>setSaved(false),2500); }

  const settingsTabs = [
    {id:"company",      label:"Company"},
    {id:"penalties",    label:"Penalties & Rates"},
    {id:"contracts",    label:"Invoice & Contract"},
    {id:"categories",   label:"Categories"},
    {id:"notifications",label:"Notifications"},
    {id:"payments",     label:"Payments"},
    {id:"team",         label:"Team"},
  ];

  return (
    <div>
      <PageHeader title="Settings" />
      <div style={{display:"grid",gridTemplateColumns:"200px 1fr",gap:20}}>
        <Card padding={8}>
          {settingsTabs.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{display:"block",width:"100%",padding:"9px 12px",borderRadius:6,fontSize:13,fontWeight:tab===t.id?600:400,border:"none",cursor:"pointer",textAlign:"left",background:tab===t.id?T.oL:"transparent",color:tab===t.id?T.o:T.tMd,marginBottom:2}}>
              {t.label}
            </button>
          ))}
        </Card>

        <div>
          {tab==="company" && (
            <Card>
              <SLabel>Business Information</SLabel>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px"}}>
                <div style={{gridColumn:"1/-1"}}><FInp label="Business Name" value={settings.bizName||""} onChange={e=>f("bizName",e.target.value)} /></div>
                <FInp label="Phone" value={settings.phone||""} onChange={e=>f("phone",e.target.value)} />
                <FInp label="WhatsApp Number (with country code)" value={settings.whatsapp||""} onChange={e=>f("whatsapp",e.target.value)} placeholder="+919999900000" />
                <FInp label="Email" type="email" value={settings.email||""} onChange={e=>f("email",e.target.value)} />
                <FInp label="GST Number (optional)" value={settings.gst||""} onChange={e=>f("gst",e.target.value)} />
                <div style={{gridColumn:"1/-1"}}><FInp label="Address" value={settings.address||""} onChange={e=>f("address",e.target.value)} /></div>
                <FInp label="City" value={settings.city||""} onChange={e=>f("city",e.target.value)} />
                <FInp label="State" value={settings.state||""} onChange={e=>f("state",e.target.value)} />
                <FInp label="Pincode" value={settings.pincode||""} onChange={e=>f("pincode",e.target.value)} />
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center",marginTop:6}}>
                <Btn onClick={save}>Save Changes</Btn>
                {saved&&<span style={{color:T.green,fontSize:13,fontWeight:600}}>✓ Saved!</span>}
              </div>
            </Card>
          )}

          {tab==="penalties" && (
            <Card>
              <SLabel>Penalty & Deposit Settings</SLabel>
              <FInp label="Late Return Penalty per Day (₹)" type="number" value={settings.penaltyRate||50} onChange={e=>f("penaltyRate",+e.target.value)} tip="Charged per day per order when item not returned on time" />
              <FInp label="Default Deposit Percentage (%)" type="number" value={settings.depositPct||20} onChange={e=>f("depositPct",+e.target.value)} tip="Applied as default to new orders" />
              <FInp label="Tax Rate (%)" type="number" value={settings.taxRate||0} onChange={e=>f("taxRate",+e.target.value)} tip="0% = No tax. Set GST % if applicable" />
              <div style={{background:T.oL,border:`1px solid ${T.oB}`,borderRadius:8,padding:14,marginTop:4}}>
                <p style={{fontSize:12,fontWeight:700,color:T.o,margin:"0 0 6px"}}>Example Penalty Calculation</p>
                <p style={{fontSize:13,color:T.tMd,margin:0}}>Order returned 3 days late → Penalty: ₹{(settings.penaltyRate||50)} × 3 days = <strong style={{color:T.red}}>₹{(settings.penaltyRate||50)*3}</strong></p>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center",marginTop:14}}>
                <Btn onClick={save}>Save</Btn>
                {saved&&<span style={{color:T.green,fontSize:13,fontWeight:600}}>✓ Saved!</span>}
              </div>
            </Card>
          )}

          {tab==="contracts" && (
            <Card>
              <SLabel>Document Numbering</SLabel>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px"}}>
                <FInp label="Invoice Prefix" value={settings.invoicePrefix||"INV"} onChange={e=>f("invoicePrefix",e.target.value)} />
                <FInp label="Quote Prefix"   value={settings.quotePrefix||"QUO"}   onChange={e=>f("quotePrefix",e.target.value)} />
              </div>
              <SLabel>Rental Contract Terms</SLabel>
              <p style={{fontSize:12,color:T.tSm,marginBottom:10}}>This text appears on all printed rental contracts.</p>
              <FTxt label="Contract Terms & Conditions" value={settings.contractText||""} onChange={e=>f("contractText",e.target.value)} style={{minHeight:160}} />
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <Btn onClick={save}>Save</Btn>
                {saved&&<span style={{color:T.green,fontSize:13,fontWeight:600}}>✓ Saved!</span>}
              </div>
            </Card>
          )}

          {tab==="categories" && (
            <Card>
              <SLabel>Cloth Categories</SLabel>
              <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:16}}>
                {CATS.map(cat=>(
                  <div key={cat} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:20,background:T.oL,border:`1px solid ${T.oB}`}}>
                    <span style={{fontSize:13,fontWeight:600,color:T.o}}>{cat}</span>
                  </div>
                ))}
              </div>
              <p style={{fontSize:12,color:T.tSm}}>Categories: Sherwani, Achkan, Suit, Kurtha, Loafer, Indo-Western, Bridal, Kids Wear, Saree, Accessories, Other</p>
              <div style={{display:"flex",gap:8,alignItems:"center",marginTop:14}}>
                <Btn onClick={save}>Save</Btn>
                {saved&&<span style={{color:T.green,fontSize:13,fontWeight:600}}>✓ Saved!</span>}
              </div>
            </Card>
          )}

          {tab==="notifications" && (
            <Card>
              <SLabel>Notification Preferences</SLabel>
              {[{l:"New booking received",d:"Alert when a new order is created",on:true},{l:"Order due for return",d:"Alert 24hrs before end date",on:true},{l:"Overdue return alert",d:"Alert when order is past return date",on:true},{l:"Deposit not collected",d:"Alert when order starts with unpaid deposit",on:true},{l:"Low stock warning",d:"When garment availability falls to 1",on:false},{l:"WhatsApp auto-message",d:"Send WhatsApp message on booking (manual)",on:false},{l:"Weekly summary",d:"Weekly business performance digest",on:false}].map((n,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"13px 0",borderBottom:`1px solid ${T.bdr}`}}>
                  <div><p style={{fontSize:13,fontWeight:600,color:T.text,margin:0}}>{n.l}</p><p style={{fontSize:11,color:T.tSm,margin:"2px 0 0"}}>{n.d}</p></div>
                  <Toggle checked={n.on} onChange={()=>{}} />
                </div>
              ))}
            </Card>
          )}

          {tab==="payments" && (
            <Card>
              <SLabel>Accepted Payment Methods</SLabel>
              {["Cash","UPI (Google Pay / PhonePe / Paytm)","Bank Transfer / NEFT","Cheque","Other"].map((m,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:`1px solid ${T.bdr}`}}>
                  <span style={{fontSize:13}}>{m}</span>
                  <Toggle checked={i<3} onChange={()=>{}} />
                </div>
              ))}
              <div style={{marginTop:14}}>
                <FInp label="UPI ID (shown on invoices)" value={settings.upiId||""} onChange={e=>f("upiId",e.target.value)} placeholder="yourname@upi" />
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <Btn onClick={save}>Save</Btn>
                {saved&&<span style={{color:T.green,fontSize:13,fontWeight:600}}>✓ Saved!</span>}
              </div>
            </Card>
          )}

          {tab==="team" && (
            <Card>
              <SLabel>Team Members</SLabel>
              {[{n:"You (Owner)",r:"Owner",c:T.o},{n:(settings.staff||[])[0]||"Staff 1",r:"Wash Staff",c:T.pur},{n:(settings.staff||[])[1]||"Staff 2",r:"Counter Staff",c:T.green}].map((m,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:`1px solid ${T.bdr}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:34,height:34,borderRadius:"50%",background:`${m.c}20`,color:m.c,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700}}>{m.n[0]}</div>
                    <div><p style={{fontWeight:600,fontSize:13,margin:0}}>{m.n}</p></div>
                  </div>
                  <Badge label={m.r} color={i===0?"orange":i===1?"blue":"green"} />
                </div>
              ))}
              <div style={{marginTop:14}}>
                <FInp label="Staff Names (comma separated — for wash queue assignment)" value={(settings.staff||[]).join(",")} onChange={e=>f("staff",e.target.value.split(",").map(x=>x.trim()).filter(Boolean))} placeholder="Seema, Ravi, Mohan" />
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <Btn onClick={save}>Save</Btn>
                {saved&&<span style={{color:T.green,fontSize:13,fontWeight:600}}>✓ Saved!</span>}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   NAV & APP ROOT
═══════════════════════════════════════════════════════════════ */
const NAV_ITEMS = [
  {id:"dashboard",  label:"Dashboard",  icon:"◉"},
  {id:"orders",     label:"Orders",     icon:"◫"},
  {id:"inventory",  label:"Inventory",  icon:"▦"},
  {id:"customers",  label:"Customers",  icon:"◐"},
  {id:"washing",    label:"Washing",    icon:"○"},
  {id:"calendar",   label:"Calendar",   icon:"▣"},
  {id:"documents",  label:"Documents",  icon:"◧"},
  {id:"reports",    label:"Reports",    icon:"◈"},
  {id:"settings",   label:"Settings",   icon:"◎"},
];

export default function App() {
  const [page,setPage]           = useState("dashboard");
  const [col,setCol]             = useState(false);
  const [items,setItems]         = usePersist("items",    SEED_ITEMS);
  const [custs,setCusts]         = usePersist("custs",    SEED_CUSTS);
  const [orders,setOrders]       = usePersist("orders",   SEED_ORDERS);
  const [wash,setWash]           = usePersist("wash",     SEED_WASH);
  const [settings,setSettings]   = usePersist("settings", SEED_SETTINGS);

  const activeCount  = orders.filter(o=>o.status==="active").length;
  const washPending  = wash.filter(w=>w.stage==="Pending Wash").length;
  const depPending   = orders.filter(o=>!o.depPaid&&!["cancelled","returned"].includes(o.status)).length;
  const overdueCount = orders.filter(o=>o.status==="active"&&o.end<today()).length;

  return (
    <div style={{display:"flex",height:"100vh",fontFamily:"Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",background:T.bg,overflow:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:5px;}
        ::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:4px;}
        select option{font-family:inherit;}
        @media print{
          aside, header, nav, .no-print{display:none!important;}
          main{padding:0!important;}
          body{background:#fff!important;}
        }
      `}</style>

      {/* ── SIDEBAR ── */}
      <aside style={{width:col?56:220,background:T.navy,display:"flex",flexDirection:"column",transition:"width 0.2s ease",flexShrink:0,overflow:"hidden",boxShadow:"2px 0 8px rgba(0,0,0,0.12)"}}>
        <div style={{height:58,display:"flex",alignItems:"center",gap:10,padding:col?"0":"0 16px",justifyContent:col?"center":"flex-start",borderBottom:"1px solid rgba(255,255,255,0.08)",flexShrink:0}}>
          <div style={{width:32,height:32,borderRadius:8,background:T.o,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>👗</div>
          {!col && (
            <div>
              <p style={{fontSize:13,fontWeight:700,color:"#fff",margin:0,letterSpacing:"-0.3px",whiteSpace:"nowrap"}}>{settings.bizName.split(" ").slice(0,2).join(" ")}</p>
              <p style={{fontSize:9,color:"rgba(255,255,255,0.4)",margin:0,whiteSpace:"nowrap"}}>Cloth Rental · Palakkad</p>
            </div>
          )}
        </div>

        <nav style={{flex:1,padding:"8px 0",overflowY:"auto"}}>
          {NAV_ITEMS.map(n=>{
            const act   = page===n.id;
            const badge = n.id==="orders"?activeCount:n.id==="washing"?washPending:0;
            const alert = n.id==="dashboard"&&overdueCount>0;
            return (
              <button key={n.id} onClick={()=>setPage(n.id)}
                style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:col?"10px 0":"9px 14px",background:act?"rgba(255,107,53,0.2)":"transparent",border:"none",cursor:"pointer",justifyContent:col?"center":"flex-start",borderLeft:act?`3px solid ${T.o}`:"3px solid transparent",marginBottom:1,transition:"background 0.15s"}}
                onMouseEnter={e=>{if(!act)e.currentTarget.style.background="rgba(255,255,255,0.07)";}}
                onMouseLeave={e=>{if(!act)e.currentTarget.style.background="transparent";}}>
                <span style={{fontSize:14,color:act?"#fff":"rgba(255,255,255,0.5)",flexShrink:0}}>{n.icon}</span>
                {!col && (
                  <>
                    <span style={{fontSize:13,fontWeight:act?600:400,color:act?"#fff":"rgba(255,255,255,0.55)",flex:1,textAlign:"left",whiteSpace:"nowrap"}}>{n.label}</span>
                    {badge>0 && <span style={{background:n.id==="washing"?T.o:T.red,color:"#fff",fontSize:10,fontWeight:700,padding:"1px 6px",borderRadius:10}}>{badge}</span>}
                    {alert && <span style={{background:T.red,color:"#fff",fontSize:10,fontWeight:700,padding:"1px 6px",borderRadius:10}}>!</span>}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        <button onClick={()=>setCol(p=>!p)}
          style={{padding:"11px 0",background:"transparent",border:"none",borderTop:"1px solid rgba(255,255,255,0.07)",cursor:"pointer",color:"rgba(255,255,255,0.3)",fontSize:12,display:"flex",alignItems:"center",gap:8,justifyContent:col?"center":"flex-start",paddingLeft:col?0:18}}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.05)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <span style={{display:"inline-block",transform:col?"rotate(180deg)":"none",transition:"transform 0.2s"}}>‹</span>
          {!col && <span>Collapse</span>}
        </button>
      </aside>

      {/* ── MAIN ── */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        {/* Topbar */}
        <header style={{background:T.white,borderBottom:`1px solid ${T.bdr}`,height:54,padding:"0 22px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0,boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
          <div style={{fontSize:13,color:T.tSm}}>
            <span style={{color:T.o,fontWeight:600}}>👗 {settings.bizName}</span>
            <span style={{margin:"0 7px",color:T.bdr2}}>›</span>
            <span style={{fontWeight:600,color:T.text}}>{NAV_ITEMS.find(n=>n.id===page)?.label}</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            {overdueCount>0 && <div style={{background:T.rL,border:`1px solid ${T.rB}`,borderRadius:6,padding:"4px 10px",fontSize:11,fontWeight:700,color:T.red,cursor:"pointer"}} onClick={()=>setPage("orders")}>⚠️ {overdueCount} overdue</div>}
            {depPending>0   && <div style={{background:T.yL,border:`1px solid ${T.yB}`,borderRadius:6,padding:"4px 10px",fontSize:11,fontWeight:700,color:T.yel}}>⏳ {depPending} dep. pending</div>}
            {washPending>0  && <div style={{background:T.oL,border:`1px solid ${T.oB}`,borderRadius:6,padding:"4px 10px",fontSize:11,fontWeight:700,color:T.o,cursor:"pointer"}} onClick={()=>setPage("washing")}>🫧 {washPending} to wash</div>}
            <WABtn phone={settings.whatsapp} />
            <div style={{width:32,height:32,borderRadius:"50%",background:T.o,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>AD</div>
          </div>
        </header>

        {/* Page */}
        <main style={{flex:1,overflowY:"auto",padding:22}}>
          {page==="dashboard" && <Dashboard orders={orders} items={items} custs={custs} wash={wash} settings={settings} setPage={setPage} />}
          {page==="orders"    && <Orders    orders={orders} setOrders={setOrders} items={items} custs={custs} setCusts={setCusts} setWash={setWash} settings={settings} />}
          {page==="inventory" && <Inventory items={items} setItems={setItems} />}
          {page==="customers" && <Customers custs={custs} setCusts={setCusts} orders={orders} />}
          {page==="washing"   && <Washing   wash={wash} setWash={setWash} settings={settings} />}
          {page==="calendar"  && <Calendar  orders={orders} custs={custs} items={items} />}
          {page==="documents" && <Documents orders={orders} custs={custs} settings={settings} />}
          {page==="reports"   && <Reports   orders={orders} items={items} custs={custs} />}
          {page==="settings"  && <Settings  settings={settings} setSettings={setSettings} />}
        </main>
      </div>
    </div>
  );
}
