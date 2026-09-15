import { useState } from 'react';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { Lock } from 'lucide-react';
import { getStripePromise } from '../../utils/stripe';

const InnerForm = ({ onSuccess, isPlacingOrder }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsConfirming(true);
    setError(null);

    const { error: submitError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (submitError) {
      setError(submitError.message || 'Payment failed. Please check your card details and try again.');
      setIsConfirming(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      onSuccess(paymentIntent.id);
    } else {
      setError('Payment was not completed. Please try again.');
    }
    setIsConfirming(false);
  };

  const busy = isConfirming || isPlacingOrder;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={!stripe || busy} className="btn-primary w-full">
        <Lock className="h-4 w-4" /> {busy ? 'Processing payment...' : 'Pay & Place Order'}
      </button>
    </form>
  );
};

const StripeCardForm = ({ clientSecret, onSuccess, isPlacingOrder }) => {
  const stripePromise = getStripePromise();
  if (!stripePromise || !clientSecret) return null;

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
      <InnerForm onSuccess={onSuccess} isPlacingOrder={isPlacingOrder} />
    </Elements>
  );
};

export default StripeCardForm;
