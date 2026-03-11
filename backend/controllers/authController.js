// Authentication Controller
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const isDev = process.env.NODE_ENV !== 'production';

// Log error with full details for Render/debugging (no passwords)
function logAuthError(operation, error, context = {}) {
  const safeContext = { ...context };
  if (safeContext.password) delete safeContext.password;
  if (safeContext.confirmPassword) delete safeContext.confirmPassword;
  console.error(`❌ [AUTH] ${operation} error:`, {
    message: error?.message,
    name: error?.name,
    code: error?.code,
    stack: error?.stack || '(no stack)',
    context: safeContext,
    hasJwtSecret: Boolean(process.env.JWT_SECRET),
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
  });
}

// Sign Up - Create new user
const signup = async (req, res) => {
  try {
    const { email, password, confirmPassword, fullName } = req.body;

    // Validation
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and confirm password are required.'
      });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Passwords do not match.'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format.'
      });
    }

    // Password strength validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long.'
      });
    }

    // Check if user already exists
    const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [
      email.toLowerCase()
    ]);

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists.'
      });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const result = await db.query(
      `INSERT INTO users (email, password_hash, full_name, role) 
             VALUES ($1, $2, $3, $4) 
             RETURNING id, email, full_name, role, created_at`,
      [email.toLowerCase(), passwordHash, fullName || '', 'staff']
    );

    const newUser = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('✅ New user registered:', newUser.email);

    res.status(201).json({
      success: true,
      message: 'User registered successfully!',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.full_name,
        role: newUser.role,
        createdAt: newUser.created_at
      }
    });
  } catch (error) {
    logAuthError('Signup', error, { email: req.body?.email });
    const message = isDev ? (error?.message || String(error)) : 'Server error during signup.';
    res.status(500).json({
      success: false,
      error: message,
      ...(isDev && { hint: error?.code === 'ECONNREFUSED' ? 'Database unreachable. Check DATABASE_URL.' : error?.code === 'ENOTFOUND' ? 'Database host not found.' : undefined }),
    });
  }
};

// Login - Authenticate user
const login = async (req, res) => {
  const requestId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  try {
    const { email, password } = req.body || {};

    console.log(`[AUTH] Login attempt ${requestId}`, { email: email ? `${email.slice(0, 3)}***` : '(missing)', hasPassword: Boolean(password), bodyKeys: req.body ? Object.keys(req.body) : [] });

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required.'
      });
    }

    // Fail fast if JWT_SECRET is missing (prevents cryptic 500)
    if (!process.env.JWT_SECRET) {
      logAuthError('Login', new Error('JWT_SECRET is not set'), { email });
      return res.status(500).json({
        success: false,
        error: isDev ? 'Server misconfiguration: JWT_SECRET is not set. Set it in Render Environment.' : 'Server error during login.',
      });
    }

    // Find user
    let result;
    try {
      result = await db.query(
        'SELECT id, email, password_hash, full_name, role FROM users WHERE email = $1',
        [email.toLowerCase()]
      );
    } catch (dbError) {
      logAuthError('Login (DB query)', dbError, { email });
      const message = isDev ? (dbError?.message || String(dbError)) : 'Server error during login.';
      return res.status(500).json({
        success: false,
        error: message,
        ...(isDev && { hint: !process.env.DATABASE_URL ? 'DATABASE_URL is not set in Render.' : 'Check DATABASE_URL and Neon connectivity.' }),
      });
    }

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
    }

    const user = result.rows[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
    }

    // Generate JWT token (JWT_SECRET already checked above)
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log(`✅ [AUTH] Login success ${requestId}:`, user.email);

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role
      }
    });
  } catch (error) {
    logAuthError('Login', error, { email: req.body?.email, requestId });
    const message = isDev ? (error?.message || String(error)) : 'Server error during login.';
    res.status(500).json({
      success: false,
      error: message,
      ...(isDev && {
        hint: !process.env.JWT_SECRET ? 'Set JWT_SECRET in Render.'
          : !process.env.DATABASE_URL ? 'Set DATABASE_URL in Render.'
          : error?.code === 'ECONNREFUSED' ? 'Database unreachable.'
          : undefined,
      }),
    });
  }
};

// Logout - Clear token (handled on client side, but we provide endpoint for consistency)
const logout = async (req, res) => {
  try {
    console.log('✅ User logged out:', req.user.email);

    res.json({
      success: true,
      message: 'Logout successful!'
    });
  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during logout.'
    });
  }
};

// Get current user info
const getCurrentUser = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, email, full_name, role, created_at FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found.'
      });
    }

    const user = result.rows[0];

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('❌ Get current user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error.'
    });
  }
};

module.exports = {
  signup,
  login,
  logout,
  getCurrentUser
};
