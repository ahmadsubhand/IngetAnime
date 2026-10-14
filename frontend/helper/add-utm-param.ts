export default function addUtmParam(
  url: string | undefined = '',
  utm_campaign: string,
) {
  if (!url?.trim()) return url;

  if (!utm_campaign.trim()) throw new Error('utm_campaign must set');

  const baseUrl = new URL(url);

  baseUrl.searchParams.set('utm_source', 'ingetanime');
  baseUrl.searchParams.set('utm_medium', 'referral');
  baseUrl.searchParams.set('utm_campaign', utm_campaign);

  return baseUrl.toString();
}
