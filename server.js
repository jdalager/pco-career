const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' });
app.use(cors());
app.use(express.static('public'));

// Configure your email transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Endpoint to handle application submission
app.post('/submit-application', upload.single('resume'), (req, res) => {
  const { name, email, phone, position, coverLetter } = req.body;
  const resumePath = req.file.path;

  const mailOptions = {
    from: email,
    to: process.env.RECEIVING_EMAIL,
    subject: `New Job Application for ${position}`,
    html: `
      <h2>New Job Application</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Position:</strong> ${position}</p>
      <p><strong>Cover Letter:</strong><br>${coverLetter || 'None provided.'}</p>
    `,
    attachments: [
      {
        filename: req.file.originalname,
        path: resumePath,
      },
    ],
  };

  transporter.sendMail(mailOptions, (error, info) => {
    // Delete the file after sending
    fs.unlink(resumePath, (err) => {
      if (err) console.error('Error deleting the file:', err);
    });

    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).send('Error submitting your application.');
    }

    console.log('Application sent:', info.response);
    res.status(200).send('Application submitted successfully!');
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
