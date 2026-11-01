import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar, Clock, User, ArrowLeft } from 'lucide-react';
import { getBlogPostBySlug, getBlogPosts } from '@/services/api';
import type { BlogPost } from '@/types';
import { Badge, EmptyState } from '@/components/ui';
import { formatDate } from '@/utils';

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = 'Real Estate Blog & Insights | MakaanMart'; }, []);
  useEffect(() => {
    getBlogPosts()
      .then(setPosts)
      .catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : 'Could not load articles.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="bg-gradient-to-br from-navy-950 to-navy-800 py-16">
        <div className="container-custom text-center">
          <p className="text-emerald-400 font-semibold text-sm mb-3">✦ Insights & Guides</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">
            Real Estate Blog
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Expert analysis, investment guides, and market trends for Pakistan's real estate landscape
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-50 dark:bg-navy-900">
        <div className="container-custom">
          {error && <p role="alert" className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</p>}
          {/* Featured post */}
          {posts[0] && (
            <Link
              to={`/blog/${posts[0].slug}`}
              className="block bg-white dark:bg-navy-800 rounded-2xl border border-gray-100 dark:border-navy-700 overflow-hidden shadow-card hover:shadow-card-hover transition-all mb-10 group"
            >
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="relative h-64 md:h-auto overflow-hidden">
                  <img
                    src={posts[0].image}
                    alt={posts[0].title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant="featured">Featured</Badge>
                  </div>
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <Badge variant="secondary" className="self-start mb-3">{posts[0].category}</Badge>
                  <h2 className="text-2xl font-extrabold text-navy-900 dark:text-white mb-3 group-hover:text-emerald-600 transition-colors">
                    {posts[0].title}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">{posts[0].excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1"><User className="w-4 h-4" /> {posts[0].author}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {formatDate(posts[0].publishedAt)}</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {posts[0].readTime} min</span>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Other posts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.slice(1).map((post) => (
              <Link key={post.id} to={`/blog/${post.slug}`} className="card group overflow-hidden">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary">{post.category}</Badge>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-navy-900 dark:text-white leading-snug mb-2 group-hover:text-emerald-600 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {post.author}</span>
                    <span>{post.readTime} min · {formatDate(post.publishedAt)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {!loading && posts.length === 0 && !error && <EmptyState title="No articles yet" description="Published articles will be listed here." />}
        </div>
      </section>
    </div>
  );
}

export function BlogPostPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<{ slug: string; post: BlogPost | null; error?: string } | null>(null);

  useEffect(() => {
    let active = true;
    getBlogPostBySlug(slug)
      .then((result) => {
        if (result) document.title = `${result.title} | MakaanMart`;
        if (active) setArticle({ slug, post: result });
      })
      .catch((loadError: unknown) => {
        if (active) setArticle({ slug, post: null, error: loadError instanceof Error ? loadError.message : 'Could not load article.' });
      });
    return () => { active = false; };
  }, [slug]);

  const articleLoaded = article?.slug === slug;
  const post = articleLoaded ? article.post : null;
  const error = articleLoaded ? article.error : '';

  if (!articleLoaded) return <div className="container-custom py-16 text-center text-gray-500">Loading article…</div>;
  if (error || !post) {
    return (
      <div className="container-custom py-16">
        <EmptyState title={error ? 'Could not load article' : 'Article not found'} description={error || 'This article may have been removed.'} />
        <Link to="/blog" className="mx-auto mt-6 flex w-fit items-center gap-2 text-sm font-semibold text-emerald-600"><ArrowLeft className="h-4 w-4" /> All articles</Link>
      </div>
    );
  }

  return (
    <article className="container-custom max-w-3xl py-12">
      <Link to="/blog" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600"><ArrowLeft className="h-4 w-4" /> All articles</Link>
      <Badge variant="secondary">{post.category}</Badge>
      <h1 className="mb-4 mt-3 text-3xl font-extrabold text-navy-900 dark:text-white md:text-4xl">{post.title}</h1>
      <p className="mb-6 text-gray-500 dark:text-gray-400">{post.excerpt}</p>
      <div className="mb-8 flex items-center gap-4 text-sm text-gray-500">
        <span className="flex items-center gap-1"><User className="h-4 w-4" /> {post.author}</span>
        <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {formatDate(post.publishedAt)}</span>
        <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {post.readTime} min read</span>
      </div>
      <img src={post.image} alt={post.title} className="mb-8 max-h-[28rem] w-full rounded-2xl object-cover" />
      {post.content ? (
        <div className="prose max-w-none whitespace-pre-line text-gray-700 dark:prose-invert dark:text-gray-300">{post.content}</div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">The full article is not available yet.</p>
      )}
    </article>
  );
}
