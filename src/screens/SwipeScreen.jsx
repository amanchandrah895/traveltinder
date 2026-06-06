import { useState, useRef, useCallback } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import {
  MapPin, Clock, Wallet, X, Heart, Info,
  Bike, Train, Car, RotateCcw, ArrowRight, ExternalLink
} from 'lucide-react';

function googleSearch(name) {
  return `https://www.google.com/search?q=${encodeURIComponent(name + ' Bangalore')}&tbm=isch`;
}
import './SwipeScreen.css';

function getCommuteIcon(commute) {
  const lower = (commute || '').toLowerCase();
  if (lower.includes('bike')) return Bike;
  if (lower.includes('metro') || lower.includes('train')) return Train;
  return Car;
}

function formatBudget(inr) {
  if (inr === 0) return 'Free';
  if (inr < 1000) return `₹${inr}`;
  return `₹${(inr / 1000).toFixed(inr % 1000 === 0 ? 0 : 1)}k`;
}

function PlaceCard({ place, onSwipe, isTop, style }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);
  const opacity = useTransform(x, [-250, -80, 0, 80, 250], [0, 1, 1, 1, 0]);
  const heartOpacity = useTransform(x, [20, 100], [0, 1]);
  const crossOpacity = useTransform(x, [-100, -20], [1, 0]);
  const borderGreen = useTransform(x, [20, 100], ['rgba(76,175,130,0)', 'rgba(76,175,130,0.7)']);
  const borderRed = useTransform(x, [-100, -20], ['rgba(224,85,85,0.7)', 'rgba(224,85,85,0)']);

  const [imgLoaded, setImgLoaded] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const CommuteIcon = getCommuteIcon(place.commute);

  const handleDragEnd = useCallback(async (_, info) => {
    const threshold = 100;
    const velocity = info.velocity.x;
    if (Math.abs(info.offset.x) > threshold || Math.abs(velocity) > 400) {
      try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch (e) {}
      const dir = info.offset.x > 0 || velocity > 400 ? 'right' : 'left';
      animate(x, dir === 'right' ? 600 : -600, { duration: 0.35 });
      setTimeout(() => onSwipe(dir), 250);
    } else {
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 28 });
    }
  }, [x, onSwipe]);

  if (!isTop) {
    return (
      <div className="swipe-card swipe-card--stack" style={style}>
        <div className={`swipe-card-img-wrap ${!imgLoaded ? 'img-skeleton' : ''}`}>
          <img
            src={place.image_url}
            alt={place.name}
            onLoad={() => setImgLoaded(true)}
            loading="lazy"
          />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="swipe-card swipe-card--top"
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
    >
      {/* Border glow */}
      <motion.div className="swipe-glow swipe-glow--green" style={{ opacity: heartOpacity }} />
      <motion.div className="swipe-glow swipe-glow--red" style={{ opacity: crossOpacity }} />

      {/* Image */}
      <div className={`swipe-card-img-wrap ${!imgLoaded ? 'img-skeleton' : ''}`}>
        <img
          src={place.image_url}
          alt={place.name}
          onLoad={() => setImgLoaded(true)}
          loading="lazy"
          draggable={false}
        />
        {/* Top vignette */}
        <div className="swipe-vignette-top" />
        {/* Bottom gradient */}
        <div className="swipe-gradient-bottom" />
      </div>

      {/* Swipe stamps */}
      <motion.div className="swipe-stamp swipe-stamp--love" style={{ opacity: heartOpacity }}>
        <Heart size={40} fill="currentColor" />
      </motion.div>
      <motion.div className="swipe-stamp swipe-stamp--skip" style={{ opacity: crossOpacity }}>
        <X size={40} />
      </motion.div>

      {/* Category badge */}
      <div className="swipe-badge-category chip chip-glass">
        <MapPin size={11} />
        {place.type.split('/')[0]}
      </div>

      {/* Distance chip */}
      <div className="swipe-badge-distance chip chip-glass">
        <MapPin size={11} />
        {place.distance_km} km
      </div>

      {/* Bottom content */}
      <div className="swipe-card-content">
        <h2 className="swipe-place-name">{place.name}</h2>
        <p className="swipe-known-for">{place.known_for}</p>

        <div className="swipe-info-chips">
          <div className="chip chip-glass">
            <Clock size={11} />
            {place.best_time}
          </div>
          <div className="chip chip-glass">
            <CommuteIcon size={11} />
            {place.commute.split(',')[0].slice(0, 22)}
          </div>
          <div className="chip chip-glass">
            <Wallet size={11} />
            {formatBudget(place.budget_inr)}
          </div>
        </div>

        {/* Info panel */}
        {showInfo && (
          <motion.div
            className="swipe-info-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="swipe-couple-appeal">{place.couple_appeal}</p>
            <p className="swipe-commute">{place.commute}</p>
            <a
              href={googleSearch(place.name)}
              target="_blank"
              rel="noreferrer"
              className="swipe-google-btn"
              onClick={e => e.stopPropagation()}
            >
              <ExternalLink size={12} />
              See photos on Google
            </a>
          </motion.div>
        )}
      </div>

      {/* Info button */}
      <button
        className="swipe-info-btn"
        onClick={() => setShowInfo(v => !v)}
        id={`info-${place.id}`}
      >
        <Info size={16} />
      </button>
    </motion.div>
  );
}

