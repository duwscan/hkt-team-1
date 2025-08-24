import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

// Components
import AuthScreen from './components/AuthScreen';
import Dashboard from './components/Dashboard';
import TestExecution from './components/TestExecution';
import Header from './components/Header';

// Services
import { apiService } from './services/apiService';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [currentView, setCurrentView] = useState('auth'); // 'auth', 'dashboard', 'execution'
  const [apiKey, setApiKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedScripts, setSelectedScripts] = useState([]);

  useEffect(() => {
    // Check for stored API key
    const storedApiKey = localStorage.getItem('apiKey');
    if (storedApiKey) {
      setApiKey(storedApiKey);
      validateApiKey(storedApiKey);
    }
  }, []);

  const validateApiKey = async (key) => {
    try {
      const isValid = await apiService.validateApiKey(key);
      if (isValid) {
        setIsAuthenticated(true);
        setCurrentView('dashboard');
        localStorage.setItem('apiKey', key);
      } else {
        setIsAuthenticated(false);
        setCurrentView('auth');
        localStorage.removeItem('apiKey');
      }
    } catch (error) {
      console.error('API key validation failed:', error);
      setIsAuthenticated(false);
      setCurrentView('auth');
    }
  };

  const handleLogin = async (key) => {
    setApiKey(key);
    await validateApiKey(key);
  };

  const handleLogout = () => {
    setApiKey('');
    setIsAuthenticated(false);
    setCurrentView('auth');
    localStorage.removeItem('apiKey');
  };

  const handleRunTests = (project, scripts) => {
    setSelectedProject(project);
    setSelectedScripts(scripts);
    setCurrentView('execution');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'auth':
        return <AuthScreen onLogin={handleLogin} />;
      case 'dashboard':
        return (
          <Dashboard
            apiKey={apiKey}
            onRunTests={handleRunTests}
          />
        );
      case 'execution':
        return (
          <TestExecution
            apiKey={apiKey}
            project={selectedProject}
            scripts={selectedScripts}
            onBack={handleBackToDashboard}
          />
        );
      default:
        return <AuthScreen onLogin={handleLogin} />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {isAuthenticated && (
          <Header
            currentView={currentView}
            onLogout={handleLogout}
            onNavigate={setCurrentView}
          />
        )}
        <Container
          maxWidth={false}
          sx={{
            flexGrow: 1,
            py: isAuthenticated ? 2 : 0,
            px: isAuthenticated ? 3 : 0
          }}
        >
          {renderCurrentView()}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;