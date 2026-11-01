import React from 'react';
import { cn } from '@/utils';
import { cva, type VariantProps } from 'class-variance-authority';

// ─── BADGE ───────────────────────────────────────────────────────────────────
const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full text-xs font-semibold px-2.5 py-0.5 transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-navy-100 text-navy-800 dark:bg-navy-700 dark:text-navy-100',
        verified: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
        featured: 'bg-gold-500 text-white',
        premium: 'bg-navy-900 text-white',
        priceDrop: 'bg-red-500 text-white',
        secondary: 'bg-gray-100 text-gray-700 dark:bg-navy-700 dark:text-gray-300',
        outline: 'border border-current text-navy-900 dark:text-white',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </span>
  );
}

// ─── BUTTON ──────────────────────────────────────────────────────────────────
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none',
  {
    variants: {
      variant: {
        primary: 'bg-navy-900 text-white hover:bg-navy-800 active:bg-navy-950 shadow-sm hover:shadow-md focus-visible:ring-emerald-500',
        secondary: 'bg-white text-navy-900 border border-gray-200 hover:bg-gray-50 shadow-sm dark:bg-navy-800 dark:text-white dark:border-navy-600 dark:hover:bg-navy-700',
        emerald: 'bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700 shadow-sm hover:shadow-md focus-visible:ring-emerald-500',
        ghost: 'text-gray-600 hover:text-navy-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-navy-700',
        danger: 'bg-red-500 text-white hover:bg-red-600 shadow-sm',
        link: 'text-emerald-600 underline-offset-4 hover:underline p-0 h-auto font-medium',
        outline: 'border border-navy-900 text-navy-900 hover:bg-navy-50 dark:border-white dark:text-white dark:hover:bg-navy-800',
      },
      size: {
        xs: 'px-3 py-1.5 text-xs',
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-sm',
        lg: 'px-8 py-4 text-base',
        icon: 'w-10 h-10 p-0',
        'icon-sm': 'w-8 h-8 p-0',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export function Button({
  className,
  variant,
  size,
  loading,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
}

// ─── INPUT ───────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-semibold text-navy-900 dark:text-white mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          className={cn(
            'input-field',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            error && 'border-red-400 focus:ring-red-400',
            className,
          )}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {rightIcon}
          </span>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─── SELECT ──────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function Select({ label, error, options, placeholder, className, id, ...props }: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-semibold text-navy-900 dark:text-white mb-1.5">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'input-field appearance-none cursor-pointer',
          error && 'border-red-400',
          className,
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─── TEXTAREA ────────────────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  const areaId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={areaId} className="block text-sm font-semibold text-navy-900 dark:text-white mb-1.5">
          {label}
        </label>
      )}
      <textarea
        id={areaId}
        className={cn(
          'input-field resize-none',
          error && 'border-red-400 focus:ring-red-400',
          className,
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─── SKELETON ────────────────────────────────────────────────────────────────
interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

export function Skeleton({ className, height = 'h-4', width }: SkeletonProps) {
  return (
    <div
      className={cn(
        'skeleton rounded-lg',
        height,
        width ?? 'w-full',
        className,
      )}
    />
  );
}

// ─── CARD SKELETON ───────────────────────────────────────────────────────────
export function PropertyCardSkeleton() {
  return (
    <div className="bg-white dark:bg-navy-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-navy-700">
      <Skeleton className="h-52 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <div className="flex justify-between pt-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    </div>
  );
}

// ─── AVATAR ──────────────────────────────────────────────────────────────────
import { getInitials } from '@/utils';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const sizeClass = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
  }[size];

  return (
    <div className={cn('relative rounded-full overflow-hidden bg-navy-100 dark:bg-navy-700 flex items-center justify-center font-bold text-navy-700 dark:text-navy-200 flex-shrink-0', sizeClass, className)}>
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" loading="lazy" />
      ) : (
        getInitials(name)
      )}
    </div>
  );
}

// ─── STAR RATING ─────────────────────────────────────────────────────────────
interface StarRatingProps {
  rating: number;
  max?: number;
  showValue?: boolean;
  size?: 'sm' | 'md';
}

export function StarRating({ rating, max = 5, showValue = true, size = 'sm' }: StarRatingProps) {
  const starSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5';
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }, (_, i) => (
        <svg
          key={i}
          className={cn(starSize, i < Math.floor(rating) ? 'text-gold-500 fill-current' : 'text-gray-300 fill-current dark:text-navy-600')}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      {showValue && (
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 ml-0.5">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

// ─── DIVIDER ─────────────────────────────────────────────────────────────────
export function Divider({ className }: { className?: string }) {
  return <div className={cn('border-t border-gray-100 dark:border-navy-700', className)} />;
}

// ─── EMPTY STATE ─────────────────────────────────────────────────────────────
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && <div className="mb-4 text-gray-300 dark:text-navy-600">{icon}</div>}
      <h3 className="text-lg font-bold text-navy-900 dark:text-white mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 dark:text-gray-400 max-w-xs mb-6">{description}</p>
      )}
      {action}
    </div>
  );
}
