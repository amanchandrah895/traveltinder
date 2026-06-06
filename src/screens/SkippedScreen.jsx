import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, MapPin, Wallet } from 'lucide-react';
import './ListScreen.css';

function formatBudget(inr) {
  if (inr === 0) return 'Free';
  if (inr < 1000) return `₹${inr}`;
  return `₹${(inr / 1000).toFixed(inr % 1000 === 0 ? 0 : 1)}k`;
}

export default function SkippedScreen({ skipped, onRestore }) {
  return (
    <div className="screen list-screen">
      <div className="screen-header">
        <h1>Changed your mind?</h1>
      </div>

      {skipped.length === 0 ? (
        <div className="empty-state">
          <RotateCcw size={48} />
          <h3>Nothing skipped yet</h3>
          <p>Places you pass on will appear here</p>
        </div>
      ) : (
        <div className="list-container">
          <p className="list-count">{skipped.length} skipped {skipped.length === 1 ? 'place' : 'places'}</p>
          <AnimatePresence>
            {skipped.map(place => (
              <motion.div
                key={place.id}
                className="list-item"
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="list-item-img">
                  <img src={place.image_url} alt={place.name} loading="lazy" />
                </div>
                <div className="list-item-body">
                  <h3 className="list-item-name">{place.name}</h3>
                  <span className="list-item-type">{place.type}</span>
                  <div className="list-item-meta">
                    <span><MapPin size={11} /> {place.distance_km} km</span>
                    <span><Wallet size={11} /> {formatBudget(place.budget_inr)}</span>
                  </div>
                  <div className="list-item-actions">
                    <button
                      className="list-action-btn list-action-btn--restore"
                      onClick={() => onRestore(place)}
                      id={`restore-${place.id}`}
                    >
                      <RotateCcw size={14} />
                      Move to Saved
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
