import React, { useEffect, useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui';
import { APP_CONFIG } from '@/config';
import { submitContactMessage } from '@/services/api';
import { cn } from '@/utils';

const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});
type ContactForm = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  useEffect(() => { document.title = 'Contact Us | MakaanMart'; }, []);

  const onSubmit = async (data: ContactForm) => {
    setSubmitError('');
    try {
      await submitContactMessage(data);
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Could not send your message.');
    }
  };

  const contactInfo = [
    { icon: MapPin, label: 'Address', value: '7th Floor, Arfa Software Technology Park, Lahore, Pakistan' },
    { icon: Phone, label: 'Phone', value: APP_CONFIG.contactPhone },
    { icon: Mail, label: 'Email', value: APP_CONFIG.contactEmail },
    { icon: Clock, label: 'Hours', value: 'Mon – Sat, 9:00 AM – 6:00 PM' },
  ];

  return (
    <div>
      <section className="bg-gradient-to-br from-navy-950 to-navy-800 py-16">
        <div className="container-custom text-center">
          <p className="text-emerald-400 font-semibold text-sm mb-3">✦ Get in Touch</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">Contact Us</h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Have a question, suggestion, or need support? We'd love to hear from you.
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-50 dark:bg-navy-900">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="space-y-4">
              {contactInfo.map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-white dark:bg-navy-800 rounded-2xl p-5 border border-gray-100 dark:border-navy-700 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-navy-900 dark:text-white">{label}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2 bg-white dark:bg-navy-800 rounded-2xl border border-gray-100 dark:border-navy-700 p-6">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-bold text-navy-900 dark:text-white mb-2">Message Sent!</h3>
                  <p className="text-gray-500 max-w-md mx-auto">Thank you for reaching out. Our team will get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <h2 className="text-xl font-bold text-navy-900 dark:text-white mb-2">Send us a message</h2>
                  {submitError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{submitError}</p>}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { name: 'name' as const, placeholder: 'Your Name', type: 'text' },
                      { name: 'email' as const, placeholder: 'Email Address', type: 'email' },
                      { name: 'phone' as const, placeholder: 'Phone (optional)', type: 'tel' },
                      { name: 'subject' as const, placeholder: 'Subject', type: 'text' },
                    ].map(({ name, placeholder, type }) => (
                      <div key={name}>
                        <input
                          {...register(name)}
                          type={type}
                          placeholder={placeholder}
                          className={cn('input-field', errors[name] && 'border-red-400')}
                        />
                        {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]?.message}</p>}
                      </div>
                    ))}
                  </div>
                  <div>
                    <textarea
                      {...register('message')}
                      rows={5}
                      placeholder="Your message..."
                      className={cn('input-field resize-none', errors.message && 'border-red-400')}
                    />
                    {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message.message}</p>}
                  </div>
                  <Button type="submit" variant="emerald" size="lg" loading={isSubmitting}>
                    <Send className="w-4 h-4" /> Send Message
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
