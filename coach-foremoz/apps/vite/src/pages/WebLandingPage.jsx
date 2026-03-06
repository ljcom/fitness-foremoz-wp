import { Link } from 'react-router-dom';
import { APP_ORIGIN } from '../lib.js';

export default function WebLandingPage() {
  const infoItems = [
    {
      title: 'Microsite Siap Share',
      description:
        'Satu link untuk bio Instagram, WhatsApp broadcast, dan TikTok profile tanpa setup teknis rumit.'
    },
    {
      title: 'Konversi ke Membership',
      description:
        'Pengunjung bisa langsung pilih offer, subscribe, lalu lanjut ke flow booking kelas berdasarkan lokasi.'
    }
  ];

  const features = [
    'Custom coach handle untuk branding pribadi.',
    'Offer catalog untuk paket membership dan kelas.',
    'Tracking performa share, klik, subscribe, dan booking.',
    'Operasional kelas per lokasi dari satu dashboard.'
  ];

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">coach.foremoz.com</p>
        <h1>Coach Microsite for Growth and Conversion</h1>
        <p>
          Build your coach page, share to WhatsApp/Instagram/TikTok, convert direct to
          subscribe, then operate classes by location.
        </p>
        <div className="actions">
          <Link className="btn primary" to="/signup">Create Coach Account</Link>
          <Link className="btn ghost" to="/signin">Sign In</Link>
        </div>
        <p className="origin">origin: {APP_ORIGIN}</p>
      </section>

      <section className="grid two-col">
        {infoItems.map((item) => (
          <article className="card" key={item.title}>
            <p className="eyebrow">Informasi</p>
            <h2>{item.title}</h2>
            <p className="sub">{item.description}</p>
          </article>
        ))}
      </section>

      <section className="card">
        <p className="eyebrow">Fitur</p>
        <h2>Yang Bisa Kamu Jalankan di Coach Web</h2>
        <ul className="feature-list">
          {features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      </section>

      <section className="card cta-strip">
        <div>
          <p className="eyebrow">CTA</p>
          <h2>Mulai Bangun Microsite Coach Kamu Hari Ini</h2>
          <p className="sub">
            Buat akun gratis, set coach handle, publish offer, lalu share link untuk mulai konversi.
          </p>
        </div>
        <div className="actions">
          <Link className="btn primary" to="/signup">Mulai Gratis</Link>
          <Link className="btn ghost" to="/signin">Lanjutkan Login</Link>
        </div>
      </section>
    </main>
  );
}
