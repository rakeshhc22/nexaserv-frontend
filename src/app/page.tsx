'use client';

import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import NeuralBackground from '../components/NeuralBackground';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import InboxIcon from '@mui/icons-material/Inbox';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import BarChartIcon from '@mui/icons-material/BarChart';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import DescriptionIcon from '@mui/icons-material/Description';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EmailIcon from '@mui/icons-material/Email';
import BoltIcon from '@mui/icons-material/Bolt';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MicIcon from '@mui/icons-material/Mic';

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  cyan: '#00C8FF',
  purple: '#6450FF',
  dark: '#030810',
  card: 'rgba(8, 20, 48, 0.75)',
  border: 'rgba(0, 200, 255, 0.12)',
  text: 'rgba(200, 225, 255, 0.85)',
  muted: 'rgba(130, 170, 220, 0.5)',
};

// ── Typewriter hook ───────────────────────────────────────────────────────────
const PHRASES = [
  'automates your bookings.',
  'manages your leads.',
  'unifies your inbox.',
  'powers your growth.',
  'handles your team.',
  'runs your business.',
];

function useTypewriter() {
  const [phrase, setPhrase] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const target = PHRASES[phrase];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && displayed.length < target.length) {
      timeout = setTimeout(() => setDisplayed(target.slice(0, displayed.length + 1)), 55);
    } else if (!deleting && displayed.length === target.length) {
      timeout = setTimeout(() => setDeleting(true), 1800);
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 28);
    } else if (deleting && displayed.length === 0) {
      setDeleting(false);
      setPhrase(p => (p + 1) % PHRASES.length);
    }
    return () => clearTimeout(timeout);
  }, [displayed, deleting, phrase]);

  return displayed;
}

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const duration = 1800;
        const step = 16;
        const steps = duration / step;
        let current = 0;
        const inc = target / steps;
        const timer = setInterval(() => {
          current = Math.min(current + inc, target);
          setCount(Math.floor(current));
          if (current >= target) clearInterval(timer);
        }, step);
      }
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ── Custom glowing cursor ─────────────────────────────────────────────────────
function GlowCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rx = 0, ry = 0;
    const onMove = (e: MouseEvent) => {
      const x = e.clientX, y = e.clientY;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${x - 10}px, ${y - 10}px)`;
      }
      // Smooth trail
      const drift = () => {
        rx += (x - rx) * 0.12;
        ry += (y - ry) * 0.12;
        if (trailRef.current) {
          trailRef.current.style.transform = `translate(${rx - 18}px, ${ry - 18}px)`;
        }
        animId = requestAnimationFrame(drift);
      };
      cancelAnimationFrame(animId);
      animId = requestAnimationFrame(drift);
    };
    let animId: number;
    window.addEventListener('mousemove', onMove);
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(animId); };
  }, []);

  return (
    <>
      {/* Inner dot */}
      <Box ref={cursorRef} sx={{
        position: 'fixed', top: 0, left: 0, width: 20, height: 20,
        borderRadius: '50%', background: C.cyan, zIndex: 9999,
        pointerEvents: 'none', mixBlendMode: 'screen',
        boxShadow: `0 0 12px ${C.cyan}, 0 0 24px ${C.cyan}`,
        transition: 'width 0.2s, height 0.2s',
      }} />
      {/* Outer ring trail */}
      <Box ref={trailRef} sx={{
        position: 'fixed', top: 0, left: 0, width: 36, height: 36,
        borderRadius: '50%', border: `1.5px solid rgba(0,200,255,0.45)`,
        zIndex: 9998, pointerEvents: 'none',
        background: 'rgba(0,200,255,0.04)',
      }} />
    </>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────
const STATS = [
  { value: 2400, suffix: '+', label: 'Businesses' },
  { value: 98, suffix: '%', label: 'Uptime' },
  { value: 50, suffix: 'K+', label: 'Bookings/mo' },
  { value: 4.9, suffix: '★', label: 'Rating', isFloat: true },
];

const BENTO = [
  {
    icon: SmartToyIcon, title: 'AI Voice Onboarding',
    desc: 'Set up your entire business profile just by talking. Our AI listens, understands, and configures everything for you in minutes.',
    span: 2, accent: C.cyan, big: true,
    badge: 'NEW',
  },
  {
    icon: ViewKanbanIcon, title: 'Kanban Pipeline',
    desc: 'Drag-and-drop leads through customizable stages with real-time sync.',
    span: 1, accent: C.purple,
  },
  {
    icon: AutoAwesomeIcon, title: 'Smart Automations',
    desc: 'Set triggers once. Let AI handle the rest — emails, updates, alerts.',
    span: 1, accent: '#FF6B9D',
  },
  {
    icon: InboxIcon, title: 'Unified Inbox',
    desc: 'Gmail, messages, leads — all in one intelligent conversation hub.',
    span: 1, accent: '#FFB800',
  },
  {
    icon: BarChartIcon, title: 'Live Analytics',
    desc: 'Beautiful dashboards with AI-generated insights that actually matter.',
    span: 2, accent: C.cyan,
  },
];

const FEATURES_ROW = [
  { icon: CalendarMonthIcon, title: 'Smart Bookings', desc: 'Calendar & scheduling' },
  { icon: DescriptionIcon, title: 'Smart Forms', desc: 'Custom with auto-send' },
  { icon: EmailIcon, title: 'Email Templates', desc: 'Pre-built campaigns' },
  { icon: PeopleIcon, title: 'Team Management', desc: 'Role-based access' },
  { icon: InventoryIcon, title: 'Inventory', desc: 'Product catalog' },
  { icon: IntegrationInstructionsIcon, title: 'Integrations', desc: 'Gmail, Calendar & more' },
  { icon: NotificationsIcon, title: 'Notifications', desc: 'Real-time alerts' },
  { icon: SecurityIcon, title: 'Enterprise Security', desc: 'SOC2 compliant' },
];

const TESTIMONIALS = [
  { name: 'Priya S.', role: 'Salon Owner', text: 'Nexaserv replaced 4 different tools. The AI onboarding had us live in 8 minutes.' },
  { name: 'Arjun M.', role: 'Clinic Manager', text: 'Bookings are up 40% since switching. The automation alone saves us 3 hours daily.' },
  { name: 'Sneha K.', role: 'Fitness Studio CEO', text: 'The voice assistant is genuinely magical. My staff needed zero training.' },
];

const HOW_IT_WORKS = [
  { step: '01', icon: MicIcon, title: 'Talk to AI', desc: 'Speak your business details naturally. No forms, no clicks.' },
  { step: '02', icon: AutoAwesomeIcon, title: 'AI Configures', desc: 'Nexaserv sets up your profile, services, and hours instantly.' },
  { step: '03', icon: BoltIcon, title: 'Go Live', desc: 'Your booking page, inbox, and dashboard are ready immediately.' },
  { step: '04', icon: SpeedIcon, title: 'Grow Faster', desc: 'Automations handle the routine. You focus on what matters.' },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function Home() {
  const typed = useTypewriter();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.6], [0, -60]);

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh', overflow: 'auto', bgcolor: C.dark, cursor: 'none' }}>
      <GlowCursor />

      {/* Fixed neural background */}
      <Box sx={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <NeuralBackground />
      </Box>

      {/* ── HERO ── */}
      <Box
        ref={heroRef}
        component={motion.div}
        style={{ opacity: heroOpacity, y: heroY }}
        sx={{
          position: 'relative', minHeight: '100vh',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1, px: 2,
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: 'easeOut' }}>

            {/* AI badge */}
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
              <Box sx={{
                display: 'inline-flex', alignItems: 'center', gap: 1,
                px: 2.5, py: 0.8, borderRadius: 99, mb: 4,
                border: `1px solid rgba(0,200,255,0.3)`,
                background: 'rgba(0,200,255,0.07)',
                backdropFilter: 'blur(12px)',
              }}>
                <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: C.cyan, boxShadow: `0 0 8px ${C.cyan}`, animation: 'pulse 2s infinite' }} />
                <Typography sx={{ fontSize: '0.7rem', color: C.cyan, fontWeight: 700, letterSpacing: '0.12em' }}>
                  AI-POWERED BUSINESS PLATFORM
                </Typography>
              </Box>
            </motion.div>

            {/* Main headline */}
            <Typography variant="h1" sx={{
              fontWeight: 900,
              fontSize: { xs: '3rem', sm: '4.5rem', md: '6.5rem', lg: '7.5rem' },
              letterSpacing: '-0.04em', lineHeight: 0.95, mb: 3,
              background: `linear-gradient(135deg, #fff 0%, #c8e6ff 35%, ${C.cyan} 65%, ${C.purple} 100%)`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              filter: `drop-shadow(0 0 50px rgba(0,200,255,0.3))`,
            }}>
              NEXASERV
            </Typography>

            {/* Typewriter line */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.5, mb: 5, flexWrap: 'wrap' }}>
              <Typography sx={{ color: 'rgba(200,225,255,0.7)', fontSize: { xs: '1.1rem', md: '1.5rem' }, fontWeight: 300 }}>
                The AI that
              </Typography>
              <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                <Typography sx={{
                  fontSize: { xs: '1.1rem', md: '1.5rem' }, fontWeight: 700,
                  color: C.cyan, minWidth: { xs: 200, md: 300 }, textAlign: 'left',
                  textShadow: `0 0 20px rgba(0,200,255,0.5)`,
                }}>
                  {typed}
                  <Box component="span" sx={{
                    display: 'inline-block', width: 2, height: '1.2em',
                    bgcolor: C.cyan, ml: 0.5, verticalAlign: 'text-bottom',
                    animation: 'blink 1s step-end infinite',
                  }} />
                </Typography>
              </Box>
            </Box>

            {/* Subtitle */}
            <Typography sx={{
              color: C.muted, fontSize: { xs: '0.95rem', md: '1.1rem' },
              maxWidth: 520, mx: 'auto', lineHeight: 1.7, mb: 6,
            }}>
              One intelligent platform for bookings, leads, automations, and growth.
              Set up in minutes with AI voice onboarding.
            </Typography>

            {/* CTAs */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: 4 }}>
              <Link href="/register" passHref>
                <Button variant="contained" size="large" endIcon={<ArrowForwardIcon />} sx={{
                  px: 5, py: 1.5, borderRadius: 2, fontSize: '1rem', fontWeight: 700,
                  textTransform: 'none',
                  background: `linear-gradient(135deg, ${C.cyan}, ${C.purple})`,
                  boxShadow: `0 0 30px rgba(0,200,255,0.35)`,
                  '&:hover': { transform: 'translateY(-3px)', boxShadow: `0 0 50px rgba(0,200,255,0.6)` },
                  transition: 'all 0.3s ease',
                }}>
                  Start Free — No Card Needed
                </Button>
              </Link>
              <Link href="/login" passHref>
                <Button variant="outlined" size="large" sx={{
                  px: 5, py: 1.5, borderRadius: 2, fontSize: '1rem', fontWeight: 600,
                  textTransform: 'none',
                  borderColor: 'rgba(0,200,255,0.3)', color: 'rgba(200,230,255,0.85)',
                  backdropFilter: 'blur(8px)', background: 'rgba(0,200,255,0.05)',
                  '&:hover': { borderColor: C.cyan, background: 'rgba(0,200,255,0.1)', transform: 'translateY(-3px)' },
                  transition: 'all 0.3s ease',
                }}>
                  Sign In
                </Button>
              </Link>
            </Box>

            {/* Trust line */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              {['No setup fee', 'Cancel anytime', 'AI-guided onboarding'].map(t => (
                <Box key={t} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CheckCircleIcon sx={{ fontSize: '0.85rem', color: C.cyan }} />
                  <Typography sx={{ fontSize: '0.8rem', color: C.muted }}>{t}</Typography>
                </Box>
              ))}
            </Box>
          </motion.div>
        </Container>

        {/* Scroll indicator */}
        <Box sx={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)' }}>
          <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
            <Box sx={{ width: 24, height: 40, borderRadius: 99, border: `2px solid rgba(0,200,255,0.3)`, display: 'flex', justifyContent: 'center', pt: 1 }}>
              <Box sx={{ width: 4, height: 8, borderRadius: 99, bgcolor: C.cyan, opacity: 0.7 }} />
            </Box>
          </motion.div>
        </Box>
      </Box>

      {/* ── CONTENT ── */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>

        {/* ── STATS BAR ── */}
        <Box sx={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, backdropFilter: 'blur(20px)', background: 'rgba(3,8,20,0.6)', py: 5 }}>
          <Container maxWidth="lg">
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', md: 'repeat(4,1fr)' }, gap: 4 }}>
              {STATS.map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography sx={{
                      fontSize: { xs: '2.2rem', md: '3rem' }, fontWeight: 800, lineHeight: 1,
                      background: `linear-gradient(135deg, #fff, ${C.cyan})`,
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                      mb: 0.5,
                    }}>
                      {s.isFloat
                        ? <>{s.value}{s.suffix}</>
                        : <Counter target={s.value} suffix={s.suffix} />
                      }
                    </Typography>
                    <Typography sx={{ color: C.muted, fontSize: '0.85rem', fontWeight: 500, letterSpacing: '0.06em' }}>
                      {s.label}
                    </Typography>
                  </Box>
                </motion.div>
              ))}
            </Box>
          </Container>
        </Box>

        {/* ── HOW IT WORKS ── */}
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 14 } }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Typography sx={{ textAlign: 'center', color: C.cyan, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', mb: 2 }}>
              HOW IT WORKS
            </Typography>
            <Typography variant="h3" sx={{
              fontWeight: 800, textAlign: 'center', mb: 2,
              fontSize: { xs: '1.8rem', md: '2.8rem' }, letterSpacing: '-0.03em',
              background: `linear-gradient(135deg, #fff 0%, #AAD4FF 60%, ${C.cyan} 100%)`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Up and running in minutes
            </Typography>
            <Typography sx={{ color: C.muted, textAlign: 'center', mb: { xs: 6, md: 10 }, maxWidth: 500, mx: 'auto' }}>
              No technical setup. Just talk to our AI and your business is live.
            </Typography>
          </motion.div>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', md: 'repeat(4,1fr)' }, gap: 3, position: 'relative' }}>
            {/* Connector line */}
            <Box sx={{ display: { xs: 'none', md: 'block' }, position: 'absolute', top: 36, left: '12%', right: '12%', height: 1, background: `linear-gradient(90deg, transparent, ${C.cyan}44, ${C.purple}44, transparent)` }} />

            {HOW_IT_WORKS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
                  <Box sx={{ textAlign: 'center', position: 'relative' }}>
                    <Box sx={{
                      width: 72, height: 72, borderRadius: '50%', mx: 'auto', mb: 3,
                      background: `radial-gradient(circle, rgba(0,200,255,0.15), rgba(0,200,255,0.03))`,
                      border: `1.5px solid rgba(0,200,255,0.3)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      position: 'relative', zIndex: 1,
                      boxShadow: `0 0 30px rgba(0,200,255,0.15)`,
                    }}>
                      <Icon sx={{ fontSize: '1.8rem', color: C.cyan }} />
                    </Box>
                    <Typography sx={{ color: 'rgba(0,200,255,0.3)', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em', mb: 0.5 }}>
                      STEP {step.step}
                    </Typography>
                    <Typography sx={{ color: 'rgba(220,240,255,0.9)', fontWeight: 700, fontSize: '1rem', mb: 1 }}>
                      {step.title}
                    </Typography>
                    <Typography sx={{ color: C.muted, fontSize: '0.85rem', lineHeight: 1.6 }}>
                      {step.desc}
                    </Typography>
                  </Box>
                </motion.div>
              );
            })}
          </Box>
        </Container>

        {/* ── BENTO GRID ── */}
        <Box sx={{ background: 'rgba(0,5,15,0.5)', backdropFilter: 'blur(10px)', py: { xs: 8, md: 14 }, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
          <Container maxWidth="lg">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Typography sx={{ textAlign: 'center', color: C.cyan, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', mb: 2 }}>
                FEATURES
              </Typography>
              <Typography variant="h3" sx={{
                fontWeight: 800, textAlign: 'center', mb: 2,
                fontSize: { xs: '1.8rem', md: '2.8rem' }, letterSpacing: '-0.03em',
                background: `linear-gradient(135deg, #fff 0%, #AAD4FF 60%, ${C.cyan} 100%)`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                Everything in one place
              </Typography>
              <Typography sx={{ color: C.muted, textAlign: 'center', mb: { xs: 6, md: 10 }, maxWidth: 500, mx: 'auto' }}>
                A complete AI-powered suite built for modern businesses
              </Typography>
            </motion.div>

            {/* Main bento grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3,1fr)' }, gap: 3, mb: 3 }}>
              {/* Big card - AI Voice */}
              <motion.div style={{ gridColumn: 'span 2' }} initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <Box sx={{
                  p: { xs: 3, md: 5 }, borderRadius: 3, height: '100%', minHeight: 260,
                  background: `linear-gradient(135deg, rgba(0,200,255,0.1) 0%, rgba(100,80,255,0.08) 100%)`,
                  border: `1px solid rgba(0,200,255,0.25)`,
                  backdropFilter: 'blur(20px)', position: 'relative', overflow: 'hidden',
                  transition: 'all 0.4s ease',
                  '&:hover': { borderColor: 'rgba(0,200,255,0.5)', boxShadow: `0 20px 60px rgba(0,200,255,0.12)`, transform: 'translateY(-4px)' },
                }}>
                  {/* Glow effect */}
                  <Box sx={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, rgba(0,200,255,0.15), transparent)`, pointerEvents: 'none' }} />
                  <Box sx={{ display: 'inline-flex', px: 1.5, py: 0.4, borderRadius: 99, background: 'rgba(0,200,255,0.15)', border: `1px solid rgba(0,200,255,0.3)`, mb: 3 }}>
                    <Typography sx={{ fontSize: '0.65rem', color: C.cyan, fontWeight: 700, letterSpacing: '0.1em' }}>✦ NEW</Typography>
                  </Box>
                  <SmartToyIcon sx={{ fontSize: '2.5rem', color: C.cyan, mb: 2, display: 'block' }} />
                  <Typography sx={{ color: 'rgba(220,240,255,0.95)', fontWeight: 700, fontSize: '1.4rem', mb: 1.5 }}>
                    AI Voice Onboarding
                  </Typography>
                  <Typography sx={{ color: C.muted, lineHeight: 1.7, maxWidth: 420 }}>
                    Just talk. Our AI listens to your voice, extracts your business details, and configures your entire platform — bookings, services, hours — in under 5 minutes. No typing required.
                  </Typography>
                </Box>
              </motion.div>

              {/* Analytics card */}
              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <Box sx={{
                  p: { xs: 3, md: 4 }, borderRadius: 3, height: '100%', minHeight: 260,
                  background: `linear-gradient(135deg, rgba(100,80,255,0.1), rgba(0,200,255,0.05))`,
                  border: `1px solid rgba(100,80,255,0.2)`,
                  backdropFilter: 'blur(20px)',
                  transition: 'all 0.4s ease',
                  '&:hover': { borderColor: 'rgba(100,80,255,0.4)', boxShadow: `0 20px 60px rgba(100,80,255,0.12)`, transform: 'translateY(-4px)' },
                }}>
                  <BarChartIcon sx={{ fontSize: '2rem', color: C.purple, mb: 2, display: 'block' }} />
                  <Typography sx={{ color: 'rgba(220,240,255,0.95)', fontWeight: 700, fontSize: '1.1rem', mb: 1 }}>Live Analytics</Typography>
                  <Typography sx={{ color: C.muted, fontSize: '0.88rem', lineHeight: 1.7 }}>
                    AI-generated insights and beautiful dashboards that show exactly what's working and what's not.
                  </Typography>
                </Box>
              </motion.div>
            </Box>

            {/* Second row */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', md: 'repeat(3,1fr)' }, gap: 3 }}>
              {[
                { icon: ViewKanbanIcon, title: 'Kanban Pipeline', desc: 'Drag leads through stages. Close deals faster with visual clarity.', color: '#FF6B9D' },
                { icon: AutoAwesomeIcon, title: 'Smart Automations', desc: 'Trigger emails, updates, and alerts automatically. Zero manual work.', color: '#FFB800' },
                { icon: InboxIcon, title: 'Unified Inbox', desc: 'All messages in one place. Gmail, SMS, and leads — fully synced.', color: C.cyan },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                    <Box sx={{
                      p: { xs: 3, md: 4 }, borderRadius: 3,
                      background: C.card, border: `1px solid ${C.border}`,
                      backdropFilter: 'blur(20px)',
                      transition: 'all 0.4s ease',
                      '&:hover': { borderColor: `${item.color}55`, boxShadow: `0 16px 40px ${item.color}18`, transform: 'translateY(-4px)' },
                    }}>
                      <Icon sx={{ fontSize: '1.8rem', color: item.color, mb: 2, display: 'block' }} />
                      <Typography sx={{ color: 'rgba(220,240,255,0.95)', fontWeight: 700, fontSize: '1rem', mb: 1 }}>{item.title}</Typography>
                      <Typography sx={{ color: C.muted, fontSize: '0.85rem', lineHeight: 1.6 }}>{item.desc}</Typography>
                    </Box>
                  </motion.div>
                );
              })}
            </Box>
          </Container>
        </Box>

        {/* ── MORE FEATURES ROW ── */}
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Typography sx={{ textAlign: 'center', color: C.muted, fontSize: '0.85rem', mb: 6 }}>
              And much more built-in →
            </Typography>
          </motion.div>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(4,1fr)' }, gap: 2 }}>
            {FEATURES_ROW.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                  <Box sx={{
                    p: 2.5, borderRadius: 2,
                    background: C.card, border: `1px solid ${C.border}`,
                    backdropFilter: 'blur(12px)',
                    display: 'flex', alignItems: 'center', gap: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': { borderColor: `rgba(0,200,255,0.3)`, transform: 'translateY(-3px)', boxShadow: `0 8px 30px rgba(0,200,255,0.1)` },
                  }}>
                    <Icon sx={{ fontSize: '1.4rem', color: C.cyan, flexShrink: 0 }} />
                    <Box>
                      <Typography sx={{ color: 'rgba(220,240,255,0.9)', fontWeight: 600, fontSize: '0.8rem' }}>{f.title}</Typography>
                      <Typography sx={{ color: C.muted, fontSize: '0.7rem' }}>{f.desc}</Typography>
                    </Box>
                  </Box>
                </motion.div>
              );
            })}
          </Box>
        </Container>

        {/* ── TESTIMONIALS ── */}
        <Box sx={{ background: 'rgba(0,5,15,0.5)', py: { xs: 8, md: 12 }, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
          <Container maxWidth="lg">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Typography sx={{ textAlign: 'center', color: C.cyan, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', mb: 2 }}>TESTIMONIALS</Typography>
              <Typography variant="h3" sx={{
                fontWeight: 800, textAlign: 'center', mb: { xs: 6, md: 10 },
                fontSize: { xs: '1.8rem', md: '2.5rem' }, letterSpacing: '-0.03em',
                background: `linear-gradient(135deg, #fff, ${C.cyan})`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                Loved by businesses
              </Typography>
            </motion.div>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3,1fr)' }, gap: 3 }}>
              {TESTIMONIALS.map((t, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
                  <Box sx={{
                    p: 4, borderRadius: 3,
                    background: C.card, border: `1px solid ${C.border}`,
                    backdropFilter: 'blur(20px)', height: '100%',
                    transition: 'all 0.4s ease',
                    '&:hover': { borderColor: `rgba(0,200,255,0.25)`, transform: 'translateY(-4px)' },
                  }}>
                    <Typography sx={{ color: C.cyan, fontSize: '1.2rem', mb: 2 }}>❝</Typography>
                    <Typography sx={{ color: 'rgba(200,225,255,0.8)', fontSize: '0.9rem', lineHeight: 1.75, mb: 3, fontStyle: 'italic' }}>
                      {t.text}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${C.cyan}, ${C.purple})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>{t.name[0]}</Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ color: 'rgba(220,240,255,0.9)', fontWeight: 600, fontSize: '0.85rem' }}>{t.name}</Typography>
                        <Typography sx={{ color: C.muted, fontSize: '0.75rem' }}>{t.role}</Typography>
                      </Box>
                    </Box>
                  </Box>
                </motion.div>
              ))}
            </Box>
          </Container>
        </Box>

        {/* ── FINAL CTA ── */}
        <Container maxWidth="md" sx={{ py: { xs: 10, md: 16 }, textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Box sx={{
              p: { xs: 5, md: 8 }, borderRadius: 4,
              background: `linear-gradient(135deg, rgba(0,200,255,0.08), rgba(100,80,255,0.08))`,
              border: `1px solid rgba(0,200,255,0.2)`,
              backdropFilter: 'blur(20px)', position: 'relative', overflow: 'hidden',
            }}>
              <Box sx={{ position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)', width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle, rgba(0,200,255,0.1), transparent)`, pointerEvents: 'none' }} />
              <Typography sx={{ color: C.cyan, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', mb: 3 }}>GET STARTED TODAY</Typography>
              <Typography variant="h3" sx={{
                fontWeight: 800, mb: 2,
                fontSize: { xs: '1.8rem', md: '2.8rem' }, letterSpacing: '-0.03em',
                background: `linear-gradient(135deg, #fff, ${C.cyan})`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                Your AI business partner awaits
              </Typography>
              <Typography sx={{ color: C.muted, mb: 5, maxWidth: 420, mx: 'auto', lineHeight: 1.7 }}>
                Join 2,400+ businesses already running smarter with Nexaserv. Set up in minutes, grow for years.
              </Typography>
              <Link href="/register" passHref>
                <Button variant="contained" size="large" endIcon={<ArrowForwardIcon />} sx={{
                  px: 6, py: 1.8, borderRadius: 2, fontSize: '1.05rem', fontWeight: 700,
                  textTransform: 'none',
                  background: `linear-gradient(135deg, ${C.cyan}, ${C.purple})`,
                  boxShadow: `0 0 40px rgba(0,200,255,0.35)`,
                  '&:hover': { transform: 'translateY(-3px)', boxShadow: `0 0 60px rgba(0,200,255,0.55)` },
                  transition: 'all 0.3s ease',
                }}>
                  Start Free Trial
                </Button>
              </Link>
            </Box>
          </motion.div>
        </Container>

        {/* ── FOOTER ── */}
        <Box sx={{ borderTop: `1px solid ${C.border}`, py: 4, textAlign: 'center' }}>
          <Typography sx={{ color: 'rgba(100,150,200,0.3)', fontSize: '0.75rem' }}>
            © 2026 Nexaserv. All rights reserved. · Built with AI
          </Typography>
        </Box>
      </Box>

      {/* Global keyframes */}
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;box-shadow:0 0 8px #00C8FF} 50%{opacity:.6;box-shadow:0 0 16px #00C8FF} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        * { cursor: none !important; }
      `}</style>
    </Box>
  );
}