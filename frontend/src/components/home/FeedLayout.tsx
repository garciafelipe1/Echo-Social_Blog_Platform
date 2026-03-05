import { ReactNode } from 'react';

interface FeedLayoutProps {
  children: ReactNode;
  leftSidebar?: ReactNode;
  rightSidebar?: ReactNode;
}

export default function FeedLayout({ children, leftSidebar, rightSidebar }: FeedLayoutProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-dark-main">
      <div className="mx-auto grid min-h-screen max-w-[1280px] grid-cols-1 lg:grid-cols-[68px_minmax(0,600px)_1fr] xl:grid-cols-[240px_minmax(0,600px)_350px]">
        {/* Left sidebar: hidden on mobile, icons on lg, full on xl */}
        <div className="hidden lg:block">
          <div className="sticky top-0 h-screen overflow-y-auto py-4">
            {leftSidebar}
          </div>
        </div>

        {/* Central feed */}
        <div className="min-h-screen w-full border-gray-200 sm:border-x dark:border-dark-third">
          {children}
        </div>

        {/* Right sidebar: hidden on mobile, visible on lg+ */}
        <aside className="hidden py-4 pl-6 lg:block">
          <div className="sticky top-0 h-screen overflow-y-auto">
            {rightSidebar}
          </div>
        </aside>
      </div>
    </div>
  );
}
