import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, Plane, Building, FileText, Users, Plus, Minus, Search } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Employee {
  id: string;
  name: string;
  department: string;
  employeeId: string;
  email: string;
}

interface BookingDetailsProps {
  selectedAccount?: string | null;
  onSearchAccount?: () => void;
}

const BookingDetails = ({ selectedAccount, onSearchAccount }: BookingDetailsProps) => {
  const [bookingType, setBookingType] = useState('flight');
  const [departureDate, setDepartureDate] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();
  const [employees, setEmployees] = useState<Employee[]>([
    { id: '1', name: 'John Doe', department: 'Sales', employeeId: 'EMP001', email: 'john@company.com' }
  ]);

  const addEmployee = () => {
    const newEmployee: Employee = {
      id: Date.now().toString(),
      name: '',
      department: '',
      employeeId: '',
      email: ''
    };
    setEmployees([...employees, newEmployee]);
  };

  const removeEmployee = (id: string) => {
    setEmployees(employees.filter(emp => emp.id !== id));
  };

  const updateEmployee = (id: string, field: keyof Employee, value: string) => {
    setEmployees(employees.map(emp => 
      emp.id === id ? { ...emp, [field]: value } : emp
    ));
  };

  // Show account selection if no account is selected
  if (!selectedAccount) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Plane className="h-5 w-5 text-blue-600" />
          <h2 className="text-2xl font-semibold text-gray-900">Booking Details Management</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Select Corporate Account
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Account Selected</h3>
            <p className="text-gray-500 mb-4">
              Please search and select a corporate account to continue with the booking process.
            </p>
            <Button onClick={onSearchAccount} className="bg-blue-600 hover:bg-blue-700">
              <Search className="h-4 w-4 mr-2" />
              Search Accounts
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Plane className="h-5 w-5 text-blue-600" />
        <h2 className="text-2xl font-semibold text-gray-900">Booking Details Management</h2>
      </div>

      {/* Company Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Selected Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className="bg-green-100 text-green-800">Selected</Badge>
              <span className="text-lg font-medium">{selectedAccount}</span>
            </div>
            <Button variant="outline" onClick={onSearchAccount}>
              <Search className="h-4 w-4 mr-2" />
              Change Account
            </Button>
          </div>
          <div className="mt-2">
            <Label>Booking Reference</Label>
            <Input placeholder="Auto-generated: QGO-2024-001" readOnly className="bg-gray-50 mt-1" />
          </div>
        </CardContent>
      </Card>

      {/* Booking Type Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Service Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={bookingType} onValueChange={setBookingType}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="flight" className="flex items-center gap-2">
                <Plane className="h-4 w-4" />
                Flight
              </TabsTrigger>
              <TabsTrigger value="hotel" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Hotel
              </TabsTrigger>
              <TabsTrigger value="visa" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Visa
              </TabsTrigger>
            </TabsList>

            {/* Flight Details */}
            <TabsContent value="flight" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>From</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Departure city" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="del">Delhi (DEL)</SelectItem>
                      <SelectItem value="bom">Mumbai (BOM)</SelectItem>
                      <SelectItem value="blr">Bangalore (BLR)</SelectItem>
                      <SelectItem value="hyd">Hyderabad (HYD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>To</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Destination city" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nyc">New York (NYC)</SelectItem>
                      <SelectItem value="lon">London (LON)</SelectItem>
                      <SelectItem value="sin">Singapore (SIN)</SelectItem>
                      <SelectItem value="dub">Dubai (DUB)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Departure Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !departureDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {departureDate ? format(departureDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={departureDate}
                        onSelect={setDepartureDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Return Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !returnDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {returnDate ? format(returnDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={returnDate}
                        onSelect={setReturnDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Class</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="economy">Economy</SelectItem>
                      <SelectItem value="premium-economy">Premium Economy</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="first">First Class</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Preferred Airline</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Any airline" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Airline</SelectItem>
                      <SelectItem value="ai">Air India</SelectItem>
                      <SelectItem value="6e">IndiGo</SelectItem>
                      <SelectItem value="sg">SpiceJet</SelectItem>
                      <SelectItem value="uk">Vistara</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Hotel Details */}
            <TabsContent value="hotel" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="delhi">Delhi</SelectItem>
                      <SelectItem value="mumbai">Mumbai</SelectItem>
                      <SelectItem value="bangalore">Bangalore</SelectItem>
                      <SelectItem value="hyderabad">Hyderabad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Hotel Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3-star">3 Star</SelectItem>
                      <SelectItem value="4-star">4 Star</SelectItem>
                      <SelectItem value="5-star">5 Star</SelectItem>
                      <SelectItem value="luxury">Luxury</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Check-in Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        Select check-in date
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Check-out Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        Select check-out date
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Room Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard Room</SelectItem>
                    <SelectItem value="deluxe">Deluxe Room</SelectItem>
                    <SelectItem value="suite">Suite</SelectItem>
                    <SelectItem value="executive">Executive Room</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            {/* Visa Details */}
            <TabsContent value="visa" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Destination Country</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usa">United States</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="canada">Canada</SelectItem>
                      <SelectItem value="singapore">Singapore</SelectItem>
                      <SelectItem value="uae">UAE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Visa Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select visa type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="business">Business Visa</SelectItem>
                      <SelectItem value="tourist">Tourist Visa</SelectItem>
                      <SelectItem value="transit">Transit Visa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Processing Priority</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard (15-20 days)</SelectItem>
                    <SelectItem value="express">Express (7-10 days)</SelectItem>
                    <SelectItem value="urgent">Urgent (3-5 days)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Employee Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Employee Information
            </div>
            <Button onClick={addEmployee} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {employees.map((employee, index) => (
              <Card key={employee.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Employee {index + 1}</h4>
                    {employees.length > 1 && (
                      <Button
                        onClick={() => removeEmployee(employee.id)}
                        variant="outline"
                        size="sm"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input
                        value={employee.name}
                        onChange={(e) => updateEmployee(employee.id, 'name', e.target.value)}
                        placeholder="Employee full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Employee ID</Label>
                      <Input
                        value={employee.employeeId}
                        onChange={(e) => updateEmployee(employee.id, 'employeeId', e.target.value)}
                        placeholder="EMP001"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Select onValueChange={(value) => updateEmployee(employee.id, 'department', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sales">Sales</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="engineering">Engineering</SelectItem>
                          <SelectItem value="hr">Human Resources</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={employee.email}
                        onChange={(e) => updateEmployee(employee.id, 'email', e.target.value)}
                        placeholder="employee@company.com"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Special Requirements</Label>
              <Textarea
                placeholder="Any special requirements, dietary restrictions, accessibility needs, etc."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Internal Notes</Label>
              <Textarea
                placeholder="Internal notes for Qgo team..."
                rows={2}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline">Save as Draft</Button>
        <Button variant="outline">Send Quote</Button>
        <Button className="bg-blue-600 hover:bg-blue-700">Confirm Booking</Button>
      </div>
    </div>
  );
};

export default BookingDetails;
