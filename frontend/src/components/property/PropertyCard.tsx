import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart, Bed, Bath, Maximize2, MapPin, Eye, Phone,
  MessageCircle, Share2, BadgeCheck, Zap, TrendingDown,
  BarChart2,
} from 'lucide-react';
import type { Property } from '@/types';
import { formatPrice, formatArea, timeAgo, whatsappUrl, cn } from '@/utils';
import { Badge, Avatar, StarRating } from '@/components/ui';
import { useFavorites } from '@/context/FavoritesContext';
import { useCompare } from '@/hooks';

interface PropertyCardProps {
  property: Property;
  view?: 'grid' | 'list';
}

export default function PropertyCard({ property, view = 'grid' }: PropertyCardProps) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const { toggleCompare, isInCompare } = useCompare();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const primaryImage = property.images.find((i) => i.isPrimary) ?? property.images[0];
  const isFav = isFavorite(property.id);
  const inCompare = isInCompare(property.id);

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    if (navigator.share) {
      navigator.share({ title: property.title, url: window.location.origin + `/property/${property.slug}` });
    } else {
      navigator.clipboard.writeText(window.location.origin + `/property/${property.slug}`);
    }
  };

  if (view === 'list') {
    return (
      <div className="card flex gap-0 overflow-hidden animate-fade-in">
        <Link to={`/property/${property.slug}`} className="relative w-64 flex-shrink-0">
          {!imgLoaded && <div className="skeleton absolute inset-0" />}
          <img
            src={imgError ? '/placeholder-property.jpg' : primaryImage?.url}
            alt={primaryImage?.alt || property.title}
            className={cn('w-full h-full object-cover transition-opacity duration-300', imgLoaded ? 'opacity-100' : 'opacity-0')}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            loading="lazy"
          />
          <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
            {property.featured && <Badge variant="featured">⭐ Featured</Badge>}
            {property.verified && <Badge variant="verified"><BadgeCheck className="w-3 h-3" /> Verified</Badge>}
            {property.priceDrop && <Badge variant="priceDrop"><TrendingDown className="w-3 h-3" /> {property.priceDrop}% Drop</Badge>}
          </div>
        </Link>

        <div className="flex flex-col flex-1 p-5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <Link to={`/property/${property.slug}`} className="hover:text-emerald-600 transition-colors">
              <h3 className="font-bold text-navy-900 dark:text-white text-base leading-snug line-clamp-2">
                {property.title}
              </h3>
            </Link>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => toggleFavorite(property.id)}
                className={cn('w-8 h-8 rounded-lg flex items-center justify-center transition-all', isFav ? 'bg-red-50 text-red-500' : 'text-gray-400 hover:text-red-400 hover:bg-red-50')}
                aria-label={isFav ? 'Remove from saved' : 'Save property'}
              >
                <Heart className={cn('w-4 h-4', isFav && 'fill-current')} />
              </button>
            </div>
          </div>

          <p className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-3">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            {property.location.area}, {property.location.city}
          </p>

          <div className="flex flex-wrap gap-4 mb-4 text-sm">
            {property.bedrooms !== undefined && (
              <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                <Bed className="w-4 h-4" /> {property.bedrooms} Beds
              </span>
            )}
            {property.bathrooms !== undefined && (
              <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                <Bath className="w-4 h-4" /> {property.bathrooms} Baths
              </span>
            )}
            <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
              <Maximize2 className="w-4 h-4" /> {formatArea(property.area, property.areaUnit)}
            </span>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">{property.description}</p>

          <div className="mt-auto flex items-center justify-between">
            <div>
              <p className="text-xl font-extrabold text-navy-900 dark:text-white">
                {formatPrice(property.price)}
                {property.priceUnit && <span className="text-sm font-normal text-gray-400 ml-1">{property.priceUnit}</span>}
              </p>
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                <Eye className="w-3 h-3" /> {property.views.toLocaleString()} views · {timeAgo(property.postedAt)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`tel:${property.agent.phone}`}
                className="w-9 h-9 rounded-xl bg-navy-900 text-white flex items-center justify-center hover:bg-navy-800 transition-colors"
                aria-label="Call agent"
              >
                <Phone className="w-4 h-4" />
              </a>
              <a
                href={whatsappUrl(property.agent.whatsapp, `Hi, I'm interested in ${property.title}`)}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-colors"
                aria-label="WhatsApp agent"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="card group animate-fade-in">
      {/* Image */}
      <Link to={`/property/${property.slug}`} className="block relative overflow-hidden h-52">
        {!imgLoaded && <div className="skeleton absolute inset-0" />}
        <img
          src={imgError ? 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=70' : primaryImage?.url}
          alt={primaryImage?.alt || property.title}
          className={cn(
            'w-full h-full object-cover transition-all duration-500 group-hover:scale-105',
            imgLoaded ? 'opacity-100' : 'opacity-0',
          )}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          {property.premium && <Badge variant="premium">✦ Premium</Badge>}
          {property.featured && !property.premium && <Badge variant="featured">⭐ Featured</Badge>}
          {property.verified && <Badge variant="verified"><BadgeCheck className="w-3 h-3" /> Verified</Badge>}
        </div>

        {property.priceDrop && (
          <div className="absolute top-3 right-12">
            <Badge variant="priceDrop"><TrendingDown className="w-3 h-3" /> {property.priceDrop}% Drop</Badge>
          </div>
        )}

        {/* Actions */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5">
          <button
            onClick={(e) => { e.preventDefault(); toggleFavorite(property.id); }}
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow-md',
              isFav ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-600 hover:text-red-500',
            )}
            aria-label={isFav ? 'Remove from saved' : 'Save property'}
          >
            <Heart className={cn('w-3.5 h-3.5', isFav && 'fill-current')} />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); handleShare(e); }}
            className="w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center text-gray-600 hover:text-navy-900 transition-colors shadow-md"
            aria-label="Share property"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); toggleCompare(property.id); }}
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow-md',
              inCompare ? 'bg-emerald-500 text-white' : 'bg-white/90 text-gray-600 hover:text-emerald-600',
            )}
            aria-label="Compare property"
          >
            <BarChart2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Purpose tag */}
        <div className="absolute bottom-3 left-3">
          <span className={cn(
            'text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide',
            property.purpose === 'buy' ? 'bg-navy-900 text-white' :
            property.purpose === 'rent' ? 'bg-emerald-600 text-white' :
            'bg-gold-500 text-white',
          )}>
            For {property.purpose === 'buy' ? 'Sale' : property.purpose === 'rent' ? 'Rent' : 'Commercial'}
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link to={`/property/${property.slug}`}>
          <h3 className="font-bold text-navy-900 dark:text-white text-sm leading-snug line-clamp-2 mb-1.5 hover:text-emerald-600 transition-colors">
            {property.title}
          </h3>
        </Link>

        <p className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-3">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          {property.location.area}, {property.location.city}
        </p>

        {/* Specs */}
        <div className="flex items-center gap-3 mb-3 text-xs text-gray-600 dark:text-gray-300">
          {property.bedrooms !== undefined && (
            <span className="flex items-center gap-1">
              <Bed className="w-3.5 h-3.5" /> {property.bedrooms}
            </span>
          )}
          {property.bathrooms !== undefined && (
            <span className="flex items-center gap-1">
              <Bath className="w-3.5 h-3.5" /> {property.bathrooms}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Maximize2 className="w-3.5 h-3.5" /> {formatArea(property.area, property.areaUnit)}
          </span>
          {property.furnished && (
            <span className="ml-auto text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-navy-700 rounded capitalize">
              {property.furnished}
            </span>
          )}
        </div>

        <div className="border-t border-gray-100 dark:border-navy-700 pt-3 flex items-end justify-between">
          <div>
            <p className="text-lg font-extrabold text-navy-900 dark:text-white leading-none">
              {formatPrice(property.price)}
            </p>
            {property.priceUnit && (
              <p className="text-xs text-gray-400 mt-0.5">{property.priceUnit}</p>
            )}
          </div>

          {/* Agent mini-profile */}
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-xs font-semibold text-navy-800 dark:text-gray-200 truncate max-w-[80px]">
                {property.agent.name.split(' ')[0]}
              </p>
              <StarRating rating={property.agent.rating} showValue={false} />
            </div>
            <Avatar src={property.agent.avatar} name={property.agent.name} size="sm" />
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50 dark:border-navy-700/50">
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Eye className="w-3 h-3" /> {property.views.toLocaleString()}
          </span>
          <span className="text-xs text-gray-400">{timeAgo(property.postedAt)}</span>
          <div className="flex items-center gap-1.5">
            <a
              href={whatsappUrl(property.agent.whatsapp, `Hi, I'm interested in ${property.title}`)}
              target="_blank"
              rel="noreferrer"
              className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors"
              aria-label="WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </a>
            <a
              href={`tel:${property.agent.phone}`}
              className="w-7 h-7 rounded-lg bg-navy-50 dark:bg-navy-700 text-navy-700 dark:text-navy-300 flex items-center justify-center hover:bg-navy-100 transition-colors"
              aria-label="Call"
            >
              <Phone className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
