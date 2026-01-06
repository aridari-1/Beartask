import Link from "next/link";

export default function WinnerSelectionTrustPage() {
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>How the Winner Is Selected</h1>

        <p style={styles.intro}>
          At BearTask, fairness and transparency are essential. Every collection
          follows a strict, automated lottery process designed to protect
          students and supporters alike.
        </p>

        <section style={styles.section}>
          <h2 style={styles.heading}>🎓 Who Can Win?</h2>
          <ul style={styles.list}>
            <li>Only verified students are eligible</li>
            <li>Student status is confirmed by a <strong>.edu email</strong></li>
            <li>The purchase must be successfully completed</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>🎟️ One Student, One Chance</h2>
          <p>
            Each eligible student receives <strong>only one lottery entry</strong>,
            regardless of how many times they support a collection.
          </p>
          <p>
            This prevents unfair advantages and keeps the lottery balanced.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>⚙️ When Does the Draw Happen?</h2>
          <p>
            The draw happens <strong>automatically</strong> the moment a collection
            sells out.
          </p>
          <ul style={styles.list}>
            <li>The collection is locked</li>
            <li>No new entries are allowed</li>
            <li>The system immediately selects a winner</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>🔐 How Is the Winner Chosen?</h2>
          <p>
            The winner is selected using a <strong>system-generated random seed</strong>.
          </p>
          <ul style={styles.list}>
            <li>No admin involvement</li>
            <li>No creator influence</li>
            <li>No ambassador control</li>
          </ul>
          <p>
            The result is final, stored securely, and cannot be changed.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>📊 Transparency & Auditing</h2>
          <p>
            Every draw is logged in the system with timestamps and references.
          </p>
          <p>
            Payouts are calculated automatically based on predefined percentages.
          </p>
        </section>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            No favoritism. No hidden rules. Just a fair system built to support students.
          </p>

          <Link href="/collections" style={styles.backLink}>
            ← Back to collections
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #0b0f1a, #111827)",
    color: "#e5e7eb",
    padding: "40px 16px",
  },
  container: {
    maxWidth: "900px",
    margin: "0 auto",
  },
  title: {
    fontSize: "2.2rem",
    fontWeight: "700",
    marginBottom: "16px",
  },
  intro: {
    fontSize: "1.1rem",
    color: "#d1d5db",
    marginBottom: "32px",
  },
  section: {
    background: "#0f172a",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "20px",
    border: "1px solid #1f2937",
  },
  heading: {
    fontSize: "1.25rem",
    marginBottom: "12px",
  },
  list: {
    paddingLeft: "18px",
    lineHeight: "1.7",
  },
  footer: {
    marginTop: "40px",
    textAlign: "center",
  },
  footerText: {
    marginBottom: "16px",
    fontWeight: "500",
  },
  backLink: {
    color: "#60a5fa",
    textDecoration: "none",
    fontWeight: "500",
  },
};
