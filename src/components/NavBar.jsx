import { NavLink } from 'react-router-dom';
import { CalendarDays, Home, ListTodo, ShoppingCart, UserRound } from 'lucide-react';

export default function NavBar() {
  return (
    <nav className="navbar">
      <NavLink to="/faccende" className={({ isActive }) => isActive ? 'attivo' : ''}>
        <ListTodo size={22} />
        <span>Faccende</span>
      </NavLink>
      <NavLink to="/spesa" className={({ isActive }) => isActive ? 'attivo' : ''}>
        <ShoppingCart size={22} />
        <span>Spesa</span>
      </NavLink>
      <NavLink to="/home" className={({ isActive }) => isActive ? 'voce-home attivo' : 'voce-home'}>
        <span className="cerchio-home">
          <Home size={22} color="white" />
        </span>
        <span>Home</span>
      </NavLink>
      <NavLink to="/calendario" className={({ isActive }) => isActive ? 'attivo' : ''}>
        <CalendarDays size={22} />
        <span>Calendario</span>
      </NavLink>
      <NavLink to="/profilo" className={({ isActive }) => isActive ? 'attivo' : ''}>
        <UserRound size={22} />
        <span>Profilo</span>
      </NavLink>
    </nav>
  );
}
