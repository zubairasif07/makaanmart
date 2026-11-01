// ============================================================
// TYPES — shared TypeScript interfaces for the whole app
// ============================================================

export type Purpose = 'buy' | 'rent' | 'commercial';

export type PropertyType =
  | 'house'
  | 'apartment'
  | 'plot'
  | 'shop'
  | 'office'
  | 'farmhouse'
  | 'industrial'
  | 'room'
  | 'project';

export type AreaUnit = 'marla' | 'kanal' | 'sqft' | 'sqm';

export type ListingStatus = 'draft' | 'pending' | 'active' | 'sold' | 'rejected';

export type UserRole = 'buyer' | 'seller' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: UserRole;
  verified: boolean;
  createdAt: string;
  agency?: string;
}

export interface Agent {
  id: string;
  name: string;
  avatar: string;
  agency?: string;
  agencyLogo?: string;
  phone: string;
  whatsapp: string;
  email: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  totalListings: number;
  activeSince: string;
  bio: string;
  cities: string[];
}

export interface Location {
  city: string;
  area: string;
  society?: string;
  address?: string;
  lat?: number;
  lng?: number;
}

export interface PropertyImage {
  url: string;
  alt: string;
  isPrimary?: boolean;
}

export interface Amenity {
  id: string;
  label: string;
  icon?: string;
}

export interface Property {
  id: string;
  title: string;
  slug: string;
  purpose: Purpose;
  type: PropertyType;
  status: ListingStatus;
  price: number;
  priceUnit?: string; // e.g., "per month", "per sqft"
  area: number;
  areaUnit: AreaUnit;
  bedrooms?: number;
  bathrooms?: number;
  floors?: number;
  parkingSpaces?: number;
  furnished?: 'furnished' | 'semi-furnished' | 'unfurnished';
  location: Location;
  description: string;
  amenities: string[];
  images: PropertyImage[];
  videoUrl?: string;
  floorPlanUrl?: string;
  agent: Agent;
  featured: boolean;
  premium: boolean;
  verified: boolean;
  priceDrop?: number; // percentage
  views: number;
  inquiries: number;
  postedAt: string;
  updatedAt: string;
}

export interface SearchFilters {
  query?: string;
  featured?: boolean;
  purpose?: Purpose;
  city?: string;
  area?: string;
  type?: PropertyType;
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  maxBeds?: number;
  minBaths?: number;
  minArea?: number;
  maxArea?: number;
  areaUnit?: AreaUnit;
  furnished?: string;
  amenities?: string[];
  postedWithin?: number; // days
  sortBy?: 'newest' | 'price-asc' | 'price-desc' | 'popular';
}

export interface Inquiry {
  id: string;
  propertyId: string;
  propertyTitle: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  message: string;
  type: 'inquiry' | 'viewing';
  status: 'new' | 'read' | 'replied';
  createdAt: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilters;
  alertEnabled: boolean;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  category: string;
  publishedAt: string;
  readTime: number;
}

export interface Testimonial {
  id: string;
  name: string;
  avatar: string;
  role: string;
  city: string;
  rating: number;
  text: string;
}

export interface City {
  id: string;
  name: string;
  image: string;
  listings: number;
  slug: string;
}

export interface Package {
  id: string;
  name: string;
  price: number;
  duration: number; // days
  features: string[];
  highlighted?: boolean;
}
