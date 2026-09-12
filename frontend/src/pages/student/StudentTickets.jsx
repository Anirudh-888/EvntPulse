import React, { useState, useEffect } from 'react';
import { registrationsApi } from '../../services/api';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { QRDisplay } from '../../components/attendance/QRDisplay';
import { Modal } from '../../components/ui/Modal';
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  QrCode,
  CheckCircle2,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export const StudentTickets = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filter, setFilter] = useState('ALL'); // ALL, VALID, USED

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await registrationsApi.getMyRegistrations();
      setRegistrations(res.data);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" message="Loading your digital tickets..." />;

  const filteredRegs = registrations.filter((r) => {
    if (filter === 'ALL') return true;
    if (filter === 'VALID') return r.ticket && !r.ticket.used && r.status === 'REGISTERED';
    if (filter === 'USED') return r.ticket && (r.ticket.used || r.status === 'ATTENDED');
    return true;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Ticket className="w-4 h-4" />
            Digital Wallet
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">My Event Tickets</h1>
          <p className="text-xs text-slate-400">
            Show your QR pass upon arrival at the venue for instant check-in.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
          {['ALL', 'VALID', 'USED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === f
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {f === 'ALL' ? 'All Tickets' : f === 'VALID' ? 'Active Passes' : 'Attended'}
            </button>
          ))}
        </div>
      </div>

      {filteredRegs.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="No digital tickets"
          description="You don't have any event tickets under this filter. Explore campus events to RSVP."
          actionLabel="Explore Events"
          actionLink="/events"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRegs.map((reg) => {
            const ticket = reg.ticket;
            const isUsed = ticket?.used || reg.status === 'ATTENDED';
            const ticketStatus = isUsed ? 'USED' : reg.status === 'CANCELLED' ? 'CANCELLED' : 'VALID';

            return (
              <div
                key={reg.id}
                className="rounded-3xl glass-card border border-slate-800/80 overflow-hidden flex flex-col justify-between hover:border-indigo-500/40 transition-all duration-300 shadow-xl"
              >
                {/* Header Ticket Stub */}
                <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950/40 border-b border-dashed border-slate-800">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                      {reg.club_name || 'Campus Society'}
                    </span>
                    <StatusBadge status={ticketStatus} size="sm" />
                  </div>
                  <h3 className="text-lg font-extrabold text-white line-clamp-1">{reg.event_title}</h3>
                </div>

                {/* Body Details */}
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Date</span>
                      <strong className="text-white">
                        {new Date(reg.event_start_time).toLocaleDateString()}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Time</span>
                      <strong className="text-white">
                        {new Date(reg.event_start_time).toLocaleTimeString([], {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </strong>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500 block text-[11px]">Venue</span>
                      <strong className="text-white truncate block">{reg.event_venue}</strong>
                    </div>
                  </div>

                  {/* QR Preview Snippet */}
                  {ticket && (
                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                          Ticket Code
                        </span>
                        <p className="font-mono font-bold text-indigo-300 text-sm">
                          {ticket.ticket_code}
                        </p>
                      </div>

                      <button
                        onClick={() => setSelectedTicket({ ticket, reg })}
                        className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 flex items-center gap-1.5 text-xs font-semibold transition-all"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>Enlarge QR</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer Bar */}
                <div className="px-5 py-3 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Issued to: {reg.user?.name || 'Verified Student'}</span>
                  {isUsed && (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Checked In
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Enlarged QR Modal */}
      <Modal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title="Digital QR Pass"
        maxWidth="max-w-md"
      >
        {selectedTicket && (
          <div className="space-y-4">
            <QRDisplay
              qrImage={selectedTicket.ticket.qr_code_image}
              ticketCode={selectedTicket.ticket.ticket_code}
            />
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
              <p><strong>Event:</strong> {selectedTicket.reg.event_title}</p>
              <p><strong>Venue:</strong> {selectedTicket.reg.event_venue}</p>
              <p>
                <strong>Date & Time:</strong>{' '}
                {new Date(selectedTicket.reg.event_start_time).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
