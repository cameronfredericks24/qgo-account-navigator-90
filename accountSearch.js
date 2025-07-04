import { LightningElement, track, api } from 'lwc';
import searchAccounts from '@salesforce/apex/AccountLookupController.searchAccounts';

export default class AccountSearch extends LightningElement {
    @api label = 'Corporate Account';
    @track searchTerm = '';
    @track accounts = [];
    @track selectedAccount = null;
    @track showDropdown = false;
    @track isLoading = false;
    @track error = '';

    debounceTimeout;

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

    handleSelect(event) {
        const accountId = event.currentTarget.dataset.id;
        const accountName = event.currentTarget.dataset.name;
        this.selectedAccount = { Id: accountId, Name: accountName };
        this.showDropdown = false;
        this.dispatchEvent(new CustomEvent('accountselected', {
            detail: { accountId, accountName }
        }));
    }

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
}