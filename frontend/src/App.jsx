import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home.jsx';
import Workouts from './pages/Workouts.jsx';
import Meals from './pages/Meals.jsx';
import Membership from './pages/Membership.jsx';
import Community from './pages/Community.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen">
          {/* Texture overlay for premium feel */}
          <div className="texture-overlay"></div>
          
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/workouts" element={<Workouts />} />
              <Route path="/meals" element={<Meals />} />
              <Route path="/membership" element={<Membership />} />
              <Route path="/community" element={<Community />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App; 