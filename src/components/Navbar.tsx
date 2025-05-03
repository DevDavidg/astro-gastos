import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCurrency } from "../hooks/useCurrency";
import { motion, AnimatePresence } from "framer-motion";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { currency, setCurrency } = useCurrency();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
        setActiveDropdown(null);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && !(event.target as HTMLElement).closest(".navbar-content")) {
        setIsOpen(false);
      }
      if (
        activeDropdown &&
        !(event.target as HTMLElement).closest(".dropdown-content")
      ) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, activeDropdown]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 navbar-content">
          <motion.div
            className="flex-shrink-0 flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/" className="flex items-center space-x-2">
              <motion.span
                className="text-2xl font-bold text-indigo-600"
                animate={{ rotate: isScrolled ? 0 : 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              >
                💰
              </motion.span>
              <span className="hidden sm:block text-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Astro Gastos
              </span>
            </Link>
          </motion.div>

          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`relative px-3 py-2 text-sm font-medium transition-all duration-300 ${
                isActive("/")
                  ? "text-indigo-600"
                  : "text-gray-700 hover:text-indigo-600"
              }`}
            >
              Inicio
              {isActive("/") && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                  layoutId="activeIndicator"
                />
              )}
            </Link>
            <Link
              to="/gastos"
              className={`relative px-3 py-2 text-sm font-medium transition-all duration-300 ${
                isActive("/gastos")
                  ? "text-indigo-600"
                  : "text-gray-700 hover:text-indigo-600"
              }`}
            >
              Gastos
              {isActive("/gastos") && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                  layoutId="activeIndicator"
                />
              )}
            </Link>
            <Link
              to="/estadisticas"
              className={`relative px-3 py-2 text-sm font-medium transition-all duration-300 ${
                isActive("/estadisticas")
                  ? "text-indigo-600"
                  : "text-gray-700 hover:text-indigo-600"
              }`}
            >
              Estadísticas
              {isActive("/estadisticas") && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                  layoutId="activeIndicator"
                />
              )}
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="hidden sm:block px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-white/80 backdrop-blur-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 hover:bg-white hover:shadow-md"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="ARS">ARS</option>
              </select>
            </motion.div>

            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-expanded="false"
            >
              <span className="sr-only">Abrir menú principal</span>
              <AnimatePresence mode="wait">
                {!isOpen ? (
                  <motion.svg
                    key="menu"
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </motion.svg>
                ) : (
                  <motion.svg
                    key="close"
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    initial={{ opacity: 0, rotate: 90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: -90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </motion.svg>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="md:hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white/95 backdrop-blur-md shadow-lg rounded-lg mx-4 my-2">
              <Link
                to="/"
                className={`block px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 ${
                  isActive("/")
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                }`}
                onClick={() => setIsOpen(false)}
              >
                Inicio
              </Link>
              <Link
                to="/gastos"
                className={`block px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 ${
                  isActive("/gastos")
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                }`}
                onClick={() => setIsOpen(false)}
              >
                Gastos
              </Link>
              <Link
                to="/estadisticas"
                className={`block px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 ${
                  isActive("/estadisticas")
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                }`}
                onClick={() => setIsOpen(false)}
              >
                Estadísticas
              </Link>
              <div className="px-4 py-3">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg text-base font-medium text-gray-700 bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="ARS">ARS</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
