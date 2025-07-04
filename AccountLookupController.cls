public with sharing class AccountLookupController {
    
    @AuraEnabled(cacheable=true)
    public static List<Account> searchAccounts(String searchTerm) {
        System.debug('searchAccounts inside searchAccounts');
        String searchKey = '%' + searchTerm + '%';
        
        return [
            SELECT Id, Name, Phone, Website, BillingCity, BillingCountry, 
                   Industry, Type, Preferred_Airlines__c, Preferred_Class__c,
                   Travel_Volume__c, Preferred_Services__c, Max_Travel_Limit__c,
                   Red_Eye_Flights_Allowed__c, Advance_Booking_Window__c,
                   Hotel_Category__c, Preferred_Hotel_Chains__c, Room_Type__c,
                   Meal_Preference__c, Visa_Assistance_Required__c, Visa_Type__c,
                   Require_Ground_Transport__c, Modes_of_Transport__c
            FROM Account 
            WHERE Name LIKE :searchKey 
            ORDER BY Name 
            LIMIT 10
        ];
    }
    
    @AuraEnabled(cacheable=true)
public static List<User> searchUsers(String searchTerm) {
    String searchKey = '%' + searchTerm + '%';
    return [
        SELECT Id, Name, Email
        FROM User
        WHERE Name LIKE :searchKey
        ORDER BY Name
        LIMIT 10
    ];
}
@AuraEnabled(cacheable=true)
public static List<Contact> searchContacts(String searchTerm) {
    String searchKey = '%' + searchTerm + '%';
    return [
        SELECT Id, Name, Email, Phone
        FROM Contact
        WHERE Name LIKE :searchKey
        ORDER BY Name
        LIMIT 10
    ];
}

// New method to fetch Account Name by Account ID (simplifies LWC code)
    @AuraEnabled(cacheable=true)
    public static String getAccountNameById(String accountId) {
        Account acc = [SELECT Name FROM Account WHERE Id = :accountId LIMIT 1];
        return acc != null ? acc.Name : null;
    }
    
    @AuraEnabled(cacheable=true)
    public static Account getAccountById(String accountId) {
        return [
            SELECT Id, Name, Phone, Website, BillingCity, BillingCountry, 
                   Industry, Type, Preferred_Airlines__c, Preferred_Class__c,
                   Travel_Volume__c, Preferred_Services__c, Max_Travel_Limit__c,
                   Red_Eye_Flights_Allowed__c, Advance_Booking_Window__c,
                   Hotel_Category__c, Preferred_Hotel_Chains__c, Room_Type__c,
                   Meal_Preference__c, Visa_Assistance_Required__c, Visa_Type__c,
                   Require_Ground_Transport__c, Modes_of_Transport__c
            FROM Account 
            WHERE Id = :accountId
            LIMIT 1
        ];
    }
    
    @AuraEnabled(cacheable=true)
    public static Contact getPrimaryContact(String accountId) {
        List<Contact> contacts = [
            SELECT Id, Name, FirstName, LastName, Email, Phone, Designation__c
            FROM Contact 
            WHERE AccountId = :accountId 
            AND Is_Primary_Contact__c = true
            LIMIT 1
        ];
        
        return contacts.isEmpty() ? null : contacts[0];
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Employee__c> getEmployees(String accountId) {
        List<Employee__c> employees = [
            SELECT Id, Name, Employee_Number__c, Email__c, Phone__c
            FROM Employee__c 
            WHERE Account__c = :accountId 
            ORDER BY Employee_Number__c, Name
        ];
        
        return employees;
    }
    
    @AuraEnabled
    public static String createBookingRecord(String bookingData) {
        try {
            // Parse the booking data from JSON
            Map<String, Object> bookingMap = (Map<String, Object>) JSON.deserializeUntyped(bookingData);
            
            // Create the booking record
            Booking__c booking = new Booking__c();
            
            // Map account
            booking.Account__c = (String) bookingMap.get('accountId');
            
            // Map basic booking information
            booking.Name = (String) bookingMap.get('bookingName');
            if (bookingMap.get('numPassengers') != null) {
                booking.Number_of_Travelers__c = Integer.valueOf(bookingMap.get('numPassengers'));
                booking.No_of_People_Travelling__c = Integer.valueOf(bookingMap.get('numPassengers'));
                booking.No_of_Hotel_Room__c = Integer.valueOf(bookingMap.get('numPassengers'));
            }
            
            // Map flight information
            booking.From_Destination__c = (String) bookingMap.get('departureCity');
            booking.To_Destination__c = (String) bookingMap.get('destinationCity');
            booking.Departure_City__c = (String) bookingMap.get('flightDepartureCity');
            booking.Destination_City__c = (String) bookingMap.get('flightDestinationCity');
            
            // Map dates
            if (bookingMap.get('departureDateTime') != null) {
                String dateTimeStr = (String) bookingMap.get('departureDateTime');
                if (dateTimeStr.endsWith('Z')) {
                    dateTimeStr = dateTimeStr.replace('T', ' ').replace('Z', '');
                } else {
                    dateTimeStr = dateTimeStr.replace('T', ' ');
                }
                DateTime dt = DateTime.valueOf(dateTimeStr);
                booking.Visiting_Date__c = dt.date().format();
                booking.Travel_Date_From__c = dt.date();
            }
            
            // Map employee information
            String employeeId = (String) bookingMap.get('employeeName');
            if (employeeId != null && employeeId.length() > 0) {
                // Find the employee record
                List<Employee__c> employees = [
                    SELECT Id, Name, Employee_Number__c, Email__c, Phone__c
                    FROM Employee__c 
                    WHERE Id = :employeeId
                    LIMIT 1
                ];
                if (!employees.isEmpty()) {
                    // Store employee information in a custom field or use Contact__c if it's a lookup to Employee
                    // For now, we'll store the employee name in a custom field if available
                    // booking.Employee__c = employees[0].Id; // Uncomment if there's an Employee__c lookup field
                }
            }
            
            // Map passport information (from first passenger)
            List<Object> passengers = (List<Object>) bookingMap.get('passengers');
            if (passengers != null && !passengers.isEmpty()) {
                Map<String, Object> firstPassenger = (Map<String, Object>) passengers[0];
                booking.Passport_Number__c = (String) firstPassenger.get('passportNumber');
            }
            
            // Set default status
            booking.Booking_Status__c = 'New';
            booking.Booking_Date__c = Date.today();
            
            // Map new booking fields
            booking.Urgency_Level__c = (String) bookingMap.get('bookingUrgencyLevel');
            booking.Purpose_of_Travel__c = (String) bookingMap.get('bookingPurposeOfTravel');
            if (bookingMap.get('bookingType') != null) {
                List<Object> bookingTypeList = (List<Object>)bookingMap.get('bookingType');
                List<String> bookingTypeStrList = new List<String>();
                for (Object o : bookingTypeList) {
                    bookingTypeStrList.add((String)o);
                }
                booking.Booking_Type__c = String.join(bookingTypeStrList, ';');
            } else {
                booking.Booking_Type__c = null;
            }
            if (bookingMap.get('bookingBudgetLimit') != null && String.valueOf(bookingMap.get('bookingBudgetLimit')).trim() != '') {
                booking.Budget_Limit_per_Trip__c = Decimal.valueOf(String.valueOf(bookingMap.get('bookingBudgetLimit')));
            }
            booking.Booking_Remarks__c = (String) bookingMap.get('bookingRemarks');

            // Flight Info
            booking.Return_Trip_Required__c = bookingMap.get('flightReturnTripRequired') == 'Yes';
            booking.Return_DateTime__c = bookingMap.get('flightReturnDateTime') != null && String.valueOf(bookingMap.get('flightReturnDateTime')).trim() != '' ? DateTime.valueOf((String) bookingMap.get('flightReturnDateTime')) : null;
            booking.Flight_Class__c = (String) bookingMap.get('flightClass');
            booking.Flight_Seat_Preference__c = (String) bookingMap.get('flightSeatPreference');
            System.debug('Seat Preference-->'+(String) bookingMap.get('flightSeatPreference'));
            booking.Flight_Luggage_Included__c = bookingMap.get('flightLuggageIncluded') == 'Yes';
            booking.Flight_Red_Eye_Allowed__c = bookingMap.get('flightRedEyeAllowed') == 'Yes';
            booking.Flight_Preferred_Airline__c = (String) bookingMap.get('flightPreferredAirline');

            // Hotel Info
            booking.Hotel_Required__c = bookingMap.get('hotelRequired') == 'Yes';
            booking.Hotel_City__c = (String) bookingMap.get('hotelCity');
            // Fix date parsing for hotel check-in
            if (bookingMap.get('hotelCheckIn') != null && String.valueOf(bookingMap.get('hotelCheckIn')).trim() != '') {
                String checkInStr = (String) bookingMap.get('hotelCheckIn');
                if (checkInStr.endsWith('Z')) {
                    checkInStr = checkInStr.replace('T', ' ').replace('Z', '');
                } else {
                    checkInStr = checkInStr.replace('T', ' ');
                }
                booking.Hotel_Check_In__c = DateTime.valueOf(checkInStr);
            } else {
                booking.Hotel_Check_In__c = null;
            }
            // Fix date parsing for hotel check-out
            if (bookingMap.get('hotelCheckOut') != null && String.valueOf(bookingMap.get('hotelCheckOut')).trim() != '') {
                String checkOutStr = (String) bookingMap.get('hotelCheckOut');
                if (checkOutStr.endsWith('Z')) {
                    checkOutStr = checkOutStr.replace('T', ' ').replace('Z', '');
                } else {
                    checkOutStr = checkOutStr.replace('T', ' ');
                }
                booking.Hotel_Check_Out__c = DateTime.valueOf(checkOutStr);
            } else {
                booking.Hotel_Check_Out__c = null;
            }
            booking.Hotel_Category__c = (String) bookingMap.get('hotelCategory');
            booking.Hotel_Room_Type__c = (String) bookingMap.get('hotelRoomType');
            booking.Hotel_Meal_Preference__c = (String) bookingMap.get('hotelMealPreference');
            booking.Hotel_Smoking_Preference__c = (String) bookingMap.get('hotelSmokingPreference');
            booking.Hotel_Special_Request__c = (String) bookingMap.get('hotelSpecialRequest');

            // Visa Info
            booking.Visa_Required__c = bookingMap.get('visaRequired') == 'Yes';
            booking.Visa_Destination_City__c = (String) bookingMap.get('visaDestinationCity');
            booking.Visa_Type__c = (String) bookingMap.get('visaType');
            booking.Visa_Passport_Number__c = (String) bookingMap.get('visaPassportNumber');
            booking.Visa_Passport_Expiry__c = bookingMap.get('visaPassportExpiry') != null && String.valueOf(bookingMap.get('visaPassportExpiry')).trim() != '' ? Date.valueOf((String) bookingMap.get('visaPassportExpiry')) : null;
            booking.Visa_Estimated_TAT__c = bookingMap.get('visaEstimatedTAT') != null && String.valueOf(bookingMap.get('visaEstimatedTAT')).trim() != '' ? Integer.valueOf(String.valueOf(bookingMap.get('visaEstimatedTAT'))) : null;
            booking.Visa_Urgent_Required__c = bookingMap.get('visaUrgentRequired') == true || bookingMap.get('visaUrgentRequired') == 'true';

            // Ground Transport
            booking.GT_Required__c = bookingMap.get('gtRequired') == 'Yes';
            if (bookingMap.get('gtPickupAddress') != null) {
                Map<String, Object> pickup = (Map<String, Object>) bookingMap.get('gtPickupAddress');
                booking.GT_Pickup_Street__c = (String) pickup.get('street');
                booking.GT_Pickup_City__c = (String) pickup.get('city');
                booking.GT_Pickup_State__c = (String) pickup.get('state');
                booking.GT_Pickup_Postal_Code__c = (String) pickup.get('postalCode');
                booking.GT_Pickup_Country__c = (String) pickup.get('country');
            }
            if (bookingMap.get('gtDropAddress') != null) {
                Map<String, Object> drop = (Map<String, Object>) bookingMap.get('gtDropAddress');
                booking.GT_Drop_Street__c = (String) drop.get('street');
                booking.GT_Drop_City__c = (String) drop.get('city');
                booking.GT_Drop_State__c = (String) drop.get('state');
                booking.GT_Drop_Postal_Code__c = (String) drop.get('postalCode');
                booking.GT_Drop_Country__c = (String) drop.get('country');
            }
            if (bookingMap.get('gtModesOfTransport') != null) {
                List<Object> gtModesList = (List<Object>)bookingMap.get('gtModesOfTransport');
                List<String> gtModesStrList = new List<String>();
                for (Object o : gtModesList) {
                    gtModesStrList.add((String)o);
                }
                booking.GT_Modes_of_Transport__c = String.join(gtModesStrList, ';');
            } else {
                booking.GT_Modes_of_Transport__c = null;
            }
            booking.GT_Preferred_Vendors__c = (String) bookingMap.get('gtPreferredVendors');
            if (bookingMap.get('gtPickupDateTime') != null && String.valueOf(bookingMap.get('gtPickupDateTime')).trim() != '') {
                String pickupDateTimeStr = (String) bookingMap.get('gtPickupDateTime');
                if (pickupDateTimeStr.endsWith('Z')) {
                    pickupDateTimeStr = pickupDateTimeStr.replace('T', ' ').replace('Z', '');
                } else {
                    pickupDateTimeStr = pickupDateTimeStr.replace('T', ' ');
                }
                booking.GT_Pickup_DateTime__c = DateTime.valueOf(pickupDateTimeStr);
            } else {
                booking.GT_Pickup_DateTime__c = null;
            }
            booking.GT_Remarks__c = (String) bookingMap.get('gtRemarks');
            
            // Insert the booking record
            insert booking;
            
            // Create passenger detail records
            if (passengers != null && !passengers.isEmpty()) {
                List<Passenger_Detail__c> passengerDetails = new List<Passenger_Detail__c>();
                List<Employee__c> employeeDetails = new List<Employee__c>();
                
                for (Object passengerObj : passengers) {
                    Map<String, Object> passenger = (Map<String, Object>) passengerObj;
                    
                    Passenger_Detail__c passengerDetail = new Passenger_Detail__c();
                    passengerDetail.First_Name__c = (String) passenger.get('firstName');
                    passengerDetail.Last_Name__c = (String) passenger.get('lastName');
                    passengerDetail.Designation__c = (String) passenger.get('designation');
                    passengerDetail.Email__c = (String) passenger.get('email');
                    passengerDetail.Mobile_Number__c = (String) passenger.get('mobile');
                    passengerDetail.Passport_Number__c = (String) passenger.get('passportNumber');
                    // Handle passport expiry date
                    if (passenger.get('passportExpiry') != null) {
                        String expiryDateStr = (String) passenger.get('passportExpiry');
                        if (expiryDateStr.length() > 0) {
                            try {
                                Date expiryDate = Date.valueOf(expiryDateStr);
                                passengerDetail.Passport_Expiry_Date__c = expiryDate;
                            } catch (Exception e) {
                                // If date parsing fails, skip this field
                                System.debug('Error parsing passport expiry date: ' + expiryDateStr);
                            }
                        }
                    }
                    passengerDetail.Meal_Preference__c = (String) passenger.get('mealPreference');
                    passengerDetail.Seat_Preference__c = (String) passenger.get('seatPreference');
                    passengerDetail.Flight_Class__c = (String) passenger.get('flightClass');
                    passengerDetail.Remarks__c = (String) passenger.get('remarks');
                    // Set the relationship to the booking record
                    passengerDetail.Booking__c = booking.Id;
                    passengerDetails.add(passengerDetail);

                    Employee__c employee = new Employee__c();
                    employee.Name = (String) passenger.get('firstName')+' '+(String) passenger.get('lastName');
                    employee.Phone__c = (String) passenger.get('mobile');
                    employee.Email__c = (String) passenger.get('email');
                    employee.Account__c = (String) bookingMap.get('accountId');
                    employeeDetails.add(employee);
                }
                if (!passengerDetails.isEmpty()) {
                    insert passengerDetails;
                    insert employeeDetails;
                }
            }
            
            // Handle file uploads if any
            List<Object> uploadedFileIds = (List<Object>) bookingMap.get('uploadedFiles');
            if (uploadedFileIds != null && !uploadedFileIds.isEmpty()) {
                List<ContentDocumentLink> contentDocumentLinks = new List<ContentDocumentLink>();
                for (Object fileId : uploadedFileIds) {
                    ContentDocumentLink cdl = new ContentDocumentLink();
                    cdl.LinkedEntityId = booking.Id;
                    cdl.ContentDocumentId = (String) fileId;
                    cdl.ShareType = 'V';
                    cdl.Visibility = 'AllUsers';
                    contentDocumentLinks.add(cdl);
                }
                if (!contentDocumentLinks.isEmpty()) {
                    insert contentDocumentLinks;
                }
            }
            return booking.Id;
        } catch (Exception e) {
            throw new AuraHandledException('Error creating booking record: ' + e.getMessage());
        }
    }
    
    @AuraEnabled
    public static Id uploadFileToBooking(String parentId, String fileName, String base64Data, String contentType) {
        // Decode the base64 file
        Blob fileBody;
        try {
            fileBody = EncodingUtil.base64Decode(base64Data);
        } catch (Exception e) {
            throw new AuraHandledException('Failed to decode file: ' + e.getMessage());
        }
        // Create ContentVersion
        ContentVersion cv = new ContentVersion();
        cv.Title = fileName;
        cv.PathOnClient = '/' + fileName;
        cv.VersionData = fileBody;
        cv.Origin = 'H';
        cv.ContentLocation = 'S';
        insert cv;
        // Query ContentDocumentId
        cv = [SELECT Id, ContentDocumentId FROM ContentVersion WHERE Id = :cv.Id LIMIT 1];
        // Link to Booking
        ContentDocumentLink cdl = new ContentDocumentLink();
        cdl.ContentDocumentId = cv.ContentDocumentId;
        cdl.LinkedEntityId = parentId;
        cdl.ShareType = 'V';
        cdl.Visibility = 'AllUsers';
        insert cdl;
        return cv.ContentDocumentId;
    }
}