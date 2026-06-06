import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UtensilsCrossed, Trees, Camera, Coffee, Car, Zap, Palette,
  Puzzle, Sparkles, Mountain, Landmark, Music, ArrowRight, Grid2X2
} from 'lucide-react';
import { places } from '../data/places.js';
import './CategoryScreen.css';

const TYPE_ICON_MAP = {
  'cafe': Coffee,
  'food': UtensilsCrossed,
  'restaurant': UtensilsCrossed,
  'pub': UtensilsCrossed,
  'heritage': Landmark,
  'nature': Trees,
  'attraction': Camera,
  'experience': Sparkles,
  'thrill': Zap,
  'luxury': Sparkles,
  'creative': Palette,
  'puzzle': Puzzle,
  'arcade': Zap,
  'kinetic': Zap,
  'trek': Mountain,
  'day trip': Car,
  'culture': Music,
  'wildlife': Trees,
  'birdwatching': Trees,
  'boating': Trees,
  'hangout': Coffee,
  'caving': Mountain,
  'adventure': Mountain,
  'shopping': Camera,
};

function getIconForType(type) {
  const lower = type.toLowerCase();
  for (const [key, Icon] of Object.entries(TYPE_ICON_MAP)) {
    if (lower.includes(key)) return Icon;
  }
  return Camera;
}

function getCategories(allPlaces) {
  const map = {};
  allPlaces.forEach(p => {
    const t = p.type;
    if (!map[t]) map[t] = 0;
    map[t]++;
  });
  return Object.entries(map).map(([type, count]) => ({ type, count, Icon: getIconForType(type) }));
}

export default function CategoryScreen({ onStart }) {
  const categories = useMemo(() => getCategories(places), []);
  const [selected, setSelected] = useState([]);

  const toggle = (type) => {
    setSelected(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const selectAll = () => setSelected([]);

  const handleStart = () => {
    onStart(selected.length === 0 ? [] : selected);
  };

  return (
    <div className="category-screen screen">
      <motion.div
        className="screen-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>What are we<br/>feeling today?</h1>
        <p style={{ marginTop: 8, fontSize: '0.9rem', fontStyle: 'italic', fontWeight: 300 }}>
          Pick one or explore everything
        </p>
      </motion.div>

      <motion.div
        className="category-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {/* Explore All card */}
        <motion.button
          className={`cat-card ${selected.length === 0 ? 'cat-card--active' : ''}`}
          onClick={selectAll}
          whileTap={{ scale: 0.96 }}
          id="cat-all"
        >
          <div className="cat-card-icon">
            <Grid2X2 size={24} />
          </div>
          <span className="cat-card-name">Explore All</span>
          <span className="cat-card-count">{places.length} places</span>
        </motion.button>

        {categories.map(({ type, count, Icon }, i) => {
          const isActive = selected.includes(type);
          return (
            <motion.button
              key={type}
              className={`cat-card ${isActive ? 'cat-card--active' : ''}`}
              onClick={() => toggle(type)}
              whileTap={{ scale: 0.96 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.04, duration: 0.4 }}
              id={`cat-${type.replace(/\W+/g, '-').toLowerCase()}`}
            >
              <div className="cat-card-icon">
                <Icon size={24} />
              </div>
              <span className="cat-card-name">{type}</span>
              <span className="cat-card-count">{count} {count === 1 ? 'place' : 'places'}</span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Sticky CTA */}
      <div className="category-cta">
        <AnimatePresence mode="wait">
          <motion.button
            key={selected.length}
            className={`btn btn-primary w-full category-start-btn ${selected.length === 0 ? '' : 'btn-has-selection'}`}
            onClick={handleStart}
            initial={{ opacity: 0.8, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            id="start-swiping-btn"
          >
            {selected.length === 0 ? 'Start Swiping — All Places' : `Start Swiping — ${selected.length} categor${selected.length > 1 ? 'ies' : 'y'}`}
            <ArrowRight size={18} />
          </motion.button>
        </AnimatePresence>
      </div>
    </div>
  );
}
