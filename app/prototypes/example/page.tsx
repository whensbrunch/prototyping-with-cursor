"use client";

import styles from './styles.module.css';
import Link from 'next/link';
import { useState, useRef } from 'react';

/* Vaporwave / Synthwave theme variants */
const THEMES = {
  vapor: {
    primary: '#05d9e8',
    secondary: '#d300c5',
    light: 'rgba(5, 217, 232, 0.2)',
    background: 'rgba(26, 10, 46, 0.9)',
  },
  neon: {
    primary: '#ff2a6d',
    secondary: '#05d9e8',
    light: 'rgba(255, 42, 109, 0.2)',
    background: 'rgba(26, 10, 46, 0.9)',
  },
  sunset: {
    primary: '#ffb627',
    secondary: '#ff2a6d',
    light: 'rgba(255, 182, 39, 0.2)',
    background: 'rgba(26, 10, 46, 0.9)',
  },
  magenta: {
    primary: '#d300c5',
    secondary: '#ff7b9c',
    light: 'rgba(211, 0, 197, 0.2)',
    background: 'rgba(26, 10, 46, 0.9)',
  },
  cyan: {
    primary: '#05d9e8',
    secondary: '#ffb627',
    light: 'rgba(5, 217, 232, 0.2)',
    background: 'rgba(26, 10, 46, 0.9)',
  },
};

type ThemeColor = keyof typeof THEMES;

export default function ExamplePrototype() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [theme, setTheme] = useState<ThemeColor>('vapor');
  const dragStart = useRef({ x: 0, y: 0 });
  const windowStart = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    windowStart.current = position;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    
    setPosition({
      x: windowStart.current.x + dx,
      y: windowStart.current.y + dy
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const currentTheme = THEMES[theme];

  return (
    <div className={styles.container}
         onMouseMove={handleMouseMove}
         onMouseUp={handleMouseUp}
         onMouseLeave={handleMouseUp}>
      <div className={styles.buttonContainer}>
        <Link href="/" className={styles.backButton}>← Back</Link>
      </div>
      <div className={styles.themeContainer}>
        {(Object.keys(THEMES) as ThemeColor[]).map((color) => (
          <button
            key={color}
            className={`${styles.themeButton} ${theme === color ? styles.themeButtonActive : ''}`}
            onClick={() => setTheme(color)}
            style={{
              backgroundColor: THEMES[color].primary,
              borderColor: THEMES[color].secondary
            }}
            aria-label={`Switch to ${color} theme`}
          />
        ))}
      </div>
      <div className={styles.window}
           style={{
             transform: `translate(${position.x}px, ${position.y}px)`,
             cursor: isDragging ? 'grabbing' : 'auto'
           }}>
        <div className={styles.windowBar}
             onMouseDown={handleMouseDown}
             style={{ 
               cursor: 'grab',
               background: `linear-gradient(to bottom, ${currentTheme.light} 0%, ${currentTheme.light} 95%, ${currentTheme.primary} 100%)`,
               borderColor: currentTheme.secondary
             }}>
          <div className={styles.windowTitle} style={{ color: currentTheme.secondary }}>
            Example Prototype
          </div>
        </div>
        <div className={styles.windowContent} style={{
          backgroundColor: currentTheme.background,
          borderColor: currentTheme.secondary,
          boxShadow: `0 0 20px ${currentTheme.secondary}40`
        }}>
          <h1 className={styles.heading1} style={{ color: currentTheme.secondary }}>
            Welcome to example prototype
          </h1>
          <div className={styles.section} style={{ 
            borderLeftColor: currentTheme.primary,
            backgroundColor: 'var(--color-surface-light)'
          }}>
            <h2 className={styles.heading2} style={{ color: currentTheme.secondary }}>
              How to create a prototype
            </h2>
            <ol className={styles.list}>
              <li style={{ color: 'var(--color-ink)' }}>① Open Composer Agent (⌘-I)</li>
              <li style={{ color: 'var(--color-ink)' }}>② Type: &quot;Create a prototype for me&quot;</li>
              <li style={{ color: 'var(--color-ink)' }}>③ Describe the key features you need</li>
              <li style={{ color: 'var(--color-ink)' }}>④ Share any design preferences</li>
            </ol>
          </div>
          <div className={styles.section} style={{ 
            borderLeftColor: currentTheme.primary,
            backgroundColor: 'var(--color-surface-light)'
          }}>
            <h2 className={styles.heading2} style={{ color: currentTheme.secondary }}>
              Things to know
            </h2>
            <ol className={styles.list}>
              <li style={{ color: 'var(--color-ink)' }}>◇ Use shared components from components folder</li>
              <li style={{ color: 'var(--color-ink)' }}>◇ Use shared styles from styles folder</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
} 