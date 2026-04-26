const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();

// ----------------------
// MIDDLEWARE
// ----------------------
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 🚨 SERVE BACKEND UPLOADS FOLDER TO THE INTERNET
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');
app.use('/uploads', express.static(UPLOADS_DIR));

// ----------------------
// 📂 DIRECTORY SETUP
// ----------------------
const DATA_DIR = path.join(__dirname, 'data');

const BLOG_FILE_PATH = path.join(DATA_DIR, 'blogs.json');
const EVENT_FILE_PATH = path.join(DATA_DIR, 'events.json');
const TEAM_FILE_PATH = path.join(DATA_DIR, 'team.json');
const APPS_FILE_PATH = path.join(DATA_DIR, 'applications.json');
const FORMS_FILE_PATH = path.join(DATA_DIR, 'forms.json');
const ACADEMIC_FILE_PATH = path.join(DATA_DIR, 'academic.json'); // 🚨 Added Academic DB

// Ensure base folders exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const ensureFile = (filePath) => {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    }
};

ensureFile(BLOG_FILE_PATH);
ensureFile(EVENT_FILE_PATH);
ensureFile(TEAM_FILE_PATH);
ensureFile(APPS_FILE_PATH);
ensureFile(FORMS_FILE_PATH);
ensureFile(ACADEMIC_FILE_PATH); // 🚨 Initialize Academic DB

// ----------------------
// 📧 EMAIL CONFIGURATION
// ----------------------
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
    }
});

// ----------------------
// 💾 SMART DISK UPLOAD CONFIG
// ----------------------
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let baseFolder = 'misc';
        if (req.originalUrl.includes('blogs')) baseFolder = 'blogs';
        else if (req.originalUrl.includes('team')) baseFolder = 'team';
        else if (req.originalUrl.includes('academic')) baseFolder = 'academic';

        if (!req.uploadBatchId) {
            const urlParts = req.originalUrl.split('/');
            const potentialId = urlParts[urlParts.length - 1];
            if (req.method === 'PUT' && potentialId && !['blogs', 'team', 'academic'].includes(potentialId)) {
                req.uploadBatchId = potentialId;
            } else {
                req.uploadBatchId = Date.now().toString();
            }
        }

        let typeFolder = file.mimetype.startsWith('audio') ? 'audio' : 'images';

        const finalPath = path.join(UPLOADS_DIR, baseFolder, `post_${req.uploadBatchId}`, typeFolder);

        if (!fs.existsSync(finalPath)) fs.mkdirSync(finalPath, { recursive: true });

        cb(null, finalPath);
    },
    filename: function (req, file, cb) {
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '-').toLowerCase();
        cb(null, `${file.fieldname}-${Date.now()}-${safeName}`);
    }
});

const upload = multer({ storage: storage });

const parseFormData = (req, existingData = {}) => {
    let data = { ...req.body };

    if (req.files && req.files.length > 0) {
        let baseFolder = 'misc';
        if (req.originalUrl.includes('blogs')) baseFolder = 'blogs';
        else if (req.originalUrl.includes('team')) baseFolder = 'team';
        else if (req.originalUrl.includes('academic')) baseFolder = 'academic';

        req.files.forEach(file => {
            let typeFolder = file.mimetype.startsWith('audio') ? 'audio' : 'images';
            data[file.fieldname] = `http://localhost:5001/uploads/${baseFolder}/post_${req.uploadBatchId}/${typeFolder}/${file.filename}`;
        });
    }

    if (data['authorDetails[name]'] !== undefined) {
        data.authorDetails = {
            name: data['authorDetails[name]'],
            role: data['authorDetails[role]'],
            bio: data['authorDetails[bio]'],
            photo: data.authorPhoto || existingData.authorDetails?.photo || ""
        };
        delete data['authorDetails[name]']; delete data['authorDetails[role]']; delete data['authorDetails[bio]']; delete data.authorPhoto;
    }

    if (data.audio) { data.audioUrl = data.audio; delete data.audio; }

    return { ...existingData, ...data };
};


// ==========================================
//  ✅ BLOG ROUTES 
// ==========================================
app.get('/api/blogs', (req, res) => {
    try { res.status(200).json(JSON.parse(fs.readFileSync(BLOG_FILE_PATH, 'utf-8') || '[]')); }
    catch (err) { res.status(200).json([]); }
});

