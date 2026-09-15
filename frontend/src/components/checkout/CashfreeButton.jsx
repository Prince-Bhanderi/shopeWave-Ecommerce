import { useState } from 'react';
import { Lock } from 'lucide-react';
import { loadCashfreeScript } from '../../utils/cashfree';

const CashfreeButton = ({ order, amountDisplay, onSuccess, isPlacingOrder }) => {
  const [error, setError] = useState(null);
  const [isOpening, setIsOpening] = useState(false);

  const handlePay = async () => {
    setError(null);
    setIsOpening(true);

    const loaded = await loadCashfreeScript();
    if (!loaded || !window.Cashfree) {
      setError('Could not load Cashfree. Check your connection and try again.');
      setIsOpening(false);
      return;
    }

    try {
      const cashfree = window.Cashfree({ mode: order.mode === 'production' ? 'production' : 'sandbox' });

      const result = await cashfree.checkout({
        paymentSessionId: order.paymentSessionId,
        redirectTarget: '_modal',
      });

      if (result?.error) {
        setError(
          result.error.message || 'Payment was not completed. If you closed the window, you can try again.'
        );
        setIsOpening(false);
        return;
      }

      // Whichever way the modal resolves, the backend is the only source of
      // truth - it re-fetches this order from Cashfree's API and checks it's
      // actually paid before an order is ever created (see
      // verifyCashfreePayment in paymentController.js).
      onSuccess({ cashfreeOrderId: order.orderId });
    } catch (err) {
      setError(err?.message || 'Payment could not be started. Please try again.');
    } finally {
      setIsOpening(false);
    }
  };

  const busy = isOpening || isPlacingOrder;

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">
        Cashfree&rsquo;s secure checkout will open with tabs for card, UPI (including a scan-to-pay
        QR code), netbanking, and wallets &mdash; pick whichever you like.
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="button" onClick={handlePay} disabled={busy} className="btn-primary w-full">
        <Lock className="h-4 w-4" /> {busy ? 'Waiting for payment...' : `Pay ${amountDisplay} with Cashfree`}
      </button>
    </div>
  );
};

export default CashfreeButton;