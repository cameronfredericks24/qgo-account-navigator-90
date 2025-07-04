import { LightningElement, track, api, wire } from 'lwc';
import { CloseActionScreenEvent } from 'lightning/actions';
import { NavigationMixin } from 'lightning/navigation';
import { getPicklistValues, getObjectInfo } from 'lightning/uiObjectInfoApi';
import { createRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord } from 'lightning/uiRecordApi';
import uploadFileToAccount from '@salesforce/apex/CustomerOnboardingWizardController.uploadFileToAccount';
import createAccountAndContact from '@salesforce/apex/CustomerOnboardingWizardController.createAccountAndContact';

// Import field references for Account
import ACCOUNT_BUSINESS_DIVISION_FIELD from '@salesforce/schema/Account.Business_Division__c';
import ACCOUNT_COMPANY_SIZE_FIELD from '@salesforce/schema/Account.Company_Size__c';
import ACCOUNT_PREFERRED_SERVICES_FIELD from '@salesforce/schema/Account.Preferred_Services__c';
import ACCOUNT_URGENCY_TO_ONBOARD_FIELD from '@salesforce/schema/Account.Urgency_to_Onboard__c';
import ACCOUNT_PREFERRED_AIRLINES_FIELD from '@salesforce/schema/Account.Preferred_Airlines__c';
import ACCOUNT_PREFERRED_CLASS_FIELD from '@salesforce/schema/Account.Preferred_Class__c';
import ACCOUNT_MAX_LAYOVER_ALLOWED_FIELD from '@salesforce/schema/Account.Max_Layover_Allowed__c';
import ACCOUNT_HOTEL_CATEGORY_FIELD from '@salesforce/schema/Account.Hotel_Category__c';
import ACCOUNT_PREFERRED_HOTEL_CHAINS_FIELD from '@salesforce/schema/Account.Preferred_Hotel_Chains__c';
import ACCOUNT_ROOM_TYPE_FIELD from '@salesforce/schema/Account.Room_Type__c';
import ACCOUNT_MEAL_PREFERENCE_FIELD from '@salesforce/schema/Account.Meal_Preference__c';
import ACCOUNT_VISA_TYPE_FIELD from '@salesforce/schema/Account.Visa_Type__c';
import ACCOUNT_MODES_OF_TRANSPORT_FIELD from '@salesforce/schema/Account.Modes_of_Transport__c';
import ACCOUNT_PREFERRED_VENDORS_FIELD from '@salesforce/schema/Account.Preferred_Vendors__c';
import ACCOUNT_SLA_COMMITMENT_FIELD from '@salesforce/schema/Account.SLA_Commitment__c';
import ACCOUNT_MAX_TRAVEL_LIMIT_FIELD from '@salesforce/schema/Account.Max_Travel_Limit__c';

// Import field references for Contact
//import CONTACT_DESIGNATION_FIELD from '@salesforce/schema/Contact.Designation__c';

// Import Account and Contact object types
import ACCOUNT_OBJECT from '@salesforce/schema/Account';
import CONTACT_OBJECT from '@salesforce/schema/Contact';

export default class CustomerOnboardingWizard extends NavigationMixin(LightningElement) {    
    @track currentStep = '1'; // 1-5: 1-4 for Account/Contact, 5 for file upload
    @track isLoading = false;
    @track accountRecordId = null; // For file uploads after Account creation

    // File upload tracking
    @track selectedFiles = {
        travelPolicy: [],
        agreement: [],
        employee: [],
        visaDocuments: []
    };

    // --- Account Creation State (pages 1-4) ---
    @track companyName = '';
    @track businessDivision = 'Corporate';
    @track businessDivisionOptions = [];
    @track companySize = '';
    @track companySizeOptions = [];
    @track headOffice = '';
    @track gstin = '';
    @track headOfficeStreet = '';
    @track headOfficeCity = '';
    @track headOfficeState = '';
    @track headOfficePostalCode = '';
    @track headOfficeCountry = '';

    // Contact Person Details
    @track contactFirstName = '';
    @track contactLastName = '';
    @track contactDesignation = '';
    @track contactDesignationOptions = [];
    @track contactEmail = '';
    @track isDecisionMaker = false;

    // Travel Overview
    @track travelVolume = '';
    @track preferredServicesOptions = [];
    @track preferredServices = [];
    @track urgencyToOnboardOptions = [];
    @track urgencyToOnboard = '';
    yesNoOptions = [
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' }
    ];
    @track travelPolicy = '';