app.post('/api/blogs', upload.any(), (req, res) => {
    try {
        const blogs = JSON.parse(fs.readFileSync(BLOG_FILE_PATH, 'utf-8') || '[]');
        const parsedData = parseFormData(req);
        const newBlog = {
            _id: req.uploadBatchId || Date.now().toString(),
            ...parsedData,
            date: parsedData.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
            createdAt: new Date().toISOString()
        };
        blogs.unshift(newBlog);
        fs.writeFileSync(BLOG_FILE_PATH, JSON.stringify(blogs, null, 2));
        res.status(201).json(newBlog);
    } catch (err) { res.status(500).json({ error: "Could not create blog." }); }
});

app.put('/api/blogs/:id', upload.any(), (req, res) => {
    try {
        let blogs = JSON.parse(fs.readFileSync(BLOG_FILE_PATH, 'utf-8') || '[]');
        const index = blogs.findIndex(b => b._id === req.params.id);
        if (index === -1) return res.status(404).json({ message: "Blog not found" });

        req.uploadBatchId = req.params.id;

        const parsedData = parseFormData(req, blogs[index]);
        if (!parsedData.date) {
            parsedData.date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        }
        blogs[index] = parsedData;

        fs.writeFileSync(BLOG_FILE_PATH, JSON.stringify(blogs, null, 2));
        res.status(200).json(blogs[index]);
    } catch (err) { res.status(500).json({ error: "Could not update blog." }); }
});

app.put('/api/blogs', (req, res) => {
    try {
        fs.writeFileSync(BLOG_FILE_PATH, JSON.stringify(req.body, null, 2));
        res.status(200).json({ message: "Blog order synchronized!" });
    } catch (err) { res.status(500).json({ error: "Could not synchronize blogs." }); }
});

app.delete('/api/blogs/:id', (req, res) => {
    try {
        let blogs = JSON.parse(fs.readFileSync(BLOG_FILE_PATH, 'utf-8') || '[]');
        blogs = blogs.filter(blog => blog._id !== req.params.id);

        const folderToDelete = path.join(UPLOADS_DIR, 'blogs', `post_${req.params.id}`);
        if (fs.existsSync(folderToDelete)) {
            fs.rmSync(folderToDelete, { recursive: true, force: true });
        }

        fs.writeFileSync(BLOG_FILE_PATH, JSON.stringify(blogs, null, 2));
        res.status(200).json({ message: "Blog deleted successfully" });
    } catch (error) { res.status(500).json({ message: "Failed to delete blog" }); }
});

// ==========================================
//  ✅ ACADEMIC COLLABORATION ROUTES
// ==========================================
app.get('/api/academic', (req, res) => {
    try { res.status(200).json(JSON.parse(fs.readFileSync(ACADEMIC_FILE_PATH, 'utf-8') || '[]')); }
    catch (err) { res.status(200).json([]); }
});

app.post('/api/academic', upload.any(), (req, res) => {
    try {
        const collabs = JSON.parse(fs.readFileSync(ACADEMIC_FILE_PATH, 'utf-8') || '[]');
        const parsedData = parseFormData(req);
        const newCollab = {
            _id: req.uploadBatchId || Date.now().toString(),
            ...parsedData,
            createdAt: new Date().toISOString()
        };
        collabs.unshift(newCollab);
        fs.writeFileSync(ACADEMIC_FILE_PATH, JSON.stringify(collabs, null, 2));
        res.status(201).json(newCollab);
    } catch (err) { res.status(500).json({ error: "Failed to save collaboration." }); }
});

app.delete('/api/academic/:id', (req, res) => {
    try {
        let collabs = JSON.parse(fs.readFileSync(ACADEMIC_FILE_PATH, 'utf-8') || '[]');
        collabs = collabs.filter(c => c._id !== req.params.id);
        const folderToDelete = path.join(UPLOADS_DIR, 'academic', `post_${req.params.id}`);
        if (fs.existsSync(folderToDelete)) fs.rmSync(folderToDelete, { recursive: true, force: true });
        fs.writeFileSync(ACADEMIC_FILE_PATH, JSON.stringify(collabs, null, 2));
        res.status(200).json({ message: "Deleted" });
    } catch (err) { res.status(500).json({ error: "Failed to delete" }); }
});


// ==========================================
//  ✅ EVENT ROUTES
// ==========================================
app.get('/api/events', (req, res) => {
    try { res.status(200).json(JSON.parse(fs.readFileSync(EVENT_FILE_PATH, 'utf-8') || '[]')); }
    catch (err) { res.status(200).json([]); }
});

app.post('/api/events', upload.any(), (req, res) => {
    try {
        const events = JSON.parse(fs.readFileSync(EVENT_FILE_PATH, 'utf-8') || '[]');
        const newEvent = { _id: req.uploadBatchId || Date.now().toString(), ...parseFormData(req), createdAt: new Date().toISOString() };
        events.push(newEvent);
        fs.writeFileSync(EVENT_FILE_PATH, JSON.stringify(events, null, 2));
        res.status(201).json(newEvent);
    } catch (err) { res.status(500).json({ error: "Could not write event." }); }
});

