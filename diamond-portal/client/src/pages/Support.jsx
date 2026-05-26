import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from '../contexts/NotificationContext.jsx';
import { formatDateTime } from '../utils/greekDates.js';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import Button from '../components/ui/Button.jsx';
import ContactForm from '../components/support/ContactForm.jsx';
import TicketList from '../components/support/TicketList.jsx';
import api from '../api/client.js';

const TICKET_STATUS = {
  open: { label: 'Ανοιχτό', class: 'bg-green-100 text-green-700' },
  pending: { label: 'Σε εξέλιξη', class: 'bg-yellow-100 text-yellow-700' },
  resolved: { label: 'Επιλύθηκε', class: 'bg-blue-100 text-blue-700' },
  closed: { label: 'Κλειστό', class: 'bg-gray-100 text-gray-600' },
};

export default function Support() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);
  const [contactFormOpen, setContactFormOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/support/tickets');
      if (data.ok) setTickets(data.tickets || []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const fetchMessages = useCallback(async (ticketId) => {
    setMsgLoading(true);
    try {
      const { data } = await api.get(`/support/tickets/${ticketId}/messages`);
      if (data.ok) setMessages(data.messages || []);
    } catch {}
    finally { setMsgLoading(false); }
  }, []);

  useEffect(() => {
    if (selectedTicket) fetchMessages(selectedTicket._id);
  }, [selectedTicket, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectTicket = (ticket) => {
    setSelectedTicket(ticket);
    setMessages([]);
    setNewMessage('');
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      const { data } = await api.post(`/support/tickets/${selectedTicket._id}/messages`, {
        message: newMessage.trim(),
      });
      if (data.ok) {
        setMessages(prev => [...prev, data.message]);
        setNewMessage('');
      } else {
        addToast(data.message || 'Σφάλμα αποστολής', 'error');
      }
    } catch {
      addToast('Σφάλμα αποστολής μηνύματος', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!selectedTicket) return;
    setClosing(true);
    try {
      const { data } = await api.put(`/support/tickets/${selectedTicket._id}/close`);
      if (data.ok) {
        addToast('Το αίτημα έκλεισε', 'success');
        setSelectedTicket(prev => ({ ...prev, status: 'closed' }));
        fetchTickets();
      } else {
        addToast(data.message || 'Σφάλμα', 'error');
      }
    } catch {
      addToast('Σφάλμα κλεισίματος', 'error');
    } finally {
      setClosing(false);
    }
  };

  const handleTicketCreated = (ticket) => {
    fetchTickets();
    setSelectedTicket(ticket);
  };

  const statusCfg = selectedTicket ? (TICKET_STATUS[selectedTicket.status] || TICKET_STATUS.open) : null;
  const canReply = selectedTicket && !['closed', 'resolved'].includes(selectedTicket.status);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Υποστήριξη</h1>
        <Button onClick={() => setContactFormOpen(true)}>
          + Νέο αίτημα
        </Button>
      </div>

      <div className="flex gap-6 h-[600px]">
        {/* Ticket list */}
        <div className="w-full max-w-xs flex-shrink-0 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
            </div>
          ) : (
            <TicketList
              tickets={tickets}
              selectedId={selectedTicket?._id}
              onSelect={handleSelectTicket}
            />
          )}
        </div>

        {/* Conversation view */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden">
          {!selectedTicket ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <div className="text-4xl mb-3">🎧</div>
                <div className="text-sm">Επιλέξτε αίτημα για να δείτε τη συνομιλία</div>
                <div className="text-xs text-gray-300 mt-2">ή δημιουργήστε νέο αίτημα</div>
              </div>
            </div>
          ) : (
            <>
              {/* Ticket header */}
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-xs font-mono text-gray-400">#{selectedTicket.ticketNumber || selectedTicket._id?.slice(-6)}</span>
                    {statusCfg && <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusCfg.class}`}>{statusCfg.label}</span>}
                    {selectedTicket.category && <span className="text-xs text-gray-400">{selectedTicket.category}</span>}
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{selectedTicket.subject}</h3>
                </div>
                {canReply && (
                  <Button
                    size="sm"
                    variant="ghost"
                    loading={closing}
                    onClick={handleCloseTicket}
                  >
                    Κλείσιμο
                  </Button>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {msgLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map(i => <Skeleton key={i} className="h-16 w-3/4 rounded-xl" />)}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">Δεν υπάρχουν μηνύματα</div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMine = msg.senderRole === 'member' || msg.sender === user?._id;
                    return (
                      <div key={msg._id || idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] ${isMine ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                          {!isMine && (
                            <div className="text-xs text-gray-400 px-1">
                              {msg.senderName || 'Ομάδα Diamond'} 🎧
                            </div>
                          )}
                          <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                            isMine
                              ? 'bg-brand-teal text-white rounded-br-none'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                          }`}>
                            {msg.message || msg.content}
                          </div>
                          <div className="text-xs text-gray-400 px-1">
                            {formatDateTime(msg.createdAt)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply input */}
              {canReply ? (
                <form onSubmit={handleSendMessage} className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Γράψτε το μήνυμά σας..."
                    className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal dark:bg-gray-700 dark:text-white"
                  />
                  <Button type="submit" loading={sending} disabled={!newMessage.trim()}>
                    Αποστολή
                  </Button>
                </form>
              ) : (
                <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 text-center text-sm text-gray-400">
                  Αυτό το αίτημα έχει κλείσει
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Contact form modal */}
      <ContactForm
        open={contactFormOpen}
        onClose={() => setContactFormOpen(false)}
        onCreated={handleTicketCreated}
      />
    </div>
  );
}
