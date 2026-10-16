import React, { useMemo, useState } from 'react';
import {
  ArrowLeft, ArrowRight, BadgeCheck, CalendarDays, Check, ChefHat, Clock3,
  CreditCard, Home, MapPin, MessageCircle, Navigation, PackageCheck, Phone,
  Search, ShieldCheck, ShoppingBasket, Star, Truck, Utensils, WalletCards,
  Zap,
} from 'lucide-react';
import { Chef, User } from '../../types';
import { getGroceryKitForDish, QUICK_COMMERCE_PLATFORMS, QuickCommercePlatformId } from '../../data/groceryCatalog';
import { api } from '../../services/api';
import { openRazorpayCheckout } from '../../utils/razorpayCheckout';

interface Props {
  chefs: Chef[];
  selectedAreaName: string;
  selectedCityName: string;
  currentUser: User | null;
  onOpenAuth: () => void;
  onBackToHome: () => void;
}

type Step =
  | 'service' | 'finding' | 'chefs' | 'request' | 'request-sent'
  | 'accepted' | 'ingredients' | 'partner' | 'grocery-review'
  | 'grocery-tracking' | 'grocery-delivered' | 'chef-tracking'
  | 'chef-arrived' | 'cooking' | 'complete';

const stepOrder: Step[] = [
  'service','finding','chefs','request','request-sent','accepted','ingredients','partner','grocery-review',
  'grocery-tracking','grocery-delivered','chef-tracking','chef-arrived','cooking','complete'
];

const foodHero = 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1400&q=85';


const RequestSentWatcher: React.FC<{ bookingId: string | null; chef: Chef; onAccepted: () => void; onError: (message: string) => void }> = ({ bookingId, chef, onAccepted, onError }) => {
  React.useEffect(() => {
    if (!bookingId) return;
    let cancelled = false;
    const poll = async () => {
      const res = await api.getBooking(bookingId);
      const booking = res.data?.booking;
      if (!cancelled && res.success && booking?.status === 'accepted') { onAccepted(); return; }
      if (!cancelled && res.success && booking?.status === 'rejected') { onError(`${chef.name} is unavailable. Please choose another chef.`); return; }
      if (!cancelled) setTimeout(poll, 2500);
    };
    poll();
    return () => { cancelled = true; };
  }, [bookingId, chef.name, onAccepted, onError]);
  return <div className="cp-centered-step"><div className="cp-radar"><div className="cp-radar-ring" /><ChefHat size={40} /></div><h2>Request sent to {chef.name}</h2><p>Waiting for your chef to accept. We'll update this screen automatically.</p><div className="cp-checklist"><span><Check size={15} /> Request delivered securely</span><span><Check size={15} /> Chef availability confirmed</span><span><Clock3 size={15} /> Waiting for acceptance</span></div></div>;
};

