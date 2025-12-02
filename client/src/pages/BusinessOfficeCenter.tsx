import { Outlet, useLocation, useNavigate } from 'react-router';
import { Link } from 'react-router';
import {
  DollarSign,
  CreditCard,
  Heart,
  Bus,
  TrendingUp,
  Users,
  Calendar,
  FileText,
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

export default function BusinessOfficeCenter() {
  const location = useLocation();
  const navigate = useNavigate();
  const isMainPage = location.pathname === '/business-office';

  // Mock data for overview
  const stats = [
    { name: 'Monthly Tuition', value: '$245,680', icon: DollarSign, color: 'bg-green-100 text-green-700', change: '+5% from last month' },
    { name: 'Outstanding Balance', value: '$32,450', icon: TrendingUp, color: 'bg-orange-100 text-orange-700', change: '15 families' },
    { name: 'Donations (YTD)', value: '$89,500', icon: Heart, color: 'bg-purple-100 text-purple-700', change: '45 donors' },
    { name: 'Transportation Fees', value: '$18,200', icon: Bus, color: 'bg-blue-100 text-blue-700', change: '87 students on buses' },
  ];

  const recentTransactions = [
    { id: 1, type: 'tuition', family: 'Cohen Family', amount: '$1,200', date: '2024-11-25', status: 'paid', method: 'Credit Card' },
    { id: 2, type: 'donation', donor: 'Anonymous Donor', amount: '$5,000', date: '2024-11-24', status: 'received', method: 'Check' },
    { id: 3, type: 'tuition', family: 'Goldstein Family', amount: '$1,350', date: '2024-11-23', status: 'paid', method: 'Bank Transfer' },
    { id: 4, type: 'transportation', family: 'Schwartz Family', amount: '$210', date: '2024-11-22', status: 'paid', method: 'Cash' },
  ];

  const upcomingPayments = [
    { family: 'Levy Family', amount: '$1,200', dueDate: '2024-12-01', type: 'Monthly Tuition' },
    { family: 'Friedman Family', amount: '$1,350', dueDate: '2024-12-01', type: 'Monthly Tuition' },
    { family: 'Klein Family', amount: '$180', dueDate: '2024-12-05', type: 'Transportation' },
  ];

  const overdueBalances = [
    { family: 'Berkowitz Family', amount: '$2,400', daysPastDue: 15, type: 'Tuition' },
    { family: 'Rosenberg Family', amount: '$1,800', daysPastDue: 8, type: 'Tuition' },
  ];

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'tuition':
        return <CreditCard className="size-5 text-green-600" />;
      case 'donation':
        return <Heart className="size-5 text-purple-600" />;
      case 'transportation':
        return <Bus className="size-5 text-blue-600" />;
      default:
        return <DollarSign className="size-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {isMainPage ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-gray-900 mb-2">Business Office</h1>
              <p className="text-gray-600">Financial management, tuition, donations, and transportation</p>
            </div>
            <Badge variant="default" className="bg-green-700">
              Business Office Access
            </Badge>
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
            {/* Recent Transactions */}
            <Card className="lg:col-span-2">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-900">Recent Transactions</h3>
                  <Link to="/business-office/tuition" className="text-sm text-green-700 hover:text-green-800">
                    View All
                  </Link>
                </div>
                <div className="space-y-3">
                  {recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        {getTransactionIcon(transaction.type)}
                        <div>
                          <p className="text-sm text-gray-900">
                            {transaction.type === 'donation' ? transaction.donor : transaction.family}
                          </p>
                          <p className="text-xs text-gray-500">{transaction.date} • {transaction.method}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-900">{transaction.amount}</p>
                        <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Overdue Balances */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-900">Overdue Balances</h3>
                  <Badge variant="destructive">{overdueBalances.length}</Badge>
                </div>
                <div className="space-y-3">
                  {overdueBalances.map((balance, index) => (
                    <div
                      key={index}
                      className="p-4 bg-red-50 border border-red-200 rounded-lg cursor-pointer hover:bg-red-100 transition-colors"
                      onClick={() => navigate('/business-office/tuition')}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm text-gray-900">{balance.family}</p>
                          <p className="text-xs text-gray-600">{balance.type}</p>
                        </div>
                        <p className="text-sm text-red-700">{balance.amount}</p>
                      </div>
                      <p className="text-xs text-red-600">{balance.daysPastDue} days past due</p>
                    </div>
                  ))}
                  {overdueBalances.length === 0 && (
                    <p className="text-sm text-gray-600 text-center py-4">No overdue balances</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Payments */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-900">Upcoming Payments</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {upcomingPayments.map((payment, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-900">{payment.family}</p>
                      <Calendar className="size-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{payment.type}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-900">{payment.amount}</p>
                      <p className="text-xs text-gray-500">Due: {payment.dueDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button 
                  onClick={() => navigate('/business-office/tuition')}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                >
                  <CreditCard className="size-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-700">Record Payment</p>
                </button>
                <button 
                  onClick={() => navigate('/business-office/donations')}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
                >
                  <Heart className="size-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-700">Log Donation</p>
                </button>
                <button 
                  onClick={() => navigate('/business-office/tuition')}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
                >
                  <Users className="size-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-700">Send Reminder</p>
                </button>
                <button 
                  onClick={() => navigate('/business-office/reports')}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
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
