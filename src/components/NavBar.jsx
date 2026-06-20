import { NavLink } from 'react-router-dom';
import { Brush, ShoppingCart, Calendar, User } from 'lucide-react';

export default function NavBar() {
  return (
    <nav className="navbar">
      <NavLink to="/faccende" className={({ isActive }) => isActive ? 'attivo' : ''}>
        <Brush size={22} />
        <span>Faccende</span>
      </NavLink>
      <NavLink to="/spesa" className={({ isActive }) => isActive ? 'attivo' : ''}>
        <ShoppingCart size={22} />
        <span>Spesa</span>
      </NavLink>
      <NavLink to="/calendario" className={({ isActive }) => isActive ? 'attivo' : ''}>
        <Calendar size={22} />
        <span>Calendario</span>
      </NavLink>
      <NavLink to="/profilo" className={({ isActive }) => isActive ? 'attivo' : ''}>
        <User size={22} />
        <span>Profilo</span>
      </NavLink>
    </nav>
  );
}