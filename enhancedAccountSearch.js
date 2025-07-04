import { LightningElement, track, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import searchAccounts from '@salesforce/apex/AccountLookupController.searchAccounts';

export default class EnhancedAccountSearch extends NavigationMixin(LightningElement) {
    @api showAccountDetails = false;
    @api onAccountSelected;
    @api onResetView;

    // Search and Filter State
    @track searchTerm = '';
    @track industryFilter = '';
    @track statusFilter = '';
    @track sortBy = 'name';
    @track isSearching = false;
    @track isLoading = false;

    // Results State
    @track allAccounts = [];
    @track filteredAccounts = [];
    @track showSuccessMessage = false;

    // Pagination State
    @track currentPage = 1;
    @track pageSize = 6;
    @track totalPages = 1;

    // Search debounce
    searchTimeout;

    // Filter Options
    industryOptions = [
        { label: 'All Industries', value: '' },
        { label: 'Technology', value: 'Technology' },
        { label: 'Finance', value: 'Finance' },
        { label: 'Healthcare', value: 'Healthcare' },
        { label: 'Manufacturing', value: 'Manufacturing' },
        { label: 'Retail', value: 'Retail' },
        { label: 'Education', value: 'Education' },
        { label: 'Government', value: 'Government' }
    ];

    statusOptions = [
        { label: 'All Status', value: '' },
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Pending', value: 'pending' },
        { label: 'Prospect', value: 'prospect' }
    ];

    sortOptions = [
        { label: 'Company Name', value: 'name' },
        { label: 'Last Activity', value: 'activity' },
        { label: 'Total Bookings', value: 'bookings' },
        { label: 'Travel Volume', value: 'volume' },
        { label: 'Industry', value: 'industry' }
    ];

    // Mock data for demonstration - Replace with actual Salesforce data
    mockAccounts = [
        {
            id: '001000001',
            companyName: 'TechCorp Global Solutions',
            contactPerson: 'Rajesh Kumar',
            email: 'rajesh.kumar@techcorp.com',
            phone: '+91 98765 43210',
            industry: 'Technology',
            lastActivity: '2 days ago',
            status: 'active',
            totalBookings: 45,
            travelVolume: '50+',
            preferredClass: 'Business',
            hotelCategory: '5-Star',
            visaAssistance: true,
            statusIcon: 'utility:success',
            statusIconClass: 'slds-icon-container slds-icon-container_circle slds-icon-utility-success slds-icon_inverse',
            statusLabel: 'Active',
            statusBadgeClass: 'slds-badge slds-theme_success'
        },
        {
            id: '001000002',
            companyName: 'Global Finance Enterprises',
            contactPerson: 'Priya Sharma',
            email: 'priya.sharma@globalfinance.com',
            phone: '+91 87654 32109',
            industry: 'Finance',
            lastActivity: '1 week ago',
            status: 'active',
            totalBookings: 32,
            travelVolume: '30-40',
            preferredClass: 'Premium Economy',
            hotelCategory: '4-Star',
            visaAssistance: true,
            statusIcon: 'utility:success',
            statusIconClass: 'slds-icon-container slds-icon-container_circle slds-icon-utility-success slds-icon_inverse',
            statusLabel: 'Active',
            statusBadgeClass: 'slds-badge slds-theme_success'
        },
        {
            id: '001000003',
            companyName: 'HealthCare Plus Network',
            contactPerson: 'Dr. Amit Patel',
            email: 'amit.patel@healthcareplus.com',
            phone: '+91 76543 21098',
            industry: 'Healthcare',
            lastActivity: '3 weeks ago',
            status: 'inactive',
            totalBookings: 18,
            travelVolume: '10-20',
            preferredClass: 'Economy',
            hotelCategory: '3-Star',
            visaAssistance: false,
            statusIcon: 'utility:pause',
            statusIconClass: 'slds-icon-container slds-icon-container_circle slds-icon-utility-pause',
            statusLabel: 'Inactive',
            statusBadgeClass: 'slds-badge slds-theme_warning'
        },
        {
            id: '001000004',
            companyName: 'Manufacturing Excellence Ltd',
            contactPerson: 'Sunita Reddy',
            email: 'sunita.reddy@manufexcel.com',
            phone: '+91 65432 10987',
            industry: 'Manufacturing',
            lastActivity: '5 days ago',
            status: 'pending',
            totalBookings: 8,
            travelVolume: '5-10',
            preferredClass: 'Economy',
            hotelCategory: '3-Star',
            visaAssistance: true,
            statusIcon: 'utility:clock',
            statusIconClass: 'slds-icon-container slds-icon-container_circle slds-icon-utility-clock',
            statusLabel: 'Pending',
            statusBadgeClass: 'slds-badge slds-theme_info'
        },
        {
            id: '001000005',
            companyName: 'Retail Chain Dynamics',
            contactPerson: 'Vikram Singh',
            email: 'vikram.singh@retailchain.com',
            phone: '+91 54321 09876',
            industry: 'Retail',
            lastActivity: '1 day ago',
            status: 'active',
            totalBookings: 67,
            travelVolume: '80+',
            preferredClass: 'Business',
            hotelCategory: '5-Star',
            visaAssistance: true,
            statusIcon: 'utility:success',
            statusIconClass: 'slds-icon-container slds-icon-container_circle slds-icon-utility-success slds-icon_inverse',
            statusLabel: 'Active',
            statusBadgeClass: 'slds-badge slds-theme_success'
        },
        {
            id: '001000006',
            companyName: 'Education Innovators Network',
            contactPerson: 'Meera Joshi',
            email: 'meera.joshi@eduinnovators.com',
            phone: '+91 43210 98765',
            industry: 'Education',
            lastActivity: '2 weeks ago',
            status: 'prospect',
            totalBookings: 0,
            travelVolume: 'New',
            preferredClass: 'Economy',
            hotelCategory: '3-Star',
            visaAssistance: false,
            statusIcon: 'utility:new',
            statusIconClass: 'slds-icon-container slds-icon-container_circle slds-icon-utility-new',
            statusLabel: 'Prospect',
            statusBadgeClass: 'slds-badge slds-theme_lightest'
        }
    ];

    // Computed Properties
    get filteredAccountCount() {
        return this.filteredAccounts.length;
    }

    get hasResults() {
        return this.filteredAccounts.length > 0;
    }

    get showPagination() {
        return this.totalPages > 1;
    }

    get isFirstPage() {
        return this.currentPage === 1;
    }

    get isLastPage() {
        return this.currentPage === this.totalPages;
    }

    get paginatedAccounts() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        return this.filteredAccounts.slice(start, end);
    }

    // Lifecycle
    connectedCallback() {
        this.loadInitialData();
    }

    // Data Loading
    async loadInitialData() {
        this.isLoading = true;
        try {
            // Use mock data for now - replace with actual Salesforce data
            this.allAccounts = this.mockAccounts;
            this.applyFilters();
        } catch (error) {
            this.showToast('Error', 'Failed to load accounts', 'error');
        } finally {
            this.isLoading = false;
        }
    }

    // Search Handlers
    handleSearchInput(event) {
        const searchValue = event.target.value;
        this.searchTerm = searchValue;
        
        // Clear existing timeout
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        // Set loading state for immediate feedback
        this.isSearching = true;

        // Debounce search
        this.searchTimeout = setTimeout(() => {
            this.performSearch();
            this.isSearching = false;
        }, 300);
    }

    handleSearchFocus() {
        // Optional: Show search suggestions or recent searches
    }

    async performSearch() {
        if (this.searchTerm.length < 2) {
            this.applyFilters();
            return;
        }

        try {
            // Replace with actual Salesforce search
            // const results = await searchAccounts({ searchTerm: this.searchTerm });
            
            // For now, filter mock data
            this.applyFilters();
        } catch (error) {
            this.showToast('Error', 'Search failed', 'error');
        }
    }

    // Filter Handlers
    handleFilterChange(event) {
        const field = event.target.dataset.field;
        const value = event.detail.value;
        
        switch (field) {
            case 'industry':
                this.industryFilter = value;
                break;
            case 'status':
                this.statusFilter = value;
                break;
            case 'sort':
                this.sortBy = value;
                break;
        }
        
        this.applyFilters();
    }

    handleQuickFilter(event) {
        const filter = event.target.dataset.filter;
        
        switch (filter) {
            case 'active':
                this.statusFilter = 'active';
                break;
            case 'high-volume':
                this.sortBy = 'volume';
                break;
            case 'recent':
                this.sortBy = 'activity';
                break;
        }
        
        this.applyFilters();
    }

    // Filter Logic
    applyFilters() {
        let filtered = [...this.allAccounts];

        // Apply search filter
        if (this.searchTerm) {
            const searchLower = this.searchTerm.toLowerCase();
            filtered = filtered.filter(account =>
                account.companyName.toLowerCase().includes(searchLower) ||
                account.contactPerson.toLowerCase().includes(searchLower) ||
                account.email.toLowerCase().includes(searchLower) ||
                account.industry.toLowerCase().includes(searchLower)
            );
        }

        // Apply industry filter
        if (this.industryFilter) {
            filtered = filtered.filter(account => account.industry === this.industryFilter);
        }

        // Apply status filter
        if (this.statusFilter) {
            filtered = filtered.filter(account => account.status === this.statusFilter);
        }

        // Apply sorting
        this.sortResults(filtered);

        // Update pagination
        this.updatePagination(filtered);
    }

    sortResults(accounts) {
        accounts.sort((a, b) => {
            switch (this.sortBy) {
                case 'name':
                    return a.companyName.localeCompare(b.companyName);
                case 'activity':
                    return this.parseActivityDays(a.lastActivity) - this.parseActivityDays(b.lastActivity);
                case 'bookings':
                    return b.totalBookings - a.totalBookings;
                case 'volume':
                    return this.parseVolume(b.travelVolume) - this.parseVolume(a.travelVolume);
                case 'industry':
                    return a.industry.localeCompare(b.industry);
                default:
                    return 0;
            }
        });
        
        this.filteredAccounts = accounts;
    }

    parseActivityDays(activity) {
        if (activity.includes('day')) return parseInt(activity);
        if (activity.includes('week')) return parseInt(activity) * 7;
        return 0;
    }

    parseVolume(volume) {
        if (volume === 'New') return 0;
        if (volume.includes('+')) return parseInt(volume);
        if (volume.includes('-')) {
            const parts = volume.split('-');
            return parseInt(parts[1]);
        }
        return 0;
    }

    // Pagination
    updatePagination(accounts) {
        this.totalPages = Math.ceil(accounts.length / this.pageSize);
        this.currentPage = 1; // Reset to first page
        this.filteredAccounts = accounts;
    }

    handlePreviousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
        }
    }

    handleNextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
        }
    }

    // Action Handlers
    handleAccountClick(event) {
        const accountId = event.currentTarget.dataset.accountId;
        this.handleViewDetails({ target: { dataset: { accountId } } });
    }

    handleViewDetails(event) {
        const accountId = event.target.dataset.accountId;
        const account = this.allAccounts.find(acc => acc.id === accountId);
        
        // Navigate to account record page
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: accountId,
                objectApiName: 'Account',
                actionName: 'view'
            }
        });
    }

    handleCreateBooking(event) {
        const accountId = event.target.dataset.accountId;
        const accountName = event.target.dataset.accountName;
        
        // Dispatch custom event to parent component
        const bookingEvent = new CustomEvent('accountselected', {
            detail: {
                accountId,
                accountName
            }
        });
        this.dispatchEvent(bookingEvent);

        // Alternatively, navigate to booking creation
        this.showToast('Success', `Creating booking for ${accountName}`, 'success');
    }

    handleCreateAccount() {
        // Navigate to account creation wizard
        const createEvent = new CustomEvent('createaccount');
        this.dispatchEvent(createEvent);
    }

    handleBookNewAccount() {
        this.hideSuccessMessage();
        this.handleCreateBooking({
            target: {
                dataset: {
                    accountId: 'new',
                    accountName: 'New Account'
                }
            }
        });
    }

    hideSuccessMessage() {
        this.showSuccessMessage = false;
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

    // Public Methods for Parent Component Integration
    @api
    showAccountCreatedSuccess() {
        this.showSuccessMessage = true;
        this.loadInitialData(); // Refresh data
    }

    @api
    refreshData() {
        this.loadInitialData();
    }

    // CSS for enhanced styling
    renderedCallback() {
        // Add hover effects and animations via CSS
        const style = document.createElement('style');
        style.innerText = `
            .account-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 16px rgba(0,0,0,0.1);
            }
            
            .account-card {
                border-left: 4px solid transparent;
            }
            
            .account-card[data-status="active"] {
                border-left-color: #04844b;
            }
            
            .account-card[data-status="inactive"] {
                border-left-color: #fe9339;
            }
            
            .account-card[data-status="pending"] {
                border-left-color: #0176d3;
            }
            
            .account-card[data-status="prospect"] {
                border-left-color: #706e6b;
            }
            
            .slds-pill_small {
                font-size: 0.75rem;
                padding: 0.125rem 0.5rem;
            }
        `;
        
        if (!this.template.querySelector('style')) {
            this.template.appendChild(style);
        }
    }
}