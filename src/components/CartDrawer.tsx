import React from 'react';
import { X, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { formatCurrency } from '../lib/utils';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onCheckout }) => {
  const { cart, removeFromCart, updateCartQuantity } = useShop();

  const subtotal = cart.reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50 transition-opacity" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-serif font-bold uppercase tracking-widest text-gray-900">Your Cart</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-black transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <ShoppingBagIcon className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">Your cart is empty.</p>
              <button 
                onClick={onClose}
                className="mt-4 text-yellow-600 font-medium hover:underline"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.map(item => (
                <div key={item.id} className="flex gap-4 group">
                  <div className="w-24 h-32 bg-gray-100 flex-shrink-0 overflow-hidden">
                    <img src={item.product?.image || 'https://images.unsplash.com/photo-1583391733959-b0510f6992dd?auto=format&fit=crop&q=80&w=800'} alt={item.product?.title || 'Product'} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-gray-900 text-sm line-clamp-2 pr-4">{item.product?.title || 'Product'}</h3>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-gray-500 text-sm mt-1">Size: {item.size}</p>
                    </div>
                    <div className="flex justify-between items-end mt-4">
                      <div className="flex items-center border border-gray-200 h-8">
                        <button 
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="px-2 text-gray-500 hover:text-black transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button 
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="px-2 text-gray-500 hover:text-black transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency((item.product?.price || 0) * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-gray-100 bg-gray-50">
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-600 font-medium">Subtotal</span>
              <span className="text-xl font-bold text-gray-900">{formatCurrency(subtotal)}</span>
            </div>
            <p className="text-sm text-gray-500 mb-6 text-center">Shipping & taxes calculated at checkout</p>
            <button 
              onClick={() => {
                onClose();
                onCheckout();
              }}
              className="w-full bg-black text-white py-4 font-bold uppercase tracking-widest hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2"
            >
              Checkout <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const ShoppingBagIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
    <path d="M3 6h18"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
)
