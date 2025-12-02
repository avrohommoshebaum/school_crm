import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { Link } from 'react-router';
import {
  AlertTriangle,
  Users,
  FileText,
  Flag,
  MessageSquareText,
  ShieldAlert,
  Plus,
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export default function PrincipalCenter() {
  const location = useLocation();
  const navigate = useNavigate();
  const isMainPage = location.pathname === '/principal';
  const [isIncidentDialogOpen, setIsIncidentDialogOpen] = useState(false);

  // Mock data for overview
  const stats = [
    { name: 'Active Logs', value: '24', icon: MessageSquareText, color: 'bg-blue-100 text-blue-700', change: '+3 today' },
    { name: 'Flagged Students', value: '12', icon: Flag, color: 'bg-orange-100 text-orange-700', change: '2 urgent' },
    { name: 'Scheduled Meetings', value: '8', icon: Users, color: 'bg-purple-100 text-purple-700', change: '3 this week' },
    { name: 'Pending Reviews', value: '6', icon: AlertTriangle, color: 'bg-red-100 text-red-700', change: 'Needs attention' },
  ];

  const recentActivity = [
    { id: 1, type: 'log', title: 'Parent meeting with Mrs. Cohen', student: 'Sarah Cohen', time: '2 hours ago', priority: 'normal' },
    { id: 2, type: 'flag', title: 'Student flagged for academic support', student: 'Rivka Goldstein', time: '3 hours ago', priority: 'high' },
    { id: 3, type: 'meeting', title: 'Follow-up meeting scheduled', student: 'Leah Schwartz', time: '5 hours ago', priority: 'normal' },
    { id: 4, type: 'behavior', title: 'Behavior concern noted', student: 'Chaya Friedman', time: '1 day ago', priority: 'urgent' },
  ];

  const urgentFlags = [
    { student: 'Miriam Levy', grade: '2nd Grade', issue: 'Academic - Math struggles', flaggedDate: '2024-11-20', priority: 'urgent' },
    { student: 'Devorah Klein', grade: '3rd Grade', issue: 'Behavior - Classroom disruption', flaggedDate: '2024-11-21', priority: 'urgent' },
  ];

  return (
    <div className="space-y-6">
      {isMainPage ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-gray-900 mb-2">Principal Center</h1>
              <p className="text-gray-600">Student tracking, logs, and administrative oversight</p>
            </div>
            <div className="flex items-center gap-3">
              <Dialog open={isIncidentDialogOpen} onOpenChange={setIsIncidentDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-red-600 hover:bg-red-700">
                    <ShieldAlert className="size-4 mr-2" />
                    Report Incident
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Report Incident</DialogTitle>
                    <DialogDescription>
                      Document a student incident for administrative tracking and follow-up
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    {/* Student Selection */}
                    <div className="space-y-2">
                      <Label>Student Involved *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select student" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Sarah Cohen - 1st Grade</SelectItem>
                          <SelectItem value="2">Rivka Goldstein - 2nd Grade</SelectItem>
                          <SelectItem value="3">Leah Schwartz - 3rd Grade</SelectItem>
                          <SelectItem value="4">Chaya Friedman - 4th Grade</SelectItem>
                          <SelectItem value="5">Miriam Levy - 2nd Grade</SelectItem>
                          <SelectItem value="6">Devorah Klein - 3rd Grade</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Date and Time */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Date of Incident *</Label>
                        <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                      </div>
                      <div className="space-y-2">
                        <Label>Time of Incident *</Label>
                        <Input type="time" />
                      </div>
                    </div>

                    {/* Incident Type */}
                    <div className="space-y-2">
                      <Label>Incident Type *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select incident type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="behavioral">Behavioral Issue</SelectItem>
                          <SelectItem value="academic">Academic Concern</SelectItem>
                          <SelectItem value="safety">Safety Issue</SelectItem>
                          <SelectItem value="medical">Medical Emergency</SelectItem>
                          <SelectItem value="bullying">Bullying/Harassment</SelectItem>
                          <SelectItem value="property">Property Damage</SelectItem>
                          <SelectItem value="attendance">Attendance Issue</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Severity Level */}
                    <div className="space-y-2">
                      <Label>Severity Level *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minor">Minor - Warning needed</SelectItem>
                          <SelectItem value="moderate">Moderate - Intervention required</SelectItem>
                          <SelectItem value="serious">Serious - Immediate action needed</SelectItem>
                          <SelectItem value="critical">Critical - Emergency response</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                      <Label>Location *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Where did this occur?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="classroom">Classroom</SelectItem>
                          <SelectItem value="hallway">Hallway</SelectItem>
                          <SelectItem value="cafeteria">Cafeteria</SelectItem>
                          <SelectItem value="playground">Playground/Outdoor</SelectItem>
                          <SelectItem value="bathroom">Bathroom</SelectItem>
                          <SelectItem value="gym">Gymnasium</SelectItem>
                          <SelectItem value="library">Library</SelectItem>
                          <SelectItem value="office">Office</SelectItem>
                          <SelectItem value="bus">School Bus</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Staff Witness */}
                    <div className="space-y-2">
                      <Label>Reporting Staff Member *</Label>
                      <Input placeholder="Your name or ID" />
                    </div>

                    {/* Other Students Involved */}
                    <div className="space-y-2">
                      <Label>Other Students Involved</Label>
                      <Input placeholder="Names of any other students involved" />
                    </div>

                    {/* Incident Description */}
                    <div className="space-y-2">
                      <Label>Detailed Description *</Label>
                      <Textarea 
                        placeholder="Provide a detailed description of what happened, including any relevant context..."
                        rows={5}
                      />
                    </div>

                    {/* Actions Taken */}
                    <div className="space-y-2">
                      <Label>Immediate Actions Taken *</Label>
                      <Textarea 
                        placeholder="Describe what actions were taken immediately following the incident..."
                        rows={3}
                      />
                    </div>

                    {/* Parent Notification */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Parent Notified?</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes - Parent contacted</SelectItem>
                            <SelectItem value="pending">Pending - Will contact</SelectItem>
                            <SelectItem value="no">No - Not necessary</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Follow-up Required?</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes - Schedule follow-up</SelectItem>
                            <SelectItem value="monitoring">Yes - Continue monitoring</SelectItem>
                            <SelectItem value="meeting">Yes - Parent meeting needed</SelectItem>
                            <SelectItem value="no">No - Resolved</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Witnesses */}
                    <div className="space-y-2">
                      <Label>Witnesses</Label>
                      <Input placeholder="Names of any witnesses (staff or students)" />
                    </div>

                    {/* Additional Notes */}
                    <div className="space-y-2">
                      <Label>Additional Notes/Comments</Label>
                      <Textarea 
                        placeholder="Any additional information that may be relevant..."
                        rows={3}
                      />
                    </div>

                    {/* Checkboxes */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="flagStudent" className="size-4" />
                        <Label htmlFor="flagStudent">Flag student for additional monitoring</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="adminReview" className="size-4" />
                        <Label htmlFor="adminReview">Request administrative review</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="counselorReferral" className="size-4" />
                        <Label htmlFor="counselorReferral">Refer to counselor/therapist</Label>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4">
                      <Button className="flex-1 bg-red-600 hover:bg-red-700">
                        <ShieldAlert className="size-4 mr-2" />
                        Submit Incident Report
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1" 
                        onClick={() => setIsIncidentDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Badge variant="default" className="bg-purple-700">
                Principal Access
              </Badge>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.name}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`${stat.color} size-12 rounded-lg flex items-center justify-center`}>
                        <Icon className="size-6" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{stat.name}</p>
                    <p className="text-gray-900 mb-1">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.change}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <Card className="lg:col-span-2">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-900">Recent Activity</h3>
                  <Link to="/principal/student-logs" className="text-sm text-blue-700 hover:text-blue-800">
                    View All
                  </Link>
                </div>
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm text-gray-900">{activity.title}</p>
                          {activity.priority === 'urgent' && (
                            <Badge variant="destructive" className="text-xs">Urgent</Badge>
                          )}
                          {activity.priority === 'high' && (
                            <Badge className="text-xs bg-orange-100 text-orange-800">High Priority</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{activity.student}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Urgent Flags */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-900">Urgent Flags</h3>
                  <Badge variant="destructive">{urgentFlags.length}</Badge>
                </div>
                <div className="space-y-3">
                  {urgentFlags.map((flag, index) => (
                    <div
                      key={index}
                      className="p-4 bg-red-50 border border-red-200 rounded-lg cursor-pointer hover:bg-red-100 transition-colors"
                      onClick={() => navigate('/principal/flagged-students')}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <AlertTriangle className="size-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 mb-1">{flag.student}</p>
                          <p className="text-xs text-gray-600 mb-1">{flag.grade}</p>
                          <p className="text-xs text-red-700">{flag.issue}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">Flagged: {flag.flaggedDate}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button 
                  onClick={() => navigate('/principal/student-logs')}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <MessageSquareText className="size-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-700">Add Log Entry</p>
                </button>
                <button 
                  onClick={() => navigate('/principal/flagged-students')}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
                >
                  <Flag className="size-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-700">Flag Student</p>
                </button>
                <button 
                  onClick={() => navigate('/principal/parent-meetings')}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
                >
                  <Users className="size-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-700">Schedule Meeting</p>
                </button>
                <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
                  <FileText className="size-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-700">Generate Report</p>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Outlet />
      )}
    </div>
  );
}
