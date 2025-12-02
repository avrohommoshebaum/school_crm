import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Chip,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import RoomIcon from '@mui/icons-material/Room';
import ScheduleIcon from '@mui/icons-material/Schedule';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

interface ViewClassDialogProps {
  open: boolean;
  classData: any;
  onClose: () => void;
  onEdit: () => void;
}

export default function ViewClassDialog({ open, classData, onClose, onEdit }: ViewClassDialogProps) {
  if (!classData) return null;

  const capacityPercentage = (classData.studentCount / classData.maxCapacity) * 100;
  const capacityColor = capacityPercentage >= 100 ? 'error' : capacityPercentage >= 80 ? 'warning' : 'success';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
              {classData.className}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Grade {classData.grade === 'K' ? 'Kindergarten' : classData.grade}
            </Typography>
          </Box>
          <Chip
            label={classData.status}
            color={classData.status === 'active' ? 'success' : 'default'}
          />
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Teacher Information */}
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'start', gap: 1.5 }}>
              <PersonIcon sx={{ color: '#1976d2', mt: 0.5 }} />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Teacher
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {classData.teacher}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Room Number */}
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'start', gap: 1.5 }}>
              <RoomIcon sx={{ color: '#1976d2', mt: 0.5 }} />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Room Number
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {classData.room}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Student Count */}
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'start', gap: 1.5 }}>
              <PeopleIcon sx={{ color: '#1976d2', mt: 0.5 }} />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Class Size
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {classData.studentCount} / {classData.maxCapacity} students
                  </Typography>
                  <Chip
                    size="small"
                    label={`${Math.round(capacityPercentage)}%`}
                    color={capacityColor}
                    variant="outlined"
                  />
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* School Year */}
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'start', gap: 1.5 }}>
              <CalendarTodayIcon sx={{ color: '#1976d2', mt: 0.5 }} />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  School Year
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {classData.schoolYear}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Schedule */}
          {classData.schedule && (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'start', gap: 1.5 }}>
                <ScheduleIcon sx={{ color: '#1976d2', mt: 0.5 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Schedule
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {classData.schedule}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          )}

          {/* Subjects */}
          {classData.subjects && classData.subjects.length > 0 && (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'start', gap: 1.5 }}>
                <MenuBookIcon sx={{ color: '#1976d2', mt: 0.5 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Subjects ({classData.subjects.length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {classData.subjects.map((subject: string) => (
                      <Chip
                        key={subject}
                        label={subject}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            </Grid>
          )}

          {/* Notes */}
          {classData.notes && (
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Notes
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {classData.notes}
              </Typography>
            </Grid>
          )}

          {/* Quick Stats */}
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
              Quick Stats
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
                  <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>
                    {classData.studentCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Students
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.50', borderRadius: 1 }}>
                  <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                    {classData.maxCapacity - classData.studentCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Available
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
                  <Typography variant="h6" sx={{ color: 'info.main', fontWeight: 'bold' }}>
                    {classData.subjects?.length || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Subjects
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.50', borderRadius: 1 }}>
                  <Typography variant="h6" sx={{ color: 'warning.main', fontWeight: 'bold' }}>
                    {Math.round(capacityPercentage)}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Capacity
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} startIcon={<CloseIcon />}>
          Close
        </Button>
        <Button onClick={onEdit} variant="contained" startIcon={<EditIcon />}>
          Edit Class
        </Button>
      </DialogActions>
    </Dialog>
  );
}
