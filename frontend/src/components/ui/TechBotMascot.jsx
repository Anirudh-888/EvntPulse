import React, { useEffect, useState } from 'react';

/**
 * TechBotMascot - Realistic high-tech cyber companion
 * 
 * Rules:
 * - Walks ONLY when the user is typing (isTyping === true)
 * - Stands completely still on the border when not typing
 * - Covers face/eyes on password with "I respect your privacy"
 * - Displays "Noting you unique one" when on email
 * - Opens hands wide in victory on login success
 */
export const TechBotMascot = ({
  targetState = 'idle', // 'idle' | 'email' | 'password' | 'success'
  isTyping = false,
  message = '',
}) => {
  const [stepCycle, setStepCycle] = useState(0);

  // Stepping rhythm for walking animation - STRICTLY when typing only!
  useEffect(() => {
    let interval;
    if (isTyping) {
      interval = setInterval(() => {
        setStepCycle((prev) => (prev + 1) % 4);
      }, 120);
    } else {
      setStepCycle(0); // Stand still with both feet planted
    }
    return () => clearInterval(interval);
  }, [isTyping]);

  const isPassword = targetState === 'password';
  const isEmail = targetState === 'email';
  const isSuccess = targetState === 'success';

  // Feet walk ONLY when user is typing!
  const isWalking = isTyping;

  // Kinematic offsets for realistic walking stride
  const leftLegY = isWalking ? (stepCycle === 1 ? -6 : stepCycle === 3 ? 1 : 0) : 0;
  const rightLegY = isWalking ? (stepCycle === 3 ? -6 : stepCycle === 1 ? 1 : 0) : 0;
  const leftLegAngle = isWalking ? (stepCycle === 1 ? -12 : stepCycle === 3 ? 8 : 0) : 0;
  const rightLegAngle = isWalking ? (stepCycle === 3 ? -12 : stepCycle === 1 ? 8 : 0) : 0;
  const bodyBobY = isWalking ? (stepCycle % 2 === 1 ? -2.5 : 0) : 0;
  const bodyTilt = isWalking ? (stepCycle === 1 ? -2 : stepCycle === 3 ? 2 : 0) : 0;

  // Status-driven theme colors
  const glowColor = isSuccess
    ? '#10B981' // emerald
    : isPassword
    ? '#A855F7' // purple
    : isEmail
    ? '#00E5FF' // vivid cyan
    : '#6366F1'; // indigo

  return (
    <div className="relative pointer-events-none select-none flex flex-col items-center">
      {/* Dynamic Frosted Speech Bubble */}
      {message && (
        <div
          className={`mb-1.5 px-3 py-1 rounded-2xl text-[11px] font-bold tracking-wide shadow-2xl border backdrop-blur-xl transition-all duration-300 transform ${
            isSuccess
              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50 scale-105 shadow-emerald-500/30'
              : isPassword
              ? 'bg-purple-950/90 text-purple-300 border-purple-500/50 shadow-purple-500/30'
              : isEmail
              ? 'bg-cyan-950/90 text-cyan-300 border-cyan-500/50 shadow-cyan-500/30'
              : 'bg-slate-900/90 text-indigo-300 border-white/15 shadow-indigo-500/20'
          }`}
        >
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span>{message}</span>
          </div>
          {/* Downward pointer */}
          <div
            className={`w-2 h-2 mx-auto -mb-2 rotate-45 border-r border-b ${
              isSuccess
                ? 'bg-emerald-950 border-emerald-500/50'
                : isPassword
                ? 'bg-purple-950 border-purple-500/50'
                : isEmail
                ? 'bg-cyan-950 border-cyan-500/50'
                : 'bg-slate-900 border-white/15'
            }`}
          />
        </div>
      )}

      {/* SVG Container: Realistic 3D Cyber Bot */}
      <div
        className="relative w-20 h-24 sm:w-22 sm:h-26 flex items-center justify-center transition-transform duration-150"
        style={{
          transform: `translateY(${bodyBobY}px) rotate(${bodyTilt}deg)`,
        }}
      >
        <svg
          viewBox="0 0 160 180"
          className="w-full h-full overflow-visible drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)]"
        >
          <defs>
            {/* Realistic Titanium Pearl Body Gradients */}
            <linearGradient id="chassisGrad" x1="20%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="25%" stopColor="#E2E8F0" />
              <stop offset="70%" stopColor="#94A3B8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>

            <linearGradient id="darkChassisGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="60%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>

            <linearGradient id="chromeBezel" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#64748B" />
              <stop offset="40%" stopColor="#E2E8F0" />
              <stop offset="60%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>

            {/* OLED Curved Visor Glass */}
            <radialGradient id="visorGlass" cx="50%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#0B132B" />
              <stop offset="70%" stopColor="#050B14" />
              <stop offset="100%" stopColor="#000208" />
            </radialGradient>

            {/* Visor Glare Streak */}
            <linearGradient id="visorGlare" x1="0%" y1="0%" x2="100%" y2="80%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
              <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
            </linearGradient>

            {/* Cyan OLED Eye Glow Filter */}
            <filter id="neonEyeGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="3" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Contact Shadow Filter */}
            <filter id="shadowBlur" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2" />
            </filter>
          </defs>

          {/* ============================================================ */}
          {/* CAST CONTACT SHADOW ON THE BORDER LEDGE                      */}
          {/* ============================================================ */}
          <ellipse
            cx="80"
            cy="172"
            rx={isWalking ? 26 : 24}
            ry="3.5"
            fill="rgba(0, 0, 0, 0.7)"
            filter="url(#shadowBlur)"
          />

          {/* ============================================================ */}
          {/* ANTENNA & COMMUNICATION NODE                                 */}
          {/* ============================================================ */}
          <g>
            <path
              d="M 80 28 L 80 14"
              stroke="#64748B"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <ellipse cx="80" cy="18" rx="4" ry="2" fill="#94A3B8" />
            <circle
              cx="80"
              cy="11"
              r="4.5"
              fill={glowColor}
              filter="url(#neonEyeGlow)"
              className="animate-pulse"
            />
          </g>

          {/* ============================================================ */}
          {/* ROBOT HEAD                                                   */}
          {/* ============================================================ */}
          <rect x="34" y="27" width="92" height="66" rx="28" fill="#1E293B" opacity="0.4" />

          <rect
            x="34"
            y="26"
            width="92"
            height="64"
            rx="28"
            fill="url(#chassisGrad)"
            stroke="#94A3B8"
            strokeWidth="1.5"
          />

          {/* Ear Audio Sensors */}
          <rect x="29" y="44" width="6" height="26" rx="3" fill="url(#chromeBezel)" />
          <circle cx="32" cy="57" r="2" fill={glowColor} />

          <rect x="125" y="44" width="6" height="26" rx="3" fill="url(#chromeBezel)" />
          <circle cx="128" cy="57" r="2" fill={glowColor} />

          {/* Visor Screen Glass */}
          <rect
            x="40"
            y="33"
            width="80"
            height="48"
            rx="22"
            fill="url(#darkChassisGrad)"
            stroke="url(#chromeBezel)"
            strokeWidth="1.5"
          />

          <rect
            x="42"
            y="35"
            width="76"
            height="44"
            rx="20"
            fill="url(#visorGlass)"
          />

          <path
            d="M 44 48 C 50 38 110 38 116 48 C 110 42 50 42 44 48 Z"
            fill="url(#visorGlare)"
          />

          {/* ============================================================ */}
          {/* OLED EXPRESSIVE EYES                                         */}
          {/* ============================================================ */}
          <g className="transition-all duration-200">
            {isSuccess ? (
              /* Success: Happy glowing crescent eyes */
              <>
                <path
                  d="M 52 57 Q 60 48 68 57"
                  stroke="#34D399"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                  filter="url(#neonEyeGlow)"
                />
                <path
                  d="M 92 57 Q 100 48 108 57"
                  stroke="#34D399"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                  filter="url(#neonEyeGlow)"
                />
                <path
                  d="M 72 65 Q 80 73 88 65"
                  stroke="#34D399"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                  filter="url(#neonEyeGlow)"
                />
              </>
            ) : isPassword ? (
              /* Password: Shy squint lines behind hands */
              <>
                <path
                  d="M 54 57 Q 61 63 68 57"
                  stroke="#C084FC"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                  filter="url(#neonEyeGlow)"
                />
                <path
                  d="M 92 57 Q 99 63 106 57"
                  stroke="#C084FC"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                  filter="url(#neonEyeGlow)"
                />
                <circle cx="80" cy="67" r="2.5" fill="#C084FC" filter="url(#neonEyeGlow)" />
              </>
            ) : isEmail ? (
              /* Email: Wide attentive scanning eyes */
              <>
                <circle cx="60" cy="55" r="8.5" fill="#00E5FF" filter="url(#neonEyeGlow)" />
                <circle cx="62.5" cy="52.5" r="3" fill="#FFFFFF" />

                <circle cx="100" cy="55" r="8.5" fill="#00E5FF" filter="url(#neonEyeGlow)" />
                <circle cx="102.5" cy="52.5" r="3" fill="#FFFFFF" />

                <path
                  d="M 74 66 Q 80 70 86 66"
                  stroke="#00E5FF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                  filter="url(#neonEyeGlow)"
                />
              </>
            ) : (
              /* Normal Idle: Smooth oval digital eyes */
              <>
                <ellipse cx="60" cy="55" rx="7.5" ry="9" fill="#00E5FF" filter="url(#neonEyeGlow)" />
                <circle cx="62" cy="52" r="2.5" fill="#FFFFFF" />

                <ellipse cx="100" cy="55" rx="7.5" ry="9" fill="#00E5FF" filter="url(#neonEyeGlow)" />
                <circle cx="102" cy="52" r="2.5" fill="#FFFFFF" />

                <rect x="74" y="66" width="12" height="2" rx="1" fill="#00E5FF" filter="url(#neonEyeGlow)" />
              </>
            )}
          </g>

          {/* ============================================================ */}
          {/* TORSO / CHEST CHASSIS                                        */}
          {/* ============================================================ */}
          <rect x="68" y="88" width="24" height="6" rx="3" fill="#334155" />

          <rect
            x="48"
            y="92"
            width="64"
            height="38"
            rx="16"
            fill="url(#chassisGrad)"
            stroke="#94A3B8"
            strokeWidth="1.5"
          />

          <rect x="62" y="99" width="36" height="24" rx="10" fill="#0F172A" stroke="#334155" strokeWidth="1" />

          {/* Campus Pulse Heartbeat Reactor */}
          <circle
            cx="80"
            cy="111"
            r="6.5"
            fill={glowColor}
            filter="url(#neonEyeGlow)"
            className="animate-pulse"
          />
          <circle cx="80" cy="111" r="3" fill="#FFFFFF" />

          {/* ============================================================ */}
          {/* WALKING LEGS & MAGNETIC BOOTS                                */}
          {/* ============================================================ */}
          {/* Left Leg */}
          <g
            transform={`translate(0, ${leftLegY}) rotate(${leftLegAngle}, 62, 128)`}
            className="transition-transform duration-100"
          >
            <rect x="57" y="128" width="10" height="20" rx="4" fill="#334155" stroke="#1E293B" strokeWidth="1" />
            <circle cx="62" cy="144" r="4" fill="#64748B" />
            <path
              d="M 51 160 Q 62 153 73 160 L 73 168 Q 62 170 51 168 Z"
              fill="url(#chassisGrad)"
              stroke="#475569"
              strokeWidth="1"
            />
            <rect x="52" y="167" width="20" height="3" rx="1.5" fill="#0F172A" />
            <rect x="54" y="168" width="16" height="1.5" rx="0.5" fill={glowColor} />
          </g>

          {/* Right Leg */}
          <g
            transform={`translate(0, ${rightLegY}) rotate(${rightLegAngle}, 98, 128)`}
            className="transition-transform duration-100"
          >
            <rect x="93" y="128" width="10" height="20" rx="4" fill="#334155" stroke="#1E293B" strokeWidth="1" />
            <circle cx="98" cy="144" r="4" fill="#64748B" />
            <path
              d="M 87 160 Q 98 153 109 160 L 109 168 Q 98 170 87 168 Z"
              fill="url(#chassisGrad)"
              stroke="#475569"
              strokeWidth="1"
            />
            <rect x="88" y="167" width="20" height="3" rx="1.5" fill="#0F172A" />
            <rect x="90" y="168" width="16" height="1.5" rx="0.5" fill={glowColor} />
          </g>

          {/* ============================================================ */}
          {/* ARTICULATED CYBER ARMS & HANDS                               */}
          {/* ============================================================ */}
          {/* Left Arm & Hand */}
          <g
            className="transition-all duration-300 ease-out"
            style={{
              transform: isSuccess
                ? 'translate(-12px, -48px) rotate(-42deg)'
                : isPassword
                ? 'translate(22px, -46px) rotate(-14deg)'
                : isWalking
                ? stepCycle % 2 === 1
                  ? 'translate(1px, -3px) rotate(6deg)'
                  : 'translate(-1px, 2px) rotate(-6deg)'
                : 'translate(0px, 0px)',
              transformOrigin: '48px 100px',
            }}
          >
            <circle cx="48" cy="100" r="5.5" fill="#64748B" stroke="#334155" strokeWidth="1" />
            <rect x="42" y="103" width="7" height="18" rx="3.5" fill="#334155" />
            <circle cx="45.5" cy="122" r="4" fill="#64748B" />
            <rect x="41" y="123" width="9" height="14" rx="4" fill="url(#chassisGrad)" stroke="#64748B" strokeWidth="1" />
            
            <g transform="translate(37, 137)">
              <circle cx="8" cy="6" r="6.5" fill="#0F172A" stroke={glowColor} strokeWidth="1.5" />
              <circle cx="4" cy="11" r="2" fill="#CBD5E1" />
              <circle cx="8" cy="12.5" r="2" fill="#CBD5E1" />
              <circle cx="12" cy="11" r="2" fill="#CBD5E1" />
            </g>
          </g>

          {/* Right Arm & Hand */}
          <g
            className="transition-all duration-300 ease-out"
            style={{
              transform: isSuccess
                ? 'translate(12px, -48px) rotate(42deg)'
                : isPassword
                ? 'translate(-22px, -46px) rotate(14deg)'
                : isWalking
                ? stepCycle % 2 === 0
                  ? 'translate(-1px, -3px) rotate(-6deg)'
                  : 'translate(1px, 2px) rotate(6deg)'
                : 'translate(0px, 0px)',
              transformOrigin: '112px 100px',
            }}
          >
            <circle cx="112" cy="100" r="5.5" fill="#64748B" stroke="#334155" strokeWidth="1" />
            <rect x="111" y="103" width="7" height="18" rx="3.5" fill="#334155" />
            <circle cx="114.5" cy="122" r="4" fill="#64748B" />
            <rect x="110" y="123" width="9" height="14" rx="4" fill="url(#chassisGrad)" stroke="#64748B" strokeWidth="1" />

            <g transform="translate(107, 137)">
              <circle cx="8" cy="6" r="6.5" fill="#0F172A" stroke={glowColor} strokeWidth="1.5" />
              <circle cx="4" cy="11" r="2" fill="#CBD5E1" />
              <circle cx="8" cy="12.5" r="2" fill="#CBD5E1" />
              <circle cx="12" cy="11" r="2" fill="#CBD5E1" />
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
};
