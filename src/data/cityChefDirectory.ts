import { Chef, CityInfo, CityArea } from '../types';
import { generateDefaultReport } from '../utils/verificationEngine';
import { INITIAL_CHEFS } from './mockData';

// City-specific master chefs pre-curated for India's major metro hubs
export const MULTI_CITY_CHEFS_CATALOG: Record<string, Partial<Chef>[]> = {
  // MUMBAI
  mumbai: [
    {
      id: 'chef-mum-01',
      name: 'Chef Farhan Merchant',
      phone: '+91 98200 44123',
      avatar: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&w=400&q=80',
      rating: 4.96,
      reviewsCount: 182,
      experienceYears: 11,
      specialties: ['Maharashtrian & Malvani', 'North Indian / Mughlai'],
      bio: 'Ex-Trident Nariman Point & Bohri banquet lead. Specializes in slow-cooked Bohri Biryani, Malvani Prawn Curry, bombil fry, and caramel custard.',
      languages: ['Hindi', 'English', 'Marathi', 'Gujarati'],
      hourlyRate: 650,
      sosRate: 950,
      dayPrepRate: 1550,
      shiftRate: 3200,
      signatureDishes: ['Bohri Mutton Dabba Gosht', 'Malvani Prawn Curry', 'Stuffed Bombil Fry', 'Slow Dum Biryani'],
      galleryImages: [
        'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
      ],
    },
    {
      id: 'chef-mum-02',
      name: 'Chef Sanjana Shroff',
      phone: '+91 98210 99871',
      avatar: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?auto=format&fit=crop&w=400&q=80',
      rating: 4.92,
      reviewsCount: 134,
      experienceYears: 8,
      specialties: ['Continental & Italian', 'Healthy / Diet / Keto'],
      bio: 'Le Cordon Bleu Paris alumnus. Specialist in fresh handmade fettuccine, truffle burrata flatbreads, and paleo keto meal preps for Bollywood & Bandra fitness enthusiasts.',
      languages: ['English', 'Hindi', 'French'],
      hourlyRate: 750,
      sosRate: 1100,
      dayPrepRate: 1750,
      shiftRate: 3600,
      signatureDishes: ['Wild Mushroom Truffle Risotto', 'Artisanal Burrata Crostini', 'Gluten-Free Almond Flour Gnocchi'],
      galleryImages: [
        'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80',
      ],
    },
    {
      id: 'chef-mum-03',
      name: 'Chef Ravindra Sawant',
      phone: '+91 98690 33214',
      avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80',
      rating: 4.89,
      reviewsCount: 97,
      experienceYears: 14,
      specialties: ['Maharashtrian & Malvani', 'Tandoor & Kebabs'],
      bio: 'Alibaug coastal cooking master. Authentic clay-smoked pomfret, Tisrya masala (clams), Kolhapuri Tambada Rassa, and Wade.',
      languages: ['Marathi', 'Hindi', 'English'],
      hourlyRate: 550,
      sosRate: 850,
      dayPrepRate: 1400,
      shiftRate: 2800,
      signatureDishes: ['Surmai Tawa Fry', 'Kolhapuri Tambada & Pandhra Rassa', 'Kombdi Wade'],
      galleryImages: [
        'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80',
      ],
    },
  ],

  // DELHI NCR
  delhi_ncr: [
    {
      id: 'chef-del-01',
      name: 'Chef Zorawar Singh Matharu',
      phone: '+91 98110 55432',
      avatar: 'https://images.unsplash.com/photo-1607631568010-a87245c0daf8?auto=format&fit=crop&w=400&q=80',
      rating: 4.97,
      reviewsCount: 245,
      experienceYears: 13,
      specialties: ['North Indian / Mughlai', 'Tandoor & Kebabs'],
      bio: 'Legendary Old Delhi Dilli 6 culinary custodian. Famous for 12-hour slow-simmered Dal Makhani, hand-beaten Kakori seekh, and melt-in-mouth Butter Chicken.',
      languages: ['Punjabi', 'Hindi', 'English', 'Urdu'],
      hourlyRate: 700,
      sosRate: 999,
      dayPrepRate: 1600,
      shiftRate: 3400,
      signatureDishes: ['Purani Dilli Butter Chicken', 'Pardah Sigri Kebab', 'Dal Makhani Bukhara Style', 'Garlic Chur Chur Naan'],
      galleryImages: [
        'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80',
      ],
    },
    {
      id: 'chef-del-02',
      name: 'Chef Radhika Kapur',
      phone: '+91 98102 77334',
      avatar: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&w=400&q=80',
      rating: 4.93,
      reviewsCount: 160,
      experienceYears: 10,
      specialties: ['Awadhi Banquet', 'Pan-Asian & Dimsum'],
      bio: 'ITC Maurya trained executive banquet planner. Specialist in royal Awadhi Dastarkhwan setups, truffle dumplings, and bespoke cocktail party canapés in Gurugram & GK villas.',
      languages: ['English', 'Hindi'],
      hourlyRate: 650,
      sosRate: 950,
      dayPrepRate: 1500,
      shiftRate: 3100,
      signatureDishes: ['Dum Ki Nalli Nihari', 'Crystal Edamame Truffle Dimsum', 'Shahi Tukda with Gold Foil'],
      galleryImages: [
        'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
      ],
    },
    {
      id: 'chef-del-03',
      name: 'Chef Arvind Saxena',
      phone: '+91 98711 88902',
      avatar: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?auto=format&fit=crop&w=400&q=80',
      rating: 4.88,
      reviewsCount: 88,
      experienceYears: 7,
      specialties: ['Continental & Italian', 'Healthy / Diet / Keto'],
      bio: 'Contemporary European and modern Mediterranean specialist. Woodfire flatbreads, olive tapenade grilled sea bass, and wholesome weekly corporate meal plans.',
      languages: ['Hindi', 'English'],
      hourlyRate: 550,
      sosRate: 850,
      dayPrepRate: 1350,
      shiftRate: 2800,
      signatureDishes: ['Grilled Herb Seabass', 'Rosemary Scented Lamb Chops', 'Fresh Tagliatelle Pomodoro'],
      galleryImages: [
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
      ],
    },
  ],

  // HYDERABAD
  hyderabad: [
    {
      id: 'chef-hyd-01',
      name: 'Ustad Mohammed Feroz Khan',
      phone: '+91 98490 12890',
      avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80',
      rating: 4.98,
      reviewsCount: 310,
      experienceYears: 18,
      specialties: ['Hyderabadi Dum & Nizami', 'Tandoor & Kebabs'],
      bio: 'Fourth-generation Purani Haveli Biryani Ustad. Masters the authentic charcoal seal Kacchi Gosht Biryani, slow-cooked Mutton Haleem, and Mirchi Ka Salan for Jubilee Hills banquets.',
      languages: ['Urdu', 'Telugu', 'Hindi', 'English'],
      hourlyRate: 700,
      sosRate: 999,
      dayPrepRate: 1650,
      shiftRate: 3500,
      signatureDishes: ['Authentic Kacchi Dum Biryani', 'Nizami Shahi Haleem', 'Tala Hua Gosht', 'Double Ka Meetha'],
      galleryImages: [
        'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&q=80',
      ],
    },
    {
      id: 'chef-hyd-02',
      name: 'Chef Shravya Reddy',
      phone: '+91 99890 55431',
      avatar: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?auto=format&fit=crop&w=400&q=80',
      rating: 4.91,
      reviewsCount: 115,
      experienceYears: 9,
      specialties: ['South Indian / Coastal', 'Healthy / Diet / Keto'],
      bio: 'Rayalaseema and Telangana spice expert. Famous for Natu Kodi Pulao, Gongura Royyala Vepudu, and diabetic-friendly ragi sangati health meal plans.',
      languages: ['Telugu', 'English', 'Hindi'],
      hourlyRate: 550,
      sosRate: 850,
      dayPrepRate: 1400,
      shiftRate: 2800,
      signatureDishes: ['Gongura Mutton Curry', 'Natu Kodi Fry', 'Nellore Chepala Pulusu', 'Ragi Mudda with Chicken'],
      galleryImages: [
        'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80',
      ],
    },
  ],

  // KOLKATA
  kolkata: [
    {
      id: 'chef-kol-01',
      name: 'Chef Subhashis Mukherjee',
      phone: '+91 98300 88210',
      avatar: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?auto=format&fit=crop&w=400&q=80',
      rating: 4.95,
      reviewsCount: 195,
      experienceYears: 15,
      specialties: ['Bengali Royal Feast', 'North Indian / Mughlai'],
      bio: 'Ex-Ballygunge Place master chef. Known for aromatic Kolkata Aloo Dum Biryani, velvety Kosha Mangsho, Daab Chingri in tender coconut, and Bhetki Paturi.',
      languages: ['Bengali', 'English', 'Hindi'],
      hourlyRate: 600,
      sosRate: 899,
      dayPrepRate: 1450,
      shiftRate: 3000,
      signatureDishes: ['Kolkata Awadhi Dum Biryani with Aloo', 'Kosha Mangsho with Luchi', 'Daab Chingri', 'Gondhoraj Bhetki Paturi'],
      galleryImages: [
        'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80',
      ],
    },
    {
      id: 'chef-kol-02',
      name: 'Chef Ananya Sen',
      phone: '+91 99800 77123',
      avatar: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?auto=format&fit=crop&w=400&q=80',
      rating: 4.88,
      reviewsCount: 92,
      experienceYears: 7,
      specialties: ['Continental & Italian', 'Pan-Asian & Dimsum'],
      bio: 'Park Street colonial Continental and Tangra Indo-Chinese artisan. Chilli garlic noodles, chicken stroganoff, and baked mishti doi.',
      languages: ['Bengali', 'English', 'Hindi'],
      hourlyRate: 550,
      sosRate: 850,
      dayPrepRate: 1350,
      shiftRate: 2800,
      signatureDishes: ['Tangra Style Hakka Chilli Chicken', 'Colonial Baked Fish Florentine', 'Mishti Doi Cheesecake'],
      galleryImages: [
        'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
      ],
    },
  ],

  // CHENNAI
  chennai: [
    {
      id: 'chef-che-01',
      name: 'Chef Meenakshi Sundaram',
      phone: '+91 98400 33412',
      avatar: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&w=400&q=80',
      rating: 4.96,
      reviewsCount: 220,
      experienceYears: 16,
      specialties: ['South Indian / Coastal', 'Tandoor & Kebabs'],
      bio: 'Chettinad and Kongunadu banquet authority. Master of stone-ground Chettinad Pepper Chicken, Vazhaipoo Meen Kozhambu, and traditional banana leaf feasts.',
      languages: ['Tamil', 'English', 'Malayalam'],
      hourlyRate: 600,
      sosRate: 899,
      dayPrepRate: 1450,
      shiftRate: 3000,
      signatureDishes: ['Chettinad Pepper Chicken Sukka', 'Mutton Chukka Varuval', 'Meen Polichathu', 'Elaneer Soufflé'],
      galleryImages: [
        'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80',
      ],
    },
  ],

  // JAIPUR
  jaipur: [
    {
      id: 'chef-jai-01',
      name: 'Chef Rawat Singh Rathore',
      phone: '+91 98290 66723',
      avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80',
      rating: 4.95,
      reviewsCount: 164,
      experienceYears: 14,
      specialties: ['Rajasthani & Marwari', 'North Indian / Mughlai'],
      bio: 'Heritage Rajputana court culinary specialist. Famous for authentic handi Laal Maas cooked with Mathania chilies, Dal Baati Churma, and Ker Sangri.',
      languages: ['Hindi', 'Rajasthani', 'English'],
      hourlyRate: 650,
      sosRate: 950,
      dayPrepRate: 1550,
      shiftRate: 3200,
      signatureDishes: ['Royal Mathania Laal Maas', 'Dal Baati Churma with 5 Chutneys', 'Ker Sangri Banjaara', 'Ghevar with Kesar Rabri'],
      galleryImages: [
        'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80',
      ],
    },
  ],

  // GOA
  goa: [
    {
      id: 'chef-goa-01',
      name: 'Chef Xavier Fernandes',
      phone: '+91 98221 44550',
      avatar: 'https://images.unsplash.com/photo-1581299894007-aaa50297cf16?auto=format&fit=crop&w=400&q=80',
      rating: 4.97,
      reviewsCount: 188,
      experienceYears: 12,
      specialties: ['Goan Portuguese & Coastal', 'Continental & Italian'],
      bio: 'Assagao luxury villa private chef. Master of coconut feni Pork Vindaloo, Kingfish Rava fry, crab Xec Xec, woodfire sourdough pizzas, and poolside grills.',
      languages: ['Konkani', 'English', 'Portuguese', 'Hindi'],
      hourlyRate: 750,
      sosRate: 1099,
      dayPrepRate: 1750,
      shiftRate: 3600,
      signatureDishes: ['Authentic Goan Pork Vindaloo', 'Crab Xec Xec in Roasted Coconut', 'Kingfish Rava Tawa Fry', 'Woodfire Prawn Canapés'],
      galleryImages: [
        'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
      ],
    },
  ],

  // KOCHI
  kochi: [
    {
      id: 'chef-cok-01',
      name: 'Chef Priya Nambiar & Chef George Varghese',
      phone: '+91 98860 88219',
      avatar: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&w=400&q=80',
      rating: 4.96,
      reviewsCount: 204,
      experienceYears: 11,
      specialties: ['South Indian / Coastal', 'Healthy / Diet / Keto'],
      bio: 'Syrian Christian and Malabar cuisine connoisseur. Authentic Karimeen Pollichathu, Syrian Duck Roast, Neer Dosa with Kori Rotti, and live Appam counters.',
      languages: ['Malayalam', 'English', 'Hindi', 'Tamil'],
      hourlyRate: 550,
      sosRate: 850,
      dayPrepRate: 1399,
      shiftRate: 2900,
      signatureDishes: ['Karimeen Pollichathu in Banana Leaf', 'Syrian Christian Duck Roast', 'Live Fluffy Appam with Stew', 'Elaneer Payasam'],
      galleryImages: [
        'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80',
      ],
    },
  ],

  // LUCKNOW
  lucknow: [
    {
      id: 'chef-lko-01',
      name: 'Ustad Imran Qureshi',
      phone: '+91 97422 33110',
      avatar: 'https://images.unsplash.com/photo-1607631568010-a87245c0daf8?auto=format&fit=crop&w=400&q=80',
      rating: 4.98,
      reviewsCount: 260,
      experienceYears: 16,
      specialties: ['Awadhi Banquet', 'Tandoor & Kebabs', 'North Indian / Mughlai'],
      bio: 'Authentic royal Qureshi lineage. Renowned for 32-spice Galouti Kebab smoked with vetiver root, Kakori, Purdah Murgh, and saffron Sheermal.',
      languages: ['Urdu', 'Hindi', 'English'],
      hourlyRate: 700,
      sosRate: 999,
      dayPrepRate: 1600,
      shiftRate: 3300,
      signatureDishes: ['Smoked Galouti Kebab with Ulte Tawa Paratha', 'Kakori Kebab', 'Awadhi Gosht Dum Biryani', 'Kesar Shahi Tukda'],
      galleryImages: [
        'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&q=80',
      ],
    },
  ],
};

