"use client";

import Link from "next/link";
import styles from "./Dashboard.module.css";

const Dashboard = () => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Manage</h1>
        <p className={styles.subtitle}>Organize workflow.</p>
        <div className={styles.profilePic}>
          <img
            src="https://via.placeholder.com/50"
            alt="User Profile"
            className={styles.profileImage}
          />
        </div>
      </header>
      <div className={styles.categories}>
        <Link href="/tasks" className={styles.category}>
          <span className={styles.icon}>💡</span>
          <span className={styles.label}>Tasks</span>
        </Link>
        <Link href="/calendar" className={styles.category}>
          <span className={styles.icon}>📅</span>
          <span className={styles.label}>Daily Task</span>
        </Link>
        <Link href="/scheduled" className={styles.category}>
          <span className={styles.icon}>📊</span>
          <span className={styles.label}>Scheduled Tasks</span>
        </Link>
        <Link href="/other" className={styles.category}>
          <span className={styles.icon}>🤝</span>
          <span className={styles.label}>Other</span>
        </Link>
        <div className={styles.addCategory}>
          <span className={styles.icon}>+</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
