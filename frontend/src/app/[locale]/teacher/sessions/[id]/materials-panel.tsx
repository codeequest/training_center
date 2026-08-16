'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';

import { apiFetch, ApiRequestError, resolveFileUrl } from '@/lib/api';
import type { Dictionary } from '@/i18n/dictionaries';
import type { Material, MaterialType, Visibility } from '../../types';
import { materialTypeClasses, formatFileSize } from '../../ui';

const FILE_TYPES: MaterialType[] = ['PDF', 'SLIDES'];

export default function MaterialsPanel({
  sessionId,
  token,
  t,
}: {
  sessionId: string;
  token: string;
  t: Dictionary;
}) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<{ materials: Material[] }>(`/sessions/${sessionId}/materials`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMaterials(data.materials);
    } catch {
      // Message d'erreur déjà géré au niveau de la session parente (roster) ; on affiche une liste vide.
    } finally {
      setLoading(false);
    }
  }, [sessionId, token]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleDelete(id: string) {
    try {
      await apiFetch(`/materials/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setMaterials((current) => current.filter((m) => m.id !== id));
    } finally {
      setConfirmingId(null);
    }
  }

  return (
    <div className="panel animate-fade-up" style={{ animationDelay: '160ms' }}>
      {/* Titre et action côte à côte dès `sm` ; empilés en dessous, sinon les
          deux libellés se coupent en deux lignes sur un téléphone étroit. */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-ink">{t.teacher.session.materials.title}</h3>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="btn-secondary w-full sm:w-auto"
        >
          {t.teacher.session.materials.addButton}
        </button>
      </div>

      {showForm && (
        <MaterialForm
          sessionId={sessionId}
          token={token}
          t={t}
          onCreated={(material) => {
            setMaterials((current) => [material, ...current]);
            setShowForm(false);
          }}
        />
      )}

      <div className="mt-5">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : materials.length === 0 ? (
          <p className="text-sm text-ink-muted">{t.teacher.session.materials.empty}</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {materials.map((material) => (
              <li key={material.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3">
                  <span className={`badge ${materialTypeClasses[material.type]}`}>
                    {t.teacher.materialTypeLabels[material.type]}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ink">{material.title}</p>
                    <p className="text-xs text-ink-muted">
                      {t.teacher.visibilityLabels[material.visibility]} ·{' '}
                      {material.type === 'LINK' || material.type === 'VIDEO'
                        ? t.teacher.session.materials.openLink
                        : formatFileSize(material.fileSize, t.teacher.session.materials.sizeUnknown)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href={resolveFileUrl(material.fileUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-brand-700 hover:underline"
                  >
                    {t.teacher.session.materials.openLink}
                  </a>

                  {confirmingId === material.id ? (
                    <div className="flex items-center gap-2 animate-scale-in">
                      <span className="text-xs text-ink-muted">{t.teacher.session.materials.deleteConfirmBody}</span>
                      <button
                        type="button"
                        onClick={() => void handleDelete(material.id)}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                      >
                        {t.teacher.session.materials.deleteConfirmYes}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingId(null)}
                        className="text-xs font-medium text-ink-muted hover:text-ink"
                      >
                        {t.teacher.common.cancel}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmingId(material.id)}
                      className="text-sm font-medium text-red-600 hover:underline"
                    >
                      {t.teacher.common.delete}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function MaterialForm({
  sessionId,
  token,
  t,
  onCreated,
}: {
  sessionId: string;
  token: string;
  t: Dictionary;
  onCreated: (material: Material) => void;
}) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<MaterialType>('PDF');
  const [visibility, setVisibility] = useState<Visibility>('ENROLLED');
  const [url, setUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isFileType = FILE_TYPES.includes(type);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError(t.teacher.session.materials.titleRequired);
      return;
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('sessionId', sessionId);
    formData.append('type', type);
    formData.append('visibility', visibility);

    if (isFileType) {
      const file = fileInputRef.current?.files?.[0];
      if (!file) {
        setError(t.teacher.session.materials.fileRequired);
        return;
      }
      formData.append('file', file);
    } else {
      const trimmedUrl = url.trim();
      if (!trimmedUrl || !/^https?:\/\//i.test(trimmedUrl)) {
        setError(t.teacher.session.materials.urlRequired);
        return;
      }
      formData.append('fileUrl', trimmedUrl);
    }

    setSubmitting(true);
    try {
      const data = await apiFetch<{ material: Material }>('/materials', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      onCreated(data.material);
      setTitle('');
      setUrl('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (caught) {
      setError(caught instanceof ApiRequestError ? caught.message : t.teacher.common.networkError);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 animate-scale-in space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
      <h4 className="text-sm font-semibold text-ink">{t.teacher.session.materials.formTitle}</h4>

      {error && <p className="field-error">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="material-title">
            {t.teacher.session.materials.titleLabel}
          </label>
          <input
            id="material-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t.teacher.session.materials.titlePlaceholder}
            className="field-input"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="material-type">
            {t.teacher.session.materials.typeLabel}
          </label>
          <select
            id="material-type"
            value={type}
            onChange={(e) => setType(e.target.value as MaterialType)}
            className="field-input"
          >
            {(['PDF', 'SLIDES', 'LINK', 'VIDEO'] as MaterialType[]).map((option) => (
              <option key={option} value={option}>
                {t.teacher.materialTypeLabels[option]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="material-visibility">
            {t.teacher.session.materials.visibilityLabel}
          </label>
          <select
            id="material-visibility"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as Visibility)}
            className="field-input"
          >
            {(['ENROLLED', 'PUBLIC'] as Visibility[]).map((option) => (
              <option key={option} value={option}>
                {t.teacher.visibilityLabels[option]}
              </option>
            ))}
          </select>
        </div>

        {isFileType ? (
          // La clé empêche React de réutiliser le même <input> entre les deux branches :
          // le champ fichier est non contrôlé, le champ URL est contrôlé.
          <div key="material-file-field">
            <label className="field-label" htmlFor="material-file">
              {t.teacher.session.materials.fileLabel}
            </label>
            <input id="material-file" ref={fileInputRef} type="file" className="field-input file:mr-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-brand-700" />
          </div>
        ) : (
          <div key="material-url-field">
            <label className="field-label" htmlFor="material-url">
              {t.teacher.session.materials.urlLabel}
            </label>
            <input
              id="material-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t.teacher.session.materials.urlPlaceholder}
              className="field-input"
            />
          </div>
        )}
      </div>

      <button type="submit" disabled={submitting} className="btn-primary">
        {submitting ? t.teacher.session.materials.submitting : t.teacher.session.materials.submit}
      </button>
    </form>
  );
}
