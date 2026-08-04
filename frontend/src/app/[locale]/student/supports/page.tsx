'use client';

import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { DocumentIcon, DownloadIcon, LinkIcon, PlayIcon, SpinnerIcon } from '@/components/icons';
import { MotionDiv, MotionLi, MotionUl, fadeUpItem, hoverLift, revealParentProps } from '@/components/motion-primitives';
import { isLocale, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { API_ORIGIN } from '@/lib/api';
import { listMyMaterials, type StudentMaterial } from '@/lib/student-api';

const typeIcons: Record<StudentMaterial['type'], typeof DocumentIcon> = {
  PDF: DocumentIcon,
  SLIDES: DocumentIcon,
  LINK: LinkIcon,
  VIDEO: PlayIcon,
};

function materialHref(material: StudentMaterial): string {
  return material.fileUrl.startsWith('/') ? `${API_ORIGIN}${material.fileUrl}` : material.fileUrl;
}

export default function StudentMaterialsPage() {
  const params = useParams<{ locale: string }>();
  const locale: Locale = isLocale(params.locale) ? (params.locale as Locale) : 'fr';
  const t = getDictionary(locale);

  const [materials, setMaterials] = useState<StudentMaterial[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    listMyMaterials()
      .then(({ materials: fetched }) => {
        if (!cancelled) setMaterials(fetched);
      })
      .catch(() => {
        if (!cancelled) setMaterials([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const groups = useMemo(() => {
    if (!materials) return [];
    const byLabel = new Map<string, StudentMaterial[]>();
    for (const material of materials) {
      const title = material.session
        ? locale === 'fr'
          ? material.session.course.titleFr
          : material.session.course.titleEn
        : material.course
          ? locale === 'fr'
            ? material.course.titleFr
            : material.course.titleEn
          : t.student.materials.generalLabel;
      const list = byLabel.get(title) ?? [];
      list.push(material);
      byLabel.set(title, list);
    }
    return Array.from(byLabel.entries());
  }, [materials, locale, t.student.materials.generalLabel]);

  return (
    <div>
      <MotionDiv initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{t.student.materials.title}</h1>
        <p className="mt-2 text-[15px] text-ink-muted">{t.student.materials.subtitle}</p>
      </MotionDiv>

      {materials === null ? (
        <div className="mt-12 grid place-items-center py-16">
          <SpinnerIcon className="h-6 w-6 animate-spin text-brand-600" />
        </div>
      ) : materials.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white py-16 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-brand-600">
            <DocumentIcon className="h-7 w-7" />
          </span>
          <p className="text-base font-semibold text-ink">{t.student.materials.emptyTitle}</p>
          <p className="max-w-sm text-sm text-ink-muted">{t.student.materials.emptyBody}</p>
        </div>
      ) : (
        <div className="mt-10 space-y-10">
          {groups.map(([title, items]) => (
            <div key={title}>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">{title}</h2>
              <MotionUl {...revealParentProps} className="mt-4 grid gap-4 sm:grid-cols-2">
                {items.map((material) => {
                  const Icon = typeIcons[material.type];
                  const isDownload = material.type === 'PDF' || material.type === 'SLIDES';
                  return (
                    <MotionLi
                      key={material.id}
                      variants={fadeUpItem}
                      {...hoverLift}
                      className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-ink">{material.title}</span>
                        <span className="mt-0.5 block text-xs text-ink-muted">
                          {t.student.materials.typeLabels[material.type]}
                        </span>
                      </span>
                      <a
                        href={materialHref(material)}
                        target="_blank"
                        rel="noreferrer"
                        download={isDownload ? true : undefined}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-ink transition-colors hover:border-brand-600 hover:text-brand-700"
                      >
                        {isDownload ? <DownloadIcon className="h-3.5 w-3.5" /> : null}
                        {t.student.materials.open}
                      </a>
                    </MotionLi>
                  );
                })}
              </MotionUl>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
