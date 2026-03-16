'use client'
// app/auth/login/page.tsx — Fabb.booking Login
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [tab, setTab]       = useState<'google' | 'staff'>('google')
  const [email, setEmail]   = useState('')
  const [pass, setPass]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const router              = useRouter()

  async function loginGoogle() {
    setLoading(true)
    await signIn('google', { callbackUrl: '/dashboard' })
  }

  async function loginStaff(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await signIn('credentials', {
      email, password: pass, redirect: false,
    })
    if (res?.error) {
      setError('Invalid email or password')
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  const O = '#FF6B35'
  const NAVY = '#1a1a2e'

  return (
    <div style={{minHeight:'100vh',display:'flex',fontFamily:"'Inter','Segoe UI',sans-serif"}}>
      {/* Left panel — branding */}
      <div style={{flex:'0 0 45%',background:NAVY,display:'flex',flexDirection:'column',justifyContent:'center',padding:'48px 56px',color:'#fff'}} className="login-left">
        <div style={{marginBottom:48}}>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:32}}>
            <div style={{width:44,height:44,borderRadius:10,background:O,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,fontWeight:800,color:'#fff',flexShrink:0}}>F</div>
            <div>
              <h1 style={{margin:0,fontSize:22,fontWeight:800,letterSpacing:'-0.5px'}}>Fabb.booking</h1>
              <p style={{margin:0,fontSize:12,color:'rgba(255,255,255,0.5)'}}>Rental Management Platform</p>
            </div>
          </div>
          <h2 style={{fontSize:32,fontWeight:800,lineHeight:1.25,margin:'0 0 16px',letterSpacing:'-0.5px'}}>
            The complete<br />rental business<br />platform
          </h2>
          <p style={{fontSize:14,color:'rgba(255,255,255,0.65)',lineHeight:1.7,margin:0}}>
            Manage inventory, orders, customers, washing, reports, and more — all in one place.
          </p>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          {[
            {icon:'📋',title:'Orders & Bookings',desc:'Manage the full rental lifecycle'},
            {icon:'👗',title:'Inventory Tracking',desc:'QR codes, categories, availability'},
            {icon:'📊',title:'Reports & Analytics',desc:'Revenue, utilization, exports'},
            {icon:'✉️',title:'Email Notifications',desc:'Automatic confirmations & reminders'},
            {icon:'👥',title:'Team Management',desc:'Roles, invites, activity log'},
          ].map(({icon,title,desc}) => (
            <div key={title} style={{display:'flex',alignItems:'center',gap:12}}>
              <span style={{fontSize:20,width:32,textAlign:'center'}}>{icon}</span>
              <div>
                <p style={{margin:0,fontWeight:600,fontSize:13}}>{title}</p>
                <p style={{margin:0,fontSize:11,color:'rgba(255,255,255,0.5)'}}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — login form */}
      <div style={{flex:1,background:'#F4F5F8',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
        <div style={{background:'#fff',borderRadius:16,padding:'40px 44px',width:'100%',maxWidth:420,boxShadow:'0 4px 32px rgba(0,0,0,0.08)'}}>

          <div style={{marginBottom:28}}>
            <h2 style={{fontSize:22,fontWeight:800,color:'#111827',margin:'0 0 6px',letterSpacing:'-0.3px'}}>Welcome back</h2>
            <p style={{fontSize:13,color:'#6B7280',margin:0}}>Sign in to your Fabb.booking account</p>
          </div>

          {/* Tabs */}
          <div style={{display:'flex',background:'#F4F5F8',borderRadius:10,padding:3,marginBottom:24,gap:2}}>
            {(['google','staff'] as const).map(t=>(
              <button key={t} onClick={()=>{setTab(t);setError('');}} style={{flex:1,padding:'9px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:600,background:tab===t?'#fff':'transparent',color:tab===t?'#111827':'#6B7280',boxShadow:tab===t?'0 1px 6px rgba(0,0,0,0.1)':'none',transition:'all 0.15s',fontFamily:'inherit'}}>
                {t==='google'?'Google Sign In':'Staff Login'}
              </button>
            ))}
          </div>

          {tab==='google' && (
            <div>
              <p style={{fontSize:13,color:'#6B7280',textAlign:'center',marginBottom:20,lineHeight:1.6}}>
                For <strong style={{color:'#111827'}}>Owners &amp; Managers</strong> — sign in securely with your Google account
              </p>
              <button onClick={loginGoogle} disabled={loading}
                style={{width:'100%',padding:'13px 16px',borderRadius:10,border:'1.5px solid #E5E7EB',background:loading?'#F9FAFB':'#fff',cursor:loading?'not-allowed':'pointer',fontFamily:'inherit',fontSize:14,fontWeight:600,color:'#374151',display:'flex',alignItems:'center',justifyContent:'center',gap:12,transition:'all 0.2s',boxShadow:'0 1px 4px rgba(0,0,0,0.06)'}}
                onMouseEnter={e=>{if(!loading)(e.currentTarget as HTMLButtonElement).style.background='#F9FAFB';}}
                onMouseLeave={e=>{if(!loading)(e.currentTarget as HTMLButtonElement).style.background='#fff';}}>
                {loading ? (
                  <div style={{width:20,height:20,borderRadius:'50%',border:'2px solid #E5E7EB',borderTopColor:O,animation:'spin 0.8s linear infinite'}} />
                ) : (
                  <svg width="20" height="20" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.5 33.7 29.2 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l5.7-5.7C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.9 0 20-7.9 20-21 0-1.4-.1-2.7-.4-4z"/>
                    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3.1 0 5.9 1.1 8.1 2.9l5.7-5.7C34.5 5.1 29.5 3 24 3c-7.7 0-14.4 4.4-17.7 10.7z"/>
                    <path fill="#4CAF50" d="M24 45c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.5 36.6 26.9 37.5 24 37.5c-5.1 0-9.5-3.3-11.1-7.9L6.3 35c3.3 6.3 10 10 17.7 10z"/>
                    <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.4-2.5 4.4-4.6 5.8l6.2 5.2c-.4.3 5.1-3.9 6.7-10.6.2-1.3.4-2.7.4-4.1-.1-.7-.1-1.4-.4-4.3z"/>
                  </svg>
                )}
                {loading ? 'Signing in…' : 'Continue with Google'}
              </button>
              <p style={{fontSize:11,color:'#9CA3AF',textAlign:'center',marginTop:16,lineHeight:1.6}}>
                Only pre-authorized accounts can access this system
              </p>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          )}

          {tab==='staff' && (
            <form onSubmit={loginStaff}>
              <p style={{fontSize:13,color:'#6B7280',textAlign:'center',marginBottom:20,lineHeight:1.6}}>
                For <strong style={{color:'#111827'}}>Counter &amp; Wash Staff</strong> — use your assigned credentials
              </p>
              {error && (
                <div style={{background:'#FEE2E2',border:'1px solid #FCA5A5',borderRadius:8,padding:'10px 13px',fontSize:13,color:'#DC2626',marginBottom:16,display:'flex',alignItems:'center',gap:8}}>
                  <span>⚠️</span>{error}
                </div>
              )}
              <div style={{marginBottom:14}}>
                <label style={{display:'block',fontSize:12,fontWeight:600,color:'#374151',marginBottom:6}}>Email Address</label>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="staff@example.com"
                  style={{width:'100%',padding:'10px 13px',border:'1.5px solid #E5E7EB',borderRadius:8,fontSize:13,fontFamily:'inherit',outline:'none',boxSizing:'border-box',transition:'border-color 0.15s'}}
                  onFocus={e=>e.currentTarget.style.borderColor=O}
                  onBlur={e=>e.currentTarget.style.borderColor='#E5E7EB'} />
              </div>
              <div style={{marginBottom:6}}>
                <label style={{display:'block',fontSize:12,fontWeight:600,color:'#374151',marginBottom:6}}>Password</label>
                <input type="password" value={pass} onChange={e=>setPass(e.target.value)} required placeholder="••••••••"
                  style={{width:'100%',padding:'10px 13px',border:'1.5px solid #E5E7EB',borderRadius:8,fontSize:13,fontFamily:'inherit',outline:'none',boxSizing:'border-box',transition:'border-color 0.15s'}}
                  onFocus={e=>e.currentTarget.style.borderColor=O}
                  onBlur={e=>e.currentTarget.style.borderColor='#E5E7EB'} />
              </div>
              <div style={{textAlign:'right',marginBottom:20}}>
                <span style={{fontSize:12,color:O,cursor:'pointer',fontWeight:600}}>Forgot password?</span>
              </div>
              <button type="submit" disabled={loading}
                style={{width:'100%',padding:'12px',borderRadius:8,background:loading?'#FDA07A':O,color:'#fff',border:'none',fontSize:14,fontWeight:700,cursor:loading?'not-allowed':'pointer',fontFamily:'inherit',transition:'background 0.15s',letterSpacing:'0.2px'}}>
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
              <p style={{fontSize:11,color:'#9CA3AF',textAlign:'center',marginTop:14,lineHeight:1.6}}>
                Contact the owner to get your login credentials
              </p>
            </form>
          )}

          {/* Access level legend */}
          <div style={{marginTop:24,padding:'12px 14px',background:'#F9FAFB',borderRadius:10,border:'1px solid #F3F4F6'}}>
            <p style={{fontSize:10,fontWeight:700,color:'#9CA3AF',textTransform:'uppercase',letterSpacing:'0.8px',margin:'0 0 8px'}}>Access Levels</p>
            {[
              ['👑','Owner','Google login','Full access'],
              ['👔','Manager','Google login','All except settings'],
              ['🧾','Counter Staff','Email + password','Orders & customers'],
              ['🧺','Wash Staff','Email + password','Washing tracker only'],
            ].map(([ico,role,how,what])=>(
              <div key={role} style={{display:'flex',alignItems:'center',gap:8,marginBottom:4,fontSize:11}}>
                <span>{ico}</span>
                <span style={{fontWeight:600,color:'#374151',minWidth:80}}>{role}</span>
                <span style={{color:'#9CA3AF'}}>{how} · {what}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .login-left { display: none !important; }
        }
      `}</style>
    </div>
  )
}
