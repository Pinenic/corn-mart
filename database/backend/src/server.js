const express = require('express');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authMiddleware = require('./middleware/authMiddleware');

const app = express();
app.use(express.json());
app.use(cookieParser());

// Public route
app.get('/health', (req, res) => res.json({ ok: true }));

// Protected route example
app.get('/api/profile', authMiddleware, async (req, res) => {
  // req.user contains supabase user object
  res.json({ user: req.user });
});

// Example: store-only route (verify ownership)
app.post('/api/stores/:storeId/secure-action', authMiddleware, async (req, res) => {
  const storeId = req.params.storeId;
  const userId = req.user.id;
  // check owner in DB before proceeding (use supabaseAdmin)
  const { data: store, error } = await supabaseAdmin
    .from('stores')
    .select('owner_id')
    .eq('id', storeId)
    .single();

  if (error) return res.status(500).json({ error: 'DB error' });
  if (store.owner_id !== userId) return res.status(403).json({ error: 'Forbidden' });

  // proceed with secure action...
  res.json({ ok: true });
});
// route: POST /api/session
// body: { access_token }
app.post('/api/session', async (req, res) => {
  const { access_token } = req.body;
  if (!access_token) return res.status(400).json({ error: 'Missing token' });

  // Optionally verify the token first:
  const { data, error } = await supabaseAdmin.auth.getUser(access_token);
  if (error || !data.user) return res.status(401).json({ error: 'Invalid token' });

  // Set cookie (HttpOnly, Secure, SameSite=strict)
  res.cookie('xoo_sess', access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', // or 'strict' where appropriate
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  });

  res.json({ ok: true });
});
//logout route
app.post('/api/session/logout', (req, res) => {
  res.clearCookie('xoo_sess');
  res.json({ ok: true });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