export const OnDemandChefFlow: React.FC<Props> = ({
  chefs,
  selectedAreaName,
  selectedCityName,
  currentUser,
  onOpenAuth,
  onBackToHome,
}) => {
  const [step, setStep] = useState<Step>('service');
  const [selectedChef, setSelectedChef] = useState<Chef | null>(null);
  const [cuisine, setCuisine] = useState('Indian');
  const [dishRequest, setDishRequest] = useState('Butter chicken, naan & a fresh salad');
  const [platform, setPlatform] = useState<QuickCommercePlatformId>('zepto');
  const [ingredientPaid, setIngredientPaid] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [groceryOrderId, setGroceryOrderId] = useState<string | null>(null);
  const [groceryPayment, setGroceryPayment] = useState<any>(null);
  const [requestError, setRequestError] = useState<string | null>(null);

  const availableChefs = useMemo(
    () => (chefs.length ? chefs : []).filter((chef) => chef.isOnline && chef.status === 'available').slice(0, 4),
    [chefs]
  );
  const fallbackChef = chefs[0] || null;
  const displayChefs = availableChefs.length ? availableChefs : fallbackChef ? [fallbackChef] : [];
  const kit = useMemo(() => getGroceryKitForDish(dishRequest), [dishRequest]);
  const groceryTotal = kit.items.filter((item) => item.essential).reduce((sum, item) => sum + item.estimatedPrice, 0);
  const selectedPartner = QUICK_COMMERCE_PLATFORMS.find((p) => p.id === platform) || QUICK_COMMERCE_PLATFORMS[0];

  const next = (nextStep: Step) => setStep(nextStep);
  const reset = () => {
    setStep('service');
    setSelectedChef(null);
    setIngredientPaid(false);
    setBookingId(null);
    setGroceryOrderId(null);
    setGroceryPayment(null);
    setRequestError(null);
  };

  const headerTitle = {
    service: 'Chef Now', finding: 'Finding chefs', chefs: 'Available chefs', request: 'Chef request', 'request-sent': 'Request sent',
    accepted: 'Chef accepted', ingredients: 'Ingredients from your chef', partner: 'Choose grocery delivery',
    'grocery-review': 'Review ingredients', 'grocery-tracking': 'Ingredients on the way',
    'grocery-delivered': 'Groceries delivered', 'chef-tracking': 'Track your chef',
    'chef-arrived': 'Chef arrived', cooking: 'Cooking in progress', complete: 'Service completed',
  }[step];

  const chefRate = selectedChef?.sosRate || selectedChef?.hourlyRate || 850;
  const serviceFee = Math.round(chefRate * 0.05);
  const chefTotal = chefRate + serviceFee;

  return (
    <div className="cp-flow min-h-[calc(100vh-80px)] pb-24">
      <div className="cp-flow-topbar">
        <button type="button" onClick={step === 'service' ? onBackToHome : () => reset()} className="cp-icon-btn" aria-label="Back">
          <ArrowLeft size={19} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-bold text-emerald-700">ChefPulse</div>
          <div className="text-sm font-extrabold text-slate-900 truncate">{headerTitle}</div>
        </div>
        <div className="cp-location-pill"><MapPin size={13} /> {selectedAreaName}</div>
      </div>

      <div className="cp-flow-content">
        {requestError && <div className="cp-info-banner mt-3" role="alert"><ShieldCheck size={18} /><span><strong>We couldn't continue</strong><small>{requestError}</small></span></div>}
        {step === 'service' && (
          <>
            <section className="cp-hero-card">
              <img src={foodHero} alt="Fresh home-cooked food" />
              <div className="cp-hero-overlay" />
              <div className="cp-hero-content">
                <span className="cp-badge"><Zap size={12} fill="currentColor" /> On-demand chef</span>
                <h1>Your personal chef,<br />just a tap away.</h1>
                <p>ChefPulse finds an available chef near your home and coordinates the ingredients too.</p>
              </div>
            </section>

            <section className="mt-5">
              <div className="cp-section-title">What do you need today?</div>
              <button type="button" className="cp-choice-card cp-choice-active" onClick={() => next('finding')}>
                <span className="cp-choice-icon"><ChefHat size={23} /></span>
                <span className="flex-1 text-left"><strong>Chef Now</strong><small>Get a chef at your home</small></span>
                <ArrowRight size={18} />
              </button>
              <div className="grid grid-cols-3 gap-2.5 mt-3">
                {['Indian','South Indian','Chinese'].map((item) => (
                  <button key={item} type="button" onClick={() => setCuisine(item)} className={`cp-cuisine ${cuisine === item ? 'selected' : ''}`}>
                    <Utensils size={18} /><span>{item}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="cp-request-card mt-4">
              <div className="flex items-center gap-2"><CalendarDays size={17} className="text-emerald-700" /><strong>Tell your chef what to cook</strong></div>
              <textarea value={dishRequest} onChange={(e) => setDishRequest(e.target.value)} className="cp-textarea" rows={3} />
              <div className="flex items-center gap-2 text-[11px] text-slate-500"><Home size={14} /> {selectedAreaName}, {selectedCityName}</div>
              <button type="button" onClick={() => next('finding')} className="cp-primary mt-3">Find my chef <ArrowRight size={17} /></button>
            </section>
          </>
        )}

        {step === 'finding' && (
          <div className="cp-centered-step">
            <div className="cp-radar"><div className="cp-radar-ring" /><ChefHat size={40} /></div>
            <h2>Finding chefs near you…</h2>
            <p>Checking availability, ratings and distance in {selectedAreaName}.</p>
            <div className="cp-checklist"><span><Check size={15} /> Available chefs nearby</span><span><Check size={15} /> Verified profiles & reviews</span><span><Check size={15} /> Matching your preferences</span></div>
            <button type="button" onClick={() => next('chefs')} className="cp-primary mt-6">Show available chefs</button>
          </div>
        )}

        {step === 'chefs' && (
          <>
            <div className="cp-page-intro"><span>3 chefs available nearby</span><small>Within 5 km · Ready for bookings</small></div>
            <div className="space-y-3">
              {displayChefs.map((chef, index) => (
                <button type="button" key={chef.id} onClick={() => { setSelectedChef(chef); next('request'); }} className="cp-chef-card text-left">
                  <img src={chef.avatar} alt={chef.name} />
                  <div className="min-w-0 flex-1">
                    {index === 0 && <span className="cp-match">Best match</span>}
                    <div className="flex items-center gap-1 mt-1"><strong className="truncate">{chef.name}</strong><BadgeCheck size={15} className="text-emerald-600" /></div>
                    <div className="text-[11px] text-slate-500 mt-1">⭐ {chef.rating.toFixed(1)} · {chef.specialties?.[0] || 'Multi-cuisine'}</div>
                    <div className="text-[11px] text-slate-500 mt-1">{chef.distanceKm.toFixed(1)} km away · {chef.experienceYears} yrs experience</div>
                    <div className="mt-2 font-extrabold text-slate-900">₹{chef.sosRate || chef.hourlyRate} <span className="text-[10px] font-semibold text-slate-500">starting</span></div>
                  </div>
                  <span className="cp-small-action">Choose</span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 'request' && selectedChef && (
          <>
            <section className="cp-profile-card">
              <img src={selectedChef.avatar} alt={selectedChef.name} />
              <div className="flex-1 min-w-0"><div className="flex items-center gap-1"><strong>{selectedChef.name}</strong><BadgeCheck size={16} className="text-emerald-600" /></div><div className="text-xs text-slate-500 mt-1">⭐ {selectedChef.rating.toFixed(1)} · {selectedChef.specialties?.[0]}</div><div className="text-xs text-slate-500 mt-1">{selectedChef.distanceKm.toFixed(1)} km away · Available now</div></div>
            </section>
            <section className="cp-request-card mt-4"><div className="cp-section-title">Confirm your request</div><div className="cp-summary-row"><span>Chef service</span><strong>₹{chefRate}</strong></div><div className="cp-summary-row"><span>Service fee</span><strong>₹{serviceFee}</strong></div><div className="cp-summary-total"><span>Total chef service</span><strong>₹{chefTotal}</strong></div><div className="cp-note"><ShieldCheck size={15} /> Ingredients are ordered separately from your chef's list.</div><button type="button" onClick={async () => {
              if (!currentUser) { onOpenAuth(); return; }
              if (!selectedChef) return;
              setRequestError(null);
              const res = await api.createBooking({
                chefId: selectedChef.id, type: 'sos_quick_fix', scheduledTime: 'Immediate',
                dishesRequested: dishRequest, specialInstructions: '',
                serviceAddress: currentUser.address || `${selectedAreaName}, ${selectedCityName}`, area: selectedAreaName,
                lat: currentUser.location.lat, lng: currentUser.location.lng, surgeCondition: 'normal',
              });
              if (!res.success || !res.data?.booking) { setRequestError(res.error?.message || 'We could not send the request. Please try again.'); return; }
              setBookingId(res.data.booking.id);
              next('request-sent');
            }} className="cp-primary mt-3">Send chef request <ArrowRight size={17} /></button></section>
          </>
        )}

        {step === 'request-sent' && selectedChef && (
          <RequestSentWatcher bookingId={bookingId} chef={selectedChef} onAccepted={() => next('accepted')} onError={setRequestError} />
        )}

        {step === 'accepted' && selectedChef && (
          <div className="cp-centered-step">
            <div className="cp-success-icon"><Check size={42} /></div>
            <h2>{selectedChef.name} accepted!</h2>
            <p>Your chef is preparing to travel to {selectedAreaName}. Next, your chef will send the ingredients required for your meal.</p>
            <div className="cp-chef-mini"><img src={selectedChef.avatar} alt="" /><span><strong>{selectedChef.name}</strong><small>⭐ {selectedChef.rating.toFixed(1)} · {selectedChef.distanceKm.toFixed(1)} km away</small></span></div>
            <button type="button" onClick={() => next('ingredients')} className="cp-primary mt-5">View ingredient list <ArrowRight size={17} /></button>
          </div>
        )}

        {step === 'ingredients' && (
          <>
            <div className="cp-info-banner"><ShoppingBasket size={19} /><span><strong>Ingredient list from your chef</strong><small>Your chef has selected the ingredients needed for your meal.</small></span></div>
            <div className="cp-request-card mt-3"><div className="flex justify-between items-center"><strong>{kit.dishName}</strong><span className="text-xs text-slate-500">{kit.items.filter(i => i.essential).length} essentials</span></div><div className="mt-3 space-y-2">{kit.items.filter(i => i.essential).map(item => <div key={item.id} className="cp-ingredient-row"><span><span className="cp-check-dot"><Check size={11} /></span>{item.name}<small>{item.packSize}</small></span><strong>₹{item.estimatedPrice}</strong></div>)}</div><div className="cp-summary-total mt-3"><span>Estimated ingredients</span><strong>₹{groceryTotal}</strong></div><button type="button" onClick={() => next('partner')} className="cp-primary mt-3">Order ingredients <ArrowRight size={17} /></button></div>
          </>
        )}

        {step === 'partner' && (
          <>
            <div className="cp-page-intro"><span>Choose your grocery delivery partner</span><small>Your ingredients will be delivered to your home.</small></div>
            <div className="space-y-3">{QUICK_COMMERCE_PLATFORMS.map(p => <button key={p.id} type="button" onClick={() => setPlatform(p.id)} className={`cp-partner ${platform === p.id ? 'selected' : ''}`}><span className="cp-partner-logo">{p.logo}</span><span className="flex-1 text-left"><strong>{p.name}</strong><small>{p.tagline}</small></span><span className="text-right"><b>{p.etaMinutes} min</b><small>estimated</small></span>{platform === p.id && <Check size={18} className="text-emerald-600" />}</button>)}</div>
            <button type="button" onClick={() => next('grocery-review')} className="cp-primary mt-4">Continue with {selectedPartner.name} <ArrowRight size={17} /></button>
          </>
        )}

        {step === 'grocery-review' && (
          <section className="cp-request-card"><div className="cp-info-banner compact"><WalletCards size={18} /><span><strong>{selectedPartner.name} delivery to your home</strong><small>Estimated arrival before your chef reaches you.</small></span></div><div className="mt-4 space-y-2">{kit.items.filter(i=>i.essential).map(item=><div key={item.id} className="cp-summary-row"><span>{item.name}</span><strong>₹{item.estimatedPrice}</strong></div>)}</div><div className="cp-summary-total mt-3"><span>Total ingredients</span><strong>₹{groceryTotal}</strong></div><div className="cp-note"><Home size={15} /> Delivery address: {currentUser?.address || `${selectedAreaName}, ${selectedCityName}`}</div><button type="button" onClick={async () => {
          if (!currentUser || !bookingId) { onOpenAuth(); return; }
          const items = kit.items.filter(i => i.essential).map(i => ({ id: i.id, name: i.name, packSize: i.packSize, quantity: 1, pricePaise: Math.round(i.estimatedPrice * 100) }));
          const orderRes = await api.createGroceryOrder({ bookingId, partner: platform, address: currentUser.address || `${selectedAreaName}, ${selectedCityName}`, area: selectedAreaName, items, totalPaise: groceryTotal * 100 });
          if (!orderRes.success || !orderRes.data?.order) { setRequestError(orderRes.error?.message || 'We could not create your ingredient order.'); return; }
          setGroceryOrderId(orderRes.data.order.id);
          const intentRes = await api.createGroceryPaymentIntent(orderRes.data.order.id);
          if (!intentRes.success || !intentRes.data?.payment) { setRequestError(intentRes.error?.message || 'Ingredient payment could not be started.'); return; }
          const payment = intentRes.data.payment;
          setGroceryPayment(payment);
          if (payment.provider === 'razorpay') {
            await openRazorpayCheckout({ id: payment.id, amountPaise: payment.amountPaise, currency: payment.currency, providerOrderId: payment.providerOrderId, providerKeyId: payment.providerKeyId, bookingId: bookingId, name: currentUser.name, email: currentUser.email, phone: currentUser.phone }, async ({ paymentId, signature }) => {
              const confirm = await api.confirmGroceryPayment(payment.id, paymentId, signature);
              if (!confirm.success) throw new Error(confirm.error?.message || 'Ingredient payment verification failed.');
            });
          } else {
            setRequestError('Ingredient payment simulation is available only in development/staging. A live grocery payment gateway is required in production.');
            return;
          }
          setIngredientPaid(true);
          await api.updateGroceryOrderStatus(orderRes.data.order.id, 'out_for_delivery');
          next('grocery-tracking');
        }} className="cp-primary mt-3"><CreditCard size={17} /> Pay ingredients · ₹{groceryTotal}</button></section>
        )}

        {step === 'grocery-tracking' && (
          <div className="cp-centered-step"><div className="cp-delivery-icon"><Truck size={34} /></div><h2>Your groceries are on the way</h2><p>{selectedPartner.name} is delivering the ingredients to <strong>your home</strong>.</p><div className="cp-delivery-route"><div className="cp-route-line" /><span className="route-start">Store</span><span className="route-end">🏠 Your home</span><Truck size={22} className="cp-truck" /></div><div className="cp-status-card"><span><Clock3 size={16} /> Estimated arrival</span><strong>{selectedPartner.etaMinutes} minutes</strong></div><button type="button" onClick={async () => { if (groceryOrderId) { const res = await api.getGroceryOrder(groceryOrderId); if (res.success && res.data?.order?.status === 'delivered_to_customer') next('grocery-delivered'); else setRequestError('We are still waiting for the delivery partner to confirm that your groceries reached your home.'); } }} className="cp-primary mt-5">Check delivery status</button></div>
        )}

        {step === 'grocery-delivered' && (
          <div className="cp-centered-step"><div className="cp-success-icon"><PackageCheck size={42} /></div><h2>Groceries delivered to your home</h2><p>Your ingredients have arrived at <strong>{currentUser?.address || `${selectedAreaName}, ${selectedCityName}`}</strong>.</p><div className="cp-delivered-card"><Check size={17} /><span>Ingredients received safely</span><b>₹{groceryTotal}</b></div><button type="button" onClick={() => next('chef-tracking')} className="cp-primary mt-5">Now track my chef <Navigation size={17} /></button></div>
        )}

        {step === 'chef-tracking' && selectedChef && (
          <div className="cp-map-card"><div className="cp-map-surface"><div className="cp-map-grid" /><div className="cp-map-pin home"><Home size={18} /></div><div className="cp-map-pin chef"><ChefHat size={18} /></div><div className="cp-map-route" /><div className="cp-map-label"><img src={selectedChef.avatar} alt="" /><span><strong>{selectedChef.name} is on the way</strong><small>Arriving in 12 minutes · {selectedChef.distanceKm.toFixed(1)} km</small></span></div></div><div className="cp-map-actions"><button><MessageCircle size={17} /> Chat</button><button><Phone size={17} /> Call</button></div><button type="button" onClick={() => next('chef-arrived')} className="cp-primary mt-3">Chef has arrived</button></div>
        )}

        {step === 'chef-arrived' && selectedChef && (
          <div className="cp-centered-step"><img className="cp-arrived-photo" src={selectedChef.avatar} alt={selectedChef.name} /><div className="cp-success-icon small"><Check size={30} /></div><h2>Chef has arrived</h2><p>{selectedChef.name} is at your location. Your groceries are already waiting at home.</p><button type="button" onClick={() => next('cooking')} className="cp-primary mt-5">Start cooking <Utensils size={17} /></button></div>
        )}

        {step === 'cooking' && selectedChef && (
          <div className="cp-cooking-card"><img src={selectedChef.galleryImages?.[0] || foodHero} alt="Chef preparing food" /><div className="cp-cooking-content"><span className="cp-live"><span /> LIVE</span><h2>Cooking in progress</h2><p>{selectedChef.name} is preparing your meal with the ingredients delivered to your home.</p><div className="cp-progress"><span style={{ width: '72%' }} /></div><div className="cp-summary-row"><span>Estimated time remaining</span><strong>35 min</strong></div><button type="button" onClick={() => next('complete')} className="cp-primary mt-4">Service completed</button></div></div>
        )}

        {step === 'complete' && selectedChef && (
          <div className="cp-centered-step"><div className="cp-complete-food"><img src={selectedChef.galleryImages?.[0] || foodHero} alt="Finished meal" /><span><Check size={24} /></span></div><h2>Your meal is ready!</h2><p>{selectedChef.name} completed the service successfully.</p><div className="cp-stars">{[1,2,3,4,5].map(i => <Star key={i} size={25} fill="currentColor" />)}</div><button type="button" onClick={() => { if (!currentUser) onOpenAuth(); else reset(); }} className="cp-primary mt-4">{currentUser ? 'Back to ChefPulse' : 'Sign in to save booking'}</button></div>
        )}
      </div>

      <div className="cp-flow-footer"><ShieldCheck size={15} /> Secure · Clear pricing · Verified chefs · Grocery delivery to your home</div>
    </div>
  );
};
