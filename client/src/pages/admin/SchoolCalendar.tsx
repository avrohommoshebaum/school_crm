import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  Badge,
  Alert,
  Snackbar,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventIcon from '@mui/icons-material/Event';
import SchoolIcon from '@mui/icons-material/School';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import CelebrationIcon from '@mui/icons-material/Celebration';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import ViewDayIcon from '@mui/icons-material/ViewDay';

interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  endDate?: string;
  type: 'holiday' | 'break' | 'event' | 'meeting' | 'special';
  description?: string;
  allDay: boolean;
  time?: string;
}

export default function SchoolCalendar() {
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [addEventDialog, setAddEventDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterType, setFilterType] = useState<string>('all');

  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    title: '',
    date: '',
    type: 'event',
    allDay: true,
    description: '',
  });

  const [events, setEvents] = useState<CalendarEvent[]>([
    { id: 1, title: 'Rosh Hashanah', date: '2024-10-03', endDate: '2024-10-04', type: 'holiday', allDay: true },
    { id: 2, title: 'Yom Kippur', date: '2024-10-12', type: 'holiday', allDay: true },
    { id: 3, title: 'Sukkot', date: '2024-10-17', endDate: '2024-10-24', type: 'holiday', allDay: true },
    { id: 4, title: 'Thanksgiving Break', date: '2024-11-28', endDate: '2024-11-29', type: 'break', allDay: true },
    { id: 5, title: 'Winter Break', date: '2024-12-23', endDate: '2025-01-03', type: 'break', allDay: true },
    { id: 6, title: 'Parent-Teacher Conferences', date: '2025-01-15', type: 'meeting', time: '14:00', allDay: false },
    { id: 7, title: 'Purim', date: '2025-03-14', type: 'holiday', allDay: true },
    { id: 8, title: 'Spring Break', date: '2025-03-24', endDate: '2025-03-28', type: 'break', allDay: true },
    { id: 9, title: 'Pesach', date: '2025-04-13', endDate: '2025-04-21', type: 'holiday', allDay: true },
    { id: 10, title: 'School Play', date: '2025-05-08', type: 'special', time: '18:00', allDay: false },
    { id: 11, title: 'Shavuot', date: '2025-06-02', endDate: '2025-06-03', type: 'holiday', allDay: true },
    { id: 12, title: 'Last Day of School', date: '2025-06-20', type: 'special', allDay: true },
  ]);

  const eventTypeConfig = {
    holiday: { color: '#7b1fa2', icon: CelebrationIcon, label: 'Holiday' },
    break: { color: '#f57c00', icon: BeachAccessIcon, label: 'Break' },
    event: { color: '#1976d2', icon: EventIcon, label: 'Event' },
    meeting: { color: '#388e3c', icon: MeetingRoomIcon, label: 'Meeting' },
    special: { color: '#d32f2f', icon: SchoolIcon, label: 'Special Event' },
  };

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date) {
      setSnackbar({ open: true, message: 'Please fill in required fields', severity: 'error' });
      return;
    }

    const event: CalendarEvent = {
      id: events.length + 1,
      title: newEvent.title!,
      date: newEvent.date!,
      endDate: newEvent.endDate,
      type: newEvent.type as CalendarEvent['type'],
      description: newEvent.description,
      allDay: newEvent.allDay!,
      time: newEvent.time,
    };

    setEvents([...events, event]);
    setAddEventDialog(false);
    setNewEvent({ title: '', date: '', type: 'event', allDay: true, description: '' });
    setSnackbar({ open: true, message: 'Event added successfully!', severity: 'success' });
  };

  const handleDeleteEvent = (id: number) => {
    setEvents(events.filter(e => e.id !== id));
    setSnackbar({ open: true, message: 'Event deleted successfully!', severity: 'success' });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => {
      if (event.endDate) {
        return dateStr >= event.date && dateStr <= event.endDate;
      }
      return event.date === dateStr;
    });
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const today = new Date();
  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const filteredEvents = filterType === 'all' 
    ? events 
    : events.filter(e => e.type === filterType);

  const upcomingEvents = events
    .filter(e => new Date(e.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  // Get week days for week view
  const getWeekDays = (date: Date) => {
    const days = [];
    const currentDay = new Date(date);
    const dayOfWeek = currentDay.getDay();
    
    // Start from Sunday of current week
    currentDay.setDate(currentDay.getDate() - dayOfWeek);
    
    for (let i = 0; i < 7; i++) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  const weekDays = getWeekDays(currentDate);

  // Navigation for week and day views
  const previousPeriod = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else if (viewMode === 'week') {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() - 7);
      setCurrentDate(newDate);
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() - 1);
      setCurrentDate(newDate);
    }
  };

  const nextPeriod = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else if (viewMode === 'week') {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + 7);
      setCurrentDate(newDate);
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + 1);
      setCurrentDate(newDate);
    }
  };

  const getDisplayTitle = () => {
    if (viewMode === 'month') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else if (viewMode === 'week') {
      const weekStart = weekDays[0];
      const weekEnd = weekDays[6];
      return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }
  };

  return (
    <Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" justifyContent="flex-end" alignItems="center">
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddEventDialog(true)}>
            Add Event
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={3}>
        {/* Main Calendar */}
        <Grid item xs={12} lg={9}>
          <Paper elevation={2} sx={{ p: 3 }}>
            {/* Calendar Controls */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <IconButton onClick={previousPeriod}>
                  <ChevronLeftIcon />
                </IconButton>
                <Typography variant="h6" sx={{ minWidth: 200, textAlign: 'center' }}>
                  {getDisplayTitle()}
                </Typography>
                <IconButton onClick={nextPeriod}>
                  <ChevronRightIcon />
                </IconButton>
                <Button size="small" onClick={() => setCurrentDate(new Date())}>
                  Today
                </Button>
              </Stack>

              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, value) => value && setViewMode(value)}
                size="small"
              >
                <ToggleButton value="month">
                  <ViewModuleIcon sx={{ mr: 1 }} fontSize="small" />
                  Month
                </ToggleButton>
                <ToggleButton value="week">
                  <ViewWeekIcon sx={{ mr: 1 }} fontSize="small" />
                  Week
                </ToggleButton>
                <ToggleButton value="day">
                  <ViewDayIcon sx={{ mr: 1 }} fontSize="small" />
                  Day
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>

            {/* Event Type Filters */}
            <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
              <Chip
                label="All Events"
                onClick={() => setFilterType('all')}
                color={filterType === 'all' ? 'primary' : 'default'}
                sx={{ cursor: 'pointer' }}
              />
              {Object.entries(eventTypeConfig).map(([type, config]) => (
                <Chip
                  key={type}
                  label={config.label}
                  onClick={() => setFilterType(type)}
                  sx={{
                    cursor: 'pointer',
                    bgcolor: filterType === type ? config.color : 'default',
                    color: filterType === type ? 'white' : 'inherit',
                    '&:hover': {
                      bgcolor: filterType === type ? config.color : 'rgba(0,0,0,0.08)',
                    },
                  }}
                  icon={<config.icon sx={{ color: filterType === type ? 'white !important' : config.color }} />}
                />
              ))}
            </Stack>

            {/* Calendar Grid */}
            <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
              {viewMode === 'month' && (
                <>
                  {/* Day Headers */}
                  <Grid container sx={{ bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <Grid item xs key={day}>
                        <Box sx={{ p: 1.5, textAlign: 'center' }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {day}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>

                  {/* Calendar Days */}
                  <Grid container>
                    {/* Empty cells before first day */}
                    {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                      <Grid item xs key={`empty-${index}`}>
                        <Box
                          sx={{
                            minHeight: 100,
                            borderRight: '1px solid #e0e0e0',
                            borderBottom: '1px solid #e0e0e0',
                            bgcolor: '#fafafa',
                          }}
                        />
                      </Grid>
                    ))}

                    {/* Days of the month */}
                    {Array.from({ length: daysInMonth }).map((_, index) => {
                      const day = index + 1;
                      const date = new Date(year, month, day);
                      const dayEvents = getEventsForDate(date).filter(e => 
                        filterType === 'all' || e.type === filterType
                      );

                      return (
                        <Grid item xs key={day}>
                          <Box
                            sx={{
                              minHeight: 100,
                              borderRight: '1px solid #e0e0e0',
                              borderBottom: '1px solid #e0e0e0',
                              p: 1,
                              bgcolor: isToday(day) ? '#e3f2fd' : 'white',
                              position: 'relative',
                              '&:hover': { bgcolor: '#f5f5f5' },
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: isToday(day) ? 'bold' : 'normal',
                                color: isToday(day) ? '#1976d2' : 'inherit',
                              }}
                            >
                              {day}
                            </Typography>
                            <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                              {dayEvents.slice(0, 2).map((event) => (
                                <Chip
                                  key={event.id}
                                  label={event.title}
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontSize: '0.7rem',
                                    bgcolor: eventTypeConfig[event.type].color,
                                    color: 'white',
                                    '& .MuiChip-label': { px: 1 },
                                  }}
                                  onClick={() => setSelectedEvent(event)}
                                />
                              ))}
                              {dayEvents.length > 2 && (
                                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                  +{dayEvents.length - 2} more
                                </Typography>
                              )}
                            </Stack>
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                </>
              )}

              {viewMode === 'week' && (
                <>
                  {/* Day Headers */}
                  <Grid container sx={{ bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
                    {weekDays.map((day, index) => (
                      <Grid item xs key={index}>
                        <Box sx={{ p: 1.5, textAlign: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            {day.toLocaleDateString('en-US', { weekday: 'short' })}
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {day.getDate()}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>

                  {/* Week Days */}
                  <Grid container>
                    {weekDays.map((day, index) => {
                      const dayEvents = getEventsForDate(day).filter(e => 
                        filterType === 'all' || e.type === filterType
                      );
                      const isTodayDate = day.toDateString() === today.toDateString();

                      return (
                        <Grid item xs key={index}>
                          <Box
                            sx={{
                              minHeight: 400,
                              borderRight: '1px solid #e0e0e0',
                              borderBottom: '1px solid #e0e0e0',
                              p: 1,
                              bgcolor: isTodayDate ? '#e3f2fd' : 'white',
                              '&:hover': { bgcolor: '#f5f5f5' },
                            }}
                          >
                            <Stack spacing={1}>
                              {dayEvents.map((event) => (
                                <Card
                                  key={event.id}
                                  sx={{
                                    bgcolor: eventTypeConfig[event.type].color,
                                    color: 'white',
                                    cursor: 'pointer',
                                    '&:hover': { boxShadow: 3 },
                                  }}
                                  onClick={() => setSelectedEvent(event)}
                                >
                                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                                      {event.time || 'All day'}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                                      {event.title}
                                    </Typography>
                                  </CardContent>
                                </Card>
                              ))}
                            </Stack>
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                </>
              )}

              {viewMode === 'day' && (
                <Box sx={{ p: 3 }}>
                  <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
                    {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </Typography>
                  <Stack spacing={2}>
                    {getEventsForDate(currentDate)
                      .filter(e => filterType === 'all' || e.type === filterType)
                      .map((event) => {
                        const EventIconComponent = eventTypeConfig[event.type].icon;
                        return (
                          <Card
                            key={event.id}
                            sx={{
                              cursor: 'pointer',
                              '&:hover': { boxShadow: 4 },
                              borderLeft: `4px solid ${eventTypeConfig[event.type].color}`,
                            }}
                            onClick={() => setSelectedEvent(event)}
                          >
                            <CardContent>
                              <Stack direction="row" spacing={2} alignItems="flex-start">
                                <Box
                                  sx={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: 1,
                                    bgcolor: eventTypeConfig[event.type].color,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                  }}
                                >
                                  <EventIconComponent sx={{ color: 'white' }} />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="h6">{event.title}</Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {event.time ? `${event.time}` : 'All day'}
                                    {event.endDate && ` - ${new Date(event.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                                  </Typography>
                                  <Chip
                                    label={eventTypeConfig[event.type].label}
                                    size="small"
                                    sx={{ mt: 1, bgcolor: eventTypeConfig[event.type].color, color: 'white' }}
                                  />
                                  {event.description && (
                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                      {event.description}
                                    </Typography>
                                  )}
                                </Box>
                              </Stack>
                            </CardContent>
                          </Card>
                        );
                      })}
                    {getEventsForDate(currentDate).filter(e => filterType === 'all' || e.type === filterType).length === 0 && (
                      <Box sx={{ textAlign: 'center', py: 8 }}>
                        <CalendarMonthIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                          No events scheduled
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          This day has no events
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Box>
              )}
            </Box>

            {/* Legend */}
            <Stack direction="row" spacing={2} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                Legend:
              </Typography>
              {Object.entries(eventTypeConfig).map(([type, config]) => (
                <Stack direction="row" spacing={0.5} alignItems="center" key={type}>
                  <Box sx={{ width: 12, height: 12, bgcolor: config.color, borderRadius: 1 }} />
                  <Typography variant="caption">{config.label}</Typography>
                </Stack>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* Sidebar - Upcoming Events */}
        <Grid item xs={12} lg={3}>
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Upcoming Events
            </Typography>
            <List sx={{ p: 0 }}>
              {upcomingEvents.map((event, index) => {
                const EventIcon = eventTypeConfig[event.type].icon;
                return (
                  <Box key={event.id}>
                    <ListItem sx={{ px: 0, alignItems: 'flex-start' }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1,
                          bgcolor: eventTypeConfig[event.type].color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2,
                          flexShrink: 0,
                        }}
                      >
                        <EventIcon sx={{ color: 'white', fontSize: 20 }} />
                      </Box>
                      <ListItemText
                        primary={event.title}
                        secondary={
                          <Stack spacing={0.5}>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(event.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                              {event.time && ` at ${event.time}`}
                            </Typography>
                            <Chip
                              label={eventTypeConfig[event.type].label}
                              size="small"
                              sx={{ width: 'fit-content', height: 18, fontSize: '0.65rem' }}
                            />
                          </Stack>
                        }
                      />
                      <IconButton size="small" onClick={() => handleDeleteEvent(event.id)} color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItem>
                    {index < upcomingEvents.length - 1 && <Divider />}
                  </Box>
                );
              })}
            </List>
          </Paper>

          {/* Quick Stats */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Event Summary
            </Typography>
            <Stack spacing={2}>
              {Object.entries(eventTypeConfig).map(([type, config]) => {
                const count = events.filter(e => e.type === type).length;
                return (
                  <Stack direction="row" justifyContent="space-between" alignItems="center" key={type}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <config.icon sx={{ color: config.color, fontSize: 20 }} />
                      <Typography variant="body2">{config.label}</Typography>
                    </Stack>
                    <Chip label={count} size="small" sx={{ bgcolor: config.color, color: 'white' }} />
                  </Stack>
                );
              })}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Add Event Dialog */}
      <Dialog open={addEventDialog} onClose={() => setAddEventDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Event</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Event Title"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              required
            />

            <FormControl fullWidth required>
              <InputLabel>Event Type</InputLabel>
              <Select
                value={newEvent.type}
                label="Event Type"
                onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as CalendarEvent['type'] })}
              >
                {Object.entries(eventTypeConfig).map(([type, config]) => (
                  <MenuItem value={type} key={type}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <config.icon sx={{ color: config.color, fontSize: 20 }} />
                      <span>{config.label}</span>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={newEvent.date}
              onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
            />

            <TextField
              fullWidth
              label="End Date (Optional)"
              type="date"
              value={newEvent.endDate || ''}
              onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />

            <FormControl fullWidth>
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Time (Optional)"
                  type="time"
                  value={newEvent.time || ''}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value, allDay: !e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{ flex: 1 }}
                />
              </Stack>
            </FormControl>

            <TextField
              fullWidth
              label="Description (Optional)"
              multiline
              rows={3}
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setAddEventDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddEvent}>
            Add Event
          </Button>
        </DialogActions>
      </Dialog>

      {/* Event Details Dialog */}
      <Dialog open={!!selectedEvent} onClose={() => setSelectedEvent(null)} maxWidth="sm" fullWidth>
        {selectedEvent && (
          <>
            <DialogTitle>
              <Stack direction="row" spacing={2} alignItems="center">
                {(() => {
                  const EventIcon = eventTypeConfig[selectedEvent.type].icon;
                  return <EventIcon sx={{ color: eventTypeConfig[selectedEvent.type].color }} />;
                })()}
                <span>{selectedEvent.title}</span>
              </Stack>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedEvent.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                    {selectedEvent.endDate &&
                      ` - ${new Date(selectedEvent.endDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}`}
                  </Typography>
                </Box>
                {selectedEvent.time && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Time
                    </Typography>
                    <Typography variant="body1">{selectedEvent.time}</Typography>
                  </Box>
                )}
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Event Type
                  </Typography>
                  <Typography variant="body1">
                    <Chip
                      label={eventTypeConfig[selectedEvent.type].label}
                      size="small"
                      sx={{ bgcolor: eventTypeConfig[selectedEvent.type].color, color: 'white' }}
                    />
                  </Typography>
                </Box>
                {selectedEvent.description && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body1">{selectedEvent.description}</Typography>
                  </Box>
                )}
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => {
                  handleDeleteEvent(selectedEvent.id);
                  setSelectedEvent(null);
                }}
              >
                Delete
              </Button>
              <Button onClick={() => setSelectedEvent(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}