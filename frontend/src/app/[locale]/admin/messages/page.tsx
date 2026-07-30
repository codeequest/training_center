'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { MailIcon, SpinnerIcon, TrashIcon } from '@/components/icons';
import ConfirmDialog from '@/components/confirm-dialog';
import { MotionDiv, MotionLi, MotionUl, fadeUpItem, revealParentProps } from '@/components/motion-primitives';
import { isLocale, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { ApiRequestError } from '@/lib/api';
import { deleteContactMessage, listContactMessages, markContactRead, type AdminContactMessage } from '@/lib/admin-api';
import { useAdmin } from '../admin-context';

function formatDate(value: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-US', { dateStyle: 'long', timeStyle: 'short' }).format(
    new Date(value)
  );
}

export default function AdminMessagesPage() {
  const params = useParams<{ locale: string }>();
  const locale: Locale = isLocale(params.locale) ? (params.locale as Locale) : 'fr';
  const t = getDictionary(locale);
  const { refreshBadges } = useAdmin();

  const [messages, setMessages] = useState<AdminContactMessage[] | null>(null);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminContactMessage | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function load() {
    listContactMessages(unreadOnly)
      .then(({ messages: fetched }) => setMessages(fetched))
      .catch((caught) => {
        setMessages([]);
        setError(caught instanceof ApiRequestError ? caught.message : t.admin.common.networkError);
      });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unreadOnly]);

  async function toggleRead(message: AdminContactMessage) {
    setError(null);
    try {
      const { message: updated } = await markContactRead(message.id, !message.isRead);
      setMessages((prev) => prev?.map((m) => (m.id === updated.id ? updated : m)) ?? prev);
      refreshBadges();
    } catch (caught) {
      setError(caught instanceof ApiRequestError ? caught.message : t.admin.common.genericError);
    }
  }

  function handleExpand(message: AdminContactMessage) {
    setExpandedId((prev) => (prev === message.id ? null : message.id));
    if (!message.isRead) toggleRead(message);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteError(null);
    try {
      await deleteContactMessage(deleteTarget.id);
      setMessages((prev) => prev?.filter((m) => m.id !== deleteTarget.id) ?? prev);
      setDeleteTarget(null);
      refreshBadges();
    } catch (caught) {
      setDeleteError(caught instanceof ApiRequestError ? caught.message : t.admin.common.genericError);
    }
  }

  return (
    <div>
      <MotionDiv initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{t.admin.messages.title}</h1>
        <p className="mt-2 text-[15px] text-ink-muted">{t.admin.messages.subtitle}</p>
      </MotionDiv>

      <label className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-ink">
        <input
          type="checkbox"
          checked={unreadOnly}
          onChange={(event) => setUnreadOnly(event.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-genai-600 focus:ring-genai-500"
        />
        {t.admin.messages.unreadOnlyToggle}
      </label>

      {error && <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

      {messages === null ? (
        <div className="mt-12 grid place-items-center py-16">
          <SpinnerIcon className="h-6 w-6 animate-spin text-genai-600" />
        </div>
      ) : messages.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white py-16 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-slate-100 text-slate-400">
            <MailIcon className="h-7 w-7" />
          </span>
          <p className="text-base font-semibold text-ink">{t.admin.messages.emptyTitle}</p>
          <p className="max-w-sm text-sm text-ink-muted">{t.admin.messages.emptyBody}</p>
        </div>
      ) : (
        <MotionUl {...revealParentProps} className="mt-8 space-y-3">
          {messages.map((message) => {
            const expanded = expandedId === message.id;
            return (
              <MotionLi
                key={message.id}
                variants={fadeUpItem}
                className={`rounded-2xl border bg-white p-5 shadow-sm ${
                  message.isRead ? 'border-slate-200' : 'border-genai-200 bg-genai-50/30'
                }`}
              >
                <button type="button" onClick={() => handleExpand(message)} className="flex w-full items-start justify-between gap-3 text-left">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-[15px] font-semibold text-ink">{message.subject}</p>
                      {!message.isRead && (
                        <span className="rounded-full bg-genai-600 px-2 py-0.5 text-[10px] font-bold text-white">
                          {t.admin.messages.unreadBadge}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-ink-muted">
                      {message.name} — {message.email}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-ink-muted">{formatDate(message.createdAt, locale)}</span>
                </button>

                {expanded && (
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    {message.phone && (
                      <p className="text-xs text-ink-muted">
                        {t.admin.messages.phoneLabel}: {message.phone}
                      </p>
                    )}
                    <p className="mt-2 whitespace-pre-wrap text-sm text-ink">{message.body}</p>
                    <div className="mt-4 flex items-center gap-2">
                      <button type="button" onClick={() => toggleRead(message)} className="btn-secondary text-xs">
                        {message.isRead ? t.admin.messages.markUnread : t.admin.messages.markRead}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(message)}
                        className="ml-auto rounded-lg p-2 text-ink-muted transition-colors hover:bg-red-50 hover:text-red-600"
                        aria-label={t.admin.common.delete}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                )}
              </MotionLi>
            );
          })}
        </MotionUl>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => {
          setDeleteTarget(null);
          setDeleteError(null);
        }}
        onConfirm={handleDelete}
        title={t.admin.common.confirmDeleteTitle}
        body={t.admin.messages.deleteConfirmBody}
        confirmLabel={t.admin.common.confirmDeleteLabel}
        cancelLabel={t.admin.common.confirmCancelLabel}
        error={deleteError}
      />
    </div>
  );
}
