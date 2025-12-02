import { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { AlertTriangle, TrendingUp, TrendingDown, ShieldAlert } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

export default function BehaviorTracking() {
  const [isIncidentDialogOpen, setIsIncidentDialogOpen] = useState(false);

  const behaviorReports = [
    {
      id: 1,
      student: 'Devorah Klein',
      grade: '3rd Grade',
      incident: 'Talking during class',
      date: '2024-11-25',
      severity: 'minor',
      action: 'Verbal warning',
      trend: 'improving'
    },
    {
      id: 2,
      student: 'Chaya Friedman',
      grade: '5th Grade',
      incident: 'Incomplete homework',
      date: '2024-11-24',
      severity: 'minor',
      action: 'Parent notification',
      trend: 'stable'
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'major':
        return 'bg-red-100 text-red-800';
      case 'moderate':
        return 'bg-orange-100 text-orange-800';
      case 'minor':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">Behavior Tracking</h2>
          <p className="text-sm text-gray-600">Monitor and track student behavior incidents</p>
        </div>
        <Dialog open={isIncidentDialogOpen} onOpenChange={setIsIncidentDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <AlertTriangle className="size-4 mr-2" />
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
                <Button className="flex-1 bg-orange-600 hover:bg-orange-700">
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Incidents</p>
                <p className="text-gray-900">8</p>
              </div>
              <AlertTriangle className="size-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">This Week</p>
                <p className="text-gray-900">2</p>
              </div>
              <TrendingDown className="size-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Improving</p>
                <p className="text-gray-900">5</p>
              </div>
              <TrendingUp className="size-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {behaviorReports.map((report) => (
          <Card key={report.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-gray-900">{report.student}</h3>
                    <Badge variant="outline">{report.grade}</Badge>
                    <Badge className={getSeverityColor(report.severity)}>
                      {report.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700 mb-1">{report.incident}</p>
                  <p className="text-sm text-gray-600">Action taken: {report.action}</p>
                  <p className="text-xs text-gray-500 mt-2">{report.date}</p>
                </div>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
