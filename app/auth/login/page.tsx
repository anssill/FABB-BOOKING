'use client'
// app/auth/login/page.tsx
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

  return (
    <div style={{minHeight:'100vh',background:'#F4F5F8',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Inter,sans-serif',padding:16}}>
      <div style={{background:'#fff',borderRadius:12,padding:'36px 40px',width:'100%',maxWidth:400,boxShadow:'0 4px 24px rgba(0,0,0,0.1)'}}>

        {/* Logo */}
        <div style={{textAlign:'center',marginBottom:28}}>
          <div style={{width:52,height:52,borderRadius:12,background:O,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,margin:'0 auto 12px'}}>👗</div>
          <h1 style={{fontSize:22,fontWeight:800,color:'#111827',margin:'0 0 4px',letterSpacing:'-0.5px'}}>fabb.booking</h1>
          <p style={{fontSize:13,color:'#6B7280',margin:0}}>Ansil Dress House · Palakkad</p>
        </div>

        {/* Tabs */}
        <div style={{display:'flex',background:'#F4F5F8',borderRadius:8,padding:3,marginBottom:22,gap:2}}>
          {(['google','staff'] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:'8px',borderRadius:6,border:'none',cursor:'pointer',fontSize:13,fontWeight:600,background:tab===t?'#fff':'transparent',color:tab===t?'#111827':'#6B7280',boxShadow:tab===t?'0 1px 4px rgba(0,0,0,0.08)':'none'}}>
              {t==='google'?'🔑 Google Sign In':'👤 Staff Login'}
            </button>
          ))}
        </div>

        {tab==='google' && (
          <div>
            <p style={{fontSize:13,color:'#6B7280',textAlign:'center',marginBottom:18,lineHeight:1.6}}>
              For <strong>Owners & Managers</strong> — sign in with your Google account
            </p>
            <button onClick={loginGoogle} disabled={loading}
              style={{width:'100%',padding:'12px',borderRadius:8,border:'1px solid #E5E7EB',background:'#fff',cursor:'pointer',fontFamily:'inherit',fontSize:14,fontWeight:600,color:'#374151',display:'flex',alignItems:'center',justifyContent:'center',gap:10,transition:'all 0.2s'}}
              onMouseEnter={e=>e.currentTarget.style.background='#F9FAFB'}
              onMouseLeave={e=>e.currentTarget.style.background='#fff'}>
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.5 33.7 29.2 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l5.7-5.7C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.9 0 20-7.9 20-21 0-1.4-.1-2.7-.4-4z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3.1 0 5.9 1.1 8.1 2.9l5.7-5.7C34.5 5.1 29.5 3 24 3c-7.7 0-14.4 4.4-17.7 10.7z"/>
                <path fill="#4CAF50" d="M24 45c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.5 36.6 26.9 37.5 24 37.5c-5.1 0-9.5-3.3-11.1-7.9L6.3 35c3.3 6.3 10 10 17.7 10z"/>
                <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.4-2.5 4.4-4.6 5.8l6.2 5.2c-.4.3 5.1-3.9 6.7-10.6.2-1.3.4-2.7.4-4.1-.1-.7-.1-1.4-.4-4.3z"/>
              </svg>
              {loading ? 'Signing in…' : 'Continue with Google'}
            </button>
            <p style={{fontSize:11,color:'#9CA3AF',textAlign:'center',marginTop:14}}>
              Only registered accounts can access this system
            </p>
          </div>
        )}

        {tab==='staff' && (
          <form onSubmit={loginStaff}>
            <p style={{fontSize:13,color:'#6B7280',textAlign:'center',marginBottom:18,lineHeight:1.6}}>
              For <strong>Counter Staff & Wash Staff</strong> — use your assigned email & password
            </p>
            {error && <div style={{background:'#FEE2E2',border:'1px solid #FCA5A5',borderRadius:7,padding:'10px 13px',fontSize:13,color:'#DC2626',marginBottom:14}}>{error}</div>}
            <div style={{marginBottom:14}}>
              <label style={{display:'block',fontSize:12,fontWeight:600,color:'#374151',marginBottom:5}}>Email Address</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="staff@example.com"
                style={{width:'100%',padding:'9px 12px',border:'1.5px solid #E5E7EB',borderRadius:7,fontSize:13,fontFamily:'inherit',outline:'none',boxSizing:'border-box'}} />
            </div>
            <div style={{marginBottom:18}}>
              <label style={{display:'block',fontSize:12,fontWeight:600,color:'#374151',marginBottom:5}}>Password</label>
              <input type="password" value={pass} onChange={e=>setPass(e.target.value)} required placeholder="••••••••"
                style={{width:'100%',padding:'9px 12px',border:'1.5px solid #E5E7EB',borderRadius:7,fontSize:13,fontFamily:'inherit',outline:'none',boxSizing:'border-box'}} />
            </div>
            <button type="submit" disabled={loading}
              style={{width:'100%',padding:'11px',borderRadius:7,background:O,color:'#fff',border:'none',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'inherit',opacity:loading?0.7:1}}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
            <p style={{fontSize:11,color:'#9CA3AF',textAlign:'center',marginTop:12}}>
              Contact the owner to get your login credentials
            </p>
          </form>
        )}

        {/* Role legend */}
        <div style={{marginTop:24,padding:'12px 14px',background:'#F4F5F8',borderRadius:8}}>
          <p style={{fontSize:11,fontWeight:700,color:'#6B7280',textTransform:'uppercase',letterSpacing:'0.5px',margin:'0 0 8px'}}>Access Levels</p>
          {[['👑','Owner','ansilav78@gmail.com','Full access'],['👔','Manager','Google login','All except settings'],['🧾','Counter','Email + password','Orders & customers'],['🧺','Wash Staff','Email + password','Washing tracker only']].map(([ico,role,how,what])=>(
            <div key={role} style={{display:'flex',alignItems:'center',gap:8,marginBottom:5,fontSize:11}}>
              <span>{ico}</span>
              <span style={{fontWeight:600,color:'#374151',width:70}}>{role}</span>
              <span style={{color:'#9CA3AF'}}>{how} · {what}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
