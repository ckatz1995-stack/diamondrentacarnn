import { formatDateTime } from '../../utils/greekDates.js';

const TICKET_STATUS = {
  open: { label: 'Ανοιχτό', class: 'bg-green-100 text-green-700' },
  pending: { label: 'Σε εξέλιξη', class: 'bg-yellow-100 text-yellow-700' },
  resolved: { label: 'Επιλύθηκε', class: 'bg-blue-100 text-blue-700' },
  closed: { label: 'Κλειστό', class: 'bg-gray-100 text-gray-600' },
};

export default function TicketList({ tickets, selectedId, onSelect }) {
  if (!tickets.length) return (
    <div className="text-center py-8 text-gray-400 text-sm">
      <div className="text-3xl mb-2">🎧</div>
      Δεν υπάρχουν αιτήματα υποστήριξης
    </div>
  );

  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-700">
      {tickets.map(ticket => {
        const statusCfg = TICKET_STATUS[ticket.status] || TICKET_STATUS.open;
        const isSelected = ticket._id === selectedId;
        return (
          <div
            key={ticket._id}
            onClick={() => onSelect(ticket)}
            className={`p-4 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
              isSelected ? 'bg-brand-teal/5 border-l-4 border-brand-teal' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-mono text-gray-400">#{ticket.ticketNumber || ticket._id?.slice(-6)}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusCfg.class}`}>{statusCfg.label}</span>
                  {ticket.unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5">{ticket.unreadCount}</span>
                  )}
                </div>
                <div className="font-semibold text-gray-800 dark:text-gray-200 text-sm truncate">{ticket.subject}</div>
                {ticket.category && <div className="text-xs text-gray-400 mt-0.5">{ticket.category}</div>}
                <div className="text-xs text-gray-400 mt-1">{formatDateTime(ticket.updatedAt || ticket.createdAt)}</div>
              </div>
              <span className="text-gray-300 text-sm">›</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
