import React, { useState } from 'react';

export const ArchitectureView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'schema' | 'wireframes' | 'flows' | 'api'>('schema');
  const [copied, setCopied] = useState(false);

  const sqlSchema = `-- =====================================================================
-- CHEFPULSE BENGALURU: TWO-SIDED CULINARY MARKETPLACE DDL
-- POSTGRESQL 15+ WITH POSTGIS EXTENSION FOR 1-5 KM RADIUS GEOSPATIAL QUERIES
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('customer', 'chef', 'restaurant_manager', 'admin');
CREATE TYPE chef_status AS ENUM ('available', 'busy', 'en_route', 'offline');
CREATE TYPE booking_type AS ENUM ('sos_quick_fix', 'scheduled_prep', 'b2b_gig_shift');
CREATE TYPE booking_status AS ENUM (
  'pending_acceptance', 
  'accepted', 
  'en_route', 
  'arrived', 
  'in_progress', 
  'completed', 
  'cancelled'
);
CREATE TYPE payment_status AS ENUM ('pending', 'captured_escrow', 'released_to_chef', 'refunded');

-- 2. USERS TABLE
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number VARCHAR(15) UNIQUE NOT NULL, -- e.g. +919845012345
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(255) UNIQUE,
  role user_role NOT NULL DEFAULT 'customer',
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CHEF PROFILES TABLE
CREATE TABLE chef_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  experience_years INT NOT NULL DEFAULT 1,
  specialties TEXT[] NOT NULL, -- ['North Indian', 'Tandoor', 'Continental']
  hourly_rate INT NOT NULL DEFAULT 500, -- INR
  sos_rate INT NOT NULL DEFAULT 850, -- INR for 2-hour immediate SOS
  day_prep_rate INT NOT NULL DEFAULT 1400, -- INR for 3-meal batch prep
  shift_rate INT NOT NULL DEFAULT 2800, -- INR for 5-hour restaurant gig
  bio TEXT,
  languages TEXT[] DEFAULT ARRAY['English', 'Kannada', 'Hindi'],
  hygiene_certified BOOLEAN DEFAULT TRUE,
  police_verified BOOLEAN DEFAULT TRUE,
  signature_dishes TEXT[] NOT NULL,
  average_rating NUMERIC(3,2) DEFAULT 5.00,
  total_reviews_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CHEF LIVE GEOLOCATION (High-frequency PostGIS table for 1-5 km queries)
CREATE TABLE chef_live_locations (
  chef_id UUID PRIMARY KEY REFERENCES chef_profiles(id) ON DELETE CASCADE,
  location GEOGRAPHY(Point, 4326) NOT NULL, -- Lat/Lng with Spatial Index
  area_name VARCHAR(100) NOT NULL, -- 'Indiranagar 100ft Road'
  is_online BOOLEAN NOT NULL DEFAULT FALSE,
  current_status chef_status NOT NULL DEFAULT 'available',
  last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SPATIAL GIST INDEX for microsecond radius matching
CREATE INDEX idx_chef_live_location ON chef_live_locations USING GIST(location);
CREATE INDEX idx_chef_online_status ON chef_live_locations(is_online, current_status);

-- 5. BOOKINGS TABLE
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_type booking_type NOT NULL,
  customer_id UUID NOT NULL REFERENCES users(id),
  chef_id UUID NOT NULL REFERENCES chef_profiles(id),
  service_address TEXT NOT NULL,
  area_name VARCHAR(100) NOT NULL,
  destination_location GEOGRAPHY(Point, 4326) NOT NULL,
  scheduled_time TIMESTAMP WITH TIME ZONE, -- NULL if SOS immediate
  dishes_requested TEXT NOT NULL,
  special_instructions TEXT,
  total_amount NUMERIC(10,2) NOT NULL,
  platform_fee NUMERIC(10,2) NOT NULL DEFAULT 49.00,
  gst_amount NUMERIC(10,2) NOT NULL,
  status booking_status NOT NULL DEFAULT 'pending_acceptance',
  doorstep_otp VARCHAR(4) NOT NULL, -- 4-digit code e.g. '4821'
  payment_status payment_status NOT NULL DEFAULT 'pending',
  accepted_at TIMESTAMP WITH TIME ZONE,
  arrived_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_chef ON bookings(chef_id);
CREATE INDEX idx_bookings_status ON bookings(status);

-- 6. B2B EMERGENCY SHIFT REQUESTS TABLE
CREATE TABLE b2b_shift_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_manager_id UUID NOT NULL REFERENCES users(id),
  restaurant_name VARCHAR(150) NOT NULL,
  area_name VARCHAR(100) NOT NULL,
  location GEOGRAPHY(Point, 4326) NOT NULL,
  role_needed VARCHAR(80) NOT NULL, -- 'Tandoor Chef', 'Line Cook / CDP'
  shift_timing VARCHAR(80) NOT NULL, -- 'Dinner Rush (6 PM - 11 PM)'
  hourly_rate NUMERIC(10,2) NOT NULL,
  total_payout NUMERIC(10,2) NOT NULL,
  status VARCHAR(40) DEFAULT 'open', -- 'open', 'matched', 'fulfilled'
  matched_chef_id UUID REFERENCES chef_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. JOB POSTINGS (Full-time restaurant vacancies)
CREATE TABLE job_postings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  posted_by_user_id UUID NOT NULL REFERENCES users(id),
  restaurant_name VARCHAR(150) NOT NULL,
  title VARCHAR(120) NOT NULL, -- 'Senior Tandoor & Grill Master'
  location VARCHAR(120) NOT NULL,
  salary_range VARCHAR(80) NOT NULL, -- '₹50,000 - ₹65,000 / month'
  experience_required VARCHAR(80) NOT NULL,
  cuisine_category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT[] NOT NULL,
  benefits TEXT[] NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. JOB APPLICATIONS TABLE
CREATE TABLE job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  chef_id UUID NOT NULL REFERENCES chef_profiles(id) ON DELETE CASCADE,
  pitch TEXT NOT NULL,
  status VARCHAR(40) DEFAULT 'applied', -- 'applied', 'shortlisted', 'trial_scheduled', 'hired'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. CATERING INQUIRIES TABLE
CREATE TABLE catering_inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES users(id),
  customer_name VARCHAR(120) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  event_date DATE NOT NULL,
  event_time VARCHAR(80) NOT NULL,
  event_type VARCHAR(80) NOT NULL,
  guest_count INT NOT NULL,
  budget_per_plate NUMERIC(10,2) NOT NULL,
  total_budget_estimate NUMERIC(12,2) NOT NULL,
  preferred_cuisines TEXT[] NOT NULL,
  live_counters_needed TEXT[] NOT NULL,
  dietary_preferences TEXT[] NOT NULL,
  venue_location TEXT NOT NULL,
  additional_notes TEXT,
  status VARCHAR(40) DEFAULT 'submitted',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. POSTGIS RADIUS MATCHING FUNCTION (Find chefs within X km)
CREATE OR REPLACE FUNCTION get_active_chefs_within_radius(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION
)
RETURNS TABLE (
  chef_id UUID,
  full_name VARCHAR,
  distance_meters DOUBLE PRECISION,
  sos_rate INT,
  specialties TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cp.id AS chef_id,
    u.full_name,
    ST_Distance(
      cll.location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
    ) AS distance_meters,
    cp.sos_rate,
    cp.specialties
  FROM chef_live_locations cll
  JOIN chef_profiles cp ON cll.chef_id = cp.id
  JOIN users u ON cp.user_id = u.id
  WHERE cll.is_online = TRUE 
    AND cll.current_status = 'available'
    AND ST_DWithin(
      cll.location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      radius_km * 1000
    )
  ORDER BY distance_meters ASC;
END;
$$ LANGUAGE plpgsql;`;

  const copySchema = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Blueprint Header */}
      <div className="rounded-3xl bg-neutral-900 border border-neutral-800 p-6 sm:p-8 shadow-2xl relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <span>📐 System Architecture & Technical Specifications</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              ChefPulse Platform Architecture & Schema Blueprint
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-2xl">
              Production-ready data contracts, PostGIS geospatial schemas, screen wireframe blueprints, and user flow state machines for Bangalore's two-sided culinary marketplace.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-neutral-800 text-emerald-400 border border-emerald-500/30">
              ● Schema Validated
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-neutral-800">
          {[
            { id: 'schema', label: '🗄️ Database Schema (PostgreSQL / PostGIS)', desc: 'Tables, Foreign Keys & Spatial Index' },
            { id: 'wireframes', label: '🖼️ Screen Wireframes', desc: 'UI Layout Blueprints & Component Trees' },
            { id: 'flows', label: '🔀 User Flow State Machines', desc: 'SOS Radar, Catering & B2B Shift Loops' },
            { id: 'api', label: '🔌 API & WebSocket Contracts', desc: 'REST Endpoints & Real-time Events' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-neutral-950 shadow-lg shadow-amber-500/20'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              <div>{tab.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: Database Schema */}
      {activeTab === 'schema' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-neutral-400">
              PostgreSQL 15+ Schema with <strong>PostGIS</strong> geospatial indexing (`ST_DWithin` & `ST_Distance`) for 1–5 km radius queries.
            </div>
            <button
              onClick={copySchema}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-400 text-xs font-bold border border-neutral-700 transition-colors flex items-center gap-1.5"
            >
              <span>{copied ? '✓ Copied SQL' : '📋 Copy DDL SQL'}</span>
            </button>
          </div>

          {/* Table Summary Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800">
              <span className="text-amber-400 font-bold">1. users</span>
              <p className="text-[11px] text-neutral-400 mt-1">Multi-role OTP auth (Customer, Chef, GM)</p>
            </div>
            <div className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800">
              <span className="text-amber-400 font-bold">2. chef_live_locations</span>
              <p className="text-[11px] text-neutral-400 mt-1">PostGIS Point geometry & GiST index</p>
            </div>
            <div className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800">
              <span className="text-amber-400 font-bold">3. bookings</span>
              <p className="text-[11px] text-neutral-400 mt-1">SOS/Prep lifecycle & Doorstep 4-digit OTP</p>
            </div>
            <div className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800">
              <span className="text-amber-400 font-bold">4. b2b_shift_requests</span>
              <p className="text-[11px] text-neutral-400 mt-1">Emergency kitchen covers & hourly escrow</p>
            </div>
          </div>

          <div className="relative rounded-2xl bg-neutral-950 border border-neutral-800 p-4 font-mono text-xs text-neutral-300 overflow-x-auto max-h-[580px]">
            <pre>{sqlSchema}</pre>
          </div>
        </div>
      )}

      {/* TAB 2: Screen Wireframes */}
      {activeTab === 'wireframes' && (
        <div className="space-y-6">
          <div className="text-xs text-neutral-400">
            Diagrammatic structural wireframes illustrating the screen hierarchies for both Customer & Chef apps.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Wireframe 1: Customer Home Screen */}
            <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800 text-amber-400 font-bold">
                <span>[WIREFRAME 01] Customer Home Screen</span>
                <span className="text-[10px] text-neutral-400">Role: Customer</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-950 border border-dashed border-neutral-800 text-[11px] leading-relaxed text-neutral-300 whitespace-pre">
{`+-----------------------------------------------------+
| [Header] Logo | Locality Picker [Indiranagar] | Auth|
+-----------------------------------------------------+
| Hero Banner: "Uber for Chefs & Staffing" (BLR)      |
+-----------------------------------------------------+
| EXACTLY THREE DISTINCT ROUTING CARDS:               |
|                                                     |
| [CARD 1: HOME SERVICES]                             |
|  - Tag: "Rapido Live Map"                           |
|  - Subtext: SOS Quick-Fix / Next-Day Meal Prep      |
|  - CTA: "Launch Rapido Live Map ->"                 |
|                                                     |
| [CARD 2: CATERING SERVICE]                          |
|  - Tag: "Luxury Galleries (No Map)"                 |
|  - Subtext: Events, Banquets, Mobile Woodfire Pizza |
|  - CTA: "Design Banquet & Request Proposal ->"      |
|                                                     |
| [CARD 3: HIRE CHEF (B2B)]                           |
|  - Tag: "Hospitality Staffing Hub"                  |
|  - Subtext: Emergency Shift Staff & Job Board       |
|  - CTA: "Enter B2B Hospitality Portal ->"           |
+-----------------------------------------------------+
| Trust Footer: Police Vetted | 22m SOS | Escrow      |
+-----------------------------------------------------+`}
              </div>
              <p className="text-[11px] text-neutral-400">
                <strong>UX Note:</strong> Strict 3-card entry prevents cognitive overload and routes homeowners vs event organizers vs hotel managers cleanly.
              </p>
            </div>

            {/* Wireframe 2: Option 1 Home Services */}
            <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800 text-amber-400 font-bold">
                <span>[WIREFRAME 02] Option 1: Home Services</span>
                <span className="text-[10px] text-neutral-400">Rapido Live Map</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-950 border border-dashed border-neutral-800 text-[11px] leading-relaxed text-neutral-300 whitespace-pre">
{`+-----------------------------------------------------+
| <- Back | Radius Slider: [ 1km ===●===== 5km ]     |
+-----------------------------------------------------+
| [Interactive Leaflet Map]                           |
|  - GPS User Pin: 🏠 [Indiranagar 100ft Rd]          |
|  - Active Chefs: 👨‍🍳 (Hat icons within radius circle)|
|  - Radar HUD: "4 Chefs Active within 3 km"          |
|  - Recenter GPS button                              |
+-----------------------------------------------------+
| [Chef Detail Sheet] (When marker clicked):          |
|  - Chef Name, Photo, Rating, Distance (1.2 km)      |
|  - Specialties, Bio & Hygiene Badges                |
|  - [BUTTON: 🚨 Request SOS Quick-Fix (Instant)]     |
|  - [BUTTON: 📅 Schedule Next-Day Meal Prep]         |
+-----------------------------------------------------+
| [Order Live Modal]: Timeline + Doorstep OTP (4821)  |
+-----------------------------------------------------+`}
              </div>
              <p className="text-[11px] text-neutral-400">
                <strong>UX Note:</strong> Hyper-local matching with instant SOS booking triggers 30s broadcast to nearby cooks.
              </p>
            </div>

            {/* Wireframe 3: Option 2 Catering */}
            <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800 text-amber-400 font-bold">
                <span>[WIREFRAME 03] Option 2: Catering Service</span>
                <span className="text-[10px] text-neutral-400">No Map / Gallery</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-950 border border-dashed border-neutral-800 text-[11px] leading-relaxed text-neutral-300 whitespace-pre">
{`+-----------------------------------------------------+
| Luxury Title: "Bespoke Catering & Events"           |
+-----------------------------------------------------+
| Plated Food Gallery:                                |
|  [Awadhi Dastarkhwan] [Dakshin Feast] [Woodfire]    |
+-----------------------------------------------------+
| Multi-Step Inquiry Wizard:                          |
|  Step 1: Event Type | Guest Count (15-350) | Date   |
|  Step 2: Cuisines (BBQ, Sushi, Awadhi) & Live Stalls|
|  Step 3: Budget/Plate Slider (₹1k-₹3.5k) & Dietary  |
|  Step 4: Contact & Review -> Instant Quote Estimate |
+-----------------------------------------------------+
| [CTA: Submit Catering Proposal Request 🍽️]          |
+-----------------------------------------------------+`}
              </div>
            </div>

            {/* Wireframe 4: Option 3 B2B Portal & Chef App */}
            <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800 text-amber-400 font-bold">
                <span>[WIREFRAME 04] Chef App (Provider Side)</span>
                <span className="text-[10px] text-neutral-400">Driver Experience</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-950 border border-dashed border-neutral-800 text-[11px] leading-relaxed text-neutral-300 whitespace-pre">
{`+-----------------------------------------------------+
| Chef Header: Rajesh Sharma (4.9 ★)                 |
| [TOGGLE: ONLINE / OFFLINE] (GPS broadcast switch)   |
+-----------------------------------------------------+
| Tabs: [Radar] | [Active Gig] | [Jobs] | [Earnings]  |
+-----------------------------------------------------+
| [POP-UP: INCOMING GIG NOTIFICATION]                 |
|  - 30-Second Countdown Bar (Urgent Audio Ping)      |
|  - Estimated Payout: ₹850 | Distance: 1.4 km        |
|  - Customer: Pooja Hegde | Dishes: Butter Chicken   |
|  - [DECLINE (Red)]      [ACCEPT BOOKING (Green)]    |
+-----------------------------------------------------+
| [Active Gig Workflow]:                              |
|  1. Tap "En Route" -> 2. "Arrived" ->               |
|  3. Enter Customer 4-digit OTP -> 4. "Finished"     |
+-----------------------------------------------------+`}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: User Flow State Machines */}
      {activeTab === 'flows' && (
        <div className="space-y-6">
          <div className="text-xs text-neutral-400">
            End-to-end lifecycle state diagrams for bookings, emergency shifts, and catering inquiries.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Flow 1: SOS Quick-Fix State Machine */}
            <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5 space-y-3">
              <h4 className="text-sm font-bold text-amber-400">
                1. Customer SOS Quick-Fix Lifecycle (Rapido Style)
              </h4>
              <div className="space-y-2 text-xs">
                {[
                  { step: '1. GPS Initialization', detail: 'App requests browser GPS and resolves Bangalore locality (e.g. Indiranagar).' },
                  { step: '2. Spatial Query', detail: 'Executes ST_DWithin query returning online chefs within 1-5 km radius circle.' },
                  { step: '3. SOS Selection & Razorpay Escrow', detail: 'Customer selects chef, inputs menu, and pays booking fee into escrow.' },
                  { step: '4. 30s Radar Dispatch', detail: 'Chef app triggers audio ping chime and 30-second countdown pop-up.' },
                  { step: '5. Acceptance & Commute', detail: 'Chef accepts; customer sees live en-route status, ETA, and 4-digit security OTP.' },
                  { step: '6. Doorstep OTP Handshake', detail: 'Chef reaches address, customer shares 4-digit OTP, unlocking cooking session.' },
                  { step: '7. Meal Ready & Escrow Release', detail: 'Chef completes cooking, kitchen is inspected, escrow released to chef wallet.' },
                ].map((s, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-black flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-white">{s.step}</div>
                      <div className="text-neutral-400 text-[11px] mt-0.5">{s.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Flow 2: B2B Emergency Kitchen Staffing */}
            <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5 space-y-3">
              <h4 className="text-sm font-bold text-blue-400">
                2. B2B Emergency Restaurant Shift Dispatch
              </h4>
              <div className="space-y-2 text-xs">
                {[
                  { step: '1. Restaurateur Shortage Alert', detail: 'GM opens B2B Portal, selects missing station (e.g. Tandoor Master for 6 PM - 11 PM).' },
                  { step: '2. Live Radius Pinpoint', detail: 'Live map filters available gig cooks within short radius with commercial experience.' },
                  { step: '3. Instant Shift Broadcast', detail: 'Dispatches emergency shift request with pre-funded shift payout (e.g. ₹2,750).' },
                  { step: '4. Cook One-Tap Claim', detail: 'Cook claims shift on mobile, reviews restaurant address, and checks in on-site.' },
                  { step: '5. Post-Shift Payout Release', detail: 'Manager marks shift fulfilled; cook receives payout directly to UPI.' },
                ].map((s, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-black flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-white">{s.step}</div>
                      <div className="text-neutral-400 text-[11px] mt-0.5">{s.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 4: API & WebSocket Contracts */}
      {activeTab === 'api' && (
        <div className="space-y-4">
          <div className="text-xs text-neutral-400">
            REST API endpoints and real-time WebSocket channels powering the Bangalore marketplace.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            
            <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
              <div className="text-amber-400 font-bold">POST /api/v1/auth/request-otp</div>
              <p className="text-[11px] text-neutral-400 font-sans">Sends 6-digit SMS OTP via Indian SMS Gateway (Karix/Twilio).</p>
              <div className="bg-neutral-950 p-2.5 rounded-xl text-neutral-300">
                {`{ "phoneNumber": "+919845012345", "role": "customer" }`}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
              <div className="text-emerald-400 font-bold">GET /api/v1/chefs/nearby</div>
              <p className="text-[11px] text-neutral-400 font-sans">Executes PostGIS ST_DWithin query within given radius (1-5km).</p>
              <div className="bg-neutral-950 p-2.5 rounded-xl text-neutral-300">
                {`?lat=12.9784&lng=77.6408&radiusKm=3.0`}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
              <div className="text-blue-400 font-bold">POST /api/v1/bookings/sos-request</div>
              <p className="text-[11px] text-neutral-400 font-sans">Creates immediate booking, generates OTP, triggers Chef WebSocket alert.</p>
              <div className="bg-neutral-950 p-2.5 rounded-xl text-neutral-300">
                {`{ "chefId": "chef-01", "dishes": "Dal Makhani", "area": "Indiranagar" }`}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
              <div className="text-purple-400 font-bold">WS /ws/chef/radar (WebSocket)</div>
              <p className="text-[11px] text-neutral-400 font-sans">Bi-directional channel for live GPS heartbeats and 30s gig dispatch pings.</p>
              <div className="bg-neutral-950 p-2.5 rounded-xl text-neutral-300">
                {`EVENT: "INCOMING_BOOKING_ALERT" -> { timeoutMs: 30000, payout: 850 }`}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
