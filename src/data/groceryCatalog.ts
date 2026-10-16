/**
 * Smart Grocery Catalog & Integration for SOS Quick-Fix Bookings
 * "The Bangalore Hack": Auto pre-filled grocery cart for 10-12 min blitz delivery
 * (Zepto, Blinkit, BigBasket) ensuring ingredients arrive before the chef does.
 */

export interface GroceryItem {
  id: string;
  name: string;
  category: 'Produce' | 'Dairy & Poultry' | 'Spices & Condiments' | 'Staples & Oils';
  packSize: string;
  estimatedPrice: number; // in INR ₹
  brand: string;
  essential: boolean;
}

export interface GroceryKitForDish {
  dishKey: string;
  matchedNames: string[];
  dishName: string;
  prepTimeMinutes: number;
  items: GroceryItem[];
}

export const QUICK_COMMERCE_PLATFORMS = [
  {
    id: 'zepto',
    name: 'Zepto',
    etaMinutes: 10,
    tagline: '10-Min Blitz Delivery in Bengaluru',
    color: 'from-purple-600 to-indigo-700',
    logo: '⚡',
    badge: 'Fastest in Koramangala & Indiranagar',
    webBaseUrl: 'https://www.zeptonow.com/search?query=',
  },
  {
    id: 'blinkit',
    name: 'Blinkit',
    etaMinutes: 11,
    tagline: 'Quick grocery delivery',
    color: 'from-amber-500 to-yellow-600',
    logo: '🟡',
    badge: 'Wide Fresh Organic Staples',
    webBaseUrl: 'https://blinkit.com/s/?q=',
  },
  {
    id: 'bigbasket',
    name: 'BigBasket',
    etaMinutes: 12,
    tagline: 'Fresh groceries & household essentials',
    color: 'from-red-500 to-red-600',
    logo: '🧺',
    badge: 'Fresh groceries and household essentials',
    webBaseUrl: 'https://www.bigbasket.com/ps/?q=',
  },
] as const;

export type QuickCommercePlatformId = typeof QUICK_COMMERCE_PLATFORMS[number]['id'];

