import Layout from '@/hocs/Layout';
import { ContactForm, ContactInfo, ContactFAQ } from '@/components/contact';
import type { ReactElement } from 'react';

export default function ContactPage() {
  return (
    <div className="dark:bg-dark-main min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
          <ContactInfo />
          <ContactForm />
        </div>
      </div>
      <div className="dark:border-dark-third dark:bg-dark-bg border-t border-gray-200 bg-gray-50/50 px-4 py-8 sm:px-6 sm:py-16 lg:px-8">
        <ContactFAQ />
      </div>
    </div>
  );
}

ContactPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