app.put('/api/events', (req, res) => {
    try {
        fs.writeFileSync(EVENT_FILE_PATH, JSON.stringify(req.body, null, 2));
        res.status(200).json({ message: "Events synchronized successfully!" });
    } catch (err) { res.status(500).json({ error: "Could not synchronize events." }); }
});

app.delete('/api/events/:id', (req, res) => {
    try {
        let events = JSON.parse(fs.readFileSync(EVENT_FILE_PATH, 'utf-8') || '[]');
        events = events.filter(e => String(e._id) !== String(req.params.id) && String(e.id) !== String(req.params.id));
        fs.writeFileSync(EVENT_FILE_PATH, JSON.stringify(events, null, 2));
        res.status(200).json({ message: "Event deleted." });
    } catch (err) { res.status(500).json({ error: "Could not delete event." }); }
});


// ==========================================
//  ✅ TEAM ROUTES
// ==========================================
app.get('/api/team', (req, res) => {
    try { res.status(200).json(JSON.parse(fs.readFileSync(TEAM_FILE_PATH, 'utf-8') || '[]')); }
    catch (err) { res.status(200).json([]); }
});

app.post('/api/team', upload.any(), (req, res) => {
    try {
        const team = JSON.parse(fs.readFileSync(TEAM_FILE_PATH, 'utf-8') || '[]');
        const newMember = {
            _id: req.uploadBatchId || Date.now().toString(),
            id: req.uploadBatchId || Date.now().toString(),
            ...parseFormData(req),
            createdAt: new Date().toISOString()
        };
        team.push(newMember);
        fs.writeFileSync(TEAM_FILE_PATH, JSON.stringify(team, null, 2));
        res.status(201).json(newMember);
    } catch (err) { res.status(500).json({ error: "Could not add team member." }); }
});

app.put('/api/team', (req, res) => {
    try {
        fs.writeFileSync(TEAM_FILE_PATH, JSON.stringify(req.body, null, 2));
        res.status(200).json({ message: "Team synchronized successfully!" });
    } catch (err) { res.status(500).json({ error: "Could not synchronize team." }); }
});

app.delete('/api/team/:id', (req, res) => {
    try {
        let team = JSON.parse(fs.readFileSync(TEAM_FILE_PATH, 'utf-8') || '[]');
        team = team.filter(m => String(m._id) !== String(req.params.id) && String(m.id) !== String(req.params.id));

        const folderToDelete = path.join(UPLOADS_DIR, 'team', `post_${req.params.id}`);
        if (fs.existsSync(folderToDelete)) fs.rmSync(folderToDelete, { recursive: true, force: true });

        fs.writeFileSync(TEAM_FILE_PATH, JSON.stringify(team, null, 2));
        res.status(200).json({ message: "Member deleted." });
    } catch (err) { res.status(500).json({ error: "Could not delete team member." }); }
});


// ==========================================
//  ✅ CAREER APPLICATIONS ROUTES
// ==========================================
app.get('/api/applications', (req, res) => {
    try { res.status(200).json(JSON.parse(fs.readFileSync(APPS_FILE_PATH, 'utf-8') || '[]')); }
    catch (err) { res.status(200).json([]); }
});

app.post('/api/applications', upload.any(), (req, res) => {
    try {
        let apps = [];
        try {
            const fileData = fs.readFileSync(APPS_FILE_PATH, 'utf-8');
            apps = JSON.parse(fileData || '[]');
        } catch (parseErr) {
            apps = [];
        }

        const trackingId = `MLS-${Math.floor(1000 + Math.random() * 9000)}`;

        const newApp = {
            _id: Date.now().toString(),
            trackingId: trackingId,
            status: "New",
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
            ...parseFormData(req)
        };

        apps.unshift(newApp);
        fs.writeFileSync(APPS_FILE_PATH, JSON.stringify(apps, null, 2));

        const mailOptions = {
            from: process.env.EMAIL_USER || 'your-email@gmail.com',
            to: newApp.email,
            subject: 'Application Received - MLS & Co. Law Firm',
            text: `Dear ${newApp.fullName},\n\nThank you for applying. Your Tracking ID is: ${trackingId}\n\nBest Regards,\nMLS & Co. HR Team`
        };

        transporter.sendMail(mailOptions, (error, info) => { });

        res.status(201).json({ message: "Application submitted!", trackingId: trackingId });
    } catch (err) {
        res.status(500).json({ error: "Could not submit application." });
    }
});

