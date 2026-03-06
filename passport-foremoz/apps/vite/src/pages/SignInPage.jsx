import { Link } from 'react-router-dom';

const features = [
  'Akses cepat ke seluruh langganan aktif kamu.',
  'Lanjut monitoring progres dan metrik personal.',
  'Review consent data sharing untuk tiap coach.'
];

export default function SignInPage() {
  return (
    <main className="page auth-shell">
      <section className="card auth-card">
        <p className="eyebrow">Signin</p>
        <h1>Welcome Back to Passport</h1>
        <p className="sub">Masuk untuk lanjutkan program dan kontrol data kamu.</p>

        <form className="form" onSubmit={(e) => e.preventDefault()}>
          <label>
            Email
            <input type="email" placeholder="name@mail.com" />
          </label>
          <label>
            Password
            <input type="password" placeholder="••••••••" />
          </label>
          <button className="btn primary" type="submit">Sign In</button>
        </form>

        <article className="hint">
          <p className="eyebrow">Informasi</p>
          <p>
            Passport menyatukan identitas member lintas coach dan studio, jadi kamu tidak perlu
            login akun berbeda untuk setiap program.
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
            <h2>Baru Pertama Kali?</h2>
            <p className="sub">Buat akun passport dulu untuk mulai join program.</p>
          </div>
          <div className="hero-actions">
            <Link className="btn primary" to="/signup">Buat Akun</Link>
            <Link className="btn ghost" to="/onboarding">Lihat Onboarding</Link>
          </div>
        </article>
      </section>
    </main>
  );
}
