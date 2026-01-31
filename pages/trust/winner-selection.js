import Link from "next/link";

export default function WinnerSelectionTrustPage() {
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>How the BearTask Experience Works</h1>

        <p style={styles.intro}>
          BearTask is built as a fun, community-first campus experience.
          It’s not about pressure, promises, or speculation — it’s about
          shared moments, creativity, and fairness.
        </p>

        <section style={styles.section}>
          <h2 style={styles.heading}>🎨 What Happens When You Join?</h2>
          <ul style={styles.list}>
            <li>You explore a limited digital collection made for students</li>
            <li>You receive a unique digital item (NFT)</li>
            <li>You unlock a fun, optional BearTask</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>🎯 What Is a BearTask?</h2>
          <p>
            A BearTask is a light-hearted challenge or prompt designed
            to be fun, social, and campus-friendly.
          </p>
          <p>
            It’s never mandatory — it’s there to spark laughs, creativity,
            or community interaction if you feel like participating.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>🎟️ The Student Lottery (Optional Bonus)</h2>
          <p>
            Some collections include a student lottery as a bonus feature.
          </p>
          <ul style={styles.list}>
            <li>Only verified students are eligible</li>
            <li>Each student gets <strong>one equal chance</strong></li>
            <li>Buying more does not increase odds</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>⚙️ How Is the Winner Selected?</h2>
          <p>
            If a lottery applies, the winner is selected automatically
            when the collection sells out.
          </p>
          <ul style={styles.list}>
            <li>No admin involvement</li>
            <li>No creator influence</li>
            <li>No ambassador control</li>
          </ul>
          <p>
            The system uses a secure, system-generated random process
            and records the result permanently.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>🤝 Community First</h2>
          <p>
            BearTask is designed to be enjoyed together.
          </p>
          <p>
            Many people choose to share their BearTasks in the community,
            but participation is always optional and pressure-free.
          </p>
        </section>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Fun over hype. Community over pressure. Fairness by design.
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
