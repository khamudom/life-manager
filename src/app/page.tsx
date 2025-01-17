"use client";

import { useAuth } from "../context/authContext";
import Login from "../components/UI/Login/Login";
import Dashboard from "../components/Layout/Dashboard/Dashboard";
import styles from "./page.module.css";

const Home = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.container}>{user ? <Dashboard /> : <Login />}</div>
  );
};

export default Home;
