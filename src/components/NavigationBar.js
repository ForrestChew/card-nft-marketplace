import { NavLink } from 'react-router-dom';
import '../styles/navigation-bar.css';

const NavigationBar = () => {
  return (
    <>
      <nav className="navbar-items-container">
        <NavLink
          className={(navData) =>
            navData.isActive ? 'list-item-active' : 'list-item'
          }
          to="/"
          end
        >
          About
        </NavLink>
        <NavLink
          className={(navData) =>
            navData.isActive ? 'list-item-active' : 'list-item'
          }
          to="/marketplace"
        >
          Marketplace
        </NavLink>
        <NavLink
          className={(navData) =>
            navData.isActive ? 'list-item-active' : 'list-item'
          }
          to="/list-pack"
        >
          List Pack
        </NavLink>
        <NavLink
          className={(navData) =>
            navData.isActive ? 'list-item-active' : 'list-item'
          }
          to="/leader-board"
        >
          Leaderboard
        </NavLink>
        <NavLink
          className={(navData) =>
            navData.isActive ? 'list-item-active' : 'list-item'
          }
          to="/profile"
        >
          Profile
        </NavLink>
      </nav>
    </>
  );
};

export default NavigationBar;
