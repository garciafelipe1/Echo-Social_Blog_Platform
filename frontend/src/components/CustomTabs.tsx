import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import React from 'react';

interface ComponentProps {
  titles: string[];
  panels: React.ReactNode[];
  width?: string;
}

export default function CustomTabs({ titles, panels }: ComponentProps) {
  return (
    <TabGroup>
      <TabList className="flex border-b border-gray-200 dark:border-dark-third">
        {titles.map((title) => (
          <Tab
            key={title}
            className={({ selected }) =>
              `relative flex-1 px-4 py-3 text-center text-sm font-semibold outline-none transition-colors ${
                selected
                  ? 'text-gray-900 dark:text-dark-txt'
                  : 'text-gray-500 hover:text-gray-700 dark:text-dark-txt-secondary dark:hover:text-dark-txt'
              }`
            }
          >
            {({ selected }) => (
              <>
                {title}
                {selected && (
                  <span className="absolute inset-x-0 bottom-0 mx-auto h-0.5 w-12 rounded-full bg-violet-500" />
                )}
              </>
            )}
          </Tab>
        ))}
      </TabList>
      <TabPanels>
        {panels.map((panel, index) => {
          const key = (panel as any)?.key ?? index;
          return <TabPanel key={key}>{panel}</TabPanel>;
        })}
      </TabPanels>
    </TabGroup>
  );
}

CustomTabs.defaultProps = {
  width: 'w-full',
};
