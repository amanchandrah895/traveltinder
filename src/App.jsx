import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Bookmark, RotateCcw, Star, Settings, X, ChevronLeft } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useLocalStorage } from './hooks/useLocalStorage.js';
import { places as allPlaces } from './data/places.js';
import WelcomeScreen from './screens/WelcomeScreen.jsx';
import CategoryScreen from './screens/CategoryScreen.jsx';
import SwipeScreen from './screens/SwipeScreen.jsx';
import SavedScreen from './screens/SavedScreen.jsx';
import SkippedScreen from './screens/SkippedScreen.jsx';
import MustVisitScreen from './screens/MustVisitScreen.jsx';
import './App.css';

// Screens
const SCREEN = {
  WELCOME: 'welcome',
  CATEGORY: 'category',
  APP: 'app',
};

const TAB = {
  DISCOVER: 'discover',
  SAVED: 'saved',
  SKIPPED: 'skipped',
  MUST: 'must',
};

export default function App() {
  // Navigation state
  const [screen, setScreen] = useState(SCREEN.WELCOME);
  const [activeTab, setActiveTab] = useState(TAB.DISCOVER);
  const [showSettings, setShowSettings] = useState(false);

  // Persistent state
  const [swipedIds, setSwipedIds] = useLocalStorage('bws-swiped', []);
  const [saved, setSaved] = useLocalStorage('bws-saved', []);
  const [skipped, setSkipped] = useLocalStorage('bws-skipped', []);
  const [mustVisit, setMustVisit] = useLocalStorage('bws-must', []);
  const [selectedCategories, setSelectedCategories] = useLocalStorage('bws-cats', []);

  // Reset hold state for settings
  const [holdTimer, setHoldTimer] = useState(null);
  const [holdProgress, setHoldProgress] = useState(0);

  // Cards queue (places not yet swiped in selected categories)
  const swipeQueue = useMemo(() => {
    let filtered = allPlaces;
    if (selectedCategories.length > 0) {
      filtered = allPlaces.filter(p => selectedCategories.includes(p.type));
    }
    return filtered.filter(p => !swipedIds.includes(p.id));
  }, [swipedIds, selectedCategories]);

  const totalFiltered = useMemo(() => {
    if (selectedCategories.length === 0) return allPlaces.length;
    return allPlaces.filter(p => selectedCategories.includes(p.type)).length;
  }, [selectedCategories]);

  // Handlers
  const handleBegin = useCallback(() => setScreen(SCREEN.CATEGORY), []);

  const handleCategoryStart = useCallback((cats) => {
    setSelectedCategories(cats);
    setScreen(SCREEN.APP);
    setActiveTab(TAB.DISCOVER);
  }, [setSelectedCategories]);

  const handleSave = useCallback((place) => {
    setSwipedIds(prev => [...prev, place.id]);
    setSaved(prev => {
      if (prev.find(p => p.id === place.id)) return prev;
      return [place, ...prev];
    });
  }, [setSwipedIds, setSaved]);

  const handleSkip = useCallback((place) => {
    setSwipedIds(prev => [...prev, place.id]);
    setSkipped(prev => {
      if (prev.find(p => p.id === place.id)) return prev;
      return [place, ...prev];
    });
  }, [setSwipedIds, setSkipped]);

  const handleRemoveSaved = useCallback((id) => {
    setSaved(prev => prev.filter(p => p.id !== id));
  }, [setSaved]);

  const handleRestoreSkipped = useCallback((place) => {
    setSkipped(prev => prev.filter(p => p.id !== place.id));
    setSaved(prev => {
      if (prev.find(p => p.id === place.id)) return prev;
      return [place, ...prev];
    });
  }, [setSkipped, setSaved]);

  const handleAddMustVisit = useCallback((place) => {
    setMustVisit(prev => {
      if (prev.find(p => p.id === place.id)) return prev;
      return [{ ...place, visited: false }, ...prev];
    });
  }, [setMustVisit]);

  const handleToggleVisited = useCallback((id) => {
    setMustVisit(prev =>
      prev.map(p => p.id === id ? { ...p, visited: !p.visited } : p)
    );
  }, [setMustVisit]);

  const handleRemoveMust = useCallback((id) => {
    setMustVisit(prev => prev.filter(p => p.id !== id));
  }, [setMustVisit]);

  const handleAddManual = useCallback((place) => {
    setMustVisit(prev => [{ ...place, visited: false }, ...prev]);
  }, [setMustVisit]);

  const handleReset = useCallback(() => {
    setSwipedIds([]);
    setSaved([]);
    setSkipped([]);
    setMustVisit([]);
    setSelectedCategories([]);
    setShowSettings(false);
    setScreen(SCREEN.WELCOME);
  }, [setSwipedIds, setSaved, setSkipped, setMustVisit, setSelectedCategories]);

  // Hold-to-reset logic
  const startHold = async () => {
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}
    let prog = 0;
    const interval = setInterval(async () => {
      prog += 5;
      setHoldProgress(prog);
      if (prog % 20 === 0) {
        try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}
      }
      if (prog >= 100) {
        clearInterval(interval);
        try { await Haptics.impact({ style: ImpactStyle.Heavy }); } catch (e) {}
        handleReset();
        setHoldProgress(0);
      }
    }, 100);
    setHoldTimer(interval);
  };
  const stopHold = () => {
    if (holdTimer) clearInterval(holdTimer);
    setHoldTimer(null);
    setHoldProgress(0);
  };

  // Tab navigation
  const tabs = [
    { id: TAB.DISCOVER, Icon: Compass, label: 'Discover' },
    { id: TAB.SAVED,    Icon: Bookmark, label: 'Saved', badge: saved.length },
    { id: TAB.SKIPPED,  Icon: RotateCcw, label: 'Skipped' },
    { id: TAB.MUST,     Icon: Star, label: 'Must Visit', badge: mustVisit.filter(p => !p.visited).length },
  ];

  if (screen === SCREEN.WELCOME) {
    return (
      <div className="app-shell">
        <WelcomeScreen onBegin={handleBegin} />
      </div>
    );
  }

  if (screen === SCREEN.CATEGORY) {
    return (
      <div className="app-shell">
        <CategoryScreen onStart={handleCategoryStart} />
      </div>
    );
  }

  // Main app
  return (
    <div className="app-shell">
      {/* Top bar for discover */}
      {activeTab === TAB.DISCOVER && (
        <div className="app-topbar">
          <div className="app-topbar-logo">
            <button
              className="app-settings-btn"
              style={{ width: '32px', height: '32px', marginRight: '4px', border: 'none', background: 'transparent' }}
              onClick={() => setScreen(SCREEN.CATEGORY)}
              id="back-to-categories-btn"
            >
              <ChevronLeft size={24} color="var(--primary)" />
            </button>
            <span className="app-topbar-title">Bangalore <span>with Stuti</span></span>
          </div>
          <button
            className="app-settings-btn"
            onClick={() => setShowSettings(true)}
            id="settings-btn"
          >
            <Settings size={18} />
          </button>
        </div>
      )}

      {/* Screen content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        >
          {activeTab === TAB.DISCOVER && (
            <SwipeScreen
              cards={swipeQueue}
              totalFiltered={totalFiltered}
              onSave={handleSave}
              onSkip={handleSkip}
              onViewSaved={() => setActiveTab(TAB.SAVED)}
              onViewSkipped={() => setActiveTab(TAB.SKIPPED)}
            />
          )}
          {activeTab === TAB.SAVED && (
            <SavedScreen
              saved={saved}
              onRemove={handleRemoveSaved}
              onAddMustVisit={handleAddMustVisit}
            />
          )}
          {activeTab === TAB.SKIPPED && (
            <SkippedScreen
              skipped={skipped}
              onRestore={handleRestoreSkipped}
            />
          )}
          {activeTab === TAB.MUST && (
            <MustVisitScreen
              mustVisit={mustVisit}
              onToggleVisited={handleToggleVisited}
              onAddManual={handleAddManual}
              onRemove={handleRemoveMust}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Bottom navigation */}
      <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
        {tabs.map(({ id, Icon, label, badge }) => (
          <button
            key={id}
            className={`nav-tab ${activeTab === id ? 'active' : ''}`}
            onClick={() => setActiveTab(id)}
            id={`nav-${id}`}
            aria-label={label}
          >
            <div style={{ position: 'relative', display: 'inline-flex' }}>
              <Icon size={20} />
              {badge > 0 && (
                <span className="nav-badge">{badge > 99 ? '99+' : badge}</span>
              )}
            </div>
            {label}
          </button>
        ))}
      </nav>

      {/* Settings sheet */}
      <AnimatePresence>
        {showSettings && (
          <>
            <motion.div
              className="sheet-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
            />
            <motion.div
              className="settings-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 300 }}
            >
              <div className="sheet-handle" />

              {/* Header */}
              <div className="settings-header">
                <h3 className="settings-title">Settings</h3>
                <button className="settings-close-btn" onClick={() => setShowSettings(false)} id="close-settings-btn">
                  <X size={16} />
                </button>
              </div>

              {/* Action cards stacked vertically */}
              <div className="settings-actions">

                {/* Reset card */}
                <div className="settings-card">
                  <div className="settings-card-text">
                    <p className="settings-card-label">Reset all data</p>
                    <p className="settings-card-desc">Hold the button for 2s to confirm</p>
                  </div>
                  <button
                    className="reset-btn"
                    onMouseDown={startHold}
                    onMouseUp={stopHold}
                    onMouseLeave={stopHold}
                    onTouchStart={startHold}
                    onTouchEnd={stopHold}
                    id="reset-data-btn"
                  >
                    <svg className="reset-progress" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2.5" />
                      <circle
                        cx="18" cy="18" r="15" fill="none"
                        stroke="var(--reject)" strokeWidth="2.5"
                        strokeDasharray={`${holdProgress * 0.942} 94.2`}
                        strokeLinecap="round"
                        transform="rotate(-90 18 18)"
                      />
                    </svg>
                    <RotateCcw size={15} />
                  </button>
                </div>

                {/* Change category card */}
                <div className="settings-card">
                  <div className="settings-card-text">
                    <p className="settings-card-label">Change categories</p>
                    <p className="settings-card-desc">Go back to pick what to explore</p>
                  </div>
                  <button
                    className="settings-action-btn"
                    onClick={() => { setShowSettings(false); setScreen(SCREEN.CATEGORY); }}
                    id="change-categories-btn"
                  >
                    <Compass size={14} />
                    Change
                  </button>
                </div>

              </div>

              <p className="settings-version">Made with love for Stuti ♡</p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
