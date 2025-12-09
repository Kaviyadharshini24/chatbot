import React, { useState } from 'react';
import WelcomeForm from './components/WelcomeForm';
import ChatInterface from './components/ChatInterface';

import type { CustomerDetails } from './types';

const App: React.FC = () => {
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);

  const handleFormSubmit = (details: CustomerDetails) => {
    setCustomer(details);
    // In a real app, you might send this to a backend here
    console.log("Customer Registered:", details);
  };

  const handleLogout = () => {
    setCustomer(null);
  };
 

  return (
    <div className="w-full h-full font-sans text-slate-900">
      {!customer ? (
        <WelcomeForm onSubmit={handleFormSubmit} />
      ) : (
        <ChatInterface customer={customer} onLogout={handleLogout} />
      )}
    </div>
  );
};

export default App;
