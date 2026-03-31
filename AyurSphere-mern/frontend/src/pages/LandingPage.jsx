import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import '../styles/landing.css';

/* ═══════════════════════════════════════════════════════════════
   Image paths (from public/images/)
   ═══════════════════════════════════════════════════════════════ */
const IMAGES = {
  hero: '/images/hero.png',
  problem: '/images/problem.png',
  transition: '/images/transition.png',
  features: '/images/features-bg.png',
  immersive: '/images/immersive.webp',
  particles: '/images/particles.webp',
};

/* ═══════════════════════════════════════════════════════════════
   Feature data
   ═══════════════════════════════════════════════════════════════ */
const FEATURES = [
  { icon: '🌿', title: 'AI Plant Identification', desc: 'Scan a leaf. Discover its healing properties instantly.' },
  { icon: '🧠', title: 'Herbal Knowledge Base', desc: 'Explore detailed medicinal uses backed by AYUSH.' },
  { icon: '🗺️', title: 'Virtual Herbal Garden', desc: 'Walk through an interactive digital garden.' },
  { icon: '🩺', title: 'Remedy Recommender', desc: 'Get natural solutions tailored to your symptoms.' },
  { icon: '🛒', title: 'Eco-Commerce', desc: 'Buy plants and herbal products directly from trusted sources.' },
];

/* ═══════════════════════════════════════════════════════════════
   Floating Particles Component
   ═══════════════════════════════════════════════════════════════ */