export const RECIPE_GROCERY_KITS: GroceryKitForDish[] = [
  {
    dishKey: 'butter_chicken',
    matchedNames: ['butter chicken', 'murgh makhani', 'chicken tikka masala', 'chicken'],
    dishName: 'Royal Butter Chicken & Garlic Naan',
    prepTimeMinutes: 30,
    items: [
      { id: 'g-1', name: 'Fresh Boneless Chicken Breast', category: 'Dairy & Poultry', packSize: '500g', estimatedPrice: 195, brand: 'FreshtoHome / Zorabian', essential: true },
      { id: 'g-2', name: 'Amul Salted Cooking Butter', category: 'Dairy & Poultry', packSize: '200g', estimatedPrice: 110, brand: 'Amul', essential: true },
      { id: 'g-3', name: 'Amul Fresh Malai Cream', category: 'Dairy & Poultry', packSize: '250ml', estimatedPrice: 75, brand: 'Amul', essential: true },
      { id: 'g-4', name: 'Ripe Hybrid Tomatoes (Curry Base)', category: 'Produce', packSize: '500g', estimatedPrice: 28, brand: 'Farm Fresh', essential: true },
      { id: 'g-5', name: 'Garlic & Ginger Peeled Paste', category: 'Produce', packSize: '200g', estimatedPrice: 48, brand: 'Mother\'s Recipe', essential: true },
      { id: 'g-6', name: 'Kasuri Methi (Dried Fenugreek)', category: 'Spices & Condiments', packSize: '50g', estimatedPrice: 35, brand: 'Everest', essential: true },
      { id: 'g-7', name: 'Shahi Garam Masala Blend', category: 'Spices & Condiments', packSize: '100g', estimatedPrice: 85, brand: 'MDH / Catch', essential: true },
      { id: 'g-8', name: 'Kashmiri Lal Deggi Mirch', category: 'Spices & Condiments', packSize: '100g', estimatedPrice: 65, brand: 'Everest', essential: false },
      { id: 'g-9', name: 'Whole Wheat Atta / Maida', category: 'Staples & Oils', packSize: '1kg', estimatedPrice: 60, brand: 'Aashirvaad', essential: true },
    ],
  },
  {
    dishKey: 'paneer_butter_masala',
    matchedNames: ['paneer', 'shahi paneer', 'paneer butter', 'kadai paneer', 'cottage cheese'],
    dishName: 'Paneer Butter Masala & Tawa Parathas',
    prepTimeMinutes: 25,
    items: [
      { id: 'gp-1', name: 'Fresh Malai Paneer Cubes', category: 'Dairy & Poultry', packSize: '400g (2x200g)', estimatedPrice: 180, brand: 'Milky Mist / Amul', essential: true },
      { id: 'gp-2', name: 'Amul Butter', category: 'Dairy & Poultry', packSize: '100g', estimatedPrice: 58, brand: 'Amul', essential: true },
      { id: 'gp-3', name: 'Fresh Cooking Cream', category: 'Dairy & Poultry', packSize: '200ml', estimatedPrice: 65, brand: 'Amul', essential: true },
      { id: 'gp-4', name: 'Local Hybrid Tomatoes & Red Onions', category: 'Produce', packSize: '1kg Combo', estimatedPrice: 54, brand: 'Fresh Farm', essential: true },
      { id: 'gp-5', name: 'Cashew Nuts (Kaju) for Gravy Base', category: 'Staples & Oils', packSize: '100g', estimatedPrice: 110, brand: 'Nutraj', essential: true },
      { id: 'gp-6', name: 'Ginger, Garlic & Green Chillies', category: 'Produce', packSize: '150g', estimatedPrice: 32, brand: 'Fresh', essential: true },
      { id: 'gp-7', name: 'Kasuri Methi & Garam Masala', category: 'Spices & Condiments', packSize: 'Set of 2', estimatedPrice: 90, brand: 'Everest', essential: true },
    ],
  },
  {
    dishKey: 'biryani',
    matchedNames: ['biryani', 'dum biryani', 'zafrani', 'hyderabadi'],
    dishName: 'Nizami Zafrani Dum Biryani & Burani Raita',
    prepTimeMinutes: 40,
    items: [
      { id: 'gb-1', name: 'Aged Long Grain Basmati Rice (Daawat / India Gate)', category: 'Staples & Oils', packSize: '1kg', estimatedPrice: 195, brand: 'Daawat Rozana Gold', essential: true },
      { id: 'gb-2', name: 'Pure Desi Cow Ghee', category: 'Dairy & Poultry', packSize: '200ml', estimatedPrice: 165, brand: 'Nandini / Amul', essential: true },
      { id: 'gb-3', name: 'Fresh Chicken / Paneer / Vegetables', category: 'Dairy & Poultry', packSize: '500g', estimatedPrice: 190, brand: 'Select Choice', essential: true },
      { id: 'gb-4', name: 'Thick Greek Dahi / Curd for Marinade', category: 'Dairy & Poultry', packSize: '400g', estimatedPrice: 50, brand: 'Milky Mist', essential: true },
      { id: 'gb-5', name: 'Biryani Whole Spices (Star Anise, Shahi Jeera, Mace)', category: 'Spices & Condiments', packSize: '50g Potli', estimatedPrice: 75, brand: 'Keya', essential: true },
      { id: 'gb-6', name: 'Fresh Mint (Pudina) & Coriander leaves', category: 'Produce', packSize: '1 Bunch each', estimatedPrice: 25, brand: 'Farm Fresh', essential: true },
      { id: 'gb-7', name: 'Kashmir Saffron (Kesar Strands)', category: 'Spices & Condiments', packSize: '0.5g', estimatedPrice: 180, brand: 'Baby Saffron', essential: false },
      { id: 'gb-8', name: 'Fried Biryani Onions (Birista)', category: 'Produce', packSize: '100g', estimatedPrice: 65, brand: 'Kitchen Secret', essential: false },
    ],
  },
  {
    dishKey: 'pasta_italian',
    matchedNames: ['pasta', 'fettuccine', 'truffle', 'continental', 'italian', 'pizza'],
    dishName: 'Handcrafted Truffle Pasta & Garlic Herb Bruschetta',
    prepTimeMinutes: 20,
    items: [
      { id: 'gi-1', name: 'Durum Wheat Fettuccine / Penne', category: 'Staples & Oils', packSize: '500g', estimatedPrice: 145, brand: 'Barilla / Del Monte', essential: true },
      { id: 'gi-2', name: 'Extra Virgin Olive Oil', category: 'Staples & Oils', packSize: '250ml', estimatedPrice: 320, brand: 'Borges / Figaro', essential: true },
      { id: 'gi-3', name: 'Parmigiano Reggiano / Grated Parmesan', category: 'Dairy & Poultry', packSize: '100g', estimatedPrice: 240, brand: 'D\'lecta', essential: true },
      { id: 'gi-4', name: 'Fresh Basil & Cherry Tomatoes', category: 'Produce', packSize: '200g Pack', estimatedPrice: 85, brand: 'First Agro', essential: true },
      { id: 'gi-5', name: 'Fresh Garlic Bulb & Crushed Black Peppercorn', category: 'Produce', packSize: '100g', estimatedPrice: 40, brand: 'Fresh', essential: true },
      { id: 'gi-6', name: 'Sourdough Baguette / Ciabatta Loaf', category: 'Staples & Oils', packSize: '1 Loaf', estimatedPrice: 75, brand: 'Artisan Bakery', essential: false },
    ],
  },
  {
    dishKey: 'south_indian',
    matchedNames: ['dosa', 'sambar', 'neer dosa', 'coastal', 'ghee roast', 'kori rotti'],
    dishName: 'Mangalorean Ghee Roast & Steamed Neer Dosa Feast',
    prepTimeMinutes: 25,
    items: [
      { id: 'gs-1', name: 'Fresh Stone-ground Idli/Dosa Batter', category: 'Staples & Oils', packSize: '1kg', estimatedPrice: 85, brand: 'iD Fresh Food', essential: true },
      { id: 'gs-2', name: 'Pure Nandini Ghee', category: 'Dairy & Poultry', packSize: '200ml', estimatedPrice: 130, brand: 'KMF Nandini', essential: true },
      { id: 'gs-3', name: 'Fresh Grated Coconut', category: 'Produce', packSize: '200g', estimatedPrice: 45, brand: 'Fresh Farm', essential: true },
      { id: 'gs-4', name: 'Byadagi Chillies & Sambar Masala', category: 'Spices & Condiments', packSize: '100g', estimatedPrice: 65, brand: 'MTR', essential: true },
      { id: 'gs-5', name: 'Fresh Curry Leaves & Mustard Seeds', category: 'Produce', packSize: 'Combo Pack', estimatedPrice: 20, brand: 'Local Harvest', essential: true },
      { id: 'gs-6', name: 'Paneer / Prawn / Mushroom / Chicken', category: 'Dairy & Poultry', packSize: '350g', estimatedPrice: 190, brand: 'Choice Protein', essential: true },
    ],
  },
];

