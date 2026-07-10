import { NavLink } from 'react-router-dom';
import IconFaccende from '../assets/icons/faccende.svg?react';
import IconSpesa from '../assets/icons/spesa.svg?react';
import IconCalendario from '../assets/icons/calendario.svg?react';
import IconProfilo from '../assets/icons/profilo.svg?react';

export default function NavBar() {
  return (
    <nav className="navbar">
      <NavLink to="/faccende" className={({ isActive }) => isActive ? 'attivo' : ''}>
        <IconFaccende width={22} height={22} />
        <span>Faccende</span>
      </NavLink>
      <NavLink to="/spesa" className={({ isActive }) => isActive ? 'attivo' : ''}>
        <IconSpesa width={22} height={22} />
        <span>Spesa</span>
      </NavLink>
      <NavLink to="/calendario" className={({ isActive }) => isActive ? 'attivo' : ''}>
        <IconCalendario width={22} height={22} />
        <span>Calendario</span>
      </NavLink>
      <NavLink to="/profilo" className={({ isActive }) => isActive ? 'attivo' : ''}>
        <IconProfilo width={22} height={22} />
        <span>Profilo</span>
      </NavLink>
    </nav>
  );
}