import React, { useState } from 'react';
import { Flag, Pause, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import type { GameTelemetry } from '../types/game';

interface DownhillHUDProps {
  telemetry: GameTelemetry;
  onTriggerNitro: () => void;
  onSteer: (amount: number) => void;
  onPause: () => void;
}

export const DownhillHUD: React.FC<DownhillHUDProps> = ({
  telemetry,
  onTriggerNitro,
  onSteer,
  onPause,
}) => {
  const [leftActive, setLeftActive] = useState(false);
  const [rightActive, setRightActive] = useState(false);

  const handleLeftDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    try {
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
    setLeftActive(true);
    onSteer(-1);
  };

  const handleLeftUp = (e: React.PointerEvent) => {
    e.stopPropagation();
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
    setLeftActive(false);
    if (rightActive) {
      onSteer(1);
    } else {
      onSteer(0);
    }
  };

  const handleRightDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    try {
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
    setRightActive(true);
    onSteer(1);
  };

  const handleRightUp = (e: React.PointerEvent) => {
    e.stopPropagation();
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
    setRightActive(false);
    if (leftActive) {
      onSteer(-1);
    } else {
      onSteer(0);
    }
  };
  const getRankSuffix = (r: number) => {
    if (r === 1) return 'st';
    if (r === 2) return 'nd';
    if (r === 3) return 'rd';
    return 'th';
  };

  const speedRatio = Math.min(1.0, telemetry.speed / 150);

  return (
    <div className="downhill-hud-overlay">
      {/* --- TOP BAR (Exact layout from user recording) --- */}
      <div className="hud-video-topbar">
        {/* Top-Left: Angled Speed Pill */}
        <div className="speed-angled-pill">
          <div className="speed-label-tiny">speed</div>
          <div className="speed-num-row">
            <span className="speed-big-val">{telemetry.speed}</span>
            <span className="speed-unit-text">km/h</span>
          </div>
        </div>

        {/* Top-Center: Angled Green/Teal Track Progress Bar */}
        <div className="level-progress-pill">
          <div className="level-tag-row">
            <span className="level-title-text">Level 1</span>
          </div>
          <div className="progress-slanted-track">
            <div
              className="progress-slanted-fill"
              style={{ width: `${telemetry.progressPercent}%` }}
            />
            <Flag size={15} className="finish-checkered-flag" />
          </div>
        </div>

        {/* Top-Right: Coins Pill & Pause Button */}
        <div className="hud-top-right-group">
          <div className="coins-video-pill">
            <span className="coin-icon-gold">🪙</span>
            <span className="coins-counter-text">+{telemetry.coinsCollected}</span>
          </div>
          <button className="hud-pause-circular-btn" onClick={onPause} title="Pause Game">
            <Pause size={17} />
          </button>
        </div>
      </div>

      {/* --- FLOATING 3D-STYLE RANK OVER SKATER (Exact match to "7th" in video!) --- */}
      <div className="floating-video-rank">
        <span className="floating-rank-digit">{telemetry.rank}</span>
        <span className="floating-rank-suffix-text">{getRankSuffix(telemetry.rank)}</span>
      </div>

      {/* --- NEAR MISS +10 COMBO POPUP (Exact match to video near miss!) --- */}
      {telemetry.comboMessage && (
        <div className="near-miss-comic-popup">
          <span className="near-miss-text">{telemetry.comboMessage}</span>
        </div>
      )}

      {/* --- DRIFT & AIRTIME POPUPS --- */}
      {telemetry.isDrifting && (
        <div className="drift-active-badge">
          <Zap size={16} />
          <span>DRIFT!</span>
        </div>
      )}
      {telemetry.isAirborne && (
        <div className="airtime-active-badge">
          <span>AIRTIME!</span>
        </div>
      )}

      {/* --- BOTTOM CONTROLS & BOOST --- */}
      <div className="hud-bottom-row">
        {/* Mobile / Touch Steering Buttons: LEFT & RIGHT */}
        <div className="touch-steering-cluster">
          <button
            type="button"
            className={`touch-steer-btn steer-left ${leftActive ? 'active' : ''}`}
            onPointerDown={handleLeftDown}
            onPointerUp={handleLeftUp}
            onPointerLeave={handleLeftUp}
            onPointerCancel={handleLeftUp}
            title="Steer Left"
            aria-label="Steer Left"
          >
            <ChevronLeft size={26} />
            <span className="steer-btn-text">LEFT</span>
          </button>
          <button
            type="button"
            className={`touch-steer-btn steer-right ${rightActive ? 'active' : ''}`}
            onPointerDown={handleRightDown}
            onPointerUp={handleRightUp}
            onPointerLeave={handleRightUp}
            onPointerCancel={handleRightUp}
            title="Steer Right"
            aria-label="Steer Right"
          >
            <span className="steer-btn-text">RIGHT</span>
            <ChevronRight size={26} />
          </button>
        </div>

        {/* Center Hint (Desktop/Touch) */}
        <div className="touch-steering-hint">
          <span>A / D or Tap Buttons</span>
        </div>

        {/* Nitro Boost Action Button */}
        <button
          type="button"
          className={`nitro-action-trigger ${telemetry.nitro >= 25 ? 'ready' : 'empty'} ${
            telemetry.isNitroActive ? 'ignited' : ''
          }`}
          onPointerDown={(e) => {
            e.stopPropagation();
            onTriggerNitro();
          }}
          onClick={(e) => {
            e.stopPropagation();
            onTriggerNitro();
          }}
          title="Boost Nitro [SPACE]"
          aria-label="Boost Nitro"
        >
          <div className="nitro-btn-inner">
            <span className="nitro-flame-icon">🔥</span>
            <span className="nitro-btn-text">NITRO</span>
          </div>
          <div
            className="nitro-refill-line"
            style={{ width: `${telemetry.nitro}%` }}
          />
        </button>
      </div>
    </div>
  );
};
