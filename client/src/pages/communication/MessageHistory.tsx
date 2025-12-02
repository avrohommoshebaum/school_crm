import { Mail, MessageSquare, Phone, Hash } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

export default function MessageHistory() {
  const recentMessages = [
    { id: 1, type: 'email', subject: 'Monthly Tuition Reminder', date: '2024-11-24', recipients: 487, status: 'sent', sentVia: 'Web' },
    { id: 2, type: 'sms', subject: 'Early Dismissal Tomorrow', date: '2024-11-23', recipients: 487, status: 'sent', sentVia: 'PIN: 1001' },
    { id: 3, type: 'call', subject: 'Snow Day Announcement', date: '2024-11-20', recipients: 487, status: 'completed', sentVia: 'PIN: 1001' },
    { id: 4, type: 'email', subject: 'Parent-Teacher Conference', date: '2024-11-18', recipients: 487, status: 'sent', sentVia: 'Web' },
    { id: 5, type: 'sms', subject: 'Bus Route Change Notice', date: '2024-11-15', recipients: 35, status: 'sent', sentVia: 'PIN: 3001' },
    { id: 6, type: 'email', subject: 'Chanukah Program Invitation', date: '2024-11-12', recipients: 487, status: 'sent', sentVia: 'Web' },
    { id: 7, type: 'call', subject: 'Emergency School Closure', date: '2024-11-10', recipients: 487, status: 'completed', sentVia: 'Web' },
    { id: 8, type: 'sms', subject: 'Lunch Menu Update', date: '2024-11-08', recipients: 487, status: 'sent', sentVia: 'Web' },
    { id: 9, type: 'email', subject: 'Field Trip Permission Forms', date: '2024-11-05', recipients: 142, status: 'sent', sentVia: 'Web' },
    { id: 10, type: 'call', subject: 'School Delay Announcement', date: '2024-11-03', recipients: 487, status: 'completed', sentVia: 'PIN: 1001' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Message History</h1>
        <p className="text-gray-600">View all sent communications</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Messages</CardTitle>
          <CardDescription>Complete history of sent emails, SMS, and robocalls</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentMessages.map((msg) => (
              <div
                key={msg.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="size-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                    {msg.type === 'email' && <Mail className="size-5 text-blue-700" />}
                    {msg.type === 'sms' && <MessageSquare className="size-5 text-blue-700" />}
                    {msg.type === 'call' && <Phone className="size-5 text-blue-700" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-900 truncate">{msg.subject}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm text-gray-500">
                        {msg.date} • {msg.recipients} recipients
                      </p>
                      {msg.sentVia.startsWith('PIN') && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded flex items-center gap-1">
                          <Hash className="size-3" />
                          {msg.sentVia}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:justify-end flex-wrap">
                  <Badge 
                    variant={msg.status === 'sent' || msg.status === 'completed' ? 'default' : 'secondary'}
                    className="shrink-0"
                  >
                    {msg.status}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className="shrink-0 capitalize"
                  >
                    {msg.type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
