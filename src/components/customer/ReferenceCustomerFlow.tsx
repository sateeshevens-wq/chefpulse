import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, ArrowRight, Check, ChefHat, ChevronRight, CreditCard, Home,
  MapPin, MessageCircle, Navigation, Phone, Search, ShoppingBag, Star, User,
} from 'lucide-react';
import './referenceCustomerFlow.css';

type Screen = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19;

const chefPhoto = 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=900&q=85';
const kitchenPhoto = 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=85';
const foodPhoto = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=85';

const chefs = [
  { name: 'Rohit Sharma', rating: '4.8', reviews: '320', cuisine: 'South Indian · North Indian · Chinese', price: '₹800 / 3 hrs', distance: '3 km away', eta: '15 min' },
  { name: 'Vikram Singh', rating: '4.7', reviews: '245', cuisine: 'Continental · Italian', price: '₹750 / 3 hrs', distance: '4 km away', eta: '20 min' },
  { name: 'Amit Kumar', rating: '4.6', reviews: '180', cuisine: 'North Indian · Chinese', price: '₹750 / 3 hrs', distance: '5 km away', eta: '25 min' },
];

const ingredients = [
  ['Fresh Vegetables', '1 kg', '₹250', '🥕'],
  ['Paneer', '500g', '₹120', '🧀'],
  ['Basmati Rice', '1 kg', '₹80', '🍚'],
  ['Spices & Masala', '1 pack', '₹100', '🌶️'],
  ['Cooking Oil', '1 L', '₹150', '🫙'],
] as const;

const partners = [
  { name: 'Zepto', eta: '10–30 min', label: 'Fast Delivery', logo: 'zepto' },
  { name: 'blinkit', eta: '15–30 min', label: 'Quick & Reliable', logo: 'blinkit' },
  { name: 'bigbasket', eta: '30–60 min', label: 'Fresh & Trusted', logo: 'bb' },
] as const;

function Brand({ compact = false }: { compact?: boolean }) {
  return <div className={compact ? 'cp-brand cp-brand--compact' : 'cp-brand'}>
    <div className="cp-brand-mark"><ChefHat size={compact ? 25 : 38} strokeWidth={2.2} /></div>
    <div><div className="cp-brand-name">Chef<span>Pulse</span></div>{!compact && <div className="cp-brand-tag">Real Chefs. Fresh Food. At Your Doorstep.</div>}</div>
  </div>;
}

function TopBar({ title, onBack, screen }: { title?: string; onBack?: () => void; screen: Screen }) {
  return <header className="cp-topbar">
    {onBack ? <button className="cp-icon-btn" onClick={onBack} aria-label="Back"><ArrowLeft size={21} /></button> : <div className="cp-top-spacer" />}
    <div className="cp-top-title">{title || <Brand compact />}</div>
    <div className="cp-status"><span>9:41</span><span>●</span><span>▰</span></div>
    <div className="cp-step">{screen}/19</div>
  </header>;
}

function BottomNav({ screen, go }: { screen: Screen; go: (s: Screen) => void }) {
  const items: Array<[Screen, React.ReactNode, string]> = [[2, <Home size={18} />, 'Home'], [18, <ShoppingBag size={18} />, 'Orders'], [8, <MessageCircle size={18} />, 'Chat'], [19, <User size={18} />, 'Profile']];
  return <nav className="cp-bottom-nav">{items.map(([target, icon, label]) => <button key={label} className={screen === target ? 'active' : ''} onClick={() => go(target)}>{icon}<span>{label}</span></button>)}</nav>;
}

function PrimaryButton({ children, onClick, disabled = false }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
  return <button className="cp-primary" onClick={onClick} disabled={disabled}>{children}<ChevronRight size={17} /></button>;
}

function Progress({ active }: { active: number }) {
  return <div className="cp-progress">{[1,2,3,4,5].map(n => <span key={n} className={n <= active ? 'done' : ''}>{n <= active ? <Check size={12} /> : n}</span>)}</div>;
}

