"use client";

import "../styles/_app.scss";

export default function Home() {
  return (
    <section className="landing-page">
      <div className="landing-page__container">
        <div className="welcome-message">
          <h2>Welcome to <span className="brand-text">TestAI</span></h2>
          <p>
            Upload a PRD document and I'll help you generate comprehensive
            test cases.
          </p>
        </div>
      </div>
    </section>
  );
}
