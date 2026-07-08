import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Lock, User, Loader, UserCheck, Ghost, Eye, EyeOff } from 'lucide-react'
import { authAPI } from '../../services/api'
import { useCustomerStore } from '../../store'
import { getGuestToken } from '../../hooks/useGuestToken'
import toast from 'react-hot-toast'

export default function CustomerAuthPage() {
  const [tab, setTab] = useState('login') // login | register | guest
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name:'', email:'', password:'', phone:'' })
  const [guestName, setGuestName] = useState('')
  const { login, setGuest } = useCustomerStore()
  const navigate = useNavigate()
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleLogin = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const payload = form.email ? { email: form.email, password: form.password } : { studentId: form.studentId, password: form.password }
      const res = await authAPI.customerLogin(payload)
      login(res.data.data.customer, res.data.data.token)
      toast.success(`Welcome back, ${res.data.data.customer.name}! 👋`)
      navigate('/')
    } catch (e) { toast.error(e.response?.data?.error || 'Login failed') }
    finally { setLoading(false) }
  }

  const handleRegister = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const res = await authAPI.customerRegister(form)
      login(res.data.data.customer, res.data.data.token)
      toast.success(`Account created! Welcome, ${res.data.data.customer.name} 🎉`)
      navigate('/')
    } catch (e) { toast.error(e.response?.data?.error || 'Registration failed') }
    finally { setLoading(false) }
  }

  const handleGuest = async () => {
    setLoading(true)
    try {
      const guestToken = getGuestToken()
      const res = await authAPI.guestSession({ guestToken, name: guestName || 'Guest' })
      setGuest(res.data.data.customer, res.data.data.token, guestToken)
      toast.success('Continuing as guest 👤')
      navigate('/')
    } catch (e) { toast.error('Something went wrong') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-alu-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm mb-6 -ml-2 text-alu-muted">
          <ArrowLeft size={15} /> Back
        </button>

        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🍽️</div>
          <h1 className="text-2xl font-black text-alu-cream">Join CaféCampus</h1>
          <p className="text-alu-muted text-sm mt-1">Order food from your school cafeteria</p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-alu-card rounded-2xl p-1 mb-5">
          {[['login','Sign In'], ['register','Create Account'], ['guest','Continue as Guest']].map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${tab===t ? 'bg-alu-surface text-alu-cream shadow-sm' : 'text-alu-muted hover:text-alu-cream'}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="card p-5">
          {/* ── LOGIN ── */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <p className="text-sm text-alu-muted mb-1">Sign in with email <strong className="text-alu-cream">or</strong> student ID</p>
              <div>
                <label className="label">Email or Student ID</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-alu-muted" />
                  <input value={form.email || form.studentId} onChange={e => {
                    const v = e.target.value
                    if (v.includes('@')) setForm(p => ({ ...p, email:v, studentId:'' }))
                    else setForm(p => ({ ...p, studentId:v, email:'' }))
                  }} className="input pl-9" placeholder="alice@school.ac.rw or STU001" required />
                </div>
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-alu-muted" />
                  <input type={showPw?'text':'password'} value={form.password} onChange={f('password')} className="input pl-9 pr-10" placeholder="••••••••" required />
                  <button type="button" onClick={() => setShowPw(s=>!s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-alu-muted">{showPw?<EyeOff size={14}/>:<Eye size={14}/>}</button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary w-full btn-lg mt-1">
                {loading ? <Loader size={16} className="animate-spin" /> : <UserCheck size={16} />}
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          )}

          {/* ── REGISTER ── */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="label">Full Name *</label>
                  <div className="relative"><User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-alu-muted" /><input value={form.name} onChange={f('name')} className="input pl-9" placeholder="Alice Uwimana" required /></div>
                </div>
                <div className="col-span-2">
                  <label className="label">Email *</label>
                  <div className="relative"><Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-alu-muted" /><input type="email" value={form.email} onChange={f('email')} className="input pl-9" placeholder="you@school.ac.rw" required /></div>
                </div>
                <div className="col-span-2">
                  <label className="label">Password * (min 6 chars)</label>
                  <div className="relative"><Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-alu-muted" /><input type={showPw?'text':'password'} value={form.password} onChange={f('password')} className="input pl-9 pr-10" placeholder="••••••••" required minLength={6} /><button type="button" onClick={() => setShowPw(s=>!s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-alu-muted">{showPw?<EyeOff size={14}/>:<Eye size={14}/>}</button></div>
                </div>
                <div className="col-span-2">
                  <label className="label">Phone</label>
                  <input value={form.phone} onChange={f('phone')} className="input" placeholder="+250 78..." />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary w-full btn-lg mt-1">
                {loading ? <Loader size={16} className="animate-spin" /> : null}
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
            </form>
          )}

          {/* ── GUEST ── */}
          {tab === 'guest' && (
            <div className="space-y-4">
              <div className="bg-alu-gold/10 border border-alu-gold/25 rounded-xl p-3 text-sm text-alu-gold">
                <p className="font-semibold mb-1">👤 Order as a Guest</p>
                <p className="text-xs text-alu-gold/80">No account needed. Your order history will be saved on this device only.</p>
              </div>
              <div>
                <label className="label">Your Name (optional)</label>
                <div className="relative"><User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-alu-muted" /><input value={guestName} onChange={e => setGuestName(e.target.value)} className="input pl-9" placeholder="e.g. Alice" /></div>
              </div>
              <button onClick={handleGuest} disabled={loading} className="btn btn-dark w-full btn-lg">
                {loading ? <Loader size={16} className="animate-spin" /> : <Ghost size={16} />}
                {loading ? 'Setting up…' : 'Continue as Guest'}
              </button>
              <p className="text-xs text-alu-muted text-center">You can create a full account later to unlock order history and rewards.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
