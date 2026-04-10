'use client';

import { useState } from 'react';
import Image from 'next/image';

interface OpponentCrestProps {
  teamSlug: string;
  size?: number;
  alt?: string;
}

export default function OpponentCrest({ teamSlug, size = 32, alt }: OpponentCrestProps) {
  const [srcIndex, setSrcIndex] = useState(0);

  const sources = [
    `/logos/opponents/${teamSlug}.webp`,
    `/logos/opponents/${teamSlug}.png`,
    `/logos/opponents/usl1_placeholder.png`,
  ];

  return (
    <Image
      src={sources[srcIndex]}
      alt={alt || teamSlug.replace(/_/g, ' ')}
      width={size}
      height={size}
      unoptimized
      style={{ objectFit: 'contain', borderRadius: '4px' }}
      onError={() => {
        if (srcIndex < sources.length - 1) {
          setSrcIndex((prev) => prev + 1);
        }
      }}
    />
  );
}
