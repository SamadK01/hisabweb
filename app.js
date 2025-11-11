// API Base URL
const API_BASE = 'http://localhost:3001/api';

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

// Initialize application
function initializeApp() {
    loadDashboard();
    loadWorkers();
    loadAdvances();
    updateDashboardStats();
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    const advanceDateInput = document.getElementById('advance-date');
    if (advanceDateInput) {
        advanceDateInput.value = today;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            switchPage(this.dataset.page);
        });
    });

    // Search functionality
    const searchInput = document.getElementById('search-worker');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterWorkers(this.value);
        });
    }

    // Close modals on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    });
}

// Page Navigation
function switchPage(pageName) {
    // Update navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.page === pageName) {
            btn.classList.add('active');
        }
    });

    // Update pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(`${pageName}-page`).classList.add('active');

    // Refresh data
    if (pageName === 'dashboard') {
        updateDashboardStats();
    } else if (pageName === 'workers') {
        loadWorkers();
    } else if (pageName === 'advances') {
        loadAdvances();
    }
}

// API Functions
async function getWorkers() {
    try {
        const response = await fetch(`${API_BASE}/workers`);
        if (!response.ok) throw new Error('Failed to fetch workers');
        return await response.json();
    } catch (error) {
        console.error('Error fetching workers:', error);
        return [];
    }
}

async function saveWorkers(workers) {
    // This function is now handled by individual API calls
    // Keeping for compatibility but not used directly
    return true;
}

async function getAdvances() {
    try {
        const response = await fetch(`${API_BASE}/advances`);
        if (!response.ok) throw new Error('Failed to fetch advances');
        return await response.json();
    } catch (error) {
        console.error('Error fetching advances:', error);
        return [];
    }
}

async function saveAdvances(advances) {
    // This function is now handled by individual API calls
    // Keeping for compatibility but not used directly
    return true;
}

// Dashboard Functions
async function loadDashboard() {
    await updateDashboardStats();
}

async function updateDashboardStats() {
    const workers = await getWorkers();
    const advances = await getAdvances();
    
    // Get current month advances
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const monthlyAdvances = advances.filter(adv => {
        const advDate = new Date(adv.date);
        return advDate.getMonth() === currentMonth && advDate.getFullYear() === currentYear;
    });

    // Calculate totals
    const totalWorkers = workers.length;
    const totalSalaries = workers.reduce((sum, worker) => sum + parseFloat(worker.salary), 0);
    const totalAdvancesAmount = monthlyAdvances.reduce((sum, adv) => sum + parseFloat(adv.amount), 0);
    const netPayable = totalSalaries - totalAdvancesAmount;

    // Update UI
    document.getElementById('total-workers').textContent = totalWorkers;
    document.getElementById('total-salaries').textContent = `PKR ${formatNumber(totalSalaries)}`;
    document.getElementById('total-advances').textContent = `PKR ${formatNumber(totalAdvancesAmount)}`;
    document.getElementById('net-payable').textContent = `PKR ${formatNumber(netPayable)}`;
}

