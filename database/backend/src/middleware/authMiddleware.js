const { supabaseAdmin } = require('../services/supabaseClient');

async function authMiddleware(req, res, next) {
  try {
    // Accept token from Authorization header OR cookie (httpOnly)
    const authHeader = req.headers.authorization;
    let accessToken = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      accessToken = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies['xoo_sess']) {
      accessToken = req.cookies['xoo_sess'];
    }

    if (!accessToken) {
      return res.status(401).json({ error: 'Missing token' });
    }

    const { data, error } = await supabaseAdmin.auth.getUser(accessToken);
    if (error || !data?.user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = data.user; // contains id, email, role-ish claims in user
    next();
  } catch (err) {
    console.error('authMiddleware error', err);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}

module.exports = authMiddleware;
