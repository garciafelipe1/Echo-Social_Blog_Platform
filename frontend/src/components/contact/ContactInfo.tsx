import {
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

const INFO_ITEMS = [
  {
    icon: EnvelopeIcon,
    title: 'Email',
    description: 'Nuestro equipo responde en menos de 24h.',
    action: { label: 'soporte@tudominio.com', href: 'mailto:soporte@tudominio.com' },
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'Comunidad',
    description: 'Únete a la conversación en el blog.',
    action: { label: 'Ir al blog', href: '/blog' },
  },
  {
    icon: QuestionMarkCircleIcon,
    title: 'FAQ',
    description: 'Respuestas a las preguntas más comunes.',
    action: { label: 'Ver preguntas frecuentes', href: '#faq' },
  },
] as const;

export default function ContactInfo() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl dark:text-dark-txt">
          Ponte en contacto
        </h2>
        <p className="mt-3 text-gray-600 dark:text-dark-txt-secondary">
          ¿Tienes una pregunta, sugerencia o quieres colaborar? Nos encantaría saber de ti.
        </p>
      </div>

      <ul className="space-y-6">
        {INFO_ITEMS.map((item) => (
          <li key={item.title} className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
              <item.icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-dark-txt">{item.title}</h3>
              <p className="mt-0.5 text-sm text-gray-600 dark:text-dark-txt-secondary">{item.description}</p>
              <Link
                href={item.action.href}
                className="mt-1 inline-block text-sm font-medium text-violet-600 hover:text-violet-700"
              >
                {item.action.label}
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
