import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import F1Page from './pages/F1Page';
import BasketballPage from './pages/BasketballPage';
import CricketPage from './pages/CricketPage';
import VideoPlayer from './pages/VideoPlayer';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/f1" element={<F1Page />} />
            <Route path="/basketball" element={<BasketballPage />} />
            <Route path="/cricket" element={<CricketPage />} />
            <Route path="/player/:source/:id" element={<VideoPlayer />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
