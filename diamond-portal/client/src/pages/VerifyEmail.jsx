import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/client.js';

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) { setStatus('error'); setMessage('Μη έγκυρος σύνδεσμος επαλήθευσης.'); return; }
    api.get(`/auth/verify-email/${token}`)
      .then(({ data }) => {
        if (data.ok) {
          setStatus('success');
        } else {
          setStatus('error');
          setMessage(data.message || 'Ο σύνδεσμος έχει λήξει ή δεν είναι έγκυρος.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Ο σύνδεσμος έχει λήξει ή δεν είναι έγκυρος. Παρακαλώ ζητήστε νέο.');
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-brand-teal/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-brand-gold/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-gold mb-4">
            <span className="text-brand-dark font-black text-3xl">◆</span>
          </div>
          <h1 className="text-white font-black text-3xl">Diamond</h1>
          <p className="text-brand-gold font-medium tracking-widest text-sm uppercase mt-0.5">Rent A Car</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
          {status === 'loading' && (
            <>
              <div className="flex items-center justify-center mb-4">
                <div className="w-10 h-10 border-4 border-brand-teal border-t-transparent rounded-full animate-spin" />
              </div>
              <h2 className="text-white font-bold text-xl mb-2">Επαλήθευση email...</h2>
              <p className="text-gray-400 text-sm">Παρακαλώ περιμένετε.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-white font-bold text-xl mb-3">Email Επαληθεύτηκε!</h2>
              <p className="text-gray-400 text-sm mb-8">
                Ο λογαριασμός σας είναι πλέον ενεργός. Μπορείτε να συνδεθείτε.
              </p>
              <Link
                to="/login"
                className="inline-block bg-brand-teal text-white font-bold px-6 py-3 rounded-xl hover:bg-teal-600 transition-colors text-sm"
              >
                Σύνδεση τώρα
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="text-5xl mb-4">❌</div>
              <h2 className="text-white font-bold text-xl mb-3">Αποτυχία Επαλήθευσης</h2>
              <p className="text-gray-400 text-sm mb-8">{message}</p>
              <div className="flex flex-col gap-3">
                <Link
                  to="/login"
                  className="inline-block bg-brand-teal text-white font-bold px-6 py-3 rounded-xl hover:bg-teal-600 transition-colors text-sm"
                >
                  Πηγαίνετε στη σύνδεση
                </Link>
                <Link to="/register" className="text-brand-gold hover:text-yellow-300 text-sm font-medium">
                  Νέα εγγραφή
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
