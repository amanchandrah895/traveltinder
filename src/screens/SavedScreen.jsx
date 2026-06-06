import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Star, Trash2, MapPin, Wallet } from 'lucide-react';
import './ListScreen.css';

function formatBudget(inr) {
  if (inr === 0) return 'Free';
  if (inr < 1000) return `₹${inr}`;
  return `₹${(inr / 1000).toFixed(inr % 1000 === 0 ? 0 : 1)}k`;
}

function PlaceListItem({ place, onRemove, onAddMustVisit, showMustVisit = true, isManual }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  return (
    <motion.div
      className="list-item"
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`list-item-img ${!imgLoaded ? 'img-skeleton' : ''}`}>
        <img src={place.image_url} alt={place.name} onLoad={() => setImgLoaded(true)} loading="lazy" />
      </div>
      <div className="list-item-body">
        <div className="list-item-header">
          <h3 className="list-item-name">{place.name}</h3>
          {isManual && <span className="list-manual-badge">Custom</span>}
        </div>
        <span className="list-item-type">{place.type}</span>
        <div className="list-item-meta">
          <span><MapPin size={11} /> {place.distance_km} km</span>
          <span><Wallet size={11} /> {formatBudget(place.budget_inr)}</span>
        </div>
        <div className="list-item-actions">
          {showMustVisit && (
            <button
              className="list-action-btn list-action-btn--star"
              onClick={() => onAddMustVisit(place)}
              title="Add to Must Visit"
              id={`must-visit-${place.id}`}
            >
              <Star size={14} />
              Must Visit
            </button>
          )}
          <button
            className="list-action-btn list-action-btn--remove"
            onClick={() => onRemove(place.id)}
            title="Remove"
            id={`remove-${place.id}`}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

import { useState } from 'react';

export default function SavedScreen({ saved, onRemove, onAddMustVisit }) {
  return (
    <div className="screen list-screen">
      <div className="screen-header">
        <h1>Places you loved</h1>
      </div>

      {saved.length === 0 ? (
        <div className="empty-state">
          <Bookmark size={48} />
          <h3>Nothing saved yet</h3>
          <p>Start swiping to save places you'd love to visit</p>
        </div>
      ) : (
        <div className="list-container">
          <p className="list-count">{saved.length} saved {saved.length === 1 ? 'place' : 'places'}</p>
          <AnimatePresence>
            {saved.map(place => (
              <PlaceListItem
                key={place.id}
                place={place}
                onRemove={onRemove}
                onAddMustVisit={onAddMustVisit}
                showMustVisit={true}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
