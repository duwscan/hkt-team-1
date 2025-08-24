import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  TextField,
  Card,
  CardContent,
  CardActions,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';

import { apiService } from '../services/apiService';

const Dashboard = ({ apiKey, onRunTests }) => {
  const [projects, setProjects] = useState([]);
  const [screens, setScreens] = useState([]);
  const [scripts, setScripts] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedScreen, setSelectedScreen] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedScripts, setSelectedScripts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadScreens(selectedProject);
      loadScripts(selectedProject);
    }
  }, [selectedProject]);

  useEffect(() => {
    if (selectedProject) {
      loadScripts(selectedProject, selectedScreen, selectedTags, searchTerm);
    }
  }, [selectedScreen, selectedTags, searchTerm]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await apiService.getProjects(apiKey);
      setProjects(data);
    } catch (error) {
      setError('Failed to load projects');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadScreens = async (projectId) => {
    try {
      const data = await apiService.getScreens(apiKey, projectId);
      setScreens(data);
    } catch (error) {
      console.error('Failed to load screens:', error);
    }
  };

  const loadScripts = async (projectId, screenId = '', tags = [], search = '') => {
    try {
      const data = await apiService.getScripts(apiKey, {
        project: projectId,
        screen: screenId,
        tags: tags,
        search: search
      });
      setScripts(data);
    } catch (error) {
      console.error('Failed to load scripts:', error);
    }
  };

  const handleProjectChange = (event) => {
    setSelectedProject(event.target.value);
    setSelectedScreen('');
    setSelectedTags([]);
    setSelectedScripts([]);
  };

  const handleScreenChange = (event) => {
    setSelectedScreen(event.target.value);
  };

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };

  const handleScriptToggle = (scriptId) => {
    setSelectedScripts(prev => {
      if (prev.includes(scriptId)) {
        return prev.filter(id => id !== scriptId);
      } else {
        return [...prev, scriptId];
      }
    });
  };

  const handleRunSelected = () => {
    if (selectedScripts.length > 0) {
      const selectedScriptObjects = scripts.filter(script => 
        selectedScripts.includes(script.id)
      );
      const projectObject = projects.find(p => p.id === selectedProject);
      onRunTests(projectObject, selectedScriptObjects);
    }
  };

  const getAvailableTags = () => {
    const tags = new Set();
    scripts.forEach(script => {
      script.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Test Script Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Filters Section */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              <FilterIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Filters
            </Typography>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Project</InputLabel>
              <Select
                value={selectedProject}
                onChange={handleProjectChange}
                label="Project"
              >
                <MenuItem value="">
                  <em>Select a project</em>
                </MenuItem>
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedProject && (
              <FormControl fullWidth margin="normal">
                <InputLabel>Screen</InputLabel>
                <Select
                  value={selectedScreen}
                  onChange={handleScreenChange}
                  label="Screen"
                >
                  <MenuItem value="">
                    <em>All screens</em>
                  </MenuItem>
                  {screens.map((screen) => (
                    <MenuItem key={screen.id} value={screen.id}>
                      {screen.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <TextField
              fullWidth
              margin="normal"
              label="Search scripts"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />

            {getAvailableTags().length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Tags
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {getAvailableTags().map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onClick={() => handleTagToggle(tag)}
                      color={selectedTags.includes(tag) ? 'primary' : 'default'}
                      variant={selectedTags.includes(tag) ? 'filled' : 'outlined'}
                      size="small"
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Scripts List Section */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Test Scripts ({scripts.length})
              </Typography>
              <Button
                variant="contained"
                startIcon={<PlayIcon />}
                onClick={handleRunSelected}
                disabled={selectedScripts.length === 0}
              >
                Run Selected ({selectedScripts.length})
              </Button>
            </Box>

            {scripts.length === 0 ? (
              <Typography color="text.secondary">
                {selectedProject ? 'No scripts found for the selected filters.' : 'Please select a project to view scripts.'}
              </Typography>
            ) : (
              <List>
                {scripts.map((script, index) => (
                  <Box key={script.id}>
                    <ListItem
                      button
                      onClick={() => handleScriptToggle(script.id)}
                    >
                      <Checkbox
                        checked={selectedScripts.includes(script.id)}
                        tabIndex={-1}
                        disableRipple
                      />
                      <ListItemText
                        primary={script.name}
                        secondary={
                          <Box>
                            <Typography variant="body2">
                              Version: {script.version} | Screen: {script.screen?.name}
                            </Typography>
                            {script.tags && script.tags.length > 0 && (
                              <Box sx={{ mt: 1 }}>
                                {script.tags.map((tag) => (
                                  <Chip
                                    key={tag}
                                    label={tag}
                                    size="small"
                                    variant="outlined"
                                    sx={{ mr: 0.5 }}
                                  />
                                ))}
                              </Box>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < scripts.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;