export function ReferenceCustomerFlow() {
  const [screen, setScreen] = useState<Screen>(1);
  const [selectedChef, setSelectedChef] = useState(0);
  const [selectedPartner, setSelectedPartner] = useState(0);
  const [selectedService, setSelectedService] = useState('Home Cooking');
  const [search, setSearch] = useState('');
  const [paid, setPaid] = useState(false);
  const [rating, setRating] = useState(5);

  useEffect(() => {
    if (screen === 1) {
      const timer = window.setTimeout(() => setScreen(2), 1800);
      return () => window.clearTimeout(timer);
    }
  }, [screen]);

  const chef = chefs[selectedChef];
  const go = (target: Screen) => setScreen(target);

  const serviceCards = [
    ['Home Cooking', 'Everyday meals', '🍲'],
    ['Special Cuisine', 'Indian | Continental | Chinese', '🍛'],
    ['Diet & Healthy', 'Custom meals', '🌿'],
    ['Party & Events', 'Family & Friends', '🎉'],
  ];

  const renderScreen = useMemo(() => {
    switch (screen) {
      case 1:
        return <section className="cp-splash"><div className="cp-splash-photo" /><div className="cp-splash-card"><Brand /><p>Real Chefs. Fresh Food.<br />At Your Doorstep.</p><button onClick={() => go(2)} className="cp-primary cp-splash-button">Get Started <ArrowRight size={17} /></button><button className="cp-link" onClick={() => go(2)}>Already have an account? <b>Sign In</b></button></div></section>;
      case 2:
        return <><TopBar screen={2} /><main className="cp-page"><div className="cp-location"><MapPin size={15} fill="currentColor" /> Bengaluru <ChevronRight size={14} /></div><div className="cp-search"><Search size={17} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="What would you like to cook today?" /></div><div className="cp-home-actions"><button className="cp-action cp-action--hero" onClick={() => go(3)}><span className="cp-action-icon">👨‍🍳</span><span><b>Chef Now</b><small>Get a chef at your home</small></span><ChevronRight /></button><button className="cp-action" onClick={() => go(3)}><span className="cp-action-icon">🧑‍🍳</span><span><b>Book a Chef</b><small>For events & occasions</small></span><ChevronRight /></button><button className="cp-action" onClick={() => go(3)}><span className="cp-action-icon">🍽️</span><span><b>Catering</b><small>For parties & events</small></span><ChevronRight /></button></div><div className="cp-fresh-banner" onClick={() => go(9)}><div><b>Fresh Ingredients<br />Better Meals</b><small>Order groceries with your chef</small></div><span>🥬🍅</span></div></main><BottomNav screen={2} go={go} /></>;
      case 3:
        return <><TopBar title="Chef Now" screen={3} onBack={() => go(2)} /><main className="cp-page"><p className="cp-subtitle">Need a chef at your home soon?</p><div className="cp-service-list">{serviceCards.map(([title, sub, icon]) => <button key={title} className={`cp-service ${selectedService === title ? 'selected' : ''}`} onClick={() => setSelectedService(title)}><span className="cp-round-icon">{icon}</span><span><b>{title}</b><small>{sub}</small></span><ChevronRight /></button>)}</div><PrimaryButton onClick={() => go(4)}>Continue</PrimaryButton></main></>;
      case 4:
        return <><TopBar title="Finding Chefs" screen={4} onBack={() => go(3)} /><main className="cp-page cp-center"><h2>Finding the best chef for you...</h2><p>We're checking availability<br />in your area</p><div className="cp-map"><div className="cp-radar r1"/><div className="cp-radar r2"/><div className="cp-radar r3"/><div className="cp-map-pin"><ChefHat size={25}/></div></div><div className="cp-check-list"><p><Check size={16}/> Checking nearby chefs</p><p><Check size={16}/> Verifying ratings & reviews</p><p><Check size={16}/> Matching your preferences</p></div><PrimaryButton onClick={() => go(5)}>View Available Chefs</PrimaryButton></main></>;
      case 5:
        return <><TopBar title="Available Chefs" screen={5} onBack={() => go(4)} /><main className="cp-page"><div className="cp-available-head"><b>3 chefs available nearby</b><small>Within 2 km · 15 min</small></div>{chefs.map((c, i) => <div className="cp-chef-row" key={c.name}><img src={chefPhoto} /><div className="cp-chef-info"><b>{c.name}</b><span><Star size={13} fill="currentColor" /> {c.rating} ({c.reviews})</span><small>{c.cuisine}</small><strong>{c.price}</strong></div><button onClick={() => { setSelectedChef(i); go(6); }}>Accept</button></div>)}</main></>;
      case 6:
        return <><TopBar title="Chef Details" screen={6} onBack={() => go(5)} /><main className="cp-page cp-detail"><div className="cp-chef-cover"><img src={chefPhoto} /><span>● Online</span></div><h2>{chef.name}</h2><div className="cp-meta"><span>⭐ {chef.rating} ({chef.reviews} reviews)</span><span>⌖ {chef.cuisine}</span><span>◷ {chef.distance} · {chef.eta} · Background verified</span></div><div className="cp-about"><b>About</b><p>Passionate chef with 5+ years of experience in home cooking and specialized in South Indian cuisine.</p></div><div className="cp-price">{chef.price}</div><PrimaryButton onClick={() => go(7)}>Request Chef</PrimaryButton></main></>;
      case 7:
        return <><TopBar title="Request Sent" screen={7} /><main className="cp-page cp-status-screen"><div className="cp-avatar-check"><img src={chefPhoto}/><span><Check size={23}/></span></div><h2>Chef request sent!</h2><p>Chef {chef.name} will reach you soon.<br />You'll get a notification once they accept.</p><Progress active={1}/><PrimaryButton onClick={() => go(8)}>View Details</PrimaryButton></main></>;
      case 8:
        return <><TopBar title="Chef Accepts" screen={8} /><main className="cp-page cp-status-screen"><div className="cp-avatar-check"><img src={chefPhoto}/><span><Check size={23}/></span></div><h2>Chef {chef.name}<br />accepted your request!</h2><p>He will arrive at your home shortly.</p><Progress active={2}/><PrimaryButton onClick={() => go(9)}>View Live Tracking</PrimaryButton></main></>;
      case 9:
        return <><TopBar title="Ingredients Required" screen={9} onBack={() => go(8)} /><main className="cp-page"><p className="cp-muted">From Chef {chef.name}</p>{ingredients.map(([name, qty, price, icon]) => <div className="cp-ingredient" key={name}><span>{icon}</span><div><b>{name}</b><small>{qty}</small></div><strong>{price}</strong></div>)}<div className="cp-total"><span>Total Amount</span><b>₹700</b></div><PrimaryButton onClick={() => go(10)}>Order Ingredients</PrimaryButton></main></>;
      case 10:
        return <><TopBar title="Choose Delivery Partner" screen={10} onBack={() => go(9)} /><main className="cp-page"><p className="cp-muted">Select your preferred grocery partner</p>{partners.map((p, i) => <button className={`cp-partner ${selectedPartner === i ? 'selected' : ''}`} key={p.name} onClick={() => setSelectedPartner(i)}><span className={`cp-partner-logo ${p.logo}`}>{p.logo === 'bb' ? 'bb' : p.name}</span><span><b>{p.name}</b><small>{p.eta}<br />{p.label}</small></span><Check className="cp-radio" size={20} /></button>)}<PrimaryButton onClick={() => go(11)}>Continue</PrimaryButton></main></>;
      case 11:
        return <><TopBar title="Order Summary" screen={11} onBack={() => go(10)} /><main className="cp-page"><p className="cp-muted">From {partners[selectedPartner].name}</p>{ingredients.map(([name, qty, price, icon]) => <div className="cp-ingredient" key={name}><span>{icon}</span><div><b>{name}</b><small>{qty}</small></div><strong>{price}</strong></div>)}<div className="cp-total-line"><span>Delivery Fee</span><span>₹40</span></div><div className="cp-total"><span>Total Amount</span><b>₹740</b></div><PrimaryButton onClick={() => { setPaid(true); go(12); }}>{paid ? 'Paid' : 'Pay Now'}</PrimaryButton><div className="cp-secure"><CreditCard size={14}/> Secure Payment</div></main></>;
      case 12:
        return <><TopBar title="Ingredient Delivery Tracking" screen={12} onBack={() => go(11)} /><main className="cp-page"><div className="cp-track-head"><b>Your groceries are on the way!</b><span>Arriving in 18 min</span></div><div className="cp-map cp-route"><div className="cp-route-line"/><div className="cp-delivery-pin">🛵</div><div className="cp-home-pin">⌂</div></div><div className="cp-driver"><img src={chefPhoto}/><div><b>Zepto Delivery Partner</b><small>Rahul Kumar · ⭐ 4.8 (920)</small></div><button onClick={() => window.alert('Calling delivery partner…')}><Phone size={18}/></button></div><button className="cp-secondary" onClick={() => go(13)}><Navigation size={16}/> Live Tracking</button></main></>;
      case 13:
        return <><TopBar title="Groceries Delivered" screen={13} /><main className="cp-page cp-status-screen"><div className="cp-delivered-art">🥬<span>✓</span>📦</div><h2>Groceries delivered!</h2><p>Your ingredients have arrived<br />at your home.</p><div className="cp-delivered-time"><Check size={16}/> Delivered at 11:25 AM</div><PrimaryButton onClick={() => go(14)}>Track Your Chef</PrimaryButton></main></>;
      case 14:
        return <><TopBar title="Track Your Chef" screen={14} onBack={() => go(13)} /><main className="cp-page"><div className="cp-track-head"><b>Chef is on the way</b><span>Arriving in 12 min</span></div><div className="cp-map cp-route"><div className="cp-route-line chef-route"/><div className="cp-chef-pin">👨‍🍳</div><div className="cp-home-pin">⌂</div></div><div className="cp-driver"><img src={chefPhoto}/><div><b>{chef.name}</b><small>⭐ {chef.rating} · Arriving in 12 min</small></div><button onClick={() => window.alert('Calling chef…')}><Phone size={18}/></button></div><PrimaryButton onClick={() => go(15)}>Continue</PrimaryButton></main></>;
      case 15:
        return <><TopBar title="Chef Arrived" screen={15} /><main className="cp-page cp-status-screen"><div className="cp-arrived-photo"><img src={chefPhoto}/></div><h2>{chef.name}</h2><p>arrived at your location!</p><div className="cp-contact-row"><button onClick={() => window.alert('Opening ChefPulse chat…')}><MessageCircle size={18}/> Chat</button><button onClick={() => window.alert('Calling chef…')}><Phone size={18}/> Call</button></div><div className="cp-arrival-time">Arrived at 6:20 PM</div><PrimaryButton onClick={() => go(16)}>Start Cooking</PrimaryButton></main></>;
      case 16:
        return <><TopBar title="Cooking in Progress" screen={16} /><main className="cp-page cp-status-screen"><img className="cp-cooking-photo" src={kitchenPhoto}/><h2>Cooking in progress</h2><p>Enjoy your fresh, home-cooked meal!</p><strong className="cp-big-time">1 hr 10 min</strong><Progress active={4}/><PrimaryButton onClick={() => go(17)}>Mark Complete</PrimaryButton></main></>;
      case 17:
        return <><TopBar title="Service Completed" screen={17} /><main className="cp-page cp-status-screen"><img className="cp-cooking-photo" src={foodPhoto}/><h2>Your meal is ready!</h2><p>Chef {chef.name} completed the service.</p><div className="cp-rating">{[1,2,3,4,5].map(n => <button key={n} className={n <= rating ? 'selected' : ''} onClick={() => setRating(n)}><Star fill="currentColor" /></button>)}</div><PrimaryButton onClick={() => go(18)}>View Receipt</PrimaryButton></main></>;
      case 18:
        return <><TopBar title="My Bookings" screen={18} onBack={() => go(2)} /><main className="cp-page"><div className="cp-tabs"><button className="active">Upcoming</button><button>Completed</button><button>Cancelled</button></div><div className="cp-booking"><span>Today, 6:00 PM</span><b>{chef.name}</b><small>Home Cooking · 3 hrs<br />₹800 · 4 people</small><em>Completed</em></div><div className="cp-booking"><span>Apr 18, 2026</span><b>Chef Neha Kapoor</b><small>Continental · 3 hrs<br />₹900 · 4 people</small><em>Completed</em></div><div className="cp-booking"><span>Apr 10, 2026</span><b>Amit Kumar</b><small>North Indian · 3 hrs<br />₹750 · 3 people</small><em>Completed</em></div></main><BottomNav screen={18} go={go}/></>;
      case 19:
        return <><TopBar title="My Account" screen={19} onBack={() => go(2)} /><main className="cp-page"><div className="cp-profile-head"><div className="cp-profile-avatar"><User size={30}/></div><div><b>Arjun Mehta</b><small>arjun.mehta@gmail.com</small></div></div><div className="cp-settings">{['My Bookings','My Addresses','Payment Methods','Notifications','Help & Support','Settings'].map((item, i) => <button key={item} onClick={() => window.alert(`${item} is ready for your next action.`)}><span>{['▣','⌖','▤','◉','?','⚙'][i]}</span>{item}<ChevronRight size={17}/></button>)}</div><button className="cp-logout" onClick={() => go(2)}>Log Out</button></main><BottomNav screen={19} go={go}/></>;
    }
  }, [screen, selectedChef, selectedPartner, selectedService, search, paid, rating, chef]);

  return <div className="cp-shell">{renderScreen}<div className="cp-legal"><span>ChefPulse</span><span>On-Demand Chefs</span><span>Fresh Ingredients</span><span>Multiple Grocery Partners</span><i>Good Food<br/>Good Mood ♥</i></div></div>;
}
