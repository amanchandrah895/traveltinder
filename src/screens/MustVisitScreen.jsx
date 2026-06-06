import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, CheckCircle, Clock, Plus, X, Pencil,
  MapPin, Wallet, ExternalLink
} from 'lucide-react';
import { places as allPlaces } from '../data/places.js';

function googleSearch(name) {
  return `https://www.google.com/search?q=${encodeURIComponent(name + ' Bangalore')}&tbm=isch`;
}
import './MustVisitScreen.css';

function formatBudget(inr) {
  if (inr === 0) return 'Free';
  if (inr < 1000) return `₹${inr}`;
  return `₹${(inr / 1000).toFixed(inr % 1000 === 0 ? 0 : 1)}k`;
}

const CATEGORIES = [...new Set(allPlaces.map(p => p.type))];

export default function MustVisitScreen({ mustVisit, onToggleVisited, onAddManual, onRemove }) {
  const [showSheet, setShowSheet] = useState(false);
  const [form, setForm] = useState({ name: '', type: CATEGORIES[0], notes: '' });

  const visited = mustVisit.filter(p => p.visited).length;
  const remaining = mustVisit.filter(p => !p.visited).length;
  const total = mustVisit.length;

  const handleAdd = () => {
    if (!form.name.trim()) return;
    onAddManual({
      id: `manual-${Date.now()}`,
      name: form.name.trim(),
      type: form.type,
      known_for: form.notes || 'Custom place',
      distance_km: 0,
      commute: '',
      budget_inr: 0,
      best_time: '',
      couple_appeal: form.notes || '',
      image_url: `https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80`,
      isManual: true,
    });
    setForm({ name: '', type: CATEGORIES[0], notes: '' });
    setShowSheet(false);
  };

  return (
    <div className="screen must-screen">
      <div className="screen-header">
        <h1>The Plan</h1>
        <p style={{ marginTop: 4, fontSize: '0.88rem', fontStyle: 'italic', fontWeight: 300 }}>
          Places you absolutely cannot miss
        </p>
      </div>

      {/* Stats row */}
      {total > 0 && (
        <div className="must-stats">
          <div className="must-stat-card">
            <CheckCircle size={18} className="text-success" />
            <span className="must-stat-num">{visited}</span>
            <span className="must-stat-label">Visited</span>
          </div>
          <div className="must-stat-card">
            <Clock size={18} className="text-accent" />
            <span className="must-stat-num">{remaining}</span>
            <span className="must-stat-label">Remaining</span>
          </div>
          <div className="must-stat-card">
            <Star size={18} className="text-primary" />
            <span className="must-stat-num">{total}</span>
            <span className="must-stat-label">Total</span>
          </div>
        </div>
      )}

      {/* Progress bar */}
      {total > 0 && (
        <div className="must-progress-row">
          <div className="progress-bar" style={{ margin: '0 16px' }}>
            <div className="progress-fill" style={{ width: `${total ? (visited / total) * 100 : 0}%` }} />
          </div>
          <p style={{ padding: '6px 16px 0', fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'right' }}>
            {visited} of {total} visited
          </p>
        </div>
      )}

      {/* Cards */}
      {mustVisit.length === 0 ? (
        <div className="empty-state">
          <Star size={48} />
          <h3>No must-visits yet</h3>
          <p>Add places from your Saved list or tap the button below</p>
        </div>
      ) : (
        <div className="must-list">
          <AnimatePresence>
            {mustVisit.map(place => (
              <motion.div
                key={place.id}
                className={`must-card ${place.visited ? 'must-card--visited' : ''}`}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                {/* Image */}
                <div className="must-card-img">
                  <img src={place.image_url} alt={place.name} loading="lazy" />
                  {place.visited && <div className="must-visited-overlay" />}
                  {place.visited && (
                    <div className="must-visited-watermark">
                      <CheckCircle size={32} />
                    </div>
                  )}
                  {/* Status badge */}
                  <button
                    className={`must-status-badge ${place.visited ? 'must-status-badge--visited' : 'must-status-badge--pending'}`}
                    onClick={() => onToggleVisited(place.id)}
                    id={`toggle-visited-${place.id}`}
                  >
                    {place.visited ? (
                      <><CheckCircle size={13} /> Visited</>
                    ) : (
                      <><Clock size={13} /> Yet to Visit</>
                    )}
                  </button>
                  {/* Manual badge */}
                  {place.isManual && (
                    <div className="must-manual-badge">
                      <Pencil size={10} />
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="must-card-footer">
                  <div className="must-card-info">
                    <h3 className="must-card-name">{place.name}</h3>
                    <span className="must-card-type">{place.type}</span>
                    <div className="must-card-meta">
                      {place.distance_km > 0 && <span><MapPin size={11} /> {place.distance_km} km</span>}
                      <span><Wallet size={11} /> {formatBudget(place.budget_inr)}</span>
                    </div>
                    <a
                      href={googleSearch(place.name)}
                      target="_blank"
                      rel="noreferrer"
                      className="list-google-btn"
                      onClick={e => e.stopPropagation()}
                    >
                      <ExternalLink size={11} />
                      See photos
                    </a>
                  </div>
                  <button
                    className="must-remove-btn"
                    onClick={() => onRemove(place.id)}
                    id={`remove-must-${place.id}`}
                  >
                    <X size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* FAB */}
      <motion.button
        className="must-fab"
        onClick={() => setShowSheet(true)}
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.06 }}
        id="add-must-visit-fab"
      >
        <Plus size={22} />
      </motion.button>

      {/* Bottom sheet */}
      <AnimatePresence>
        {showSheet && (
          <>
            <motion.div
              className="sheet-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSheet(false)}
            />
            <motion.div
              className="add-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 300 }}
            >
              <div className="sheet-handle" />
              <h3 className="sheet-title">Add a Place</h3>

              <div className="sheet-form">
                <div className="sheet-field">
                  <label className="sheet-label">Place Name</label>
                  <input
                    className="input"
                    placeholder="e.g. Cubbon Park Picnic Spot"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    id="add-place-name"
                  />
                </div>
                <div className="sheet-field">
                  <label className="sheet-label">Type</label>
                  <select
                    className="input"
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    id="add-place-type"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="sheet-field">
                  <label className="sheet-label">Notes (optional)</label>
                  <input
                    className="input"
                    placeholder="What makes this special?"
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    id="add-place-notes"
                  />
                </div>

                <button
                  className="btn btn-primary w-full"
                  style={{ borderRadius: 'var(--radius-pill)', marginTop: 8 }}
                  onClick={handleAdd}
                  id="save-must-visit-btn"
                >
                  <Star size={16} />
                  Save to Must Visit
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
