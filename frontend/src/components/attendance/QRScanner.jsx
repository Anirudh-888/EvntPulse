import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, Keyboard, CheckCircle2, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import { attendanceApi } from '../../services/api';
import confetti from 'canvas-confetti';

export const QRScanner = ({ eventId, onCheckInSuccess }) => {
  const [scanMode, setScanMode] = useState('camera'); // 'camera' or 'manual'
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [lastResult, setLastResult] = useState(null);

  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  // Initialize camera scanner
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode('qr-reader-container');
      }

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        config,
        async (decodedText) => {
          // Detected QR code token
          await processCheckIn({ qr_token: decodedText });
          // Pause slightly to avoid multi-fire on same frame
          if (html5QrCodeRef.current) {
            html5QrCodeRef.current.pause();
            setTimeout(() => {
              try {
                html5QrCodeRef.current && html5QrCodeRef.current.resume();
              } catch (e) {}
            }, 2500);
          }
        },
        (errorMessage) => {
          // Ignored per-frame scan misses
        }
      );
      setCameraActive(true);
    } catch (err) {
      console.warn('Camera start error:', err);
      setCameraError(
        'Camera could not be accessed or permission was denied. Please use manual code entry below.'
      );
      setScanMode('manual');
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current && cameraActive) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.warn('Error stopping camera scanner:', err);
      }
      setCameraActive(false);
    }
  };

  useEffect(() => {
    if (scanMode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [scanMode]);

  const processCheckIn = async ({ qr_token, ticket_code }) => {
    setLoading(true);
    try {
      const res = await attendanceApi.checkIn({
        event_id: eventId,
        qr_token: qr_token || undefined,
        ticket_code: ticket_code || undefined,
      });

      const result = res.data;
      setLastResult(result);

      if (result.success) {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });
        if (onCheckInSuccess) onCheckInSuccess(result);
      }
    } catch (err) {
      setLastResult({
        success: false,
        status: 'SERVER_ERROR',
        message: err.friendlyMessage || 'Check-in validation failed.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    await processCheckIn({ ticket_code: manualCode.trim() });
    setManualCode('');
  };

  return (
    <div className="rounded-2xl glass-card border border-slate-800 p-6 flex flex-col items-center">
      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800 mb-6">
        <button
          onClick={() => setScanMode('camera')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            scanMode === 'camera'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Camera className="w-4 h-4" />
          Camera Scanner
        </button>
        <button
          onClick={() => setScanMode('manual')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            scanMode === 'manual'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Keyboard className="w-4 h-4" />
          Manual Code Input
        </button>
      </div>

      {/* Camera Viewport */}
      {scanMode === 'camera' && (
        <div className="w-full max-w-sm flex flex-col items-center mb-6">
          <div
            id="qr-reader-container"
            ref={scannerRef}
            className="w-full h-72 rounded-2xl overflow-hidden bg-slate-950 border-2 border-dashed border-indigo-500/40 relative flex items-center justify-center"
          >
            {!cameraActive && (
              <div className="text-center p-4">
                <Camera className="w-8 h-8 text-indigo-400 mx-auto mb-2 animate-pulse" />
                <p className="text-xs text-slate-400">Requesting camera feed...</p>
              </div>
            )}
          </div>
          {cameraError && (
            <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs text-center">
              {cameraError}
            </div>
          )}
        </div>
      )}

      {/* Manual Code Input Viewport */}
      {scanMode === 'manual' && (
        <form onSubmit={handleManualSubmit} className="w-full max-w-sm mb-6 space-y-3">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Ticket ID Code
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              placeholder="e.g. EP-7X9K-42M1"
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={loading || !manualCode.trim()}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/30 shrink-0"
            >
              {loading ? 'Checking...' : 'Check In'}
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            Enter the 10-character code printed underneath the student's ticket barcode.
          </p>
        </form>
      )}

      {/* Real-time Verification Result Display */}
      {lastResult && (
        <div
          className={`w-full max-w-md p-4 rounded-2xl border transition-all animate-in fade-in slide-in-from-bottom-3 duration-300 ${
            lastResult.status === 'SUCCESS'
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
              : lastResult.status === 'ALREADY_CHECKED_IN'
              ? 'bg-amber-950/40 border-amber-500/50 text-amber-300'
              : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
          }`}
        >
          <div className="flex items-start gap-3">
            {lastResult.status === 'SUCCESS' && (
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            )}
            {lastResult.status === 'ALREADY_CHECKED_IN' && (
              <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
            )}
            {lastResult.status !== 'SUCCESS' && lastResult.status !== 'ALREADY_CHECKED_IN' && (
              <XCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold uppercase tracking-wider">
                  {lastResult.status}
                </span>
                {lastResult.ticket_code && (
                  <span className="text-[11px] font-mono bg-slate-900/80 px-2 py-0.5 rounded">
                    {lastResult.ticket_code}
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold mt-1">{lastResult.message}</p>
              {lastResult.student_name && (
                <div className="mt-2 text-xs opacity-90 border-t border-current/20 pt-2 flex items-center justify-between">
                  <span>Student: <strong>{lastResult.student_name}</strong></span>
                  {lastResult.checked_in_at && (
                    <span>Time: {new Date(lastResult.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
