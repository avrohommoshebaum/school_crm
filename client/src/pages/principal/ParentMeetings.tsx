import { useState } from 'react';
import { Calendar, Plus, Clock, User, CheckCircle, XCircle, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

export default function ParentMeetings() {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const meetings = [
    {
      id: 1,
      student: 'Sarah Cohen',
      grade: '3rd Grade',
      parent: 'Mrs. Rivka Cohen',
      date: '2024-12-01',
      time: '2:30 PM',
      purpose: 'Discuss reading progress and tutoring updates',
      status: 'scheduled',
      location: 'Principal Office',
      notes: 'Follow-up from previous quarter discussion'
    },
    {
      id: 2,
      student: 'Leah Schwartz',
      grade: '4th Grade',
      parent: 'Mrs. Schwartz',
      date: '2024-12-03',
      time: '3:00 PM',
      purpose: 'General check-in meeting',
      status: 'scheduled',
      location: 'Conference Room',
      notes: ''
    },
    {
      id: 3,
      student: 'Miriam Levy',
      grade: '2nd Grade',
      parent: 'Mrs. Levy',
      date: '2024-11-25',
      time: '1:30 PM',
      purpose: 'Math support discussion',
      status: 'completed',
      location: 'Principal Office',
      notes: 'Parents agreed to math tutor, follow-up in 2 weeks'
    },
  ];

  const filteredMeetings = meetings.filter(meeting => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return meeting.status === 'scheduled';
    if (filter === 'completed') return meeting.status === 'completed';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">Parent Meetings</h2>
          <p className="text-sm text-gray-600">Schedule and track parent-teacher conferences</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="size-4 mr-2" />
              Schedule Meeting
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Schedule Parent Meeting</DialogTitle>
              <DialogDescription>
                Schedule a meeting with parents to discuss student progress and concerns
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Student *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Sarah Cohen - 3rd Grade</SelectItem>
                    <SelectItem value="2">Rivka Goldstein - 3rd Grade</SelectItem>
                    <SelectItem value="3">Leah Schwartz - 4th Grade</SelectItem>
                    <SelectItem value="4">Chaya Friedman - 5th Grade</SelectItem>
                    <SelectItem value="5">Miriam Levy - 2nd Grade</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Parent/Guardian Name *</Label>
                  <Input placeholder="Mrs. Cohen" />
                </div>
                <div className="space-y-2">
                  <Label>Parent Phone</Label>
                  <Input type="tel" placeholder="(732) 555-0000" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Meeting Date *</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Meeting Time *</Label>
                  <Input type="time" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Duration</Label>
                <Select defaultValue="30">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Location *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="principal-office">Principal Office</SelectItem>
                    <SelectItem value="conference-room">Conference Room</SelectItem>
                    <SelectItem value="classroom">Classroom</SelectItem>
                    <SelectItem value="virtual">Virtual Meeting</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Meeting Purpose/Agenda *</Label>
                <Textarea 
                  placeholder="What will be discussed in this meeting? (e.g., Academic progress, behavior concerns, general check-in, etc.)"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Attendees</Label>
                <Input placeholder="Who else will attend? (e.g., teacher, counselor, therapist)" />
              </div>

              <div className="space-y-2">
                <Label>Preparation Notes</Label>
                <Textarea 
                  placeholder="Notes to prepare for the meeting, materials needed, etc."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="sendReminder" className="size-4" />
                  <Label htmlFor="sendReminder">Send email reminder to parents</Label>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="addToCalendar" className="size-4" />
                  <Label htmlFor="addToCalendar">Add to school calendar</Label>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
                  <Calendar className="size-4 mr-2" />
                  Schedule Meeting
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          All Meetings
        </Button>
        <Button
          variant={filter === 'upcoming' ? 'default' : 'outline'}
          onClick={() => setFilter('upcoming')}
        >
          Upcoming
        </Button>
        <Button
          variant={filter === 'completed' ? 'default' : 'outline'}
          onClick={() => setFilter('completed')}
        >
          Completed
        </Button>
      </div>

      {/* Meetings List */}
      <div className="space-y-4">
        {filteredMeetings.map((meeting) => (
          <Card key={meeting.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-gray-900">{meeting.student}</h3>
                    <Badge variant="outline">{meeting.grade}</Badge>
                    {meeting.status === 'scheduled' ? (
                      <Badge className="bg-green-100 text-green-800">
                        <Clock className="size-3 mr-1" />
                        Scheduled
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">
                        <CheckCircle className="size-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <User className="size-4" />
                        {meeting.parent}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="size-4" />
                        {meeting.date} at {meeting.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="size-4" />
                        {meeting.location}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{meeting.purpose}</p>
                    {meeting.notes && (
                      <p className="text-sm text-gray-600 italic">Notes: {meeting.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  {meeting.status === 'scheduled' && (
                    <Button variant="outline" size="sm">
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
