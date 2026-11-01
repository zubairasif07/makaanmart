// ============================================================
// CONFIGURATION — currency, units, app-wide constants
// ============================================================

export const APP_CONFIG = {
  name: 'MakaanMart',
  tagline: 'Find Your Dream Home in Pakistan',
  currency: {
    symbol: 'PKR',
    locale: 'en-PK',
    shortScale: { lakh: 100000, crore: 10000000 },
  },
  defaultAreaUnit: 'marla' as const,
  supportedCities: [
    'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
    'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala',
    'Hyderabad', 'Bahawalpur', 'Sargodha', 'Abbottabad', 'Murree',
  ],
  whatsappBase: 'https://wa.me/',
  contactPhone: '+92-300-0000000',
  contactEmail: 'info@makaanmart.pk',
} as const;

export const AREA_UNITS = {
  marla: { label: 'Marla', plural: 'Marla', toSqft: 272.25 },
  kanal: { label: 'Kanal', plural: 'Kanal', toSqft: 5445 },
  sqft: { label: 'Sq. Ft.', plural: 'Sq. Ft.', toSqft: 1 },
  sqm: { label: 'Sq. M.', plural: 'Sq. M.', toSqft: 10.764 },
} as const;

export const PROPERTY_TYPES = {
  house: { label: 'House', icon: '🏠' },
  apartment: { label: 'Apartment / Flat', icon: '🏢' },
  plot: { label: 'Plot / Land', icon: '📐' },
  shop: { label: 'Shop / Store', icon: '🏪' },
  office: { label: 'Office', icon: '🏛️' },
  farmhouse: { label: 'Farmhouse', icon: '🌿' },
  industrial: { label: 'Industrial', icon: '🏭' },
  room: { label: 'Room / Portion', icon: '🛏️' },
  project: { label: 'New Project', icon: '🏗️' },
} as const;

export const AMENITY_LIST = [
  { id: 'electricity', label: 'Electricity' },
  { id: 'gas', label: 'Gas' },
  { id: 'water', label: 'Water Supply' },
  { id: 'sewerage', label: 'Sewerage' },
  { id: 'security', label: 'Gated Security' },
  { id: 'cctv', label: 'CCTV' },
  { id: 'gym', label: 'Gym' },
  { id: 'pool', label: 'Swimming Pool' },
  { id: 'mosque', label: 'Mosque' },
  { id: 'school', label: 'School Nearby' },
  { id: 'hospital', label: 'Hospital Nearby' },
  { id: 'park', label: 'Park' },
  { id: 'generator', label: 'Generator Backup' },
  { id: 'lift', label: 'Elevator / Lift' },
  { id: 'parking', label: 'Parking' },
  { id: 'servants', label: 'Servants Quarters' },
  { id: 'roof', label: 'Rooftop Access' },
  { id: 'corner', label: 'Corner Plot' },
  { id: 'boulevard', label: 'Boulevard Plot' },
  { id: 'underground', label: 'Underground Water' },
];

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
] as const;
