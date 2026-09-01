import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle, AlertTriangle } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { formatCurrency } from '../lib/utils';
import { OrderItem, BD_DISTRICTS } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { cart, placeOrder, isPhoneBlocked, isDailyOrderLimitReached, validateDiscountCode, addOrUpdateIncompleteOrder } = useShop();
  const [step, setStep] = useState<1 | 2>(1); // 1: Form, 2: Success
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; amount: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    district: 'ঢাকা',
    paymentMethod: 'COD'
  });

  const draftOrderIdRef = useRef<string>(`INC-${Math.random().toString(36).substr(2, 6).toUpperCase()}`);

  const subtotal = cart.reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0);
  const shipping = subtotal > 5000 ? 0 : 150;
  const discountAmount = appliedCoupon ? appliedCoupon.amount : 0;
  const total = Math.max(0, subtotal + shipping - discountAmount);

  const saveDraftOrder = (customData = formData) => {
    const phoneClean = (customData.phone || '').trim().replace(/\D/g, '');
    // N/A Prevention: Only save as draft if phone has at least 11 digits
    if (phoneClean.length >= 11) {
      if (cart.length > 0 && addOrUpdateIncompleteOrder) {
        const orderItems = cart.map(item => ({
          productId: item.productId,
          size: item.size,
          quantity: item.quantity,
          price: item.product?.price || 0
        }));

        addOrUpdateIncompleteOrder(draftOrderIdRef.current, {
          customer: {
            name: customData.name,
            phone: customData.phone,
            address: customData.address,
            city: customData.city || 'Dhaka',
            district: customData.district || 'ঢাকা'
          },
          items: orderItems,
          total,
          paymentMethod: customData.paymentMethod
        });
      }
    }
  };

  useEffect(() => {
    saveDraftOrder(formData);
  }, [formData, cart, total, addOrUpdateIncompleteOrder]);

  const handleApplyCoupon = (e: React.MouseEvent) => {
    e.preventDefault();
    setCouponError(null);
    if (!couponCode.trim()) return;
    
    const result = validateDiscountCode(couponCode, subtotal);
    if (result.isValid) {
      setAppliedCoupon({ code: couponCode.trim().toUpperCase(), amount: result.discountAmount });
      setCouponError(null);
    } else {
      setAppliedCoupon(null);
      setCouponError(result.error || 'ভুল কুপন কোড!');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    // Check if phone is blocked
    if (isPhoneBlocked(formData.phone)) {
      setError("Sorry, we cannot process your order at this time. Please contact support.");
      return;
    }

    // Check if phone has reached daily limit
    if (isDailyOrderLimitReached(formData.phone)) {
      setError("দুঃখিত, এই নম্বর থেকে আজকে ইতিমধ্যেই একটি অর্ডার করা হয়েছে। প্রতিদিন একটির বেশি অর্ডার করা সম্ভব নয়। জরুরি প্রয়োজনে দয়া করে আমাদের সাপোর্টে যোগাযোগ করুন।");
      return;
    }

    const orderItems: OrderItem[] = cart.map(item => ({
      productId: item.productId,
      size: item.size,
      quantity: item.quantity,
      price: item.product?.price || 0
    }));

    setIsSubmitting(true);
    setError(null);

    try {
      await placeOrder({
        customer: {
          name: formData.name,
          email: '',
          phone: formData.phone,
          address: formData.address,
          city: formData.city || 'Dhaka',
          district: formData.district || 'ঢাকা'
        },
        items: orderItems,
        total,
        paymentMethod: formData.paymentMethod
      });

      setStep(2);
      setError(null);
    } catch (err: any) {
      console.error("Order submission failed:", err);
      setError("অর্ডার সফলভাবে সেভ করা যায়নি। দয়া করে আবার চেষ্টা করুন বা সরাসরি আমাদের সাথে যোগাযোগ করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (step === 2) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
        <div className="relative bg-white w-full max-w-md p-10 text-center rounded-sm shadow-2xl">
           <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
           <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">Order Confirmed!</h2>
           <p className="text-gray-600 mb-8">Thank you for shopping with Elham Shop. Your order has been placed successfully and is being processed.</p>
           <button 
             onClick={onClose}
             className="bg-black text-white px-8 py-3 font-medium uppercase tracking-wider hover:bg-yellow-600 transition-colors"
           >
             Continue Shopping
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row rounded-sm">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-gray-500 hover:text-black transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Order Summary */}
        <div className="w-full md:w-5/12 bg-gray-50 p-8 overflow-y-auto border-r border-gray-100 hidden md:block">
           <h3 className="text-xl font-serif font-bold mb-6">Order Summary</h3>
           <div className="space-y-4 mb-8">
             {cart.map(item => (
               <div key={item.id} className="flex gap-4">
                 <div className="relative">
                   <img src={item.product?.image || 'https://images.unsplash.com/photo-1583391733959-b0510f6992dd?auto=format&fit=crop&q=80&w=800'} alt={item.product?.title || 'Product'} className="w-16 h-20 object-cover border border-gray-200" />
                   <span className="absolute -top-2 -right-2 bg-gray-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                     {item.quantity}
                   </span>
                 </div>
                 <div className="flex-1 py-1">
                   <p className="font-medium text-sm line-clamp-1">{item.product?.title || 'Product'}</p>
                   <p className="text-gray-500 text-xs">Size: {item.size}</p>
                   <p className="font-semibold text-sm mt-1">{formatCurrency(item.product?.price || 0)}</p>
                 </div>
               </div>
             ))}
           </div>
           
           {/* Promo Code Input (Disabled as requested) */}
           <div className="space-y-3 pt-6 border-t border-gray-200 text-sm mt-4">
             <div className="flex justify-between">
               <span className="text-gray-500">Subtotal</span>
               <span className="font-medium">{formatCurrency(subtotal)}</span>
             </div>
             <div className="flex justify-between">
               <span className="text-gray-500">Shipping</span>
               <span className="font-medium">{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
             </div>
             <div className="flex justify-between pt-4 border-t border-gray-200">
               <span className="font-bold text-base uppercase">Total</span>
               <span className="font-bold text-xl">{formatCurrency(total)}</span>
             </div>
           </div>
        </div>

        {/* Checkout Form */}
        <div className="w-full md:w-7/12 p-8 md:p-10 overflow-y-auto">
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-8">Checkout Information</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div className="space-y-3">
                    <p className="text-red-700 text-sm font-semibold leading-relaxed">{error}</p>
                    {error.includes("প্রতিদিন একটির বেশি") && (
                      <div className="flex flex-wrap gap-2.5 pt-1.5">
                        <a 
                          href={`https://wa.me/8801756994483?text=Assalamu%20Alaikum!%20My%20order%20was%20blocked%20by%20daily%20limit.%20Please%20whitelist%20my%20number:%20${formData.phone}`}
                          target="_blank"
                          referrerPolicy="no-referrer"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20ba56] text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-md transition-all hover:scale-105 active:scale-95"
                        >
                          <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                          হোয়াটসঅ্যাপে যোগাযোগ (WhatsApp)
                        </a>
                        <a 
                          href="https://m.me/61561088721085" 
                          target="_blank"
                          referrerPolicy="no-referrer"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-md transition-all hover:scale-105 active:scale-95"
                        >
                          ফেসবুক পেজে মেসেজ (Facebook)
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div>
              <h3 className="text-lg font-medium mb-4">Contact & Delivery</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input required type="text" value={formData.name} onChange={e => { const updated = {...formData, name: e.target.value}; setFormData(updated); saveDraftOrder(updated); }} onInput={e => { const updated = {...formData, name: (e.target as HTMLInputElement).value}; setFormData(updated); saveDraftOrder(updated); }} onBlur={() => saveDraftOrder(formData)} className="w-full border border-gray-300 rounded-sm p-3 focus:ring-yellow-500 focus:border-yellow-500 outline-none" placeholder="John Doe" />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input required type="tel" value={formData.phone} onChange={e => { const val = e.target.value.replace(/[^0-9]/g, ''); const updated = {...formData, phone: val}; setFormData(updated); saveDraftOrder(updated); }} onInput={e => { const val = (e.target as HTMLInputElement).value.replace(/[^0-9]/g, ''); const updated = {...formData, phone: val}; setFormData(updated); saveDraftOrder(updated); }} onBlur={() => saveDraftOrder(formData)} className="w-full border border-gray-300 rounded-sm p-3 focus:ring-yellow-500 focus:border-yellow-500 outline-none" placeholder="+880 1..." />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Address</label>
                  <input required type="text" value={formData.address} onChange={e => { const updated = {...formData, address: e.target.value}; setFormData(updated); saveDraftOrder(updated); }} onInput={e => { const updated = {...formData, address: (e.target as HTMLInputElement).value}; setFormData(updated); saveDraftOrder(updated); }} onBlur={() => saveDraftOrder(formData)} className="w-full border border-gray-300 rounded-sm p-3 focus:ring-yellow-500 focus:border-yellow-500 outline-none" placeholder="House/Flat No, Street Name" />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">জেলা (District)</label>
                  <select
                    required
                    value={formData.district || 'ঢাকা'}
                    onChange={e => {
                      const updated = { ...formData, district: e.target.value };
                      setFormData(updated);
                      saveDraftOrder(updated);
                    }}
                    className="w-full border border-gray-300 rounded-sm p-3 focus:ring-yellow-500 focus:border-yellow-500 outline-none bg-white font-medium text-sm cursor-pointer"
                  >
                    {BD_DISTRICTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input required type="text" value={formData.city} onChange={e => { const updated = {...formData, city: e.target.value}; setFormData(updated); saveDraftOrder(updated); }} onInput={e => { const updated = {...formData, city: (e.target as HTMLInputElement).value}; setFormData(updated); saveDraftOrder(updated); }} onBlur={() => saveDraftOrder(formData)} className="w-full border border-gray-300 rounded-sm p-3 focus:ring-yellow-500 focus:border-yellow-500 outline-none" placeholder="Dhaka" />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <h3 className="text-lg font-medium mb-4 flex justify-between items-center">
                Payment Method
                <span className="text-sm font-normal text-gray-500">Bangladesh</span>
              </h3>
              
              <div className="space-y-3">
                <PaymentOption id="COD" label="Cash on Delivery (COD)" checked={formData.paymentMethod === 'COD'} onChange={(val) => setFormData({...formData, paymentMethod: val})} />
                <PaymentOption id="bKash" label="bKash" checked={formData.paymentMethod === 'bKash'} onChange={(val) => setFormData({...formData, paymentMethod: val})} />
                <PaymentOption id="Nagad" label="Nagad" checked={formData.paymentMethod === 'Nagad'} onChange={(val) => setFormData({...formData, paymentMethod: val})} />
                <PaymentOption id="Rocket" label="Rocket" checked={formData.paymentMethod === 'Rocket'} onChange={(val) => setFormData({...formData, paymentMethod: val})} />
              </div>
            </div>

            {error && (
              <div className="p-4 mb-4 bg-red-50 text-red-600 rounded-sm text-sm border border-red-100 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-8">
              <button 
                type="submit"
                disabled={isSubmitting}
                className={`w-full text-white py-4 font-bold uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 ${
                  isSubmitting 
                    ? 'bg-neutral-600 cursor-not-allowed' 
                    : 'bg-black hover:bg-yellow-600'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing Order...
                  </>
                ) : (
                  `Place Order • ${formatCurrency(total)}`
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const PaymentOption = ({ id, label, checked, onChange }: { id: string, label: string, checked: boolean, onChange: (id: string) => void }) => (
  <label className={`flex items-center p-4 border rounded-sm cursor-pointer transition-colors ${checked ? 'border-yellow-600 bg-yellow-50' : 'border-gray-200 hover:border-gray-300'}`}>
    <input 
      type="radio" 
      name="payment" 
      className="w-4 h-4 text-yellow-600 focus:ring-yellow-500 cursor-pointer" 
      checked={checked}
      onChange={() => onChange(id)}
    />
    <span className="ml-3 font-medium text-gray-900">{label}</span>
  </label>
);
