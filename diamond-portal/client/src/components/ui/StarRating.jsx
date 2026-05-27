import { useState } from 'react';
const LABELS = ['', 'Κακή', 'Μέτρια', 'Καλή', 'Πολύ καλή', 'Άριστη!'];

export default function StarRating({ value, onChange, size = 'lg' }) {
  const [hover, setHover] = useState(0);
  return (
    <div>
      <div className="flex gap-2 justify-center">
        {[1, 2, 3, 4, 5].map(v => (
          <button
            key={v}
            type="button"
            aria-label={`${v} αστέρια`}
            className={`${size === 'lg' ? 'text-4xl' : 'text-2xl'} transition-colors ${(hover || value) >= v ? 'text-brand-gold' : 'text-gray-200'}`}
            onMouseEnter={() => setHover(v)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(v)}
          >★</button>
        ))}
      </div>
      <p className="text-center text-sm text-gray-400 mt-1 h-5">{LABELS[hover || value] || 'Επιλέξτε βαθμολογία'}</p>
    </div>
  );
}
