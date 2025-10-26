import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import F1Page from './pages/F1Page';
import CricketPage from './pages/CricketPage';
import BasketballPage from './pages/BasketballPage';
import VideoPlayer from './pages/VideoPlayer';
import WedzHLSDemo from './pages/WedzHLSDemo';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/f1" element={<F1Page />} />
            <Route path="/cricket" element={<CricketPage />} />
            <Route path="/basketball" element={<BasketballPage />} />
            <Route path="/player/:source/:id" element={<VideoPlayer />} />
            <Route path="/wedzthlsdemo" element={<WedzHLSDemo />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