    // Page 2: Travel Preferences
    @track preferredAirlinesOptions = [];
    @track preferredAirlines = [];
    @track preferredClassOptions = [];
    @track preferredClass = '';
    @track redEyeFlightsAllowed = '';
    @track advanceBookingWindow = '';
    @track maxLayoverAllowedOptions = [];
    @track maxLayoverAllowed = '';
    @track frequentRoutes = '';

    // Hotel Preferences
    @track hotelCategoryOptions = [];
    @track hotelCategory = '';
    @track preferredHotelChainsOptions = [];
    @track preferredHotelChains = [];
    @track roomTypeOptions = [];
    @track roomType = '';
    @track mealPreferenceOptions = [];
    @track mealPreference = '';
    @track blacklistedHotels = '';

    // Visa Services
    @track visaAssistanceRequired = '';
    @track visaTypeOptions = [];
    @track visaType = '';
    @track visaDocuments = '';

    // Ground Transport
    @track requireGroundTransport = '';
    @track modesOfTransportOptions = [];
    @track modesOfTransport = [];
    @track preferredVendorsOptions = [];
    @track preferredVendors = '';

    // Page 3: Service Agreement
    @track agreementSigned = '';
    @track agreementStartDate = '';
    @track agreementEndDate = '';
    @track slaCommitmentOptions = [];
    @track slaCommitment = '';
    @track customTerms = '';

    // Page 4: Employee Management & Admin Contacts
    @track employeesBookDirectly = '';
    @track requireBookingApprovals = '';
    @track maxTravelLimitOptions = [];
    @track maxTravelLimit = '';
    @track financeContactPhone = '';
    @track financeContactEmail = '';
    @track hrContactPhone = '';
    @track hrContactEmail = '';
    @track emergencyContactPhone = '';
    @track emergencyContactEmail = '';

    // Wire services for dynamic picklists
    @wire(getObjectInfo, { objectApiName: ACCOUNT_OBJECT })
    accountObjectInfo;

    @wire(getPicklistValues, { recordTypeId: "012Kd000001V5KEIA0", fieldApiName: ACCOUNT_BUSINESS_DIVISION_FIELD })
    wiredBusinessDivisionValues({ error, data }) {
        if (data) {
            this.businessDivisionOptions = data.values.map(item => ({
                label: item.label,
                value: item.value
            }));
        }
    }

    @wire(getPicklistValues, { recordTypeId: "012Kd000001V5KEIA0", fieldApiName: ACCOUNT_COMPANY_SIZE_FIELD })
    wiredCompanySizeValues({ error, data }) {
        if (data) {
            this.companySizeOptions = data.values.map(item => ({
                label: item.label,
                value: item.value
            }));
        }
    }

    @wire(getPicklistValues, { recordTypeId: "012Kd000001V5KEIA0", fieldApiName: ACCOUNT_PREFERRED_SERVICES_FIELD })
    wiredPreferredServicesValues({ error, data }) {
        if (data) {
            this.preferredServicesOptions = data.values.map(item => ({
                label: item.label,
                value: item.value
            }));
        }
    }

    @wire(getPicklistValues, { recordTypeId: "012Kd000001V5KEIA0", fieldApiName: ACCOUNT_URGENCY_TO_ONBOARD_FIELD })
    wiredUrgencyToOnboardValues({ error, data }) {
        if (data) {
            this.urgencyToOnboardOptions = data.values.map(item => ({
                label: item.label,
                value: item.value
            }));
        }
    }

    @wire(getPicklistValues, { recordTypeId: "012Kd000001V5KEIA0", fieldApiName: ACCOUNT_PREFERRED_AIRLINES_FIELD })
    wiredPreferredAirlinesValues({ error, data }) {
        if (data) {
            this.preferredAirlinesOptions = data.values.map(item => ({
                label: item.label,
                value: item.value
            }));
        }
    }

    @wire(getPicklistValues, { recordTypeId: "012Kd000001V5KEIA0", fieldApiName: ACCOUNT_PREFERRED_CLASS_FIELD })
    wiredPreferredClassValues({ error, data }) {
        if (data) {
            this.preferredClassOptions = data.values.map(item => ({
                label: item.label,
                value: item.value
            }));
        }
    }

    @wire(getPicklistValues, { recordTypeId: "012Kd000001V5KEIA0", fieldApiName: ACCOUNT_MAX_LAYOVER_ALLOWED_FIELD })
    wiredMaxLayoverAllowedValues({ error, data }) {
        if (data) {
            this.maxLayoverAllowedOptions = data.values.map(item => ({
                label: item.label,
                value: item.value
            }));
        }
    }

