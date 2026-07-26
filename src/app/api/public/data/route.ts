import { NextResponse } from 'next/server';
import { databaseProvider } from '@/lib/data-connect/database-provider';
import { consumeRateLimit, getRequestClientIp } from '@/lib/server/rate-limit';

const MAX_BODY_BYTES = 32 * 1024;
const MAX_IDENTIFIER_LENGTH = 160;

type Variables = Record<string, unknown>;
type PublicHandler = (variables: Variables) => Promise<unknown>;

class PublicApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

const optionalString = (
  value: unknown,
  field: string,
  maxLength = MAX_IDENTIFIER_LENGTH,
) => {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string' || value.length > maxLength) {
    throw new PublicApiError(`Invalid ${field}.`, 400);
  }
  return value.trim();
};

const optionalBoolean = (value: unknown, field: string) => {
  if (value === undefined) return undefined;
  if (typeof value !== 'boolean') {
    throw new PublicApiError(`Invalid ${field}.`, 400);
  }
  return value;
};

const optionalInteger = (
  value: unknown,
  field: string,
  minimum: number,
  maximum: number,
) => {
  if (value === undefined) return undefined;
  if (typeof value !== 'number' || !Number.isInteger(value) || value < minimum || value > maximum) {
    throw new PublicApiError(`Invalid ${field}.`, 400);
  }
  return value;
};

const publicHandlers: Record<string, PublicHandler> = {
  getCategories: () => databaseProvider.getCategories(),
  getRegions: () => databaseProvider.getRegions(),
  getProvinces: (variables) =>
    databaseProvider.getProvinces({
      regionId: optionalString(variables.regionId, 'regionId'),
    }),
  getCities: (variables) =>
    databaseProvider.getCities({
      provinceId: optionalString(variables.provinceId, 'provinceId'),
    }),
  getSubcategories: (variables) =>
    databaseProvider.getSubcategories({
      categoryId: optionalString(variables.categoryId, 'categoryId'),
    }),
  getSearchSuggestions: (variables) =>
    databaseProvider.getSearchSuggestions({
      q: optionalString(variables.q, 'q', 100) || '',
    }),
  searchApprovedBusinesses: (variables) =>
    databaseProvider.searchApprovedBusinesses({
      q: optionalString(variables.q, 'q', 100),
      categoryId: optionalString(variables.categoryId, 'categoryId'),
      regionId: optionalString(variables.regionId, 'regionId'),
      provinceId: optionalString(variables.provinceId, 'provinceId'),
      cityId: optionalString(variables.cityId, 'cityId'),
      verifiedOnly: optionalBoolean(variables.verifiedOnly, 'verifiedOnly'),
      featuredOnly: optionalBoolean(variables.featuredOnly, 'featuredOnly'),
      sort: optionalString(variables.sort, 'sort', 20),
      page: optionalInteger(variables.page, 'page', 1, 10_000),
      limit: optionalInteger(variables.limit, 'limit', 0, 100),
    }),
  getApprovedBusinessBySlug: (variables) =>
    databaseProvider.getApprovedBusinessBySlug({
      slug: optionalString(variables.slug, 'slug') || '',
    }),
  getFeaturedApprovedBusinesses: () => databaseProvider.getFeaturedApprovedBusinesses(),
  getRecentlyApprovedBusinesses: () => databaseProvider.getRecentlyApprovedBusinesses(),
};

export async function POST(request: Request) {
  try {
    const rateLimit = consumeRateLimit(
      `public-data:${getRequestClientIp(request)}`,
      240,
      60_000,
    );
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again shortly.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfterSeconds),
            'Cache-Control': 'no-store',
          },
        },
      );
    }

    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: 'Request body is too large.' }, { status: 413 });
    }

    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: 'Request body is too large.' }, { status: 413 });
    }

    let payload: unknown;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      throw new PublicApiError('Invalid JSON body.', 400);
    }

    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      throw new PublicApiError('Invalid request body.', 400);
    }

    const { method, variables } = payload as {
      method?: unknown;
      variables?: unknown;
    };
    if (typeof method !== 'string' || !Object.hasOwn(publicHandlers, method)) {
      throw new PublicApiError('Invalid method.', 400);
    }
    if (
      variables !== undefined &&
      (!variables || typeof variables !== 'object' || Array.isArray(variables))
    ) {
      throw new PublicApiError('Invalid variables.', 400);
    }

    const result = await publicHandlers[method]((variables || {}) as Variables);
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    if (error instanceof PublicApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error('Public API Data Error:', error);
    return NextResponse.json(
      { error: 'Unable to process the request.' },
      { status: 500 },
    );
  }
}
