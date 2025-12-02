import { FileText, Download, Calendar } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

export default function FinancialReports() {
  const reports = [
    { name: 'Monthly Tuition Summary', description: 'Overview of all tuition payments for the month', lastGenerated: '2024-11-01' },
    { name: 'Outstanding Balances Report', description: 'List of families with past-due balances', lastGenerated: '2024-11-25' },
    { name: 'Donation Summary (YTD)', description: 'Year-to-date donation summary by fund', lastGenerated: '2024-11-20' },
    { name: 'Transportation Revenue', description: 'Bus fee collection and route analysis', lastGenerated: '2024-11-15' },
    { name: 'Tax Receipt Report', description: 'Donation tax receipts for the year', lastGenerated: '2024-11-10' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-gray-900 mb-2">Financial Reports</h2>
        <p className="text-gray-600">Generate and download financial reports</p>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="size-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="size-6 text-blue-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-900 mb-1">{report.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                    <Calendar className="size-3" />
                    <span>Last generated: {report.lastGenerated}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <FileText className="size-3 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Download className="size-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Custom Report Generator */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-gray-900 mb-4">Custom Report Generator</h3>
          <p className="text-sm text-gray-600 mb-4">Generate custom reports with specific date ranges and filters</p>
          <Button className="bg-blue-700 hover:bg-blue-800">
            <FileText className="size-4 mr-2" />
            Create Custom Report
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
