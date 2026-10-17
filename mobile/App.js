import React from 'react';
import { BookingProvider } from './BookingContext';
import AppNavigation from './AppNavigation';

export default function App() {
  return (
    <BookingProvider>
      <AppNavigation />
    </BookingProvider>
  );
}
