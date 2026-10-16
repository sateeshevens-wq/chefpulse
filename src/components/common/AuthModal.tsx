import React, { useState } from 'react';
import { api } from '../../services/api';
import { User, UserRole, Chef, ChefSpecialty, CityInfo, CityArea } from '../../types';
import { INDIAN_CITIES } from '../../data/indianCities';
import {
  ChefHat,
  User as UserIcon,
  Phone,
  Mail,
  MapPin,
  Utensils,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Plus,
  X,
  ShieldCheck,
  Award,
  ChevronRight,
  Heart,
  Users,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User, newChefProfile?: Chef) => void;
  initialRole?: UserRole;
  initialMode?: 'login' | 'signup';
  currentCity?: CityInfo;
  currentArea?: CityArea;
}

const CHEF_SPECIALTY_OPTIONS: ChefSpecialty[] = [
  'North Indian / Mughlai',
  'South Indian / Coastal',
  'Tandoor & Kebabs',
  'Continental & Italian',
  'Pan-Asian & Dimsum',
  'Pastry & Bakery',
  'Healthy / Diet / Keto',
  'Awadhi Banquet',
  'Maharashtrian & Malvani',
  'Hyderabadi Dum & Nizami',
  'Rajasthani & Marwari',
  'Bengali Royal Feast',
];

const SIGNATURE_DISH_SUGGESTIONS = [
  'Royal Zafrani Dum Biryani',
  'Melt-in-mouth Galouti Kebab',
  'Mangalorean Prawn Ghee Roast',
  'Handmade Truffle Fettuccine',
  'Slow-cooked Dal Makhani',
  'Steamed Crystal Dimsums',
  'Charred Sigri Malai Tikka',
  'Fluffy Neer Dosa with Kori Rotti',
  'Burrata Napoletana Flatbread',
  'Kerala Meen Moilee',
  'Shahi Awadhi Shahi Tukda',
];

const CUSTOMER_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
];

