
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, Search, Calendar, Users } from "lucide-react";
import AccountCreation from "@/components/AccountCreation";
import AccountSearch from "@/components/AccountSearch";
import BookingDetails from "@/components/BookingDetails";

const Index = () => {
  const [activeTab, setActiveTab] = useState("search");
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [showAccountDetails, setShowAccountDetails] = useState(false);

  const handleAccountCreated = (action: 'close' | 'book', accountData?: any) => {
    if (action === 'close') {
      setShowAccountDetails(true);
      setActiveTab("search"); // Show account details in search section
    } else if (action === 'book') {
      setSelectedAccount(accountData?.companyName || 'New Account');
      setActiveTab("booking");
    }
  };

  const handleAccountSelected = (accountName: string) => {
    setSelectedAccount(accountName);
    setActiveTab("booking");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <Building className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Qgo CRM Dashboard</h1>
          </div>
          <p className="text-gray-600">Manage corporate accounts and travel bookings efficiently</p>
        </div>

        {/* Main CRM Interface */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-xl">Salesforce CRM Integration</CardTitle>
            <CardDescription className="text-blue-100">
              Corporate Account & Travel Booking Management
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-50 rounded-none border-b">
                <TabsTrigger value="search" className="flex items-center gap-2 py-3">
                  <Search className="h-4 w-4" />
                  Account Search
                </TabsTrigger>
                <TabsTrigger value="create" className="flex items-center gap-2 py-3">
                  <Building className="h-4 w-4" />
                  Create Account
                </TabsTrigger>
                <TabsTrigger value="booking" className="flex items-center gap-2 py-3">
                  <Calendar className="h-4 w-4" />
                  Booking Details
                </TabsTrigger>
              </TabsList>

              <div className="p-6">
                <TabsContent value="search" className="mt-0">
                  <AccountSearch 
                    onAccountSelected={handleAccountSelected}
                    showAccountDetails={showAccountDetails}
                    onResetView={() => setShowAccountDetails(false)}
                  />
                </TabsContent>
                
                <TabsContent value="create" className="mt-0">
                  <AccountCreation onAccountCreated={handleAccountCreated} />
                </TabsContent>
                
                <TabsContent value="booking" className="mt-0">
                  <BookingDetails 
                    selectedAccount={selectedAccount}
                    onSearchAccount={() => setActiveTab("search")}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Active Accounts</p>
                  <p className="text-2xl font-bold">247</p>
                </div>
                <Users className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Pending Bookings</p>
                  <p className="text-2xl font-bold">18</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">This Month</p>
                  <p className="text-2xl font-bold">₹2.4M</p>
                </div>
                <Building className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Documents</p>
                  <p className="text-2xl font-bold">1,432</p>
                </div>
                <Search className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
