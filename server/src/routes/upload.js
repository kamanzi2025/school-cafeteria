const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { authStaff } = require('../middleware/auth');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const BUCKET = 'uploads';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => file.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('Images only'))
});

router.post('/', authStaff, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'No file' });

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(req.file.originalname)}`;
  const { error } = await supabase.storage.from(BUCKET).upload(filename, req.file.buffer, {
    contentType: req.file.mimetype
  });
  if (error) return res.status(500).json({ success: false, error: error.message });

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
  res.json({ success: true, data: { url: data.publicUrl } });
});

module.exports = router;
