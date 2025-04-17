import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Logo from "./Logo";
import { Menu, X, User, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAdmin, isHospital } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleLogoClick = (e) => {
    if (user) {
      // If user is logged in, prevent navigation
      e.preventDefault();
      // Do nothing, as requested
    } else {
      // If not logged in, refresh the page
      e.preventDefault();
      window.location.reload();
    }
  };

  return (
    <nav className="bg-softPink py-4 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-8">
          {user ? (
            // If logged in, prevent navigation when clicking the logo
            <a href="#" onClick={handleLogoClick}>
              <Logo />
            </a>
          ) : (
            // If not logged in, allow refresh on click
            <a href="/" onClick={handleLogoClick}>
              <Logo />
            </a>
          )}

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6">
            {!user && (
              <Link to="/" className="nav-link">
                Home
              </Link>
            )}

            {user ? (
              <>
                <Link to="/dashboard" className="nav-link">
                  Dashboard
                </Link>
                {isAdmin() && (
                  <>
                    <Link to="/donors" className="nav-link">
                      Donors
                    </Link>
                    <Link to="/inventory" className="nav-link">
                      Inventory
                    </Link>
                  </>
                )}
              </>
            ) : (
              <>{/* Navigation links for non-logged in users */}</>
            )}
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <>
              <div className="text-darkGray flex items-center">
                <User className="h-4 w-4 mr-2" />
                <span>{user.name}</span>
              </div>
              <Button
                onClick={handleLogout}
                className="action-btn-primary flex items-center"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Log Out
              </Button>
            </>
          ) : (
            <>
              <Button asChild className="action-btn-secondary">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild className="action-btn-primary">
                <Link to="/register">Register</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={toggleMenu}>
          {isMenuOpen ? (
            <X className="h-6 w-6 text-darkGray" />
          ) : (
            <Menu className="h-6 w-6 text-darkGray" />
          )}
        </button>
      </div>
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 px-6 pb-4">
          <div className="flex flex-col space-y-3">
            {!user && (
              <Link
                to="/"
                className="nav-link py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
            )}

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="nav-link py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                {isAdmin() && (
                  <>
                    <Link
                      to="/donors"
                      className="nav-link py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Donors
                    </Link>
                    <Link
                      to="/inventory"
                      className="nav-link py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Inventory
                    </Link>
                  </>
                )}
                <div className="flex items-center text-darkGray py-2">
                  <User className="h-4 w-4 mr-2" />
                  <span>{user.name}</span>
                </div>
                <Button
                  onClick={handleLogout}
                  className="action-btn-primary mt-2"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Log Out
                </Button>
              </>
            ) : (
              <>
                {/* Mobile navigation links for non-logged in users */}
                <Link
                  to="/login"
                  className="nav-link py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="nav-link py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
