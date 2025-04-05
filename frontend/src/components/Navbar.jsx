import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [scrollDirection, setScrollDirection] = useState('up');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Workouts', path: '/workouts' },
    { name: 'Meals', path: '/meals' },
    { name: 'Membership', path: '/membership' },
    { name: 'Community', path: '/community' },
  ];

  useEffect(() => {
    let lastScrollY = window.pageYOffset;

    const updateScrollDirection = () => {
      const scrollY = window.pageYOffset;
      const direction = scrollY > lastScrollY ? 'down' : 'up';
      if (direction !== scrollDirection && (scrollY - lastScrollY > 10 || scrollY - lastScrollY < -10)) {
        setScrollDirection(direction);
      }
      lastScrollY = scrollY > 0 ? scrollY : 0;
    };

    window.addEventListener('scroll', updateScrollDirection);
    return () => {
      window.removeEventListener('scroll', updateScrollDirection);
    };
  }, [scrollDirection]);

  const navbarClass = scrollDirection === 'down' ? 'transform -translate-y-full' : 'transform translate-y-0';

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed w-full z-10 bg-gradient-to-r from-[var(--color-dark)] to-[var(--color-dark-alt)] border-b border-[var(--color-primary-light)] border-opacity-20 backdrop-blur-sm transition-transform duration-300 ${navbarClass}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center mr-2">
                <span className="text-white font-bold">DB</span>
              </div>
              <span className="text-xl font-semibold text-[var(--color-light)] tracking-wide">DietBuddy</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {navItems.map(item => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="px-3 py-2 text-sm font-medium text-[var(--color-light)] hover:text-[var(--color-primary-light)] transition-colors duration-200"
                >
                  {item.name}
                </Link>
              ))}
              
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link 
                    to="/dashboard" 
                    className="px-3 py-2 text-sm font-medium text-[var(--color-light)] hover:text-[var(--color-primary-light)]"
                  >
                    Dashboard
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="btn-secondary"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link 
                    to="/login" 
                    className="px-3 py-2 text-sm font-medium text-[var(--color-light)] hover:text-[var(--color-primary-light)]"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register"
                    className="btn-primary"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          {/* Mobile Navigation Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-[var(--color-light)] hover:text-[var(--color-primary-light)] focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[var(--color-dark-alt)]"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map(item => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="block px-3 py-2 rounded-md text-base font-medium text-[var(--color-light)] hover:text-[var(--color-primary-light)]"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {user ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="block px-3 py-2 rounded-md text-base font-medium text-[var(--color-light)] hover:text-[var(--color-primary-light)]"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-[var(--color-secondary)] hover:text-[var(--color-secondary-dark)]"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="block px-3 py-2 rounded-md text-base font-medium text-[var(--color-light)] hover:text-[var(--color-primary-light)]"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register"
                    className="block px-3 py-2 rounded-md text-base font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-light)]"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar; 