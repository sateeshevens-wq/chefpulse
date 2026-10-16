import { CityInfo, CityArea } from '../types';

export const INDIAN_CITIES: CityInfo[] = [
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    code: 'BLR',
    state: 'Karnataka',
    statePoliceCode: 'CCTNS_KA',
    statePoliceJurisdiction: 'Bengaluru City Police HQ, Infantry Road',
    region: 'South',
    tier: 'Metro',
    tagline: "India's Tech Capital & Cosmopolitan Culinary Crucible",
    popularCuisines: ['South Indian / Coastal', 'Tandoor & Kebabs', 'Continental & Italian', 'Pan-Asian & Dimsum'],
    activeChefsCount: 42,
    centerLat: 12.9716,
    centerLng: 77.5946,
    areas: [
      { name: 'Indiranagar 100ft Road', lat: 12.9784, lng: 77.6408, label: 'Indiranagar', pincode: '560038' },
      { name: 'Koramangala 4th Block', lat: 12.9352, lng: 77.6245, label: 'Koramangala', pincode: '560034' },
      { name: 'HSR Layout Sector 3', lat: 12.9116, lng: 77.6473, label: 'HSR Layout', pincode: '560102' },
      { name: 'Lavelle Road / MG Road', lat: 12.9719, lng: 77.5997, label: 'Lavelle Road', pincode: '560001' },
      { name: 'Whitefield EPIP Zone', lat: 12.9818, lng: 77.7289, label: 'Whitefield', pincode: '560066' },
      { name: 'JP Nagar 6th Phase', lat: 12.9063, lng: 77.5857, label: 'JP Nagar', pincode: '560078' },
      { name: 'Jayanagar 4th Block', lat: 12.9298, lng: 77.5838, label: 'Jayanagar', pincode: '560011' },
      { name: 'Malleshwaram 8th Cross', lat: 13.0031, lng: 77.5684, label: 'Malleshwaram', pincode: '560003' },
    ],
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    code: 'BOM',
    state: 'Maharashtra',
    statePoliceCode: 'CCTNS_MH',
    statePoliceJurisdiction: 'Greater Mumbai Police Commissionerate, Crawford Market',
    region: 'West',
    tier: 'Metro',
    tagline: 'Maximum City: Coastal Seafood, Parsi Delicacies & Haute Dining',
    popularCuisines: ['Maharashtrian & Malvani', 'Continental & Italian', 'Pan-Asian & Dimsum', 'North Indian / Mughlai'],
    activeChefsCount: 58,
    centerLat: 19.0760,
    centerLng: 72.8777,
    areas: [
      { name: 'Bandra West (Pali Hill)', lat: 19.0596, lng: 72.8295, label: 'Bandra West', pincode: '400050' },
      { name: 'Juhu Tara Road', lat: 19.1025, lng: 72.8267, label: 'Juhu', pincode: '400049' },
      { name: 'Lower Parel (High Street)', lat: 18.9953, lng: 72.8248, label: 'Lower Parel', pincode: '400013' },
      { name: 'BKC Bandra-Kurla Complex', lat: 19.0664, lng: 72.8687, label: 'BKC', pincode: '400051' },
      { name: 'Powai Hiranandani', lat: 19.1197, lng: 72.9051, label: 'Powai', pincode: '400076' },
      { name: 'Colaba Causeway', lat: 18.9067, lng: 72.8147, label: 'Colaba', pincode: '400005' },
      { name: 'Andheri West (Lokhandwala)', lat: 19.1364, lng: 72.8273, label: 'Lokhandwala', pincode: '400053' },
      { name: 'Worli Sea Face', lat: 19.0166, lng: 72.8175, label: 'Worli', pincode: '400018' },
    ],
  },
  {
    id: 'delhi_ncr',
    name: 'Delhi NCR',
    code: 'DEL',
    state: 'National Capital Region',
    statePoliceCode: 'CCTNS_DL',
    statePoliceJurisdiction: 'Delhi Police HQ, Jai Singh Road, New Delhi',
    region: 'North',
    tier: 'Metro',
    tagline: 'Imperial Capital of Nawabi Tandoor, Mughlai Dum & Global Bistros',
    popularCuisines: ['North Indian / Mughlai', 'Tandoor & Kebabs', 'Awadhi Banquet', 'Continental & Italian'],
    activeChefsCount: 64,
    centerLat: 28.6139,
    centerLng: 77.2090,
    areas: [
      { name: 'Connaught Place Inner Circle', lat: 28.6315, lng: 77.2167, label: 'Connaught Place', pincode: '110001' },
      { name: 'DLF Cyber Hub (Gurugram)', lat: 28.4952, lng: 77.0895, label: 'Cyber City Gurugram', pincode: '122002' },
      { name: 'Greater Kailash (GK 1 & 2)', lat: 28.5482, lng: 77.2344, label: 'Greater Kailash', pincode: '110048' },
      { name: 'Vasant Vihar', lat: 28.5603, lng: 77.1610, label: 'Vasant Vihar', pincode: '110057' },
      { name: 'Defence Colony Main', lat: 28.5733, lng: 77.2312, label: 'Defence Colony', pincode: '110024' },
      { name: 'Noida Sector 18 (Atta)', lat: 28.5708, lng: 77.3260, label: 'Noida Sector 18', pincode: '201301' },
      { name: 'Golf Course Road (Gurugram)', lat: 28.4595, lng: 77.0940, label: 'Golf Course Road', pincode: '122003' },
      { name: 'Hauz Khas Village', lat: 28.5535, lng: 77.1944, label: 'Hauz Khas', pincode: '110016' },
    ],
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    code: 'HYD',
    state: 'Telangana',
    statePoliceCode: 'CCTNS_TG',
    statePoliceJurisdiction: 'Hyderabad City Police Commissionerate, Basheerbagh',
    region: 'South',
    tier: 'Metro',
    tagline: 'City of Pearls: Authentic Kacchi Dum Biryani, Haleem & Royal Nizami Feast',
    popularCuisines: ['Hyderabadi Dum & Nizami', 'Tandoor & Kebabs', 'North Indian / Mughlai', 'South Indian / Coastal'],
    activeChefsCount: 38,
    centerLat: 17.3850,
    centerLng: 78.4867,
    areas: [
      { name: 'Jubilee Hills Road 36', lat: 17.4319, lng: 78.4073, label: 'Jubilee Hills', pincode: '500033' },
      { name: 'Banjara Hills Road 12', lat: 17.4156, lng: 78.4350, label: 'Banjara Hills', pincode: '500034' },
      { name: 'HITEC City Cyber Towers', lat: 17.4504, lng: 78.3808, label: 'HITEC City', pincode: '500081' },
      { name: 'Gachibowli Financial District', lat: 17.4401, lng: 78.3489, label: 'Gachibowli', pincode: '500032' },
      { name: 'Madhapur Mindspace', lat: 17.4435, lng: 78.3861, label: 'Madhapur', pincode: '500081' },
      { name: 'Begumpet Airport Vicinity', lat: 17.4440, lng: 78.4680, label: 'Begumpet', pincode: '500016' },
    ],
  },
  {
    id: 'chennai',
    name: 'Chennai',
    code: 'MAA',
    state: 'Tamil Nadu',
    statePoliceCode: 'CCTNS_TN',
    statePoliceJurisdiction: 'Greater Chennai Police Commissionerate, Vepery',
    region: 'South',
    tier: 'Metro',
    tagline: 'Coastal Coromandel: Chettinad Banquets, Kongunadu & Artisanal Coffee Grinds',
    popularCuisines: ['South Indian / Coastal', 'Pan-Asian & Dimsum', 'Healthy / Diet / Keto', 'North Indian / Mughlai'],
    activeChefsCount: 34,
    centerLat: 13.0827,
    centerLng: 80.2707,
    areas: [
      { name: 'Alwarpet TTK Road', lat: 13.0339, lng: 80.2514, label: 'Alwarpet', pincode: '600018' },
      { name: 'Besant Nagar Elliot Beach', lat: 13.0001, lng: 80.2667, label: 'Besant Nagar', pincode: '600090' },
      { name: 'Anna Nagar 2nd Avenue', lat: 13.0850, lng: 80.2101, label: 'Anna Nagar', pincode: '600040' },
      { name: 'Nungambakkam High Road', lat: 13.0569, lng: 80.2425, label: 'Nungambakkam', pincode: '600034' },
      { name: 'OMR Thoraipakkam IT Corridor', lat: 12.9416, lng: 80.2362, label: 'OMR IT Corridor', pincode: '600097' },
      { name: 'Adyar Kasturibai Nagar', lat: 13.0064, lng: 80.2575, label: 'Adyar', pincode: '600020' },
    ],
  },
  {
    id: 'kolkata',
    name: 'Kolkata',
    code: 'CCU',
    state: 'West Bengal',
    statePoliceCode: 'CCTNS_WB',
    statePoliceJurisdiction: 'Kolkata Police HQ, Lalbazar',
    region: 'East',
    tier: 'Metro',
    tagline: 'City of Joy: Slow-Cooked Kosha Mangsho, Daab Chingri & Royal Bengali Sweets',
    popularCuisines: ['Bengali Royal Feast', 'North Indian / Mughlai', 'Continental & Italian', 'Pan-Asian & Dimsum'],
    activeChefsCount: 31,
    centerLat: 22.5726,
    centerLng: 88.3639,
    areas: [
      { name: 'Park Street Dining Row', lat: 22.5510, lng: 88.3526, label: 'Park Street', pincode: '700016' },
      { name: 'Salt Lake Sector V Tech Hub', lat: 22.5804, lng: 88.4378, label: 'Salt Lake Sector V', pincode: '700091' },
      { name: 'Ballygunge Circular Road', lat: 22.5280, lng: 88.3654, label: 'Ballygunge', pincode: '700019' },
      { name: 'New Town Action Area 1', lat: 22.5900, lng: 88.4700, label: 'New Town', pincode: '700156' },
      { name: 'Alipore Judges Court', lat: 22.5312, lng: 88.3320, label: 'Alipore', pincode: '700027' },
      { name: 'Southern Avenue Lake Vicinity', lat: 22.5125, lng: 88.3585, label: 'Southern Avenue', pincode: '700029' },
    ],
  },
  {
    id: 'pune',
    name: 'Pune',
    code: 'PNQ',
    state: 'Maharashtra',
    statePoliceCode: 'CCTNS_MH',
    statePoliceJurisdiction: 'Pune City Police Commissionerate, Sadhu Vaswani Road',
    region: 'West',
    tier: 'Tier-1',
    tagline: 'Oxford of the East: Parsi Delights, Kolhapuri Spice & Hip Microbreweries',
    popularCuisines: ['Maharashtrian & Malvani', 'Continental & Italian', 'Tandoor & Kebabs', 'Healthy / Diet / Keto'],
    activeChefsCount: 29,
    centerLat: 18.5204,
    centerLng: 73.8567,
    areas: [
      { name: 'Koregaon Park North Main Road', lat: 18.5362, lng: 73.8939, label: 'Koregaon Park', pincode: '411001' },
      { name: 'Kalyani Nagar Central', lat: 18.5484, lng: 73.9037, label: 'Kalyani Nagar', pincode: '411006' },
      { name: 'Baner High Street', lat: 18.5590, lng: 73.7868, label: 'Baner', pincode: '411045' },
      { name: 'Viman Nagar Phoenix Corridor', lat: 18.5679, lng: 73.9143, label: 'Viman Nagar', pincode: '411014' },
      { name: 'Hinjawadi Phase 1 IT Park', lat: 18.5913, lng: 73.7389, label: 'Hinjawadi', pincode: '411057' },
      { name: 'Kothrud Paud Road', lat: 18.5074, lng: 73.8077, label: 'Kothrud', pincode: '411038' },
    ],
  },
  {
    id: 'ahmedabad',
    name: 'Ahmedabad',
    code: 'AMD',
    state: 'Gujarat',
    statePoliceCode: 'CCTNS_GJ',
    statePoliceJurisdiction: 'Ahmedabad Police Commissionerate, Shahibaug',
    region: 'West',
    tier: 'Tier-1',
    tagline: 'Heritage Culinary City: Gourmet Royal Thalis, Kathiyawadi & Global Live Grills',
    popularCuisines: ['North Indian / Mughlai', 'Continental & Italian', 'Pan-Asian & Dimsum', 'Healthy / Diet / Keto'],
    activeChefsCount: 24,
    centerLat: 23.0225,
    centerLng: 72.5714,
    areas: [
      { name: 'SG Highway Titanium City', lat: 23.0489, lng: 72.5186, label: 'SG Highway', pincode: '380054' },
      { name: 'Bodakdev Judges Bungalow', lat: 23.0375, lng: 72.5120, label: 'Bodakdev', pincode: '380054' },
      { name: 'Sindhu Bhavan Road Luxury Row', lat: 23.0450, lng: 72.4980, label: 'Sindhu Bhavan', pincode: '380059' },
      { name: 'Vastrapur Lake Vicinity', lat: 23.0354, lng: 72.5293, label: 'Vastrapur', pincode: '380015' },
      { name: 'Satellite Shyamal Cross Roads', lat: 23.0180, lng: 72.5280, label: 'Satellite', pincode: '380015' },
      { name: 'Navrangpura CG Road', lat: 23.0360, lng: 72.5590, label: 'Navrangpura', pincode: '380009' },
    ],
  },
  {
    id: 'jaipur',
    name: 'Jaipur',
    code: 'JAI',
    state: 'Rajasthan',
    statePoliceCode: 'CCTNS_RJ',
    statePoliceJurisdiction: 'Jaipur Police Commissionerate, Government Hostel Crossing',
    region: 'North',
    tier: 'Tier-1',
    tagline: 'The Pink City: Royal Rajputana Shikar Banquets, Dal Baati & Handi Maas',
    popularCuisines: ['Rajasthani & Marwari', 'North Indian / Mughlai', 'Tandoor & Kebabs', 'Awadhi Banquet'],
    activeChefsCount: 26,
    centerLat: 26.9124,
    centerLng: 75.7873,
    areas: [
      { name: 'C-Scheme Ashok Nagar', lat: 26.9080, lng: 75.8010, label: 'C-Scheme', pincode: '302001' },
      { name: 'Malviya Nagar Calgiri Road', lat: 26.8530, lng: 75.8150, label: 'Malviya Nagar', pincode: '302017' },
      { name: 'Vaishali Nagar Amrapali Circle', lat: 26.9050, lng: 75.7430, label: 'Vaishali Nagar', pincode: '302021' },
      { name: 'Raja Park Fashion Street', lat: 26.8920, lng: 75.8280, label: 'Raja Park', pincode: '302004' },
      { name: 'Civil Lines Heritage Enclave', lat: 26.9020, lng: 75.7820, label: 'Civil Lines', pincode: '302006' },
      { name: 'Mansarovar VT Road', lat: 26.8600, lng: 75.7600, label: 'Mansarovar', pincode: '302020' },
    ],
  },
  {
    id: 'goa',
    name: 'Goa',
    code: 'GOI',
    state: 'Goa',
    statePoliceCode: 'CCTNS_GA',
    statePoliceJurisdiction: 'Goa Police HQ, Altinho, Panaji',
    region: 'West',
    tier: 'Tier-2',
    tagline: 'Coastal Destination Capital: Portuguese Vindaloo, Kingfish Rava & Poolside Grills',
    popularCuisines: ['Goan Portuguese & Coastal', 'Continental & Italian', 'Tandoor & Kebabs', 'Pan-Asian & Dimsum'],
    activeChefsCount: 32,
    centerLat: 15.2993,
    centerLng: 74.1240,
    areas: [
      { name: 'Assagao Boutiques & Villas', lat: 15.5910, lng: 73.7780, label: 'Assagao', pincode: '403507' },
      { name: 'Anjuna Vagator Clifftop', lat: 15.5870, lng: 73.7430, label: 'Anjuna / Vagator', pincode: '403509' },
      { name: 'Panaji Miramar Beach', lat: 15.4850, lng: 73.8110, label: 'Panaji / Miramar', pincode: '403001' },
      { name: 'Candolim Calangute Strip', lat: 15.5180, lng: 73.7650, label: 'Candolim', pincode: '403515' },
      { name: 'Morjim Ashwem Beachfront', lat: 15.6290, lng: 73.7310, label: 'Morjim / Ashwem', pincode: '403512' },
      { name: 'Benaulim / Colva (South Goa)', lat: 15.2580, lng: 73.9210, label: 'South Goa Villas', pincode: '403716' },
    ],
  },
  {
    id: 'kochi',
    name: 'Kochi',
    code: 'COK',
    state: 'Kerala',
    statePoliceCode: 'CCTNS_KL',
    statePoliceJurisdiction: 'Kochi City Police Commissionerate, Revenue Tower',
    region: 'South',
    tier: 'Tier-2',
    tagline: 'Queen of Arabian Sea: Malabar Biryanis, Karimeen Pollichathu & Appam Stufas',
    popularCuisines: ['South Indian / Coastal', 'Pan-Asian & Dimsum', 'Continental & Italian', 'Healthy / Diet / Keto'],
    activeChefsCount: 22,
    centerLat: 9.9312,
    centerLng: 76.2673,
    areas: [
      { name: 'Panampilly Nagar Boulevard', lat: 9.9620, lng: 76.2990, label: 'Panampilly Nagar', pincode: '682036' },
      { name: 'Marine Drive Waterfront', lat: 9.9830, lng: 76.2770, label: 'Marine Drive', pincode: '682031' },
      { name: 'Kakkanad Infopark Tech Enclave', lat: 10.0120, lng: 76.3570, label: 'Kakkanad Infopark', pincode: '682030' },
      { name: 'Fort Kochi Heritage Row', lat: 9.9650, lng: 76.2420, label: 'Fort Kochi', pincode: '682001' },
      { name: 'Edappally Lulu Mall Zone', lat: 10.0260, lng: 76.3080, label: 'Edappally', pincode: '682024' },
      { name: 'Kadavanthra Junction', lat: 9.9670, lng: 76.3050, label: 'Kadavanthra', pincode: '682020' },
    ],
  },
  {
    id: 'chandigarh',
    name: 'Chandigarh / Tricity',
    code: 'IXC',
    state: 'Chandigarh / Punjab / Haryana',
    statePoliceCode: 'CCTNS_CH',
    statePoliceJurisdiction: 'Chandigarh Police HQ, Additional Deluxe Building, Sector 9',
    region: 'North',
    tier: 'Tier-1',
    tagline: 'The City Beautiful: Butter-Rich Amritsari Kulchas, Smoked Sigri & Artisanal Brews',
    popularCuisines: ['North Indian / Mughlai', 'Tandoor & Kebabs', 'Continental & Italian', 'Awadhi Banquet'],
    activeChefsCount: 25,
    centerLat: 30.7333,
    centerLng: 76.7794,
    areas: [
      { name: 'Sector 17 Plaza Commercial', lat: 30.7410, lng: 76.7820, label: 'Sector 17', pincode: '160017' },
      { name: 'Sector 35 Food Promenade', lat: 30.7220, lng: 76.7660, label: 'Sector 35', pincode: '160035' },
      { name: 'Sector 26 Madhya Marg Dining', lat: 30.7290, lng: 76.8040, label: 'Sector 26', pincode: '160019' },
      { name: 'Mohali Phase 7 Industrial Area', lat: 30.7060, lng: 76.7210, label: 'Mohali Phase 7', pincode: '160062' },
      { name: 'Panchkula Sector 5 MDC', lat: 30.6940, lng: 76.8520, label: 'Panchkula Sector 5', pincode: '134109' },
      { name: 'Sector 8 Inner Market', lat: 30.7440, lng: 76.8010, label: 'Sector 8', pincode: '160018' },
    ],
  },
  {
    id: 'lucknow',
    name: 'Lucknow',
    code: 'LKO',
    state: 'Uttar Pradesh',
    statePoliceCode: 'CCTNS_UP',
    statePoliceJurisdiction: 'Lucknow Police Commissionerate, Hazratganj',
    region: 'North',
    tier: 'Tier-1',
    tagline: 'The Dastarkhwan Heritage: Melt-in-Mouth Galouti, Purdah Dum & Taftan',
    popularCuisines: ['Awadhi Banquet', 'North Indian / Mughlai', 'Tandoor & Kebabs', 'Continental & Italian'],
    activeChefsCount: 28,
    centerLat: 26.8467,
    centerLng: 80.9462,
    areas: [
      { name: 'Gomti Nagar Vibhuti Khand', lat: 26.8650, lng: 81.0020, label: 'Gomti Nagar', pincode: '226010' },
      { name: 'Hazratganj Royal Corridor', lat: 26.8520, lng: 80.9460, label: 'Hazratganj', pincode: '226001' },
      { name: 'Aliganj Kapoorthala', lat: 26.8850, lng: 80.9430, label: 'Aliganj', pincode: '226024' },
      { name: 'Indira Nagar Munshi Pulia', lat: 26.8830, lng: 80.9890, label: 'Indira Nagar', pincode: '226016' },
      { name: 'Mahanagar Golaganj', lat: 26.8740, lng: 80.9520, label: 'Mahanagar', pincode: '226006' },
      { name: 'Chowk Heritage Old City', lat: 26.8680, lng: 80.9080, label: 'Chowk Old City', pincode: '226003' },
    ],
  },
  {
    id: 'indore',
    name: 'Indore',
    code: 'IDR',
    state: 'Madhya Pradesh',
    statePoliceCode: 'CCTNS_MP',
    statePoliceJurisdiction: 'Indore Police Commissionerate, Regal Square',
    region: 'Central',
    tier: 'Tier-2',
    tagline: 'India’s Cleanest Culinary Mecca: Sarafa Street Delights, Poha Jalebi & Royal Malwa',
    popularCuisines: ['North Indian / Mughlai', 'Tandoor & Kebabs', 'Mexican & Street Food', 'Continental & Italian'],
    activeChefsCount: 20,
    centerLat: 22.7196,
    centerLng: 75.8577,
    areas: [
      { name: 'Vijay Nagar Scheme 54', lat: 22.7533, lng: 75.8937, label: 'Vijay Nagar', pincode: '452010' },
      { name: 'New Palasia 56 Dukan', lat: 22.7230, lng: 75.8820, label: 'New Palasia', pincode: '452001' },
      { name: 'AB Road Super Corridor', lat: 22.7680, lng: 75.8640, label: 'Super Corridor', pincode: '452005' },
      { name: 'Rani Sati Gate YN Road', lat: 22.7290, lng: 75.8710, label: 'YN Road', pincode: '452003' },
    ],
  },
  {
    id: 'surat',
    name: 'Surat',
    code: 'STV',
    state: 'Gujarat',
    statePoliceCode: 'CCTNS_GJ',
    statePoliceJurisdiction: 'Surat Police Commissionerate, Athwalines',
    region: 'West',
    tier: 'Tier-2',
    tagline: 'The Diamond City: Undhiyu Banquets, Ghari Delights & Global Catering Counters',
    popularCuisines: ['North Indian / Mughlai', 'Continental & Italian', 'Pan-Asian & Dimsum', 'Healthy / Diet / Keto'],
    activeChefsCount: 18,
    centerLat: 21.1702,
    centerLng: 72.8311,
    areas: [
      { name: 'Vesu VIP Road Luxury Villas', lat: 21.1390, lng: 72.7690, label: 'Vesu VIP Road', pincode: '395007' },
      { name: 'Piplod Dumas Road', lat: 21.1610, lng: 72.7750, label: 'Piplod', pincode: '395007' },
      { name: 'Adajan LP Savani Road', lat: 21.1960, lng: 72.7880, label: 'Adajan', pincode: '395009' },
      { name: 'City Light Town', lat: 21.1680, lng: 72.7980, label: 'City Light', pincode: '395007' },
    ],
  },
  {
    id: 'coimbatore',
    name: 'Coimbatore',
    code: 'CJB',
    state: 'Tamil Nadu',
    statePoliceCode: 'CCTNS_TN',
    statePoliceJurisdiction: 'Coimbatore City Police Commissionerate, Old Post Office Road',
    region: 'South',
    tier: 'Tier-2',
    tagline: 'Manchester of South India: Authentic Kongunadu Biryanis & Siruvani Flavors',
    popularCuisines: ['South Indian / Coastal', 'North Indian / Mughlai', 'Healthy / Diet / Keto', 'Tandoor & Kebabs'],
    activeChefsCount: 16,
    centerLat: 11.0168,
    centerLng: 76.9558,
    areas: [
      { name: 'RS Puram DB Road', lat: 11.0110, lng: 76.9480, label: 'RS Puram', pincode: '641002' },
      { name: 'Race Course Promenade', lat: 11.0020, lng: 76.9740, label: 'Race Course', pincode: '641018' },
      { name: 'Peelamedu Avinashi Road', lat: 11.0310, lng: 77.0090, label: 'Peelamedu', pincode: '641004' },
      { name: 'Saibaba Colony', lat: 11.0260, lng: 76.9420, label: 'Saibaba Colony', pincode: '641011' },
    ],
  },
  {
    id: 'visakhapatnam',
    name: 'Visakhapatnam',
    code: 'VTZ',
    state: 'Andhra Pradesh',
    statePoliceCode: 'CCTNS_AP',
    statePoliceJurisdiction: 'Visakhapatnam City Police Commissionerate, Suryabagh',
    region: 'South',
    tier: 'Tier-2',
    tagline: 'The City of Destiny: Andhra Royyala Vepudu, Gongura Mutton & Beachside Grills',
    popularCuisines: ['South Indian / Coastal', 'Tandoor & Kebabs', 'North Indian / Mughlai', 'Continental & Italian'],
    activeChefsCount: 15,
    centerLat: 17.6868,
    centerLng: 83.2185,
    areas: [
      { name: 'MVP Colony Sector 1', lat: 17.7420, lng: 83.3370, label: 'MVP Colony', pincode: '530017' },
      { name: 'Beach Road RK Beach', lat: 17.7130, lng: 83.3210, label: 'Beach Road', pincode: '530002' },
      { name: 'Siripuram VIP Road', lat: 17.7240, lng: 83.3150, label: 'Siripuram', pincode: '530003' },
      { name: 'Seethammadhara North Extension', lat: 17.7410, lng: 83.3080, label: 'Seethammadhara', pincode: '530013' },
    ],
  },
  {
    id: 'bhubaneswar',
    name: 'Bhubaneswar',
    code: 'BBI',
    state: 'Odisha',
    statePoliceCode: 'CCTNS_OD',
    statePoliceJurisdiction: 'Bhubaneswar-Cuttack Police Commissionerate, Vani Vihar',
    region: 'East',
    tier: 'Tier-2',
    tagline: 'Temple City: Odia Chhena Poda, Dalma Banquets & Coastal Crab Curries',
    popularCuisines: ['Bengali Royal Feast', 'South Indian / Coastal', 'North Indian / Mughlai', 'Continental & Italian'],
    activeChefsCount: 14,
    centerLat: 20.2961,
    centerLng: 85.8245,
    areas: [
      { name: 'Saheed Nagar Janpath', lat: 20.2890, lng: 85.8450, label: 'Saheed Nagar', pincode: '751007' },
      { name: 'Patia KIIT Tech Corridor', lat: 20.3540, lng: 85.8190, label: 'Patia', pincode: '751024' },
      { name: 'Chandrasekharpur Infocity', lat: 20.3320, lng: 85.8160, label: 'Chandrasekharpur', pincode: '751016' },
      { name: 'Jayadev Vihar IRC Village', lat: 20.3010, lng: 85.8190, label: 'Jayadev Vihar', pincode: '751015' },
    ],
  },
  {
    id: 'patna',
    name: 'Patna',
    code: 'PAT',
    state: 'Bihar',
    statePoliceCode: 'CCTNS_BR',
    statePoliceJurisdiction: 'Patna Police Central Control Room, Gandhi Maidan',
    region: 'East',
    tier: 'Tier-2',
    tagline: 'Historical Magadha: Champaran Ahuna Mutton, Sattu Parathas & Royal Bhoj',
    popularCuisines: ['North Indian / Mughlai', 'Awadhi Banquet', 'Tandoor & Kebabs', 'Continental & Italian'],
    activeChefsCount: 14,
    centerLat: 25.5941,
    centerLng: 85.1376,
    areas: [
      { name: 'Boring Road Chauraha', lat: 25.6180, lng: 85.1180, label: 'Boring Road', pincode: '800001' },
      { name: 'Bailey Road Saguna More', lat: 25.6120, lng: 85.0680, label: 'Bailey Road', pincode: '801503' },
      { name: 'Kankarbagh Colony More', lat: 25.5920, lng: 85.1480, label: 'Kankarbagh', pincode: '800020' },
      { name: 'Patliputra Colony Roundabout', lat: 25.6260, lng: 85.1090, label: 'Patliputra Colony', pincode: '800013' },
    ],
  },
  {
    id: 'guwahati',
    name: 'Guwahati',
    code: 'GAU',
    state: 'Assam',
    statePoliceCode: 'CCTNS_AS',
    statePoliceJurisdiction: 'Guwahati Police Commissionerate, Panbazar',
    region: 'East',
    tier: 'Tier-2',
    tagline: 'Gateway to Northeast: Masor Tenga, Bamboo Shoot Smoked Pork & Kaji Nemu Grills',
    popularCuisines: ['Pan-Asian & Dimsum', 'North Indian / Mughlai', 'Continental & Italian', 'Healthy / Diet / Keto'],
    activeChefsCount: 13,
    centerLat: 26.1445,
    centerLng: 91.7362,
    areas: [
      { name: 'GS Road Christian Basti', lat: 26.1550, lng: 91.7760, label: 'GS Road', pincode: '781005' },
      { name: 'Uzan Bazar Riverfront', lat: 26.1910, lng: 91.7580, label: 'Uzan Bazar', pincode: '781001' },
      { name: 'Zoo Road RG Baruah Road', lat: 26.1730, lng: 91.7820, label: 'Zoo Road', pincode: '781024' },
      { name: 'Six Mile VIP Chaliha Road', lat: 26.1340, lng: 91.8080, label: 'Six Mile', pincode: '781022' },
    ],
  },
  {
    id: 'amritsar',
    name: 'Amritsar',
    code: 'ATQ',
    state: 'Punjab',
    statePoliceCode: 'CCTNS_PB',
    statePoliceJurisdiction: 'Amritsar City Police Commissionerate, Court Road',
    region: 'North',
    tier: 'Tier-2',
    tagline: 'The Holy City: World-Famous Kulchas, Amritsari Macchi & Slow Dum Dal Makhani',
    popularCuisines: ['North Indian / Mughlai', 'Tandoor & Kebabs', 'Awadhi Banquet', 'Continental & Italian'],
    activeChefsCount: 17,
    centerLat: 31.6340,
    centerLng: 74.8723,
    areas: [
      { name: 'Ranjit Avenue B Block', lat: 31.6540, lng: 74.8580, label: 'Ranjit Avenue', pincode: '143001' },
      { name: 'Lawrence Road Eating Street', lat: 31.6420, lng: 74.8780, label: 'Lawrence Road', pincode: '143001' },
      { name: 'Mall Road Heritage Row', lat: 31.6410, lng: 74.8690, label: 'Mall Road', pincode: '143001' },
      { name: 'Circular Road Medical Enclave', lat: 31.6490, lng: 74.8720, label: 'Circular Road', pincode: '143001' },
    ],
  },
  {
    id: 'udaipur',
    name: 'Udaipur',
    code: 'UDR',
    state: 'Rajasthan',
    statePoliceCode: 'CCTNS_RJ',
    statePoliceJurisdiction: 'Udaipur District Police HQ, Collectorate Compound',
    region: 'North',
    tier: 'Tier-2',
    tagline: 'City of Lakes: Destination Royal Wedding Banquets, Mewari Maas & Lake Dinners',
    popularCuisines: ['Rajasthani & Marwari', 'North Indian / Mughlai', 'Tandoor & Kebabs', 'Continental & Italian'],
    activeChefsCount: 19,
    centerLat: 24.5854,
    centerLng: 73.7125,
    areas: [
      { name: 'Fateh Sagar Promenade', lat: 24.5980, lng: 73.6730, label: 'Fateh Sagar', pincode: '313001' },
      { name: 'Panchwati Residential Enclave', lat: 24.5920, lng: 73.6930, label: 'Panchwati', pincode: '313001' },
      { name: 'Sukher Luxury Villa Zone', lat: 24.6340, lng: 73.7160, label: 'Sukher', pincode: '313004' },
      { name: 'Old City Lake Pichola Ghats', lat: 24.5770, lng: 73.6820, label: 'Lake Pichola Ghats', pincode: '313001' },
    ],
  },
  {
    id: 'dehradun',
    name: 'Dehradun / Mussoorie',
    code: 'DED',
    state: 'Uttarakhand',
    statePoliceCode: 'CCTNS_UK',
    statePoliceJurisdiction: 'Dehradun District Police HQ, Subhash Road',
    region: 'North',
    tier: 'Tier-2',
    tagline: 'Foothills of Garhwal: Pahadi Kafuli, Woodfire Grills & Mountain Villa Chefs',
    popularCuisines: ['North Indian / Mughlai', 'Continental & Italian', 'Tandoor & Kebabs', 'Healthy / Diet / Keto'],
    activeChefsCount: 15,
    centerLat: 30.3165,
    centerLng: 78.0322,
    areas: [
      { name: 'Rajpur Road Upscale Strip', lat: 30.3540, lng: 78.0690, label: 'Rajpur Road', pincode: '248001' },
      { name: 'Jakhan Diversion Mall Row', lat: 30.3720, lng: 78.0820, label: 'Jakhan', pincode: '248001' },
      { name: 'Sahastradhara Road Villas', lat: 30.3420, lng: 78.0930, label: 'Sahastradhara Road', pincode: '248013' },
      { name: 'Mussoorie Mall Road Estates', lat: 30.4598, lng: 78.0644, label: 'Mussoorie Estates', pincode: '248179' },
    ],
  },
  {
    id: 'varanasi',
    name: 'Varanasi',
    code: 'VNS',
    state: 'Uttar Pradesh',
    statePoliceCode: 'CCTNS_UP',
    statePoliceJurisdiction: 'Varanasi Police Commissionerate, Sigra',
    region: 'North',
    tier: 'Tier-2',
    tagline: 'Kashi the Eternal: Pure Satvik Royal Thalis, Malaiyo & Banarasi Dastarkhwan',
    popularCuisines: ['North Indian / Mughlai', 'Awadhi Banquet', 'Tandoor & Kebabs', 'Healthy / Diet / Keto'],
    activeChefsCount: 16,
    centerLat: 25.3176,
    centerLng: 82.9739,
    areas: [
      { name: 'Sigra Central Crossroad', lat: 25.3140, lng: 82.9860, label: 'Sigra', pincode: '221002' },
      { name: 'Cantonment Heritage Row', lat: 25.3420, lng: 82.9750, label: 'Cantonment', pincode: '221002' },
      { name: 'Bhelupur Ravindrapuri', lat: 25.2970, lng: 82.9980, label: 'Bhelupur', pincode: '221005' },
      { name: 'Assi Ghat Riverfront', lat: 25.2890, lng: 83.0060, label: 'Assi Ghat', pincode: '221005' },
    ],
  },
  {
    id: 'bhopal',
    name: 'Bhopal',
    code: 'BHO',
    state: 'Madhya Pradesh',
    statePoliceCode: 'CCTNS_MP',
    statePoliceJurisdiction: 'Bhopal Police Commissionerate, Jahangirabad',
    region: 'Central',
    tier: 'Tier-2',
    tagline: 'City of Lakes: Bhopali Gosht Korma, Roghni Naans & Upper Lake Villa Dining',
    popularCuisines: ['North Indian / Mughlai', 'Awadhi Banquet', 'Tandoor & Kebabs', 'Continental & Italian'],
    activeChefsCount: 15,
    centerLat: 23.2599,
    centerLng: 77.4126,
    areas: [
      { name: 'Arera Colony E-3 & E-4', lat: 23.2180, lng: 77.4320, label: 'Arera Colony', pincode: '462016' },
      { name: 'MP Nagar Zone 1 & 2', lat: 23.2350, lng: 77.4340, label: 'MP Nagar', pincode: '462011' },
      { name: 'Kolar Road Danish Kunj', lat: 23.1870, lng: 77.4190, label: 'Kolar Road', pincode: '462042' },
      { name: 'Shamla Hills VIP Lakefront', lat: 23.2420, lng: 77.3890, label: 'Shamla Hills', pincode: '462013' },
    ],
  },
];

