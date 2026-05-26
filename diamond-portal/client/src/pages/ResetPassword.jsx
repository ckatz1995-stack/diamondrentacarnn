import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/client.js';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες'); return; }
    if (password !== confirm) { setError('Οι κωδικοί δεν ταιριάζουν'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/reset-password', { token, password });
      if (data.ok) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(data.message || 'Ο σύνδεσμος έχει λήξει. Ζητήστε νέο.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Σφάλμα. Ο σύνδεσμος ίσως έχει λήξει.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-brand-teal/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-brand-gold/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-gold mb-4">
            <span className="text-brand-dark font-black text-3xl">◆</span>
          </div>
          <h1 className="text-white font-black text-3xl">Diamond</h1>
          <p className="text-brand-gold font-medium tracking-widest text-sm uppercase mt-0.5">Rent A Car</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
          {success ? (
            <div className="text-center">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-white font-bold text-xl mb-3">Κωδικός Άλλαξε!</h2>
              <p className="text-gray-400 text-sm mb-6">
                Ο κωδικός σας άλλαξε επιτυχώς. Θα μεταφερθείτε αυτόματα στη σύνδεση...
              </p>
              <Link to="/login" className="text-brand-gold hover:text-yellow-300 font-bold text-sm">
                Πηγαίνετε στη σύνδεση →
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-white font-bold text-xl mb-2">Νέος κωδικός πρόσβασης</h2>
              <p className="text-gray-400 text-sm mb-6">Εισάγετε τον νέο σας κωδικό.</p>

              {!token && (
                <div className="mb-5 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                  ⚠️ Μη έγκυρος σύνδεσμος επαναφοράς. <Link to="/forgot-password" className="underline">Ζητήστε νέο σύνδεσμο</Link>.
                </div>
              )}

              {error && (
                <div className="mb-5 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm flex items-center gap-2">
                  <span>⚠️</span> <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Νέος κωδικός</label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      placeholder="Τουλάχιστον 8 χαρακτήρες"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal pr-12"
                    />
                    <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1">
                      {showPw ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Επιβεβαίωση κωδικού</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    required
                    placeholder="Επαναλάβετε τον κωδικό"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !token}
                  className="w-full py-3 bg-brand-teal hover:bg-teal-600 disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                >
                  {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {loading ? 'Αποθήκευση...' : 'Αποθήκευση νέου κωδικού'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
