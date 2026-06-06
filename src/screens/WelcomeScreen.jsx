import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import './WelcomeScreen.css';

// Bokeh orbs config
const orbs = [
  { cx: 30, cy: 40, r: 120, color: '#C0395A', dur: 8 },
  { cx: 70, cy: 60, r: 80, color: '#E8924A', dur: 11 },
  { cx: 20, cy: 70, r: 60, color: '#C0395A', dur: 14 },
  { cx: 80, cy: 25, r: 90, color: '#E8924A', dur: 9 },
  { cx: 50, cy: 80, r: 50, color: '#C0395A', dur: 12 },
];

export default function WelcomeScreen({ onBegin }) {
  return (
    <div className="welcome-screen">
      {/* Animated bokeh background */}
      <div className="bokeh-bg" aria-hidden="true">
        {orbs.map((o, i) => (
          <div
            key={i}
            className="bokeh-orb"
            style={{
              left: `${o.cx}%`,
              top: `${o.cy}%`,
              width: o.r * 2,
              height: o.r * 2,
              background: `radial-gradient(circle, ${o.color}33 0%, transparent 70%)`,
              animationDuration: `${o.dur}s`,
              animationDelay: `${i * 1.2}s`,
            }}
          />
        ))}
      </div>

      {/* Radial bloom */}
      <div className="welcome-bloom" aria-hidden="true" />

      <div className="welcome-content">
        {/* Line */}
        <motion.div
          className="welcome-line"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
        />

        {/* Logo mark */}
        <motion.div
          className="welcome-logo"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="logoGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#E8924A" />
                <stop offset="100%" stopColor="#C0395A" />
              </radialGradient>
            </defs>
            {/* Heart shape */}
            <path
              d="M36 56 C36 56 12 40 12 26 C12 18 18 12 24 12 C28 12 32 14 36 18 C40 14 44 12 48 12 C54 12 60 18 60 26 C60 40 36 56 36 56Z"
              fill="url(#logoGrad)"
              opacity="0.9"
            />
            {/* Location pin stem */}
            <path
              d="M36 42 L36 62"
              stroke="url(#logoGrad)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Pin circle */}
            <circle cx="36" cy="65" r="3" fill="#E8924A" />
            {/* Inner heart highlight */}
            <path
              d="M28 24 C26 20 22 20 20 24 C18 28 20 32 28 38"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.4"
            />
          </svg>
        </motion.div>

        {/* Title */}
        <motion.h1
          className="welcome-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
        >
          Bangalore
          <span className="welcome-title-accent"> with Stuti</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="welcome-subtitle"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
        >
          A handpicked journey, just for you
        </motion.p>
      </div>

      {/* CTA */}
      <motion.div
        className="welcome-cta"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.4 }}
      >
        <button className="btn btn-primary btn-pill welcome-btn" onClick={onBegin} id="begin-exploring-btn">
          <MapPin size={18} />
          Begin Exploring
        </button>
        <p className="welcome-meta">63 places · 5 categories · 1 city</p>
      </motion.div>
    </div>
  );
}
