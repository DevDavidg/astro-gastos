import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NavBar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState("/");
  const [showNavbar, setShowNavbar] = useState(true);
  const basePath = import.meta.env.BASE_URL || "";

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = Math.max(
        window.pageYOffset,
        document.documentElement.scrollTop,
        document.body.scrollTop
      );
      setIsScrolled(scrollPosition > 20);
    };

    // Set initial path and check if we're on an auth page
    const path = window.location.pathname;
    setCurrentPath(path);

    // Check if we're on an auth page
    const isAuthPage =
      path.includes("/auth") ||
      path.includes("/login") ||
      path.includes("/register");
    setShowNavbar(!isAuthPage);

    // Add multiple scroll listeners
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("wheel", handleScroll, { passive: true });

    // Check initial scroll position
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("wheel", handleScroll);
    };
  }, []);

  const isActive = (path: string) => currentPath === path;

  // Función para construir la URL correctamente
  const buildUrl = (path: string) => {
    const base = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${base}${cleanPath}`;
  };

  // Si no debemos mostrar el navbar, retornamos null
  if (!showNavbar) {
    return null;
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center"
          >
            <a href={buildUrl("/")} className="flex items-center space-x-2">
              <motion.span
                className="text-3xl"
                animate={{
                  rotate: isScrolled ? 0 : [0, 5, -5, 0],
                  scale: isScrolled ? 1 : [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
              >
                💰
              </motion.span>
              <span className="hidden sm:block text-2xl font-bold text-gray-800">
                Astro Gastos
              </span>
            </a>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href={buildUrl("/")}
              className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 ${
                isActive("/")
                  ? "text-gray-900"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Inicio
              {isActive("/") && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"
                  layoutId="activeIndicator"
                />
              )}
            </a>
            <a
              href={buildUrl("/resumen")}
              className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 ${
                isActive("/resumen")
                  ? "text-gray-900"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Resumen
              {isActive("/resumen") && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"
                  layoutId="activeIndicator"
                />
              )}
            </a>
            <a
              href={buildUrl("/configuracion")}
              className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 ${
                isActive("/configuracion")
                  ? "text-gray-900"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Configuración
              {isActive("/configuracion") && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"
                  layoutId="activeIndicator"
                />
              )}
            </a>
            <a
              href={buildUrl("/profile")}
              className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 ${
                isActive("/profile")
                  ? "text-gray-900"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Mi Perfil
              {isActive("/profile") && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"
                  layoutId="activeIndicator"
                />
              )}
            </a>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 focus:ring-offset-transparent"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <span className="sr-only">Abrir menú principal</span>
            <AnimatePresence mode="wait">
              {!isMenuOpen ? (
                <motion.svg
                  key="menu"
                  className="h-6 w-6"
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
                  className="h-6 w-6"
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

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="md:hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white shadow-lg rounded-lg mx-4 my-2">
              <a
                href={buildUrl("/")}
                className={`block px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 ${
                  isActive("/")
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Inicio
              </a>
              <a
                href={buildUrl("/resumen")}
                className={`block px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 ${
                  isActive("/resumen")
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Resumen
              </a>
              <a
                href={buildUrl("/configuracion")}
                className={`block px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 ${
                  isActive("/configuracion")
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Configuración
              </a>
              <a
                href={buildUrl("/profile")}
                className={`block px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 ${
                  isActive("/profile")
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Mi Perfil
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default NavBar;
