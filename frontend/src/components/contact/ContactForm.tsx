import { useState, FormEvent, ChangeEvent } from 'react';
import { EnvelopeIcon } from '@heroicons/react/24/outline';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

type FormStatus = 'idle' | 'sending' | 'success' | 'error';

const INITIAL_FORM: FormData = { name: '', email: '', subject: '', message: '' };

const FIELDS = [
  { id: 'name', label: 'Nombre', type: 'text', placeholder: 'Tu nombre', autoComplete: 'name' },
  {
    id: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'tu@email.com',
    autoComplete: 'email',
  },
  {
    id: 'subject',
    label: 'Asunto',
    type: 'text',
    placeholder: '¿En qué podemos ayudarte?',
    autoComplete: 'off',
  },
] as const;

function isFormValid(data: FormData): boolean {
  return Object.values(data).every((v) => v.trim().length > 0);
}

export default function ContactForm() {
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [status, setStatus] = useState<FormStatus>('idle');

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isFormValid(form)) return;

    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setStatus(res.ok ? 'success' : 'error');
      if (res.ok) setForm(INITIAL_FORM);
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-emerald-200 bg-emerald-50 p-10 text-center dark:border-emerald-800 dark:bg-emerald-900/20">
        <EnvelopeIcon className="mb-4 h-12 w-12 text-emerald-500" />
        <h3 className="dark:text-dark-txt text-lg font-semibold text-gray-900">Mensaje enviado</h3>
        <p className="dark:text-dark-txt-secondary mt-2 text-sm text-gray-600">
          Gracias por contactarnos. Te responderemos lo antes posible.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-6 text-sm font-medium text-violet-600 hover:underline"
        >
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {FIELDS.map((field) => (
        <div key={field.id}>
          <label
            htmlFor={field.id}
            className="dark:text-dark-txt block text-sm font-medium text-gray-700"
          >
            {field.label}
          </label>
          <input
            id={field.id}
            type={field.type}
            placeholder={field.placeholder}
            autoComplete={field.autoComplete}
            value={form[field.id as keyof FormData]}
            onChange={handleChange}
            required
            className="dark:border-dark-third dark:bg-dark-second dark:text-dark-txt dark:placeholder:text-dark-txt-secondary mt-1.5 block w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>
      ))}

      <div>
        <label
          htmlFor="message"
          className="dark:text-dark-txt block text-sm font-medium text-gray-700"
        >
          Mensaje
        </label>
        <textarea
          id="message"
          rows={5}
          placeholder="Escribe tu mensaje..."
          value={form.message}
          onChange={handleChange}
          required
          className="dark:border-dark-third dark:bg-dark-second dark:text-dark-txt dark:placeholder:text-dark-txt-secondary mt-1.5 block w-full resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
        />
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-600">
          Hubo un error al enviar el mensaje. Intenta nuevamente.
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'sending' || !isFormValid(form)}
        className="w-full rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === 'sending' ? 'Enviando...' : 'Enviar mensaje'}
      </button>
    </form>
  );
}
