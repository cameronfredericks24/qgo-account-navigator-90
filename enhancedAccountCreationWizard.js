import { LightningElement, track, api, wire } from 'lwc';
import { CloseActionScreenEvent } from 'lightning/actions';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getPicklistValues, getObjectInfo } from 'lightning/uiObjectInfoApi';
import createAccountAndContact from '@salesforce/apex/CustomerOnboardingWizardController.createAccountAndContact';
import uploadFileToAccount from '@salesforce/apex/CustomerOnboardingWizardController.uploadFileToAccount';

// Import schema references
import ACCOUNT_OBJECT from '@salesforce/schema/Account';
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
import ACCOUNT_SLA_COMMITMENT_FIELD from '@salesforce/schema/Account.SLA_Commitment__c';
import ACCOUNT_MAX_TRAVEL_LIMIT_FIELD from '@salesforce/schema/Account.Max_Travel_Limit__c';

export default class EnhancedAccountCreationWizard extends NavigationMixin(LightningElement) {
    @track currentStep = '1';
    @track isLoading = false;
    @track accountRecordId = null;

    // File upload tracking
    @track selectedFiles = {
        travelPolicy: [],
        agreement: [],
        employee: [],
        visaDocuments: []
    };

    // Form Data - Step 1: Company Details
    @track companyName = '';
    @track businessDivision = 'Corporate';
    @track businessDivisionOptions = [];
    @track companySize = '';
    @track companySizeOptions = [];
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
    @track contactEmail = '';
    @track isDecisionMaker = false;

    // Travel Overview
    @track travelVolume = '';
    @track preferredServicesOptions = [];
    @track preferredServices = [];
    @track urgencyToOnboardOptions = [];
    @track urgencyToOnboard = '';
    @track travelPolicy = '';

    // Step 2: Travel Preferences
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

    // Step 3: Service Agreement
    @track agreementSigned = '';
    @track agreementStartDate = '';
    @track agreementEndDate = '';
    @track slaCommitmentOptions = [];
    @track slaCommitment = '';
    @track customTerms = '';

    // Step 4: Team & Administration
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

    // Static Options
    yesNoOptions = [
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' }
    ];

    // Wire Services for Picklist Values
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

    // Computed Properties
    get isAccountPage1() { return this.currentStep === '1'; }
    get isAccountPage2() { return this.currentStep === '2'; }
    get isAccountPage3() { return this.currentStep === '3'; }
    get isAccountPage4() { return this.currentStep === '4'; }
    get showBack() { return parseInt(this.currentStep, 10) > 1; }
    get showNext() { return parseInt(this.currentStep, 10) < 4; }
    get showSaveAndContinue() { return this.currentStep === '4'; }

    get showTravelPolicyUpload() {
        return this.travelPolicy === 'Yes';
    }

    get showAgreementFileUpload() {
        return this.agreementSigned === 'Yes';
    }

    // File handling computed properties
    get hasTravelPolicyFiles() {
        return this.selectedFiles.travelPolicy && this.selectedFiles.travelPolicy.length > 0;
    }

    get hasAgreementFiles() {
        return this.selectedFiles.agreement && this.selectedFiles.agreement.length > 0;
    }

    get hasEmployeeFiles() {
        return this.selectedFiles.employee && this.selectedFiles.employee.length > 0;
    }

    // Event Handlers
    handleInputChange(event) {
        const field = event.target.dataset.id;
        let value = event.detail ? event.detail.value : event.target.value;
        
        if (field === 'isDecisionMaker') {
            this.isDecisionMaker = event.target.checked;
        } else {
            this[field] = value;
        }
    }

    handleAddressChange(event) {
        const { street, city, province, postalCode, country } = event.detail;
        this.headOfficeStreet = street;
        this.headOfficeCity = city;
        this.headOfficeState = province;
        this.headOfficePostalCode = postalCode;
        this.headOfficeCountry = country;
    }

