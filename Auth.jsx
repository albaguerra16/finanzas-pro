import { useState } from 'react'
import { supabase } from './supabase.js'

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)

  const C = {
    bg:'#070712', surf:'#0F0F1E', bord:'rgba(255,255,255,0.08)',
    acc:'#818CF8', grn:'#34D399', red:'#F87171', txt:'#E8E8F8', mut:'rgba(255,255,255,0.4)'
  }
  const inp = {
    width:'100%', background:'rgba(255,255,255,.06)', border:`1px solid ${C.bord}`,
    borderRadius:12, color:C.txt, padding:'13px 16px', fontSize:15, outline:'none',
    fontFamily:"'Plus Jakarta Sans',sans-serif", marginBottom:12, boxSizing:'border-box'
  }
  const btn1 = {
    width:'100%', background:`linear-gradient(135deg,${C.acc},#6366F1)`, border:'none',
    borderRadius:12, color:'#fff', padding:'14px', fontSize:16, fontWeight:800,
    cursor:'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif", marginTop:4
  }

  const handle = async () => {
    if (!email || !password) { setMsg({t:'err', m:'Completa todos los campos'}); return }
    setLoading(true); setMsg(null)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMsg({t:'ok', m:'¡Cuenta creada! Revisa tu email para confirmar.'})
      }
    } catch (e) {
      setMsg({t:'err', m: e.message === 'Invalid login credentials' ? 'Email o contraseña incorrectos' : e.message})
    }
    setLoading(false)
  }

  const handleForgot = async () => {
    if (!email) { setMsg({t:'err', m:'Escribe tu email primero'}); return }
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    setLoading(false)
    if (error) setMsg({t:'err', m: error.message})
    else setMsg({t:'ok', m:'¡Revisa tu email para restablecer tu contraseña!'})
  }

  return (
    <div style={{minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', padding:20}}>
      <div style={{width:'100%', maxWidth:400}}>
        <div style={{textAlign:'center', marginBottom:40}}>
          <div style={{fontSize:52, marginBottom:12}}>💸</div>
          <div style={{fontSize:28, fontWeight:900, background:`linear-gradient(100deg,${C.acc},${C.grn})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>
            Finanzas Pro
          </div>
          <div style={{fontSize:14, color:C.mut, marginTop:6}}>Controla tu dinero desde cualquier dispositivo</div>
        </div>
        <div style={{background:C.surf, border:`1px solid ${C.bord}`, borderRadius:20, padding:'28px 24px'}}>
          <div style={{fontSize:20, fontWeight:800, marginBottom:22}}>
            {mode==='login' ? '¡Bienvenida de vuelta! 👋' : mode==='register' ? 'Crear cuenta ✨' : 'Recuperar contraseña 🔑'}
          </div>
          {msg && (
            <div style={{background: msg.t==='err'?'rgba(248,113,113,.12)':'rgba(52,211,153,.12)', border:`1px solid ${msg.t==='err'?'rgba(248,113,113,.3)':'rgba(52,211,153,.3)'}`, borderRadius:10, padding:'10px 14px', fontSize:13, color: msg.t==='err'?C.red:C.grn, marginBottom:16}}>
              {msg.m}
            </div>
          )}
          <input style={inp} type="email" placeholder="Tu email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handle()}/>
          {mode !== 'forgot' && (
            <input style={inp} type="password" placeholder="Contraseña" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handle()}/>
          )}
          {mode === 'forgot' ? (
            <button style={btn1} onClick={handleForgot} disabled={loading}>{loading ? 'Enviando...' : 'Enviar link de recuperación'}</button>
          ) : (
            <button style={btn1} onClick={handle} disabled={loading}>{loading ? 'Cargando...' : mode==='login' ? 'Entrar' : 'Crear cuenta'}</button>
          )}
          <div style={{marginTop:20, textAlign:'center', fontSize:14, color:C.mut}}>
            {mode === 'login' && <>
              ¿No tienes cuenta?{' '}
              <button onClick={()=>{setMode('register');setMsg(null)}} style={{background:'none',border:'none',color:C.acc,cursor:'pointer',fontWeight:700,fontSize:14}}>Regístrate</button>
              <br/><br/>
              <button onClick={()=>{setMode('forgot');setMsg(null)}} style={{background:'none',border:'none',color:C.mut,cursor:'pointer',fontSize:13}}>¿Olvidaste tu contraseña?</button>
            </>}
            {mode === 'register' && <>
              ¿Ya tienes cuenta?{' '}
              <button onClick={()=>{setMode('login');setMsg(null)}} style={{background:'none',border:'none',color:C.acc,cursor:'pointer',fontWeight:700,fontSize:14}}>Inicia sesión</button>
            </>}
            {mode === 'forgot' && <>
              <button onClick={()=>{setMode('login');setMsg(null)}} style={{background:'none',border:'none',color:C.acc,cursor:'pointer',fontWeight:700,fontSize:14}}>← Volver</button>
            </>}
          </div>
        </div>
        <div style={{textAlign:'center', marginTop:20, fontSize:12, color:'rgba(255,255,255,.2)'}}>
          Tus datos son privados y seguros 🔒
        </div>
      </div>
    </div>
  )
}