// Worker Functions
async function loadWorkers() {
    const workers = await getWorkers();
    const advances = await getAdvances();
    const tableBody = document.getElementById('workers-table-body');
    const noWorkersDiv = document.getElementById('no-workers');
    
    if (workers.length === 0) {
        tableBody.innerHTML = '';
        noWorkersDiv.style.display = 'block';
        return;
    }

    noWorkersDiv.style.display = 'none';
    
    // Get current month advances
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    tableBody.innerHTML = workers.map(worker => {
        const workerAdvances = advances.filter(adv => {
            const advDate = new Date(adv.date);
            return adv.workerId === worker.id && 
                   advDate.getMonth() === currentMonth && 
                   advDate.getFullYear() === currentYear;
        });
        
        const totalAdvances = workerAdvances.reduce((sum, adv) => sum + parseFloat(adv.amount), 0);
        const remainingSalary = parseFloat(worker.salary) - totalAdvances;

        return `
            <tr>
                <td><strong>${worker.name}</strong></td>
                <td>${worker.designation}</td>
                <td>PKR ${formatNumber(worker.salary)}</td>
                <td><span class="badge badge-danger">PKR ${formatNumber(totalAdvances)}</span></td>
                <td><span class="badge badge-success">PKR ${formatNumber(remainingSalary)}</span></td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-sm btn-secondary" onclick="editWorker('${worker.id}')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                            Edit
                        </button>
                        <button class="btn btn-sm btn-primary" onclick="showAddAdvanceModal('${worker.id}')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="5" x2="12" y2="19"/>
                                <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                            Advance
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="generateSalarySlip('${worker.id}')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                            </svg>
                            Slip
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteWorker('${worker.id}')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

async function filterWorkers(searchTerm) {
    const workers = await getWorkers();
    const advances = await getAdvances();
    const tableBody = document.getElementById('workers-table-body');
    
    const filteredWorkers = workers.filter(worker => 
        worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.designation.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filteredWorkers.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-secondary);">No workers found</td></tr>';
        return;
    }

    // Get current month advances
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    tableBody.innerHTML = filteredWorkers.map(worker => {
        const workerAdvances = advances.filter(adv => {
            const advDate = new Date(adv.date);
            return adv.workerId === worker.id && 
                   advDate.getMonth() === currentMonth && 
                   advDate.getFullYear() === currentYear;
        });
        
        const totalAdvances = workerAdvances.reduce((sum, adv) => sum + parseFloat(adv.amount), 0);
        const remainingSalary = parseFloat(worker.salary) - totalAdvances;

        return `
            <tr>
                <td><strong>${worker.name}</strong></td>
                <td>${worker.designation}</td>
                <td>PKR ${formatNumber(worker.salary)}</td>
                <td><span class="badge badge-danger">PKR ${formatNumber(totalAdvances)}</span></td>
                <td><span class="badge badge-success">PKR ${formatNumber(remainingSalary)}</span></td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-sm btn-secondary" onclick="editWorker('${worker.id}')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                            Edit
                        </button>
                        <button class="btn btn-sm btn-primary" onclick="showAddAdvanceModal('${worker.id}')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="5" x2="12" y2="19"/>
                                <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                            Advance
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="generateSalarySlip('${worker.id}')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                            </svg>
                            Slip
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteWorker('${worker.id}')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function showAddWorkerModal() {
    document.getElementById('worker-modal-title').textContent = 'Add New Worker';
    document.getElementById('worker-form').reset();
    document.getElementById('worker-id').value = '';
    
    // Set joining date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('worker-joining-date').value = today;
    
    document.getElementById('worker-modal').classList.add('active');
}

function closeWorkerModal() {
    document.getElementById('worker-modal').classList.remove('active');
}

async function editWorker(workerId) {
    const workers = await getWorkers();
    const worker = workers.find(w => w.id === workerId);
    
    if (!worker) return;

    document.getElementById('worker-modal-title').textContent = 'Edit Worker';
    document.getElementById('worker-id').value = worker.id;
    document.getElementById('worker-name').value = worker.name;
    document.getElementById('worker-designation').value = worker.designation;
    document.getElementById('worker-salary').value = worker.salary;
    document.getElementById('worker-joining-date').value = worker.joiningDate;
    
    document.getElementById('worker-modal').classList.add('active');
}

async function saveWorker(event) {
    event.preventDefault();

    const workerId = document.getElementById('worker-id').value;
    const name = document.getElementById('worker-name').value.trim();
    const designation = document.getElementById('worker-designation').value.trim();
    const salary = document.getElementById('worker-salary').value;
    const joiningDate = document.getElementById('worker-joining-date').value;

    try {
        if (workerId) {
            // Update existing worker
            const response = await fetch(`${API_BASE}/workers/${workerId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, designation, salary, joiningDate })
            });

            if (!response.ok) throw new Error('Failed to update worker');
        } else {
            // Add new worker
            const response = await fetch(`${API_BASE}/workers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, designation, salary, joiningDate })
            });

            if (!response.ok) throw new Error('Failed to add worker');
        }

        closeWorkerModal();
        await loadWorkers();
        await updateDashboardStats();
        await populateWorkerSelect();

        showNotification(workerId ? 'Worker updated successfully!' : 'Worker added successfully!');
    } catch (error) {
        console.error('Error saving worker:', error);
        showNotification('Error saving worker. Please try again.');
    }
}