    handleFileInputChange(event) {
        const files = event.target.files;
        const category = event.target.dataset.category;
        if (files && files.length > 0) {
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

    removeFile(event) {
        const category = event.target.dataset.category;
        const index = parseInt(event.target.dataset.index, 10);
        const files = [...this.selectedFiles[category]];
        files.splice(index, 1);
        this.selectedFiles = { ...this.selectedFiles, [category]: files };
    }

    // Navigation Handlers
    handleNext() {
        if (this.validateCurrentStep()) {
            if (parseInt(this.currentStep, 10) < 4) {
                this.currentStep = (parseInt(this.currentStep, 10) + 1).toString();
            }
        }
    }

    handleBack() {
        if (parseInt(this.currentStep, 10) > 1) {
            this.currentStep = (parseInt(this.currentStep, 10) - 1).toString();
        }
    }

    handleClose() {
        this.dispatchEvent(new CloseActionScreenEvent());
    }

    // Save Handlers
    async handleSaveAndClose() {
        await this.saveAccount('close');
    }

    async handleSaveAndBook() {
        await this.saveAccount('book');
    }

    async saveAccount(action) {
        if (!this.validateAllSteps()) {
            return;
        }

        this.isLoading = true;
        try {
            // Prepare Account fields
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
                Red_Eye_Flights_Allowed__c: this.redEyeFlightsAllowed === 'Yes',
                Advance_Booking_Window__c: this.advanceBookingWindow ? parseInt(this.advanceBookingWindow, 10) : 0,
                Max_Layover_Allowed__c: this.maxLayoverAllowed,
                Frequent_Routes__c: this.frequentRoutes,
                Hotel_Category__c: this.hotelCategory,
                Preferred_Hotel_Chains__c: this.preferredHotelChains.join(';'),
                Room_Type__c: this.roomType,
                Meal_Preference__c: this.mealPreference,
                Blacklisted_Hotels__c: this.blacklistedHotels,
                Agreement_Signed__c: this.agreementSigned === 'Yes',
                Agreement_Start_Date__c: this.agreementStartDate,
                Agreement_End_Date__c: this.agreementEndDate,
                SLA_Commitment__c: this.slaCommitment,
                Custom_Terms__c: this.customTerms,
                Employees_Book_Directly__c: this.employeesBookDirectly === 'Yes',
                Require_Booking_Approvals__c: this.requireBookingApprovals === 'Yes',
                Max_Travel_Limit__c: this.maxTravelLimit
            };

            // Prepare Contact fields
            const contactFields = {
                FirstName: this.contactFirstName,
                LastName: this.contactLastName,
                Title: this.contactDesignation,
                Email: this.contactEmail,
                Is_Primary_Contact__c: true,
                Decision_Maker__c: this.isDecisionMaker
            };

            // Prepare admin contact fields
            const financeContactFields = {
                Phone: this.financeContactPhone,
                Email: this.financeContactEmail
            };

            const hrContactFields = {
                Phone: this.hrContactPhone,
                Email: this.hrContactEmail
            };

            const emergencyContactFields = {
                Phone: this.emergencyContactPhone,
                Email: this.emergencyContactEmail
            };

            // Create Account and Contacts
            const result = await createAccountAndContact({
                accountFields,
                contactFields,
                financeContactFields,
                hrContactFields,
                emergencyContactFields
            });

            if (result.success) {
                this.accountRecordId = result.accountId;
                
                // Upload files if any
                await this.uploadFiles();

                // Show success message
                this.showToast('Success', 'Corporate travel account created successfully!', 'success');

                // Dispatch success event
                const successEvent = new CustomEvent('accountcreated', {
                    detail: {
                        action,
                        accountId: result.accountId,
                        accountName: this.companyName
                    }
                });
                this.dispatchEvent(successEvent);

                // Close modal or navigate
                if (action === 'close') {
                    this.handleClose();
                } else {
                    // Navigate to booking creation
                    this[NavigationMixin.Navigate]({
                        type: 'standard__component',
                        attributes: {
                            componentName: 'c__travelBookingWizard'
                        },
                        state: {
                            accountId: result.accountId
                        }
                    });
                }
            } else {
                throw new Error(result.error || 'Failed to create account');
            }
        } catch (error) {
            this.showToast('Error', error.message, 'error');
        } finally {
            this.isLoading = false;
        }
    }

    async uploadFiles() {
        // Upload files for each category
        const categories = ['travelPolicy', 'agreement', 'employee'];
        
        for (const category of categories) {
            const files = this.selectedFiles[category] || [];
            for (const file of files) {
                try {
                    const base64Data = await this.convertFileToBase64(file);
                    await uploadFileToAccount({
                        parentId: this.accountRecordId,
                        fileName: file.name,
                        base64Data: base64Data.split(',')[1], // Remove data URL prefix
                        contentType: file.type
                    });
                } catch (error) {
                    console.error('File upload error:', error);
                }
            }
        }
    }

    convertFileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    // Validation
    validateCurrentStep() {
        const currentStepNum = parseInt(this.currentStep, 10);
        
        switch (currentStepNum) {
            case 1:
                return this.validateStep1();
            case 2:
                return this.validateStep2();
            case 3:
                return this.validateStep3();
            case 4:
                return this.validateStep4();
            default:
                return true;
        }
    }

    validateStep1() {
        if (!this.companyName || !this.businessDivision || !this.contactFirstName || !this.contactLastName || !this.contactEmail) {
            this.showToast('Validation Error', 'Please fill in all required fields', 'error');
            return false;
        }
        return true;
    }

    validateStep2() {
        // Add specific validations for travel preferences if needed
        return true;
    }

    validateStep3() {
        // Add specific validations for service agreement if needed
        return true;
    }

    validateStep4() {
        // Add specific validations for team setup if needed
        return true;
    }

    validateAllSteps() {
        return this.validateStep1() && this.validateStep2() && this.validateStep3() && this.validateStep4();
    }

    // Utility Methods
    showToast(title, message, variant = 'info') {
        const event = new ShowToastEvent({
            title,
            message,
            variant
        });
        this.dispatchEvent(event);
    }
}