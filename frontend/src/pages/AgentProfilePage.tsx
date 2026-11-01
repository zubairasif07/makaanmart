import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin, Phone, MessageCircle, BadgeCheck,
  Star, Calendar, Building2, Eye, ArrowLeft,
} from 'lucide-react';
import { getAgentById, getAgentListings } from '@/services/api';
import type { Agent, Property } from '@/types';
import { Avatar, StarRating, Badge, Skeleton, EmptyState } from '@/components/ui';
import PropertyCard from '@/components/property/PropertyCard';
import { whatsappUrl, formatDate } from '@/utils';

export default function AgentProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [listings, setListings] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([getAgentById(id), getAgentListings(id)]).then(([a, l]) => {
      setAgent(a);
      setListings(l);
      setLoading(false);
      if (a) document.title = `${a.name} — Agent Profile | MakaanMart`;
    }).catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : 'Could not load agent profile.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="container-custom py-10 space-y-4">
        <Skeleton className="h-48 rounded-2xl" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="container-custom py-24">
        <EmptyState title={error ? 'Could not load agent' : 'Agent not found'} description={error || "The agent profile you're looking for doesn't exist."} />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-navy-900 min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-navy-950 to-navy-800 py-12">
        <div className="container-custom">
          <Link to="/agents" className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> All Agents
          </Link>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              <Avatar src={agent.avatar} name={agent.name} size="xl" className="w-28 h-28 text-3xl" />
              {agent.verified && (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                  <BadgeCheck className="w-4.5 h-4.5 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center gap-2 mb-1 justify-center md:justify-start">
                <h1 className="text-2xl font-extrabold text-white">{agent.name}</h1>
                {agent.verified && <Badge variant="verified">Verified</Badge>}
              </div>
              {agent.agency && (
                <p className="text-emerald-400 font-semibold text-sm mb-2">{agent.agency}</p>
              )}
              <p className="text-gray-400 text-sm mb-3 flex items-center gap-1.5 justify-center md:justify-start">
                <MapPin className="w-4 h-4" /> {agent.cities.join(', ')}
              </p>
              <p className="text-gray-300 text-sm leading-relaxed max-w-2xl">{agent.bio}</p>
              <div className="flex flex-wrap items-center gap-4 mt-4 justify-center md:justify-start">
                <StarRating rating={agent.rating} size="md" showValue />
                <span className="text-gray-400 text-sm">({agent.reviewCount} reviews)</span>
                <span className="text-gray-400 text-sm flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> Since {formatDate(agent.activeSince)}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <a
                href={`tel:${agent.phone}`}
                className="flex items-center gap-2 px-4 py-2.5 bg-white text-navy-900 font-bold text-sm rounded-xl hover:bg-gray-100 transition-colors"
              >
                <Phone className="w-4 h-4" /> Call
              </a>
              <a
                href={whatsappUrl(agent.whatsapp, `Hi ${agent.name}, I found your profile on MakaanMart.`)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white font-bold text-sm rounded-xl hover:bg-emerald-600 transition-colors"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Active Listings', value: agent.totalListings, icon: Building2 },
            { label: 'Rating', value: `${agent.rating}/5.0`, icon: Star },
            { label: 'Reviews', value: agent.reviewCount, icon: Eye },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white dark:bg-navy-800 rounded-2xl p-5 text-center border border-gray-100 dark:border-navy-700">
              <Icon className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
              <p className="text-2xl font-extrabold text-navy-900 dark:text-white">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Listings */}
        <h2 className="text-xl font-bold text-navy-900 dark:text-white mb-5">Active Listings</h2>
        {listings.length === 0 ? (
          <EmptyState
            title="No active listings"
            description="This agent doesn't have any active listings at the moment."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.map((p) => <PropertyCard key={p.id} property={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
