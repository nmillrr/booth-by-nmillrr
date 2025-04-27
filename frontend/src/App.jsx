import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { PhotoProvider } from './context/PhotoContext';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import UploadPage from './pages/UploadPage';
import ProcessingPage from './pages/ProcessingPage';
import ResultPage from './pages/ResultPage';
import './App.css';

function App() {
  return (
    <PhotoProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/processing" element={<ProcessingPage />} />
          <Route path="/result" element={<ResultPage />} />
        </Routes>
      </Layout>
    </PhotoProvider>
  );
}

export default App;
