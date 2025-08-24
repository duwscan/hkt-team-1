import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  PlayArrow as PlayIcon,
  ExitToApp as LogoutIcon,
  BugReport as TestIcon
} from '@mui/icons-material';

const Header = ({ currentView, onLogout, onNavigate }) => {
  const getTitle = () => {
    switch (currentView) {
      case 'dashboard':
        return 'Project Dashboard';
      case 'execution':
        return 'Test Execution';
      default:
        return 'Chrome Recorder';
    }
  };

  return (
    <AppBar position="static" elevation={2}>
      <Toolbar>
        <TestIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {getTitle()}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {currentView !== 'dashboard' && (
            <Tooltip title="Dashboard">
              <IconButton
                color="inherit"
                onClick={() => onNavigate('dashboard')}
              >
                <DashboardIcon />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Logout">
            <IconButton color="inherit" onClick={onLogout}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;