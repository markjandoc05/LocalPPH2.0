const ADSENSE_SCRIPT_MARKER = 'pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
const ADSENSE_PUBLISHER_ID_PATTERN = /\bca-pub-\d{6,32}\b/i;

export const ADSENSE_SNIPPET_MAX_LENGTH = 4000;

/** Extract a publisher ID only from Google's official AdSense loader snippet. */
export const extractAdSensePublisherId = (snippet: unknown): string => {
  if (typeof snippet !== 'string') return '';

  const normalizedSnippet = snippet.trim();
  if (
    !normalizedSnippet ||
    normalizedSnippet.length > ADSENSE_SNIPPET_MAX_LENGTH ||
    !normalizedSnippet.toLowerCase().includes(ADSENSE_SCRIPT_MARKER) ||
    !/<script\b/i.test(normalizedSnippet)
  ) {
    return '';
  }

  return normalizedSnippet.match(ADSENSE_PUBLISHER_ID_PATTERN)?.[0].toLowerCase() || '';
};

export const isValidAdSenseSnippet = (snippet: unknown): boolean => Boolean(extractAdSensePublisherId(snippet));
