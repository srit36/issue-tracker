import { useState } from 'react';

const API = import.meta.env.VITE_API_URL;

async function post(path, body, token) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body || {})
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function Login({ isOpen, onClose, onLoggedIn }) {
  const [mode, setMode] = useState('login');       // login | register
  const [step, setStep] = useState('credentials'); // credentials | mfa-setup | mfa-verify
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [qr, setQr] = useState('');
  const [secret, setSecret] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  if (!isOpen) return null;

  const reset = () => {
    setStep('credentials'); setPassword(''); setCode('');
    setTempToken(''); setQr(''); setSecret(''); setError('');
  };
  const close = () => { reset(); setInfo(''); onClose(); };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (step === 'credentials' && mode === 'register') {
        await post('/auth/register', { username, email, password });
        setMode('login'); setPassword('');
        setInfo('Registered. Now log in.');
      } else if (step === 'credentials') {
        const r = await post('/auth/login', { username, password });
        setTempToken(r.tempToken);
        setPassword('');
        if (r.step === 'mfa-setup') {
          const s = await post('/auth/mfa/setup', {}, r.tempToken);
          setQr(s.qrCode); setSecret(s.secret);
        }
        setStep(r.step);
      } else if (step === 'mfa-setup') {
        const r = await post('/auth/mfa/enable', { code }, tempToken);
        onLoggedIn(r); close();
      } else if (step === 'mfa-verify') {
        const r = await post('/auth/mfa/verify', { code }, tempToken);
        onLoggedIn(r); close();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const title =
    step === 'mfa-setup' ? 'Set up authenticator app'
    : step === 'mfa-verify' ? 'Enter authenticator code'
    : mode === 'register' ? 'Create account' : 'Log in';

  return (
    <div className="modal-overlay" onClick={close}>
      <form className="modal-panel" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h2>{title}</h2>

        {step === 'credentials' && (
          <>
            <input placeholder="Username" value={username} autoFocus required
                   onChange={(e) => setUsername(e.target.value)} />
            {mode === 'register' && (
              <input type="email" placeholder="Email" value={email} required
                     onChange={(e) => setEmail(e.target.value)} />
            )}
            <input type="password" placeholder="Password (min 10 characters)" value={password} required
                   onChange={(e) => setPassword(e.target.value)} />
          </>
        )}

        {step === 'mfa-setup' && (
          <>
            <p>Scan this QR code with Google or Microsoft Authenticator, then enter the 6-digit code.</p>
            {qr && <img src={qr} alt="TOTP QR code" style={{ width: 200, alignSelf: 'center' }} />}
            <p style={{ fontSize: 12, wordBreak: 'break-all' }}>Manual key: {secret}</p>
          </>
        )}

        {(step === 'mfa-setup' || step === 'mfa-verify') && (
          <input placeholder="6-digit code" value={code} inputMode="numeric" maxLength={6}
                 autoFocus required onChange={(e) => setCode(e.target.value)} />
        )}

        {info && <p style={{ color: 'green' }}>{info}</p>}
        {error && <p style={{ color: 'crimson' }}>{error}</p>}

        <div className="form-actions">
          <button type="button" onClick={close}>Cancel</button>
          <button type="submit" className="primary">
            {step === 'credentials' ? (mode === 'register' ? 'Register' : 'Continue') : 'Verify'}
          </button>
        </div>

        {step === 'credentials' && (
          <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setInfo(''); }}>
            {mode === 'login' ? 'No account? Register' : 'Have an account? Log in'}
          </button>
        )}
      </form>
    </div>
  );
}

export default Login;
