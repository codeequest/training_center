export interface PageParams {
  page: number;
  perPage: number;
  skip: number;
  take: number;
}

export function parsePagination(query: Record<string, unknown>, defaultPerPage = 20): PageParams {
  const page = Math.max(1, Number(query.page) || 1);
  const perPage = Math.min(100, Math.max(1, Number(query.perPage) || defaultPerPage));
  return { page, perPage, skip: (page - 1) * perPage, take: perPage };
}

export function pageMeta(total: number, { page, perPage }: PageParams) {
  return { total, page, perPage, totalPages: Math.max(1, Math.ceil(total / perPage)) };
}
