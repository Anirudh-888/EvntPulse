import React, { useState } from 'react';
import { Copy, Check, QrCode, ShieldCheck } from 'lucide-react';

export const QRDisplay = ({ qrImage, ticketCode, size = 'md' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (ticketCode) {
      navigator.clipboard.writeText(ticketCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
      {/* QR Code Container with High Contrast White Backing */}
      <div className="relative p-3 bg-white rounded-xl shadow-lg mb-4">
        {qrImage ? (
          <img
            src={qrImage}
            alt={`QR for ${ticketCode}`}
            className="w-48 h-48 object-contain rounded-lg"
          />
        ) : (
          <div className="w-48 h-48 flex items-center justify-center text-slate-400">
            <QrCode className="w-16 h-16 animate-pulse" />
          </div>
        )}
        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider flex items-center gap-1 shadow-md">
          <ShieldCheck className="w-3 h-3" />
          VERIFIED
        </div>
      </div>

      {/* Ticket Code Fallback */}
      <div className="mt-2 flex items-center gap-2">
        <span className="text-xs text-slate-400">Manual Code:</span>
        <span className="font-mono font-bold text-sm tracking-wider text-indigo-300 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
          {ticketCode}
        </span>
        <button
          onClick={handleCopy}
          className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors border border-slate-800"
          title="Copy Code"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      <p className="text-[11px] text-slate-500 mt-2 max-w-xs">
        Present this QR at check-in. The organizer will scan it with their camera device.
      </p>
    </div>
  );
};
