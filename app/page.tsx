import Link from "next/link";
import styles from './styles/home.module.css';

export default function Home() {
  // Add your prototypes to this array
  const prototypes = [
    {
      title: 'Getting started',
      description: 'How to create a prototype',
      path: '/prototypes/example'
    },
    {
      title: 'Confetti button',
      description: 'An interactive button that creates a colorful confetti explosion',
      path: '/prototypes/confetti-button'
    },
    {
      title: 'Top friends',
      description: 'A Myspace-style list of your top friends',
      path: '/top-friends'
    },
    // Add your new prototypes here like this:
    // {
    //   title: 'Your new prototype',
    //   description: 'A short description of what this prototype does',
    //   path: '/prototypes/my-new-prototype'
    // },
  ];

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.sunsetStripe} aria-hidden />
        <header className={styles.header}>
          <h1>David's prototypes</h1>
        </header>

        <main>
          <section className={styles.grid}>
            {/* Goes through the prototypes list (array) to create cards */}
            {prototypes.map((prototype, index) => (
              <Link 
                key={index}
                href={prototype.path} 
                className={styles.card}
              >
                <h3>{prototype.title}</h3>
                <p>{prototype.description}</p>
              </Link>
            ))}
          </section>
        </main>
      </div>

      {/* Charmander runs across the bottom with Hog Rider chasing */}
      <div className={styles.runnerStrip} aria-hidden>
        <div className={styles.runnerTrack}>
          <img
            src="/hog-rider.png"
            alt=""
            className={styles.runnerImage}
          />
          <span className={styles.runnerGap} />
          <img
            src="/charmander.png"
            alt=""
            className={styles.runnerImage}
          />
        </div>
      </div>
    </div>
  );
}
