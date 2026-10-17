/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import { openRazorpayCheckout } from './utils/razorpayCheckout';
import {
  User,
  UserRole,
  Chef,
  Booking,
  BookingStatus,
  CateringInquiry,
  JobPosting,
  JobApplication,
  B2BShiftRequest,
  CityInfo,
  CityArea,
  SosAlertInfo,
  EmergencyEscalationTicket,
  AutomatedDisputeResolution,
} from './types';
import {
  BANGALORE_AREAS,
} from './data/mockData';
import { INDIAN_CITIES, findCityById } from './data/indianCities';
import { Header } from './components/common/Header';
import { AuthModal } from './components/common/AuthModal';
import { PaymentModal } from './components/common/PaymentModal';
import { NotificationDrawer, AppNotification } from './components/common/NotificationDrawer';
import { CustomerHome } from './components/customer/CustomerHome';
import { HomeServicesView } from './components/customer/HomeServicesView';
import { OnDemandChefFlow } from './components/customer/OnDemandChefFlow';
import { CateringView } from './components/customer/CateringView';
import { B2BHireChefView } from './components/customer/B2BHireChefView';
import { ActiveBookingModal } from './components/customer/ActiveBookingModal';
import { ChefAppView } from './components/chef/ChefAppView';
import { ArchitectureView } from './components/architecture/ArchitectureView';
import { FoundersView } from './components/founders/FoundersView';
import { AboutView } from './components/about/AboutView';
import { AdminPortalView } from './components/admin/AdminPortalView';
import { SurgeTriggerType, calculateSurgePricing } from './utils/surgePricing';
import { VerificationSimulatorModal } from './components/common/VerificationSimulatorModal';
import { CitySelectorModal } from './components/common/CitySelectorModal';
import { VerificationSimResult } from './utils/verificationEngine';
import { playAlertChime } from './utils/sound';
import { PWAInstallButton } from './components/common/PWAInstallButton';
import { OfflineIndicator } from './components/common/OfflineIndicator';

