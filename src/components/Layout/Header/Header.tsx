"use client";

// import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/authContext";
import { supabase } from "../../../lib/supabaseClient";
import styles from "./Header.module.css";
import { ThemeToggle } from "@/components/UI/ThemeToggle/ThemeToggle";
import Link from "next/link";

const Header = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Logout handler
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error logging out:", error.message);
      return;
    }

    router.push("/"); // Redirect to home page after logout
  };

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logo}>
        <h2>Life Manager</h2>
      </Link>
      <div className={styles.actions}>
        <nav>
          {/* <Link href="/" className={styles.navLink}>
            Home
          </Link> */}
          {/* <Link href="/tasks" className={styles.navLink}>
            Tasks
          </Link> */}
          {/* {!loading && !user && (
            <Link href="/auth/login" className={styles.navLink}>
              LogIn
            </Link>
          )} */}
          {!loading && user && (
            <button onClick={handleLogout} className={styles.navLink}>
              LogOut
            </button>
          )}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;