    @wire(getPicklistValues, { recordTypeId: "012Kd000001V5KEIA0", fieldApiName: ACCOUNT_HOTEL_CATEGORY_FIELD })
    wiredHotelCategoryValues({ error, data }) {
        if (data) {
            this.hotelCategoryOptions = data.values.map(item => ({
                label: item.label,
                value: item.value
            }));
        }
    }

    @wire(getPicklistValues, { recordTypeId: "012Kd000001V5KEIA0", fieldApiName: ACCOUNT_PREFERRED_HOTEL_CHAINS_FIELD })
    wiredPreferredHotelChainsValues({ error, data }) {
        if (data) {
            this.preferredHotelChainsOptions = data.values.map(item => ({
                label: item.label,
                value: item.value
            }));
        }
    }

    @wire(getPicklistValues, { recordTypeId: "012Kd000001V5KEIA0", fieldApiName: ACCOUNT_ROOM_TYPE_FIELD })
    wiredRoomTypeValues({ error, data }) {
        if (data) {
            this.roomTypeOptions = data.values.map(item => ({
                label: item.label,
                value: item.value
            }));
        }
    }

    @wire(getPicklistValues, { recordTypeId: "012Kd000001V5KEIA0", fieldApiName: ACCOUNT_MEAL_PREFERENCE_FIELD })
    wiredMealPreferenceValues({ error, data }) {
        if (data) {
            this.mealPreferenceOptions = data.values.map(item => ({
                label: item.label,
                value: item.value
            }));
        }
    }

    @wire(getPicklistValues, { recordTypeId: "012Kd000001V5KEIA0", fieldApiName: ACCOUNT_VISA_TYPE_FIELD })
    wiredVisaTypeValues({ error, data }) {
        if (data) {
            this.visaTypeOptions = data.values.map(item => ({
                label: item.label,
                value: item.value
            }));
        }
    }

    @wire(getPicklistValues, { recordTypeId: "012Kd000001V5KEIA0", fieldApiName: ACCOUNT_MODES_OF_TRANSPORT_FIELD })
    wiredModesOfTransportValues({ error, data }) {
        if (data) {
            this.modesOfTransportOptions = data.values.map(item => ({
                label: item.label,
                value: item.value
            }));
        }
    }

    @wire(getPicklistValues, { recordTypeId: "012Kd000001V5KEIA0", fieldApiName: ACCOUNT_PREFERRED_VENDORS_FIELD })
    wiredPreferredVendorsValues({ error, data }) {
        if (data) {
            this.preferredVendorsOptions = data.values.map(item => ({
                label: item.label,
                value: item.value
            }));
        }
    }

    @wire(getPicklistValues, { recordTypeId: "012Kd000001V5KEIA0", fieldApiName: ACCOUNT_SLA_COMMITMENT_FIELD })
    wiredSlaCommitmentValues({ error, data }) {
        if (data) {
            this.slaCommitmentOptions = data.values.map(item => ({
                label: item.label,
                value: item.value
            }));
        }
    }

    @wire(getPicklistValues, { recordTypeId: "012Kd000001V5KEIA0", fieldApiName: ACCOUNT_MAX_TRAVEL_LIMIT_FIELD })
    wiredMaxTravelLimitValues({ error, data }) {
        if (data) {
            this.maxTravelLimitOptions = data.values.map(item => ({
                label: item.label,
                value: item.value
            }));
        }
    }

    // Wire for Contact picklist values
    @wire(getObjectInfo, { objectApiName: CONTACT_OBJECT })
    contactObjectInfo;

    // @wire(getPicklistValues, { recordTypeId: '$contactObjectInfo.data.Corporate_Account', fieldApiName: CONTACT_DESIGNATION_FIELD })
    // wiredContactDesignationValues({ error, data }) {
    //     if (data) {
    //         this.contactDesignationOptions = data.values.map(item => ({
    //             label: item.label,
    //             value: item.value
    //         }));
    //     }
    // }

