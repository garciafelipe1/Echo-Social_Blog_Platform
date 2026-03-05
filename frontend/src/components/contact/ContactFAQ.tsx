import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: '¿Cómo puedo crear una cuenta?',
    answer:
      'Haz clic en "Registrarse" en la esquina superior derecha, completa tus datos y activa tu cuenta desde el email de confirmación.',
  },
  {
    question: '¿Puedo publicar artículos en el blog?',
    answer:
      'Sí. Una vez que tengas una cuenta verificada, ve a tu perfil y usa el botón "Nueva publicación" para crear tu primer artículo.',
  },
  {
    question: '¿La plataforma es gratuita?',
    answer:
      'Totalmente. Crear una cuenta, leer y publicar contenido es gratis y lo seguirá siendo.',
  },
  {
    question: '¿Cómo puedo reportar contenido inapropiado?',
    answer:
      'Usa el botón de tres puntos ("...") en cualquier publicación y selecciona "Reportar". Nuestro equipo lo revisará en menos de 24 horas.',
  },
];

function FAQAccordionItem({ item }: { item: FAQItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 dark:border-dark-third">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-4 text-left text-[15px] font-medium text-gray-900 hover:text-violet-600 dark:text-dark-txt dark:hover:text-violet-400"
        aria-expanded={open}
      >
        {item.question}
        <ChevronDownIcon
          className={`h-5 w-5 shrink-0 text-gray-400 transition-transform dark:text-dark-txt-secondary ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <p className="pb-4 text-sm leading-relaxed text-gray-600 dark:text-dark-txt-secondary">{item.answer}</p>
      )}
    </div>
  );
}

export default function ContactFAQ() {
  return (
    <section id="faq" className="mx-auto max-w-3xl">
      <h2 className="text-center text-xl font-bold text-gray-900 dark:text-dark-txt">Preguntas frecuentes</h2>
      <p className="mt-2 text-center text-sm text-gray-600 dark:text-dark-txt-secondary">
        ¿No encuentras lo que buscas? Escríbenos con el formulario de arriba.
      </p>
      <div className="mt-8">
        {FAQS.map((faq) => (
          <FAQAccordionItem key={faq.question} item={faq} />
        ))}
      </div>
    </section>
  );
}
