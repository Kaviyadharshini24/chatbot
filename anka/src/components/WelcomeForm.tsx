import React, { useState } from 'react';
import type { CustomerDetails } from '../types';
import { SHOP_NAME } from '../constants';

interface WelcomeFormProps {
  onSubmit: (details: CustomerDetails) => void;
}

const WelcomeForm: React.FC<WelcomeFormProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError('Please provide both your name and contact number.');
      return;
    }
    // Basic phone validation (allow digits, spaces, dashes, plus)
    if (!/^[\d\s\-\+]+$/.test(phone)) {
        setError('Please enter a valid phone number.');
        return;
    }
    
    onSubmit({ name: name.trim(), phone: phone.trim() });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-rose-50 to-rose-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in-up">
        
        {/* Header Image / Branding */}
        <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('https://picsum.photos/800/400?grayscale')] bg-cover bg-center"></div>
          <h1 className="relative text-3xl font-serif text-white mb-2 font-bold tracking-wide">
            {SHOP_NAME}
          </h1>
          <p className="relative text-rose-200 font-sans font-light">
            Bespoke Tailoring & Design
          </p>
        </div>

        {/* Form */}
        <div className="p-8">
            <p className="text-gray-600 mb-6 text-center text-sm leading-relaxed">
                Welcome! I am Aria, your personal styling assistant. 
                Please introduce yourself so I can better assist you with quotes and measurements.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label htmlFor="name" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Your Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border-b-2 border-slate-200 focus:border-rose-500 outline-none py-2 px-1 text-slate-800 transition-colors bg-transparent placeholder-slate-300"
                        placeholder="e.g. Sarah Jones"
                        autoComplete="name"
                    />
                </div>

                <div>
                    <label htmlFor="phone" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Phone Number
                    </label>
                    <input
                        type="tel"
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full border-b-2 border-slate-200 focus:border-rose-500 outline-none py-2 px-1 text-slate-800 transition-colors bg-transparent placeholder-slate-300"
                        placeholder="e.g. +1 555 0123"
                        autoComplete="tel"
                    />
                </div>

                {error && (
                    <p className="text-red-500 text-xs italic text-center animate-pulse">{error}</p>
                )}

                <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-rose-600 text-white font-bold py-4 rounded-lg shadow-lg transition-all duration-300 transform hover:-translate-y-1 mt-4"
                >
                    Start Consultation
                </button>
            </form>
            
            <p className="text-[10px] text-slate-400 text-center mt-6">
                Your contact details are saved for appointment reference only.
            </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeForm;
