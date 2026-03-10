import Link from "next/link";
import styles from "./top-friends.module.css";

const TOP_FRIENDS = [
  { rank: 1, name: "Lady Gaga", subline: "Just dance" },
  { rank: 2, name: "Taylor Swift", subline: "In my feelings" },
  { rank: 3, name: "Beyoncé", subline: "Formation" },
  { rank: 4, name: "Rihanna", subline: "Diamonds" },
  { rank: 5, name: "Adele", subline: "Hello" },
  { rank: 6, name: "Bruno Mars", subline: "Uptown funk" },
  { rank: 7, name: "Dua Lipa", subline: "Levitating" },
  { rank: 8, name: "The Weeknd", subline: "Blinding lights" },
];

export default function TopFriendsPage() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.sunsetStripe} aria-hidden />
        <Link href="/" className={styles.backLink}>
          ← Back to home
        </Link>

        <div className={styles.panel}>
        <div className={styles.panelHeader}>Top 8 Friends</div>
        <div className={styles.panelBody}>
          <ul className={styles.friendsGrid}>
            {TOP_FRIENDS.map((friend) => (
              <li key={friend.rank} className={styles.friendSlot}>
                <span className={styles.rank}>{friend.rank}</span>
                <div className={styles.avatar}>★</div>
                <div className={styles.name}>{friend.name}</div>
                <div className={styles.subline}>{friend.subline}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
    </div>
  );
}
