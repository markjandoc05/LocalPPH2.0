import { extractAdSensePublisherId } from '@/lib/integrations/adsense';
import { getSettings } from '@/lib/settings/settings-service';

/**
 * Render the controlled AdSense loader in the initial document head.
 *
 * Google verifies a site by crawling the server-rendered HTML. The raw admin
 * snippet stays private; only the validated publisher ID is exposed.
 */
export default async function AdSenseVerificationScript() {
  const settings = await getSettings();
  const publisherId = extractAdSensePublisherId(settings.googleAdSense.codeSnippet);

  if (!settings.googleAdSense.enabled || !publisherId) return null;

  return (
    <script
      id="localpages-adsense-script"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(publisherId)}`}
      crossOrigin="anonymous"
    />
  );
}