/**
 * Helper to match grocery kit based on dishes text, or returns default kit
 */
export function getGroceryKitForDish(dishesText: string): GroceryKitForDish {
  const normalized = (dishesText || '').toLowerCase();
  for (const kit of RECIPE_GROCERY_KITS) {
    if (kit.matchedNames.some((m) => normalized.includes(m))) {
      return kit;
    }
  }

  // Default kit for generic Indian Home Meal Prep
  return {
    dishKey: 'general_meal_prep',
    matchedNames: ['general', 'prep', 'home'],
    dishName: dishesText ? `Custom Order: ${dishesText.slice(0, 30)}...` : 'Fresh Daily Home Meal Preparation',
    prepTimeMinutes: 25,
    items: [
      { id: 'g-def-1', name: 'Fresh Farm Vegetables (Onions, Tomatoes, Potatoes, Chillies)', category: 'Produce', packSize: '1.5kg Assorted', estimatedPrice: 120, brand: 'Local Bengaluru Mandi', essential: true },
      { id: 'g-def-2', name: 'Fortune Sunlite Sunflower Cooking Oil', category: 'Staples & Oils', packSize: '1 Litre', estimatedPrice: 145, brand: 'Fortune', essential: true },
      { id: 'g-def-3', name: 'Aashirvaad Shudh Chakki Atta', category: 'Staples & Oils', packSize: '2kg', estimatedPrice: 110, brand: 'Aashirvaad', essential: true },
      { id: 'g-def-4', name: 'Tata Sampann Toor Dal & Moong Dal', category: 'Staples & Oils', packSize: '500g each', estimatedPrice: 140, brand: 'Tata Sampann', essential: true },
      { id: 'g-def-5', name: 'Basic Spices (Jeera, Haldi, Dhania, Mustard)', category: 'Spices & Condiments', packSize: 'Daily Spices Kit', estimatedPrice: 95, brand: 'MDH / Everest', essential: true },
      { id: 'g-def-6', name: 'Amul Salted Butter / Desi Ghee', category: 'Dairy & Poultry', packSize: '100g', estimatedPrice: 58, brand: 'Amul', essential: true },
    ],
  };
}
