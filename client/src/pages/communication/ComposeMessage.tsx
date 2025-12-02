import { useState, useRef, useEffect } from 'react';
import { Mail, MessageSquare, Phone, Send, Search, Mic, Upload, PhoneCall, Volume2, Smartphone, Hash, Square, Play, Paperclip, X, FileText, Image as ImageIcon, File, Bold, Italic, Link as LinkIcon, List, AlertCircle, Clock, ChevronDown, ChevronUp, ListOrdered, Underline } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Checkbox } from '../../components/ui/checkbox';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Switch } from '../../components/ui/switch';

interface AttachedFile {
  id: string;
  file: File;
  preview?: string;
}

export default function ComposeMessage() {
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [messageType, setMessageType] = useState<'email' | 'sms' | 'call'>('email');
  const [message, setMessage] = useState('');
  const [recordingMethod, setRecordingMethod] = useState<'text-to-speech' | 'call-to-record' | 'device-record' | 'saved-file'>('text-to-speech');
  const [selectedAudioFile, setSelectedAudioFile] = useState('');
  const [groupSearch, setGroupSearch] = useState('');
  
  // Email-specific states
  const [emailSubject, setEmailSubject] = useState('');
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [ccRecipients, setCcRecipients] = useState('');
  const [bccRecipients, setBccRecipients] = useState('');
  const [emailPriority, setEmailPriority] = useState<'normal' | 'high'>('normal');
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emailEditorRef = useRef<HTMLDivElement>(null);
  const savedSelectionRef = useRef<Range | null>(null);
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    unorderedList: false,
    orderedList: false
  });
  
  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const groups = [
    { id: '1', name: 'All Parents', count: 487, description: 'All parent contacts', pin: '1001' },
    { id: '2', name: '1st Grade Parents', count: 65, description: 'Parents of 1st grade students', pin: '1234' },
    { id: '3', name: '2nd Grade Parents', count: 72, description: 'Parents of 2nd grade students', pin: '1235' },
    { id: '4', name: '3rd Grade Parents', count: 68, description: 'Parents of 3rd grade students', pin: '1236' },
    { id: '5', name: '4th Grade Parents', count: 71, description: 'Parents of 4th grade students', pin: '1237' },
    { id: '6', name: '5th Grade Parents', count: 69, description: 'Parents of 5th grade students', pin: '1238' },
    { id: '7', name: '6th Grade Parents', count: 70, description: 'Parents of 6th grade students', pin: '1239' },
    { id: '8', name: '7th Grade Parents', count: 72, description: 'Parents of 7th grade students', pin: '1240' },
    { id: '9', name: 'Staff Members', count: 45, description: 'All staff contacts', pin: '2001' },
    { id: '10', name: 'Bus Route 1', count: 35, description: 'Students on bus route 1', pin: '3001' },
  ];

  const handleSendMessage = () => {
    // Check for empty message (handle both plain text and HTML)
    const messageContent = messageType === 'email' 
      ? emailEditorRef.current?.textContent?.trim() || ''
      : message.trim();
    
    if (!messageContent || selectedGroups.length === 0) {
      alert('Please select at least one group and enter a message.');
      return;
    }

    if (messageType === 'email' && !emailSubject.trim()) {
      alert('Please enter an email subject.');
      return;
    }

    // TODO: Integrate with Twilio API for SMS/calls and email service
    const emailData = messageType === 'email' ? {
      subject: emailSubject,
      message: message, // HTML content
      cc: ccRecipients,
      bcc: bccRecipients,
      priority: emailPriority,
      attachments: attachedFiles.map(f => f.file.name),
      scheduledFor: showSchedule && scheduleDate && scheduleTime 
        ? `${scheduleDate} ${scheduleTime}` 
        : null
    } : { message };

    console.log('Sending message:', { 
      messageType, 
      selectedGroups,
      ...emailData
    });
    
    alert(
      showSchedule && scheduleDate && scheduleTime
        ? `Message scheduled for ${scheduleDate} at ${scheduleTime} to ${selectedGroups.length} group(s)!`
        : `Message sent to ${selectedGroups.length} group(s)!`
    );
    
    // Reset form
    setMessage('');
    if (emailEditorRef.current) {
      emailEditorRef.current.innerHTML = '';
    }
    setEmailSubject('');
    setCcRecipients('');
    setBccRecipients('');
    setEmailPriority('normal');
    setAttachedFiles([]);
    setShowSchedule(false);
    setScheduleDate('');
    setScheduleTime('');
    setSelectedGroups([]);
  };

  const toggleGroup = (groupId: string) => {
    setSelectedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const getTotalRecipients = () => {
    return groups
      .filter(g => selectedGroups.includes(g.id))
      .reduce((sum, g) => sum + g.count, 0);
  };

  // Timer for recording
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 120) { // Max 2 minutes
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
    
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isRecording, isPaused]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      // Cleanup file previews
      attachedFiles.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [audioUrl, attachedFiles]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Start recording
  const startRecording = async () => {
    // Check if browser supports mediaDevices
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Your browser does not support audio recording. Please use a modern browser like Chrome, Firefox, or Safari.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (error: any) {
      console.error('Error accessing microphone:', error);
      
      let errorMessage = 'Unable to access microphone. ';
      
      if (error.name === 'NotFoundError') {
        errorMessage += 'No microphone was found on this device. Please connect a microphone and try again, or use "Call to Record" or "Use Saved Audio File" instead.';
      } else if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage += 'Microphone access was denied. Please allow microphone access in your browser settings and try again.';
      } else if (error.name === 'NotReadableError') {
        errorMessage += 'Your microphone is already in use by another application. Please close other apps using the microphone and try again.';
      } else {
        errorMessage += 'Please check your device settings and try again, or use "Call to Record" or "Use Saved Audio File" instead.';
      }
      
      alert(errorMessage);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  };

  // Play recorded audio
  const playRecording = () => {
    if (audioUrl) {
      if (!audioPlayerRef.current) {
        audioPlayerRef.current = new Audio(audioUrl);
        audioPlayerRef.current.onended = () => {
          setIsPlaying(false);
        };
      }
      
      if (isPlaying) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.currentTime = 0;
        setIsPlaying(false);
      } else {
        audioPlayerRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  // Clear recording
  const clearRecording = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setIsPlaying(false);
    setRecordingTime(0);
    audioChunksRef.current = [];
  };

  // File attachment handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      addFiles(Array.from(files));
    }
  };

  const addFiles = (files: File[]) => {
    const newFiles: AttachedFile[] = files.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }));
    setAttachedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setAttachedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return ImageIcon;
    if (file.type.includes('pdf')) return FileText;
    return File;
  };

  // Update active formatting state
  const updateActiveFormats = () => {
    if (messageType !== 'email') return;
    
    try {
      setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        unorderedList: document.queryCommandState('insertUnorderedList'),
        orderedList: document.queryCommandState('insertOrderedList')
      });
    } catch (e) {
      // queryCommandState can throw errors in some browsers
    }
  };

  // Save selection when editor loses focus
  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      savedSelectionRef.current = selection.getRangeAt(0);
    }
    updateActiveFormats();
  };

  // Restore selection before applying formatting
  const restoreSelection = () => {
    if (savedSelectionRef.current && emailEditorRef.current) {
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(savedSelectionRef.current);
      emailEditorRef.current.focus();
    }
  };

  // Insert list manually
  const insertList = (ordered: boolean) => {
    if (!emailEditorRef.current) return;
    
    emailEditorRef.current.focus();
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      // No selection, insert at the end
      const listElement = document.createElement(ordered ? 'ol' : 'ul');
      const listItem = document.createElement('li');
      listItem.innerHTML = '<br>'; // Empty list item
      listElement.appendChild(listItem);
      emailEditorRef.current.appendChild(listElement);
      
      // Place cursor in the list item
      const range = document.createRange();
      range.setStart(listItem, 0);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      // Try execCommand first
      const command = ordered ? 'insertOrderedList' : 'insertUnorderedList';
      document.execCommand(command, false, undefined);
    }
    
    // Update state
    setMessage(emailEditorRef.current.innerHTML);
    saveSelection();
  };

  // Rich text formatting functions
  const applyFormatting = (command: string, value?: string) => {
    if (messageType !== 'email') return;
    
    if (!emailEditorRef.current) return;
    
    // Restore the selection first
    restoreSelection();
    
    // Execute the command
    document.execCommand(command, false, value);
    
    // Save the new selection
    saveSelection();
    
    // Update the message state
    setMessage(emailEditorRef.current.innerHTML);
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      applyFormatting('createLink', url);
    }
  };

  const handleEditorInput = (e: React.FormEvent<HTMLDivElement>) => {
    if (messageType === 'email') {
      setMessage(e.currentTarget.innerHTML);
    }
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(groupSearch.toLowerCase()) ||
    group.description.toLowerCase().includes(groupSearch.toLowerCase())
  );

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Compose Message</h1>
        <p className="text-gray-600">Send emails, SMS messages, and robocalls to selected groups</p>
      </div>

      {/* Quick Send via Text Alert - Show only for SMS and Calls */}
      {(messageType === 'sms' || messageType === 'call') && selectedGroups.length > 0 && (
        <Alert className="bg-blue-50 border-blue-200">
          <Smartphone className="size-4 text-blue-700" />
          <AlertDescription className="text-sm">
            <p className="text-blue-900 mb-2">
              <strong>Quick Send:</strong> Text <strong className="font-mono">+1 (833) 000-0000</strong> with PIN + your message
            </p>
            <div className="flex flex-wrap gap-2 mb-2">
              {groups
                .filter(g => selectedGroups.includes(g.id))
                .map(group => (
                  <span key={group.id} className="inline-flex items-center gap-1.5 text-xs bg-white px-2 py-1 rounded border border-blue-200">
                    <Hash className="size-3 text-blue-600" />
                    <span className="font-mono text-blue-900">{group.pin}</span>
                    <span className="text-gray-400">→</span>
                    <span className="text-gray-700">{group.name}</span>
                  </span>
                ))}
            </div>
            <p className="text-xs text-gray-600 font-mono bg-white px-2 py-1 rounded border border-blue-200 inline-block">
              Example: {groups.find(g => selectedGroups.includes(g.id))?.pin} School closes early today at 2pm
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Message Type Selection - Mobile First */}
      <div className="lg:hidden">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Message Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <Button
                variant={messageType === 'email' ? 'default' : 'outline'}
                onClick={() => setMessageType('email')}
                className="flex flex-col items-center gap-1.5 h-auto py-3 sm:py-4"
              >
                <Mail className="size-5 sm:size-6" />
                <span className="text-xs sm:text-sm">Email</span>
              </Button>
              <Button
                variant={messageType === 'sms' ? 'default' : 'outline'}
                onClick={() => setMessageType('sms')}
                className="flex flex-col items-center gap-1.5 h-auto py-3 sm:py-4"
              >
                <MessageSquare className="size-5 sm:size-6" />
                <span className="text-xs sm:text-sm">SMS</span>
              </Button>
              <Button
                variant={messageType === 'call' ? 'default' : 'outline'}
                onClick={() => setMessageType('call')}
                className="flex flex-col items-center gap-1.5 h-auto py-3 sm:py-4"
              >
                <Phone className="size-5 sm:size-6" />
                <span className="text-xs sm:text-sm">Call</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Message Composition */}
        <Card className="lg:col-span-2">
          <CardContent className="space-y-4 md:space-y-6 pt-6">
            {/* Message Type Selection - Desktop */}
            <div className="space-y-2 hidden lg:block">
              <Label>Message Type</Label>
              <div className="grid grid-cols-3 gap-4">
                <Button
                  variant={messageType === 'email' ? 'default' : 'outline'}
                  onClick={() => setMessageType('email')}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                >
                  <Mail className="size-6" />
                  <span>Email</span>
                </Button>
                <Button
                  variant={messageType === 'sms' ? 'default' : 'outline'}
                  onClick={() => setMessageType('sms')}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                >
                  <MessageSquare className="size-6" />
                  <span>SMS</span>
                </Button>
                <Button
                  variant={messageType === 'call' ? 'default' : 'outline'}
                  onClick={() => setMessageType('call')}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                >
                  <Phone className="size-6" />
                  <span>Robocall</span>
                </Button>
              </div>
            </div>

            {/* Selected Groups Display */}
            {selectedGroups.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm md:text-base">Selected Groups</Label>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 p-2.5 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  {groups
                    .filter(g => selectedGroups.includes(g.id))
                    .map(group => (
                      <Badge 
                        key={group.id} 
                        className="bg-blue-600 text-white hover:bg-blue-700 cursor-pointer text-xs sm:text-sm py-1 px-2 sm:px-2.5"
                        onClick={() => toggleGroup(group.id)}
                      >
                        <span className="max-w-[150px] sm:max-w-none truncate">
                          {group.name} ({group.count})
                        </span>
                        <span className="ml-1.5 sm:ml-2">×</span>
                      </Badge>
                    ))}
                </div>
              </div>
            )}

            {/* Robocall Recording Method */}
            {messageType === 'call' && (
              <div className="space-y-3">
                <Label>Recording Method</Label>
                <div className="grid grid-cols-1 gap-3">
                  {/* Text to Speech */}
                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      recordingMethod === 'text-to-speech'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => setRecordingMethod('text-to-speech')}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        checked={recordingMethod === 'text-to-speech'}
                        onChange={() => setRecordingMethod('text-to-speech')}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Volume2 className="size-5 text-blue-600" />
                          <p className="text-gray-900">Text-to-Speech</p>
                        </div>
                        <p className="text-sm text-gray-600">
                          Type your message and it will be converted to speech automatically
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Call Me to Record */}
                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      recordingMethod === 'call-to-record'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => setRecordingMethod('call-to-record')}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        checked={recordingMethod === 'call-to-record'}
                        onChange={() => setRecordingMethod('call-to-record')}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <PhoneCall className="size-5 text-green-600" />
                          <p className="text-gray-900">Call Me to Record</p>
                        </div>
                        <p className="text-sm text-gray-600">
                          Receive a call and record your message over the phone
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Record on Device */}
                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      recordingMethod === 'device-record'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => setRecordingMethod('device-record')}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        checked={recordingMethod === 'device-record'}
                        onChange={() => setRecordingMethod('device-record')}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Mic className="size-5 text-purple-600" />
                          <p className="text-gray-900">Record on Device</p>
                        </div>
                        <p className="text-sm text-gray-600">
                          Use your device's microphone to record the message now
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Use Saved File */}
                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      recordingMethod === 'saved-file'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => setRecordingMethod('saved-file')}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        checked={recordingMethod === 'saved-file'}
                        onChange={() => setRecordingMethod('saved-file')}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Upload className="size-5 text-orange-600" />
                          <p className="text-gray-900">Use Saved Audio File</p>
                        </div>
                        <p className="text-sm text-gray-600">
                          Select from previously recorded or uploaded audio files
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Call to Record - Phone Number Input */}
            {messageType === 'call' && recordingMethod === 'call-to-record' && (
              <div className="space-y-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <Label>Your Phone Number</Label>
                <Input 
                  type="tel" 
                  placeholder="(555) 123-4567" 
                  className="bg-white"
                />
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <PhoneCall className="size-4 mr-2" />
                  Call Me Now to Record
                </Button>
                <p className="text-xs text-gray-600">
                  You'll receive a call within 30 seconds. Follow the prompts to record your message.
                </p>
              </div>
            )}

            {/* Device Recording Interface */}
            {messageType === 'call' && recordingMethod === 'device-record' && (
              <div className="space-y-3 p-3 sm:p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <Label className="text-xs sm:text-sm">Voice Recording</Label>
                  <Badge 
                    variant="outline" 
                    className={`text-xs font-mono ${isRecording ? 'bg-red-100 border-red-300 text-red-700' : ''}`}
                  >
                    {formatTime(recordingTime)}
                  </Badge>
                </div>

                <Alert className="bg-blue-50 border-blue-200">
                  <AlertDescription className="text-xs text-blue-900">
                    <strong>Note:</strong> A microphone is required for this option. If you don't have a microphone, please use "Call to Record" or "Use Saved Audio File" instead.
                  </AlertDescription>
                </Alert>
                
                {!audioUrl ? (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      className={`w-full sm:flex-1 h-9 text-sm ${
                        isRecording 
                          ? 'bg-red-600 hover:bg-red-700' 
                          : 'bg-purple-600 hover:bg-purple-700'
                      }`}
                      onClick={isRecording ? stopRecording : startRecording}
                    >
                      {isRecording ? (
                        <>
                          <Square className="size-3 sm:size-4 mr-2" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="size-3 sm:size-4 mr-2" />
                          Start Recording
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Alert className="bg-green-50 border-green-200">
                      <AlertDescription className="text-xs sm:text-sm text-green-900">
                        ✓ Recording saved ({formatTime(recordingTime)})
                      </AlertDescription>
                    </Alert>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1 h-9 text-sm"
                        onClick={playRecording}
                      >
                        {isPlaying ? (
                          <>
                            <Square className="size-3 sm:size-4 mr-2" />
                            Stop Playback
                          </>
                        ) : (
                          <>
                            <Play className="size-3 sm:size-4 mr-2" />
                            Play Recording
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1 sm:flex-none h-9 text-sm"
                        onClick={clearRecording}
                      >
                        Re-record
                      </Button>
                    </div>
                  </div>
                )}
                
                <p className="text-xs text-gray-600">
                  {!audioUrl 
                    ? 'Click "Start Recording" and speak your message. Maximum duration: 2 minutes.'
                    : 'Preview your recording or re-record if needed.'
                  }
                </p>
              </div>
            )}

            {/* Saved Audio File Selection */}
            {messageType === 'call' && recordingMethod === 'saved-file' && (
              <div className="space-y-3 p-3 sm:p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <Label className="text-xs sm:text-sm">Select Audio File</Label>
                <select 
                  className="w-full p-2 border rounded-md bg-white text-sm"
                  value={selectedAudioFile}
                  onChange={(e) => setSelectedAudioFile(e.target.value)}
                >
                  <option value="">Choose a saved audio file...</option>
                  <option value="1">Snow Day Announcement - Nov 20, 2024</option>
                  <option value="2">Early Dismissal Message - Nov 15, 2024</option>
                  <option value="3">Holiday Greeting - Nov 10, 2024</option>
                  <option value="4">Emergency Closure - Nov 5, 2024</option>
                </select>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  {selectedAudioFile && (
                    <Button variant="outline" className="flex-1 h-9 text-sm">
                      <Volume2 className="size-3 sm:size-4 mr-2" />
                      <span className="hidden sm:inline">Preview Audio</span>
                      <span className="sm:hidden">Preview</span>
                    </Button>
                  )}
                  <Button variant="outline" className={`h-9 text-sm ${selectedAudioFile ? 'flex-1 sm:flex-none' : 'w-full'}`}>
                    <Upload className="size-3 sm:size-4 mr-2" />
                    <span className="hidden sm:inline">Upload New File</span>
                    <span className="sm:hidden">Upload File</span>
                  </Button>
                </div>
                
                <p className="text-xs text-gray-600">
                  Supported formats: MP3, WAV, M4A. Maximum file size: 10MB.
                </p>
              </div>
            )}

            {/* Email-Specific Fields */}
            {messageType === 'email' && (
              <div className="space-y-3">
                {/* Subject Line */}
                <div className="space-y-2">
                  <Label className="text-sm md:text-base">Subject</Label>
                  <Input
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Enter email subject..."
                    className="text-sm md:text-base"
                  />
                </div>

                {/* CC/BCC Toggle and Fields */}
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCcBcc(!showCcBcc)}
                    className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 h-auto p-0"
                  >
                    {showCcBcc ? <ChevronUp className="size-3 mr-1" /> : <ChevronDown className="size-3 mr-1" />}
                    {showCcBcc ? 'Hide' : 'Add'} CC/BCC
                  </Button>
                  
                  {showCcBcc && (
                    <div className="space-y-2 pl-2 border-l-2 border-gray-200">
                      <div>
                        <Label className="text-xs sm:text-sm text-gray-600">CC (Optional)</Label>
                        <Input
                          value={ccRecipients}
                          onChange={(e) => setCcRecipients(e.target.value)}
                          placeholder="email@example.com, another@example.com"
                          className="text-sm mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs sm:text-sm text-gray-600">BCC (Optional)</Label>
                        <Input
                          value={bccRecipients}
                          onChange={(e) => setBccRecipients(e.target.value)}
                          placeholder="email@example.com, another@example.com"
                          className="text-sm mt-1"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Priority Flag */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="size-4 text-orange-600" />
                    <Label className="text-sm cursor-pointer">Mark as High Priority</Label>
                  </div>
                  <Switch
                    checked={emailPriority === 'high'}
                    onCheckedChange={(checked) => setEmailPriority(checked ? 'high' : 'normal')}
                  />
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
              </div>
            )}

            {/* Message Content - Text to Speech Only */}
            {messageType !== 'call' || recordingMethod === 'text-to-speech' ? (
              <div className="space-y-2">
                <Label className="text-sm md:text-base">Message</Label>
                
                {/* Rich Text Formatting Toolbar - Email Only */}
                {messageType === 'email' && (
                  <div className="flex flex-wrap gap-1 p-2 bg-gray-50 rounded-t-lg border border-b-0">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className={`h-8 w-8 p-0 transition-all ${activeFormats.bold ? 'bg-blue-100 shadow-md' : ''}`}
                      title="Bold"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        applyFormatting('bold');
                      }}
                    >
                      <Bold className={`size-4 ${activeFormats.bold ? 'text-blue-600' : ''}`} />
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className={`h-8 w-8 p-0 transition-all ${activeFormats.italic ? 'bg-blue-100 shadow-md' : ''}`}
                      title="Italic"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        applyFormatting('italic');
                      }}
                    >
                      <Italic className={`size-4 ${activeFormats.italic ? 'text-blue-600' : ''}`} />
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className={`h-8 w-8 p-0 transition-all ${activeFormats.underline ? 'bg-blue-100 shadow-md' : ''}`}
                      title="Underline"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        applyFormatting('underline');
                      }}
                    >
                      <Underline className={`size-4 ${activeFormats.underline ? 'text-blue-600' : ''}`} />
                    </Button>
                    <div className="w-px bg-gray-300 mx-1" />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className={`h-8 w-8 p-0 transition-all ${activeFormats.unorderedList ? 'bg-blue-100 shadow-md' : ''}`}
                      title="Bullet List"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        insertList(false);
                      }}
                    >
                      <List className={`size-4 ${activeFormats.unorderedList ? 'text-blue-600' : ''}`} />
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className={`h-8 w-8 p-0 transition-all ${activeFormats.orderedList ? 'bg-blue-100 shadow-md' : ''}`}
                      title="Numbered List"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        insertList(true);
                      }}
                    >
                      <ListOrdered className={`size-4 ${activeFormats.orderedList ? 'text-blue-600' : ''}`} />
                    </Button>
                    <div className="w-px bg-gray-300 mx-1" />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0" 
                      title="Insert Link"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        insertLink();
                      }}
                    >
                      <LinkIcon className="size-4" />
                    </Button>
                    <div className="w-px bg-gray-300 mx-1" />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-2 text-xs" 
                      onClick={() => fileInputRef.current?.click()}
                      title="Attach Files"
                    >
                      <Paperclip className="size-4 mr-1" />
                      <span className="hidden sm:inline">Attach</span>
                    </Button>
                  </div>
                )}
                
                {/* Email uses contentEditable, others use textarea */}
                {messageType === 'email' ? (
                  <div className="relative">
                    <div
                      ref={emailEditorRef}
                      contentEditable
                      onInput={handleEditorInput}
                      onBlur={saveSelection}
                      onMouseUp={saveSelection}
                      onKeyUp={saveSelection}
                      className="min-h-[200px] p-3 border rounded-b-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-y-auto"
                      style={{ whiteSpace: 'pre-wrap' }}
                      suppressContentEditableWarning
                      data-placeholder="Type your email message here... Use the toolbar above to format text."
                    />
                    <style>{`
                      [contenteditable][data-placeholder]:empty:before {
                        content: attr(data-placeholder);
                        color: #9ca3af;
                        pointer-events: none;
                        position: absolute;
                      }
                      [contenteditable] a {
                        color: #2563eb;
                        text-decoration: underline;
                      }
                      [contenteditable] ul,
                      [contenteditable] ol {
                        margin: 0.5em 0;
                        padding-left: 2em;
                      }
                      [contenteditable] ul {
                        list-style-type: disc;
                      }
                      [contenteditable] ol {
                        list-style-type: decimal;
                      }
                      [contenteditable] li {
                        margin: 0.25em 0;
                      }
                    `}</style>
                  </div>
                ) : (
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={
                      messageType === 'call'
                        ? 'Enter the message to be read in the robocall...'
                        : 'Enter your SMS message (160 characters recommended)...'
                    }
                    rows={messageType === 'sms' ? 6 : 8}
                    className="resize-none text-sm md:text-base"
                  />
                )}
                {messageType === 'sms' && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs sm:text-sm text-gray-500">
                      Character count: {message.length}
                    </p>
                    {message.length > 160 && (
                      <p className="text-xs sm:text-sm text-orange-600">
                        Multiple messages ({Math.ceil(message.length / 160)})
                      </p>
                    )}
                  </div>
                )}

                {/* File Attachments Display - Email Only */}
                {messageType === 'email' && (
                  <>
                    {/* Hidden File Input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif"
                    />

                    {/* Attached Files List - Only show when files exist */}
                    {attachedFiles.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs sm:text-sm text-gray-600">
                            Attached Files ({attachedFiles.length})
                          </Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            className="h-auto py-1 px-2 text-xs text-blue-600"
                          >
                            <Paperclip className="size-3 mr-1" />
                            Add More
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {attachedFiles.map((attachedFile) => {
                            const FileIcon = getFileIcon(attachedFile.file);
                            return (
                              <div
                                key={attachedFile.id}
                                className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border group"
                              >
                                {attachedFile.preview ? (
                                  <img
                                    src={attachedFile.preview}
                                    alt={attachedFile.file.name}
                                    className="size-10 object-cover rounded flex-shrink-0"
                                  />
                                ) : (
                                  <div className="size-10 flex items-center justify-center bg-gray-200 rounded flex-shrink-0">
                                    <FileIcon className="size-5 text-gray-600" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs sm:text-sm text-gray-900 truncate">
                                    {attachedFile.file.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {formatFileSize(attachedFile.file.size)}
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(attachedFile.id)}
                                  className="h-auto p-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                >
                                  <X className="size-4 text-gray-600" />
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : null}

            {/* Send Button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 pt-4 border-t">
              <div>
                <p className="text-sm md:text-base text-gray-600">
                  Recipients: <span className="text-gray-900">{getTotalRecipients()}</span>
                </p>
                <p className="text-xs sm:text-sm text-gray-500">
                  {selectedGroups.length} group{selectedGroups.length !== 1 ? 's' : ''} selected
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                {messageType === 'email' && attachedFiles.length > 0 && (
                  <Badge variant="outline" className="justify-center sm:self-center">
                    <Paperclip className="size-3 mr-1" />
                    {attachedFiles.length} file{attachedFiles.length !== 1 ? 's' : ''}
                  </Badge>
                )}
                <Button
                  onClick={handleSendMessage}
                  disabled={
                    !message.trim() || 
                    selectedGroups.length === 0 || 
                    (messageType === 'email' && !emailSubject.trim())
                  }
                  className="bg-blue-700 hover:bg-blue-800 w-full sm:w-auto"
                >
                  {showSchedule && scheduleDate && scheduleTime ? (
                    <>
                      <Clock className="size-4 mr-2" />
                      <span className="hidden sm:inline">Schedule {messageType === 'email' ? 'Email' : messageType === 'sms' ? 'SMS' : 'Robocall'}</span>
                      <span className="sm:hidden">Schedule</span>
                    </>
                  ) : (
                    <>
                      <Send className="size-4 mr-2" />
                      <span className="hidden sm:inline">
                        Send {messageType === 'email' ? 'Email' : messageType === 'sms' ? 'SMS' : 'Robocall'}
                      </span>
                      <span className="sm:hidden">
                        Send {messageType === 'email' ? 'Email' : messageType === 'sms' ? 'SMS' : 'Call'}
                      </span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Group Selection */}
        <Card>
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="text-lg md:text-xl">Select Recipients</CardTitle>
            <CardDescription className="text-sm">Choose groups to send message to</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input 
                placeholder="Search groups..." 
                className="pl-10 text-sm md:text-base h-10 md:h-auto"
                value={groupSearch}
                onChange={(e) => setGroupSearch(e.target.value)}
              />
            </div>

            {filteredGroups.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No groups found matching "{groupSearch}"</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] md:max-h-96 overflow-y-auto">
                {filteredGroups.map((group) => (
                  <div
                    key={group.id}
                    className={`flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedGroups.includes(group.id)
                        ? 'bg-blue-50 border-blue-300'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => toggleGroup(group.id)}
                  >
                    <Checkbox
                      checked={selectedGroups.includes(group.id)}
                      onCheckedChange={() => toggleGroup(group.id)}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <p className="text-sm md:text-base text-gray-900 truncate">{group.name}</p>
                          {(messageType === 'sms' || messageType === 'call') && (
                            <span className="font-mono text-xs text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                              #{group.pin}
                            </span>
                          )}
                        </div>
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {group.count}
                        </Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 sm:line-clamp-1">{group.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
