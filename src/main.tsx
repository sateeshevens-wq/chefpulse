import React from 'react';
import { createRoot } from 'react-dom/client';
import { ReferenceCustomerFlow } from './components/customer/ReferenceCustomerFlow';
import './index.css';
import './chefPulsePolish.css';
import './components/customer/referenceCustomerFlow.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ReferenceCustomerFlow />
  </React.StrictMode>
);
