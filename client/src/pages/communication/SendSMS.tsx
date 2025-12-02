import { useState } from 'react';
import { MessageSquare, Send, Search, Smartphone, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Checkbox } from '../../components/ui/checkbox';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';

export default function SendSMS() {
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [groupSearch, setGroupSearch] = useState('');
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  // Mock groups data
  const groups = [
    { id: '1', name: 'All Parents', count: 450, category: 'general' },
    { id: '2', name: 'Grade 1 Parents', count: 45, category: 'grade' },
    { id: '3', name: 'Grade 2 Parents', count: 48, category: 'grade' },
    { id: '4', name: 'Teachers', count: 25, category: 'staff' },
    { id: '5', name: 'Administration', count: 8, category: 'staff' },
  ];

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(groupSearch.toLowerCase())
  );

  const charCount = message.length;
  const maxChars = 160;
  const smsSegments = Math.ceil(charCount / maxChars) || 1;

  const handleSend = () => {
    if (selectedGroups.length === 0) {
      alert('Please select at least one group.');
      return;
    }

    if (!message.trim()) {
      alert('Please enter a message.');
      return;
    }

    console.log('Sending SMS:', {
      groups: selectedGroups,
      message: message,
      segments: smsSegments,
      scheduled: showSchedule ? { date: scheduleDate, time: scheduleTime } : null
    });

    alert('SMS sent successfully via Twilio!');
    
    // Reset form
    setSelectedGroups([]);
    setMessage('');
    setShowSchedule(false);
    setScheduleDate('');
    setScheduleTime('');
  };

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Group Selection */}
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div>
              <Label className="text-sm md:text-base mb-2 block">Select Recipients</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  placeholder="Search groups..."
                  value={groupSearch}
                  onChange={(e) => setGroupSearch(e.target.value)}
                  className="pl-9 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filteredGroups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center justify-between p-2.5 sm:p-3 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
                >
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <Checkbox
                      id={`group-${group.id}`}
                      checked={selectedGroups.includes(group.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedGroups([...selectedGroups, group.id]);
                        } else {
                          setSelectedGroups(selectedGroups.filter(id => id !== group.id));
                        }
                      }}
                    />
                    <Label
                      htmlFor={`group-${group.id}`}
                      className="text-xs sm:text-sm cursor-pointer truncate"
                    >
                      {group.name}
                    </Label>
                  </div>
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {group.count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SMS Composition */}
        <Card className="lg:col-span-2">
          <CardContent className="space-y-4 md:space-y-6 pt-6">
            {/* Selected Groups Display */}
            {selectedGroups.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm md:text-base">Selected Groups</Label>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 p-2.5 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  {groups
                    .filter(g => selectedGroups.includes(g.id))
                    .map(group => (
                      <Badge key={group.id} variant="default" className="text-xs sm:text-sm">
                        {group.name} ({group.count})
                      </Badge>
                    ))}
                </div>
              </div>
            )}

            {/* SMS Message */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm md:text-base">Message</Label>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className={charCount > maxChars ? 'text-orange-600' : ''}>
                    {charCount}/{maxChars}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {smsSegments} {smsSegments === 1 ? 'segment' : 'segments'}
                  </Badge>
                </div>
              </div>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your SMS message here..."
                className="min-h-[200px] text-sm md:text-base resize-none"
              />
              {charCount > maxChars && (
                <Alert>
                  <AlertCircle className="size-4" />
                  <AlertDescription className="text-xs">
                    Messages over 160 characters will be sent as multiple segments and may incur additional charges.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Schedule Send */}
            <div className="space-y-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowSchedule(!showSchedule)}
                className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 h-auto p-0"
              >
                <Clock className="size-3 mr-1" />
                {showSchedule ? 'Cancel' : 'Schedule'} Send
              </Button>
              
              {showSchedule && (
                <div className="flex flex-col sm:flex-row gap-2 pl-2 border-l-2 border-gray-200">
                  <div className="flex-1">
                    <Label className="text-xs text-gray-600">Date</Label>
                    <Input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="text-sm mt-1"
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs text-gray-600">Time</Label>
                    <Input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="text-sm mt-1"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Send Button */}
            <div className="flex justify-end pt-4 border-t">
              <Button onClick={handleSend} size="lg" className="w-full sm:w-auto">
                <Smartphone className="size-4 mr-2" />
                {showSchedule && scheduleDate && scheduleTime ? 'Schedule SMS' : 'Send SMS'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
