import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { FileText, Send, Download } from 'lucide-react';

export default function ReportCards() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Report Cards</h1>
        <p className="text-gray-600">Create, manage, and distribute student report cards</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="size-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="size-6 text-blue-700" />
            </div>
            <CardTitle>Create Report Cards</CardTitle>
            <CardDescription>Generate new report cards for students</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Create New</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="size-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Send className="size-6 text-green-700" />
            </div>
            <CardTitle>Distribute Reports</CardTitle>
            <CardDescription>Send report cards to parents via email</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-green-700 hover:bg-green-800">Send Reports</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="size-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Download className="size-6 text-purple-700" />
            </div>
            <CardTitle>Download Reports</CardTitle>
            <CardDescription>Export report cards as PDF files</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-purple-700 hover:bg-purple-800">Download</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Report Cards</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">No report cards created yet.</p>
        </CardContent>
      </Card>
    </div>
  );
}
