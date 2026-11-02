'use client';
import { useEffect, useRef } from 'react';
import { THRESHOLDS } from '@/lib/assistedContact/config';

// Pure accounting core, exported for tests. Times are performance.now() values (monotonic, document-local).
// Only intervals that are visible/focused AND within 60s of the last trusted interaction are credited.
export class ActiveClock {
  private lastInteraction: number | null = null;
  private intervalStart: number | null = null;
  private lastTick: number | null = null;
  private pending = 0;
  private active = false; // Page visible and focused.

  constructor(private windowMs: number = THRESHOLDS.interactionWindowMs, private maxGapMs: number = THRESHOLDS.maxTickGapMs) {}

  private flush(now: number) {
    if (this.intervalStart === null || this.lastInteraction === null) return;
    const end = Math.min(now, this.lastInteraction + this.windowMs);
    if (end > this.intervalStart) this.pending += end - this.intervalStart;
    this.intervalStart = now < this.lastInteraction + this.windowMs ? now : null;
  }

  // Flush before moving the interaction time, so an idle gap is never credited retroactively.
  interaction(now: number) {
    this.flush(now);
    this.lastInteraction = now;
    if (this.active) this.intervalStart = now;
  }

  setActive(active: boolean, now: number) {
    if (active === this.active) return;
    this.flush(now);
    this.active = active;
    // Pause on hide/blur; on restore wait for fresh activity rather than resuming from the old interaction.
    this.intervalStart = null;
    if (!active) this.lastInteraction = null;
    this.lastTick = now;
  }

  tick(now: number) {
    if (this.lastTick !== null && now - this.lastTick > this.maxGapMs) {
      // Device sleep or a frozen tab: credit up to the previous tick, discard the gap, require new activity.
      this.flush(this.lastTick);
      this.intervalStart = null;
      this.lastInteraction = null;
    } else {
      this.flush(now);
    }
    this.lastTick = now;
  }

  take(): number {
    const ms = this.pending;
    this.pending = 0;
    return ms;
  }
}

const interactionEvents = ['pointerdown', 'keydown', 'touchstart', 'scroll', 'wheel'] as const;

// Single owner of estimated active browsing. `onTick` runs about once a second with the newly
// credited milliseconds; consumers batch them. Mutable timing lives in refs, not React state.
export function useEstimatedActiveBrowsing(enabled: boolean, onTick: (creditedMs: number, now: number) => void) {
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  useEffect(() => {
    if (!enabled) return;
    const clock = new ActiveClock();
    const isActive = () => document.visibilityState === 'visible' && document.hasFocus();
    clock.setActive(isActive(), performance.now());
    const interaction = (event: Event) => { if (event.isTrusted) clock.interaction(performance.now()); };
    const state = () => clock.setActive(isActive(), performance.now());
    const hide = () => clock.setActive(false, performance.now());
    for (const name of interactionEvents) window.addEventListener(name, interaction, { passive: true, capture: true });
    document.addEventListener('visibilitychange', state);
    window.addEventListener('focus', state);
    window.addEventListener('blur', hide);
    window.addEventListener('pagehide', hide);
    window.addEventListener('pageshow', state);
    const timer = window.setInterval(() => {
      const now = performance.now();
      clock.tick(now);
      onTickRef.current(clock.take(), now);
    }, 1000);
    return () => {
      window.clearInterval(timer);
      clock.setActive(false, performance.now());
      const remaining = clock.take();
      if (remaining) onTickRef.current(remaining, performance.now());
      for (const name of interactionEvents) window.removeEventListener(name, interaction, { capture: true });
      document.removeEventListener('visibilitychange', state);
      window.removeEventListener('focus', state);
      window.removeEventListener('blur', hide);
      window.removeEventListener('pagehide', hide);
      window.removeEventListener('pageshow', state);
    };
  }, [enabled]);
}
