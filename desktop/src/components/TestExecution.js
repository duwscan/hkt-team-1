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
  Divider,
  CircularProgress
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Schedule as PendingIcon,
  ArrowBack as BackIcon,
  Screenshot as ScreenshotIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';

import { testExecutionService } from '../services/testExecutionService';
import { apiService } from '../services/apiService';

const TestExecution = ({ apiKey, project, scripts, onBack }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentScript, setCurrentScript] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [results, setResults] = useState([]);
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const [executionStatus, setExecutionStatus] = useState({});
  const [screenshots, setScreenshots] = useState([]);

  useEffect(() => {
    // Cleanup on component unmount
    return () => {
      testExecutionService.cleanup();
    };
  }, []);

  const handleStartExecution = async () => {
    setIsRunning(true);
    setResults([]);
    setLogs([]);
    setProgress(0);
    setScreenshots([]);

    try {
      // Initialize test execution service
      await testExecutionService.initialize(apiKey);

      // Execute scripts sequentially
      const executionResult = await testExecutionService.executeScripts(scripts, {
        headless: false,
        slowMo: 1000,
        timeout: 30000
      }, {
        onStepComplete: (stepData) => {
          setCurrentStep(prev => prev + 1);
          updateProgress();
          
          // Add step log
          addLog(`Step completed: ${stepData.description || stepData.step}`, 'info');
        },
        
        onScreenshot: async (screenshotPath) => {
          setScreenshots(prev => [...prev, screenshotPath]);
          addLog(`Screenshot saved: ${screenshotPath}`, 'info');
          
          // In browser environment, we can't directly upload files
          // Screenshots will be handled by the backend when test results are submitted
          addLog('📸 Screenshot will be uploaded with test results', 'info');
        }
      });

      // Update results
      setResults(executionResult.results);
      setProgress(100);
      addLog('All scripts execution completed!', 'success');

    } catch (error) {
      addLog(`Execution failed: ${error.message}`, 'error');
    } finally {
      setIsRunning(false);
      setCurrentScript(null);
    }
  };

  const handleStopExecution = async () => {
    await testExecutionService.stopExecution();
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

  const updateProgress = () => {
    const status = testExecutionService.getExecutionStatus();
    setExecutionStatus(status);
    
    if (status.totalScripts > 0) {
      const progressPercent = (status.completedScripts / status.totalScripts) * 100;
      setProgress(progressPercent);
    }
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

  const getExecutionSummary = () => {
    const status = testExecutionService.getExecutionStatus();
    return {
      total: status.totalScripts || 0,
      successful: status.successfulScripts || 0,
      failed: status.failedScripts || 0,
      inProgress: status.isRunning ? 1 : 0
    };
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
                  Running: {currentScript?.name || 'Initializing...'} 
                  ({executionStatus.currentScriptIndex || 0}/{scripts.length})
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
                            {result.completedAt ? new Date(result.completedAt).toLocaleTimeString() : 'N/A'}
                          </Typography>
                          {result.executionTime && (
                            <Typography variant="caption" sx={{ ml: 1 }}>
                              ({result.executionTime})
                            </Typography>
                          )}
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

      {/* Screenshots Section */}
      {screenshots.length > 0 && (
        <Paper sx={{ p: 2, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            <ScreenshotIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Screenshots ({screenshots.length})
          </Typography>
          <Grid container spacing={2}>
            {screenshots.map((screenshot, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {screenshot.includes('initial') ? 'Initial' : 
                       screenshot.includes('final') ? 'Final' : `Step ${index + 1}`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {screenshot.split('/').pop()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Summary */}
      {results.length > 0 && !isRunning && (
        <Paper sx={{ p: 2, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            <TimelineIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Execution Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="text.primary">
                    {getExecutionSummary().total}
                  </Typography>
                  <Typography color="text.secondary">
                    Total Scripts
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">
                    {getExecutionSummary().successful}
                  </Typography>
                  <Typography color="text.secondary">
                    Successful
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="error.main">
                    {getExecutionSummary().failed}
                  </Typography>
                  <Typography color="text.secondary">
                    Failed
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main">
                    {screenshots.length}
                  </Typography>
                  <Typography color="text.secondary">
                    Screenshots
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