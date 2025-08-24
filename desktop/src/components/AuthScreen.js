import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  CircularProgress
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';

const AuthScreen = ({ onLogin }) => {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setError('API Key is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onLogin(apiKey.trim());
    } catch (error) {
      setError('Invalid API Key. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            maxWidth: 400,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 3,
            }}
          >
            <LockIcon color="primary" sx={{ fontSize: 40, marginRight: 1 }} />
            <Typography component="h1" variant="h4" color="primary">
              Chrome Recorder
            </Typography>
          </Box>
          
          <Typography component="h2" variant="h6" sx={{ marginBottom: 3 }}>
            Test Management Desktop App
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="apiKey"
              label="API Key"
              name="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={loading}
              sx={{ marginBottom: 2 }}
            />

            {error && (
              <Alert severity="error" sx={{ marginBottom: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ marginTop: 1, marginBottom: 2, height: 48 }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Connect'
              )}
            </Button>
          </Box>

          <Typography variant="body2" color="textSecondary" align="center">
            Enter your API key to access the Chrome Recorder test management system.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default AuthScreen;