/**
 * Default initial active city
 */
export function getDefaultCity(): CityInfo {
  return INDIAN_CITIES[0]; // Bengaluru as pioneer hub
}

/**
 * Look up a city by its ID
 */
export function findCityById(cityId: string): CityInfo {
  const match = INDIAN_CITIES.find(c => c.id.toLowerCase() === cityId.toLowerCase());
  return match || INDIAN_CITIES[0];
}

/**
 * Search across all Indian cities and their internal neighborhoods
 */
export function searchCitiesAndAreas(query: string): { city: CityInfo; matchedArea?: CityArea }[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return INDIAN_CITIES.map(c => ({ city: c }));
  }

  const results: { city: CityInfo; matchedArea?: CityArea }[] = [];

  for (const city of INDIAN_CITIES) {
    const cityMatches = city.name.toLowerCase().includes(q) ||
                        city.code.toLowerCase().includes(q) ||
                        city.state.toLowerCase().includes(q) ||
                        city.tagline.toLowerCase().includes(q);

    // Look for matching specific areas
    const matchingArea = city.areas.find(a => 
      a.name.toLowerCase().includes(q) ||
      a.label.toLowerCase().includes(q) ||
      (a.pincode && a.pincode.includes(q))
    );

    if (cityMatches || matchingArea) {
      results.push({ city, matchedArea: matchingArea });
    }
  }

  return results;
}

