import React, { createContext, useContext, useMemo, useState } from 'react';

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const [selectedChef, setSelectedChef] = useState(null);
  const [selectedService, setSelectedService] = useState('');
  const [orderTotal, setOrderTotal] = useState(0);
  const [bookingStatus, setBookingStatus] = useState('requested');

  const value = useMemo(() => ({
    selectedChef,
    setSelectedChef,
    selectedService,
    setSelectedService,
    orderTotal,
    setOrderTotal,
    bookingStatus,
    setBookingStatus,
  }), [selectedChef, selectedService, orderTotal, bookingStatus]);

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used inside BookingProvider');
  }
  return context;
}
