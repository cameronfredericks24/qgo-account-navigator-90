import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Building, Mail, Phone, MapPin, Calendar, ArrowLeft } from "lucide-react";

interface Account {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  industry: string;
  lastActivity: string;
  status: 'active' | 'inactive' | 'pending';
  totalBookings: number;
}

interface AccountSearchProps {
  onAccountSelected: (accountName: string) => void;
  showAccountDetails?: boolean;
  onResetView?: () => void;
}

const AccountSearch = ({ onAccountSelected, showAccountDetails, onResetView }: AccountSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Mock data for demonstration
  const mockAccounts: Account[] = [
    {
      id: '1',
      companyName: 'TechCorp Solutions',
      contactPerson: 'Rajesh Kumar',
      email: 'rajesh@techcorp.com',
      phone: '+91 98765 43210',
      industry: 'Technology',
      lastActivity: '2024-01-15',
      status: 'active',
      totalBookings: 24
    },
    {
      id: '2',
      companyName: 'Global Finance Ltd',
      contactPerson: 'Priya Sharma',
      email: 'priya@globalfinance.com',
      phone: '+91 87654 32109',
      industry: 'Finance',
      lastActivity: '2024-01-10',
      status: 'active',
      totalBookings: 18
    },
    {
      id: '3',
      companyName: 'HealthCare Plus',
      contactPerson: 'Dr. Amit Patel',
      email: 'amit@healthcareplus.com',
      phone: '+91 76543 21098',
      industry: 'Healthcare',
      lastActivity: '2023-12-20',
      status: 'inactive',
      totalBookings: 12
    },
    {
      id: '4',
      companyName: 'Manufacturing Excellence',
      contactPerson: 'Sunita Reddy',
      email: 'sunita@manufexcel.com',
      phone: '+91 65432 10987',
      industry: 'Manufacturing',
      lastActivity: '2024-01-12',
      status: 'pending',
      totalBookings: 8
    }
  ];

  const filteredAccounts = mockAccounts.filter(account => {
    const matchesSearch = 
      account.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesIndustry = industryFilter === 'all' || account.industry.toLowerCase() === industryFilter;
    const matchesStatus = statusFilter === 'all' || account.status === statusFilter;
    
    return matchesSearch && matchesIndustry && matchesStatus;
  });

  const sortedAccounts = filteredAccounts.sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.companyName.localeCompare(b.companyName);
      case 'activity':
        return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
      case 'bookings':
        return b.totalBookings - a.totalBookings;
      default:
        return 0;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleNewBooking = (account: Account) => {
    onAccountSelected(account.companyName);
  };

  if (showAccountDetails) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={onResetView}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Account Created Successfully!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-800 mb-2">New Corporate Account</h3>
              <p className="text-green-700">
                The account has been successfully created and added to your Salesforce CRM. 
                You can now search for this account or create bookings for this company.
              </p>
              <div className="mt-4">
                <Button 
                  onClick={() => onAccountSelected('New Account')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Create Booking for This Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Search className="h-5 w-5 text-blue-600" />
        <h2 className="text-2xl font-semibold text-gray-900">Search Corporate Accounts</h2>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Accounts</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Company name, contact, email..."
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Industry</Label>
              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Company Name</SelectItem>
                  <SelectItem value="activity">Last Activity</SelectItem>
                  <SelectItem value="bookings">Total Bookings</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>
            Search Results ({sortedAccounts.length} accounts found)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedAccounts.map((account) => (
              <Card key={account.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Building className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          {account.companyName}
                        </h3>
                        <Badge className={getStatusColor(account.status)}>
                          {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4" />
                          <div>
                            <p className="font-medium">{account.contactPerson}</p>
                            <p>{account.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="h-4 w-4" />
                          <p>{account.phone}</p>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Building className="h-4 w-4" />
                          <p>{account.industry}</p>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <div>
                            <p className="font-medium">{account.totalBookings} bookings</p>
                            <p>Last: {account.lastActivity}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleNewBooking(account)}
                      >
                        New Booking
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {sortedAccounts.length === 0 && (
              <div className="text-center py-8">
                <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No accounts found</h3>
                <p className="text-gray-500">
                  Try adjusting your search criteria or create a new corporate account.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountSearch;
