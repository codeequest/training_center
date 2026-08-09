'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';

import { AlertIcon, CheckCircleIcon, SearchIcon, SendIcon, SpinnerIcon } from '@/components/icons';
import { MotionDiv } from '@/components/motion-primitives';
import { isLocale, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { ApiRequestError } from '@/lib/api';
import { listAdminUsers, sendBulkEmail, type AdminUser } from '@/lib/admin-api';

type RecipientMode = 'group' | 'individual';
type GroupChoice = 'ALL' | 'STUDENT' | 'TEACHER';

export default function AdminEmailsPage() {
  const params = useParams<{ locale: string }>();
  const locale: Locale = isLocale(params.locale) ? (params.locale as Locale) : 'fr';
  const t = getDictionary(locale);

  const [mode, setMode] = useState<RecipientMode>('group');
  const [group, setGroup] = useState<GroupChoice>('ALL');
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ subject?: string; body?: string; recipients?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ message: string; ok: boolean } | null>(null);

  useEffect(() => {
    if (mode === 'individual' && users === null) {
      listAdminUsers({})
        .then(({ users: fetched }) => setUsers(fetched.filter((u) => u.isActive)))
        .catch(() => setUsers([]));
    }
  }, [mode, users]);

  function toggleUser(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const filteredUsers = (users ?? []).filter((u) => {
    if (!search.trim()) return true;
    const needle = search.trim().toLowerCase();
    return (
      u.firstName.toLowerCase().includes(needle) ||
      u.lastName.toLowerCase().includes(needle) ||
      u.email.toLowerCase().includes(needle)
    );
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);

    const nextErrors: typeof fieldErrors = {};
    if (subject.trim().length < 3) nextErrors.subject = t.admin.emails.subjectRequired;
    if (!body.trim()) nextErrors.body = t.admin.emails.bodyRequired;
    if (mode === 'individual' && selectedIds.size === 0) nextErrors.recipients = t.admin.emails.recipientsRequired;
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const { message, simulated, failedCount } = await sendBulkEmail({
        subject: subject.trim(),
        body: body.trim(),
        ...(mode === 'group' ? { role: group } : { userIds: Array.from(selectedIds) }),
      });
      const ok = !simulated && failedCount === 0;
      setResult({ message, ok });
      // Sur échec, on conserve la saisie pour que l'administrateur puisse réessayer.
      if (ok) {
        setSubject('');
        setBody('');
        setSelectedIds(new Set());
      }
    } catch (caught) {
      setError(caught instanceof ApiRequestError ? caught.message : t.admin.common.networkError);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <MotionDiv initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{t.admin.emails.title}</h1>
        <p className="mt-2 text-[15px] text-ink-muted">{t.admin.emails.subtitle}</p>
      </MotionDiv>

      {result && (
        <div
          className={`mt-6 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
            result.ok
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-amber-200 bg-amber-50 text-amber-800'
          }`}
        >
          {result.ok ? (
            <CheckCircleIcon className="h-5 w-5 shrink-0" />
          ) : (
            <AlertIcon className="h-5 w-5 shrink-0" />
          )}
          <span>{result.message}</span>
        </div>
      )}
      {error && <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

      <form onSubmit={handleSubmit} className="mt-8 max-w-2xl space-y-6" noValidate>
        <div>
          <label className="block text-sm font-medium text-ink">{t.admin.emails.recipientsLabel}</label>
          <div className="mt-2 inline-flex rounded-full bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setMode('group')}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                mode === 'group' ? 'bg-white text-ink shadow-sm' : 'text-ink-muted'
              }`}
            >
              {t.admin.emails.recipientModeGroup}
            </button>
            <button
              type="button"
              onClick={() => setMode('individual')}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                mode === 'individual' ? 'bg-white text-ink shadow-sm' : 'text-ink-muted'
              }`}
            >
              {t.admin.emails.recipientModeIndividual}
            </button>
          </div>

          {mode === 'group' ? (
            <select value={group} onChange={(event) => setGroup(event.target.value as GroupChoice)} className="field-input mt-3">
              <option value="ALL">{t.admin.emails.groupAll}</option>
              <option value="STUDENT">{t.admin.emails.groupStudents}</option>
              <option value="TEACHER">{t.admin.emails.groupTeachers}</option>
            </select>
          ) : (
            <div className="mt-3">
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t.admin.emails.searchPlaceholder}
                  className="field-input pl-9"
                />
              </div>

              <p className="mt-2 text-xs text-ink-muted">
                {selectedIds.size} {t.admin.emails.selectedCount}
              </p>

              <div className="mt-2 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white">
                {users === null ? (
                  <div className="grid place-items-center py-10">
                    <SpinnerIcon className="h-5 w-5 animate-spin text-genai-600" />
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-ink-muted">{t.admin.common.noResults}</p>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {filteredUsers.map((u) => (
                      <li key={u.id}>
                        <label className="flex cursor-pointer items-center gap-3 px-4 py-2.5 hover:bg-slate-50">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(u.id)}
                            onChange={() => toggleUser(u.id)}
                            className="h-4 w-4 rounded border-slate-300 text-genai-600 focus:ring-genai-500"
                          />
                          <span className="flex-1 text-sm">
                            <span className="font-medium text-ink">
                              {u.firstName} {u.lastName}
                            </span>
                            <span className="ml-2 text-ink-muted">{u.email}</span>
                          </span>
                          <span className="shrink-0 rounded-full bg-genai-50 px-2 py-0.5 text-[11px] font-semibold text-genai-700">
                            {t.admin.users.roleLabels[u.role]}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {fieldErrors.recipients && <p className="mt-1.5 text-xs text-red-600">{fieldErrors.recipients}</p>}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-ink">{t.admin.emails.subjectLabel}</label>
          <input
            value={subject}
            onChange={(event) => {
              setSubject(event.target.value);
              if (fieldErrors.subject) setFieldErrors((prev) => ({ ...prev, subject: undefined }));
            }}
            placeholder={t.admin.emails.subjectPlaceholder}
            className={`field-input ${fieldErrors.subject ? 'field-input-error' : ''}`}
          />
          {fieldErrors.subject && <p className="mt-1.5 text-xs text-red-600">{fieldErrors.subject}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-ink">{t.admin.emails.bodyLabel}</label>
          <textarea
            value={body}
            onChange={(event) => {
              setBody(event.target.value);
              if (fieldErrors.body) setFieldErrors((prev) => ({ ...prev, body: undefined }));
            }}
            placeholder={t.admin.emails.bodyPlaceholder}
            rows={8}
            className={`field-input ${fieldErrors.body ? 'field-input-error' : ''}`}
          />
          {fieldErrors.body && <p className="mt-1.5 text-xs text-red-600">{fieldErrors.body}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? <SpinnerIcon className="h-4 w-4 animate-spin" /> : <SendIcon className="h-4 w-4" />}
          {isSubmitting ? t.admin.emails.sending : t.admin.emails.send}
        </button>
      </form>
    </div>
  );
}