/**
 * Returns chefs situated in the selected Indian city and recalculates their real-time distance
 * from the customer's selected local area/neighborhood.
 */
export function getChefsForSelectedCity(city: CityInfo, selectedArea: CityArea): Chef[] {
  // If Bengaluru, return original INITIAL_CHEFS with updated coordinates & distance relative to selected area
  if (city.id === 'bengaluru') {
    return INITIAL_CHEFS.map((chef, idx) => {
      const area = city.areas[idx % city.areas.length] || selectedArea;
      const dist = Number((1.1 + (idx * 0.7)).toFixed(1));
      return {
        ...chef,
        cityId: city.id,
        cityName: city.name,
        currentLocation: {
          lat: area.lat + (idx * 0.002),
          lng: area.lng + (idx * 0.002),
          area: area.name,
        },
        distanceKm: dist,
        verificationReport: chef.verificationReport || generateDefaultReport(chef, 'verified'),
      };
    });
  }

  // Check if curated chefs exist for this city
  const curated = MULTI_CITY_CHEFS_CATALOG[city.id];
  if (curated && curated.length > 0) {
    return curated.map((partialChef, idx) => {
      const area = city.areas[idx % city.areas.length] || selectedArea;
      const dist = Number((1.2 + (idx * 0.8)).toFixed(1));
      const fullChef: Chef = {
        id: partialChef.id || `chef-${city.id}-${idx + 1}`,
        name: partialChef.name || `Chef ${city.name} Specialist`,
        phone: partialChef.phone || `+91 98000 ${Math.floor(10000 + Math.random() * 90000)}`,
        avatar: partialChef.avatar || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80',
        cityId: city.id,
        cityName: city.name,
        rating: partialChef.rating || 4.9,
        averageRatingScore: partialChef.averageRatingScore || partialChef.rating || 4.9,
        reviewsCount: partialChef.reviewsCount || 120,
        experienceYears: partialChef.experienceYears || 8,
        specialties: partialChef.specialties || ['North Indian / Mughlai', 'Tandoor & Kebabs'],
        currentLocation: {
          lat: area.lat + (idx * 0.002),
          lng: area.lng + (idx * 0.002),
          area: area.name,
        },
        distanceKm: dist,
        isOnline: true,
        status: 'available',
        hourlyRate: partialChef.hourlyRate || 600,
        sosRate: partialChef.sosRate || 899,
        dayPrepRate: partialChef.dayPrepRate || 1450,
        shiftRate: partialChef.shiftRate || 3000,
        bio: partialChef.bio || `Certified 5-star executive chef serving all neighborhoods in ${city.name}. Background checked with state police CCTNS.`,
        languages: partialChef.languages || ['Hindi', 'English'],
        hygieneCertified: true,
        policeVerified: true,
        signatureDishes: partialChef.signatureDishes || ['Chef Special Dum Biryani', 'Tandoori Tikka Platter', 'Artisanal Bread Basket'],
        galleryImages: partialChef.galleryImages || [
          'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&q=80',
        ],
        reviews: partialChef.reviews || [
          {
            id: `rev-${city.id}-${idx}-1`,
            chefId: partialChef.id || `chef-${city.id}-${idx + 1}`,
            customerName: 'Aditi Sharma',
            customerArea: area.name,
            rating: 5,
            date: '2 days ago',
            serviceType: 'SOS Quick-Fix',
            dishesOrdered: (partialChef.signatureDishes || ['Dum Biryani'])[0],
            comment: 'Exceptional flavor and impeccable hygiene. Arrived punctually and cooked a marvelous meal.',
            helpfulCount: 12,
            aspects: { taste: 5, hygiene: 5, punctuality: 5 },
            verifiedBooking: true,
          },
        ],
      };

      fullChef.verificationReport = generateDefaultReport(fullChef, 'verified');
      return fullChef;
    });
  }

  // Dynamic Generator for all other cities across India (Chandigarh, Indore, Pune, Surat, Bhopal, Patna, etc.)
  const names = [
    `Chef Vikramaditya ${city.name.slice(0, 4)}`,
    `Chef Aarti & Sunita Sharma`,
    `Chef Pradeep Banerjee`,
    `Chef Kabir Singhania`,
  ];

  const avatars = [
    'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1581299894007-aaa50297cf16?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1607631568010-a87245c0daf8?auto=format&fit=crop&w=400&q=80',
  ];

  return names.map((name, idx) => {
    const area = city.areas[idx % city.areas.length] || selectedArea;
    const dist = Number((1.3 + (idx * 0.9)).toFixed(1));
    const chefObj: Chef = {
      id: `chef-${city.id}-${idx + 1}`,
      name,
      phone: `+91 99000 ${Math.floor(10000 + Math.random() * 90000)}`,
      avatar: avatars[idx % avatars.length],
      cityId: city.id,
      cityName: city.name,
      rating: Number((4.85 + (idx * 0.04)).toFixed(2)),
      averageRatingScore: Number((4.85 + (idx * 0.04)).toFixed(2)),
      reviewsCount: 85 + (idx * 30),
      experienceYears: 7 + (idx * 2),
      specialties: idx === 0 
        ? ['North Indian / Mughlai', 'Tandoor & Kebabs'] 
        : idx === 1 
        ? ['South Indian / Coastal', 'Healthy / Diet / Keto']
        : idx === 2
        ? ['Continental & Italian', 'Pan-Asian & Dimsum']
        : ['Awadhi Banquet', 'Tandoor & Kebabs'],
      currentLocation: {
        lat: area.lat + (idx * 0.003),
        lng: area.lng + (idx * 0.003),
        area: area.name,
      },
      distanceKm: dist,
      isOnline: idx < 3,
      status: idx === 0 ? 'available' : idx === 1 ? 'available' : 'busy',
      hourlyRate: 500 + (idx * 50),
      sosRate: 799 + (idx * 80),
      dayPrepRate: 1350 + (idx * 100),
      shiftRate: 2800 + (idx * 200),
      bio: `Elite culinary lead stationed in ${area.name}, ${city.name}. Specializes in high-heat tandoor grills, authentic regional curries, and hygiene-certified banquet execution.`,
      languages: ['Hindi', 'English'],
      hygieneCertified: true,
      policeVerified: true,
      signatureDishes: [
        `${city.name} Signature Dum Handi`,
        'Charred Sigri Malai Tikka',
        'Handmade Fluffy Bread Basket',
        'Slow Reduced Kesar Halwa',
      ],
      galleryImages: [
        'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&q=80',
      ],
      reviews: [
        {
          id: `rev-dyn-${city.id}-${idx}`,
          chefId: `chef-${city.id}-${idx + 1}`,
          customerName: 'Kavita Sundaram',
          customerArea: area.name,
          rating: 5,
          date: 'Yesterday',
          serviceType: 'SOS Quick-Fix',
          dishesOrdered: `${city.name} Signature Dum Handi`,
          comment: 'Outstanding food quality and great hygiene. Will book again!',
          helpfulCount: 9,
          aspects: { taste: 5, hygiene: 5, punctuality: 5 },
          verifiedBooking: true,
        },
      ],
    };

    chefObj.verificationReport = generateDefaultReport(chefObj, 'verified');
    return chefObj;
  });
}
