import Image, { type ImageProps } from 'next/image';
import { useMemo, useState } from 'react';

type Props = Omit<ImageProps, 'src'> & {
  src: string;
  fallbackSrc: string;
};

export default function FallbackImage({ src, fallbackSrc, onError, ...props }: Props) {
  const initial = useMemo(() => src || fallbackSrc, [src, fallbackSrc]);
  const [currentSrc, setCurrentSrc] = useState<string>(initial);

  return (
    <Image
      {...props}
      src={currentSrc}
      onError={(e) => {
        if (currentSrc !== fallbackSrc) setCurrentSrc(fallbackSrc);
        onError?.(e);
      }}
    />
  );
}

