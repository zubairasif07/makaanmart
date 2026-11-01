import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart, Share2, MapPin, Bed, Bath, Maximize2, Calendar,
  Eye, Phone, MessageCircle, Mail, BadgeCheck, ChevronLeft,
  ChevronRight, X, ZoomIn, TrendingDown, Building2, Layers,
  Car, Sofa, Flag, Home, ArrowLeft,
} from 'lucide-react';
import { getPropertyBySlug, getSimilarProperties, submitInquiry } from '@/services/api';
import { AMENITY_LIST } from '@/config';
import type { Property, Inquiry } from '@/types';
import {
  formatPrice, formatArea, timeAgo, whatsappUrl, cn,
} from '@/utils';
import {
  Badge, Button, Avatar, StarRating, Skeleton, EmptyState,
} from '@/components/ui';
import { useFavorites } from '@/context/FavoritesContext';
import { useRecentlyViewed } from '@/hooks';
import PropertyCard from '@/components/property/PropertyCard';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// ─── Image Lightbox ───────────────────────────────────────────────────────────
function ImageGallery({ images, title }: { images: { url: string; alt: string }[]; title: string }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const prev = () => setActive((a) => (a === 0 ? images.length - 1 : a - 1));
  const next = () => setActive((a) => (a === images.length - 1 ? 0 : a + 1));

  useEffect(() => {
    if (!lightbox) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape') setLightbox(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox]);

  return (
    <>
      <div className="relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-navy-800">
        <div className="relative h-72 md:h-96 lg:h-[500px]">
          <img
            src={images[active]?.url}
            alt={images[active]?.alt || title}
            className="w-full h-full object-cover cursor-zoom-in"
            onClick={() => setLightbox(true)}
            loading="eager"
          />
          {images.length > 1 && (
            <>
              <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
          <button
            onClick={() => setLightbox(true)}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/50 text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-black/70 transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" /> {images.length} Photos
          </button>
          <div className="absolute bottom-3 left-3 bg-black/50 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            {active + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 p-3 overflow-x-auto no-scrollbar">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={cn(
                  'relative flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden transition-all',
                  i === active ? 'ring-2 ring-emerald-500' : 'opacity-60 hover:opacity-100',
                )}
              >
                <img src={img.url} alt={img.alt} className="w-full h-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center">
          <button onClick={() => setLightbox(false)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors">
            <X className="w-5 h-5" />
          </button>
          <button onClick={prev} className="absolute left-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <img src={images[active]?.url} alt={images[active]?.alt} className="max-w-full max-h-full object-contain px-16" />
          <button onClick={next} className="absolute right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors">
            <ChevronRight className="w-6 h-6" />
          </button>
          <div className="absolute bottom-4 text-white/50 text-sm">{active + 1} / {images.length}</div>
        </div>
      )}
    </>
  );
}

// ─── Contact Form ─────────────────────────────────────────────────────────────
const inquirySchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Valid phone required'),
  email: z.string().email('Valid email required'),
  message: z.string().min(10, 'Message is required'),
  type: z.enum(['inquiry', 'viewing']),
});
type InquiryForm = z.infer<typeof inquirySchema>;

function ContactCard({ property }: { property: Property }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm<InquiryForm>({
    resolver: zodResolver(inquirySchema),
    defaultValues: { type: 'inquiry', message: `Hi, I'm interested in ${property.title}. Please share more details.` },
  });

  const onSubmit = async (data: InquiryForm) => {
    setLoading(true);
    setSubmitError('');
    try {
      await submitInquiry({
        buyerName: data.name,
        buyerPhone: data.phone,
        buyerEmail: data.email,
        message: data.message,
        type: data.type,
        propertyId: property.id,
        propertyTitle: property.title,
      });
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Could not send this inquiry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-100 dark:border-navy-700 overflow-hidden shadow-card">
      {/* Agent */}
      <div className="p-5 border-b border-gray-100 dark:border-navy-700">
        <div className="flex items-center gap-3 mb-3">
          <Avatar src={property.agent.avatar} name={property.agent.name} size="lg" />
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-bold text-navy-900 dark:text-white">{property.agent.name}</p>
              {property.agent.verified && <BadgeCheck className="w-4 h-4 text-emerald-500" />}
            </div>
            <p className="text-xs text-gray-500">{property.agent.agency ?? 'Independent Dealer'}</p>
            <StarRating rating={property.agent.rating} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <a
            href={`tel:${property.agent.phone}`}
            className="flex flex-col items-center gap-1 p-2 rounded-xl bg-navy-900 text-white hover:bg-navy-800 transition-colors text-center"
          >
            <Phone className="w-4 h-4" />
            <span className="text-xs font-semibold">Call</span>
          </a>
          <a
            href={whatsappUrl(property.agent.whatsapp, `Hi, I'm interested in ${property.title}`)}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center gap-1 p-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors text-center"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs font-semibold">WhatsApp</span>
          </a>
          <a
            href={`mailto:${property.agent.email}`}
            className="flex flex-col items-center gap-1 p-2 rounded-xl bg-gray-100 dark:bg-navy-700 text-navy-700 dark:text-white hover:bg-gray-200 transition-colors text-center"
          >
            <Mail className="w-4 h-4" />
            <span className="text-xs font-semibold">Email</span>
          </a>
        </div>
      </div>

      {/* Form */}
      <div className="p-5">
        {submitted ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <BadgeCheck className="w-6 h-6 text-emerald-500" />
            </div>
            <p className="font-bold text-navy-900 dark:text-white">Inquiry Sent!</p>
            <p className="text-sm text-gray-500 mt-1">The agent will contact you shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            {submitError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{submitError}</p>}
            <div className="flex gap-2 mb-2">
              {(['inquiry', 'viewing'] as const).map((t) => (
                <label key={t} className="flex-1 cursor-pointer">
                  <input type="radio" value={t} {...register('type')} className="sr-only peer" />
                  <div className="py-2 rounded-xl text-center text-sm font-semibold border transition-all peer-checked:bg-navy-900 peer-checked:text-white peer-checked:border-navy-900 border-gray-200 dark:border-navy-600 text-gray-600 dark:text-gray-300 hover:border-navy-300 capitalize">
                    {t === 'inquiry' ? '📩 Inquire' : '🏠 View'}
                  </div>
                </label>
              ))}
            </div>
            {[
              { name: 'name' as const, placeholder: 'Your Name', type: 'text' },
              { name: 'phone' as const, placeholder: 'Phone Number', type: 'tel' },
              { name: 'email' as const, placeholder: 'Email Address', type: 'email' },
            ].map(({ name, placeholder, type }) => (
              <div key={name}>
                <input
                  {...register(name)}
                  type={type}
                  placeholder={placeholder}
                  className={cn('input-field text-sm', errors[name] && 'border-red-400')}
                />
                {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]?.message}</p>}
              </div>
            ))}
            <textarea
              {...register('message')}
              rows={3}
              className={cn('input-field text-sm resize-none', errors.message && 'border-red-400')}
            />
            <Button type="submit" variant="emerald" size="md" loading={loading} className="w-full">
              Send Message
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function PropertyDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [similar, setSimilar] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const { toggleFavorite, isFavorite } = useFavorites();
  const { addViewed } = useRecentlyViewed();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getPropertyBySlug(slug).then((p) => {
      if (p) {
        setProperty(p);
        addViewed(p.id);
        document.title = `${p.title} | MakaanMart`;
        getSimilarProperties(p).then(setSimilar);
      }
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="container-custom py-8">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-96 w-full mb-6 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-80 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container-custom py-24">
        <EmptyState
          title="Property Not Found"
          description="The property you're looking for may have been removed or is no longer available."
          action={<Button variant="primary" onClick={() => navigate('/listings')}>Browse Listings</Button>}
        />
      </div>
    );
  }

  const isFav = isFavorite(property.id);
  const amenityDetails = AMENITY_LIST.filter((a) => property.amenities.includes(a.id));
  const mapLocation = property.location.lat != null && property.location.lng != null
    ? `${property.location.lat},${property.location.lng}`
    : [
        property.location.address,
        property.location.society,
        property.location.area,
        property.location.city,
      ].filter(Boolean).join(', ');
  const googleMapsEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(mapLocation)}&z=15&output=embed`;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapLocation)}`;

  return (
    <div className="bg-gray-50 dark:bg-navy-900 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-navy-800 border-b border-gray-100 dark:border-navy-700">
        <div className="container-custom py-3 flex items-center gap-2 text-sm text-gray-500">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 hover:text-navy-900 dark:hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <span>/</span>
          <Link to="/listings" className="hover:text-navy-900 dark:hover:text-white">Listings</Link>
          <span>/</span>
          <Link to={`/listings?city=${property.location.city}`} className="hover:text-navy-900 dark:hover:text-white">{property.location.city}</Link>
          <span>/</span>
          <span className="text-navy-900 dark:text-white truncate">{property.title}</span>
        </div>
      </div>

      <div className="container-custom py-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-2">
              {property.premium && <Badge variant="premium">✦ Premium</Badge>}
              {property.featured && <Badge variant="featured">⭐ Featured</Badge>}
              {property.verified && <Badge variant="verified"><BadgeCheck className="w-3 h-3" /> Verified</Badge>}
              {property.priceDrop && <Badge variant="priceDrop"><TrendingDown className="w-3 h-3" /> {property.priceDrop}% Price Drop</Badge>}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-navy-900 dark:text-white mb-2 leading-tight">
              {property.title}
            </h1>
            <p className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
              <MapPin className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              {property.location.address && `${property.location.address}, `}
              {property.location.area}, {property.location.city}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavorite(property.id)}
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center transition-all border',
                isFav ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white dark:bg-navy-800 border-gray-200 dark:border-navy-700 text-gray-400 hover:text-red-400',
              )}
              aria-label={isFav ? 'Remove from saved' : 'Save property'}
            >
              <Heart className={cn('w-5 h-5', isFav && 'fill-current')} />
            </button>
            <button
              onClick={() => navigator.share?.({ title: property.title, url: window.location.href })}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 text-gray-400 hover:text-navy-900 dark:hover:text-white transition-colors"
              aria-label="Share"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: gallery + details */}
          <div className="lg:col-span-2 space-y-6">
            <ImageGallery images={property.images} title={property.title} />

            {/* Price & quick specs */}
            <div className="bg-white dark:bg-navy-800 rounded-2xl p-5 border border-gray-100 dark:border-navy-700">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-3xl font-extrabold text-navy-900 dark:text-white">
                    {formatPrice(property.price)}
                    {property.priceUnit && <span className="text-lg font-normal text-gray-400 ml-2">{property.priceUnit}</span>}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-2 mt-1">
                    <Eye className="w-3.5 h-3.5" /> {property.views.toLocaleString()} views
                    <Calendar className="w-3.5 h-3.5 ml-2" /> Listed {timeAgo(property.postedAt)}
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {property.bedrooms !== undefined && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <div className="w-8 h-8 rounded-lg bg-navy-50 dark:bg-navy-700 flex items-center justify-center">
                        <Bed className="w-4 h-4 text-navy-700 dark:text-gray-300" />
                      </div>
                      <span><b className="text-navy-900 dark:text-white">{property.bedrooms}</b> Beds</span>
                    </div>
                  )}
                  {property.bathrooms !== undefined && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <div className="w-8 h-8 rounded-lg bg-navy-50 dark:bg-navy-700 flex items-center justify-center">
                        <Bath className="w-4 h-4 text-navy-700 dark:text-gray-300" />
                      </div>
                      <span><b className="text-navy-900 dark:text-white">{property.bathrooms}</b> Baths</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <div className="w-8 h-8 rounded-lg bg-navy-50 dark:bg-navy-700 flex items-center justify-center">
                      <Maximize2 className="w-4 h-4 text-navy-700 dark:text-gray-300" />
                    </div>
                    <span><b className="text-navy-900 dark:text-white">{formatArea(property.area, property.areaUnit)}</b></span>
                  </div>
                  {property.floors && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <div className="w-8 h-8 rounded-lg bg-navy-50 dark:bg-navy-700 flex items-center justify-center">
                        <Layers className="w-4 h-4 text-navy-700 dark:text-gray-300" />
                      </div>
                      <span><b className="text-navy-900 dark:text-white">{property.floors}</b> Floors</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 pt-5 border-t border-gray-100 dark:border-navy-700">
                {[
                  { label: 'Type', value: property.type.charAt(0).toUpperCase() + property.type.slice(1), icon: Building2 },
                  { label: 'Purpose', value: property.purpose === 'buy' ? 'For Sale' : `For ${property.purpose.charAt(0).toUpperCase() + property.purpose.slice(1)}`, icon: Home },
                  ...(property.furnished ? [{ label: 'Furnished', value: property.furnished.charAt(0).toUpperCase() + property.furnished.slice(1), icon: Sofa }] : []),
                  ...(property.parkingSpaces ? [{ label: 'Parking', value: `${property.parkingSpaces} Cars`, icon: Car }] : []),
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="bg-gray-50 dark:bg-navy-700/50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">{label}</p>
                    <div className="flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 text-emerald-500" />
                      <p className="text-sm font-bold text-navy-900 dark:text-white">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-navy-800 rounded-2xl p-5 border border-gray-100 dark:border-navy-700">
              <h2 className="text-lg font-bold text-navy-900 dark:text-white mb-3">Description</h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Amenities */}
            {amenityDetails.length > 0 && (
              <div className="bg-white dark:bg-navy-800 rounded-2xl p-5 border border-gray-100 dark:border-navy-700">
                <h2 className="text-lg font-bold text-navy-900 dark:text-white mb-4">Amenities & Features</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {amenityDetails.map((a) => (
                    <div key={a.id} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      {a.label}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-navy-800 rounded-2xl p-5 border border-gray-100 dark:border-navy-700">
              <h2 className="text-lg font-bold text-navy-900 dark:text-white mb-3">Location</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                <MapPin className="w-4 h-4 inline text-emerald-500 mr-1" />
                {property.location.address && `${property.location.address}, `}
                {property.location.area}, {property.location.city}
              </p>
              <div className="h-64 md:h-80 overflow-hidden rounded-xl bg-gray-100 dark:bg-navy-700">
                <iframe
                  title={`Map showing ${property.location.area}, ${property.location.city}`}
                  src={googleMapsEmbedUrl}
                  className="h-full w-full border-0"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div className="mt-3 text-right">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                >
                  Open in Google Maps
                </a>
              </div>
            </div>

          </div>

          {/* Right: contact card (sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-28">
              <ContactCard property={property} />
              <button
                onClick={() => {/* report */}}
                className="mt-3 w-full flex items-center justify-center gap-2 text-xs text-gray-400 hover:text-red-400 transition-colors py-2"
              >
                <Flag className="w-3.5 h-3.5" /> Report this listing
              </button>
            </div>
          </div>
        </div>

        {/* Similar Properties */}
        {similar.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-navy-900 dark:text-white mb-6">Similar Properties</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {similar.map((p) => <PropertyCard key={p.id} property={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
