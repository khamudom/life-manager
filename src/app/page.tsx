"use client";

import { useAuth } from "../context/authContext";

const Home = () => {
  const { user, loading } = useAuth();

  // Handle loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <main>
        <h1>
          {user
            ? `Welcome, ${user.email} to Life Manager`
            : "Welcome to Life Manager!"}
        </h1>
        <p>Organize your tasks, events, and more!</p>
      </main>
    </div>
  );
};

export default Home;
