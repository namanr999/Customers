// CRM Application JavaScript

class CRM {
    constructor() {
        this.customers = JSON.parse(localStorage.getItem('crm_customers')) || [];
        this.currentFilter = '';
        this.currentSearch = '';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderCustomers();
        this.updateCustomerCount();
    }

    setupEventListeners() {
        // Add customer form
        document.getElementById('customerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addCustomer();
        });

        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.currentSearch = e.target.value.toLowerCase();
            this.renderCustomers();
        });

        // Status filter
        document.getElementById('statusFilter').addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.renderCustomers();
        });

        // Clear filters
        document.getElementById('clearFilters').addEventListener('click', () => {
            this.clearFilters();
        });

        // Modal close events
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => {
                this.closeModals();
            });
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModals();
            }
        });

        // Edit form submission
        document.getElementById('editForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateCustomer();
        });

        // Delete confirmation
        document.getElementById('confirmDelete').addEventListener('click', () => {
            this.deleteCustomer();
        });
    }

    addCustomer() {
        const formData = new FormData(document.getElementById('customerForm'));
        const customer = {
            id: Date.now().toString(),
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone') || '',
            company: formData.get('company') || '',
            status: formData.get('status'),
            notes: formData.get('notes') || '',
            createdAt: new Date().toISOString()
        };

        this.customers.unshift(customer);
        this.saveToLocalStorage();
        this.renderCustomers();
        this.updateCustomerCount();
        this.resetForm();
        this.showNotification('Customer added successfully!', 'success');
    }

    editCustomer(id) {
        const customer = this.customers.find(c => c.id === id);
        if (!customer) return;

        // Populate edit form
        document.getElementById('editId').value = customer.id;
        document.getElementById('editFirstName').value = customer.firstName;
        document.getElementById('editLastName').value = customer.lastName;
        document.getElementById('editEmail').value = customer.email;
        document.getElementById('editPhone').value = customer.phone;
        document.getElementById('editCompany').value = customer.company;
        document.getElementById('editStatus').value = customer.status;
        document.getElementById('editNotes').value = customer.notes;

        // Show edit modal
        document.getElementById('editModal').style.display = 'block';
    }

    updateCustomer() {
        const id = document.getElementById('editId').value;
        const customerIndex = this.customers.findIndex(c => c.id === id);
        
        if (customerIndex === -1) return;

        const formData = new FormData(document.getElementById('editForm'));
        const updatedCustomer = {
            ...this.customers[customerIndex],
            firstName: formData.get('editFirstName'),
            lastName: formData.get('editLastName'),
            email: formData.get('editEmail'),
            phone: formData.get('editPhone') || '',
            company: formData.get('editCompany') || '',
            status: formData.get('editStatus'),
            notes: formData.get('editNotes') || '',
            updatedAt: new Date().toISOString()
        };

        this.customers[customerIndex] = updatedCustomer;
        this.saveToLocalStorage();
        this.renderCustomers();
        this.closeModals();
        this.showNotification('Customer updated successfully!', 'success');
    }

    deleteCustomer() {
        const id = document.getElementById('editId').value;
        this.customers = this.customers.filter(c => c.id !== id);
        this.saveToLocalStorage();
        this.renderCustomers();
        this.updateCustomerCount();
        this.closeModals();
        this.showNotification('Customer deleted successfully!', 'success');
    }

    confirmDelete(id, customerName) {
        document.getElementById('editId').value = id;
        document.getElementById('deleteCustomerName').textContent = customerName;
        document.getElementById('deleteModal').style.display = 'block';
    }

    renderCustomers() {
        const tbody = document.getElementById('customersTableBody');
        let filteredCustomers = this.customers;

        // Apply status filter
        if (this.currentFilter) {
            filteredCustomers = filteredCustomers.filter(c => c.status === this.currentFilter);
        }

        // Apply search filter
        if (this.currentSearch) {
            filteredCustomers = filteredCustomers.filter(c => 
                c.firstName.toLowerCase().includes(this.currentSearch) ||
                c.lastName.toLowerCase().includes(this.currentSearch) ||
                c.email.toLowerCase().includes(this.currentSearch) ||
                c.company.toLowerCase().includes(this.currentSearch)
            );
        }

        if (filteredCustomers.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6">
                        <div class="empty-state">
                            <i class="fas fa-users"></i>
                            <h3>No customers found</h3>
                            <p>${this.currentSearch || this.currentFilter ? 'Try adjusting your search or filters.' : 'Add your first customer to get started!'}</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filteredCustomers.map(customer => `
            <tr>
                <td>
                    <div class="customer-name">${customer.firstName} ${customer.lastName}</div>
                </td>
                <td>
                    <div class="customer-email">${customer.email}</div>
                </td>
                <td>
                    <div class="customer-phone">${customer.phone || '-'}</div>
                </td>
                <td>
                    <div class="customer-company">${customer.company || '-'}</div>
                </td>
                <td>
                    <span class="status-badge status-${customer.status}">${customer.status}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button onclick="crm.editCustomer('${customer.id}')" class="btn btn-secondary btn-small">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button onclick="crm.confirmDelete('${customer.id}', '${customer.firstName} ${customer.lastName}')" class="btn btn-danger btn-small">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    updateCustomerCount() {
        const count = this.customers.length;
        document.getElementById('customerCount').textContent = count;
    }

    clearFilters() {
        this.currentFilter = '';
        this.currentSearch = '';
        document.getElementById('searchInput').value = '';
        document.getElementById('statusFilter').value = '';
        this.renderCustomers();
        this.showNotification('Filters cleared!', 'info');
    }

    closeModals() {
        document.getElementById('editModal').style.display = 'none';
        document.getElementById('deleteModal').style.display = 'none';
    }

    resetForm() {
        document.getElementById('customerForm').reset();
    }

    saveToLocalStorage() {
        localStorage.setItem('crm_customers', JSON.stringify(this.customers));
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const iconMap = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        
        notification.innerHTML = `
            <i class="fas fa-${iconMap[type] || 'info-circle'}"></i>
            <span>${message}</span>
        `;

        // Add styles
        const colors = {
            'success': { bg: '#d4edda', color: '#155724', icon: '#28a745' },
            'error': { bg: '#f8d7da', color: '#721c24', icon: '#dc3545' },
            'warning': { bg: '#fff3cd', color: '#856404', icon: '#ffc107' },
            'info': { bg: '#d1ecf1', color: '#0c5460', icon: '#17a2b8' }
        };
        
        const color = colors[type] || colors.info;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${color.bg};
            color: ${color.color};
            padding: 15px 20px;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 12px;
            font-weight: 600;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            border-left: 4px solid ${color.icon};
            max-width: 400px;
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 4 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    // Export customers to CSV
    exportToCSV() {
        if (this.customers.length === 0) {
            this.showNotification('No customers to export!', 'warning');
            return;
        }

        const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Status', 'Notes', 'Created At'];
        const csvContent = [
            headers.join(','),
            ...this.customers.map(customer => [
                `"${customer.firstName}"`,
                `"${customer.lastName}"`,
                `"${customer.email}"`,
                `"${customer.phone || ''}"`,
                `"${customer.company || ''}"`,
                `"${customer.status}"`,
                `"${customer.notes || ''}"`,
                `"${new Date(customer.createdAt).toLocaleDateString()}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `customers_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showNotification('Customer data exported successfully!', 'success');
    }

    // Import customers from CSV
    importFromCSV(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csv = e.target.result;
                const lines = csv.split('\n');
                const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
                
                const importedCustomers = lines.slice(1).filter(line => line.trim()).map(line => {
                    const values = line.split(',').map(v => v.replace(/"/g, '').trim());
                    return {
                        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                        firstName: values[0] || '',
                        lastName: values[1] || '',
                        email: values[2] || '',
                        phone: values[3] || '',
                        company: values[4] || '',
                        status: values[5] || 'lead',
                        notes: values[6] || '',
                        createdAt: new Date().toISOString()
                    };
                });

                this.customers = [...importedCustomers, ...this.customers];
                this.saveToLocalStorage();
                this.renderCustomers();
                this.updateCustomerCount();
                this.showNotification(`${importedCustomers.length} customers imported successfully!`, 'success');
            } catch (error) {
                this.showNotification('Error importing CSV file. Please check the format.', 'error');
            }
        };
        reader.readAsText(file);
    }

    // Clear all customer data
    clearAllData() {
        if (this.customers.length === 0) {
            this.showNotification('No data to clear!', 'info');
            return;
        }

        if (confirm('Are you sure you want to delete ALL customer data? This action cannot be undone!')) {
            this.customers = [];
            this.saveToLocalStorage();
            this.renderCustomers();
            this.updateCustomerCount();
            this.showNotification('All customer data has been cleared!', 'warning');
        }
    }
}

// Initialize CRM when page loads
let crm;
document.addEventListener('DOMContentLoaded', () => {
    crm = new CRM();
});

// Add some sample data for demonstration
function addSampleData() {
    if (crm.customers.length === 0) {
        const sampleCustomers = [
            {
                id: '1',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                phone: '+1-555-0123',
                company: 'Tech Solutions Inc.',
                status: 'customer',
                notes: 'Premium client, interested in enterprise solutions',
                createdAt: new Date().toISOString()
            },
            {
                id: '2',
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane.smith@example.com',
                phone: '+1-555-0456',
                company: 'Digital Marketing Co.',
                status: 'prospect',
                notes: 'Looking for marketing automation tools',
                createdAt: new Date().toISOString()
            },
            {
                id: '3',
                firstName: 'Mike',
                lastName: 'Johnson',
                email: 'mike.johnson@example.com',
                phone: '+1-555-0789',
                company: 'StartupXYZ',
                status: 'lead',
                notes: 'New startup, potential for long-term partnership',
                createdAt: new Date().toISOString()
            },
            {
                id: '4',
                firstName: 'Sarah',
                lastName: 'Williams',
                email: 'sarah.williams@example.com',
                phone: '+1-555-0321',
                company: 'Global Enterprises',
                status: 'customer',
                notes: 'Long-term client, very satisfied with services',
                createdAt: new Date().toISOString()
            },
            {
                id: '5',
                firstName: 'David',
                lastName: 'Brown',
                email: 'david.brown@example.com',
                phone: '+1-555-0654',
                company: 'Innovation Labs',
                status: 'prospect',
                notes: 'Interested in AI solutions, follow up next week',
                createdAt: new Date().toISOString()
            }
        ];

        crm.customers = sampleCustomers;
        crm.saveToLocalStorage();
        crm.renderCustomers();
        crm.updateCustomerCount();
        crm.showNotification('Sample data added! You now have 5 demo customers.', 'success');
    } else {
        crm.showNotification('Sample data already exists!', 'info');
    }
}

// Handle CSV file import
function handleCSVImport(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
            crm.importFromCSV(file);
        } else {
            crm.showNotification('Please select a valid CSV file!', 'error');
        }
    }
    // Reset the input
    event.target.value = '';
}

// Clear all data function
function clearAllData() {
    crm.clearAllData();
}

// Global functions for modal operations
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
}
