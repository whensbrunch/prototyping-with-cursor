"use client";

import { useState } from 'react';
import styles from './styles.module.css';
import Link from 'next/link';
import confetti from 'canvas-confetti';

export default function ConfettiButtonPrototype() {
  const [isAnimating, setIsAnimating] = useState(false);

  const triggerConfetti = () => {
    setIsAnimating(true);
    
    confetti({
      particleCount: 100,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#05d9e8', '#ff2a6d', '#d300c5', '#ffb627', '#ff7b9c'],
      shapes: ['square'],
    });

    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <div className={styles.container}>
      <div className={styles.buttonContainer}>
        <Link href="/" className={styles.backButton}>← Back</Link>
      </div>
      
      <div className={styles.window}>
        <div className={styles.windowTitle}>
          Confetti button
        </div>
        <div className={styles.windowContent}>
          <h1 className={styles.title}>Congratulations! You have set up your first repository.</h1>
          <button 
            className={`${styles.confettiButton} ${isAnimating ? styles.animate : ""}`}
            onClick={triggerConfetti}
          >
            Celebrate
          </button>
        </div>
      </div>
    </div>
  );
} 