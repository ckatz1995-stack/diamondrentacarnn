import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client.js';

function validatePassword(pw) {
  if (pw.length < 8) return 'Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες';
  if (!/[A-Z]/.test(pw)) return 'Ο κωδικός πρέπει να περιέχει κεφαλαίο γράμμα';
  if (!/[0-9]/.test(pw)) return 'Ο κωδικός πρέπει να περιέχει αριθμό';
  return '';
}

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [apiError, setApiError] = useState('');

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'Απαιτείται το όνομα';
    if (!form.lastName.trim()) errs.lastName = 'Απαιτείται το επώνυμο';
    if (!form.email.includes('@')) errs.email = 'Μη έγκυρο email';
    if (form.phone && !/^\+?[\d\s\-()]{7,}$/.test(form.phone)) errs.phone = 'Μη έγκυρος αριθμός τηλεφώνου';
    const pwErr = validatePassword(form.password);
    if (pwErr) errs.password = pwErr;
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Οι κωδικοί δεν ταιριάζουν';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
      });
      if (data.ok) {
        setSuccess(true);
      } else {
        setApiError(data.message || 'Σφάλμα κατά την εγγραφή');
      }
    } catch (err) {
      setApiError(err.response?.data?.message || 'Σφάλμα σύνδεσης. Δοκιμάστε ξανά.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 mb-6">
            <span className="text-4xl">✅</span>
          </div>
          <h2 className="text-white font-black text-2xl mb-3">Εγγραφή Επιτυχής!</h2>
          <p className="text-gray-400 mb-2">
            Σας έχουμε στείλει email επαλήθευσης στο <strong className="text-white">{form.email}</strong>.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Παρακαλώ ελέγξτε τα εισερχόμενά σας και κάντε κλικ στον σύνδεσμο επαλήθευσης για να ενεργοποιήσετε τον λογαριασμό σας.
          </p>
          <Link
            to="/login"
            className="inline-block bg-brand-teal text-white font-bold px-6 py-3 rounded-xl hover:bg-teal-600 transition-colors"
          >
            Πηγαίνετε στη σύνδεση
          </Link>
        </div>
      </div>
    );
  }

  const field = (label, key, type = 'text', placeholder = '', extra = {}) => (
    <div>
      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={set(key)}
        placeholder={placeholder}
        className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal ${
          errors[key] ? 'border-red-500/50' : 'border-white/20'
        }`}
        {...extra}
      />
      {errors[key] && <p className="text-red-400 text-xs mt-1">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-brand-teal/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-brand-gold/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-gold mb-4 shadow-lg shadow-brand-gold/20">
            <span className="text-brand-dark font-black text-3xl">◆</span>
          </div>
          <h1 className="text-white font-black text-3xl tracking-tight">Diamond</h1>
          <p className="text-brand-gold font-medium tracking-widest text-sm uppercase mt-0.5">Rent A Car</p>
          <p className="text-gray-400 text-sm mt-3">Δημιουργία νέου λογαριασμού μέλους</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-white font-bold text-xl mb-6">Εγγραφή</html>

          {apiError && (
            <div className="mb-5 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm flex items-center gap-2">
              <span>⚠️</span>
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {field('Όνομα', 'firstName', 'text', 'Γιώργος')}
              {field('Επώνυμο', 'lastName', 'text', 'Παπαδόπουλος')}
            </div>
            {field('Email', 'email', 'email', 'name@example.com', { autoComplete: 'email' })}
            {field('Τηλέφωνο', 'phone', 'tel', '+30 69X XXX XXXX')}

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Κωδικός πρόσβασης</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="Τουλάχιστον 8 χαρακτήρες"
                  className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal pr-12 ${errors.password ? 'border-red-500/50' : 'border-white/20'}`}
                />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1">
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
              <p className="text-gray-500 text-xs mt-1">Τουλάχιστον 8 χαρακτήρες, 1 κεφαλαίο, 1 αριθμός</p>
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Επιβεβαίωση κωδικού</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                  placeholder="Επαναλάβετε τον κωδικό"
                  className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal pr-12 ${errors.confirmPassword ? 'border-red-500/50' : 'border-white/20'}`}
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1">
                  {showConfirm ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-teal hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm mt-2"
            >
              {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {loading ? 'Εγγραφή...' : 'Δημιουργία λογαριασμού'}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Έχετε ήδη λογαριασμό;{' '}
            <Link to="/login" className="text-brand-gold hover:text-yellow-300 font-bold">Σύνδεση</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
