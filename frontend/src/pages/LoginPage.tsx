import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Building2, Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/AuthContext';
import { login as loginApi, register as registerApi } from '@/services/api';
import { Button } from '@/components/ui';
import { cn } from '@/utils';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  password: z.string().min(8, 'At least 8 characters'),
  confirmPassword: z.string(),
  role: z.enum(['buyer', 'seller']),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: setAuth } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(() =>
    location.pathname === '/register' ? 'register' : 'login',
  );
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'buyer' },
  });

  const handleLogin = async (data: LoginForm) => {
    setError('');
    setLoading(true);
    try {
      const res = await loginApi(data.email, data.password);
      setAuth(res.user, res.token);
      const destination = location.state?.from?.pathname
        || (res.user.role === 'admin' ? '/admin/dashboard'
          : res.user.role === 'seller' ? '/seller/dashboard' : '/buyer/dashboard');
      navigate(destination, { replace: true });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (data: RegisterForm) => {
    setError('');
    setLoading(true);
    try {
      const res = await registerApi({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        phone: data.phone,
      });
      setAuth(res.user, res.token);
      navigate(data.role === 'seller' ? '/seller/dashboard' : '/buyer/dashboard');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-navy-950 to-navy-800 text-white p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 bg-emerald-400 rounded-full blur-[120px]" />
          <div className="absolute bottom-40 left-10 w-56 h-56 bg-gold-400 rounded-full blur-[100px]" />
        </div>
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2.5 mb-16">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-extrabold">
              Makaan<span className="text-emerald-400">Mart</span>
            </span>
          </Link>
          <h2 className="text-4xl font-extrabold leading-tight mb-4">
            Find your <span className="text-emerald-400">dream home</span><br />
            in Pakistan
          </h2>
          <p className="text-gray-400 text-lg max-w-md">
            Join 200,000+ users who trust MakaanMart for buying, renting, and selling properties across 45 cities.
          </p>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <span>50,000+ Listings</span>
            <span className="w-1 h-1 bg-gray-600 rounded-full" />
            <span>3,500+ Dealers</span>
            <span className="w-1 h-1 bg-gray-600 rounded-full" />
            <span>100% Free</span>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white dark:bg-navy-950">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-navy-900 to-emerald-600 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold text-navy-900 dark:text-white">
              Makaan<span className="text-emerald-500">Mart</span>
            </span>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-100 dark:bg-navy-800 rounded-xl p-1 mb-6">
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className={cn(
                  'flex-1 py-2.5 rounded-lg text-sm font-bold transition-all capitalize',
                  mode === m
                    ? 'bg-white dark:bg-navy-700 text-navy-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400',
                )}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-xl mb-4 font-medium">
              {error}
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white mb-1">Welcome back</h1>
              <p className="text-gray-500 text-sm mb-4">Sign in to your MakaanMart account</p>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...loginForm.register('email')}
                  type="email"
                  placeholder="Email address"
                  className={cn('input-field pl-10', loginForm.formState.errors.email && 'border-red-400')}
                  autoComplete="email"
                />
              </div>
              {loginForm.formState.errors.email && <p className="text-xs text-red-500 -mt-2">{loginForm.formState.errors.email.message}</p>}

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...loginForm.register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  className={cn('input-field pl-10 pr-10', loginForm.formState.errors.password && 'border-red-400')}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Toggle password"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {loginForm.formState.errors.password && <p className="text-xs text-red-500 -mt-2">{loginForm.formState.errors.password.message}</p>}

              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
                Sign In <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          ) : (
            <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
              <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white mb-1">Create your account</h1>
              <p className="text-gray-500 text-sm mb-2">Join MakaanMart — it's free</p>

              {/* Role toggle */}
              <div className="flex gap-2 mb-2">
                {(['buyer', 'seller'] as const).map((r) => (
                  <label key={r} className="flex-1 cursor-pointer">
                    <input type="radio" value={r} {...registerForm.register('role')} className="sr-only peer" />
                    <div className={cn(
                      'py-2.5 rounded-xl text-center text-sm font-bold border transition-all',
                      'peer-checked:bg-navy-900 peer-checked:text-white peer-checked:border-navy-900',
                      'border-gray-200 dark:border-navy-600 text-gray-500 hover:border-gray-400',
                    )}>
                      {r === 'buyer' ? '🏠 Buyer' : '🔑 Seller / Dealer'}
                    </div>
                  </label>
                ))}
              </div>

              {[
                { name: 'name' as const, icon: User, placeholder: 'Full Name', type: 'text' },
                { name: 'email' as const, icon: Mail, placeholder: 'Email Address', type: 'email' },
                { name: 'phone' as const, icon: Phone, placeholder: 'Phone (+92 3XX XXXXXXX)', type: 'tel' },
              ].map(({ name, icon: Icon, placeholder, type }) => (
                <div key={name}>
                  <div className="relative">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      {...registerForm.register(name)}
                      type={type}
                      placeholder={placeholder}
                      className={cn('input-field pl-10', registerForm.formState.errors[name] && 'border-red-400')}
                    />
                  </div>
                  {registerForm.formState.errors[name] && <p className="text-xs text-red-500 mt-1">{registerForm.formState.errors[name]?.message}</p>}
                </div>
              ))}

              {[
                { name: 'password' as const, placeholder: 'Password' },
                { name: 'confirmPassword' as const, placeholder: 'Confirm Password' },
              ].map(({ name, placeholder }) => (
                <div key={name}>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      {...registerForm.register(name)}
                      type={showPassword ? 'text' : 'password'}
                      placeholder={placeholder}
                      className={cn('input-field pl-10', registerForm.formState.errors[name] && 'border-red-400')}
                    />
                  </div>
                  {registerForm.formState.errors[name] && <p className="text-xs text-red-500 mt-1">{registerForm.formState.errors[name]?.message}</p>}
                </div>
              ))}

              <p className="text-xs text-gray-400">
                By creating an account, you agree to our{' '}
                <Link to="/terms" className="text-emerald-600">Terms</Link> and{' '}
                <Link to="/privacy" className="text-emerald-600">Privacy Policy</Link>.
              </p>

              <Button type="submit" variant="emerald" size="lg" loading={loading} className="w-full">
                Create Account <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
