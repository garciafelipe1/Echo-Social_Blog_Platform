interface Props {
  activeTab: 'for_you' | 'following';
  onTabChange: (tab: 'for_you' | 'following') => void;
}

const TABS: { key: 'for_you' | 'following'; label: string }[] = [
  { key: 'for_you', label: 'Para ti' },
  { key: 'following', label: 'Siguiendo' },
];

export default function FeedHeader({ activeTab, onTabChange }: Props) {
  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-dark-third dark:bg-dark-main/80">
      <div className="flex">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className="relative flex flex-1 justify-center py-4 text-[15px] font-semibold text-gray-900 transition-colors hover:bg-gray-50 dark:text-dark-txt dark:hover:bg-dark-second"
          >
            {tab.label}
            {activeTab === tab.key && (
              <span
                className="absolute bottom-0 left-1/2 h-0.5 w-14 -translate-x-1/2 rounded-full bg-violet-500"
                aria-hidden
              />
            )}
          </button>
        ))}
      </div>
    </header>
  );
}