const FloatingParticles = () => {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 4 + 2,
    delay: Math.random() * 15,
    duration: Math.random() * 15 + 15,
    color: i % 3 === 0
      ? 'rgba(168, 224, 99, 0.4)'
      : i % 3 === 1
        ? 'rgba(76, 175, 80, 0.3)'
        : 'rgba(255, 255, 255, 0.15)',
  }));

  return (
    <div className="particles-container">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   Floating Leaves Component
   ═══════════════════════════════════════════════════════════════ */
const FloatingLeaves = () => {
  const leaves = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    emoji: ['🍃', '🌿', '☘️', '🍀'][i % 4],
    delay: Math.random() * 20,
    duration: Math.random() * 18 + 18,
    size: Math.random() * 0.7 + 0.8,
  }));

  return (
    <div className="particles-container">
      {leaves.map((l) => (
        <span
          key={l.id}
          className="leaf"
          style={{
            left: l.left,
            fontSize: `${l.size}rem`,
            animationDelay: `${l.delay}s`,
            animationDuration: `${l.duration}s`,
          }}
        >
          {l.emoji}
        </span>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   Scroll Indicator
   ═══════════════════════════════════════════════════════════════ */
const ScrollIndicator = () => (
  <motion.div
    className="scroll-indicator"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 2, duration: 1 }}
  >
    <div className="scroll-mouse">
      <div className="scroll-dot" />
    </div>
    <span>Scroll</span>
  </motion.div>
);

/* ═══════════════════════════════════════════════════════════════
   Animated section wrapper (fade + slide on scroll)
   ═══════════════════════════════════════════════════════════════ */
const AnimatedSection = ({ children, className = '', style = {} }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   Feature Card
   ═══════════════════════════════════════════════════════════════ */
const FeatureCard = ({ feature, index }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      className="feature-card"
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{
        duration: 0.7,
        delay: index * 0.12,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div className="feature-icon">{feature.icon}</div>
      <h3>{feature.title}</h3>
      <p>{feature.desc}</p>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   LANDING PAGE — main component
   ═══════════════════════════════════════════════════════════════ */
const LandingPage = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll();

  /* Parallax transforms for each background layer */
  const heroY   = useTransform(scrollYProgress, [0, 0.25], ['0%', '-15%']);
  const probY   = useTransform(scrollYProgress, [0.1, 0.4], ['10%', '-10%']);
  const solnY   = useTransform(scrollYProgress, [0.25, 0.55], ['10%', '-10%']);
  const featY   = useTransform(scrollYProgress, [0.4, 0.7], ['8%', '-8%']);
  const immrY   = useTransform(scrollYProgress, [0.6, 0.85], ['10%', '-10%']);

  /* Opacity transforms for crossfade feel */
  const heroOp  = useTransform(scrollYProgress, [0, 0.18], [1, 0]);
  const probOp  = useTransform(scrollYProgress, [0.08, 0.16, 0.3, 0.38], [0, 1, 1, 0]);
  const solnOp  = useTransform(scrollYProgress, [0.22, 0.3, 0.45, 0.53], [0, 1, 1, 0]);
  const featOp  = useTransform(scrollYProgress, [0.38, 0.46, 0.65, 0.73], [0, 1, 1, 0]);
  const immrOp  = useTransform(scrollYProgress, [0.58, 0.66, 0.82, 0.9], [0, 1, 1, 0]);

  const enterSphere = () => navigate('/portal');

  return (
    <div className="landing-root" ref={containerRef}>

      {/* ═══════ FIXED BACKGROUND LAYERS ═══════ */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        {/* Hero */}
        <motion.div style={{
          position: 'absolute', inset: '-10%',
          backgroundImage: `url(${IMAGES.hero})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          y: heroY, opacity: heroOp,
        }} />
        {/* Problem */}
        <motion.div style={{
          position: 'absolute', inset: '-10%',
          backgroundImage: `url(${IMAGES.problem})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          y: probY, opacity: probOp,
        }} />
        {/* Solution */}
        <motion.div style={{
          position: 'absolute', inset: '-10%',
          backgroundImage: `url(${IMAGES.transition})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          y: solnY, opacity: solnOp,
        }} />
        {/* Features */}
        <motion.div style={{
          position: 'absolute', inset: '-10%',
          backgroundImage: `url(${IMAGES.features})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          y: featY, opacity: featOp,
        }} />
        {/* Immersive */}
        <motion.div style={{
          position: 'absolute', inset: '-10%',
          backgroundImage: `url(${IMAGES.immersive})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          y: immrY, opacity: immrOp,
        }} />

        {/* Persistent dark overlay for text readability */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(6,13,2,0.35) 0%, rgba(6,13,2,0.55) 100%)',
        }} />
      </div>

      {/* ═══════════════════════════════════════════
           SECTION 1 — HERO
           ═══════════════════════════════════════════ */}
      <section className="landing-section hero-section" id="hero">
        <FloatingParticles />
        <motion.div
          className="landing-section-content"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.p
            style={{ fontSize: '0.85rem', letterSpacing: '4px', textTransform: 'uppercase', color: 'rgba(168,224,99,0.7)', marginBottom: '1rem', fontWeight: 500 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            ✦ Virtual Herbal Garden ✦
          </motion.p>

          <h1 className="hero-title">
            Welcome to<br />AyurSphere
          </h1>

          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            Explore the Healing Power of Nature through AYUSH
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
          >
          </motion.div>
        </motion.div>
        <ScrollIndicator />
      </section>

      {/* ═══════════════════════════════════════════
           SECTION 2 — THE PROBLEM
           ═══════════════════════════════════════════ */}
      <section className="landing-section" id="problem" style={{ minHeight: '100vh' }}>
        <div className="landing-section-overlay" style={{
          background: 'linear-gradient(180deg, rgba(6,13,2,0.3) 0%, rgba(6,13,2,0.6) 50%, rgba(6,13,2,0.3) 100%)',
        }} />
        <AnimatedSection className="landing-section-content">
          <div className="glass-card" style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 className="section-heading" style={{ color: 'rgba(240,247,235,0.9)' }}>
              Modern life has <span className="highlight">disconnected</span> us from nature's healing wisdom.
            </h2>
            <p className="section-text" style={{ marginTop: '1rem' }}>
              In our rush toward progress, we've forgotten the profound remedies that have sustained civilizations for millennia.
            </p>
          </div>
        </AnimatedSection>
      </section>

      {/* ═══════════════════════════════════════════
           SECTION 3 — THE SOLUTION
           ═══════════════════════════════════════════ */}
      <section className="landing-section" id="solution" style={{ minHeight: '100vh' }}>
        <FloatingLeaves />
        <div className="landing-section-overlay" style={{
          background: 'linear-gradient(180deg, rgba(6,13,2,0.4) 0%, rgba(6,13,2,0.55) 50%, rgba(6,13,2,0.4) 100%)',
        }} />
        <AnimatedSection className="landing-section-content">
          <div className="glass-card" style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 className="section-heading">
              <span className="highlight">AyurSphere</span> reconnects you with centuries-old herbal knowledge.
            </h2>
            <p className="section-text" style={{ marginTop: '1rem' }}>
              An immersive digital ecosystem where ancient wisdom meets modern technology — bringing the healing power of AYUSH right to your fingertips.
            </p>
          </div>
        </AnimatedSection>
      </section>

      {/* ═══════════════════════════════════════════
           SECTION 4 — FEATURES SHOWCASE
           ═══════════════════════════════════════════ */}
      <section className="landing-section" id="features" style={{ minHeight: '120vh', paddingTop: '8rem', paddingBottom: '8rem' }}>
        <div className="landing-section-overlay" style={{
          background: 'rgba(6,13,2,0.65)',
        }} />
        <div style={{ position: 'relative', zIndex: 2, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <AnimatedSection className="landing-section-content" style={{ marginBottom: '3rem' }}>
            <h2 className="section-heading">
              Discover what <span className="highlight">AyurSphere</span> offers
            </h2>
            <p className="section-text">
              Five powerful pillars designed to transform your relationship with nature.
            </p>
          </AnimatedSection>

          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <FeatureCard key={i} feature={f} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
           SECTION 5 — IMMERSIVE EXPERIENCE
           ═══════════════════════════════════════════ */}
      <section className="landing-section" id="immersive" style={{ minHeight: '100vh' }}>
        <div className="landing-section-overlay" style={{
          background: 'linear-gradient(180deg, rgba(6,13,2,0.4) 0%, rgba(6,13,2,0.5) 50%, rgba(6,13,2,0.7) 100%)',
        }} />
        <AnimatedSection className="landing-section-content">
          <motion.p
            style={{
              fontSize: '0.8rem', letterSpacing: '4px', textTransform: 'uppercase',
              color: 'rgba(168,224,99,0.6)', marginBottom: '1.5rem', fontWeight: 500,
            }}
          >
            Beyond a Website
          </motion.p>
          <h2 className="section-heading" style={{ fontSize: 'clamp(2rem, 5vw, 3.8rem)' }}>
            Not just a website —<br />
            an <span className="highlight">experience</span>.
          </h2>
          <p className="section-text" style={{ marginTop: '1.5rem' }}>
            Step into a living, breathing virtual garden. Explore medicinal plants in 3D,
            discover AR-overlayed herbal insights, and immerse yourself in the ecosystem of healing.
          </p>
        </AnimatedSection>
      </section>

      {/* ═══════════════════════════════════════════
           SECTION 6 — FINAL CTA
           ═══════════════════════════════════════════ */}
      <section className="landing-section final-section" id="final-cta" style={{ minHeight: '80vh' }}>
        <FloatingParticles />
        <AnimatedSection className="landing-section-content">
          <motion.p
            style={{
              fontSize: '0.8rem', letterSpacing: '4px', textTransform: 'uppercase',
              color: 'rgba(168,224,99,0.6)', marginBottom: '1.5rem', fontWeight: 500,
            }}
          >
            The Future of Natural Healing
          </motion.p>
          <h2 className="section-heading" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: '1.5rem' }}>
            Step into the future of<br />
            <span className="highlight">natural healing</span>.
          </h2>
          <p className="section-text" style={{ marginBottom: '3rem' }}>
            Your journey with AyurSphere begins with a single step.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            <button className="cta-button cta-final-button" onClick={enterSphere}>
              Enter AyurSphere
            </button>
          </motion.div>
        </AnimatedSection>
      </section>

      {/* ── Footer bar ── */}
      <footer style={{
        position: 'relative', zIndex: 2,
        padding: '2rem', textAlign: 'center',
        background: 'rgba(6,13,2,0.95)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}>
        <p style={{ fontSize: '0.8rem', color: 'rgba(240,247,235,0.35)', fontWeight: 300 }}>
          © 2026 AyurSphere · Virtual Herbal Garden · Built with 💚
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
