const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Data directory and files
const DATA_DIR = path.join(__dirname, 'data');
const WORKERS_FILE = path.join(DATA_DIR, 'workers.json');
const ADVANCES_FILE = path.join(DATA_DIR, 'advances.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

// Initialize data files if they don't exist
if (!fs.existsSync(WORKERS_FILE)) {
    fs.writeFileSync(WORKERS_FILE, JSON.stringify([], null, 2));
}

if (!fs.existsSync(ADVANCES_FILE)) {
    fs.writeFileSync(ADVANCES_FILE, JSON.stringify([], null, 2));
}

// Helper functions
function readWorkers() {
    try {
        const data = fs.readFileSync(WORKERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading workers file:', error);
        return [];
    }
}

function writeWorkers(workers) {
    try {
        fs.writeFileSync(WORKERS_FILE, JSON.stringify(workers, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing workers file:', error);
        return false;
    }
}

function readAdvances() {
    try {
        const data = fs.readFileSync(ADVANCES_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading advances file:', error);
        return [];
    }
}

function writeAdvances(advances) {
    try {
        fs.writeFileSync(ADVANCES_FILE, JSON.stringify(advances, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing advances file:', error);
        return false;
    }
}

// API Routes

// Workers Routes
app.get('/api/workers', (req, res) => {
    const workers = readWorkers();
    res.json(workers);
});

app.post('/api/workers', (req, res) => {
    const workers = readWorkers();
    const newWorker = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        ...req.body,
        createdAt: new Date().toISOString()
    };
    workers.push(newWorker);
    if (writeWorkers(workers)) {
        res.json(newWorker);
    } else {
        res.status(500).json({ error: 'Failed to save worker' });
    }
});

app.put('/api/workers/:id', (req, res) => {
    const workers = readWorkers();
    const workerIndex = workers.findIndex(w => w.id === req.params.id);

    if (workerIndex === -1) {
        return res.status(404).json({ error: 'Worker not found' });
    }

    workers[workerIndex] = { ...workers[workerIndex], ...req.body };
    if (writeWorkers(workers)) {
        res.json(workers[workerIndex]);
    } else {
        res.status(500).json({ error: 'Failed to update worker' });
    }
});

app.delete('/api/workers/:id', (req, res) => {
    let workers = readWorkers();
    let advances = readAdvances();

    const workerExists = workers.some(w => w.id === req.params.id);
    if (!workerExists) {
        return res.status(404).json({ error: 'Worker not found' });
    }

    // Remove worker
    workers = workers.filter(w => w.id !== req.params.id);

    // Remove worker's advances
    advances = advances.filter(a => a.workerId !== req.params.id);

    if (writeWorkers(workers) && writeAdvances(advances)) {
        res.json({ message: 'Worker and related advances deleted successfully' });
    } else {
        res.status(500).json({ error: 'Failed to delete worker' });
    }
});

// Advances Routes
app.get('/api/advances', (req, res) => {
    const advances = readAdvances();
    res.json(advances);
});

app.post('/api/advances', (req, res) => {
    const advances = readAdvances();
    const newAdvance = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        ...req.body,
        createdAt: new Date().toISOString()
    };
    advances.push(newAdvance);
    if (writeAdvances(advances)) {
        res.json(newAdvance);
    } else {
        res.status(500).json({ error: 'Failed to save advance' });
    }
});

app.delete('/api/advances/:id', (req, res) => {
    let advances = readAdvances();
    const advanceIndex = advances.findIndex(a => a.id === req.params.id);

    if (advanceIndex === -1) {
        return res.status(404).json({ error: 'Advance not found' });
    }

    advances.splice(advanceIndex, 1);
    if (writeAdvances(advances)) {
        res.json({ message: 'Advance deleted successfully' });
    } else {
        res.status(500).json({ error: 'Failed to delete advance' });
    }
});

// Export/Import Routes
app.get('/api/export', (req, res) => {
    const workers = readWorkers();
    const advances = readAdvances();

    const data = {
        workers,
        advances,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };

    res.json(data);
});

app.post('/api/import', (req, res) => {
    const { workers, advances } = req.body;

    if (!Array.isArray(workers) || !Array.isArray(advances)) {
        return res.status(400).json({ error: 'Invalid data format' });
    }

    if (writeWorkers(workers) && writeAdvances(advances)) {
        res.json({ message: 'Data imported successfully' });
    } else {
        res.status(500).json({ error: 'Failed to import data' });
    }
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`HisabWeb server running on http://localhost:${PORT}`);
    console.log(`Data stored in: ${DATA_DIR}`);
});
