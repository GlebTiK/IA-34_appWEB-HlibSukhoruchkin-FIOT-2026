'use strict';

const path = require('path');
const express = require('express');
const multer = require('multer');

const router = express.Router();

const allowedTypes = new Set(['image/jpeg', 'image/png', 'application/pdf']);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (_req, file, cb) => {
    const safeOriginalName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safeOriginalName}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (allowedTypes.has(file.mimetype)) cb(null, true);
    else cb(new Error('Only jpg, png and pdf files are allowed'));
  }
});

router.post('/upload', upload.single('file'), (req, res) => {
  res.status(201).json({ message: 'File uploaded successfully', file: req.file });
});

router.post('/upload-multiple', upload.array('files', 5), (req, res) => {
  res.status(201).json({ message: 'Files uploaded successfully', files: req.files });
});

module.exports = router;
