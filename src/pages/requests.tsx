import { ChangeEvent, FormEvent, useMemo, useState } from 'react';
import { NextSeo } from 'next-seo';
import { CheckCircle2, Lightbulb, Loader2, Send, XCircle } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import Navbar from '@/components/navbar';
import { firebaseServices } from '@/lib/firebase/client';

const initialFormState = {
  name: '',
  email: '',
  remixUrl: '',
  notes: ''
};

type FormState = typeof initialFormState;

type FormErrors = Partial<Record<keyof FormState, string>>;

export default function RequestsPage() {
  const { firestore, isConfigured } = firebaseServices;
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const isSubmitDisabled = useMemo(() => submitting || !isConfigured, [isConfigured, submitting]);

  const validate = (state: FormState): FormErrors => {
    const nextErrors: FormErrors = {};

    if (!state.name.trim()) {
      nextErrors.name = 'Please let us know who you are.';
    }

    if (!state.remixUrl.trim()) {
      nextErrors.remixUrl = 'A remix link is required.';
    } else if (!/^https?:\/\//i.test(state.remixUrl.trim())) {
      nextErrors.remixUrl = 'Please provide a valid URL.';
    }

    if (state.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email.trim())) {
      nextErrors.email = 'This does not look like a valid email.';
    }

    return nextErrors;
  };

  const handleChange = (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value } = event.target;
    setFormState((current) => ({
      ...current,
      [field]: value
    }));
    setErrors((current) => ({
      ...current,
      [field]: undefined
    }));
    setSubmitError(null);
    setSubmitSuccess(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    const validationErrors = validate(formState);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    if (!firestore || !isConfigured) {
      setSubmitError('Remix requests are unavailable right now. Please try again later.');
      return;
    }

    setSubmitting(true);

    try {
      await addDoc(collection(firestore, 'remixRequests'), {
        name: formState.name.trim(),
        email: formState.email.trim() || null,
        remixUrl: formState.remixUrl.trim(),
        notes: formState.notes.trim() || null,
        submittedAt: serverTimestamp()
      });

      setFormState(initialFormState);
      setSubmitSuccess('Thanks! We will review your remix soon.');
    } catch (error) {
      console.error('Failed to submit remix request', error);
      setSubmitError('Something went wrong while sending your request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <NextSeo
        title="Request a Remix | BronBeats"
        description="Submit your favorite LeBron remix for us to feature on BronBeats."
        openGraph={{
          title: 'Request a Remix | BronBeats',
          description: 'Submit your favorite LeBron remix for us to feature on BronBeats.'
        }}
      />
      <Navbar />
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 pb-16 pt-12">
        <header className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-3 rounded-full bg-lakersPurple-100 px-5 py-2 text-lakersPurple-600">
            <Lightbulb size={20} />
            <span className=" font-semibold uppercase tracking-wide">Request a Remix</span>
          </div>
          <p className="max-w-2xl text-base text-slate-600">
            Found an iconic LeBron edit we should feature?
          </p>
          <p className="max-w-2xl text-base text-slate-600">
            Drop the link below and our team will check it out.
          </p>
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="request-name" className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                  Your name
                </label>
                <input
                  id="request-name"
                  type="text"
                  value={formState.name}
                  onChange={handleChange('name')}
                  placeholder="Bron Beats Fan"
                  className={`rounded-xl border px-4 py-3 text-sm text-slate-800 shadow-sm focus:border-lakersPurple-600 focus:outline-none focus:ring-2 focus:ring-lakersPurple-100 ${
                    errors.name ? 'border-red-500' : 'border-slate-300'
                  }`}
                  autoComplete="name"
                  required
                />
                {errors.name ? <p className="text-xs font-semibold text-red-600">{errors.name}</p> : null}
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="request-email" className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                  Email (optional)
                </label>
                <input
                  id="request-email"
                  type="email"
                  value={formState.email}
                  onChange={handleChange('email')}
                  placeholder="you@email.com"
                  className={`rounded-xl border px-4 py-3 text-sm text-slate-800 shadow-sm focus:border-lakersPurple-600 focus:outline-none focus:ring-2 focus:ring-lakersPurple-100 ${
                    errors.email ? 'border-red-500' : 'border-slate-300'
                  }`}
                  autoComplete="email"
                />
                {errors.email ? <p className="text-xs font-semibold text-red-600">{errors.email}</p> : null}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="request-remix-url" className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                Remix link
              </label>
              <input
                id="request-remix-url"
                type="url"
                value={formState.remixUrl}
                onChange={handleChange('remixUrl')}
                placeholder="https://www.youtube.com/watch?v=..."
                className={`rounded-xl border px-4 py-3 text-sm text-slate-800 shadow-sm focus:border-lakersPurple-600 focus:outline-none focus:ring-2 focus:ring-lakersPurple-100 ${
                  errors.remixUrl ? 'border-red-500' : 'border-slate-300'
                }`}
                required
              />
              {errors.remixUrl ? <p className="text-xs font-semibold text-red-600">{errors.remixUrl}</p> : null}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="request-notes" className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                Why it belongs on BronBeats (optional)
              </label>
              <textarea
                id="request-notes"
                value={formState.notes}
                onChange={handleChange('notes')}
                placeholder="Tell us what makes this remix special."
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-800 shadow-sm focus:border-lakersPurple-600 focus:outline-none focus:ring-2 focus:ring-lakersPurple-100"
                rows={4}
              />
            </div>

            {submitError ? (
              <p className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
                <XCircle size={16} />
                {submitError}
              </p>
            ) : null}

            {submitSuccess ? (
              <p className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                <CheckCircle2 size={16} />
                {submitSuccess}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="submit"
                disabled={isSubmitDisabled}
                className="inline-flex items-center gap-2 rounded-full bg-lakersPurple-600 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-lakersPurple-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                Submit request
              </button>
              {!isConfigured ? (
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Firebase configuration required to accept requests.
                </span>
              ) : null}
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
