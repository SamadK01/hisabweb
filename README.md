# HisabWeb - Worker Salary Management System

A simple, smooth, and easy-to-use web application for small businesses to manage their workers' salaries and advances.

## Features

### 📊 Dashboard
- View total workers count
- Monitor total monthly salaries
- Track advances given this month
- Calculate net payable amount
- Quick action buttons for common tasks

### 👥 Worker Management
- Add new workers with details (Name, Designation, Salary, Joining Date)
- View all workers in a clean table
- Edit worker information
- Delete workers (with advance records)
- Search/filter workers by name or designation
- Each worker gets a unique ID

### 💰 Advance Management
- Add advance payments for workers
- Record multiple advances per month
- Add notes to advance records
- View all advances with worker details
- Delete advance records
- Auto-calculation of remaining salary

### 📄 Salary Slip Generation
- Generate professional PDF salary slips
- Includes worker details and salary breakdown
- Lists all advances with dates
- Shows final payable amount
- Generate slips for individual workers or all at once
- HisabWeb branding on each slip

### 💾 Data Management
- All data stored locally in browser (localStorage)
- Export data as JSON backup file
- Import data from backup file
- No backend required - works completely offline

### 📱 Responsive Design
- Clean and professional UI
- Mobile-friendly layout
- Smooth transitions and animations
- Modern color scheme
- Easy navigation

## How to Use

1. **Open the Application**
   - Simply open `index.html` in any modern web browser
   - No installation or server required

2. **Add Workers**
   - Click "Add Worker" button
   - Fill in worker details (Name, Designation, Monthly Salary, Joining Date)
   - Click "Save Worker"

3. **Record Advances**
   - Click "Add Advance" or use the advance button next to a worker
   - Select worker, enter amount and date
   - Optionally add a note
   - Click "Save Advance"

4. **Generate Salary Slips**
   - Click the "Slip" button next to any worker for individual slip
   - Or use "Generate Salary Slips" on dashboard for all workers
   - PDF will be automatically downloaded

5. **Backup Your Data**
   - Click "Export Data" to download a backup JSON file
   - Click "Import Data" to restore from a backup file

## Technical Details

### Technologies Used
- **HTML5** - Structure
- **CSS3** - Styling with modern design
- **JavaScript (ES6+)** - Functionality
- **jsPDF** - PDF generation
- **localStorage** - Data persistence

### Browser Compatibility
- Chrome (recommended)
- Firefox
- Safari
- Edge
- Any modern browser with localStorage support

### Data Storage
All data is stored locally in your browser using localStorage:
- `hisabweb_workers` - Worker information
- `hisabweb_advances` - Advance records

### File Structure
```
hisabweb/
├── index.html      # Main HTML file
├── style.css       # All styling
├── app.js          # Application logic
└── README.md       # This file
```

## Features in Detail

### Auto Salary Calculation
- System automatically calculates remaining salary
- Formula: Final Salary = Base Salary - Total Advances (Current Month)
- Updates in real-time when advances are added/removed

### Monthly Tracking
- Advances are tracked per month
- Dashboard shows current month statistics
- Salary slips show current month data
- Historical data is preserved

### Search & Filter
- Search workers by name
- Filter by designation
- Real-time search results

### Data Safety
- Regular backups recommended (use Export feature)
- Data persists in browser localStorage
- Import/Export for data portability

## Tips for Users

1. **Regular Backups**: Export your data regularly to avoid data loss
2. **Browser Data**: Don't clear browser data if you want to keep your records
3. **Multiple Devices**: Use Export/Import to transfer data between devices
4. **Monthly Review**: Generate all salary slips at month-end for records

## Limitations

- Data is stored locally in browser only
- Clearing browser data will delete all records (use Export first!)
- No cloud sync or multi-user support
- Works on single device/browser (unless you export/import)

## Future Enhancements (Optional)

- Monthly report summary
- Print all salary slips at once
- Advanced filtering options
- Data visualization charts
- Multiple business support

## Support

For issues or questions, this is a standalone application with no external dependencies except jsPDF CDN.

---

**Made with ❤️ for Small Business Owners**

*Simple • Fast • Reliable*
