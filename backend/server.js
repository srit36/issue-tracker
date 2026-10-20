require('dotenv').config();

const os = require('os');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const Issue = require('./models/Issues');
const authRoutes = require('./routes/auth');
const { requireAuth, requireRole } = require('./middleware/auth');

for (const name of ['MONGODB_URI', 'JWT_SECRET', 'ENCRYPTION_KEY']) {
  if (!process.env[name]) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
}

const app = express();
app.set('trust proxy', 1); // behind Nginx: use X-Forwarded-For for client IPs
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10kb' }));

// Q1: tag every response with the container that served it
app.use((req, res, next) => {
  res.setHeader('X-Served-By', os.hostname());
  next();
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Only copy known string fields from the request body (blocks mass-assignment
// and operator-injection payloads such as {"status": {"$ne": null}})
const ISSUE_FIELDS = ['title', 'description', 'status', 'priority'];
const pickIssueFields = (body = {}) =>
  Object.fromEntries(
    ISSUE_FIELDS.filter((k) => typeof body[k] === 'string').map((k) => [k, body[k]])
  );

app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.use('/auth', authRoutes);

// READ: public (kept open so the Q1 load test still hits the same endpoint)
app.get('/issues', async (req, res) => {
  try {
    const issues = await Issue.find().sort({ createdAt: -1 });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE: any logged-in user (reporters can raise issues)
app.post('/issues', requireAuth, async (req, res) => {
  try {
    const issue = new Issue(pickIssueFields(req.body));
    const savedIssue = await issue.save();
    res.status(201).json(savedIssue);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE: admin or developer only
app.put('/issues/:id', requireAuth, requireRole('admin', 'developer'), async (req, res) => {
  try {
    const updatedIssue = await Issue.findByIdAndUpdate(
      req.params.id,
      pickIssueFields(req.body),
      { returnDocument: 'after', runValidators: true }
    );
    if (!updatedIssue) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    res.json(updatedIssue);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE: admin only
app.delete('/issues/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const deletedIssue = await Issue.findByIdAndDelete(req.params.id);
    if (!deletedIssue) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    res.json({ message: 'Issue deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
