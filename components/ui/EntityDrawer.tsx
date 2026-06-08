'use client';

import { useCallback, useEffect, useId, useRef, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { SafeImage } from '@/components/ui/SafeImage';

export type DriverEntityDetail = {
  kind: 'driver';
  seasonYear: number;
  driverName: string;
  driverCode: string;
  constructorName: string;
  position: string;
  points: string;
  driverIconSrc: string | null;
  nationality?: string;
  dateOfBirth?: string;
  wins: number;
  podiums: number;
};

export type TeamEntityDetail = {
  kind: 'team';
  seasonYear: number;
  constructorName: string;
  position: string;
  points: string;
  wins: string;
  teamIconSrc: string | null;
  teamColor: string;
  drivers: Array<{
    driverName: string;
    driverCode: string;
    position: string;
    points: string;
    driverIconSrc: string | null;
  }>;
};

export type EntityDetail = DriverEntityDetail | TeamEntityDetail;

interface EntityDrawerProps {
  entity: EntityDetail | null;
  onClose: () => void;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

function subscribeNoop() {
  return () => {};
}

function useIsClient(): boolean {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

function subscribeReducedMotion(onStoreChange: () => void) {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener('change', onStoreChange);
  return () => mq.removeEventListener('change', onStoreChange);
}

function getReducedMotionSnapshot(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    () => false,
  );
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true',
  );
}

export function EntityDrawer({ entity, onClose }: EntityDrawerProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const backdropRef = useRef<HTMLButtonElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const isClient = useIsClient();
  const reducedMotion = usePrefersReducedMotion();

  const animateOpen = useCallback(() => {
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!panel || !backdrop) return;

    if (reducedMotion) {
      panel.style.transform = 'translateX(0)';
      backdrop.style.opacity = '1';
      closeBtnRef.current?.focus();
      return;
    }

    panel.style.transform = 'translateX(100%)';
    backdrop.style.opacity = '0';
    requestAnimationFrame(() => {
      panel.style.transition = 'transform 300ms ease';
      backdrop.style.transition = 'opacity 300ms ease';
      panel.style.transform = 'translateX(0)';
      backdrop.style.opacity = '1';
      closeBtnRef.current?.focus();
    });
  }, [reducedMotion]);

  const handleClose = useCallback(() => {
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    const trigger = triggerRef.current;
    const finish = () => {
      onClose();
      trigger?.focus();
    };

    if (!panel || !backdrop || reducedMotion) {
      finish();
      return;
    }

    panel.style.transform = 'translateX(100%)';
    backdrop.style.opacity = '0';
    window.setTimeout(finish, 300);
  }, [onClose, reducedMotion]);

  useEffect(() => {
    if (!entity) return;

    triggerRef.current = document.activeElement as HTMLElement | null;
    const frame = requestAnimationFrame(animateOpen);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
        return;
      }

      if (e.key !== 'Tab' || !panelRef.current) return;

      const focusable = getFocusableElements(panelRef.current);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [entity, animateOpen, handleClose]);

  if (!isClient || !entity) return null;

  const ariaLabel =
    entity.kind === 'driver'
      ? `${entity.driverName} — ${entity.seasonYear} season`
      : `${entity.constructorName} — ${entity.seasonYear} season`;

  return createPortal(
    <div className="entity-drawer-root" style={{ zIndex: 150 }}>
      <button
        ref={backdropRef}
        type="button"
        className="entity-drawer-backdrop"
        aria-label="Close panel"
        onClick={handleClose}
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-label={ariaLabel}
        className="entity-drawer-panel"
      >
        <header
          className="flex items-start justify-between gap-4 border-b px-6 py-5"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="min-w-0 flex-1">
            <p
              className="font-mono text-[10px] uppercase tracking-[0.2em]"
              style={{ color: 'rgba(255,24,1,0.7)' }}
            >
              {entity.seasonYear} Season
            </p>
            {entity.kind === 'driver' ? (
              <div className="mt-2 flex items-center gap-4">
                {entity.driverIconSrc ? (
                  <SafeImage
                    src={entity.driverIconSrc}
                    alt=""
                    width={64}
                    height={64}
                    className="h-16 w-16 shrink-0 object-contain"
                  />
                ) : null}
                <div className="min-w-0">
                  <h2
                    id={titleId}
                    className="font-display text-[2rem] leading-[0.88] tracking-[0.04em]"
                    style={{ color: 'var(--paper)' }}
                  >
                    {entity.driverName}
                  </h2>
                  <p
                    className="mt-1 font-condensed text-xs uppercase tracking-[0.15em]"
                    style={{ color: 'var(--muted)' }}
                  >
                    {entity.constructorName}
                  </p>
                </div>
              </div>
            ) : (
              <div
                className="mt-2 flex items-center gap-4 border-l-[3px] pl-4"
                style={{ borderLeftColor: entity.teamColor }}
              >
                {entity.teamIconSrc ? (
                  <SafeImage
                    src={entity.teamIconSrc}
                    alt=""
                    width={56}
                    height={56}
                    className="h-14 w-14 shrink-0 object-contain"
                  />
                ) : null}
                <h2
                  id={titleId}
                  className="font-display text-[2rem] leading-[0.88] tracking-[0.04em]"
                  style={{ color: 'var(--paper)' }}
                >
                  {entity.constructorName}
                </h2>
              </div>
            )}
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={handleClose}
            className="shrink-0 border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.15em] transition-colors"
            style={{
              color: 'var(--muted)',
              borderColor: 'var(--border)',
              backgroundColor: 'var(--surface)',
            }}
          >
            Close
          </button>
        </header>

        <div className="overflow-y-auto px-6 py-5" style={{ maxHeight: 'calc(100dvh - 180px)' }}>
          {entity.kind === 'driver' ? (
            <>
              {(entity.nationality || entity.dateOfBirth) && (
                <dl className="mb-6 grid grid-cols-2 gap-4">
                  {entity.nationality ? (
                    <div>
                      <dt
                        className="font-condensed text-[10px] uppercase tracking-[0.15em]"
                        style={{ color: 'var(--muted)' }}
                      >
                        Nationality
                      </dt>
                      <dd className="mt-1 font-mono text-sm" style={{ color: 'var(--paper)' }}>
                        {entity.nationality}
                      </dd>
                    </div>
                  ) : null}
                  {entity.dateOfBirth ? (
                    <div>
                      <dt
                        className="font-condensed text-[10px] uppercase tracking-[0.15em]"
                        style={{ color: 'var(--muted)' }}
                      >
                        Born
                      </dt>
                      <dd className="mt-1 font-mono text-sm" style={{ color: 'var(--paper)' }}>
                        {entity.dateOfBirth}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              )}

              <h3
                className="mb-3 font-condensed text-xs uppercase tracking-[0.2em]"
                style={{ color: 'var(--muted)' }}
              >
                Season Stats
              </h3>
              <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCell label="Position" value={`P${entity.position}`} accent={entity.position === '1'} />
                <StatCell label="Points" value={entity.points} />
                <StatCell label="Wins" value={String(entity.wins)} />
                <StatCell label="Podiums" value={String(entity.podiums)} />
              </dl>
            </>
          ) : (
            <>
              <h3
                className="mb-3 font-condensed text-xs uppercase tracking-[0.2em]"
                style={{ color: 'var(--muted)' }}
              >
                Season Stats
              </h3>
              <dl className="mb-6 grid grid-cols-3 gap-3">
                <StatCell label="Position" value={`P${entity.position}`} accent={entity.position === '1'} />
                <StatCell label="Points" value={entity.points} />
                <StatCell label="Wins" value={entity.wins} />
              </dl>

              {entity.drivers.length > 0 ? (
                <>
                  <h3
                    className="mb-3 font-condensed text-xs uppercase tracking-[0.2em]"
                    style={{ color: 'var(--muted)' }}
                  >
                    Drivers
                  </h3>
                  <ul className="space-y-2">
                    {entity.drivers.map((d) => (
                      <li
                        key={d.driverName}
                        className="flex items-center gap-3 border border-border px-3 py-3"
                        style={{ borderLeft: `3px solid ${entity.teamColor}` }}
                      >
                        <span
                          className="w-6 shrink-0 font-mono text-xs"
                          style={{ color: 'var(--muted)' }}
                        >
                          {d.position}
                        </span>
                        {d.driverIconSrc ? (
                          <SafeImage
                            src={d.driverIconSrc}
                            alt=""
                            width={28}
                            height={28}
                            className="h-7 w-7 shrink-0 object-contain"
                          />
                        ) : null}
                        <span
                          className="min-w-0 flex-1 truncate text-sm"
                          style={{ color: 'var(--paper)' }}
                        >
                          {d.driverName}
                        </span>
                        <span className="shrink-0 font-mono text-xs" style={{ color: 'var(--paper)' }}>
                          {d.points}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </>
          )}
        </div>
      </aside>
    </div>,
    document.body,
  );
}

function StatCell({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className="border border-border px-3 py-3"
      style={{ backgroundColor: 'var(--surface)' }}
    >
      <dt
        className="font-condensed text-[10px] uppercase tracking-[0.15em]"
        style={{ color: 'var(--muted)' }}
      >
        {label}
      </dt>
      <dd
        className="mt-1 font-mono text-lg tracking-[0.05em]"
        style={{ color: accent ? 'var(--accent)' : 'var(--paper)' }}
      >
        {value}
      </dd>
    </div>
  );
}
