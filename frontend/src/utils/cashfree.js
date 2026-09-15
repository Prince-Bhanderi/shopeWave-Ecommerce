const clientId = import.meta.env.VITE_CASHFREE_CLIENT_ID;

export const isCashfreeEnabled = Boolean(clientId);

const SCRIPT_URL = 'https://sdk.cashfree.com/js/v3/cashfree.js';
let scriptPromise;

/**
 * Cashfree's Drop-in checkout isn't an npm package here - it's loaded as a
 * <script> tag that attaches a global `Cashfree` constructor to the page.
 * This injects it once and caches the promise so re-selecting the payment
 * method doesn't refetch the script every time.
 */
export const loadCashfreeScript = () => {
  if (window.Cashfree) return Promise.resolve(true);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.onload = () => resolve(true);
    script.onerror = () => {
      scriptPromise = undefined;
      resolve(false);
    };
    document.body.appendChild(script);
  });

  return scriptPromise;
};