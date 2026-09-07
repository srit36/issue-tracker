require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Issue = require('./models/Issues');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.post('/issues', async (req, res) => {
  try {
    const issue = new Issue(req.body);
    const savedIssue = await issue.save();
    res.status(201).json(savedIssue);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/issues', async (req, res) => {
  try {
    const issues = await Issue.find().sort({ createdAt: -1 });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/issues/:id', async (req, res) => {
  try {
    const updatedIssue = await Issue.findByIdAndUpdate(
      req.params.id,
      req.body,
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

app.delete('/issues/:id', async (req, res) => {
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

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});