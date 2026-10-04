const REFERRER_STORAGE_KEY = 'poupa-ai-referrer';
const VALID_FIREBASE_UID = /^[A-Za-z0-9_-]{20,128}$/;

export const captureReferralFromUrl = (): void => {
  const url = new URL(window.location.href);
  const referrer = url.searchParams.get('ref')?.trim();
  if (!referrer || !VALID_FIREBASE_UID.test(referrer)) return;

  localStorage.setItem(REFERRER_STORAGE_KEY, referrer);
  url.searchParams.delete('ref');
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
};

export const getStoredReferrer = (): string | null => {
  const referrer = localStorage.getItem(REFERRER_STORAGE_KEY);
  return referrer && VALID_FIREBASE_UID.test(referrer) ? referrer : null;
};

export const clearStoredReferrer = (): void => {
  localStorage.removeItem(REFERRER_STORAGE_KEY);
};
