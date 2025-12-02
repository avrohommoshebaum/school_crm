import { useState, useRef } from 'react';
import { Phone, Send, Search, Mic, Upload, PhoneCall, Volume2, Play, Square, Clock, X } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Checkbox } from '../../components/ui/checkbox';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';

export default function SendRobocall() {
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [groupSearch, setGroupSearch] = useState('');
  const [recordingMethod, setRecordingMethod] = useState<'text-to-speech' | 'call-to-record' | 'device-record' | 'saved-file'>('text-to-speech');
  const [selectedAudioFile, setSelectedAudioFile] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [uploadedAudio, setUploadedAudio] = useState<File | null>(null);

  // Mock groups data
  const groups = [
    { id: '1', name: 'All Parents', count: 450, category: 'general' },
    { id: '2', name: 'Grade 1 Parents', count: 45, category: 'grade' },
    { id: '3', name: 'Grade 2 Parents', count: 48, category: 'grade' },
    { id: '4', name: 'Teachers', count: 25, category: 'staff' },
    { id: '5', name: 'Administration', count: 8, category: 'staff' },
  ];

  const savedAudioFiles = [
    { id: '1', name: 'School Closure Announcement', duration: '0:45' },
    { id: '2', name: 'Early Dismissal Notice', duration: '0:32' },
    { id: '3', name: 'Event Reminder', duration: '1:15' },
  ];

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(groupSearch.toLowerCase())
  );

  const handleStartRecording = () => {
    setIsRecording(true);
    // Simulate recording
    setTimeout(() => {
      setIsRecording(false);
      setHasRecording(true);
    }, 3000);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setHasRecording(true);
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedAudio(file);
    }
  };

  const handleSend = () => {
    if (selectedGroups.length === 0) {
      alert('Please select at least one group.');
      return;
    }

    if (recordingMethod === 'text-to-speech' && !message.trim()) {
      alert('Please enter a message for text-to-speech.');
      return;
    }

    if (recordingMethod === 'saved-file' && !selectedAudioFile && !uploadedAudio) {
      alert('Please select a saved audio file or upload one.');
      return;
    }

    if (recordingMethod === 'device-record' && !hasRecording) {
      alert('Please record your message first.');
      return;
    }

    console.log('Sending robocall:', {
      groups: selectedGroups,
      method: recordingMethod,
      message: recordingMethod === 'text-to-speech' ? message : null,
      audioFile: recordingMethod === 'saved-file' ? selectedAudioFile : null,
      scheduled: showSchedule ? { date: scheduleDate, time: scheduleTime } : null
    });

    alert('Robocall initiated successfully via Twilio!');
    
    // Reset form
    setSelectedGroups([]);
    setMessage('');
    setRecordingMethod('text-to-speech');
    setSelectedAudioFile('');
    setHasRecording(false);
    setUploadedAudio(null);
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

        {/* Robocall Composition */}
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

            {/* Recording Method Selection */}
            <div className="space-y-3">
              <Label className="text-sm md:text-base">Recording Method</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRecordingMethod('text-to-speech')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    recordingMethod === 'text-to-speech'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Volume2 className="size-5 mb-2 text-blue-600" />
                  <div className="text-sm">Text-to-Speech</div>
                  <p className="text-xs text-gray-500 mt-1">AI voice reads your text</p>
                </button>

                <button
                  type="button"
                  onClick={() => setRecordingMethod('call-to-record')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    recordingMethod === 'call-to-record'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <PhoneCall className="size-5 mb-2 text-green-600" />
                  <div className="text-sm">Call to Record</div>
                  <p className="text-xs text-gray-500 mt-1">Record via phone call</p>
                </button>

                <button
                  type="button"
                  onClick={() => setRecordingMethod('device-record')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    recordingMethod === 'device-record'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Mic className="size-5 mb-2 text-red-600" />
                  <div className="text-sm">Record on Device</div>
                  <p className="text-xs text-gray-500 mt-1">Use your microphone</p>
                </button>

                <button
                  type="button"
                  onClick={() => setRecordingMethod('saved-file')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    recordingMethod === 'saved-file'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Upload className="size-5 mb-2 text-purple-600" />
                  <div className="text-sm">Upload Audio File</div>
                  <p className="text-xs text-gray-500 mt-1">Use saved recording</p>
                </button>
              </div>
            </div>

            {/* Text-to-Speech Message */}
            {recordingMethod === 'text-to-speech' && (
              <div className="space-y-2">
                <Label className="text-sm md:text-base">Message</Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here. Our AI voice will read it to recipients..."
                  className="min-h-[150px] text-sm md:text-base resize-none"
                />
                <p className="text-xs text-gray-500">
                  Tip: Speak naturally and include pauses for clarity
                </p>
              </div>
            )}

            {/* Call to Record */}
            {recordingMethod === 'call-to-record' && (
              <Alert>
                <PhoneCall className="size-4" />
                <AlertDescription className="text-sm">
                  <p className="mb-2">To record your message:</p>
                  <ol className="list-decimal ml-4 space-y-1">
                    <li>Click "Call to Record" below</li>
                    <li>We'll call you at your registered number</li>
                    <li>Follow the prompts to record your message</li>
                    <li>Review and approve your recording</li>
                  </ol>
                  <Button className="mt-3" size="sm">
                    <PhoneCall className="size-4 mr-2" />
                    Call to Record
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Device Recording */}
            {recordingMethod === 'device-record' && (
              <div className="space-y-3">
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                  {!isRecording && !hasRecording && (
                    <div className="space-y-3">
                      <Mic className="size-12 mx-auto text-gray-400" />
                      <p className="text-sm text-gray-600">Ready to record</p>
                      <Button onClick={handleStartRecording}>
                        <Mic className="size-4 mr-2" />
                        Start Recording
                      </Button>
                    </div>
                  )}

                  {isRecording && (
                    <div className="space-y-3">
                      <div className="size-12 mx-auto bg-red-500 rounded-full animate-pulse flex items-center justify-center">
                        <Mic className="size-6 text-white" />
                      </div>
                      <p className="text-sm text-red-600">Recording...</p>
                      <Button onClick={handleStopRecording} variant="destructive">
                        <Square className="size-4 mr-2" />
                        Stop Recording
                      </Button>
                    </div>
                  )}

                  {!isRecording && hasRecording && (
                    <div className="space-y-3">
                      <div className="size-12 mx-auto bg-green-500 rounded-full flex items-center justify-center">
                        <Play className="size-6 text-white" />
                      </div>
                      <p className="text-sm text-green-600">Recording saved</p>
                      <div className="flex gap-2 justify-center">
                        <Button variant="outline" size="sm">
                          <Play className="size-4 mr-2" />
                          Preview
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setHasRecording(false)}>
                          <Mic className="size-4 mr-2" />
                          Re-record
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Saved Audio File */}
            {recordingMethod === 'saved-file' && (
              <div className="space-y-3">
                <Label className="text-sm md:text-base">Upload Audio File</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <Upload className="size-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-2">
                    Upload an audio file (MP3, WAV, or M4A)
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => audioInputRef.current?.click()}
                  >
                    <Upload className="size-4 mr-2" />
                    Choose File
                  </Button>
                  <input
                    ref={audioInputRef}
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={handleAudioUpload}
                  />
                </div>

                {uploadedAudio && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <Volume2 className="size-4 text-green-600" />
                    <span className="text-sm flex-1">{uploadedAudio.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setUploadedAudio(null)}
                      className="size-6 p-0"
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-xs text-gray-600">Or select a saved file:</Label>
                  <div className="space-y-2">
                    {savedAudioFiles.map((file) => (
                      <button
                        key={file.id}
                        type="button"
                        onClick={() => setSelectedAudioFile(file.id)}
                        className={`w-full p-3 rounded-lg border text-left transition-all ${
                          selectedAudioFile === file.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Volume2 className="size-4 text-blue-600" />
                            <span className="text-sm">{file.name}</span>
                          </div>
                          <span className="text-xs text-gray-500">{file.duration}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

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
                <Phone className="size-4 mr-2" />
                {showSchedule && scheduleDate && scheduleTime ? 'Schedule Robocall' : 'Send Robocall'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
