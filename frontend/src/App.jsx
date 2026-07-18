import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CompareCornerDrawer from './components/CompareCornerDrawer';

// Pages lazy/direct imports
import Home from './pages/Home';
import EventDetail from './pages/EventDetail';
import ComparePage from './pages/ComparePage';
import Search from './pages/Search';
import Bookings from './pages/Bookings';
import Profile from './pages/Profile';
import BookingFlow from './pages/BookingFlow';
import CategoryPage from './pages/CategoryPage';

function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <CompareCornerDrawer />
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/search" element={<Search />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/checkout" element={<BookingFlow />} />
          
          {/* Category Routes */}
          <Route path="/movies" element={<CategoryPage categoryId="movies" />} />
          <Route path="/comedy" element={<CategoryPage categoryId="comedy" />} />
          <Route path="/concerts" element={<CategoryPage categoryId="concerts" />} />
          <Route path="/plays" element={<CategoryPage categoryId="plays" />} />
          <Route path="/sports" element={<CategoryPage categoryId="sports" />} />
          <Route path="/activities" element={<CategoryPage categoryId="activities" />} />

          {/* Fallback route */}
          <Route path="*" element={<Home />} />
        </Routes>
      </Layout>
    </Router>
  );
}
