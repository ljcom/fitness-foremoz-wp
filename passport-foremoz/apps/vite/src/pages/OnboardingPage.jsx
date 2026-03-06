import { Link } from 'react-router-dom';

const features = [
  'Set goal utama: weight, strength, atau mobility.',
  'Tentukan preferensi privasi metrik personal sejak awal.',
  'Pilih coach/studio pertama untuk mulai journey.'
];

export default function OnboardingPage() {
  return (
    <main className="page auth-shell">
      <section className="card auth-card">
        <p className="eyebrow">Onboarding</p>
        <h1>Setup Your Fitness Passport</h1>
        <p className="sub">Lengkapi setup awal agar rekomendasi program lebih relevan.</p>

        <form className="form" onSubmit={(e) => e.preventDefault()}>
          <label>
            Primary Goal
            <select defaultValue="strength">
              <option value="strength">Build Strength</option>
              <option value="fat-loss">Fat Loss</option>
              <option value="mobility">Mobility</option>
            </select>
          </label>
          <label>
            Preferred Training Days
            <input type="text" placeholder="Mon, Wed, Fri" />
          </label>
          <label>
            Privacy Preset
            <select defaultValue="balanced">
              <option value="balanced">Balanced</option>
              <option value="strict">Strict</option>
              <option value="open">Open</option>
            </select>
          </label>
          <button className="btn primary" type="submit">Save Onboarding</button>
        </form>

        <article className="hint">
          <p className="eyebrow">Informasi</p>
          <p>
            Setup ini bisa diubah kapan saja di dashboard. Kamu tetap memegang kontrol penuh
            atas data yang dibagikan.
          </p>
        </article>

        <article className="card soft-card">
          <p className="eyebrow">Fitur</p>
          <ul className="feature-list compact">
            {features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </article>

        <article className="card cta-banner">
          <div>
            <p className="eyebrow">CTA</p>
            <h2>Siap Lihat Ringkasan Akun?</h2>
            <p className="sub">Lanjutkan ke dashboard untuk monitor subscription dan progres.</p>
          </div>
          <div className="hero-actions">
            <Link className="btn primary" to="/dashboard">Ke Dashboard</Link>
            <Link className="btn ghost" to="/signin">Masuk Ulang</Link>
          </div>
        </article>
      </section>
    </main>
  );
}
