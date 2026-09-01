import React, { useState } from 'react';
import { X, Lock } from 'lucide-react';
import { useShop } from '../context/ShopContext';

interface AdminLoginProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ isOpen, onClose }) => {
  const { loginAdmin, adminUsername, adminPassword } = useShop();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === adminUsername && password === adminPassword) {
      loginAdmin();
      setError('');
      onClose();
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-md p-8 shadow-2xl rounded-sm">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-black transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-600">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-gray-900">Admin Portal</h2>
          <p className="text-gray-500 mt-2 text-sm">Sign in to manage store inventory</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-sm text-sm text-center mb-6 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              className="w-full border border-gray-300 rounded-sm p-3 focus:ring-yellow-500 focus:border-yellow-500 outline-none" 
              placeholder="Enter username" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full border border-gray-300 rounded-sm p-3 focus:ring-yellow-500 focus:border-yellow-500 outline-none" 
              placeholder="••••••" 
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-black text-white py-3 font-bold uppercase tracking-widest hover:bg-yellow-600 transition-colors mt-2"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};
