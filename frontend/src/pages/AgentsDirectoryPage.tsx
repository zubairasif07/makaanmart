import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, MessageCircle, BadgeCheck } from 'lucide-react';
import { Avatar, StarRating, EmptyState } from '@/components/ui';
import { whatsappUrl } from '@/utils';
import { getAgents } from '@/services/api';
import type { Agent } from '@/types';

export default function AgentsDirectoryPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Property Agents & Dealers in Pakistan | MakaanMart';
    getAgents()
      .then(setAgents)
      .catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : 'Could not load agents.'));
  }, []);

  return (
    <div className="bg-gray-50 dark:bg-navy-900 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-navy-950 to-navy-800 py-16">
        <div className="container-custom text-center">
          <p className="text-emerald-400 font-semibold text-sm mb-3">✦ Trusted Professionals</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">
            Agents & Dealers
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Connect with Pakistan's most verified and highest-rated property professionals
          </p>
        </div>
      </div>

      <div className="container-custom py-10">
        {error && <p role="alert" className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div key={agent.id} className="bg-white dark:bg-navy-800 rounded-2xl p-6 border border-gray-100 dark:border-navy-700 shadow-card hover:shadow-card-hover transition-all hover:-translate-y-0.5">
              <div className="flex items-start gap-4 mb-4">
                <div className="relative flex-shrink-0">
                  <Avatar src={agent.avatar} name={agent.name} size="lg" />
                  {agent.verified && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                      <BadgeCheck className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/agents/${agent.id}`} className="hover:text-emerald-600 transition-colors">
                    <h3 className="font-extrabold text-navy-900 dark:text-white truncate">{agent.name}</h3>
                  </Link>
                  {agent.agency && (
                    <p className="text-sm text-emerald-600 font-medium truncate">{agent.agency}</p>
                  )}
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" /> {agent.cities.join(', ')}
                  </p>
                  <StarRating rating={agent.rating} showValue />
                </div>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">{agent.bio}</p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-navy-700">
                <div className="text-sm">
                  <span className="font-bold text-navy-900 dark:text-white">{agent.totalListings}</span>
                  <span className="text-gray-400"> listings</span>
                  <span className="mx-2 text-gray-200 dark:text-navy-600">·</span>
                  <span className="font-bold text-navy-900 dark:text-white">{agent.reviewCount}</span>
                  <span className="text-gray-400"> reviews</span>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`tel:${agent.phone}`}
                    className="w-9 h-9 rounded-xl bg-navy-50 dark:bg-navy-700 text-navy-700 dark:text-white flex items-center justify-center hover:bg-navy-100 transition-colors"
                    aria-label="Call agent"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                  <a
                    href={whatsappUrl(agent.whatsapp, `Hi ${agent.name}, I found your profile on MakaanMart.`)}
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors"
                    aria-label="WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <Link
                to={`/agents/${agent.id}`}
                className="mt-3 block w-full text-center text-sm font-semibold text-navy-900 dark:text-white py-2 rounded-xl border border-gray-200 dark:border-navy-600 hover:bg-gray-50 dark:hover:bg-navy-700 transition-colors"
              >
                View Profile
              </Link>
            </div>
          ))}
        </div>
        {!error && agents.length === 0 && <EmptyState title="No agents yet" description="Seller profiles will appear here when they join." />}
      </div>
    </div>
  );
}
