'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

import { BellIcon } from './icons';
import { getMyNotifications, markNotificationsSeen, type NotificationItem } from '@/lib/notifications-api';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';

function formatDate(value: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function itemDetail(item: NotificationItem, locale: Locale, t: Dictionary['notifications']): string {
  switch (item.kind) {
    case 'contact_message':
      return `${item.name} — ${item.subject}`;
    case 'new_enrollment': {
      const courseTitle = locale === 'fr' ? item.courseTitleFr : item.courseTitleEn;
      return `${item.requesterName} — ${courseTitle}`;
    }
    case 'enrollment_status': {
      const courseTitle = locale === 'fr' ? item.courseTitleFr : item.courseTitleEn;
      return `${courseTitle} — ${t.statusLabels[item.status]}`;
    }
    case 'certificate':
      return locale === 'fr' ? item.courseTitleFr : item.courseTitleEn;
    default:
      return '';
  }
}

export default function NotificationBell({ locale, t }: { locale: Locale; t: Dictionary['notifications'] }) {
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    getMyNotifications()
      .then((data) => {
        setCount(data.count);
        setItems(data.items);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  const toggleOpen = () => {
    setOpen((wasOpen) => {
      const next = !wasOpen;
      if (next && count > 0) {
        markNotificationsSeen()
          .then(() => setCount(0))
          .catch(() => {});
      }
      return next;
    });
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={toggleOpen}
        aria-label={t.title}
        aria-expanded={open}
        className="relative grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-ink-muted transition-colors hover:bg-slate-50 hover:text-ink"
      >
        <BellIcon className="h-[18px] w-[18px]" />
        {count > 0 && (
          <span className="absolute -right-1.5 -top-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
          <p className="px-2 py-1.5 text-sm font-semibold text-ink">{t.title}</p>
          {status === 'loading' ? (
            <p className="px-2 py-4 text-center text-sm text-ink-muted">…</p>
          ) : status === 'error' ? (
            <p className="px-2 py-4 text-center text-sm text-ink-muted">{t.loadError}</p>
          ) : items.length === 0 ? (
            <p className="px-2 py-4 text-center text-sm text-ink-muted">{t.empty}</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {items.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/${locale}${item.href}`}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-2 py-2 text-sm hover:bg-slate-50"
                  >
                    <span className="block font-medium text-ink">{t.kindLabels[item.kind]}</span>
                    <span className="block truncate text-xs text-ink-muted">{itemDetail(item, locale, t)}</span>
                    <span className="mt-0.5 block text-[11px] text-slate-400">{formatDate(item.createdAt, locale)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
