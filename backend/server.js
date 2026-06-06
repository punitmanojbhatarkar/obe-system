const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/context', require('./routes/context'));
app.use('/api/vision', require('./routes/vision'));
app.use('/api/cos', require('./routes/courseOutcomes'));
app.use('/api/pi-mapping', require('./routes/piMapping'));
app.use('/api/copo-matrix', require('./routes/copoMatrix'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/marks', require('./routes/marks'));
app.use('/api/attainment', require('./routes/attainment'));
app.use('/api/exit-survey', require('./routes/exitSurvey'));
app.use('/api/action-report', require('./routes/actionReport'));
app.use('/api/pdf', require('./routes/pdf'));
app.use('/api/suggestions', require('./routes/suggestions'));
app.use('/api/students', require('./routes/students'));

app.get('/api/health', (req, res) => res.json({ status: 'OBE System Running' }));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch(err => console.error('DB connection error:', err));

module.exports = app;