async function deleteWorker(workerId) {
    if (!confirm('Are you sure you want to delete this worker? This will also delete all their advance records.')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/workers/${workerId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete worker');

        await loadWorkers();
        await updateDashboardStats();
        await populateWorkerSelect();

        showNotification('Worker deleted successfully!');
    } catch (error) {
        console.error('Error deleting worker:', error);
        showNotification('Error deleting worker. Please try again.');
    }
}

// Advance Functions
async function loadAdvances() {
    const advances = await getAdvances();
    const workers = await getWorkers();
    const advancesList = document.getElementById('advances-list');

    if (advances.length === 0) {
        advancesList.innerHTML = `
            <div class="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                    <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                <p>No advances recorded yet</p>
                <button class="btn btn-primary" onclick="showAddAdvanceModal()">Add First Advance</button>
            </div>
        `;
        return;
    }

    // Sort advances by date (newest first)
    const sortedAdvances = advances.sort((a, b) => new Date(b.date) - new Date(a.date));

    advancesList.innerHTML = sortedAdvances.map(advance => {
        const worker = workers.find(w => w.id === advance.workerId);
        const workerName = worker ? worker.name : 'Unknown Worker';
        const formattedDate = formatDate(advance.date);

        return `
            <div class="advance-card">
                <div class="advance-info">
                    <h4>${workerName}</h4>
                    <p>${formattedDate}${advance.note ? ' • ' + advance.note : ''}</p>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div class="advance-amount">PKR ${formatNumber(advance.amount)}</div>
                    <div class="advance-actions">
                        <button class="btn btn-sm btn-danger" onclick="deleteAdvance('${advance.id}')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function showAddAdvanceModal(workerId = null) {
    populateWorkerSelect();
    document.getElementById('advance-form').reset();
    
    // Set date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('advance-date').value = today;
    
    if (workerId) {
        document.getElementById('advance-worker').value = workerId;
    }
    
    document.getElementById('advance-modal').classList.add('active');
}

function closeAdvanceModal() {
    document.getElementById('advance-modal').classList.remove('active');
}

async function populateWorkerSelect() {
    const workers = await getWorkers();
    const select = document.getElementById('advance-worker');

    select.innerHTML = '<option value="">Choose a worker...</option>' +
        workers.map(worker => `<option value="${worker.id}">${worker.name} - ${worker.designation}</option>`).join('');
}

async function saveAdvance(event) {
    event.preventDefault();

    const workerId = document.getElementById('advance-worker').value;
    const amount = document.getElementById('advance-amount').value;
    const date = document.getElementById('advance-date').value;
    const note = document.getElementById('advance-note').value.trim();

    try {
        const response = await fetch(`${API_BASE}/advances`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ workerId, amount, date, note })
        });

        if (!response.ok) throw new Error('Failed to save advance');

        closeAdvanceModal();
        await loadAdvances();
        await loadWorkers();
        await updateDashboardStats();

        showNotification('Advance added successfully!');
    } catch (error) {
        console.error('Error saving advance:', error);
        showNotification('Error saving advance. Please try again.');
    }
}

async function deleteAdvance(advanceId) {
    if (!confirm('Are you sure you want to delete this advance record?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/advances/${advanceId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete advance');

        await loadAdvances();
        await loadWorkers();
        await updateDashboardStats();

        showNotification('Advance deleted successfully!');
    } catch (error) {
        console.error('Error deleting advance:', error);
        showNotification('Error deleting advance. Please try again.');
    }
}

// PDF Generation Functions
async function generateSalarySlip(workerId) {
    const workers = await getWorkers();
    const advances = await getAdvances();
    const worker = workers.find(w => w.id === workerId);

    if (!worker) {
        alert('Worker not found!');
        return;
    }

    // Get current month advances
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    const workerAdvances = advances.filter(adv => {
        const advDate = new Date(adv.date);
        return adv.workerId === worker.id && 
               advDate.getMonth() === currentMonth && 
               advDate.getFullYear() === currentYear;
    });

    const totalAdvances = workerAdvances.reduce((sum, adv) => sum + parseFloat(adv.amount), 0);
    const finalSalary = parseFloat(worker.salary) - totalAdvances;

    // Generate PDF using jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Header
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('HisabWeb', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text('Salary Slip', 105, 30, { align: 'center' });

    // Reset text color
    doc.setTextColor(0, 0, 0);

    // Month and Year
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`${monthName} ${currentYear}`, 105, 55, { align: 'center' });

    // Worker Details
    let yPos = 70;
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Worker Details:', 20, yPos);
    
    yPos += 10;
    doc.setFont(undefined, 'normal');
    doc.text(`Name: ${worker.name}`, 20, yPos);
    
    yPos += 8;
    doc.text(`Designation: ${worker.designation}`, 20, yPos);
    
    yPos += 8;
    doc.text(`Joining Date: ${formatDate(worker.joiningDate)}`, 20, yPos);

    // Salary Details
    yPos += 15;
    doc.setFont(undefined, 'bold');
    doc.text('Salary Details:', 20, yPos);

    yPos += 10;
    doc.setFont(undefined, 'normal');
    doc.text('Base Salary:', 20, yPos);
    doc.text(`PKR ${formatNumber(worker.salary)}`, 190, yPos, { align: 'right' });

    // Advances
    if (workerAdvances.length > 0) {
        yPos += 10;
        doc.setFont(undefined, 'bold');
        doc.text('Advances:', 20, yPos);
        doc.setFont(undefined, 'normal');

        workerAdvances.forEach(adv => {
            yPos += 8;
            const advText = `${formatDate(adv.date)}${adv.note ? ' - ' + adv.note : ''}`;
            doc.text(advText, 30, yPos);
            doc.text(`- PKR ${formatNumber(adv.amount)}`, 190, yPos, { align: 'right' });
        });

        yPos += 10;
        doc.setFont(undefined, 'bold');
        doc.text('Total Advances:', 20, yPos);
        doc.text(`- PKR ${formatNumber(totalAdvances)}`, 190, yPos, { align: 'right' });
    } else {
        yPos += 10;
        doc.text('Total Advances:', 20, yPos);
        doc.text('PKR 0', 190, yPos, { align: 'right' });
    }

    // Draw line
    yPos += 5;
    doc.setLineWidth(0.5);
    doc.line(20, yPos, 190, yPos);

    // Final Salary
    yPos += 10;
    doc.setFontSize(13);
    doc.setFont(undefined, 'bold');
    doc.text('Net Payable Salary:', 20, yPos);
    doc.setTextColor(22, 163, 74);
    doc.text(`PKR ${formatNumber(finalSalary)}`, 190, yPos, { align: 'right' });

    // Footer
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text('Generated by HisabWeb - Worker Salary Management System', 105, 280, { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 285, { align: 'center' });

    // Save PDF
    doc.save(`${worker.name}_Salary_${monthName}_${currentYear}.pdf`);
    
    showNotification('Salary slip generated successfully!');
}

async function generateAllSlips() {
    const workers = await getWorkers();
    
    if (workers.length === 0) {
        alert('No workers found! Please add workers first.');
        return;
    }

    if (!confirm(`Generate salary slips for all ${workers.length} workers?`)) {
        return;
    }

    workers.forEach(worker => {
        setTimeout(() => {
            generateSalarySlip(worker.id);
        }, 500);
    });
}

// Export/Import Functions
async function exportData() {
    try {
        const response = await fetch(`${API_BASE}/export`);
        if (!response.ok) throw new Error('Failed to export data');

        const data = await response.json();
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `hisabweb_backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        URL.revokeObjectURL(url);
        showNotification('Data exported successfully!');
    } catch (error) {
        console.error('Error exporting data:', error);
        showNotification('Error exporting data. Please try again.');
    }
}

async function importData(event) {
    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);

            if (!data.workers || !data.advances) {
                alert('Invalid backup file format!');
                return;
            }

            if (!confirm('This will replace all existing data. Are you sure?')) {
                return;
            }

            // Import via API
            fetch(`${API_BASE}/import`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ workers: data.workers, advances: data.advances })
            })
            .then(response => {
                if (!response.ok) throw new Error('Failed to import data');
                initializeApp();
                showNotification('Data imported successfully!');
            })
            .catch(error => {
                console.error('Error importing data:', error);
                showNotification('Error importing data. Please try again.');
            });
        } catch (error) {
            alert('Error reading backup file: ' + error.message);
        }
    };

    reader.readAsText(file);
    event.target.value = ''; // Reset file input
}

// Utility Functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatNumber(num) {
    return parseFloat(num).toLocaleString('en-PK', { 
        minimumFractionDigits: 0,
        maximumFractionDigits: 0 
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PK', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #16A34A;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
