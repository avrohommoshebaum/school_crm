import { useState, useRef, useEffect } from 'react';
import { Mail, Send, Search, Upload, X, FileText, Image as ImageIcon, File, Bold, Italic, List, AlertCircle, Clock, ChevronDown, ChevronUp, ListOrdered, Underline, Paperclip } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Switch } from '../../components/ui/switch';

interface AttachedFile {
  id: string;
  file: File;
  preview?: string;
}

export default function SendEmail() {
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
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

  // Save selection before button click
  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      savedSelectionRef.current = selection.getRangeAt(0);
    }
  };

  // Restore selection after button click
  const restoreSelection = () => {
    if (savedSelectionRef.current && emailEditorRef.current) {
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(savedSelectionRef.current);
      emailEditorRef.current.focus();
    }
  };

  // Check active formatting
  const updateActiveFormats = () => {
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      unorderedList: document.queryCommandState('insertUnorderedList'),
      orderedList: document.queryCommandState('insertOrderedList')
    });
  };

  useEffect(() => {
    const editor = emailEditorRef.current;
    if (editor) {
      editor.addEventListener('keyup', updateActiveFormats);
      editor.addEventListener('mouseup', updateActiveFormats);
      return () => {
        editor.removeEventListener('keyup', updateActiveFormats);
        editor.removeEventListener('mouseup', updateActiveFormats);
      };
    }
  }, []);

  const applyFormatting = (command: string, value?: string) => {
    restoreSelection();
    
    if (command === 'insertUnorderedList' || command === 'insertOrderedList') {
      const selection = window.getSelection();
      const hasSelection = selection && selection.toString().length > 0;
      
      if (hasSelection) {
        document.execCommand(command, false, value);
      } else {
        const listTag = command === 'insertUnorderedList' ? 'ul' : 'ol';
        const listItem = document.createElement('li');
        listItem.innerHTML = '<br>';
        
        const list = document.createElement(listTag);
        list.appendChild(listItem);
        
        if (savedSelectionRef.current) {
          savedSelectionRef.current.insertNode(list);
          const range = document.createRange();
          range.setStart(listItem, 0);
          range.collapse(true);
          selection?.removeAllRanges();
          selection?.addRange(range);
          savedSelectionRef.current = range;
        }
      }
    } else {
      document.execCommand(command, false, value);
    }
    
    updateActiveFormats();
    saveSelection();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
  };

  const addFiles = (files: File[]) => {
    const newFiles = files.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }));
    setAttachedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const handleSend = () => {
    if (selectedGroups.length === 0) {
      alert('Please select at least one group.');
      return;
    }

    if (!emailSubject.trim()) {
      alert('Please enter an email subject.');
      return;
    }

    const emailContent = emailEditorRef.current?.innerHTML || '';
    if (!emailContent.trim() || emailContent === '<br>') {
      alert('Please enter your email message.');
      return;
    }

    console.log('Sending email:', {
      groups: selectedGroups,
      subject: emailSubject,
      content: emailContent,
      cc: ccRecipients,
      bcc: bccRecipients,
      priority: emailPriority,
      attachments: attachedFiles,
      scheduled: showSchedule ? { date: scheduleDate, time: scheduleTime } : null
    });

    alert('Email sent successfully!');
    
    // Reset form
    setSelectedGroups([]);
    setEmailSubject('');
    if (emailEditorRef.current) {
      emailEditorRef.current.innerHTML = '';
    }
    setCcRecipients('');
    setBccRecipients('');
    setShowCcBcc(false);
    setEmailPriority('normal');
    setAttachedFiles([]);
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

        {/* Email Composition */}
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
                  className="text-xs sm:text-sm text-gray-600 hover:text-gray-700 h-auto p-0"
                >
                  <ChevronDown className={`size-3 mr-1 transition-transform ${showCcBcc ? 'rotate-180' : ''}`} />
                  {showCcBcc ? 'Hide' : 'Add'} CC/BCC
                </Button>
                
                {showCcBcc && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-2 border-l-2 border-gray-200">
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

              {/* Rich Text Formatting Toolbar */}
              <div className="space-y-2">
                <Label className="text-sm md:text-base">Message</Label>
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 border-b p-2 flex flex-wrap gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onMouseDown={(e) => { e.preventDefault(); saveSelection(); }}
                      onClick={() => applyFormatting('bold')}
                      className={`size-8 p-0 ${activeFormats.bold ? 'bg-blue-100 shadow-inner ring-1 ring-blue-300' : ''}`}
                      title="Bold"
                    >
                      <Bold className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onMouseDown={(e) => { e.preventDefault(); saveSelection(); }}
                      onClick={() => applyFormatting('italic')}
                      className={`size-8 p-0 ${activeFormats.italic ? 'bg-blue-100 shadow-inner ring-1 ring-blue-300' : ''}`}
                      title="Italic"
                    >
                      <Italic className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onMouseDown={(e) => { e.preventDefault(); saveSelection(); }}
                      onClick={() => applyFormatting('underline')}
                      className={`size-8 p-0 ${activeFormats.underline ? 'bg-blue-100 shadow-inner ring-1 ring-blue-300' : ''}`}
                      title="Underline"
                    >
                      <Underline className="size-4" />
                    </Button>
                    <div className="w-px bg-gray-300 mx-1" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onMouseDown={(e) => { e.preventDefault(); saveSelection(); }}
                      onClick={() => applyFormatting('insertUnorderedList')}
                      className={`size-8 p-0 ${activeFormats.unorderedList ? 'bg-blue-100 shadow-inner ring-1 ring-blue-300' : ''}`}
                      title="Bullet List"
                    >
                      <List className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onMouseDown={(e) => { e.preventDefault(); saveSelection(); }}
                      onClick={() => applyFormatting('insertOrderedList')}
                      className={`size-8 p-0 ${activeFormats.orderedList ? 'bg-blue-100 shadow-inner ring-1 ring-blue-300' : ''}`}
                      title="Numbered List"
                    >
                      <ListOrdered className="size-4" />
                    </Button>
                  </div>
                  <div
                    ref={emailEditorRef}
                    contentEditable
                    className="min-h-[200px] p-3 md:p-4 focus:outline-none text-sm md:text-base"
                    onInput={updateActiveFormats}
                    onMouseUp={() => { saveSelection(); updateActiveFormats(); }}
                    onKeyUp={() => { saveSelection(); updateActiveFormats(); }}
                    suppressContentEditableWarning
                  />
                </div>
              </div>

              {/* File Attachments */}
              <div className="space-y-2">
                <Label className="text-sm md:text-base">Attachments</Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                    isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Paperclip className="size-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-2">
                    Drag and drop files here, or click to browse
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="size-4 mr-2" />
                    Choose Files
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </div>

                {attachedFiles.length > 0 && (
                  <div className="space-y-2">
                    {attachedFiles.map((attached) => (
                      <div
                        key={attached.id}
                        className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border"
                      >
                        {attached.preview ? (
                          <ImageIcon className="size-4 text-blue-600" />
                        ) : attached.file.type.includes('pdf') ? (
                          <FileText className="size-4 text-red-600" />
                        ) : (
                          <File className="size-4 text-gray-600" />
                        )}
                        <span className="text-sm flex-1 truncate">{attached.file.name}</span>
                        <span className="text-xs text-gray-500">
                          {(attached.file.size / 1024).toFixed(1)} KB
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(attached.id)}
                          className="size-6 p-0"
                        >
                          <X className="size-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Send Button */}
            <div className="flex justify-end pt-4 border-t">
              <Button onClick={handleSend} size="lg" className="w-full sm:w-auto">
                <Send className="size-4 mr-2" />
                {showSchedule && scheduleDate && scheduleTime ? 'Schedule Email' : 'Send Email'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
