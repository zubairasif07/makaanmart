import type {
  Agent, BlogPost, City, Inquiry, Property, SearchFilters, User,
} from '@/types';
import { mockBlogPosts } from '@/data/mockData';
import { API_URL, IS_API_UNCONFIGURED } from '@/config/runtime';

export { IS_API_UNCONFIGURED } from '@/config/runtime';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  const token = localStorage.getItem('token');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    let message = `Request failed (${response.status}).`;
    try {
      const body = await response.json() as { error?: string };
      if (body.error) message = body.error;
    } catch {
      // Keep the HTTP status message when the server response is not JSON.
    }
    throw new Error(message);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

function queryString(params: Record<string, string | number | boolean | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value));
  }
  return search.size ? `?${search.toString()}` : '';
}

export async function getProperties(filters: SearchFilters = {}, page = 1, limit = 12) {
  if (IS_API_UNCONFIGURED) {
    return {
      data: [],
      total: 0,
      page,
      totalPages: 0,
    };
  }

  return request<{ data: Property[]; total: number; page: number; totalPages: number }>(
    `/properties${queryString({
      q: filters.query,
      featured: filters.featured || undefined,
      purpose: filters.purpose,
      city: filters.city,
      area: filters.area,
      type: filters.type,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      minBeds: filters.minBeds,
      maxBeds: filters.maxBeds,
      minBaths: filters.minBaths,
      minArea: filters.minArea,
      maxArea: filters.maxArea,
      areaUnit: filters.areaUnit,
      furnished: filters.furnished,
      amenities: filters.amenities?.join(','),
      postedWithin: filters.postedWithin,
      sort: filters.sortBy,
      page,
      limit,
    })}`,
  );
}

export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  if (IS_API_UNCONFIGURED) return null;

  try {
    return await request<Property>(`/properties/slug/${encodeURIComponent(slug)}`);
  } catch (error) {
    if (error instanceof Error && error.message === 'Property not found.') return null;
    throw error;
  }
}

export async function getPropertyById(id: string): Promise<Property | null> {
  if (IS_API_UNCONFIGURED) return null;

  try {
    return await request<Property>(`/properties/id/${encodeURIComponent(id)}`);
  } catch (error) {
    if (error instanceof Error && error.message === 'Property not found.') return null;
    throw error;
  }
}

export function getFeaturedProperties(): Promise<Property[]> {
  if (IS_API_UNCONFIGURED) return Promise.resolve([]);

  return request('/properties/featured');
}

export function getLatestProperties(limit = 8): Promise<Property[]> {
  if (IS_API_UNCONFIGURED) return Promise.resolve([]);

  return request(`/properties/latest${queryString({ limit })}`);
}

export function getSimilarProperties(property: Property, _limit = 4): Promise<Property[]> {
  if (IS_API_UNCONFIGURED) return Promise.resolve([]);

  return request(`/properties/${encodeURIComponent(property.id)}/similar`);
}

export function searchAutosuggest(query: string): Promise<string[]> {
  if (!query.trim()) return Promise.resolve([]);
  return getProperties({ query }, 1, 8).then(({ data }) => [
    ...new Set(data.flatMap((property) => [
      `${property.location.area}, ${property.location.city}`,
      property.location.city,
    ])),
  ].slice(0, 8));
}

export function getAgents(): Promise<Agent[]> {
  if (IS_API_UNCONFIGURED) return Promise.resolve([]);

  return request('/agents');
}

export function getCities(): Promise<City[]> {
  if (IS_API_UNCONFIGURED) return Promise.resolve([]);

  return request('/cities');
}

export async function getAgentById(id: string): Promise<Agent | null> {
  if (IS_API_UNCONFIGURED) return null;

  try {
    return await request<Agent>(`/agents/${encodeURIComponent(id)}`);
  } catch (error) {
    if (error instanceof Error && error.message === 'Agent not found.') return null;
    throw error;
  }
}

export function getAgentListings(agentId: string): Promise<Property[]> {
  if (IS_API_UNCONFIGURED) return Promise.resolve([]);

  return request(`/agents/${encodeURIComponent(agentId)}/listings`);
}

