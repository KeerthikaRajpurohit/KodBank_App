import './Layout.css';

export default function Layout({ children }) {
  return (
    <div className="layout">
      <header className="kod-header">
        <h1 className="kod-logo">KodBank</h1>
      </header>
      <main className="kod-main">{children}</main>
    </div>
  );
}