    // --- Computed properties for each page ---
    get isAccountPage1() { return this.currentStep === '1'; }
    get isAccountPage2() { return this.currentStep === '2'; }
    get isAccountPage3() { return this.currentStep === '3'; }
    get isAccountPage4() { return this.currentStep === '4'; }
    get isUploadPage() { return this.currentStep === '5'; }
    get showBack() { return parseInt(this.currentStep, 10) > 1 && parseInt(this.currentStep, 10) < 5; }
    get showNext() { return parseInt(this.currentStep, 10) < 4; }
    get showSaveAndContinue() { return this.currentStep === '4'; }
    get showFinish() { return this.currentStep === '5'; }
    get showAgreementFileUpload() { return this.agreementSigned === 'Yes'; }
    get showGroundTransportFields() { return this.requireGroundTransport === 'Yes'; }
    get showTravelPolicyUpload() {
        return this.travelPolicy === 'Yes';
    }

    // Computed properties for file display
    get hasTravelPolicyFiles() {
        return this.selectedFiles.travelPolicy && this.selectedFiles.travelPolicy.length > 0;
    }

    get hasAgreementFiles() {
        return this.selectedFiles.agreement && this.selectedFiles.agreement.length > 0;
    }

    get hasEmployeeFiles() {
        return this.selectedFiles.employee && this.selectedFiles.employee.length > 0;
    }

    get hasVisaDocumentsFiles() {
        return this.selectedFiles.visaDocuments && this.selectedFiles.visaDocuments.length > 0;
    }

    // --- Navigation handlers ---
    handleInputChange(event) {
        const field = event.target.dataset.id;
        let value = event.detail ? event.detail.value : event.target.value;
        this[field] = value;
        if(field == 'isDecisionMaker'){
            this.isDecisionMaker = event.target.checked;
        }
        console.log('field:', field);
        console.log('value:', value);
    }

    handleNext() {
        if (parseInt(this.currentStep, 10) < 4) {
            this.currentStep = (parseInt(this.currentStep, 10) + 1).toString();
        }
    }

    handleBack() {
        if (parseInt(this.currentStep, 10) > 1) {
            this.currentStep = (parseInt(this.currentStep, 10) - 1).toString();
        }
    }

    handleFileInputChange(event) {
        const files = event.target.files;
        const category = event.target.dataset.category;
        if (files && files.length > 0) {
            // Append new files to existing array, avoiding duplicates by name
            const existing = this.selectedFiles[category] || [];
            const newFiles = Array.from(files);
            const allFiles = [...existing];
            newFiles.forEach(newFile => {
                if (!allFiles.some(f => f.name === newFile.name && f.size === newFile.size)) {
                    allFiles.push(newFile);
                }
            });
            this.selectedFiles = { ...this.selectedFiles, [category]: allFiles };
        }
    }

