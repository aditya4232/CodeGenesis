import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState } from 'react';
import { Brain, FileText, MessageSquare, Activity, Moon, Sun } from 'lucide-react';
import HomePage from './pages/HomePage';
import DocumentsPage from './pages/DocumentsPage';
import QueryPage from './pages/QueryPage';
import SystemPage from './pages/SystemPage';

function App() {
  const [darkMode, setDarkMode] = useState(true);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <Router>
      <div className={darkMode ? 'dark' : ''}>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          {/* Navigation */}
          <nav className="glass border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center space-x-8">
                  <Link to="/" className="flex items-center space-x-2">
                    <Brain className="w-8 h-8 text-primary-600" />
                    <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                      MemoRAG ULTRA
                    </span>
                  </Link>
                  
                  <div className="hidden md:flex space-x-4">
                    <NavLink to="/" icon={<Brain className="w-4 h-4" />}>
                      Home
                    </NavLink>
                    <NavLink to="/documents" icon={<FileText className="w-4 h-4" />}>
                      Documents
                    </NavLink>
                    <NavLink to="/query" icon={<MessageSquare className="w-4 h-4" />}>
                      Query
                    </NavLink>
                    <NavLink to="/system" icon={<Activity className="w-4 h-4" />}>
                      System
                    </NavLink>
                  </div>
                </div>
                
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/query" element={<QueryPage />} />
              <Route path="/system" element={<SystemPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

function NavLink({ to, icon, children }) {
  return (
    <Link
      to={to}
      className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}

export default App;
