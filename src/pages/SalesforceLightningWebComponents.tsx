import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, Users, Plane, FileText, Code, Eye } from "lucide-react";

const SalesforceLightningWebComponents = () => {
  const [selectedComponent, setSelectedComponent] = useState('account-creation');

  const components = [
    {
      id: 'account-creation',
      name: 'Enhanced Account Creation Wizard',
      icon: Building,
      description: 'Complete 4-step wizard for corporate travel account setup',
      features: [
        'Company Identification with address input',
        'Primary contact details with decision maker flag',
        'Travel overview with policy document upload',
        'Flight preferences (airlines, class, red-eye, layover)',
        'Hotel preferences (category, chains, room type, meal)',
        'Visa services (assistance, type, documents)',
        'Ground transport (modes, vendors)',
        'Service agreement with file upload',
        'Employee management with admin contacts'
      ],
      files: ['enhancedAccountCreationWizard.html', 'enhancedAccountCreationWizard.js', 'enhancedAccountCreationWizard.css']
    },
    {
      id: 'account-search',
      name: 'Enhanced Account Search',
      icon: Users,
      description: 'Smart account lookup with creation integration',
      features: [
        'Real-time account search with debouncing',
        'Dropdown with account suggestions',
        'Account selection with pill display',
        'Integration with Account Creation Wizard',
        'Success message handling',
        'Click outside to close functionality'
      ],
      files: ['enhancedAccountSearch.html', 'enhancedAccountSearch.js', 'enhancedAccountSearch.css']
    },
    {
      id: 'booking-wizard',
      name: 'Travel Booking Wizard',
      icon: Plane,
      description: 'Complete travel booking flow with all preferences',
      features: [
        'Account selection step',
        'Booking overview with passenger management',
        'Flight information with return trip handling',
        'Hotel booking with preferences',
        'Visa requirements processing',
        'Ground transport booking',
        'Review and quote generation',
        'Booking confirmation flow'
      ],
      files: ['travelBookingWizard.html', 'travelBookingWizard.js', 'travelBookingWizard.js-meta.xml']
    }
  ];

  const selectedComp = components.find(c => c.id === selectedComponent);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Salesforce Lightning Web Components
        </h1>
        <p className="text-lg text-gray-600">
          Enhanced travel industry LWCs with complete functionality and modern UI/UX
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Component List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Components
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {components.map((component) => {
                const Icon = component.icon;
                return (
                  <div
                    key={component.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedComponent === component.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedComponent(component.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-sm">{component.name}</h3>
                        <p className="text-xs text-gray-600 mt-1">{component.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Component Details */}
        <div className="lg:col-span-2">
          {selectedComp && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <selectedComp.icon className="h-6 w-6 text-blue-600" />
                    <div>
                      <CardTitle>{selectedComp.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{selectedComp.description}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    ✓ Complete
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="features" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="features">Features</TabsTrigger>
                    <TabsTrigger value="files">Files</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="features" className="mt-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900">Implemented Features</h4>
                      <ul className="space-y-2">
                        {selectedComp.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="files" className="mt-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900">Component Files</h4>
                      <div className="space-y-2">
                        {selectedComp.files.map((file, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-mono">{file}</span>
                            <Badge variant="outline" className="ml-auto">
                              {file.endsWith('.html') ? 'Template' : 
                               file.endsWith('.js') ? 'Controller' : 
                               file.endsWith('.css') ? 'Styles' : 'Metadata'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="preview" className="mt-4">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Eye className="h-5 w-5 text-blue-600" />
                        <h4 className="font-semibold">Component Preview</h4>
                      </div>
                      
                      {selectedComponent === 'account-creation' && (
                        <div className="border rounded-lg p-6 bg-gray-50">
                          <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="flex items-center justify-between mb-6">
                              <h2 className="text-2xl font-bold text-gray-900">Corporate Travel Account Setup</h2>
                              <Badge className="bg-blue-100 text-blue-800">Step 1 of 4</Badge>
                            </div>
                            
                            <div className="space-y-6">
                              <div className="border rounded-lg p-4">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                  <Building className="h-5 w-5" />
                                  Company Identification
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium mb-1">Company Name *</label>
                                    <div className="border rounded p-2 bg-gray-50">Enter full legal company name</div>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium mb-1">Business Division *</label>
                                    <div className="border rounded p-2 bg-gray-50">Select business division</div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="border rounded-lg p-4">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                  <Users className="h-5 w-5" />
                                  Primary Contact Information
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium mb-1">First Name *</label>
                                    <div className="border rounded p-2 bg-gray-50">First name</div>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium mb-1">Last Name *</label>
                                    <div className="border rounded p-2 bg-gray-50">Last name</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {selectedComponent === 'account-search' && (
                        <div className="border rounded-lg p-6 bg-gray-50">
                          <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h3 className="text-lg font-semibold mb-4">Enhanced Account Search</h3>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium mb-2">Corporate Account *</label>
                                <div className="relative">
                                  <input 
                                    type="text" 
                                    placeholder="Search Accounts..." 
                                    className="w-full border rounded-lg p-3 pr-10"
                                  />
                                  <div className="absolute right-3 top-3">🔍</div>
                                </div>
                              </div>
                              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                Continue to Booking
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {selectedComponent === 'booking-wizard' && (
                        <div className="border rounded-lg p-6 bg-gray-50">
                          <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="flex items-center justify-between mb-6">
                              <h2 className="text-2xl font-bold text-gray-900">Travel Booking Wizard</h2>
                              <Badge className="bg-green-100 text-green-800">Step 1 of 5</Badge>
                            </div>
                            
                            <div className="space-y-6">
                              <div className="border rounded-lg p-4">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                  <Plane className="h-5 w-5" />
                                  Booking Overview
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium mb-1">Number of Passengers</label>
                                    <div className="border rounded p-2 bg-gray-50">1</div>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium mb-1">Purpose of Travel</label>
                                    <div className="border rounded p-2 bg-gray-50">Select purpose</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">✅ Implementation Complete</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              All Salesforce Lightning Web Components have been successfully created with complete functionality:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Complete field mappings from your original Salesforce components
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Integration with AccountLookupController and CustomerOnboardingWizardController
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                File upload functionality for documents and employee lists
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Enhanced travel industry UI/UX with modern design
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Ready for deployment to Salesforce org
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SalesforceLightningWebComponents;