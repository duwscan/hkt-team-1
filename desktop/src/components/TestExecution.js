import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert,
  Card,
  CardContent,
  Grid,
  Divider
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Schedule as PendingIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';

import { testExecutionService } from '../services/testExecutionService';

const TestExecution = ({ apiKey, project, scripts, onBack }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentScript, setCurrentScript] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [results, setResults] = useState([]);
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);

  const handleStartExecution = async () => {
    setIsRunning(true);
    setResults([]);
    setLogs([]);
    setProgress(0);

    try {
      // Initialize test execution service
      testExecutionService.initialize(apiKey);

      // Execute scripts sequentially
      for (let i = 0; i < scripts.length; i++) {
        const script = scripts[i];
        setCurrentScript(script);
        setCurrentStep(i + 1);

        // Update progress
        const progressPercent = ((i) / scripts.length) * 100;
        setProgress(progressPercent);

        try {
          addLog(`Starting execution of: ${script.name}`);
          
          const result = await testExecutionService.executeScript(script, {
            onStepComplete: (stepData) => {
              addLog(`Step completed: ${stepData.url}`);
              if (stepData.error) {
                addLog(`Console error: ${stepData.error}`, 'error');
              }
            },
            onScreenshot: (screenshotPath) => {
              addLog(`Screenshot saved: ${screenshotPath}`);
            }
          });

          setResults(prev => [...prev, {
            scriptId: script.id,
            scriptName: script.name,
            status: 'success',
            result: result,
            completedAt: new Date()
          }]);

          addLog(`✅ Completed: ${script.name}`, 'success');

        } catch (error) {
          setResults(prev => [...prev, {
            scriptId: script.id,
            scriptName: script.name,
            status: 'error',
            error: error.message,
            completedAt: new Date()
          }]);

          addLog(`❌ Failed: ${script.name} - ${error.message}`, 'error');
        }
      }

      setProgress(100);
      addLog('All scripts execution completed!', 'success');

    } catch (error) {
      addLog(`Execution failed: ${error.message}`, 'error');
    } finally {
      setIsRunning(false);
      setCurrentScript(null);
    }
  };

  const handleStopExecution = () => {
    testExecutionService.stopExecution();
    setIsRunning(false);
    setCurrentScript(null);
    addLog('Execution stopped by user', 'warning');
  };

  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev, {
      timestamp: new Date(),
      message,
      type
    }]);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <SuccessIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <PendingIcon color="action" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Test Execution
        </Typography>
        <Button
          startIcon={<BackIcon />}
          onClick={onBack}
          disabled={isRunning}
        >
          Back to Dashboard
        </Button>
      </Box>

      {/* Project and Scripts Info */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Project: {project?.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {scripts.length} script(s) selected for execution
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
          {scripts.map((script) => (
            <Chip
              key={script.id}
              label={`${script.name} (v${script.version})`}
              variant="outlined"
              size="small"
            />
          ))}
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Execution Control */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Execution Control
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Button
                variant="contained"
                startIcon={<PlayIcon />}
                onClick={handleStartExecution}
                disabled={isRunning}
                sx={{ mr: 1 }}
              >
                Start Execution
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<StopIcon />}
                onClick={handleStopExecution}
                disabled={!isRunning}
              >
                Stop
              </Button>
            </Box>

            {isRunning && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Running: {currentScript?.name} ({currentStep}/{scripts.length})
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                  {Math.round(progress)}% complete
                </Typography>
              </Box>
            )}

            {/* Execution Results */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Results ({results.length})
            </Typography>
            
            {results.length === 0 ? (
              <Typography color="text.secondary">
                No results yet. Start execution to see results.
              </Typography>
            ) : (
              <List dense>
                {results.map((result, index) => (
                  <ListItem key={index} divider>
                    <ListItemIcon>
                      {getStatusIcon(result.status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={result.scriptName}
                      secondary={
                        <Box>
                          <Chip
                            label={result.status}
                            color={getStatusColor(result.status)}
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          <Typography variant="caption">
                            {result.completedAt.toLocaleTimeString()}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Execution Logs */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Execution Logs
            </Typography>
            
            <Box
              sx={{
                height: 400,
                overflow: 'auto',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                p: 1,
                backgroundColor: 'grey.50'
              }}
            >
              {logs.length === 0 ? (
                <Typography color="text.secondary" variant="body2">
                  Logs will appear here during execution...
                </Typography>
              ) : (
                logs.map((log, index) => (
                  <Box key={index} sx={{ mb: 1 }}>
                    <Typography
                      variant="caption"
                      component="div"
                      sx={{
                        fontFamily: 'monospace',
                        color: log.type === 'error' ? 'error.main' :
                               log.type === 'success' ? 'success.main' :
                               log.type === 'warning' ? 'warning.main' : 'text.primary'
                      }}
                    >
                      [{log.timestamp.toLocaleTimeString()}] {log.message}
                    </Typography>
                  </Box>
                ))
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Summary */}
      {results.length > 0 && !isRunning && (
        <Paper sx={{ p: 2, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Execution Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="text.primary">
                    {results.length}
                  </Typography>
                  <Typography color="text.secondary">
                    Total Scripts
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">
                    {results.filter(r => r.status === 'success').length}
                  </Typography>
                  <Typography color="text.secondary">
                    Successful
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="error.main">
                    {results.filter(r => r.status === 'error').length}
                  </Typography>
                  <Typography color="text.secondary">
                    Failed
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default TestExecution;