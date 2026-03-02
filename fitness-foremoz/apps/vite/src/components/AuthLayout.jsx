import { Link } from 'react-router-dom';

export default function AuthLayout({ title, subtitle, alternateHref, alternateText, children }) {
  return (
    <main className="auth-shell">
      <section className="auth-left">
        <p className="eyebrow">Foremoz Fitness</p>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        <Link className="link-inline" to={alternateHref}>
          {alternateText}
        </Link>
      </section>
      <section className="auth-right">{children}</section>
    </main>
  );
}
