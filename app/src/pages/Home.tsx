```tsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

export default function Home() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function checkSession() {
      const { data, error } = await supabase.auth.getSession();

      if (!active) return;

      if (error || !data.session) {
        navigate("/login", { replace: true });
        return;
      }

      setEmail(data.session.user.email ?? "");
      setLoading(false);
    }

    void checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;

      if (!session) {
        navigate("/login", { replace: true });
      } else {
        setEmail(session.user.email ?? "");
        setLoading(false);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(error.message);
      return;
    }

    navigate("/login", { replace: true });
  }

  if (loading) {
    return (
      <main className="home-loading">
        <div className="loading-logo">Student<span>X</span></div>
        <p>Loading your student community...</p>
      </main>
    );
  }

  return (
    <main className="student-home">
      <header className="home-header">
        <Link to="/home" className="brand">
          Student<span>X</span>
        </Link>

        <button className="logout-button" onClick={handleLogout}>
          Log out
        </button>
      </header>

      <section className="home-welcome">
        <p className="auth-eyebrow">YOUR STUDENT COMMUNITY</p>
        <h1>Welcome to StudentX</h1>
        <p>
          Connect, learn and share. Your student journey starts here.
        </p>
        <div className="home-user">
          <span className="user-avatar">
            {email ? email.charAt(0).toUpperCase() : "S"}
          </span>
          <div>
            <strong>You are logged in</strong>
            <p>{email}</p>
          </div>
        </div>
      </section>

      <section className="home-feature-grid">
        <article className="home-feature">
          <span className="feature-symbol">01</span>
          <h2>Home Feed</h2>
          <p>Discover posts and updates from your student community.</p>
          <span className="feature-status">Feed integration next</span>
        </article>

        <article className="home-feature">
          <span className="feature-symbol">02</span>
          <h2>Explore</h2>
          <p>Find students, schools, communities and learning resources.</p>
          <span className="feature-status">Coming next</span>
        </article>

        <article className="home-feature">
          <span className="feature-symbol">03</span>
          <h2>Chat</h2>
          <p>Connect with friends and your student community.</p>
          <span className="feature-status">Coming next</span>
        </article>

        <article className="home-feature">
          <span className="feature-symbol">04</span>
          <h2>StudyHub</h2>
          <p>Access study materials and educational resources.</p>
          <span className="feature-status">Coming next</span>
        </article>
      </section>

      <footer className="home-footer">
        StudentX · Connect, Learn, Share.
      </footer>
    </main>
  );
}
```