/**
 * Calculates geographic distance in kilometers using the Haversine formula
 */
function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Detect the closest Indian city based on latitude and longitude coordinates
 */
export function detectNearestIndianCity(lat: number, lng: number): CityInfo {
  let closestCity = INDIAN_CITIES[0];
  let minDistance = Infinity;

  for (const city of INDIAN_CITIES) {
    const dist = haversineDistanceKm(lat, lng, city.centerLat, city.centerLng);
    if (dist < minDistance) {
      minDistance = dist;
      closestCity = city;
    }
  }

  return closestCity;
}

/**
 * Dynamically enables access to ANY town or city across India even if not in the pre-indexed list.
 */
export function createCustomIndianCity(cityName: string, stateName: string = 'India'): CityInfo {
  const cleanName = cityName.trim();
  const slug = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const code = cleanName.slice(0, 3).toUpperCase();

  return {
    id: `custom_${slug}`,
    name: cleanName,
    code,
    state: stateName,
    statePoliceCode: 'CCTNS_NATIONAL',
    statePoliceJurisdiction: `${cleanName} District Police HQ, Criminal Records Bureau`,
    region: 'Central',
    tier: 'Tier-2',
    tagline: `On-Demand Private Chefs & Certified Event Catering in ${cleanName}`,
    popularCuisines: ['North Indian / Mughlai', 'South Indian / Coastal', 'Tandoor & Kebabs', 'Continental & Italian'],
    activeChefsCount: 12,
    centerLat: 20.5937, // India centroid default
    centerLng: 78.9629,
    areas: [
      { name: `${cleanName} Central Mall / Main Market`, lat: 20.5937, lng: 78.9629, label: `${cleanName} Central` },
      { name: `${cleanName} Civil Lines / Heritage Quarter`, lat: 20.6010, lng: 78.9710, label: 'Civil Lines' },
      { name: `${cleanName} Bypass Road / Premium Villas`, lat: 20.5850, lng: 78.9550, label: 'VIP Villas' },
    ],
  };
}
