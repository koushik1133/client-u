import { useState, useEffect } from 'react';
import type { User, TimezoneOption, Booking } from './types/flashCinema';
import { TIMEZONES, SAMPLE_BOOKINGS } from './data/mockData';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { BookingEngine } from './components/BookingEngine';
import { PortfolioGrid } from './components/PortfolioGrid';
import { PackageCalculator } from './components/PackageCalculator';
import { GearAndCrew } from './components/GearAndCrew';
import { ClientDashboard } from './components/ClientDashboard';
import { AIAssistant } from './components/AIAssistant';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';

export function App() {
  // User Session State
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('apex_flash_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Selected Timezone (Default PST - US West Coast)
  const [selectedTimezone, setSelectedTimezone] = useState<TimezoneOption>(TIMEZONES[0]);

  // Bookings list
  const [userBookings, setUserBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('apex_flash_bookings');
    return saved ? JSON.parse(saved) : SAMPLE_BOOKINGS;
  });

  // Modals & Active section
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  // Sync state to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('apex_flash_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('apex_flash_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('apex_flash_bookings', JSON.stringify(userBookings));
  }, [userBookings]);

  const handleLoginSuccess = (loggedUser: User) => {
    setUser(loggedUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleBookingConfirmed = (newBooking: Booking) => {
    setUserBookings(prev => [newBooking, ...prev]);
  };

  const handleNavigateSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 relative selection:bg-emerald-600 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        user={user}
        selectedTimezone={selectedTimezone}
        onSelectTimezone={setSelectedTimezone}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onNavigateSection={handleNavigateSection}
        activeSection={activeSection}
      />

      {/* Main Content Sections */}
      <main>
        {/* Hero Section */}
        <HeroSection
          onNavigateBooking={() => handleNavigateSection('booking')}
          onNavigatePortfolio={() => handleNavigateSection('portfolio')}
        />

        {/* Portfolio & Video Reels Showcase */}
        <PortfolioGrid />

        {/* Interactive Timezone & Calendar Booking Engine */}
        <BookingEngine
          user={user}
          selectedTimezone={selectedTimezone}
          onSelectTimezone={setSelectedTimezone}
          onBookingConfirmed={handleBookingConfirmed}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />

        {/* Custom Package & Budget Configurator */}
        <PackageCalculator
          onNavigateBooking={() => handleNavigateSection('booking')}
        />

        {/* Studio Equipment Vault & Director Crew */}
        <GearAndCrew />

        {/* Authenticated Client Portal */}
        <ClientDashboard
          user={user}
          userBookings={userBookings}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onNavigateBooking={() => handleNavigateSection('booking')}
        />
      </main>

      {/* Floating AI Shoot Consultant */}
      <AIAssistant />

      {/* Footer */}
      <Footer />

      {/* Auth Sign-in / Sign-up Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

    </div>
  );
}

export default App;