export function submitInquiry(data: Omit<Inquiry, 'id' | 'status' | 'createdAt'>) {
  return request<{ success: boolean; message: string; inquiry: Inquiry }>('/inquiries', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getMyInquiries(): Promise<Inquiry[]> {
  return request('/inquiries/mine');
}

export function getSellerInquiries(): Promise<Inquiry[]> {
  return request('/seller/inquiries');
}

export function updateInquiryStatus(id: string, status: 'read' | 'replied') {
  return request<{ success: boolean }>(`/seller/inquiries/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function getSellerListings(): Promise<Property[]> {
  return request('/seller/listings');
}

export async function createListing(data: Record<string, unknown>): Promise<Property> {
  const result = await request<{ property: Property }>('/properties', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return result.property;
}

export async function updateListing(id: string, data: Record<string, unknown>): Promise<Property> {
  const result = await request<{ property: Property }>(`/seller/listings/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return result.property;
}

export function deleteListing(id: string): Promise<void> {
  return request(`/seller/listings/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function uploadListingImages(files: File[]): Promise<string[]> {
  const formData = new FormData();
  for (const file of files) formData.append('images', file);
  const result = await request<{ images: string[] }>('/uploads', { method: 'POST', body: formData });
  return result.images;
}

export function getFavoriteIds(): Promise<string[]> {
  return request('/favorites');
}

export function saveFavoriteIds(ids: string[]): Promise<string[]> {
  return request('/favorites', { method: 'PUT', body: JSON.stringify({ ids }) });
}

export interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilters;
  createdAt: string;
}

export function getSavedSearches(): Promise<SavedSearch[]> {
  return request('/saved-searches');
}

export function createSavedSearch(name: string, filters: SearchFilters): Promise<SavedSearch> {
  return request('/saved-searches', {
    method: 'POST',
    body: JSON.stringify({ name, filters }),
  });
}

export function deleteSavedSearch(id: string): Promise<void> {
  return request(`/saved-searches/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export function submitContactMessage(data: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  return request<{ message: string }>('/contact', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export interface AdminSummary {
  listings: number;
  pendingListings: number;
  users: number;
  agents: number;
  inquiries: number;
}

export interface PublicStats {
  listings: number;
  cities: number;
  buyers: number;
  sellers: number;
}

export function getPublicStats(): Promise<PublicStats> {
  if (IS_API_UNCONFIGURED) {
    return Promise.resolve({
      listings: 0,
      cities: 0,
      buyers: 0,
      sellers: 0,
    });
  }

  return request('/stats');
}

export function getAdminSummary(): Promise<AdminSummary> {
  return request('/admin/summary');
}

export function getAdminUsers(): Promise<User[]> {
  return request('/admin/users');
}

export function updateUserRole(id: string, role: 'buyer' | 'seller'): Promise<User> {
  return request<{ user: User }>(`/admin/users/${encodeURIComponent(id)}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  }).then((result) => result.user);
}

export function getBlogPosts(): Promise<BlogPost[]> {
  if (IS_API_UNCONFIGURED) return Promise.resolve(mockBlogPosts);

  return request('/blog');
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  if (IS_API_UNCONFIGURED) {
    return mockBlogPosts.find((post) => post.slug === slug) ?? null;
  }

  try {
    return await request<BlogPost>(`/blog/${encodeURIComponent(slug)}`);
  } catch (error) {
    if (error instanceof Error && error.message === 'Article not found.') return null;
    throw error;
  }
}

export function getCurrentUser() {
  return request<{ user: User }>('/auth/me').then((result) => result.user);
}

export function logout() {
  return request<void>('/auth/logout', { method: 'POST' });
}

export function updateProfile(data: { name: string; phone: string }) {
  return request<{ user: User }>('/auth/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function login(email: string, password: string) {
  return request<{ token: string; user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function register(data: {
  name: string;
  email: string;
  password: string;
  role: string;
  phone: string;
}) {
  return request<{ token: string; user: User }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
