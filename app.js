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

// Handler avec fallback pour /orders
app.get('/orders', async (req, res) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': req.headers['authorization'] || '',
  };

  try {
    const response = await fetch(`${process.env.ORDERS_SERVICE_URL}/orders`, { headers });

    if (!response.ok) {
      throw new Error(`Primary service failed with status ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.warn('Primary /orders failed, trying fallback /users/orders');

    try {
      const fallbackResponse = await fetch(`${process.env.USERS_SERVICE_URL}/users/orders`, { headers });

      if (!fallbackResponse.ok) {
        throw new Error(`Fallback service also failed with status ${fallbackResponse.status}`);
      }

      const fallbackData = await fallbackResponse.json();
      return res.status(200).json(fallbackData);
    } catch (fallbackErr) {
      console.error('Both services failed:', fallbackErr.message);
      return res.status(502).json({ message: 'Les deux services /orders et /users/orders ont échoué' });
    }
  }
});

// Handler avec fallback pour /menu
app.get('/menu', async (req, res) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': req.headers['authorization'] || '',
  };

  try {
    const response = await fetch(`${process.env.MENU_SERVICE_URL}/menu`, { headers });

    if (!response.ok) {
      throw new Error(`Primary service failed with status ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.warn('Primary /menu failed, trying fallback /users/menu');

    try {
      const fallbackResponse = await fetch(`${process.env.USERS_SERVICE_URL}/users/menu`, { headers });

      if (!fallbackResponse.ok) {
        throw new Error(`Fallback service also failed with status ${fallbackResponse.status}`);
      }

      const fallbackData = await fallbackResponse.json();
      return res.status(200).json(fallbackData);
    } catch (fallbackErr) {
      console.error('Both services failed:', fallbackErr.message);
      return res.status(502).json({ message: 'Les deux services /menu et /users/menu ont échoué' });
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Gateway running on http://localhost:${PORT}`);
});
