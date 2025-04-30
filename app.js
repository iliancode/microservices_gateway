const express = require('express');
const proxy = require('express-http-proxy');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(mod => mod.default(...args));

const app = express();
app.use(express.json());
app.use(cors());

// Proxy pour /users
app.use('/users', proxy(process.env.USERS_SERVICE_URL, {
  proxyReqPathResolver: req => `/users${req.url}`,
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    if (srcReq.headers['authorization']) {
      proxyReqOpts.headers['authorization'] = srcReq.headers['authorization'];
    }
    return proxyReqOpts;
  }
}));

// Handler avec fallback pour /orders/*
app.use('/orders', async (req, res) => {
  const headers = {
    'Authorization': req.headers['authorization'] || '',
  };

  console.log('🔐 Token forwarded to fallback:', headers.Authorization);
  const primaryUrl = new URL(req.originalUrl, process.env.ORDERS_SERVICE_URL);
  const fallbackUrl = new URL(`/users${req.originalUrl}`, process.env.USERS_SERVICE_URL);

  try {
    console.log('➡️  Trying primary:', primaryUrl.href);
    const response = await fetch(primaryUrl.href, { headers });

    if (!response.ok) {
      throw new Error(`Primary service failed with status ${response.status}`);
    }

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    console.warn('⚠️ Primary /orders failed:', err.message);
    try {
      console.log('🔁 Trying fallback:', fallbackUrl.href);
      const fallbackResponse = await fetch(fallbackUrl.href, { headers });

      if (!fallbackResponse.ok) {
        throw new Error(`Fallback service failed with status ${fallbackResponse.status}`);
      }

      const fallbackData = await fallbackResponse.json();
      return res.status(fallbackResponse.status).json(fallbackData);
    } catch (fallbackErr) {
      console.error('❌ Both /orders and fallback failed:', fallbackErr.message);
      return res.status(502).json({ message: 'Les deux services /orders et /users/orders ont échoué' });
    }
  }
});

// Handler avec fallback pour /menu/*
app.use('/menu', async (req, res) => {
  const headers = {
    'Authorization': req.headers['authorization'] || '',
  };

  const primaryUrl = new URL(req.originalUrl, process.env.MENU_SERVICE_URL);
  const fallbackUrl = new URL(`/users${req.originalUrl}`, process.env.USERS_SERVICE_URL);

  try {
    console.log('➡️  Trying primary:', primaryUrl.href);
    const response = await fetch(primaryUrl.href, { headers });

    if (!response.ok) {
      throw new Error(`Primary service failed with status ${response.status}`);
    }

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    console.warn('⚠️ Primary /menu failed:', err.message);
    try {
      console.log('🔁 Trying fallback:', fallbackUrl.href);
      const fallbackResponse = await fetch(fallbackUrl.href, { headers });

      if (!fallbackResponse.ok) {
        throw new Error(`Fallback service failed with status ${fallbackResponse.status}`);
      }

      const fallbackData = await fallbackResponse.json();
      return res.status(fallbackResponse.status).json(fallbackData);
    } catch (fallbackErr) {
      console.error('❌ Both /menu and fallback failed:', fallbackErr.message);
      return res.status(502).json({ message: 'Les deux services /menu et /users/menu ont échoué' });
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ API Gateway running on http://localhost:${PORT}`);
});
