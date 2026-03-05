import { useState } from 'react';
import GenerateDemoUsersButton from './GenerateDemoUsersButton';
import GenerateDemoPostsButton from './GenerateDemoPostsButton';
import { WrenchScrewdriverIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface Props {
  onRefetchAfterGenerate?: () => void;
}

export default function BlogDemoTools({ onRefetchAfterGenerate }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/80">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-medium text-amber-800 hover:bg-amber-100/80"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <WrenchScrewdriverIcon className="h-5 w-5" />
          Herramientas de desarrollo
        </span>
        {open ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
      </button>
      {open && (
        <div className="flex flex-wrap items-center gap-3 border-t border-amber-200/80 px-4 py-3">
          <GenerateDemoUsersButton />
          <GenerateDemoPostsButton onSuccess={onRefetchAfterGenerate ?? (() => {})} />
        </div>
      )}
    </div>
  );
}