app.get('/api/applications/track/:trackingId', (req, res) => {
    try {
        const apps = JSON.parse(fs.readFileSync(APPS_FILE_PATH, 'utf-8') || '[]');
        const app = apps.find(a => a.trackingId === req.params.trackingId.trim().toUpperCase());

        if (app) res.status(200).json({ status: app.status, role: app.disputeType, name: app.fullName });
        else res.status(404).json({ error: "Tracking ID not found." });
    } catch (err) {
        res.status(500).json({ error: "Server error." });
    }
});

app.put('/api/applications/:id/status', (req, res) => {
    try {
        let apps = JSON.parse(fs.readFileSync(APPS_FILE_PATH, 'utf-8') || '[]');
        const index = apps.findIndex(a => a._id === req.params.id);

        if (index === -1) return res.status(404).json({ error: "Application not found" });

        apps[index].status = req.body.status;
        fs.writeFileSync(APPS_FILE_PATH, JSON.stringify(apps, null, 2));

        const applicantEmail = apps[index].email;
        if (applicantEmail) {
            transporter.sendMail({
                from: process.env.EMAIL_USER || 'your-email@gmail.com',
                to: applicantEmail,
                subject: 'Application Status Update - MLS & Co.',
                text: `Dear ${apps[index].fullName},\n\nYour application status for the ${apps[index].disputeType} position has been updated to: ${req.body.status}.\n\nBest Regards,\nMLS & Co. HR Team`
            }, (err) => { });
        }

        res.status(200).json({ message: "Status updated!", app: apps[index] });
    } catch (err) {
        res.status(500).json({ error: "Failed to update status." });
    }
});

app.delete('/api/applications/:id', (req, res) => {
    try {
        let apps = JSON.parse(fs.readFileSync(APPS_FILE_PATH, 'utf-8') || '[]');
        apps = apps.filter(a => a._id !== req.params.id);
        fs.writeFileSync(APPS_FILE_PATH, JSON.stringify(apps, null, 2));
        res.status(200).json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete." });
    }
});

// ==========================================
//  ✅ CONTACT FORM ROUTE (FIXED)
// ==========================================
app.get('/api/forms', (req, res) => {
    try { res.status(200).json(JSON.parse(fs.readFileSync(FORMS_FILE_PATH, 'utf-8') || '[]')); }
    catch (err) { res.status(200).json([]); }
});

// 🚨 FIXED: Now accepts POST requests from both /form AND /api/forms 
app.post(['/form', '/api/forms'], (req, res) => {
    try {
        const forms = JSON.parse(fs.readFileSync(FORMS_FILE_PATH, 'utf-8') || '[]');
        const newForm = {
            _id: Date.now().toString(),
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
            ...req.body
        };
        forms.unshift(newForm);
        fs.writeFileSync(FORMS_FILE_PATH, JSON.stringify(forms, null, 2));

        // 🚨 BONUS: Send an email notification to the Firm whenever a new contact request comes in
        if (process.env.EMAIL_USER) {
            transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: process.env.EMAIL_USER, // Sends an alert to your own inbox
                subject: `New Legal Inquiry: ${req.body.name}`,
                text: `You have a new contact request!\n\nName: ${req.body.name}\nPhone: ${req.body.phone}\nEmail: ${req.body.email || 'Not provided'}\nDispute Type: ${req.body.dispute}\nFlexible Hours: ${req.body.freetime || 'Not provided'}\n\nQuery:\n${req.body.query}`
            }, (err) => { /* Silently fail email if not setup, so form still submits */ });
        }

        res.status(201).json({ message: "Form Received" });
    } catch (err) {
        res.status(500).json({ error: "Could not save form." });
    }
});

app.delete('/api/forms/:id', (req, res) => {
    try {
        let forms = JSON.parse(fs.readFileSync(FORMS_FILE_PATH, 'utf-8') || '[]');
        forms = forms.filter(f => f._id !== req.params.id);
        fs.writeFileSync(FORMS_FILE_PATH, JSON.stringify(forms, null, 2));
        res.status(200).json({ message: "Message deleted" });
    } catch (err) { res.status(500).json({ error: "Failed to delete" }); }
});


app.get("/health", (req, res) => res.send("OK"));

// ----------------------
// START SERVER
// ----------------------
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`🚀 Server running smoothly on port ${PORT}`);
    console.log(`📂 Smart Media Storage Configured:`);
    console.log(`   - Root: backend/public/uploads/`);
    console.log(`   - Output: http://localhost:${PORT}/uploads/blogs/post_ID/images/filename.jpg`);
});