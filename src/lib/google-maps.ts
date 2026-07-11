const decodeHtmlAttribute = (value: string) =>
  value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

const getAttributeValue = (value: string, attribute: 'src' | 'href') => {
  const match = value.match(new RegExp(`${attribute}=["']([^"']+)["']`, 'i'));
  return match?.[1] ? decodeHtmlAttribute(match[1]) : null;
};

const isGoogleMapsHost = (hostname: string) => {
  const host = hostname.replace(/^www\./, '');
  return host === 'google.com' || host === 'maps.google.com' || host === 'maps.app.goo.gl';
};

const isGoogleMapsEmbedUrl = (url: URL) =>
  url.pathname.startsWith('/maps/embed') ||
  (url.hostname.replace(/^www\./, '') === 'maps.google.com' &&
    url.pathname === '/maps' &&
    url.searchParams.get('mapclient') === 'embed');

const normalizeGoogleMapsUrl = (url: URL) => url.toString();

const toGoogleMapsSearchUrl = (query: string) => {
  const url = new URL('https://www.google.com/maps/search/');
  url.searchParams.set('api', '1');
  url.searchParams.set('query', query);
  return normalizeGoogleMapsUrl(url);
};

const getLastMatchValue = (value: string, pattern: RegExp) => {
  const matches = Array.from(value.matchAll(pattern));
  return matches.at(-1)?.[1] || null;
};

const getPublicMapsUrlFromEmbed = (url: URL) => {
  const host = url.hostname.replace(/^www\./, '');

  if (host === 'maps.google.com' && url.pathname === '/maps') {
    const publicUrl = new URL(url.toString());
    publicUrl.searchParams.delete('mapclient');
    return normalizeGoogleMapsUrl(publicUrl);
  }

  const query = url.searchParams.get('q') || url.searchParams.get('query');
  if (query) return toGoogleMapsSearchUrl(query);

  const coordinates = url.searchParams.get('ll') || url.searchParams.get('center');
  if (coordinates) return toGoogleMapsSearchUrl(coordinates);

  const decodedSearch = decodeURIComponent(url.search);
  const latitude = getLastMatchValue(decodedSearch, /!3d(-?\d+(?:\.\d+)?)/g);
  const longitude = getLastMatchValue(decodedSearch, /!2d(-?\d+(?:\.\d+)?)/g);

  if (latitude && longitude) {
    return toGoogleMapsSearchUrl(`${latitude},${longitude}`);
  }

  const place = getLastMatchValue(decodedSearch, /!2s([^!]+)/g);
  return place ? toGoogleMapsSearchUrl(place) : null;
};

export const getGoogleMapsEmbedSrc = (value?: string | null) => {
  if (!value) return null;

  const trimmed = decodeHtmlAttribute(value.trim());
  const candidate = getAttributeValue(trimmed, 'src') || trimmed;

  try {
    const url = new URL(candidate);
    if (isGoogleMapsHost(url.hostname) && isGoogleMapsEmbedUrl(url)) {
      return normalizeGoogleMapsUrl(url);
    }
  } catch {
    return null;
  }

  return null;
};

export const getGoogleMapsLink = (value?: string | null) => {
  if (!value) return null;

  const trimmed = decodeHtmlAttribute(value.trim());
  const href = getAttributeValue(trimmed, 'href');
  const src = getAttributeValue(trimmed, 'src');
  const candidate = href || src || trimmed;

  try {
    const url = new URL(candidate);
    if (!isGoogleMapsHost(url.hostname)) return null;
    if (isGoogleMapsEmbedUrl(url)) {
      return getPublicMapsUrlFromEmbed(url) || null;
    }
    return normalizeGoogleMapsUrl(url);
  } catch {
    return null;
  }
};
