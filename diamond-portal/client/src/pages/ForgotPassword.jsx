import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      if (data.ok) {
        setSent(true);
      } else {
        setError(data.message || 'Σφάλμα. Δοκιμάστε ξανά.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Σφάλμα σύνδεσης. Δοκιμάστε ξανά.');
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
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-gold mb-4">
            <span className="text-brand-dark font-black text-3xl">◆</span>
          </div>
          <h1 className="text-white font-black text-3xl">Diamond</h1>
          <p className="text-brand-gold font-medium tracking-widest text-sm uppercase mt-0.5">Rent A Car</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
          {sent ? (
            <div className="text-center">
              <div className="text-5xl mb-4">📧</div>
              <h2 className="text-white font-bold text-xl mb-3">Email Εστάλη!</h2>
              <p className="text-gray-400 text-sm mb-2">
                Αν υπάρχει λογαριασμός με email <strong className="text-white">{email}</strong>, θα λάβετε οδηγίες επαναφοράς κωδικού.
              </p>
              <p className="text-gray-500 text-xs mb-8">Ελέγξτε και τον φάκελο spam.</p>
              <Link
                to="/login"
                className="inline-block text-brand-gold hover:text-yellow-300 font-bold text-sm"
              >
                ← Επιστροφή στη σύνδεση
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-white font-bold text-xl mb-2">Ανάκτηση κωδικού</h2>
              <p className="text-gray-400 text-sm mb-6">
                Εισάγετε το email σας και θα σας στείλουμε οδηγίες επαναφοράς.
              </p>

              {error && (
                <div className="mb-5 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm flex items-center gap-2">
                  <span>⚠️</span> <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full py-3 bg-brand-teal hover:bg-teal-600 disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                >
                  {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {loading ? 'Αποστολή...' : 'Αποστολή οδηγιών'}
                </button>
              </form>

              <p className="text-center mt-6">
                <Link to="/login" className="text-gray-400 hover:text-white text-sm">← Επιστροφή στη σύνδεση</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
