interface ContainerProps {
  children: React.ReactNode;
}

export default function Container({ children }: ContainerProps) {
  return (
    <nav className="dark:border-dark-third hidden border-b border-gray-200 px-4 py-2 md:static md:block md:overflow-y-visible lg:px-6">
      {children}
    </nav>
  );
}