export default function App() {
  // Top-Level View State: 'customer' | 'chef' | 'admin' | 'architecture' | 'about' | 'founders'
  const [roleView, setRoleView] = useState<'customer' | 'chef' | 'admin' | 'architecture' | 'founders' | 'about'>('customer');
  const [currentSurge, setCurrentSurge] = useState<SurgeTriggerType>('normal');

  // Customer Journey State: null (shows 3 distinct cards) | 'home_services' | 'catering' | 'b2b_hire'
  const [customerOption, setCustomerOption] = useState<'home_services' | 'catering' | 'b2b_hire' | null>(null);

  // Pan-India City & Locality State
  const [selectedCity, setSelectedCity] = useState<CityInfo>(INDIAN_CITIES[0]); // Default Bengaluru
  const [selectedArea, setSelectedArea] = useState<CityArea>(INDIAN_CITIES[0].areas[0]); // Indiranagar
  const [showCitySelectorModal, setShowCitySelectorModal] = useState<boolean>(false);

  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Backend Foundation Synchronization
  useEffect(() => {
    // 1. Sync current user session with backend
    api.getMe().then((res) => {
      if (res.success && res.data?.user) {
        const u = res.data.user;
        setCurrentUser({
          id: u.id,
          name: u.name,
          phone: u.phone,
          email: u.email,
          role: u.role,
          avatar: u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          verified: Boolean(u.verified),
          cityId: u.cityId || INDIAN_CITIES[0].id,
          cityName: u.cityName || INDIAN_CITIES[0].name,
          address: u.address || `${area.name}, ${city.name}`,
          location: {
            lat: INDIAN_CITIES[0].areas[0].lat,
            lng: INDIAN_CITIES[0].areas[0].lng,
            area: INDIAN_CITIES[0].areas[0].name,
          },
        });
      }
    }).catch(() => {});

    // 2. Load the real chef directory from the backend. No client-side demo chefs are used.
    api.getChefs(INDIAN_CITIES[0].id).then((res) => {
      if (res.success && Array.isArray(res.data?.chefs)) {
        setChefs(res.data.chefs);
      }
    }).catch(() => {});

    // 3. Sync active bookings from backend database
    api.getBookings().then((res) => {
      if (res.success && res.data?.bookings && res.data.bookings.length > 0) {
        const latest = res.data.bookings[0];
        const activeStatuses = ['requested', 'pending_payment', 'paid', 'accepted', 'en_route', 'chef_en_route', 'arrived', 'chef_arrived', 'in_progress', 'otp_verified', 'service_started'];
        if (activeStatuses.includes(latest.status)) {
          setActiveBooking({
            id: latest.id,
            type: latest.type,
            customerId: latest.customer_id,
            customerName: latest.customer_name || 'Customer',
            customerPhone: latest.customer_phone || '+91 98450 91234',
            chefId: latest.chef_id,
            chefName: latest.chef_name || 'Chef',
            chefAvatar: latest.chef_avatar || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80',
            serviceAddress: latest.service_address,
            area: latest.area,
            lat: latest.lat,
            lng: latest.lng,
            scheduledTime: latest.scheduled_time,
            cuisines: typeof latest.cuisines === 'string' ? JSON.parse(latest.cuisines) : (latest.cuisines || []),
            dishesRequested: latest.dishes_requested,
            specialInstructions: latest.special_instructions,
            totalAmount: latest.total_amount,
            platformFee: latest.platform_fee,
            gstAmount: latest.gst_amount,
            status: latest.status,
            otp: latest.otp_code,
            paymentStatus: latest.payment_status,
            createdAt: latest.created_at,
            etaMinutes: latest.eta_minutes,
          });
        }
      }
    }).catch(() => {});
  }, []);

  // V19: keep the active on-demand booking synchronized so the customer and chef views
  // see the same server-authoritative request/acceptance state without manual refresh.
  useEffect(() => {
    if (!currentUser) return;
    const sync = async () => {
      const res = await api.getBookings();
      const latest = res.data?.bookings?.[0];
      if (!res.success || !latest) return;
      const activeStatuses = ['requested','pending_payment','paid','accepted','en_route','chef_en_route','arrived','chef_arrived','in_progress','otp_verified','service_started'];
      if (!activeStatuses.includes(latest.status)) return;
      setActiveBooking((prev) => ({
        id: latest.id, type: latest.type, customerId: latest.customer_id, customerName: latest.customer_name || currentUser.name,
        customerPhone: latest.customer_phone || currentUser.phone, chefId: latest.chef_id, chefName: latest.chef_name || 'Chef',
        chefAvatar: latest.chef_avatar || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80',
        serviceAddress: latest.service_address, area: latest.area, lat: latest.lat, lng: latest.lng, scheduledTime: latest.scheduled_time,
        cuisines: typeof latest.cuisines === 'string' ? JSON.parse(latest.cuisines) : (latest.cuisines || []), dishesRequested: latest.dishes_requested,
        specialInstructions: latest.special_instructions, totalAmount: latest.total_amount, platformFee: latest.platform_fee, gstAmount: latest.gst_amount,
        status: latest.status, otp: latest.otp_code, paymentStatus: latest.payment_status, createdAt: latest.created_at, etaMinutes: latest.eta_minutes,
      }));
    };
    sync();
    const timer = window.setInterval(sync, 4000);
    return () => window.clearInterval(timer);
  }, [currentUser?.id]);

  // Handler: Change City & Neighborhood anywhere across India
  const handleSelectCityAndArea = (city: CityInfo, area: CityArea) => {
    setSelectedCity(city);
    setSelectedArea(area);
    api.getChefs(city.id).then((res) => {
      setChefs(res.success && Array.isArray(res.data?.chefs) ? res.data.chefs : []);
    }).catch(() => setChefs([]));
    setCurrentUser((prev) =>
      prev
        ? {
            ...prev,
            cityId: city.id,
            cityName: city.name,
            address: `${area.label}, ${city.name}`,
            location: {
              lat: area.lat,
              lng: area.lng,
              area: area.name,
            },
          }
        : null
    );
  };

  const handleQuickSwitchCity = (cityId: string) => {
    const targetCity = findCityById(cityId);
    handleSelectCityAndArea(targetCity, targetCity.areas[0]);
  };

  // Data Collections
  const [chefs, setChefs] = useState<Chef[]>([]);
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [cateringInquiries, setCateringInquiries] = useState<CateringInquiry[]>([]);

  // Active Booking & Modals
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [showActiveBookingModal, setShowActiveBookingModal] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authModalRole, setAuthModalRole] = useState<UserRole>('customer');
  const [authModalMode, setAuthModalMode] = useState<'signup' | 'login'>('signup');
  const [showNotificationsDrawer, setShowNotificationsDrawer] = useState<boolean>(false);

  const handleOpenAuth = (targetRole: UserRole = 'customer', mode: 'signup' | 'login' = 'signup') => {
    setAuthModalRole(targetRole);
    setAuthModalMode(mode);
    setShowAuthModal(true);
  };

  const handleLoginSuccess = (user: User, newChefProfile?: Chef) => {
    setCurrentUser(user);
    if (newChefProfile) {
      setChefs((prev) => [newChefProfile, ...prev]);
      addNotification(
        `Welcome, ${newChefProfile.name}! 👨‍🍳`,
        `Your kitchen profile is live in ${newChefProfile.currentLocation.area}. What you cook best (${newChefProfile.signatureDishes.slice(0, 2).join(', ')}) is now featured on the radar!`,
        'chef'
      );
      setRoleView('chef');
    } else if (user.role === 'chef') {
      setRoleView('chef');
      addNotification(
        `Welcome back, ${user.name}! 👨‍🍳`,
        `Logged in to ChefPulse Partner Portal. Ready to accept shifts and private bookings.`,
        'chef'
      );
    } else {
      if (user.cityId && user.cityId !== selectedCity.id) {
        const targetCity = findCityById(user.cityId);
        if (targetCity) {
          const targetArea =
            targetCity.areas.find((a) => a.name === user.location?.area) || targetCity.areas[0];
          handleSelectCityAndArea(targetCity, targetArea);
        }
      }
      addNotification(
        `Welcome, ${user.name}! 🍽️`,
        `Customer profile active for ${user.location.area}. Chef partners are available in your selected area.`,
        'chef'
      );
    }
  };


  // Payment Modal Trigger State
  const [pendingPayment, setPendingPayment] = useState<{
    isOpen: boolean;
    title: string;
    amount: number;
    onSuccess: () => void;
  } | null>(null);

  // Government Background Verification Simulator State
  const [showVerificationSimulator, setShowVerificationSimulator] = useState<boolean>(false);
  const [simulatorInitialChefId, setSimulatorInitialChefId] = useState<string>('chef-01');

  // Handler: Update Chef Verification from Government Simulation
  const handleUpdateChefVerification = (chefId: string, result: VerificationSimResult) => {
    setChefs((prevChefs) =>
      prevChefs.map((c) => {
        if (c.id === chefId) {
          return {
            ...c,
            policeVerified: result.status === 'verified',
            hygieneCertified: result.status !== 'rejected',
            verificationReport: result.report,
          };
        }
        return c;
      })
    );

    // Push real-time push notification into app feed
    const statusLabel =
      result.status === 'verified'
        ? 'Cleared 100%'
        : result.status === 'flagged'
        ? 'Audit Flagged'
        : 'In Review';
    addNotification(
      `Gov Audit: ${result.chefName} [${statusLabel}]`,
      `Verification workflow updated. No government result is claimed until an approved provider returns a real result.`,
      'chef'
    );
  };

  // 24/7 AI Support Chatbot & Safety Sentinel State
  const [emergencyTickets, setEmergencyTickets] = useState<EmergencyEscalationTicket[]>([
    {
      id: 'EMERG-9021',
      reason: 'Safety keyword alert: "host aggressive threat in kitchen"',
      userType: 'chef',
      userName: 'Chef Suresh Rao',
      userPhone: '+91 98451 44521',
      details: 'Chef triggered safety keyword escalation during on-demand booking. Location locked at Koramangala 5th Block.',
      timestamp: '12 mins ago',
      status: 'DISPATCHED',
      severity: 'CRITICAL_LEVEL_1',
      location: 'Koramangala 5th Block, Bengaluru',
      flaggedKeywords: ['threat', 'aggressive'],
      actionTaken: 'High-priority SMS & automated call dispatched to local operations supervisor.',
    },
    {
      id: 'EMERG-8410',
      reason: 'Safety keyword alert: "gas leak smell hazard near stove"',
      userType: 'customer',
      userName: 'Rahul & Tanya Verma',
      userPhone: '+91 98450 91234',
      details: 'Customer reported strong gas hazard. Chef instructed to isolate main pipeline cylinder.',
      timestamp: '45 mins ago',
      status: 'MONITORING',
      severity: 'HIGH',
      location: `${selectedArea.name}, ${selectedCity.name}`,
      flaggedKeywords: ['gas leak', 'hazard'],
      actionTaken: 'Emergency checklist sent + Bangalore Gas Safety hotline bridged.',
    },
  ]);

  const [automatedDisputes, setAutomatedDisputes] = useState<AutomatedDisputeResolution[]>([
    {
      id: 'DISP-LATE-1092',
      type: 'delay_credit',
      userRole: 'customer',
      userName: 'Rahul & Tanya Verma',
      amount: 150,
      reason: 'SLA Delay Guarantee: Transit exceeded 20m window',
      timestamp: '25 mins ago',
      status: 'CREDITED',
    },
    {
      id: 'DISP-NAV-7714',
      type: 'navigation_assistance',
      userRole: 'chef',
      userName: 'Chef',
      reason: 'Exact landmark pin sent + SMS buzzer to customer gate',
      timestamp: '40 mins ago',
      status: 'PROCESSED',
    },
  ]);

  // Handlers for AI Support Chatbot
  const handleCreditUserWallet = (amount: number, reason: string) => {
    playAlertChime('accepted');
    addNotification(
      `Wallet Credited: +₹${amount}`,
      `24/7 AI Resolution Bot credited ₹${amount} to your wallet (${reason}).`,
      'booking'
    );
  };

  const handleInitiateRefund = (amount: number, reason: string) => {
    playAlertChime('accepted');
    if (activeBooking) {
      setActiveBooking(null);
      setShowActiveBookingModal(false);
    }
    addNotification(
      `100% Escrow Refund: ₹${amount}`,
      `AI Dispute Engine processed instant refund to your payment source (${reason}).`,
      'booking'
    );
  };

  const handleRecordDispute = (dispute: AutomatedDisputeResolution) => {
    setAutomatedDisputes((prev) => [dispute, ...prev]);
  };

  const handleTriggerEmergencyEscalation = (ticket: EmergencyEscalationTicket) => {
    setEmergencyTickets((prev) => [ticket, ...prev]);
    playAlertChime('sos_panic');

    // Also update active booking sos status if exists
    if (activeBooking) {
      setActiveBooking((prev) =>
        prev
          ? {
              ...prev,
              sosAlert: {
                active: true,
                ticketId: ticket.id,
                triggeredAt: ticket.timestamp,
                triggeredBy: ticket.userName,
                reason: ticket.reason,
                supportStatus: 'ESCALATED_DISPATCH',
                supportAgent: 'ChefPulse Safety Operations',
                supportPhone: '+91 80 6900 9112',
                chefNotified: true,
                chefNotificationTime: ticket.timestamp,
                actionTaken: ticket.details,
              },
            }
          : null
      );
    }

    addNotification(
      `🚨 CRITICAL SAFETY ALARM: Ticket #${ticket.id}`,
      `Safety Sentinel detected: "${ticket.reason}". Escalated to Admin Command Desk immediately.`,
      'emergency'
    );
  };

  const handleResolveEmergencyTicket = (ticketId: string) => {
    setEmergencyTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? { ...t, status: 'RESOLVED', actionTaken: 'Admin marked situation resolved and verified safe.' }
          : t
      )
    );
    if (activeBooking && activeBooking.sosAlert?.ticketId === ticketId) {
      handleResolveSosAlert(activeBooking.id);
    }
    addNotification(
      `Emergency Ticket #${ticketId} Resolved`,
      `Safety operations marked the incident safe and closed the intervention alert.`,
      'chef'
    );
  };

  const handleDispatchSafetyUnit = (ticketId: string) => {
    playAlertChime('incoming_gig');
    setEmergencyTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status: 'MONITORING',
              actionTaken: 'Bangalore Rapid Field Safety Patrol Unit dispatched to coordinates.',
            }
          : t
      )
    );
    addNotification(
      `Field Rapid Response Dispatched`,
      `Safety escalation recorded for incident #${ticketId}. Follow the in-app safety instructions and contact local emergency services when there is immediate danger.`,
      'emergency'
    );
  };

  // Notifications Feed
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const addNotification = (title: string, message: string, type: AppNotification['type']) => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      time: 'Just now',
      type,
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Handler: Customer Requests SOS or Meal Prep Booking
  const handleRequestBooking = (bookingData: {
    chef: Chef;
    type: 'sos_quick_fix' | 'scheduled_prep';
    dishes: string;
    specialInstructions: string;
    scheduledDate?: string;
  }) => {
    const rate = bookingData.type === 'sos_quick_fix' ? bookingData.chef.sosRate : bookingData.chef.dayPrepRate;
    
    // Server-Authoritative Booking Creation
    api.createBooking({
      chefId: bookingData.chef.id,
      type: bookingData.type,
      dishesRequested: bookingData.dishes,
      specialInstructions: bookingData.specialInstructions,
      serviceAddress: currentUser?.address || `${selectedArea.name}, Bengaluru`,
      area: selectedArea.name,
      lat: selectedArea.lat,
      lng: selectedArea.lng,
      surgeCondition: currentSurge,
    }).then((serverRes) => {
      if (!serverRes.success || !serverRes.data?.booking) {
        addNotification(
          'Booking Failed',
          serverRes.error?.message || 'Server was unable to create the booking. Please check connection and retry.',
          'system'
        );
        return;
      }

      const serverBooking = serverRes.data.booking;
      const activeId = serverBooking.id;
      const activeOtp = serverBooking.otp_code;
      const activeTotal = serverBooking.total_amount;

      // Open Payment Escrow Modal
      setPendingPayment({
        isOpen: true,
        title: `${bookingData.type === 'sos_quick_fix' ? 'SOS Quick-Fix' : 'Meal Prep'}: ${bookingData.chef.name}`,
        amount: activeTotal,
        onSuccess: async () => {
          // Authoritatively create payment intent on backend
          const intentRes = await api.createPaymentIntent(activeId, 'upi');
          if (!intentRes.success || !intentRes.data?.payment) {
            throw new Error(intentRes.error?.message || 'Payment intent creation failed.');
          }

          const payment = intentRes.data.payment;
          if (payment.provider === 'razorpay') {
            await openRazorpayCheckout(
              {
                id: payment.id,
                amountPaise: payment.amountPaise,
                currency: payment.currency,
                providerOrderId: payment.providerOrderId,
                providerKeyId: payment.providerKeyId,
                bookingId: activeId,
                name: currentUser?.name,
                email: currentUser?.email,
                phone: currentUser?.phone,
              },
              async ({ paymentId, signature }) => {
                const confirmRes = await api.confirmPayment(
                  payment.id,
                  payment.transactionRef,
                  signature,
                  undefined,
                  paymentId,
                );
                if (!confirmRes.success) {
                  throw new Error(confirmRes.error?.message || 'Payment confirmation failed on server.');
                }
              }
            );
          } else {
            // Development-only payment simulation. Production config blocks this provider.
            const confirmRes = await api.confirmPayment(payment.id, payment.transactionRef);
            if (!confirmRes.success) {
              throw new Error(confirmRes.error?.message || 'Payment confirmation failed on server.');
            }
          }

          const newBooking: Booking = {
            id: activeId,
            type: bookingData.type,
            customerId: currentUser?.id || 'cust-1',
            customerName: currentUser?.name || 'Customer',
            customerPhone: currentUser?.phone || '+91 98450 91234',
            chefId: bookingData.chef.id,
            chefName: bookingData.chef.name,
            chefAvatar: bookingData.chef.avatar,
            serviceAddress: currentUser?.address || `${selectedArea.name}, Bengaluru`,
            area: selectedArea.name,
            lat: selectedArea.lat,
            lng: selectedArea.lng,
            scheduledTime: bookingData.scheduledDate || 'Immediate',
            cuisines: bookingData.chef.specialties,
            dishesRequested: bookingData.dishes,
            specialInstructions: bookingData.specialInstructions,
            totalAmount: activeTotal,
            platformFee: 49,
            gstAmount: Math.round((rate + 49) * 0.18),
            status: 'pending_acceptance',
            otp: activeOtp,
            paymentStatus: 'paid',
            createdAt: new Date().toISOString(),
            etaMinutes: Math.round(bookingData.chef.distanceKm * 7 + 6),
          };

          setActiveBooking(newBooking);
          setShowActiveBookingModal(true);
          playAlertChime('incoming_gig');

          addNotification(
            `SOS Request Dispatched to ${bookingData.chef.name}`,
            `Payment of ₹${activeTotal} held in Escrow. Broadcast sent with 30s accept timer. Arrival OTP: ${activeOtp}`,
            'booking'
          );
        },
      });
    }).catch((err: any) => {
      addNotification(
        err?.message || 'Booking could not be created',
        err?.message || 'Please check your connection and try again. No payment was processed.',
        'system'
      );
    });
  };

  // Handler: Update Booking Status
  const handleUpdateBookingStatus = (bookingId: string, newStatus: BookingStatus) => {
    if (!activeBooking || activeBooking.id !== bookingId) return;

    // Authoritative backend transition
    api.updateBookingStatus(bookingId, newStatus).catch(() => {});

    setActiveBooking(prev => prev ? { ...prev, status: newStatus } : null);

    if (newStatus === 'accepted') {
      playAlertChime('accepted');
      addNotification(
        'Chef Accepted Your Booking!',
        `${activeBooking.chefName} has confirmed and is prepping knife kit.`,
        'booking'
      );
    } else if (newStatus === 'en_route') {
      playAlertChime('ding');
      addNotification(
        'Chef is En Route!',
        `${activeBooking.chefName} is traveling to ${activeBooking.area}. ETA: 14 mins.`,
        'booking'
      );
    } else if (newStatus === 'arrived') {
      playAlertChime('ding');
      addNotification(
        'Chef Arrived at Doorstep!',
        `Please share 4-digit OTP: ${activeBooking.otp} with ${activeBooking.chefName}.`,
        'booking'
      );
    } else if (newStatus === 'in_progress') {
      playAlertChime('accepted');
      addNotification(
        'Cooking Started in Kitchen!',
        `${activeBooking.chefName} has verified OTP and started meal preparation.`,
        'booking'
      );
    } else if (newStatus === 'completed') {
      playAlertChime('completed');

      addNotification(
        'Meal Ready & Service Complete!',
        'Service finished successfully. Thanks for using ChefPulse.',
        'booking'
      );
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!activeBooking || activeBooking.id !== bookingId) return;
    const result = await api.cancelBooking(bookingId, 'Cancelled by customer');
    if (!result.success) {
      addNotification('Cancellation failed', result.error?.message || 'We could not cancel this booking. Please try again.', 'system');
      return;
    }
    setActiveBooking(null);
    setShowActiveBookingModal(false);
    addNotification('Booking cancelled', 'Your booking was cancelled. Any applicable refund is being handled by ChefPulse.', 'booking');
  };

  // Handler: Customer triggers SOS Panic from active booking
  const handleTriggerSosPanic = (bookingId: string, reason: string) => {
    if (!activeBooking || activeBooking.id !== bookingId) return;

    const ticketId = `SOS-${Math.floor(10000 + Math.random() * 90000)}`;
    const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const sosInfo: SosAlertInfo = {
      active: true,
      ticketId,
      triggeredAt: nowTime,
      triggeredBy: currentUser?.name || 'Customer',
      reason: reason || 'Immediate Customer Safety & Platform Escalation',
      supportStatus: 'ESCALATED_DISPATCH',
      supportAgent: 'Priya N. (Platform Safety Operations Lead)',
      supportPhone: '+91 80 6900 9112',
      chefNotified: true,
      chefNotificationTime: nowTime,
      actionTaken: '24/7 Safety Desk monitoring initiated. Audio check-in bridge and live GPS location locked.',
    };

    setActiveBooking((prev) => (prev ? { ...prev, sosAlert: sosInfo } : null));
    playAlertChime('sos_panic');

    // High-priority push notification for customer & support log
    addNotification(
      `🚨 SOS Panic Activated: Ticket #${ticketId}`,
      `SOS event recorded for ${activeBooking.area}. The assigned chef was notified in-app when available.`,
      'emergency'
    );

    // High-priority push notification specifically addressed to the assigned chef
    addNotification(
      `🚨 HIGH-PRIORITY CHEF ALERT: SOS at ${activeBooking.area}`,
      `Customer ${activeBooking.customerName} triggered emergency panic (${reason}). Safety team is monitoring. Check in immediately.`,
      'emergency'
    );
  };

  // Handler: Resolve SOS alert
  const handleResolveSosAlert = (bookingId: string) => {
    if (!activeBooking || activeBooking.id !== bookingId) return;

    setActiveBooking((prev) => {
      if (!prev || !prev.sosAlert) return prev;
      return {
        ...prev,
        sosAlert: {
          ...prev.sosAlert,
          active: false,
          supportStatus: 'RESOLVED',
          actionTaken: 'Customer marked situation safe. De-escalation confirmed.',
        },
      };
    });

    addNotification(
      'SOS Emergency Alert Resolved',
      `Emergency incident #${activeBooking.sosAlert?.ticketId || ''} marked safe by customer. Support desk stands down.`,
      'booking'
    );
  };

  // Handler: Chef Provider Status Toggle (Requirement 2)
  const handleUpdateChefStatus = async (isOnline: boolean) => {
    const chefId = currentUser?.chefProfileId || chefs.find((c) => c.userId === currentUser?.id)?.id;
    if (!chefId) {
      addNotification('Chef profile unavailable', 'Please sign in as a chef before changing availability.', 'system');
      return;
    }
    const result = await api.updateChefStatus(chefId, isOnline, isOnline ? 'available' : 'offline');
    if (!result.success) {
      addNotification('Could not update availability', result.error?.message || 'Please try again.', 'system');
      return;
    }
    setChefs(prev => prev.map(c => c.id === chefId ? { ...c, isOnline, status: isOnline ? 'available' : 'offline' } : c));
    addNotification(isOnline ? 'You are online' : 'You are offline', isOnline ? 'Customers can now see you as available.' : 'You will not receive new bookings while offline.', 'chef');
  };

  // Chef Accepts or Rejects Booking
  const handleChefAcceptIncoming = (bookingId: string) => {
    handleUpdateBookingStatus(bookingId, 'accepted');
  };

  const handleChefRejectIncoming = (bookingId: string) => {
    if (activeBooking && activeBooking.id === bookingId) {
      setActiveBooking(null);
      addNotification('Gig Declined', 'The booking was rejected by the provider.', 'chef');
    }
  };

  // Handler: Catering Inquiry
  const handleSubmitCateringInquiry = (inquiry: CateringInquiry) => {
    setCateringInquiries(prev => [inquiry, ...prev]);
    addNotification(
      'Catering Proposal Request Logged',
      `Proposal #${inquiry.id} created for ${inquiry.guestCount} guests on ${inquiry.eventDate}.`,
      'catering'
    );
  };

  // Handler: B2B Shift Request
  const handleRequestB2BShift = (shift: B2BShiftRequest) => {
    setPendingPayment({
      isOpen: true,
      title: `B2B Shift Escrow: ${shift.roleNeeded} at ${shift.restaurantName}`,
      amount: shift.totalPayout,
      onSuccess: () => {
        playAlertChime('incoming_gig');
        addNotification(
          `B2B Emergency Shift Dispatched`,
          `Broadcasted ${shift.roleNeeded} requirement for ${shift.restaurantName} to all cooks in ${shift.area}.`,
          'b2b'
        );
      },
    });
  };

  // Handler: B2B Job Post & Chef Apply
  const handlePostJob = (job: JobPosting) => {
    setJobPostings(prev => [job, ...prev]);
    addNotification(
      'New Vacancy Published',
      `${job.title} at ${job.restaurantName} is now live on the Chef Job Portal.`,
      'b2b'
    );
  };

  const handleApplyForJob = (application: JobApplication) => {
    setJobApplications(prev => [application, ...prev]);
    playAlertChime('accepted');
    addNotification(
      'Application Submitted!',
      `Application sent for ${application.jobTitle} at ${application.restaurantName}.`,
      'b2b'
    );
  };

  const activeChefsCount = chefs.filter(c => c.isOnline).length;
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      
      {/* Universal Sticky Header */}
      <Header
        currentRoleView={roleView}
        onSelectRoleView={(view) => {
          setRoleView(view);
          if (view === 'customer' && customerOption !== null) {
            // Keep customer subflow or allow back
          }
        }}
        currentUser={currentUser}
        onOpenAuth={() => handleOpenAuth('customer', 'login')}
        onOpenChefSignup={() => handleOpenAuth('chef', 'signup')}
        onLogout={() => {
          setCurrentUser(null);
          addNotification('Signed Out', 'You have safely signed out of your account.', 'chef');
        }}
        selectedCity={selectedCity}
        selectedArea={selectedArea}
        onSelectArea={(area) => handleSelectCityAndArea(selectedCity, area)}
        onOpenCitySelector={() => setShowCitySelectorModal(true)}
        activeBooking={activeBooking}
        onOpenActiveBooking={() => setShowActiveBookingModal(true)}
        unreadCount={unreadCount}
        onOpenNotifications={() => setShowNotificationsDrawer(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        
        {/* VIEW 1: CUSTOMER APP */}
        {roleView === 'customer' && (
          <div>
            {/* If no sub-option selected: Show Home Screen with EXACTLY THREE main cards */}
            {customerOption === null && (
              <div className="-mx-4 -mt-6 px-4 pt-6 sm:-mx-6 sm:px-6 bg-slate-50 min-h-[calc(100vh-80px)]">
              <CustomerHome
                onSelectOption={(opt) => setCustomerOption(opt)}
                activeChefsCount={activeChefsCount}
                selectedCity={selectedCity}
                selectedAreaName={selectedArea.label}
                onOpenAuth={() => handleOpenAuth('customer', 'login')}
                onOpenActiveBooking={() => {
                  if (activeBooking) setShowActiveBookingModal(true);
                  else addNotification('No active booking', 'Your current bookings will appear here after you make a booking.', 'booking');
                }}
              />
              </div>
            )}

            {/* OPTION 1: Home Services (On-Demand & Daily Prep) */}
            {customerOption === 'home_services' && (
              <OnDemandChefFlow
                chefs={chefs}
                selectedAreaName={selectedArea.label}
                selectedCityName={selectedCity.name}
                currentUser={currentUser}
                onOpenAuth={() => handleOpenAuth('customer', 'signup')}
                onBackToHome={() => setCustomerOption(null)}
              />
            )}

            {/* OPTION 2: Catering Service (Events & Luxury) */}
            {customerOption === 'catering' && (
              <CateringView
                currentUser={currentUser}
                onOpenAuth={() => handleOpenAuth('customer', 'signup')}
                onSubmitInquiry={handleSubmitCateringInquiry}
                inquiries={cateringInquiries}
                onBackToHome={() => setCustomerOption(null)}
              />
            )}

            {/* OPTION 3: Hire Chef (B2B for Hotels & Restaurants) */}
            {customerOption === 'b2b_hire' && (
              <B2BHireChefView
                chefs={chefs}
                userLocation={{
                  lat: selectedArea.lat,
                  lng: selectedArea.lng,
                  area: selectedArea.name,
                }}
                jobPostings={jobPostings}
                jobApplications={jobApplications}
                currentUser={currentUser}
                onOpenAuth={() => handleOpenAuth('customer', 'signup')}
                onPostJob={handlePostJob}
                onRequestB2BShift={handleRequestB2BShift}
                onBackToHome={() => setCustomerOption(null)}
                onOpenVerificationSimulator={import.meta.env.PROD ? undefined : () => {
                  setSimulatorInitialChefId(chefs[0]?.id || '');
                  setShowVerificationSimulator(true);
                }}
              />
            )}
          </div>
        )}

        {/* VIEW 2: CHEF APP (PROVIDER SIDE) */}
        {roleView === 'chef' && (
          <ChefAppView
            chef={
              (currentUser?.role === 'chef' &&
                chefs.find(
                  (c) => c.id === currentUser.chefProfileId || c.phone === currentUser.phone
                )) ||
              chefs[0]
            }
            onUpdateChefStatus={handleUpdateChefStatus}
            activeBooking={activeBooking}
            onAcceptIncomingBooking={handleChefAcceptIncoming}
            onRejectIncomingBooking={handleChefRejectIncoming}
            onAdvanceBookingStatus={handleUpdateBookingStatus}
            jobPostings={jobPostings}
            onApplyForJob={handleApplyForJob}
            currentUser={currentUser}
            onOpenAuth={() => handleOpenAuth('chef', 'signup')}
            onOpenVerificationSimulator={import.meta.env.PROD ? undefined : () => {
              setSimulatorInitialChefId(chefs[0]?.id || '');
              setShowVerificationSimulator(true);
            }}
            onUpdateChefVerification={handleUpdateChefVerification}
          />
        )}

        {/* VIEW 3: ADMIN & BACKEND SYSTEM (Escrow Payments, God Mode, User Mgmt & Surge Engine) */}
        {roleView === 'admin' && (
          <AdminPortalView
            chefs={chefs}
            activeBooking={activeBooking}
            currentSurge={currentSurge}
            onUpdateSurge={(surge) => {
              setCurrentSurge(surge);
              addNotification(
                `Dynamic Surge Updated: ${surge.toUpperCase()}`,
                `Radius pricing factor set to ${surge}. Hyper-local chef payouts adjusted.`,
                'b2b'
              );
            }}
            jobPostings={jobPostings}
            cateringInquiries={cateringInquiries}
            onApproveJobPosting={(jobId) => {
              setJobPostings((prev) =>
                prev.map((j) => (j.id === jobId ? { ...j, status: 'approved' } : j))
              );
              addNotification(
                'B2B Vacancy Approved & Published',
                'Restaurant permanent position is now live on the Chef App job portal.',
                'b2b'
              );
            }}
            onRejectJobPosting={(jobId) => {
              setJobPostings((prev) =>
                prev.map((j) => (j.id === jobId ? { ...j, status: 'rejected' } : j))
              );
              addNotification(
                'B2B Vacancy Rejected',
                'Vacancy submission requires salary or experience clarification.',
                'b2b'
              );
            }}
            onAssignCateringCrew={(inquiryId, crewName) => {
              setCateringInquiries((prev) =>
                prev.map((inq) =>
                  inq.id === inquiryId ? { ...inq, status: 'proposal_sent' } : inq
                )
              );
              addNotification(
                'Catering Crew Assigned 🍽️',
                `${crewName} assigned to event banquet inquiry #${inquiryId}.`,
                'booking'
              );
            }}
            onApproveChef={(chefId) => {
              addNotification(
                'Chef Application Approved! 🎉',
                `Chef profile updated. Verification status is shown only when supported by recorded checks.`,
                'chef'
              );
            }}
            onRejectChef={(chefId) => {
              addNotification(
                'Chef Vetting Audit Notice Dispatched',
                `Additional hygiene documentation requested before radar activation.`,
                'chef'
              );
            }}
            emergencyTickets={emergencyTickets}
            onResolveEmergencyTicket={handleResolveEmergencyTicket}
            onDispatchSafetyUnit={handleDispatchSafetyUnit}
            automatedDisputes={automatedDisputes}
          />
        )}

        {/* VIEW 4: SYSTEM ARCHITECTURE & SCHEMA EXPLORER */}
        {roleView === 'architecture' && (
          <ArchitectureView />
        )}

        {/* VIEW 5: ABOUT CHEFPULSE (Pan-India Network, Founders & Safety) */}
        {(roleView === 'about' || roleView === 'founders') && (
          <AboutView
            onNavigateToCustomer={(subOpt) => {
              setRoleView('customer');
              if (subOpt) setCustomerOption(subOpt);
            }}
            onNavigateToChefApp={() => setRoleView('chef')}
            selectedCity={selectedCity}
            selectedArea={selectedArea}
            onQuickSwitchCity={handleQuickSwitchCity}
            onOpenCitySelector={() => setShowCitySelectorModal(true)}
            onOpenChefSignup={() => handleOpenAuth('chef', 'signup')}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-neutral-900 bg-neutral-950/80 py-6 px-4 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-neutral-300">ChefPulse Pan-India 🇮🇳</span>
            <span>•</span>
            <span>On-Demand Chefs & Hospitality Staffing</span>
            <span>•</span>
            <button
              onClick={() => setRoleView('about')}
              className="text-amber-400 hover:text-amber-300 font-bold transition-colors cursor-pointer"
            >
              About ChefPulse (Network, Founders & Safety)
            </button>
          </div>
          <div className="flex items-center gap-2 text-neutral-400 text-[11px] text-center md:text-right">
            <span>Operating in 25+ cities: Bengaluru, Mumbai, Delhi NCR, Hyderabad, Chennai, Kolkata, Pune, Jaipur, Goa, Kochi & all across India</span>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={handleLoginSuccess}
        initialRole={authModalRole}
        initialMode={authModalMode}
        currentCity={selectedCity}
        currentArea={selectedArea}
      />

      {/* Pan-India City & Locality Selector Modal */}
      <CitySelectorModal
        isOpen={showCitySelectorModal}
        onClose={() => setShowCitySelectorModal(false)}
        selectedCity={selectedCity}
        selectedArea={selectedArea}
        onSelectCityAndArea={handleSelectCityAndArea}
      />

      {pendingPayment && (
        <PaymentModal
          isOpen={pendingPayment.isOpen}
          onClose={() => setPendingPayment(null)}
          bookingTitle={pendingPayment.title}
          amount={pendingPayment.amount}
          onPaymentSuccess={() => {
            const cb = pendingPayment.onSuccess;
            setPendingPayment(null);
            cb();
          }}
        />
      )}

      <ActiveBookingModal
        booking={activeBooking}
        onClose={() => setShowActiveBookingModal(false)}
        onUpdateStatus={handleUpdateBookingStatus}
        onCancelBooking={handleCancelBooking}
        onTriggerSosPanic={handleTriggerSosPanic}
        onResolveSosAlert={handleResolveSosAlert}
      />

      <NotificationDrawer
        isOpen={showNotificationsDrawer}
        onClose={() => setShowNotificationsDrawer(false)}
        notifications={notifications}
        onMarkAllAsRead={() => {
          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        }}
      />

      {/* 24/7 AI-Powered Support & Safety Sentinel Chatbot Modal */}
      <AIChatSupportModal
        isOpen={showAIChatModal}
        onClose={() => setShowAIChatModal(false)}
        currentUser={currentUser}
        activeRole={roleView === 'chef' ? 'chef' : 'customer'}
        activeBooking={activeBooking}
        onCreditUserWallet={handleCreditUserWallet}
        onInitiateRefund={handleInitiateRefund}
        onRecordDispute={handleRecordDispute}
        onTriggerEmergencyEscalation={handleTriggerEmergencyEscalation}
      />

      {/* Government Background Verification Simulator Modal */}
      <VerificationSimulatorModal
        isOpen={showVerificationSimulator}
        onClose={() => setShowVerificationSimulator(false)}
        chefs={chefs}
        onUpdateChefVerification={handleUpdateChefVerification}
        initialSelectedChefId={simulatorInitialChefId}
      />

      {/* Floating 24/7 AI Support & Dispute Desk Action */}
      <button
        type="button"
        onClick={() => setShowAIChatModal(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[2000] flex items-center gap-2.5 p-3 sm:px-4 sm:py-3 rounded-2xl bg-neutral-900/95 hover:bg-neutral-850 border border-amber-500/40 hover:border-amber-400 text-amber-300 font-bold text-xs shadow-2xl shadow-black/80 hover:scale-105 active:scale-95 transition-all cursor-pointer group backdrop-blur-md"
        title="24/7 AI-Powered Support Chatbot: Auto-Disputes, Refunds & Emergency Desk"
      >
        <div className="relative flex items-center justify-center">
          <Bot size={18} className="text-amber-400 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse ring-2 ring-neutral-900" />
        </div>
        <div className="text-left hidden sm:block">
          <div className="text-[10px] text-emerald-400 font-black uppercase tracking-wider leading-none">
            24/7 AI Support
          </div>
          <div className="text-white text-xs font-bold leading-tight mt-0.5">
            Disputes & Safety
          </div>
        </div>
      </button>

      {/* Network Offline Indicator */}
      <OfflineIndicator />

    </div>
  );
}
