import { ChangeEvent, FormEvent, useMemo, useRef, useState } from 'react';
import { NextSeo } from 'next-seo';
import { CheckCircle2, Lightbulb, Loader2, Send, XCircle } from 'lucide-react';
import Navbar from '@/components/navbar';

const initialFormState = {
  name: '',
  email: '',
  remixUrl: '',
  originalSong: '',
  notes: ''
};

type FormState = typeof initialFormState;

type FormErrors = Partial<Record<keyof FormState, string>>;

export default function RequestsPage() {
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string | null }>({
    type: null,
    message: null
  });
  const formRef = useRef<HTMLFormElement | null>(null);

  const accessKey = "35557c5c-f048-4787-a560-fe6daa91c2f5"

  const isSubmitDisabled = useMemo(() => submitting || !accessKey, [accessKey, submitting]);

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
    setStatus({ type: null, message: null });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus({ type: null, message: null });

    const validationErrors = validate(formState);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    if (!accessKey) {
      setStatus({ type: 'error', message: 'Web3Forms access key is missing. Please try again later.' });
      return;
    }

    const body = {
      access_key: accessKey,
      subject: 'New BronBeats Remix Request',
      name: formState.name.trim(),
      email: formState.email.trim() || undefined,
      remix_url: formState.remixUrl.trim(),
      original_song: formState.originalSong.trim() || undefined,
      notes: formState.notes.trim() || undefined,
      from_name: 'BronBeats Request Form'
    };

    setSubmitting(true);

    try {
      const json = JSON.stringify(body);
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: json
      });

      const data = await response.json();
      if (data.success) {
        setStatus({ type: 'success', message: 'Thanks! Your message was sent successfully.' });
        setFormState(initialFormState);
        formRef.current?.reset();
      } else {
        setStatus({ type: 'error', message: data.message || 'Something went wrong. Please try again.' });
      }
    } catch (err) {
      console.error('Failed to submit remix request via Web3Forms', err);
      setStatus({ type: 'error', message: 'Network error. Please check your connection and try again.' });
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
                  Email (O)
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
              <label htmlFor="request-original-song" className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                Original song name (O)
              </label>
              <input
                id="request-original-song"
                type="text"
                value={formState.originalSong}
                onChange={handleChange('originalSong')}
                placeholder="e.g. Godspeed by Frank Ocean"
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-800 shadow-sm focus:border-lakersPurple-600 focus:outline-none focus:ring-2 focus:ring-lakersPurple-100"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="request-notes" className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                Why it belongs on BronBeats (O)
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

            {status.type === 'error' && status.message ? (
              <p className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
                <XCircle size={16} />
                {status.message}
              </p>
            ) : null}

            {status.type === 'success' && status.message ? (
              <p className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                <CheckCircle2 size={16} />
                {status.message}
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
              {!accessKey ? (
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Web3Forms access key missing.
                </span>
              ) : null}
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
