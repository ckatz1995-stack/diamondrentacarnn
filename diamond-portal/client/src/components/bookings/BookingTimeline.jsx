import { STATUS_LABELS } from '../../utils/statusColors.js';

const STEPS = ['Pending', 'Confirmed', 'Active', 'Completed'];

const STEP_ICONS = {
  Pending: '🕐',
  Confirmed: '✅',
  Active: '🚗',
  Completed: '🏁',
  Canceled: '❌',
};

const STEP_LABELS = {
  Pending: 'Σε αναμονή',
  Confirmed: 'Επιβεβαιωμένη',
  Active: 'Σε εξέλιξη',
  Completed: 'Ολοκληρωμένη',
  Canceled: 'Ακυρωμένη',
};

export default function BookingTimeline({ status }) {
  if (status === 'Canceled') {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
        <span className="text-2xl">❌</span>
        <div>
          <div className="font-bold text-red-700 dark:text-red-400">Ακυρωμένη κράτηση</div>
          <div className="text-sm text-red-500">Η κράτηση έχει ακυρωθεί</div>
        </div>
      </div>
    );
  }

  const currentIndex = STEPS.indexOf(status);

  return (
    <div className="relative">
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 z-0" />
        <div
          className="absolute top-5 left-0 h-0.5 bg-brand-teal z-0 transition-all duration-500"
          style={{ width: currentIndex >= 0 ? `${(currentIndex / (STEPS.length - 1)) * 100}%` : '0%' }}
        />

        {STEPS.map((step, idx) => {
          const done = idx < currentIndex;
          const active = idx === currentIndex;
          return (
            <div key={step} className="flex flex-col items-center gap-2 z-10 flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all ${
                done ? 'bg-brand-teal border-brand-teal text-white' :
                active ? 'bg-white dark:bg-gray-800 border-brand-teal ring-4 ring-brand-teal/20' :
                'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'
              }`}>
                {STEP_ICONS[step]}
              </div>
              <div className={`text-xs font-medium text-center ${active ? 'text-brand-teal font-bold' : done ? 'text-gray-500' : 'text-gray-400'}`}>
                {STEP_LABELS[step]}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
