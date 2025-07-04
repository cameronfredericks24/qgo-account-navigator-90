import { LightningElement, track, api, wire } from 'lwc';
import getAccountBookingSummary from '@salesforce/apex/Account360DashboardController.getAccountBookingSummary';
import getAccountDetails from '@salesforce/apex/Account360DashboardController.getAccountDetails';
import getAccount360Details from '@salesforce/apex/Account360DashboardController.getAccount360Details';
import { getRecord } from 'lightning/uiRecordApi';

const ACCOUNT_FIELDS = [
    'Account.Name',
    'Account.Owner.Name',
    'Account.Phone',
    'Account.Website',
    'Account.Industry',
    'Account.AnnualRevenue',
    'Account.NumberOfEmployees',
    'Account.Type',
    'Account.AccountNumber'
];

export default class Account360Dashboard extends LightningElement {
    @api recordId;
    @track accountSummary = {};
    @track statusCounts = {};
    @track accountDetails = {};
    @track showHeader = false;
    @track contactFirstName = '';
    @track contactLastName = '';
    @track totalPassengers = 0;

    connectedCallback() {
        if (this.recordId) {
            this.showHeader = true;
            this.loadAccountDetails(this.recordId);
            this.loadAccountSummary(this.recordId);
        }
    }

    @wire(getRecord, { recordId: '$recordId', fields: ACCOUNT_FIELDS })
    wiredAccount({ error, data }) {
        if (data) {
            this.accountDetails = this.parseAccountData(data);
        }
    }

    loadAccountSummary(accountId) {
        getAccountBookingSummary({ accountId })
            .then(result => {
                this.accountSummary = result;
                this.statusCounts = result.statusCounts || {};
            })
            .catch(error => {
                this.accountSummary = {};
                this.statusCounts = {};
            });
    }

    loadAccountDetails(accountId) {
        getAccount360Details({ accountId })
            .then(data => {
                this.accountDetails = {
                    Name: data.Name,
                    AccountNumber: data.AccountNumber,
                    Type: data.Type,
                    Industry: data.Industry
                };
                this.contactFirstName = data.ContactFirstName;
                this.contactLastName = data.ContactLastName;
                this.totalPassengers = data.TotalPassengers;
            })
            .catch(() => {
                this.accountDetails = {};
                this.contactFirstName = '';
                this.contactLastName = '';
                this.totalPassengers = 0;
            });
    }

    parseAccountData(data) {
        return {
            Name: data.fields.Name.value,
            AccountNumber: data.fields.AccountNumber && data.fields.AccountNumber.value,
            Type: data.fields.Type && data.fields.Type.value,
            Industry: data.fields.Industry && data.fields.Industry.value,
            Phone: data.fields.Phone && data.fields.Phone.value,
            NumberOfEmployees: data.fields.NumberOfEmployees && data.fields.NumberOfEmployees.value
        };
    }

    get showDashboard() {
        return this.recordId;
    }

    get accountNumberDisplay() {
        return this.accountDetails.AccountNumber ? this.accountDetails.AccountNumber : '-';
    }
    get typeDisplay() {
        return this.accountDetails.Type ? this.accountDetails.Type : '-';
    }
    get industryDisplay() {
        return this.accountDetails.Industry ? this.accountDetails.Industry : '-';
    }
    get phoneDisplay() {
        return this.accountDetails.Phone ? this.accountDetails.Phone : '-';
    }
    get contactDisplay() {
        if (this.contactFirstName || this.contactLastName) {
            return `${this.contactFirstName || ''} ${this.contactLastName || ''}`.trim();
        }
        return '-';
    }
    get employeesDisplay() {
        return this.totalPassengers !== undefined && this.totalPassengers !== null ? this.totalPassengers : '-';
    }
} 