    handleClose() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Account',
                actionName: 'home'
            }
        });
    }

    handleAddressChange(event) {
        const { street, city, province, postalCode, country } = event.detail;
        this.headOfficeStreet = street;
        this.headOfficeCity = city;
        this.headOfficeState = province;
        this.headOfficePostalCode = postalCode;
        this.headOfficeCountry = country;
    }

    @track showConfirmationPage = false;
    @track continueWithBookings = '';
    @track showTravelBookingWizard = false;

    async handleSaveAndBook() {
        this.isLoading = true;
        try {
            // Prepare Account and Contact fields
            const accountFields = {
                RecordTypeId: "012Kd000001V5KEIA0",
                Name: this.companyName,
                Business_Division__c: this.businessDivision,
                Company_Size__c: this.companySize,
                BillingStreet: this.headOfficeStreet,
                BillingCity: this.headOfficeCity,
                BillingState: this.headOfficeState,
                BillingPostalCode: this.headOfficePostalCode,
                BillingCountry: this.headOfficeCountry,
                GSTIN__c: this.gstin,
                Travel_Volume__c: this.travelVolume,
                Preferred_Services__c: this.preferredServices.join(';'),
                Urgency_to_Onboard__c: this.urgencyToOnboard,
                Preferred_Airlines__c: this.preferredAirlines.join(';'),
                Preferred_Class__c: this.preferredClass,
                Red_Eye_Flights_Allowed__c: this.redEyeFlightsAllowed,
                Advance_Booking_Window__c: this.advanceBookingWindow ? this.advanceBookingWindow : 0,
                Max_Layover_Allowed__c: this.maxLayoverAllowed,
                Frequent_Routes__c: this.frequentRoutes,
                Hotel_Category__c: this.hotelCategory,
                Preferred_Hotel_Chains__c: this.preferredHotelChains.join(';'),
                Room_Type__c: this.roomType,
                Meal_Preference__c: this.mealPreference,
                Blacklisted_Hotels__c: this.blacklistedHotels,
                Visa_Assistance_Required__c: this.visaAssistanceRequired,
                Visa_Type__c: this.visaType,
                Visa_Documents__c: this.visaDocuments,
                Require_Ground_Transport__c: this.requireGroundTransport,
                Modes_of_Transport__c: this.modesOfTransport.join(';'),
                Preferred_Vendors__c: this.preferredVendors,
                Agreement_Signed__c: this.agreementSigned,
                Agreement_Start_Date__c: this.agreementStartDate,
                Agreement_End_Date__c: this.agreementEndDate,
                SLA_Commitment__c: this.slaCommitment,
                Custom_Terms__c: this.customTerms,
                Employees_Book_Directly__c: this.employeesBookDirectly,
                Require_Booking_Approvals__c: this.requireBookingApprovals,
                Max_Travel_Limit__c: this.maxTravelLimit
            };
            const contactFields = {
                FirstName: this.contactFirstName,
                LastName: this.contactLastName,
                Title: this.contactDesignation,
                Is_Primary_Contact__c: true,
                Email: this.contactEmail,
                Is_Decision_Maker__c: this.isDecisionMaker
            };
            const financeContactFields = {
                Email: this.financeContactEmail,
                Phone: this.financeContactPhone
            };
            const hrContactFields = {
                Email: this.hrContactEmail,
                Phone: this.hrContactPhone
            };
            const emergencyContactFields = {
                Email: this.emergencyContactEmail,
                Phone: this.emergencyContactPhone
            };
            // Call Apex method
            const result = await createAccountAndContact({ accountFields, contactFields, financeContactFields, hrContactFields, emergencyContactFields });
            if (!result.success) {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Failed to create records: ' + result.error,
                        variant: 'error'
                    })
                );
                this.handleClose();
                return;
            }
            this.accountRecordId = result.accountId;
            // Upload files for each category
            await this.uploadAllFilesToAccount(result.accountId);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Account, Contact, and files uploaded successfully!',
                    variant: 'success'
                })
            );
            // Navigate to the Travel Booking Wizard app page (replace with your app page/tab API name)
            this[NavigationMixin.Navigate]({
                type: 'standard__navItemPage',
                attributes: {
                    apiName: 'Travel_Booking_Dashboard' // Replace with your app page/tab API name
                }
            });
            this.dispatchEvent(new CloseActionScreenEvent());
        } catch (error) {
            console.error('Error creating records or uploading files:', error);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Failed to create records or upload files: ' + (error.body && error.body.message ? error.body.message : error.message),
                    variant: 'error'
                })
            );
            this.handleClose();
        } finally {
            this.isLoading = false;
        }
    }

    async handleSaveAndClose() {
        this.isLoading = true;
        try {
            // Prepare Account and Contact fields
            const accountFields = {
                RecordTypeId: "012Kd000001V5KEIA0",
                Name: this.companyName,
                Business_Division__c: this.businessDivision,
                Company_Size__c: this.companySize,
                BillingStreet: this.headOfficeStreet,
                BillingCity: this.headOfficeCity,
                BillingState: this.headOfficeState,
                BillingPostalCode: this.headOfficePostalCode,
                BillingCountry: this.headOfficeCountry,
                GSTIN__c: this.gstin,
                Travel_Volume__c: this.travelVolume,
                Preferred_Services__c: this.preferredServices.join(';'),
                Urgency_to_Onboard__c: this.urgencyToOnboard,
                Preferred_Airlines__c: this.preferredAirlines.join(';'),
                Preferred_Class__c: this.preferredClass,
                Red_Eye_Flights_Allowed__c: this.redEyeFlightsAllowed,
                Advance_Booking_Window__c: this.advanceBookingWindow ? this.advanceBookingWindow : 0,
                Max_Layover_Allowed__c: this.maxLayoverAllowed,
                Frequent_Routes__c: this.frequentRoutes,
                Hotel_Category__c: this.hotelCategory,
                Preferred_Hotel_Chains__c: this.preferredHotelChains.join(';'),
                Room_Type__c: this.roomType,
                Meal_Preference__c: this.mealPreference,
                Blacklisted_Hotels__c: this.blacklistedHotels,
                Visa_Assistance_Required__c: this.visaAssistanceRequired,
                Visa_Type__c: this.visaType,
                Visa_Documents__c: this.visaDocuments,
                Require_Ground_Transport__c: this.requireGroundTransport,
                Modes_of_Transport__c: this.modesOfTransport.join(';'),
                Preferred_Vendors__c: this.preferredVendors,
                Agreement_Signed__c: this.agreementSigned,
                Agreement_Start_Date__c: this.agreementStartDate,
                Agreement_End_Date__c: this.agreementEndDate,
                SLA_Commitment__c: this.slaCommitment,
                Custom_Terms__c: this.customTerms,
                Employees_Book_Directly__c: this.employeesBookDirectly,
                Require_Booking_Approvals__c: this.requireBookingApprovals,
                Max_Travel_Limit__c: this.maxTravelLimit
            };
            const contactFields = {
                FirstName: this.contactFirstName,
                LastName: this.contactLastName,
                Title: this.contactDesignation,
                Is_Primary_Contact__c: true,
                Email: this.contactEmail,
                Is_Decision_Maker__c: this.isDecisionMaker
            };
            const financeContactFields = {
                Email: this.financeContactEmail,
                Phone: this.financeContactPhone
            };
            const hrContactFields = {
                Email: this.hrContactEmail,
                Phone: this.hrContactPhone
            };
            const emergencyContactFields = {
                Email: this.emergencyContactEmail,
                Phone: this.emergencyContactPhone
            };
            // Call Apex method
            const result = await createAccountAndContact({ accountFields, contactFields, financeContactFields, hrContactFields, emergencyContactFields });
            if (!result.success) {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Failed to create records: ' + result.error,
                        variant: 'error'
                    })
                );
                this.handleClose();
                return;
            }
            this.accountRecordId = result.accountId;
            // Upload files for each category
            await this.uploadAllFilesToAccount(result.accountId);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Account, Contact, and files uploaded successfully!',
                    variant: 'success'
                })
            );
            // Navigate to the Account details page
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: result.accountId,
                    objectApiName: 'Account',
                    actionName: 'view'
                }
            });
            this.dispatchEvent(new CloseActionScreenEvent());
        } catch (error) {
            console.error('Error creating records or uploading files:', error);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Failed to create records or upload files: ' + (error.body && error.body.message ? error.body.message : error.message),
                    variant: 'error'
                })
            );
            this.handleClose();
        } finally {
            this.isLoading = false;
        }
    }

    async uploadAllFilesToAccount(accountId) {
        // Loop through each file category and upload files using Apex
        for (const category of Object.keys(this.selectedFiles)) {
            const files = this.selectedFiles[category];
            for (const file of files) {
                // Read file as base64
                const base64 = await this.readFileAsBase64(file);
                // Call Apex to upload
                await uploadFileToAccount({
                    parentId: accountId,
                    fileName: file.name,
                    base64Data: base64,
                    contentType: file.type
                });
            }
        }
    }

    readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                // Remove the prefix 'data:*/*;base64,'
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    }

    removeFile(event) {
        // Use currentTarget to get the button, not the icon
        const category = event.currentTarget.dataset.category;
        const index = parseInt(event.currentTarget.dataset.index, 10);
        if (category && !isNaN(index)) {
            const files = [...this.selectedFiles[category]];
            files.splice(index, 1);
            this.selectedFiles = { ...this.selectedFiles, [category]: files };
        }
    }

    get formattedAgreementStartDate() {
        if (!this.agreementStartDate) return '';
        const date = new Date(this.agreementStartDate);
        const day = String(date.getDate()).padStart(2, '0');
        const month = date.toLocaleString('en-US', { month: 'short' });
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    get formattedAgreementEndDate() {
        if (!this.agreementEndDate) return '';
        const date = new Date(this.agreementEndDate);
        const day = String(date.getDate()).padStart(2, '0');
        const month = date.toLocaleString('en-US', { month: 'short' });
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    handleConfirmationChange(event) {
        this.continueWithBookings = event.detail.value;
    }

    handleConfirmationSubmit() {
        if (this.continueWithBookings === 'Yes') {
            this.showTravelBookingWizard = true;
        } else if (this.continueWithBookings === 'No') {
            // Navigate to Case Details page (replace with your actual navigation logic)
            this[NavigationMixin.Navigate]({
                type: 'standard__objectPage',
                attributes: {
                    objectApiName: 'Case',
                    actionName: 'home'
                }
            });
        }
    }

    get isConfirmationPage() {
        return this.currentStep === '5' && this.showConfirmationPage;
    }

    get confirmationOptions() {
        return [
            { label: 'Yes', value: 'Yes' },
            { label: 'No', value: 'No' }
        ];
    }
}