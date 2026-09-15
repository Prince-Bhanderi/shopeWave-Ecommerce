import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Banknote, CreditCard, MapPin, Wallet } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import useCart from '../hooks/useCart';
import { fetchServerCart } from '../redux/slices/cartSlice';
import orderService from '../api/orderService';
import paymentService from '../api/paymentService';
import { isStripeEnabled } from '../utils/stripe';
import { isCashfreeEnabled } from '../utils/cashfree';
import { formatCurrency, formatINR } from '../utils/formatters';
import CheckoutSteps from '../components/checkout/CheckoutSteps';
import StripeCardForm from '../components/checkout/StripeCardForm';
import CashfreeButton from '../components/checkout/CashfreeButton';
import { FormInput } from '../components/common/FormField';
import CartSummary from '../components/cart/CartSummary';
import LoadingSpinner from '../components/common/LoadingSpinner';

const checkoutSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  phone: z.string().min(7, 'Enter a valid phone number'),
  addressLine1: z.string().min(1, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
});

const STEP_FIELDS = {
  1: ['fullName', 'email', 'phone'],
  2: ['addressLine1', 'city', 'state', 'postalCode', 'country'],
};

const Checkout = () => {
  const { user } = useAuth();
  const { items, totalPrice } = useCart();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [clientSecret, setClientSecret] = useState(null);
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);
  const [cashfreeOrder, setCashfreeOrder] = useState(null);
  const [isCreatingCashfreeOrder, setIsCreatingCashfreeOrder] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const defaultAddress = user?.address?.find((a) => a.isDefault) || user?.address?.[0];

  const {
    register,
    trigger,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      addressLine1: defaultAddress?.addressLine1 || '',
      addressLine2: defaultAddress?.addressLine2 || '',
      city: defaultAddress?.city || '',
      state: defaultAddress?.state || '',
      postalCode: defaultAddress?.postalCode || '',
      country: defaultAddress?.country || '',
    },
  });

  useEffect(() => {
    if (items.length === 0) {
      toast('Your cart is empty', { icon: 'ℹ️' });
      navigate('/cart');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buildShippingAddress = () => {
    const values = getValues();
    return {
      fullName: values.fullName,
      email: values.email,
      phone: values.phone,
      addressLine1: values.addressLine1,
      addressLine2: values.addressLine2,
      city: values.city,
      state: values.state,
      postalCode: values.postalCode,
      country: values.country,
    };
  };

  const goNext = async () => {
    const fields = STEP_FIELDS[step];
    if (fields) {
      const valid = await trigger(fields);
      if (!valid) return;
    }
    setStep((s) => Math.min(4, s + 1));
  };

  const goBack = () => setStep((s) => Math.max(1, s - 1));

  const placeOrder = async ({ method, paymentIntentId, cashfreeOrderId }) => {
    setIsPlacingOrder(true);
    try {
      const res = await orderService.createOrder({
        shippingAddress: buildShippingAddress(),
        paymentMethod: method,
        paymentIntentId,
        cashfreeOrderId,
      });
      const order = res.data.data;
      await dispatch(fetchServerCart());
      toast.success('Order placed successfully!');
      navigate(`/order-success/${order._id}`);
    } catch (error) {
      toast.error(error?.message || 'Could not place your order');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleSelectStripe = async () => {
    setPaymentMethod('Stripe');
    if (clientSecret) return;
    setIsCreatingIntent(true);
    try {
      const res = await paymentService.createPaymentIntent();
      setClientSecret(res.data.data.clientSecret);
    } catch (error) {
      toast.error(error?.message || 'Card payments are unavailable right now');
      setPaymentMethod('COD');
    } finally {
      setIsCreatingIntent(false);
    }
  };

  const handleSelectCashfree = async () => {
    setPaymentMethod('Cashfree');
    if (cashfreeOrder) return;
    setIsCreatingCashfreeOrder(true);
    try {
      const res = await paymentService.createCashfreeOrder({
        fullName: getValues('fullName'),
        email: getValues('email'),
        phone: getValues('phone'),
      });
      setCashfreeOrder(res.data.data);
    } catch (error) {
      toast.error(error?.message || 'Cashfree payments are unavailable right now');
      setPaymentMethod('COD');
    } finally {
      setIsCreatingCashfreeOrder(false);
    }
  };

  const orderItemsPreview = useMemo(() => items, [items]);

  if (items.length === 0) return null;

  return (
    <div className="container-app py-8">
      <h1 className="font-display text-2xl font-bold text-slate-900">Checkout</h1>

      <div className="mt-6 mb-10">
        <CheckoutSteps currentStep={step} />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              goNext();
            }}
            className="card space-y-5 p-6"
          >
            {step === 1 && (
              <>
                <h2 className="font-display text-lg font-semibold text-slate-900">Customer Information</h2>
                <FormInput label="Full Name" required {...register('fullName')} error={errors.fullName?.message} />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormInput label="Email" type="email" required {...register('email')} error={errors.email?.message} />
                  <FormInput label="Phone Number" type="tel" required {...register('phone')} error={errors.phone?.message} />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="font-display text-lg font-semibold text-slate-900">Shipping Address</h2>
                <FormInput label="Address Line 1" required {...register('addressLine1')} error={errors.addressLine1?.message} />
                <FormInput label="Address Line 2 (optional)" {...register('addressLine2')} />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormInput label="City" required {...register('city')} error={errors.city?.message} />
                  <FormInput label="State / Province" required {...register('state')} error={errors.state?.message} />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormInput label="Postal Code" required {...register('postalCode')} error={errors.postalCode?.message} />
                  <FormInput label="Country" required {...register('country')} error={errors.country?.message} />
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="font-display text-lg font-semibold text-slate-900">Review Your Order</h2>

                <div className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-700">Shipping to</p>
                    <button type="button" onClick={() => setStep(2)} className="text-xs font-medium text-indigo-600 hover:text-indigo-800">
                      Edit
                    </button>
                  </div>
                  <p className="mt-1 flex items-start gap-1.5 text-sm text-slate-600">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    {getValues('fullName')}, {getValues('addressLine1')} {getValues('addressLine2')}, {getValues('city')},{' '}
                    {getValues('state')} {getValues('postalCode')}, {getValues('country')}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {getValues('email')} &middot; {getValues('phone')}
                  </p>
                </div>

                <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                  {orderItemsPreview.map((item) => (
                    <div key={item._id} className="flex items-center gap-3 p-3">
                      <img
                        src={item.product.images?.[0]?.url}
                        alt={item.product.name}
                        className="h-14 w-14 shrink-0 rounded-md object-cover bg-slate-100"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-medium text-slate-800">{item.product.name}</p>
                        <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-800">{formatCurrency(item.lineTotal)}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <h2 className="font-display text-lg font-semibold text-slate-900">Payment Method</h2>

                <div className="space-y-3">
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 ${paymentMethod === 'COD' ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-200'}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <Banknote className="h-5 w-5 text-slate-500" />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Cash on Delivery</p>
                      <p className="text-xs text-slate-500">Pay with cash when your order arrives</p>
                    </div>
                  </label>

                  {isStripeEnabled && (
                    <label
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 ${paymentMethod === 'Stripe' ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-200'}`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'Stripe'}
                        onChange={handleSelectStripe}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <CreditCard className="h-5 w-5 text-slate-500" />
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Pay with Card</p>
                        <p className="text-xs text-slate-500">Secure payment powered by Stripe</p>
                      </div>
                    </label>
                  )}

                  {isCashfreeEnabled && (
                    <label
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 ${paymentMethod === 'Cashfree' ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-200'}`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'Cashfree'}
                        onChange={handleSelectCashfree}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <Wallet className="h-5 w-5 text-slate-500" />
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Card / UPI / Netbanking / QR</p>
                        <p className="text-xs text-slate-500">Credit or debit card, UPI (scan QR or pay by ID), netbanking &amp; wallets &middot; charged in INR</p>
                      </div>
                    </label>
                  )}
                </div>

                {paymentMethod === 'Stripe' && (
                  <div className="pt-2">
                    {isCreatingIntent && (
                      <div className="flex justify-center py-6">
                        <LoadingSpinner />
                      </div>
                    )}
                    {clientSecret && (
                      <StripeCardForm
                        clientSecret={clientSecret}
                        isPlacingOrder={isPlacingOrder}
                        onSuccess={(paymentIntentId) => placeOrder({ method: 'Stripe', paymentIntentId })}
                      />
                    )}
                  </div>
                )}

                {paymentMethod === 'Cashfree' && (
                  <div className="pt-2">
                    {isCreatingCashfreeOrder && (
                      <div className="flex justify-center py-6">
                        <LoadingSpinner />
                      </div>
                    )}
                    {cashfreeOrder && (
                      <CashfreeButton
                        order={cashfreeOrder}
                        amountDisplay={formatINR(totalPrice)}
                        isPlacingOrder={isPlacingOrder}
                        onSuccess={(payload) => placeOrder({ method: 'Cashfree', ...payload })}
                      />
                    )}
                  </div>
                )}
              </>
            )}

            <div className="flex items-center justify-between pt-2">
              {step > 1 ? (
                <button type="button" onClick={goBack} className="btn-secondary">
                  Back
                </button>
              ) : (
                <span />
              )}

              {step < 3 && (
                <button type="submit" className="btn-primary">
                  Continue
                </button>
              )}
              {step === 3 && (
                <button type="button" onClick={() => setStep(4)} className="btn-primary">
                  Continue to Payment
                </button>
              )}
              {step === 4 && paymentMethod === 'COD' && (
                <button type="button" disabled={isPlacingOrder} onClick={() => placeOrder({ method: 'COD' })} className="btn-primary">
                  {isPlacingOrder ? 'Placing order...' : `Place Order · ${formatCurrency(totalPrice)}`}
                </button>
              )}
            </div>
          </form>
        </div>

        <div>
          <div className="sticky top-24">
            <CartSummary showCouponField={step < 4} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;