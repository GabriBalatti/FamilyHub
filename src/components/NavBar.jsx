import { NavLink } from 'react-router-dom';

export default function NavBar() {
  return (
    <nav className="navbar">
      <NavLink to="/faccende" className={({ isActive }) => isActive ? 'attivo' : ''}>
        🧹<span>Faccende</span>
      </NavLink>
      <NavLink to="/spesa" className={({ isActive }) => isActive ? 'attivo' : ''}>
        🛒<span>Spesa</span>
      </NavLink>
      <NavLink to="/calendario" className={({ isActive }) => isActive ? 'attivo' : ''}>
        📅<span>Calendario</span>
      </NavLink>
      <NavLink to="/profilo" className={({ isActive }) => isActive ? 'attivo' : ''}>
        👤<span>Profilo</span>
      </NavLink>
    </nav>
  );
}
