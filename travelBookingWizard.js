import { LightningElement, track, api, wire } from 'lwc';
import { createElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import QuoteDetailsComponent from 'c/quoteDetailsComponent';
import getAccountById from '@salesforce/apex/AccountLookupController.getAccountById';
import getPrimaryContact from '@salesforce/apex/AccountLookupController.getPrimaryContact';
import getEmployees from '@salesforce/apex/AccountLookupController.getEmployees';
import createBookingRecord from '@salesforce/apex/AccountLookupController.createBookingRecord';
import { getPicklistValues, getObjectInfo } from 'lightning/uiObjectInfoApi';
import BOOKING_OBJECT from '@salesforce/schema/Booking__c';
import URGENCY_LEVEL_FIELD from '@salesforce/schema/Booking__c.Urgency_Level__c';
import PURPOSE_OF_TRAVEL_FIELD from '@salesforce/schema/Booking__c.Purpose_of_Travel__c';
import BOOKING_TYPE_FIELD from '@salesforce/schema/Booking__c.Booking_Type__c';
import FLIGHT_CLASS_FIELD from '@salesforce/schema/Booking__c.Flight_Class__c';
import FLIGHT_SEAT_PREFERENCE_FIELD from '@salesforce/schema/Booking__c.Flight_Seat_Preference__c';
import HOTEL_CATEGORY_FIELD from '@salesforce/schema/Booking__c.Hotel_Category__c';
import HOTEL_ROOM_TYPE_FIELD from '@salesforce/schema/Booking__c.Hotel_Room_Type__c';
import HOTEL_MEAL_PREFERENCE_FIELD from '@salesforce/schema/Booking__c.Hotel_Meal_Preference__c';
import HOTEL_SMOKING_PREFERENCE_FIELD from '@salesforce/schema/Booking__c.Hotel_Smoking_Preference__c';
import VISA_TYPE_FIELD from '@salesforce/schema/Booking__c.Visa_Type__c';
import GT_MODES_OF_TRANSPORT_FIELD from '@salesforce/schema/Booking__c.GT_Modes_of_Transport__c';
import GT_PREFERRED_VENDORS_FIELD from '@salesforce/schema/Booking__c.GT_Preferred_Vendors__c';
import DEPARTURE_CITY_FIELD from '@salesforce/schema/Booking__c.Departure_City__c';
import DESTINATION_CITY_FIELD from '@salesforce/schema/Booking__c.Destination_City__c';

export default class TravelBookingWizard extends NavigationMixin(LightningElement) {
    @api recordId;
    @track isAccountSelectionStep = true;
    @track isProceedBookingStep = false;
    @track isBookingWizard = false;
    @track isProceedQuoteStep = false;
    @track isQuoteWizard = false;
    @track bookingPage = 1;
    
    // Progress indicator tracking
    get currentStep() {
        if (this.isBookingWizard) {
            return this.bookingPage.toString();
        } else if (this.isQuoteWizard) {
            return this.quotePage.toString();
        }
        return '1';
    }

    // Account selection tracking
    @track selectedAccountId = null;
    @track selectedAccountName = '';
    @track showAccountError = false;
    @track isAccountContinueDisabled = true;
    @track isLoading = false;
    @track uploadedFiles = [];
    @track createdBookingId = null;
    acceptedFormats = ['.pdf', '.png', '.jpg', '.jpeg', '.doc', '.docx'];
    
    // Account preference fields (auto-populated)
    @track accountPreferredAirlines = '';
    @track accountPreferredClass = '';
    @track accountTravelVolume = '';
    @track accountMaxTravelLimit = '';
    @track accountRedEyeAllowed = '';
    @track accountAdvanceBookingWindow = '';
    @track accountHotelCategory = '';
    @track accountVisaAssistance = '';
    
    // Booking fields (scaffolded, add more as needed)
    @track bookingName = '';
    @track bookingCorporateAccount = '';
    @track bookingPrimaryContact = '';
    @track bookingEmployeeName = '';
    employeeNameOptions = [];
    @track bookingEmployeeEmail = '';
    @track bookingEmployeePhone = '';
    @track bookingNumPassengers = 1;
    @track bookingUrgencyLevel = '';
    @track bookingPurposeOfTravel = '';
    @track bookingType = [];
    @track bookingBudgetLimit = '';
    @track bookingRemarks = '';
    @track passengerList = [
        { id: 1, firstName: '', lastName: '', designation: '', email: '', mobile: '', passportNumber: '', passportExpiry: '', mealPreference: '', seatPreference: '', flightClass: '', remarks: '' }
    ];
    @track flightDepartureCity = '';
    @track flightDestinationCity = '';
    @track flightDepartureDateTime = '';
    @track flightReturnTripRequired = '';
    @track flightReturnDateTime = '';
    @track flightClass = '';
    @track flightSeatPreference = '';
    @track flightLuggageIncluded = '';
    @track flightRedEyeAllowed = '';
    @track flightPreferredAirline = '';
    @track hotelRequired = '';
    @track hotelCity = '';
    @track hotelCheckIn = '';
    @track hotelCheckOut = '';
    @track hotelMealPreference = '';
    @track smokingPreferenceOptions = [];
    @track hotelSmokingPreference = '';
    @track hotelSpecialRequest = '';
    @track hotelCategory = '';
    @track hotelRoomType = '';
    @track visaRequired = '';
    @track visaDestinationCity = '';
    @track visaType = '';
    @track visaPassportNumber = '';
    @track visaPassportExpiry = '';
    @track visaEstimatedTAT = '';
    @track visaUrgentRequired = false;
    @track gtRequired = '';
    // Pickup address fields
    @track gtPickupStreet = '';
    @track gtPickupCity = '';
    @track gtPickupState = '';
    @track gtPickupPostalCode = '';
    @track gtPickupCountry = '';
    // Drop address fields
    @track gtDropStreet = '';
    @track gtDropCity = '';
    @track gtDropState = '';
    @track gtDropPostalCode = '';
    @track gtDropCountry = '';
    @track gtModesOfTransport = [];
    @track gtPreferredVendors = '';
    @track gtPickupDateTime = '';
    @track gtRemarks = '';

        @track showQuoteDetails = false;  // Flag to control whether to show the Quote component or the booking details
    @track showBookingWizard = true;


    @wire(getObjectInfo, { objectApiName: BOOKING_OBJECT })
    bookingObjectInfo;

    @track urgencyLevelOptions = [];
    @track bookingPurposeOfTravelOptions = [];
    @track bookingTypeOptions = [];
    @track flightClassOptions = [];
    @track flightSeatPreferenceOptions = [];
    @track hotelCategoryOptions = [];
    @track roomTypeOptions = [];
    @track mealPreferenceOptions = [];
    @track smokingPreferenceOptions = [];
    @track visaTypeOptions = [];
    @track modesOfTransportOptions = [];
    @track preferredVendorsOptions = [];
    @track departureCityOptions = [];
    @track destinationCityOptions = [];

    @track visaPassengerList = []; // Stores selected passengers for visa

    @wire(getPicklistValues, { recordTypeId: "012000000000000AAA", fieldApiName: URGENCY_LEVEL_FIELD })
    urgencyLevelPicklist({ data }) {
        if (data) this.urgencyLevelOptions = data.values;
    }
    @wire(getPicklistValues, { recordTypeId: "012000000000000AAA", fieldApiName: PURPOSE_OF_TRAVEL_FIELD })
    purposeOfTravelPicklist({ data }) {
        if (data) this.bookingPurposeOfTravelOptions = data.values;
    }
    @wire(getPicklistValues, { recordTypeId: '$bookingObjectInfo.data.defaultRecordTypeId', fieldApiName: BOOKING_TYPE_FIELD })
    bookingTypePicklist({ data }) {
        if (data) this.bookingTypeOptions = data.values;
    }
    @wire(getPicklistValues, { recordTypeId: '$bookingObjectInfo.data.defaultRecordTypeId', fieldApiName: FLIGHT_CLASS_FIELD })
    flightClassPicklist({ data }) {
        if (data) this.flightClassOptions = data.values;
    }
    @wire(getPicklistValues, { recordTypeId: '$bookingObjectInfo.data.defaultRecordTypeId', fieldApiName: FLIGHT_SEAT_PREFERENCE_FIELD })
    flightSeatPreferencePicklist({ data }) {
        if (data) this.flightSeatPreferenceOptions = data.values;
    }
    @wire(getPicklistValues, { recordTypeId: '$bookingObjectInfo.data.defaultRecordTypeId', fieldApiName: HOTEL_CATEGORY_FIELD })
    hotelCategoryPicklist({ data }) {
        if (data) this.hotelCategoryOptions = data.values;
    }
    @wire(getPicklistValues, { recordTypeId: '$bookingObjectInfo.data.defaultRecordTypeId', fieldApiName: HOTEL_ROOM_TYPE_FIELD })
    hotelRoomTypePicklist({ data }) {
        if (data) this.roomTypeOptions = data.values;
    }
    @wire(getPicklistValues, { recordTypeId: '$bookingObjectInfo.data.defaultRecordTypeId', fieldApiName: HOTEL_MEAL_PREFERENCE_FIELD })
    hotelMealPreferencePicklist({ data }) {
        if (data) this.mealPreferenceOptions = data.values;
    }
    @wire(getPicklistValues, { recordTypeId: '$bookingObjectInfo.data.defaultRecordTypeId', fieldApiName: HOTEL_SMOKING_PREFERENCE_FIELD })
    hotelSmokingPreferencePicklist({ data }) {
        if (data) this.smokingPreferenceOptions = data.values;
    }
    @wire(getPicklistValues, { recordTypeId: '$bookingObjectInfo.data.defaultRecordTypeId', fieldApiName: VISA_TYPE_FIELD })
    visaTypePicklist({ data }) {
        if (data) this.visaTypeOptions = data.values;
    }
    @wire(getPicklistValues, { recordTypeId: '$bookingObjectInfo.data.defaultRecordTypeId', fieldApiName: GT_MODES_OF_TRANSPORT_FIELD })
    gtModesOfTransportPicklist({ data }) {
        if (data) this.modesOfTransportOptions = data.values;
    }
    @wire(getPicklistValues, { recordTypeId: '$bookingObjectInfo.data.defaultRecordTypeId', fieldApiName: GT_PREFERRED_VENDORS_FIELD })
    gtPreferredVendorsPicklist({ data }) {
        if (data) this.preferredVendorsOptions = data.values;
    }
    @wire(getPicklistValues, { recordTypeId: '$bookingObjectInfo.data.defaultRecordTypeId', fieldApiName: DEPARTURE_CITY_FIELD })
    departureCityPicklist({ data }) {
        if (data) this.departureCityOptions = data.values;
    }
    @wire(getPicklistValues, { recordTypeId: '$bookingObjectInfo.data.defaultRecordTypeId', fieldApiName: DESTINATION_CITY_FIELD })
    destinationCityPicklist({ data }) {
        if (data) this.destinationCityOptions = data.values;
    }

    get isBookingPage1() { return this.isBookingWizard && this.bookingPage === 1; }
    get isBookingPage2() { return this.isBookingWizard && this.bookingPage === 2; }
    get isBookingPage3() { return this.isBookingWizard && this.bookingPage === 3; }
    get isBookingPage4() { return this.isBookingWizard && this.bookingPage === 4; }
    get isBookingPage5() { return this.isBookingWizard && this.bookingPage === 5; }
    get showBack() { 
        return (this.isBookingWizard && this.bookingPage > 1) || 
               (this.isQuoteWizard && this.quotePage > 1); 
    }
    get showNext() { 
        return (this.isBookingWizard && this.bookingPage < 5) || 
               (this.isQuoteWizard && this.quotePage < 3); 
    }
    get showSaveAndContinue() { 
        return this.isQuoteWizard && this.quotePage === 3; 
    }
    get showHotelFields() { return this.hotelRequired === 'Yes'; }
    get showVisaFields() { return this.visaRequired === 'Yes'; }
    get showGTFields() { return this.gtRequired === 'Yes'; }
    get showReturnDateTime() { return this.flightReturnTripRequired === 'Yes'; }

    // Booking Wizard Navigation
    get showBookingBack() { return this.isBookingWizard && this.bookingPage > 1; }
    get showBookingNext() { return this.isBookingWizard && this.bookingPage < 5; }
    get showBookingSaveAndContinue() { return this.isBookingWizard && this.bookingPage === 5; }
    
    // --- Navigation button visibility ---
    get showAgreementFileUpload() { return this.agreementSigned === 'Yes'; }
    get showGroundTransportFields() { return this.requireGroundTransport === 'Yes'; }
    get showHotelFields() { return this.hotelRequired === 'Yes'; }
    get showVisaFields() { return this.visaRequired === 'Yes'; }
    get showGTFields() { return this.gtRequired === 'Yes'; }
    get showReturnDateTime() { return this.flightReturnTripRequired === 'Yes'; }

    // Quote Wizard Navigation
    get isRemovePassengerDisabled() { return this.passengerList.length <= 1; }

    // Account Selection Handlers
    handleAccountSelected(event) {
        console.log('inside handleAccountSelected');
        const { accountId, accountName } = event.detail;
        this.selectedAccountId = accountId;
        this.selectedAccountName = accountName;
        this.showAccountError = false;
        this.isAccountContinueDisabled = false;
        
        // Load account details
        this.loadAccountDetails(accountId);
    }

    async loadAccountDetails(accountId) {
        try {
            const account = await getAccountById({ accountId: accountId });
            if (account) {
                this.populateAccountFields(account);
            }
            
            // Fetch primary contact
            const primaryContact = await getPrimaryContact({ accountId: accountId });
            if (primaryContact) {
                this.populatePrimaryContactFields(primaryContact);
            }
            
            // Fetch employees
            const employees = await getEmployees({ accountId: accountId });
            if (employees && employees.length > 0) {
                this.populateEmployeeOptions(employees);
            }
        } catch (error) {
            console.error('Error loading account details:', error);
        }
    }

    populateAccountFields(account) {
        // Populate account preference fields
        this.accountPreferredAirlines = account.Preferred_Airlines__c || '';
        this.accountPreferredClass = account.Preferred_Class__c || '';
        this.accountTravelVolume = account.Travel_Volume__c || '';
        this.accountMaxTravelLimit = account.Max_Travel_Limit__c ? `KWD ${account.Max_Travel_Limit__c}` : '';
        this.accountRedEyeAllowed = account.Red_Eye_Flights_Allowed__c ? 'Yes' : 'No';
        this.accountAdvanceBookingWindow = account.Advance_Booking_Window__c ? `${account.Advance_Booking_Window__c} days` : '';
        this.accountHotelCategory = account.Hotel_Category__c || '';
        this.accountVisaAssistance = account.Visa_Assistance_Required__c ? 'Yes' : 'No';
        
        // Pre-populate booking fields with account data
        this.bookingCorporateAccount = account.Name;
        this.flightPreferredAirline = account.Preferred_Airlines__c || '';
        this.flightRedEyeAllowed = account.Red_Eye_Flights_Allowed__c ? 'Yes' : 'No';
        this.hotelCategory = account.Hotel_Category__c || '';
        this.visaRequired = account.Visa_Assistance_Required__c ? 'Yes' : 'No';
        this.gtRequired = account.Require_Ground_Transport__c ? 'Yes' : 'No';
        
        // Auto-generate booking name: Booking - Account Name - Current Date (DD-MM-YYYY)
        this.bookingName = `Booking - ${account.Name} - ${this.getCurrentDateFormatted()}`;
    }
    
    populatePrimaryContactFields(contact) {
        // Populate primary contact fields
        this.bookingPrimaryContact = contact.Name || '';
        this.quotePrimaryContact = contact.Name || '';
        
        // Don't auto-populate employee fields from primary contact
        // Employee fields will be populated only when an employee is selected from dropdown
    }
    
    populateEmployeeOptions(employees) {
        // Convert employees to dropdown options with Employee Number and Name
        this.employeeNameOptions = employees.map(emp => ({
            label: `${emp.Employee_Number__c} - ${emp.Name}`,
            value: emp.Id
        }));
        
        // Store employee data for easy lookup
        this.employeeData = employees.reduce((acc, emp) => {
            acc[emp.Id] = emp;
            return acc;
        }, {});
    }

    // Helper method to get current date in DD-MM-YYYY format
    getCurrentDateFormatted() {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        return `${day}-${month}-${year}`;
    }

    handleAccountContinue() {
        if (!this.selectedAccountId) {
            this.showAccountError = true;
            return;
        }
        
        this.isAccountSelectionStep = false;
        //this.isProceedBookingStep = true;
        this.isBookingWizard = true;
    }

    // --- Navigation handlers ---
    // Booking Wizard Handlers
    handleBookingInputChange(event) {
        const field = event.target.dataset.id;
        let value = event.detail ? event.detail.value : event.target.value;
        console.log('field:', field);
        console.log('value:', value);
        this[field] = value;

        if (field === 'flightDestinationCity') {
        this.visaDestinationCity = value;
    }

            if (field === 'flightDestinationCity') {
        this.hotelCity = value;
    }
        
        // Special logic for dynamic fields
        if (field === 'bookingNumPassengers') {
            this.updatePassengerList(value);
        }
        
        // Auto-populate employee details when employee is selected
        if (field === 'bookingEmployeeName') {
            if (value && this.employeeData && this.employeeData[value]) {
                // Employee selected - populate email and phone
                const selectedEmployee = this.employeeData[value];
                this.bookingEmployeeEmail = selectedEmployee.Email__c || '';
                this.bookingEmployeePhone = selectedEmployee.Phone__c || '';
            } else {
                // No employee selected - clear email and phone
                this.bookingEmployeeEmail = '';
                this.bookingEmployeePhone = '';
            }
        }
       /* if (field === 'hotelRequired') {
            this.showHotelFields = value === 'Yes';
        }
        if (field === 'visaRequired') {
            this.showVisaFields = value === 'Yes';
        }
        if (field === 'gtRequired') {
            this.showGTFields = value === 'Yes';
        }*/
    }

    handleNext() {
        if (this.isBookingWizard && this.bookingPage < 5) {
            this.bookingPage += 1;
        } else if (this.isBookingWizard && this.bookingPage === 5) {
            // Booking wizard completed, show proceed to quote step
            this.isBookingWizard = false;
            this.isProceedQuoteStep = true;
        } else if (this.isQuoteWizard && this.quotePage < 3) {
            this.quotePage += 1;
        }
    }
    
    handleBack() {
        if (this.isBookingWizard && this.bookingPage > 1) {
            this.bookingPage -= 1;
        } else if (this.isQuoteWizard && this.quotePage > 1) {
            this.quotePage -= 1;
        }
    }
    
    async saveBookingRecord() {
        // Validate required fields
        if (!this.selectedAccountId) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Please select a corporate account.',
                    variant: 'error'
                })
            );
            return null;
        }
        
        if (!this.bookingName || !this.flightDepartureCity || !this.flightDestinationCity) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Please fill in all required fields (Booking Name, Departure City, Destination City).',
                    variant: 'error'
                })
            );
            return null;
        }


        
        // Show loading state
        this.isLoading = true;
        4
        try {
            // Prepare booking data
            const bookingData = {
                accountId: this.selectedAccountId,
                bookingName: this.bookingName,
                numPassengers: this.bookingNumPassengers,
                employeeName: this.bookingEmployeeName,
                departureCity: this.flightDepartureCity,
                destinationCity: this.flightDestinationCity,
                departureDateTime: this.flightDepartureDateTime,
                passengers: this.passengerList,
                // Add other fields as needed
                urgencyLevel: this.bookingUrgencyLevel,
                purposeOfTravel: this.bookingPurposeOfTravel,
                bookingType: this.bookingType,
                budgetLimit: this.bookingBudgetLimit,
                remarks: this.bookingRemarks,
                // Flight details
                returnTripRequired: this.flightReturnTripRequired,
                returnDateTime: this.flightReturnDateTime,
                flightClass: this.flightClass,
                seatPreference: this.flightSeatPreference,
                luggageIncluded: this.flightLuggageIncluded,
                // Hotel details
                hotelRequired: this.hotelRequired,
                hotelCity: this.hotelCity,
                hotelCheckIn: this.hotelCheckIn,
                hotelCheckOut: this.hotelCheckOut,
                hotelCategory: this.hotelCategory,
                hotelRoomType: this.hotelRoomType,
                hotelMealPreference: this.hotelMealPreference,
                hotelSmokingPreference: this.hotelSmokingPreference,
                hotelSpecialRequest: this.hotelSpecialRequest,
                // Visa details
                visaRequired: this.visaRequired,
                visaDestinationCity: this.visaDestinationCity,
                visaType: this.visaType,
                visaPassportNumber: this.visaPassportNumber,
                visaPassportExpiry: this.visaPassportExpiry,
                visaEstimatedTAT: this.visaEstimatedTAT,
                visaUrgentRequired: this.visaUrgentRequired,
                // Ground transport details
                gtRequired: this.gtRequired,
                gtPickupAddress: {
                    street: this.gtPickupStreet,
                    city: this.gtPickupCity,
                    state: this.gtPickupState,
                    postalCode: this.gtPickupPostalCode,
                    country: this.gtPickupCountry
                },
                gtDropAddress: {
                    street: this.gtDropStreet,
                    city: this.gtDropCity,
                    state: this.gtDropState,
                    postalCode: this.gtDropPostalCode,
                    country: this.gtDropCountry
                },
                gtModesOfTransport: this.gtModesOfTransport,
                gtPreferredVendors: this.gtPreferredVendors,
                gtPickupDateTime: this.gtPickupDateTime,
                gtRemarks: this.gtRemarks,
                // File uploads (if any)
                uploadedFiles: this.uploadedFiles || []
            };
            
            // Call Apex method to create booking record
            const bookingId = await createBookingRecord({ bookingData: JSON.stringify(bookingData) });
            
            // Show success message
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: `Booking record created successfully with ID: ${bookingId}`,
                    variant: 'success'
                })
            );
            
            return bookingId;
            
        } catch (error) {
            console.error('Error creating booking record:', error);
            
            // Show error message
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: error.body?.message || 'An error occurred while creating the booking record.',
                    variant: 'error'
                })
            );
            return null;
        } finally {
            this.isLoading = false;
        }
    }
    
    async handleSaveAndContinue() {
        const bookingId = await this.saveBookingRecord();
        if (bookingId) {
            // Navigate to the created booking record
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: bookingId,
                    objectApiName: 'Booking__c',
                    actionName: 'view'
                }
            });
        }
    }
    
    handleClose() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Booking__c',
                actionName: 'home'
            }
        });
    }

    // --- Input handlers (reuse existing logic) ---
    handleInputChange(event) {
        const field = event.target.dataset.id;
        let value = event.target.type === 'checkbox' ? event.target.checked : event.detail ? event.detail.value : event.target.value;
        if (event.target.type === 'checkbox') {
            this[field] = value;
        } else if (Array.isArray(this[field])) {
            this[field] = [...value];
        } else {
            this[field] = value;
        }
        // Special logic for dynamic fields
        if (field === 'bookingNumPassengers') {
            this.updatePassengerList(value);
        }
    }
    updatePassengerList(num) {
        let n = parseInt(num, 10);
        if (isNaN(n) || n < 1) n = 1;
        while (this.passengerList.length < n) {
            this.passengerList.push({ id: Date.now() + Math.random(), firstName: '', lastName: '', designation: '', email: '', mobile: '', passportNumber: '', passportExpiry: '', mealPreference: '', seatPreference: '', flightClass: '', remarks: '' });
        }
        while (this.passengerList.length > n) {
            this.passengerList.pop();
        }
    }
    handlePassengerChange(event) {
        const index = parseInt(event.target.dataset.index, 10);
        const field = event.target.dataset.field;
        const value = event.detail ? event.detail.value : event.target.value;
        this.passengerList[index][field] = value;
        this.passengerList = [...this.passengerList];
    }
    handleAddPassenger() {
        this.passengerList.push({ id: Date.now() + Math.random(), firstName: '', lastName: '', designation: '', email: '', mobile: '', passportNumber: '', passportExpiry: '', mealPreference: '', seatPreference: '', flightClass: '', remarks: '' });
        this.bookingNumPassengers = this.passengerList.length;
    }
    
    handleRemovePassenger(event) {
        const index = parseInt(event.target.dataset.index, 10);
        if (this.passengerList.length > 1) {
            this.passengerList.splice(index, 1);
            this.passengerList = [...this.passengerList];
            this.bookingNumPassengers = this.passengerList.length;
        }
    }
    handleFileUpload(event) {
        // The lightning-file-upload component automatically uploads files to Salesforce
        // We just need to store the file IDs for reference
        const uploadedFileIds = event.detail.files;
        this.uploadedFiles = uploadedFileIds;
        console.log('Files uploaded:', uploadedFileIds);
    }

    // Quote Wizard Handlers
    handleProceedQuoteYes() {
        this.isProceedQuoteStep = false;
        this.quotePage = 1;
    }

    handleProceedQuoteNo() {
        // Save booking info and close modal
        this.handleClose();
    }
    

    async handleSaveAndCreateQuote() {
        // Save the booking record first
        const bookingId = await this.saveBookingRecord();
        if (bookingId) {
            // Hide the booking wizard and show the quote component
            this.showBookingWizard = false;
            this.showQuoteDetails = true;
            this.createdBookingId = bookingId;
        }
    }

    handlePassengerInputChange(event) {
        const index = parseInt(event.target.dataset.index, 10);
        const field = event.target.dataset.field;
        let value = event.detail ? event.detail.value : event.target.value;
        this.passengerList[index][field] = value;
        this.passengerList = [...this.passengerList];
    }
    
    handlePickupAddressChange(event) {
        const { street, city, state, postalCode, country } = event.detail;
        this.gtPickupStreet = street || '';
        this.gtPickupCity = city || '';
        this.gtPickupState = state || '';
        this.gtPickupPostalCode = postalCode || '';
        this.gtPickupCountry = country || '';
    }
    
    handleDropAddressChange(event) {
        const { street, city, state, postalCode, country } = event.detail;
        this.gtDropStreet = street || '';
        this.gtDropCity = city || '';
        this.gtDropState = state || '';
        this.gtDropPostalCode = postalCode || '';
        this.gtDropCountry = country || '';
    }

    yesNoOptions = [
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' }
    ];

    get passengerPicklistOptions() {
        return this.passengerList.map((p, idx) => ({
            label: `${p.firstName} ${p.lastName}`.trim() || `Passenger ${idx + 1}`,
            value: String(p.id)
        }));
    }

    handleVisaPassengerChange(event) {
        this.visaPassengerList = event.detail.value;
    }

    handleBackToBooking() {
        this.showQuoteDetails = false;
        this.showBookingWizard = true;
    }
}