const CHEF_AVATARS = [
  'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1581299894007-aaa50297cf16?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?auto=format&fit=crop&w=300&q=80',
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialRole = 'customer',
  initialMode = 'signup',
  currentCity = INDIAN_CITIES[0],
  currentArea,
}) => {
  // Navigation & Role State
  const [role, setRole] = useState<'customer' | 'chef'>(
    initialRole === 'chef' ? 'chef' : 'customer'
  );
  const [authMode, setAuthMode] = useState<'signup' | 'login'>(initialMode);
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');
  const [step, setStep] = useState<'credentials' | 'onboarding'>('credentials');

  // Credentials State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gmailAddress, setGmailAddress] = useState('');
  const [password, setPassword] = useState('');

  // Common Geography State
  const [selectedCity, setSelectedCity] = useState<CityInfo>(currentCity);
  const [selectedArea, setSelectedArea] = useState<CityArea>(
    currentArea || currentCity.areas[0]
  );

  // Customer First-Time Onboarding State
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerAvatar, setCustomerAvatar] = useState(CUSTOMER_AVATARS[0]);
  const [dietaryPreference, setDietaryPreference] = useState<'all' | 'veg' | 'non_veg' | 'jain' | 'vegan'>('all');
  const [householdSize, setHouseholdSize] = useState('Family (3-4 pax)');
  const [selectedCustomerCuisines, setSelectedCustomerCuisines] = useState<string[]>([
    'North Indian / Mughlai',
    'Tandoor & Kebabs',
  ]);

  // Chef Specialized Registration State (What the chef can offer or cooks best)
  const [chefName, setChefName] = useState('');
  const [chefAvatar, setChefAvatar] = useState(CHEF_AVATARS[0]);
  const [experienceYears, setExperienceYears] = useState('9');
  const [selectedSpecialties, setSelectedSpecialties] = useState<ChefSpecialty[]>([
    'North Indian / Mughlai',
    'Tandoor & Kebabs',
    'Awadhi Banquet',
  ]);
  const [signatureDishes, setSignatureDishes] = useState<string[]>([
    'Royal Zafrani Dum Biryani',
    'Melt-in-mouth Galouti Kebab',
    'Slow-cooked Dal Makhani',
  ]);
  const [customDishInput, setCustomDishInput] = useState('');
  const [chefBio, setChefBio] = useState(
    'Ex-Taj luxury banquet artist. Specialist in royal slow-dum biryanis, sigri kebabs, and authentic slow-simmered rich curries.'
  );
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([
    'Hindi',
    'English',
    'Kannada',
  ]);
  const [hourlyRate, setHourlyRate] = useState('600');
  const [sosRate, setSosRate] = useState('850');
  const [dayPrepRate, setDayPrepRate] = useState('1400');
  const [shiftRate, setShiftRate] = useState('2800');
  const [hygienePledgeAccepted, setHygienePledgeAccepted] = useState(true);

  if (!isOpen) return null;

  // Handler: Change City update area
  const handleCityChange = (cityId: string) => {
    const found = INDIAN_CITIES.find((c) => c.id === cityId);
    if (found) {
      setSelectedCity(found);
      setSelectedArea(found.areas[0]);
    }
  };

  // Handler: Toggle specialty chip
  const handleToggleSpecialty = (spec: ChefSpecialty) => {
    setSelectedSpecialties((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    );
  };

  // Handler: Add signature dish
  const handleAddSignatureDish = (dish: string) => {
    const trimmed = dish.trim();
    if (!trimmed || signatureDishes.includes(trimmed)) return;
    setSignatureDishes((prev) => [...prev, trimmed]);
    setCustomDishInput('');
  };

  // Handler: Remove signature dish
  const handleRemoveSignatureDish = (dish: string) => {
    setSignatureDishes((prev) => prev.filter((d) => d !== dish));
  };

  // Handler: Toggle cuisine for customer
  const handleToggleCustomerCuisine = (cuisine: string) => {
    setSelectedCustomerCuisines((prev) =>
      prev.includes(cuisine) ? prev.filter((c) => c !== cuisine) : [...prev, cuisine]
    );
  };

  // Action: Sign in or move into account onboarding. Authentication is server-authoritative.
  const handleInitiateAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return;

    if (authMode === 'signup') {
      setStep('onboarding');
      return;
    }

    const identifier = authMethod === 'phone' ? `+91 ${phoneNumber}` : gmailAddress.trim();
    const result = await api.login(identifier, password);
    if (!result.success || !result.data?.user) {
      alert(result.error?.message || 'Sign in failed. Please check your details and try again.');
      return;
    }

    const u = result.data.user;
    const city = INDIAN_CITIES.find((c) => c.id === u.cityId) || currentCity;
    const area = city.areas.find((a) => a.name === u.address?.split(',')[0]) || city.areas[0];
    onLoginSuccess({
      id: u.id, name: u.name, phone: u.phone, email: u.email, role: u.role,
      verified: Boolean(u.verified), avatar: u.avatar, cityId: u.cityId || city.id,
      cityName: u.cityName || city.name, address: u.address || `${area.name}, ${city.name}`,
      location: { lat: area.lat, lng: area.lng, area: area.name }, chefProfileId: u.chefProfileId,
      authProvider: authMethod, isFirstLogin: false,
    });
    onClose();
  };

  // Complete Customer Signup (First-Time Onboarding)
  const handleCompleteCustomerSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Register with server
    const result = await api.register({
      phone: `+91 ${phoneNumber}`,
      name: customerName,
      email: gmailAddress,
      password,
      role: 'customer',
      cityId: selectedCity.id,
      cityName: selectedCity.name,
      address: `${customerAddress}, ${selectedArea.name}, ${selectedCity.name}`,
      lat: selectedArea.lat,
      lng: selectedArea.lng,
    });
    if (!result.success || !result.data?.user) {
      alert(result.error?.message || 'Registration failed. Please try again.');
      return;
    }

    const user: User = {
      id: result.data.user.id,
      name: result.data.user.name || customerName,
      phone: result.data.user.phone || `+91 ${phoneNumber}`,
      email: result.data.user.email || gmailAddress,
      role: 'customer',
      verified: false,
      cityId: selectedCity.id,
      cityName: selectedCity.name,
      address: `${customerAddress}, ${selectedArea.name}, ${selectedCity.name}`,
      location: {
        lat: selectedArea.lat,
        lng: selectedArea.lng,
        area: selectedArea.name,
      },
      avatar: customerAvatar,
      dietaryPreference,
      householdSize,
      favoriteCuisines: selectedCustomerCuisines,
      authProvider: authMethod,
      isFirstLogin: false,
    };

    onLoginSuccess(user);
    onClose();
  };

  // Complete Chef Signup (Culinary Offerings & Signature Dishes)
  const handleCompleteChefSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Register chef with server
    const result = await api.register({
      phone: `+91 ${phoneNumber}`,
      name: chefName,
      email: gmailAddress,
      password,
      role: 'chef',
      cityId: selectedCity.id,
      cityName: selectedCity.name,
      address: `${selectedArea.name}, ${selectedCity.name}`,
      lat: selectedArea.lat,
      lng: selectedArea.lng,
      experienceYears: Number(experienceYears) || 5,
      specialties: selectedSpecialties.length > 0 ? selectedSpecialties : ['North Indian / Mughlai'],
      bio: chefBio,
      hourlyRate: Number(hourlyRate) || 600,
      sosRate: Number(sosRate) || 850,
      dayPrepRate: Number(dayPrepRate) || 1400,
      shiftRate: Number(shiftRate) || 2800,
      signatureDishes: signatureDishes.length > 0 ? signatureDishes : ['Chef Special Dum Biryani'],
    });
    if (!result.success || !result.data?.user) {
      alert(result.error?.message || 'Registration failed. Please try again.');
      return;
    }

    const chefProfileId = result.data.user.chefProfileId;
    let newChef: Chef | undefined;
    if (chefProfileId) {
      const chefResult = await api.getChef(chefProfileId);
      if (chefResult.success && chefResult.data?.chef) newChef = chefResult.data.chef;
    }

    const user: User = {
      id: result.data.user.id,
      name: result.data.user.name || chefName,
      phone: result.data.user.phone || `+91 ${phoneNumber}`,
      email: result.data.user.email || gmailAddress,
      role: 'chef',
      verified: Boolean(result.data.user.verified),
      cityId: result.data.user.cityId || selectedCity.id,
      cityName: result.data.user.cityName || selectedCity.name,
      address: result.data.user.address || `${selectedArea.name}, ${selectedCity.name}`,
      location: { lat: selectedArea.lat, lng: selectedArea.lng, area: selectedArea.name },
      avatar: result.data.user.avatar || chefAvatar,
      chefProfileId,
      authProvider: authMethod,
      isFirstLogin: false,
    };

    onLoginSuccess(user, newChef);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[2200] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto bg-neutral-900 border border-neutral-700/80 rounded-3xl p-5 sm:p-7 shadow-2xl text-neutral-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white text-xl p-1.5 rounded-full hover:bg-neutral-800 transition-colors"
        >
          <X size={20} />
        </button>

        {/* STEP 1: REAL SERVER AUTHENTICATION */}
        {step === 'credentials' && (
          <div className="space-y-5">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 text-2xl mb-2.5 ring-1 ring-amber-500/30">
                {role === 'chef' ? '👨‍🍳' : '🍽️'}
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                {authMode === 'signup' ? (role === 'chef' ? 'Join as a Chef Partner' : 'Create your account') : (role === 'chef' ? 'Chef Partner Login' : 'Customer Sign In')}
              </h2>
              <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">Use your real account details. ChefPulse never creates a demo account behind the scenes.</p>
            </div>

            <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-neutral-950/80 border border-neutral-800">
              <button type="button" onClick={() => setRole('customer')} className={`py-3 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 ${role === 'customer' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-400 hover:bg-neutral-900'}`}><UserIcon size={16} /> Customer</button>
              <button type="button" onClick={() => setRole('chef')} className={`py-3 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 ${role === 'chef' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-400 hover:bg-neutral-900'}`}><ChefHat size={16} /> Chef</button>
            </div>

            <div className="flex items-center gap-4 border-b border-neutral-800 pb-3">
              <button type="button" onClick={() => setAuthMode('signup')} className={`text-xs font-black pb-1 ${authMode === 'signup' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-neutral-400'}`}>New Sign Up</button>
              <button type="button" onClick={() => setAuthMode('login')} className={`text-xs font-black pb-1 ${authMode === 'login' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-neutral-400'}`}>Existing Login</button>
            </div>

            <form onSubmit={handleInitiateAuth} className="space-y-4">
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setAuthMethod('phone')} className={`flex-1 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 ${authMethod === 'phone' ? 'bg-neutral-800 border-amber-500/60 text-amber-300' : 'bg-neutral-900 border-neutral-800 text-neutral-400'}`}><Phone size={14} /> Phone</button>
                <button type="button" onClick={() => setAuthMethod('email')} className={`flex-1 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 ${authMethod === 'email' ? 'bg-neutral-800 border-amber-500/60 text-amber-300' : 'bg-neutral-900 border-neutral-800 text-neutral-400'}`}><Mail size={14} /> Email</button>
              </div>

              {authMethod === 'phone' ? (
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Mobile Phone Number</label>
                  <div className="flex rounded-xl overflow-hidden border border-neutral-700 focus-within:ring-2 focus-within:ring-amber-500">
                    <span className="inline-flex items-center px-3.5 bg-neutral-800 text-neutral-300 text-xs font-bold border-r border-neutral-700">🇮🇳 +91</span>
                    <input type="tel" maxLength={10} required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))} placeholder="98765 43210" className="w-full px-3.5 py-3 bg-neutral-850 text-white text-sm focus:outline-none" />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Email Address</label>
                  <div className="relative"><Mail size={16} className="absolute left-3.5 top-3.5 text-neutral-400" /><input type="email" required value={gmailAddress} onChange={(e) => setGmailAddress(e.target.value)} placeholder="you@example.com" className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-neutral-850 border border-neutral-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" /></div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Password</label>
                <input type="password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className="w-full px-3.5 py-3 rounded-xl bg-neutral-850 border border-neutral-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
              </div>

              <button type="submit" className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20">
                <span>{authMode === 'signup' ? 'Continue to profile setup' : 'Sign in securely'}</span><ArrowRight size={16} />
              </button>
            </form>
          </div>
        )}

        {/* STEP 3A: CUSTOMER FIRST-TIME ONBOARDING (SIGNUP) */}
        {step === 'onboarding' && role === 'customer' && (
          <form onSubmit={handleCompleteCustomerSignup} className="space-y-5 animate-in fade-in duration-300">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                <span>First-Time Customer Setup</span>
              </div>
              <h3 className="text-xl font-black text-white">
                Welcome! Let&rsquo;s set up your dining preferences.
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Tell our verified private chefs where to arrive and what dietary style your family prefers.
              </p>
            </div>

            {/* Profile Avatar Selection */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-2">
                Choose Profile Avatar
              </label>
              <div className="flex items-center gap-3">
                {CUSTOMER_AVATARS.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt="avatar"
                    onClick={() => setCustomerAvatar(img)}
                    className={`w-12 h-12 rounded-2xl object-cover cursor-pointer transition-all ${
                      customerAvatar === img
                        ? 'ring-3 ring-amber-500 scale-105'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Full Name & Phone + Gmail Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Rahul Verma"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Verified Phone
                </label>
                <input
                  type="text"
                  readOnly
                  value={`+91 ${phoneNumber}`}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-850 border border-neutral-750 text-neutral-400 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Gmail / Email for Invoices & Booking Status
              </label>
              <input
                type="email"
                required
                value={gmailAddress}
                onChange={(e) => setGmailAddress(e.target.value)}
                placeholder="sateeshevens@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* City & Locality */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  City
                </label>
                <select
                  value={selectedCity.id}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  {INDIAN_CITIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Neighborhood Hub
                </label>
                <select
                  value={selectedArea.name}
                  onChange={(e) => {
                    const found = selectedCity.areas.find((a) => a.name === e.target.value);
                    if (found) setSelectedArea(found);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  {selectedCity.areas.map((a) => (
                    <option key={a.name} value={a.name}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Doorstep Delivery Address
              </label>
              <input
                type="text"
                required
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="Apartment name, Flat number, Street"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* Food Dietary Preference & Household Size */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Dietary Preference
                </label>
                <select
                  value={dietaryPreference}
                  onChange={(e) => setDietaryPreference(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="all">Non-Vegetarian & Vegetarian (All)</option>
                  <option value="veg">Pure Vegetarian 🌱</option>
                  <option value="jain">Jain (No Onion / Garlic) 🌿</option>
                  <option value="vegan">Vegan / Plant-Based 🥑</option>
                  <option value="non_veg">Non-Vegetarian Focus 🍗</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Household Size
                </label>
                <select
                  value={householdSize}
                  onChange={(e) => setHouseholdSize(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option>Solo / Bachelor (1 pax)</option>
                  <option>Couple (2 pax)</option>
                  <option>Family (3-4 pax)</option>
                  <option>Large Family / Party Host (5+ pax)</option>
                </select>
              </div>
            </div>

            {/* Favorite Cuisines Chips */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Favorite Cuisines for Quick Recommendations
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'North Indian / Mughlai',
                  'South Indian / Coastal',
                  'Tandoor & Kebabs',
                  'Continental & Italian',
                  'Pan-Asian & Dimsum',
                  'Healthy / Diet / Keto',
                  'Awadhi Banquet',
                ].map((cuisine) => {
                  const isChecked = selectedCustomerCuisines.includes(cuisine);
                  return (
                    <button
                      key={cuisine}
                      type="button"
                      onClick={() => handleToggleCustomerCuisine(cuisine)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                        isChecked
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                          : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {cuisine}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-black text-sm hover:from-amber-400 hover:to-amber-500 transition-all shadow-xl shadow-amber-500/20 cursor-pointer"
            >
              Complete Signup & Browse On-Demand Chefs
            </button>
          </form>
        )}

        {/* STEP 3B: CHEF SPECIALIZED REGISTRATION (OFFERINGS & SIGNATURE DISHES) */}
        {step === 'onboarding' && role === 'chef' && (
          <form onSubmit={handleCompleteChefSignup} className="space-y-5 animate-in fade-in duration-300">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                <ChefHat size={14} />
                <span>Chef Culinary Partner Registration</span>
              </div>
              <h3 className="text-xl font-black text-white">
                Showcase What You Cook the Best
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Customers choose you based on your signature dishes, specialties, and professional background.
              </p>
            </div>

            {/* Profile Avatar Selection */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-2">
                Choose Professional Chef Avatar
              </label>
              <div className="flex items-center gap-3">
                {CHEF_AVATARS.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt="chef-avatar"
                    onClick={() => setChefAvatar(img)}
                    className={`w-12 h-12 rounded-2xl object-cover cursor-pointer transition-all ${
                      chefAvatar === img
                        ? 'ring-3 ring-amber-500 scale-105'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* SECTION 1: BASIC DETAILS */}
            <div className="p-3.5 rounded-2xl bg-neutral-950/60 border border-neutral-800 space-y-3">
              <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                1. Basic Identity & Location
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Chef Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={chefName}
                    onChange={(e) => setChefName(e.target.value)}
                    placeholder="e.g. Chef Rajesh Sharma"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Years of Culinary Experience
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    required
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Primary City Hub
                  </label>
                  <select
                    value={selectedCity.id}
                    onChange={(e) => handleCityChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {INDIAN_CITIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Base Neighborhood
                  </label>
                  <select
                    value={selectedArea.name}
                    onChange={(e) => {
                      const found = selectedCity.areas.find((a) => a.name === e.target.value);
                      if (found) setSelectedArea(found);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {selectedCity.areas.map((a) => (
                      <option key={a.name} value={a.name}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 2: WHAT THE CHEF CAN OFFER & COOKS THE BEST */}
            <div className="p-3.5 rounded-2xl bg-neutral-950/60 border border-neutral-800 space-y-3.5">
              <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
                <span>2. What You Can Offer & What You Cook Best</span>
                <span className="text-[10px] text-neutral-400">Core Culinary Portfolio</span>
              </div>

              {/* Specialties / Cuisines */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Cuisines You Specialize In (Select all that apply)
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 bg-neutral-900 rounded-xl border border-neutral-800">
                  {CHEF_SPECIALTY_OPTIONS.map((spec) => {
                    const isSelected = selectedSpecialties.includes(spec);
                    return (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => handleToggleSpecialty(spec)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-amber-500 text-neutral-950 font-bold border-amber-400 shadow-sm'
                            : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:text-white'
                        }`}
                      >
                        {spec}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Signature Dishes: What He/She Cooks Best */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Signature Dishes: What You Cook the Best 🍲
                </label>
                <p className="text-[11px] text-neutral-400 mb-2">
                  Highlight specific dishes that turn first-time customers into repeat weekly regulars.
                </p>

                {/* Active Signature Dishes Tags */}
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {signatureDishes.map((dish) => (
                    <span
                      key={dish}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold"
                    >
                      <span>🍛 {dish}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSignatureDish(dish)}
                        className="hover:text-red-400 p-0.5"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add Custom Dish Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customDishInput}
                    onChange={(e) => setCustomDishInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSignatureDish(customDishInput);
                      }
                    }}
                    placeholder="Type a signature dish and press Add..."
                    className="flex-1 px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSignatureDish(customDishInput)}
                    className="px-3.5 py-2 rounded-xl bg-neutral-750 hover:bg-neutral-700 text-white text-xs font-bold flex items-center gap-1 border border-neutral-600"
                  >
                    <Plus size={14} />
                    <span>Add</span>
                  </button>
                </div>

                {/* Quick Dish Suggestions */}
                <div className="mt-2">
                  <span className="text-[10px] text-neutral-400 block mb-1">
                    Quick suggestions (click to add):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {SIGNATURE_DISH_SUGGESTIONS.filter((d) => !signatureDishes.includes(d))
                      .slice(0, 6)
                      .map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => handleAddSignatureDish(suggestion)}
                          className="text-[10px] px-2 py-0.5 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-amber-300 border border-neutral-750"
                        >
                          + {suggestion}
                        </button>
                      ))}
                  </div>
                </div>
              </div>

              {/* Bio & Background */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Culinary Bio & Kitchen Background
                </label>
                <textarea
                  rows={2}
                  value={chefBio}
                  onChange={(e) => setChefBio(e.target.value)}
                  placeholder="Where did you train? What is your cooking style? e.g. Ex-hotel chef with 8 years banquet experience..."
                  className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* SECTION 3: RATES & SERVICE OFFERINGS */}
            <div className="p-3.5 rounded-2xl bg-neutral-950/60 border border-neutral-800 space-y-3">
              <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                3. Service Rates (INR ₹)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-[10px] text-neutral-400 font-semibold mb-1">
                    Hourly Rate
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-xs text-neutral-400 font-bold">₹</span>
                    <input
                      type="number"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      className="w-full pl-6 pr-2 py-1.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-xs font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-neutral-400 font-semibold mb-1">
                    SOS Quick-Fix
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-xs text-neutral-400 font-bold">₹</span>
                    <input
                      type="number"
                      value={sosRate}
                      onChange={(e) => setSosRate(e.target.value)}
                      className="w-full pl-6 pr-2 py-1.5 rounded-xl bg-neutral-800 border border-neutral-700 text-amber-400 text-xs font-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-neutral-400 font-semibold mb-1">
                    Daily Prep Batch
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-xs text-neutral-400 font-bold">₹</span>
                    <input
                      type="number"
                      value={dayPrepRate}
                      onChange={(e) => setDayPrepRate(e.target.value)}
                      className="w-full pl-6 pr-2 py-1.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-xs font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-neutral-400 font-semibold mb-1">
                    B2B Shift (6hr)
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-xs text-neutral-400 font-bold">₹</span>
                    <input
                      type="number"
                      value={shiftRate}
                      onChange={(e) => setShiftRate(e.target.value)}
                      className="w-full pl-6 pr-2 py-1.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-xs font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Hygiene & Verification Pledge */}
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-200">
              <ShieldCheck size={18} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-white">
                  <input
                    type="checkbox"
                    checked={hygienePledgeAccepted}
                    onChange={(e) => setHygienePledgeAccepted(e.target.checked)}
                    className="accent-emerald-500 w-4 h-4 rounded"
                  />
                  <span>FSSAI Hygiene & Police Verification Pledge</span>
                </label>
                <p className="text-[10px] text-emerald-300 mt-0.5">
                  I pledge to maintain sterile sanitization, carry professional kitchen chef knives, and submit my CCTNS police verification dossier.
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-black text-sm hover:from-amber-400 hover:to-amber-500 transition-all shadow-xl shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2"
            >
              <ChefHat size={16} />
              <span>Register Kitchen & Go Live on ChefPulse Radar</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
