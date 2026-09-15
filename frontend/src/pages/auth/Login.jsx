import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { TechBotMascot } from '../../components/ui/TechBotMascot';
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  Sparkles,
  UserCheck,
  Shield,
  Flame,
  Calendar,
  MapPin,
  CheckCircle2,
  Zap,
  Activity,
  QrCode,
  BarChart3,
  Users,
  Compass
} from 'lucide-react';
import confetti from 'canvas-confetti';

const CAMPUS_FEED_EVENTS = [
  {
    id: 1,
    title: 'AI Innovation Summit 2026',
    club: 'Google Developer Student Club',
    badge: 'Trending #1',
    category: 'TECH',
    spots: '34 spots left',
    date: 'Oct 18 • 10:00 AM',
    venue: 'Turing Auditorium'
  },
  {
    id: 2,
    title: 'PulseFest: Spring Cultural Night',
    club: 'Campus Cultural Society',
    badge: 'Grand Fest',
    category: 'CULTURAL',
    spots: '140 spots left',
    date: 'Oct 28 • 6:00 PM',
    venue: 'Open Air Amphitheatre'
  },
  {
    id: 3,
    title: 'Autonomous Rover Hardware Demo',
    club: 'Robotics & Automation Society',
    badge: 'Field Demo',
    category: 'ROBOTICS',
    spots: '45 spots left',
    date: 'Oct 22 • 11:30 AM',
    venue: 'Engineering Arena'
  },
  {
    id: 4,
    title: 'Valorant LAN Championship',
    club: 'Campus E-Sports Guild',
    badge: '16 Teams',
    category: 'ESPORTS',
    spots: '8 spots left',
    date: 'Oct 20 • 1:00 PM',
    venue: 'Student Rec Center'
  },
];

