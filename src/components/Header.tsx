'use client';

import Image from 'next/image';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.logoLeft}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Image
            src="/PortlandHearts_logo.png"
            alt="Portland Hearts of Pine"
            width={50}
            height={50}
            unoptimized
            priority
          />
          <span style={{ fontWeight: 'bold', fontSize: '1.25rem', letterSpacing: '-0.025em', color: 'white' }}>Hearts of Pine</span>
        </div>
      </div>
      <div className={styles.titleBlock}>
        <h1 className={styles.title}>TACTICAL PULSE</h1>
        <span className={styles.version}>v1.0</span>
      </div>
      <div className={styles.logoRight}>
        <Image
          src="/USL_League_One_horz_logo.png"
          alt="USL League One"
          width={120}
          height={40}
          unoptimized
          priority
        />
      </div>
    </header>
  );
}