// Empty state SVG
function EmptyState({ onViewSaved, onViewSkipped }) {
  return (
    <motion.div
      className="swipe-empty"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <svg width="120" height="90" viewBox="0 0 120 90" fill="none">
        <rect x="20" y="40" width="80" height="45" rx="8" fill="var(--surface2)" stroke="var(--border)" strokeWidth="1.5"/>
        <rect x="35" y="30" width="22" height="35" rx="6" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.5"/>
        <rect x="63" y="30" width="22" height="35" rx="6" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.5"/>
        <circle cx="46" cy="52" r="3" fill="var(--primary)" opacity="0.6"/>
        <circle cx="74" cy="52" r="3" fill="var(--accent)" opacity="0.6"/>
        <path d="M46 62 Q60 70 74 62" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6"/>
        <circle cx="28" cy="18" r="5" fill="var(--primary)" opacity="0.3"/>
        <circle cx="92" cy="22" r="4" fill="var(--accent)" opacity="0.3"/>
        <circle cx="60" cy="10" r="3" fill="var(--primary)" opacity="0.2"/>
      </svg>
      <h2>You've seen it all</h2>
      <p>Check your saved picks or revisit what you skipped</p>
      <div className="swipe-empty-actions">
        <button className="btn btn-primary" onClick={onViewSaved} id="view-saved-btn">
          <Heart size={16} />
          View Saved
        </button>
        <button className="btn btn-secondary" onClick={onViewSkipped} id="view-skipped-btn">
          <RotateCcw size={16} />
          View Skipped
        </button>
      </div>
    </motion.div>
  );
}

export default function SwipeScreen({ cards, onSave, onSkip, onViewSaved, onViewSkipped, totalFiltered }) {
  const handleSwipe = useCallback((dir, place) => {
    if (dir === 'right') onSave(place);
    else onSkip(place);
  }, [onSave, onSkip]);

  const progress = totalFiltered > 0 ? ((totalFiltered - cards.length) / totalFiltered) * 100 : 100;

  if (cards.length === 0) {
    return (
      <div className="swipe-screen">
        <EmptyState onViewSaved={onViewSaved} onViewSkipped={onViewSkipped} />
      </div>
    );
  }

  const visibleCards = cards.slice(0, 3);

  return (
    <div className="swipe-screen">
      {/* Progress */}
      <div className="swipe-progress-wrap">
        <div className="progress-bar swipe-progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="swipe-progress-text">
          {totalFiltered - cards.length} of {totalFiltered} places
        </span>
      </div>

      {/* Card stack */}
      <div className="swipe-stack-wrap">
        <div className="swipe-stack">
          {visibleCards.map((place, i) => (
            <PlaceCard
              key={place.id}
              place={place}
              isTop={i === 0}
              style={{
                zIndex: 10 - i,
                transform: `scale(${1 - i * 0.04}) translateY(${i * 12}px)`,
                pointerEvents: i === 0 ? 'auto' : 'none',
              }}
              onSwipe={(dir) => handleSwipe(dir, place)}
            />
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="swipe-actions">
        <motion.button
          className="swipe-btn swipe-btn--skip"
          onClick={async () => {
            try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch (e) {}
            if (cards[0]) onSkip(cards[0]);
          }}
          whileTap={{ scale: 0.9 }}
          id="skip-btn"
        >
          <X size={28} />
        </motion.button>

        <motion.button
          className="swipe-btn swipe-btn--info"
          onClick={() => {
            const btn = document.getElementById(`info-${cards[0]?.id}`);
            btn?.click();
          }}
          whileTap={{ scale: 0.92 }}
          id="info-main-btn"
        >
          <Info size={20} />
        </motion.button>

        <motion.button
          className="swipe-btn swipe-btn--save"
          onClick={async () => {
            try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch (e) {}
            if (cards[0]) onSave(cards[0]);
          }}
          whileTap={{ scale: 0.9 }}
          id="save-btn"
        >
          <Heart size={28} fill="white" />
        </motion.button>
      </div>
    </div>
  );
}