export const Login = () => {
  const { login, register } = useAuth();
  const { toastSuccess, toastError } = useNotification();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [mode, setMode] = useState(searchParams.get('mode') === 'signup' ? 'signup' : 'signin');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('Year 2');
  const [loading, setLoading] = useState(false);

  // Dynamic Mascot States: 'idle' | 'email' | 'password' | 'success'
  const [mascotState, setMascotState] = useState('idle');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimerRef = useRef(null);

  // DOM Refs to measure exact border coordinates of input boxes
  const formStageRef = useRef(null);
  const emailBoxRef = useRef(null);
  const passwordBoxRef = useRef(null);
  const robotRef = useRef(null);

  // Calculated robot position
  const [robotTop, setRobotTop] = useState(-125);
  const [robotX, setRobotX] = useState(50);

  // Active campus feed ticker item
  const [tickerIndex, setTickerIndex] = useState(0);

  // Auto-cycle campus ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % CAMPUS_FEED_EVENTS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Update vertical position so robot boots sit EXACTLY on top of the textfield border line
  const updateRobotBorderPosition = () => {
    if (!formStageRef.current) return;
    const stageRect = formStageRef.current.getBoundingClientRect();
    const activeBox = mascotState === 'password' ? passwordBoxRef.current : emailBoxRef.current;

    if (activeBox) {
      const boxRect = activeBox.getBoundingClientRect();
      const robotEl = robotRef.current;
      const robotHeight = robotEl ? robotEl.offsetHeight : 132;

      // Vertical positioning: soles of boots sit directly on top of the border line
      if (mascotState === 'success') {
        setRobotTop(boxRect.top - stageRect.top - robotHeight - 30); // Celebration jump
      } else {
        setRobotTop(boxRect.top - stageRect.top - robotHeight + 5);
      }

      // Horizontal positioning: walk from left to right when typing, and step back on backspace!
      const currentText = mascotState === 'password' ? password : email;
      const boxWidth = boxRect.width || 420;
      const startX = 45; // Start position near icon
      const maxWalk = Math.max(90, boxWidth - 60);

      if (mascotState === 'success') {
        setRobotX(boxWidth / 2);
      } else {
        const dynamicX = Math.min(startX + currentText.length * 8, maxWalk);
        setRobotX(dynamicX);
      }
    }
  };

  useEffect(() => {
    updateRobotBorderPosition();
  }, [mascotState, mode, email, password]);

  useEffect(() => {
    window.addEventListener('resize', updateRobotBorderPosition);
    return () => window.removeEventListener('resize', updateRobotBorderPosition);
  }, []);

  // Handle typing detection with auto-stop timer
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setIsTyping(true);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      setIsTyping(false); // Stop walking when typing pauses
    }, 350);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setIsTyping(true);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      setIsTyping(false); // Stop walking when typing pauses
    }, 350);
  };

  // Robot dynamic speech messages requested by user
  const getMascotMessage = () => {
    if (mascotState === 'success') return 'Access Granted! Opening dashboard...';
    if (mascotState === 'password') return 'I respect your privacy';
    if (mascotState === 'email') return 'Noting you unique one';
    return 'Noting you unique one';
  };

  // Sign In submit handler
  const handleSignInSubmit = async (e) => {
    e?.preventDefault();
    if (!email || !password) return;
    setLoading(true);

    try {
      const user = await login(email, password);
      setMascotState('success');
      confetti({
        particleCount: 130,
        spread: 90,
        origin: { y: 0.55 },
        colors: ['#38BDF8', '#818CF8', '#C084FC', '#34D399'],
      });
      toastSuccess(`Welcome back, ${user.name}!`);

      setTimeout(() => {
        if (user.role === 'ORGANIZER') {
          navigate('/organizer/dashboard');
        } else if (user.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      }, 1400);
    } catch (err) {
      toastError(err.friendlyMessage || 'Invalid email or password');
      setMascotState('idle');
      setLoading(false);
    }
  };

  // Sign Up submit handler
  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register({
        name,
        email,
        password,
        role,
        department: department || 'General Engineering',
        year,
        college: 'State Tech University',
      });
      setMascotState('success');
      confetti({
        particleCount: 130,
        spread: 90,
        origin: { y: 0.55 },
        colors: ['#38BDF8', '#818CF8', '#C084FC', '#34D399'],
      });
      toastSuccess(`Account created! Welcome, ${user.name}`);

      setTimeout(() => {
        if (user.role === 'ORGANIZER') {
          navigate('/organizer/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      }, 1400);
    } catch (err) {
      toastError(err.friendlyMessage || 'Registration failed');
      setMascotState('idle');
      setLoading(false);
    }
  };

  // 1-Click Instant Evaluation Login
  const handleQuickDemoLogin = async (demoEmail, demoPw, targetPath) => {
    setLoading(true);
    setEmail(demoEmail);
    setPassword(demoPw);
    setMascotState('password');
    setTimeout(async () => {
      try {
        const user = await login(demoEmail, demoPw);
        setMascotState('success');
        confetti({
          particleCount: 120,
          spread: 85,
          origin: { y: 0.55 },
          colors: ['#38BDF8', '#818CF8', '#C084FC', '#34D399'],
        });
        toastSuccess(`Authenticated as ${user.role}: ${user.name}`);

        setTimeout(() => {
          navigate(targetPath);
        }, 1300);
      } catch (err) {
        toastError(err.friendlyMessage || 'Evaluation login failed');
        setMascotState('idle');
        setLoading(false);
      }
    }, 450);
  };

  const activeTicker = CAMPUS_FEED_EVENTS[tickerIndex];

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] p-2 sm:p-4 lg:p-6 flex flex-col items-stretch relative overflow-hidden bg-[#070b14]">
      {/* Full-canvas Ambient Cyber Glow Meshes */}
      <div className="absolute top-0 left-1/4 w-[750px] h-[550px] bg-gradient-to-tr from-indigo-600/20 via-cyan-500/15 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[750px] h-[550px] bg-gradient-to-bl from-purple-600/20 via-pink-500/10 to-transparent rounded-full blur-[140px] pointer-events-none" />

      {/* ============================================================ */}
      {/* FULL-CANVAS MACOS FROSTED ACRYLIC GLASS SHELL                */}
      {/* ============================================================ */}
      <div className="relative z-10 w-full flex-1 flex flex-col rounded-[24px] sm:rounded-[32px] border border-white/15 bg-slate-900/40 backdrop-blur-3xl shadow-[0_30px_100px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.15)] overflow-hidden transition-all duration-300">
        
        {/* macOS Window Top Titlebar */}
        <div className="h-12 px-6 flex items-center justify-between border-b border-white/10 bg-slate-950/50 backdrop-blur-2xl select-none shrink-0">
          {/* macOS Traffic Light Buttons */}
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] border border-[#E0443E] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] cursor-pointer" />
            <div className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] border border-[#DEA123] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] cursor-pointer" />
            <div className="w-3.5 h-3.5 rounded-full bg-[#27C93F] border border-[#1AAB29] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] cursor-pointer" />
          </div>

          {/* Title Bar Center Text */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="tracking-wide">EvntPulse OS &bull; Campus Intelligence Hub</span>
          </div>

          {/* Right Status Badge */}
          <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>State Tech Node &bull; Grid Online</span>
          </div>
        </div>

        {/* Window Body: Full Canvas Grid Occupying Entire Available Space */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 w-full">

          {/* ============================================================ */}
          {/* LEFT SECTION: LOGO IN CORNER + EXPANDED CAMPUS SHOWCASE      */}
          {/* ============================================================ */}
          <div className="lg:col-span-5 xl:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 bg-slate-950/30">
            <div>
              {/* Logo in the left corner */}
              <div
                onClick={() => navigate('/')}
                className="group cursor-pointer inline-flex flex-col items-start"
              >
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/30 via-indigo-500/30 to-fuchsia-500/30 rounded-2xl blur-md opacity-60 group-hover:opacity-100 transition duration-500" />
                  <img
                    src="/evntpulse-logo.png"
                    alt="EvntPulse Logo"
                    className="relative w-52 sm:w-60 md:w-68 object-contain rounded-xl drop-shadow-[0_10px_25px_rgba(99,102,241,0.4)] transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>
              </div>

              {/* Tagline & Narrative */}
              <div className="mt-6">
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                  Your Campus.<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-fuchsia-400">
                    One Pulse.
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-2.5 leading-relaxed max-w-md">
                  The smart campus operating system connecting students, college clubs, and organizers with verifiable QR ticketing and real-time event intelligence.
                </p>
              </div>

              {/* Expanded Live Campus Feed Showcase */}
              <div className="mt-8 rounded-2xl p-4 bg-white/[0.03] border border-white/10 backdrop-blur-md shadow-inner">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] uppercase font-mono font-bold tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
                    Live Campus Pulse
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                      {activeTicker.badge}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      {activeTicker.spots}
                    </span>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-white truncate">{activeTicker.title}</h4>
                
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-2">
                  <span className="text-indigo-300 font-semibold">{activeTicker.club}</span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1 text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    {activeTicker.date}
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {activeTicker.venue}
                  </span>
                </div>

                {/* Slider indicator dots */}
                <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-white/5">
                  {CAMPUS_FEED_EVENTS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setTickerIndex(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                        tickerIndex === i ? 'w-6 bg-cyan-400' : 'w-2 bg-slate-700 hover:bg-slate-600'
                      }`}
                    />
                  ))}
                  <span className="text-[10px] text-slate-500 ml-auto font-mono">
                    Auto-updating live events
                  </span>
                </div>
              </div>
            </div>

            {/* Campus Metrics & System Badges */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 shadow-sm">
                  <QrCode className="w-5 h-5 text-cyan-400 mx-auto mb-1.5" />
                  <span className="block text-xs font-bold text-slate-200">Smart Tickets</span>
                  <span className="text-[10px] text-slate-400">Zero-Fraud QR</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 shadow-sm">
                  <Activity className="w-5 h-5 text-indigo-400 mx-auto mb-1.5" />
                  <span className="block text-xs font-bold text-slate-200">Live Polls</span>
                  <span className="text-[10px] text-slate-400">Real-Time Votes</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 shadow-sm">
                  <BarChart3 className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
                  <span className="block text-xs font-bold text-slate-200">Health Index</span>
                  <span className="text-[10px] text-slate-400">4-Factor Engine</span>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* RIGHT SECTION: DETAILS ENTRY + EXPANDED WALKING ROBOT TRACK  */}
          {/* ============================================================ */}
          <div className="lg:col-span-7 xl:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-slate-900/20">
            <div className="max-w-xl mx-auto w-full">

              {/* 1-Click Evaluation Accounts */}
              <div className="rounded-2xl p-3.5 bg-white/[0.03] border border-white/10 mb-6">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] uppercase font-mono font-bold tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    1-Click Instant Evaluation
                  </span>
                  <span className="text-[11px] text-indigo-300 font-medium">Click to auto-authenticate</span>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() =>
                      handleQuickDemoLogin('student@mvjce.edu.in', 'Student@123', '/student/dashboard')
                    }
                    className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-indigo-600 hover:text-white border border-white/10 text-center transition-all group cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4 text-indigo-400 group-hover:text-white mx-auto mb-1" />
                    <span className="block text-xs font-bold text-slate-200 group-hover:text-white">Student</span>
                    <span className="block text-[10px] text-slate-400 group-hover:text-indigo-200">Arjun</span>
                  </button>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() =>
                      handleQuickDemoLogin('sdc@mvjce.edu.in', 'Club@123', '/organizer/dashboard')
                    }
                    className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-indigo-600 hover:text-white border border-white/10 text-center transition-all group cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-cyan-400 group-hover:text-white mx-auto mb-1" />
                    <span className="block text-xs font-bold text-slate-200 group-hover:text-white">Club Lead</span>
                    <span className="block text-[10px] text-slate-400 group-hover:text-cyan-200">SDC MVJCE</span>
                  </button>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() =>
                      handleQuickDemoLogin('it.admin@mvjce.edu.in', 'Admin@123', '/admin/dashboard')
                    }
                    className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-amber-500 hover:text-white border border-white/10 text-center transition-all group cursor-pointer"
                  >
                    <Shield className="w-4 h-4 text-amber-400 group-hover:text-white mx-auto mb-1" />
                    <span className="block text-xs font-bold text-slate-200 group-hover:text-white">IT Admin</span>
                    <span className="block text-[10px] text-slate-400 group-hover:text-amber-200">MVJCE IT</span>
                  </button>
                </div>

                {/* More MVJCE Clubs switcher row */}
                <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Other Clubs:</span>
                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    {[
                      { short: 'GDC', email: 'gdc@mvjce.edu.in' },
                      { short: 'AWS', email: 'aws.club@mvjce.edu.in' },
                      { short: 'TedX', email: 'tedx@mvjce.edu.in' },
                      { short: 'NIC', email: 'nic@mvjce.edu.in' },
                      { short: 'Raaga', email: 'raagabhinaya@mvjce.edu.in' },
                      { short: 'Dhwani', email: 'dhwani@mvjce.edu.in' },
                      { short: 'Saahitya', email: 'saahitya@mvjce.edu.in' },
                      { short: 'Toast', email: 'toastmasters@mvjce.edu.in' },
                    ].map((c) => (
                      <button
                        key={c.email}
                        type="button"
                        onClick={() => handleQuickDemoLogin(c.email, 'Club@123', '/organizer/dashboard')}
                        className="px-1.5 py-0.5 rounded bg-slate-900 hover:bg-indigo-600/40 text-[10px] text-slate-300 font-mono transition-colors"
                        title={`Login as ${c.email}`}
                      >
                        {c.short}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tab Switcher: Sign In vs Create Account */}
              <div className="flex p-1 rounded-xl bg-slate-950/70 border border-white/10 mb-8 max-w-sm mx-auto w-full">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setMascotState('idle');
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    mode === 'signin'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setMascotState('idle');
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    mode === 'signup'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* ============================================================ */}
              {/* DETAILS ENTRY STAGE: ROBOT SITS ON TOP BORDER (NOT INSIDE)   */}
              {/* ============================================================ */}
              <div className="relative pt-12" ref={formStageRef}>
                {/* THE WALKING ROBOT: Balanced on the top border ledge, walking only when typing */}
                <div
                  ref={robotRef}
                  className="absolute transition-all duration-300 ease-out z-30 pointer-events-none"
                  style={{
                    top: `${robotTop}px`,
                    left: `${robotX}px`,
                    transform: 'translateX(-50%)',
                  }}
                >
                  <TechBotMascot
                    targetState={mascotState}
                    isTyping={isTyping}
                    message={getMascotMessage()}
                  />
                </div>

                {mode === 'signin' ? (
                  <form onSubmit={handleSignInSubmit} className="space-y-6 relative z-10">
                    {/* Email field container */}
                    <div className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                          Campus Email
                        </label>
                        {mascotState === 'email' && (
                          <span className="text-[10px] text-cyan-400 font-mono font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                            {isTyping ? 'Walking...' : 'On border'}
                          </span>
                        )}
                      </div>
                      {/* Input box with ref for exact top border calculation */}
                      <div className="relative" ref={emailBoxRef}>
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <input
                          type="email"
                          value={email}
                          onChange={handleEmailChange}
                          onFocus={() => {
                            setMascotState('email');
                            setIsTyping(false);
                          }}
                          onBlur={() => {
                            setMascotState('idle');
                            setIsTyping(false);
                          }}
                          placeholder="student@mvjce.edu.in or sdc@mvjce.edu.in"
                          className={`w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950/70 border text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all duration-300 ${
                            mascotState === 'email'
                              ? 'border-cyan-400 ring-2 ring-cyan-400/20 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                              : 'border-white/10 focus:border-indigo-500'
                          }`}
                          required
                        />
                      </div>
                    </div>

                    {/* Password field container */}
                    <div className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                          Password
                        </label>
                        {mascotState === 'password' && (
                          <span className="text-[10px] text-purple-400 font-mono font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                            Eyes covered 🙈
                          </span>
                        )}
                      </div>
                      {/* Input box with ref for exact top border calculation */}
                      <div className="relative" ref={passwordBoxRef}>
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <input
                          type="password"
                          value={password}
                          onChange={handlePasswordChange}
                          onFocus={() => {
                            setMascotState('password');
                            setIsTyping(false);
                          }}
                          onBlur={() => {
                            setMascotState('idle');
                            setIsTyping(false);
                          }}
                          placeholder="••••••••"
                          className={`w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950/70 border text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all duration-300 ${
                            mascotState === 'password'
                              ? 'border-purple-500 ring-2 ring-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                              : 'border-white/10 focus:border-indigo-500'
                          }`}
                          required
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:opacity-95 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 mt-5 cursor-pointer"
                    >
                      {loading ? 'Authenticating...' : 'Sign In & Launch Dashboard'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleSignUpSubmit} className="space-y-4 relative z-10">
                    {/* Role selector */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        Register As
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setRole('STUDENT')}
                          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            role === 'STUDENT'
                              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40'
                              : 'bg-slate-950/60 text-slate-400 border border-white/10'
                          }`}
                        >
                          Student
                        </button>
                        <button
                          type="button"
                          onClick={() => setRole('ORGANIZER')}
                          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            role === 'ORGANIZER'
                              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40'
                              : 'bg-slate-950/60 text-slate-400 border border-white/10'
                          }`}
                        >
                          Club Organizer
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Devon Vance"
                          className="w-full pl-11 pr-3 py-2.5 rounded-lg bg-slate-950/60 border border-white/10 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                        Campus Email
                      </label>
                      <div className="relative" ref={emailBoxRef}>
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={handleEmailChange}
                          onFocus={() => {
                            setMascotState('email');
                            setIsTyping(false);
                          }}
                          onBlur={() => {
                            setMascotState('idle');
                            setIsTyping(false);
                          }}
                          placeholder="arjun@mvjce.edu.in"
                          className="w-full pl-11 pr-3 py-2.5 rounded-lg bg-slate-950/60 border border-white/10 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                        Password
                      </label>
                      <div className="relative" ref={passwordBoxRef}>
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="password"
                          value={password}
                          onChange={handlePasswordChange}
                          onFocus={() => {
                            setMascotState('password');
                            setIsTyping(false);
                          }}
                          onBlur={() => {
                            setMascotState('idle');
                            setIsTyping(false);
                          }}
                          placeholder="••••••••"
                          className="w-full pl-11 pr-3 py-2.5 rounded-lg bg-slate-950/60 border border-white/10 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-400"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                          Department
                        </label>
                        <input
                          type="text"
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          placeholder="Computer Science"
                          className="w-full px-3 py-2 rounded-lg bg-slate-950/60 border border-white/10 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                          Year
                        </label>
                        <select
                          value={year}
                          onChange={(e) => setYear(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950/60 border border-white/10 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="Year 1">Year 1</option>
                          <option value="Year 2">Year 2</option>
                          <option value="Year 3">Year 3</option>
                          <option value="Year 4">Year 4</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:opacity-95 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 mt-5 cursor-pointer"
                    >
                      {loading ? 'Creating Account...' : 'Complete Registration'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}

                <div className="mt-5 text-center text-xs text-slate-500">
                  Encrypted with campus JWT tokens &bull; Zero spam &bull; Verifiable QR ticketing
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
