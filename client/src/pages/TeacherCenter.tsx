import { useState } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
} from '@mui/material';
import ClassIcon from '@mui/icons-material/Class';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MyClasses from '../components/teacher/MyClasses';
import TeacherAttendance from '../components/teacher/TeacherAttendance';
import TeacherReportCards from '../components/teacher/TeacherReportCards';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`teacher-tabpanel-${index}`}
      aria-labelledby={`teacher-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

// Mock logged-in teacher - replace with actual auth
const currentTeacher = {
  id: 't2',
  name: 'Mrs. Rachel Cohen',
  email: 'rcohen@nby.edu',
};

export default function TeacherCenter() {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 0.5 }}>
          Teacher Center
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Welcome, {currentTeacher.name}
        </Typography>
      </Box>

      {/* Tabs Navigation */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: 64,
              textTransform: 'none',
              fontSize: '1rem',
            },
          }}
        >
          <Tab
            icon={<ClassIcon />}
            iconPosition="start"
            label="My Classes"
            id="teacher-tab-0"
            aria-controls="teacher-tabpanel-0"
          />
          <Tab
            icon={<CheckCircleIcon />}
            iconPosition="start"
            label="Attendance"
            id="teacher-tab-1"
            aria-controls="teacher-tabpanel-1"
          />
          <Tab
            icon={<AssignmentIcon />}
            iconPosition="start"
            label="Report Cards"
            id="teacher-tab-2"
            aria-controls="teacher-tabpanel-2"
          />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        <MyClasses teacherId={currentTeacher.id} />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <TeacherAttendance teacherId={currentTeacher.id} />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <TeacherReportCards teacherId={currentTeacher.id} />
      </TabPanel>
    </Box>
  );
}

