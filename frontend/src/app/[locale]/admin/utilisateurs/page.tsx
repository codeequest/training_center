'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';

import { CopyIcon, PencilIcon, PlusIcon, SearchIcon, SpinnerIcon, TrashIcon, UsersIcon } from '@/components/icons';
import ConfirmDialog from '@/components/confirm-dialog';
import Modal from '@/components/modal';
import { MotionLi, MotionUl, fadeUpItem, revealParentProps, MotionDiv } from '@/components/motion-primitives';
import { locales, isLocale, type Locale } from '@/i18n/config';
import { getDictionary, type Dictionary } from '@/i18n/dictionaries';
import { ApiRequestError } from '@/lib/api';
import {
  createUser,
  deleteUser,
  listAdminUsers,
  resetUserPassword,
  updateUser,
  type AdminUser,
  type CreateUserInput,
  type Role,
  type UpdateUserInput,
} from '@/lib/admin-api';

const ROLES: Role[] = ['STUDENT', 'TEACHER', 'ADMIN'];

export default function AdminUsersPage() {
  const params = useParams<{ locale: string }>();
  const locale: Locale = isLocale(params.locale) ? (params.locale as Locale) : 'fr';
  const t = getDictionary(locale);

  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [roleFilter, setRoleFilter] = useState<Role | ''>('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [resetTarget, setResetTarget] = useState<AdminUser | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<{ email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  function load() {
    setUsers(null);
    listAdminUsers({ role: roleFilter || undefined, search: search || undefined })
      .then(({ users: fetched }) => setUsers(fetched))
      .catch((caught) => {
        setUsers([]);
        setError(caught instanceof ApiRequestError ? caught.message : t.admin.common.networkError);
      });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter]);

  function handleCreated(user: AdminUser, temporaryPassword?: string) {
    // POST /admin/users ne renvoie pas `_count` (seule la liste l'inclut) : on recharge
    // la liste plutôt que d'insérer un objet partiel qui ferait planter le rendu.
    load();
    setCreateOpen(false);
    if (temporaryPassword) setTempPassword({ email: user.email, password: temporaryPassword });
  }

  function handleUpdated() {
    load();
    setEditTarget(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteError(null);
    try {
      await deleteUser(deleteTarget.id);
      setUsers((prev) => prev?.filter((u) => u.id !== deleteTarget.id) ?? prev);
      setDeleteTarget(null);
    } catch (caught) {
      setDeleteError(caught instanceof ApiRequestError ? caught.message : t.admin.common.genericError);
    }
  }

  async function handleReset() {
    if (!resetTarget) return;
    setResetError(null);
    try {
      const { temporaryPassword } = await resetUserPassword(resetTarget.id);
      setTempPassword({ email: resetTarget.email, password: temporaryPassword });
      setResetTarget(null);
    } catch (caught) {
      setResetError(caught instanceof ApiRequestError ? caught.message : t.admin.common.genericError);
    }
  }

  function copyPassword() {
    if (!tempPassword) return;
    navigator.clipboard?.writeText(tempPassword.password).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div>
      <MotionDiv
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{t.admin.users.title}</h1>
          <p className="mt-2 text-[15px] text-ink-muted">{t.admin.users.subtitle}</p>
        </div>
        <button type="button" onClick={() => setCreateOpen(true)} className="btn-primary">
          <PlusIcon />
          {t.admin.users.createCta}
        </button>
      </MotionDiv>

      <div className="mt-8 flex flex-wrap gap-3">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            load();
          }}
          className="relative flex-1 min-w-[220px]"
        >
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t.admin.users.searchPlaceholder}
            className="field-input pl-9"
          />
        </form>
        <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value as Role | '')} className="field-input mt-0 w-auto">
          <option value="">{t.admin.users.roleFilterAll}</option>
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {t.admin.users.roleLabels[role]}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

      {users === null ? (
        <div className="mt-12 grid place-items-center py-16">
          <SpinnerIcon className="h-6 w-6 animate-spin text-genai-600" />
        </div>
      ) : users.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white py-16 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-slate-100 text-slate-400">
            <UsersIcon className="h-7 w-7" />
          </span>
          <p className="text-base font-semibold text-ink">{t.admin.users.emptyTitle}</p>
          <p className="max-w-sm text-sm text-ink-muted">{t.admin.users.emptyBody}</p>
        </div>
      ) : (
        <MotionUl {...revealParentProps} className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <MotionLi
              key={user.id}
              variants={fadeUpItem}
              className={`rounded-2xl border bg-white p-5 shadow-sm ${
                user.isActive ? 'border-slate-200' : 'border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[15px] font-semibold text-ink">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-sm text-ink-muted">{user.email}</p>
                </div>
                <span className="shrink-0 rounded-full bg-genai-50 px-2.5 py-1 text-[11px] font-semibold text-genai-700">
                  {t.admin.users.roleLabels[user.role]}
                </span>
              </div>

              <p className="mt-3 text-xs text-ink-muted">
                {user.isActive ? t.admin.common.active : t.admin.common.inactive}
                {user.role === 'STUDENT' && ` · ${user._count?.enrollments ?? 0} ${t.admin.users.enrollmentsCount}`}
                {user.role === 'TEACHER' && ` · ${user._count?.taughtSessions ?? 0} ${t.admin.users.sessionsCount}`}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                <button type="button" onClick={() => setEditTarget(user)} className="btn-secondary text-xs">
                  <PencilIcon className="h-3.5 w-3.5" />
                  {t.admin.common.edit}
                </button>
                <button type="button" onClick={() => setResetTarget(user)} className="btn-secondary text-xs">
                  {t.admin.users.resetPassword}
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(user)}
                  className="btn-icon ml-auto hover:bg-red-50 hover:text-red-600"
                  aria-label={t.admin.common.delete}
                >
                  <TrashIcon />
                </button>
              </div>
            </MotionLi>
          ))}
        </MotionUl>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title={t.admin.users.createTitle}>
        <UserForm t={t} onCreated={handleCreated} />
      </Modal>

      <Modal open={Boolean(editTarget)} onClose={() => setEditTarget(null)} title={t.admin.users.editTitle}>
        {editTarget && <UserForm t={t} existing={editTarget} onUpdated={handleUpdated} />}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => {
          setDeleteTarget(null);
          setDeleteError(null);
        }}
        onConfirm={handleDelete}
        title={t.admin.common.confirmDeleteTitle}
        body={t.admin.users.deleteConfirmBody}
        confirmLabel={t.admin.common.confirmDeleteLabel}
        cancelLabel={t.admin.common.confirmCancelLabel}
        error={deleteError}
      />

      <ConfirmDialog
        open={Boolean(resetTarget)}
        onClose={() => {
          setResetTarget(null);
          setResetError(null);
        }}
        onConfirm={handleReset}
        title={t.admin.users.resetPassword}
        body={t.admin.users.resetPasswordConfirmBody}
        confirmLabel={t.admin.users.resetPasswordConfirmLabel}
        cancelLabel={t.admin.common.confirmCancelLabel}
        error={resetError}
      />

      <Modal open={Boolean(tempPassword)} onClose={() => setTempPassword(null)} title={t.admin.users.tempPasswordTitle}>
        {tempPassword && (
          <div>
            <p className="text-sm text-ink-muted">{t.admin.users.tempPasswordBody}</p>
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-ink-muted">{tempPassword.email}</p>
              <div className="mt-1 flex items-center justify-between gap-3">
                <code className="text-lg font-semibold tracking-wide text-ink">{tempPassword.password}</code>
                <button type="button" onClick={copyPassword} className="btn-secondary text-xs">
                  <CopyIcon />
                  {copied ? t.admin.common.copied : t.admin.common.copy}
                </button>
              </div>
            </div>
            <button type="button" onClick={() => setTempPassword(null)} className="btn-primary mt-5 w-full">
              {t.admin.common.close}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}

function UserForm({
  t,
  existing,
  onCreated,
  onUpdated,
}: {
  t: Dictionary;
  existing?: AdminUser;
  onCreated?: (user: AdminUser, temporaryPassword?: string) => void;
  onUpdated?: () => void;
}) {
  const [values, setValues] = useState({
    email: existing?.email ?? '',
    firstName: existing?.firstName ?? '',
    lastName: existing?.lastName ?? '',
    phone: existing?.phone ?? '',
    locale: existing?.locale ?? 'fr',
    role: existing?.role ?? ('STUDENT' as Role),
    password: '',
    isActive: existing?.isActive ?? true,
  });
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; firstName?: string; lastName?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const nextErrors: typeof fieldErrors = {};
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!existing) {
      if (!values.email.trim()) nextErrors.email = t.admin.users.emailRequired;
      else if (!emailRe.test(values.email)) nextErrors.email = t.admin.users.emailInvalid;
    }
    if (values.firstName.trim().length < 2) nextErrors.firstName = t.admin.users.firstNameRequired;
    if (values.lastName.trim().length < 2) nextErrors.lastName = t.admin.users.lastNameRequired;
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      if (existing) {
        const payload: UpdateUserInput = {
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone || null,
          locale: values.locale as 'fr' | 'en',
          role: values.role,
          isActive: values.isActive,
        };
        await updateUser(existing.id, payload);
        onUpdated?.();
      } else {
        const payload: CreateUserInput = {
          email: values.email,
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone || null,
          locale: values.locale as 'fr' | 'en',
          role: values.role,
          password: values.password || undefined,
        };
        const { user, temporaryPassword } = await createUser(payload);
        onCreated?.(user, temporaryPassword);
      }
    } catch (caught) {
      setError(caught instanceof ApiRequestError ? caught.message : t.admin.common.networkError);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

      {!existing && (
        <div>
          <label className="block text-sm font-medium text-ink">{t.admin.users.emailLabel}</label>
          <input
            type="email"
            value={values.email}
            onChange={(event) => setValues((prev) => ({ ...prev, email: event.target.value }))}
            className={`field-input ${fieldErrors.email ? 'field-input-error' : ''}`}
          />
          {fieldErrors.email && <p className="mt-1.5 text-xs text-red-600">{fieldErrors.email}</p>}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-ink">{t.admin.users.firstNameLabel}</label>
          <input
            value={values.firstName}
            onChange={(event) => setValues((prev) => ({ ...prev, firstName: event.target.value }))}
            className={`field-input ${fieldErrors.firstName ? 'field-input-error' : ''}`}
          />
          {fieldErrors.firstName && <p className="mt-1.5 text-xs text-red-600">{fieldErrors.firstName}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-ink">{t.admin.users.lastNameLabel}</label>
          <input
            value={values.lastName}
            onChange={(event) => setValues((prev) => ({ ...prev, lastName: event.target.value }))}
            className={`field-input ${fieldErrors.lastName ? 'field-input-error' : ''}`}
          />
          {fieldErrors.lastName && <p className="mt-1.5 text-xs text-red-600">{fieldErrors.lastName}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-ink">{t.admin.users.phoneLabel}</label>
          <input
            value={values.phone}
            onChange={(event) => setValues((prev) => ({ ...prev, phone: event.target.value }))}
            className="field-input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink">{t.admin.users.roleLabel}</label>
          <select
            value={values.role}
            onChange={(event) => setValues((prev) => ({ ...prev, role: event.target.value as Role }))}
            className="field-input"
          >
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {t.admin.users.roleLabels[role]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink">{t.admin.users.localeLabel}</label>
        <select
          value={values.locale}
          onChange={(event) => setValues((prev) => ({ ...prev, locale: event.target.value as 'fr' | 'en' }))}
          className="field-input"
        >
          {locales.map((code) => (
            <option key={code} value={code}>
              {code === 'fr' ? 'Français' : 'English'}
            </option>
          ))}
        </select>
      </div>

      {!existing && (
        <div>
          <label className="block text-sm font-medium text-ink">{t.admin.users.passwordLabel}</label>
          <input
            type="text"
            value={values.password}
            onChange={(event) => setValues((prev) => ({ ...prev, password: event.target.value }))}
            className="field-input"
          />
          <p className="mt-1.5 text-xs text-ink-muted">{t.admin.users.passwordHint}</p>
        </div>
      )}

      {existing && (
        <label className="flex items-center gap-2 text-sm font-medium text-ink">
          <input
            type="checkbox"
            checked={values.isActive}
            onChange={(event) => setValues((prev) => ({ ...prev, isActive: event.target.checked }))}
            className="h-4 w-4 rounded border-slate-300 text-genai-600 focus:ring-genai-500"
          />
          {t.admin.users.activeLabel}
        </label>
      )}

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
        {isSubmitting && <SpinnerIcon className="h-4 w-4 animate-spin" />}
        {isSubmitting ? t.admin.common.saving : existing ? t.admin.common.save : t.admin.common.create}
      </button>
    </form>
  );
}
