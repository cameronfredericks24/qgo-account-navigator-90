import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import searchAccounts from '@salesforce/apex/AccountLookupController.searchAccounts';

export default class EnhancedAccountSearch extends NavigationMixin(LightningElement) {
    @api label = 'Corporate Account';
    @track searchTerm = '';
    @track accounts = [];
    @track selectedAccount = null;
    @track showDropdown = false;
    @track isLoading = false;
    @track error = '';
    @track showAccountCreatedSuccess = false;

    // Debounce timeout for search
    debounceTimeout;

    // Lifecycle hooks from original accountSearch component
    connectedCallback() {
        // Add click outside listener
        document.addEventListener('click', this.handleClickOutside.bind(this));
    }

    disconnectedCallback() {
        // Remove click outside listener
        document.removeEventListener('click', this.handleClickOutside.bind(this));
    }

    handleClickOutside(event) {
        if (!this.template.contains(event.target)) {
            this.showDropdown = false;
        }
    }

    // Main search handler integrating with existing Salesforce functionality
    handleInputChange(event) {
        console.log('search inside handleInputChange');
        this.searchTerm = event.target.value;
        this.error = '';
        if (this.debounceTimeout) clearTimeout(this.debounceTimeout);
        if (this.searchTerm.length > 1) {
            this.isLoading = true;
            this.debounceTimeout = setTimeout(() => {
                searchAccounts({ searchTerm: this.searchTerm })
                    .then(result => {
                        this.accounts = result;
                        console.log('search inside handleInputChange', JSON.stringify(this.accounts));
                        this.showDropdown = result && result.length > 0;
                        this.isLoading = false;
                    })
                    .catch(error => {
                        this.accounts = [];
                        this.showDropdown = false;
                        this.isLoading = false;
                        this.error = 'Error searching accounts';
                    });
            }, 300);
        } else {
            this.accounts = [];
            this.showDropdown = false;
            this.isLoading = false;
        }
    }

    // Account selection handler from original component
    handleSelect(event) {
        const accountId = event.currentTarget.dataset.id;
        const accountName = event.currentTarget.dataset.name;
        this.selectedAccount = { Id: accountId, Name: accountName };
        this.showDropdown = false;
        this.dispatchEvent(new CustomEvent('accountselected', {
            detail: { accountId, accountName }
        }));
    }

    // Clear selection functionality
    clearSelection() {
        this.selectedAccount = null;
        this.searchTerm = '';
        this.accounts = [];
        this.showDropdown = false;
        this.error = '';
    }

    // Add focus handler to show dropdown if there are accounts
    handleInputFocus() {
        if (this.accounts && this.accounts.length > 0) {
            this.showDropdown = true;
        }
    }

    // Enhanced handlers for new UI functionality
    handleCreateAccount() {
        // Dispatch event to parent to open account creation wizard
        const createEvent = new CustomEvent('createaccount');
        this.dispatchEvent(createEvent);
    }

    handleCreateBooking() {
        if (this.selectedAccount) {
            // Dispatch account selected event for booking creation
            this.dispatchEvent(new CustomEvent('accountselected', {
                detail: { 
                    accountId: this.selectedAccount.Id, 
                    accountName: this.selectedAccount.Name 
                }
            }));
        }
    }

    handleBookNewAccount() {
        this.hideSuccessMessage();
        // Trigger booking creation for newly created account
        this.handleCreateBooking();
    }

    hideSuccessMessage() {
        this.showAccountCreatedSuccess = false;
    }

    // Public API methods for parent component integration
    @api
    showAccountCreatedSuccess() {
        this.showAccountCreatedSuccess = true;
    }

    @api
    refreshAccounts() {
        // Optional: refresh account data if needed
        this.clearSelection();
    }

    // Utility Methods for Toast Messages
    showToast(title, message, variant = 'info') {
        const event = new ShowToastEvent({
            title,
            message,
            variant
        });
        this.dispatchEvent(event);
    }
}