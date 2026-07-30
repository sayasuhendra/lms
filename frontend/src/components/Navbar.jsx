import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppSettings } from '../context/AppSettingsContext';
import { useTranslation } from 'react-i18next';
import { Input } from './ui/input';
import { Button } from './ui/button';
import LanguageSwitcher from './LanguageSwitcher';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Search, BookOpen, Menu, X, User, LogOut, LayoutDashboard, Shield } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { settings } = useAppSettings();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* First Level - Logo, Search, Auth */}
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group flex-shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 text-white">
              <BookOpen className="h-6 w-6" aria-hidden="true" />
            </div>
            <span className="text-base font-bold text-black whitespace-nowrap">
              {settings.organization_name} LMS
            </span>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="w-full relative">
              <Input
                type="text"
                placeholder={t('nav.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 w-full border-gray-300"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </form>
          </div>

          {/* Right Side - Language & Auth */}
          <div className="hidden md:flex items-center space-x-2 flex-shrink-0">
            <LanguageSwitcher />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-2 focus:outline-none">
                    <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-transparent hover:ring-gray-300 transition-all">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    {t('nav.profile')}
                  </DropdownMenuItem>
                  {user.role === 'instructor' && (
                    <DropdownMenuItem onClick={() => navigate('/instructor')}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      {t('nav.instructorDashboard')}
                    </DropdownMenuItem>
                  )}
                  {user.role === 'admin' && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('nav.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/login')} className="text-gray-700 hover:text-orange-600 hover:bg-orange-50">
                  {t('nav.login')}
                </Button>
                <Button onClick={() => navigate('/register')} className="bg-orange-600 hover:bg-orange-700 text-white hover:text-white">
                  {t('nav.register')}
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Second Level - Navigation Menu */}
        <div className="hidden md:flex justify-end items-center h-10 border-t border-gray-100">
          <div className="flex items-center space-x-6">
            <Link to="/courses" className="text-gray-700 hover:text-orange-600 transition-colors font-medium text-sm">
              {t('nav.explore')}
            </Link>
            {user && (
              <Link to="/my-learning" className="text-gray-700 hover:text-orange-600 transition-colors font-medium text-sm">
                {t('nav.myLearning')}
              </Link>
            )}
            {user?.role === 'instructor' && (
              <Link to="/instructor" className="text-gray-700 hover:text-orange-600 transition-colors font-medium text-sm">
                {t('nav.teach')}
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder={t('nav.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </form>
              <div className="flex justify-start">
                <LanguageSwitcher />
              </div>
              <Link to="/courses" className="text-gray-700 hover:text-black py-2">
                {t('nav.explore')}
              </Link>
              {user ? (
                <>
                  <Link to="/my-learning" className="text-gray-700 hover:text-black py-2">
                    {t('nav.myLearning')}
                  </Link>
                  <Link to="/profile" className="text-gray-700 hover:text-black py-2">
                    {t('nav.profile')}
                  </Link>
                  {user.role === 'instructor' && (
                    <Link to="/instructor" className="text-gray-700 hover:text-black py-2">
                      {t('nav.instructorDashboard')}
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link to="/admin" className="text-gray-700 hover:text-black py-2">
                      Admin Dashboard
                    </Link>
                  )}
                  <button onClick={handleLogout} className="text-left text-gray-700 hover:text-black py-2">
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => navigate('/login')} className="justify-start">
                    {t('nav.login')}
                  </Button>
                  <Button onClick={() => navigate('/register')} className="justify-start bg-orange-600 hover:bg-orange-700">
                    {t('nav.register')}
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
