const express = require('express');
const proxy = require('express-http-proxy');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const fetch = (...args) => import('node-fetch').then(mod => mod.default(...args));

const app = express();
app.use(express.json());
app.use(cors());

app.use('/users', proxy(process.env.USERS_SERVICE_URL, {
  proxyReqPathResolver: req => {
    return `/users${req.url}`;
  },
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    if (srcReq.headers['authorization']) {
      proxyReqOpts.headers['authorization'] = srcReq.headers['authorization'];
    }
    return proxyReqOpts;
  }
}));

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
    res.status(200).json(data);
  } catch (err) {
    console.warn('Primary /orders failed, trying fallback /users/orders');

    try {
      const fallbackResponse = await fetch(`${process.env.USERS_SERVICE_URL}users/orders`, { headers });

      if (!fallbackResponse.ok) {
        throw new Error(`Fallback service also failed with status ${fallbackResponse.status}`);
      }

      const fallbackData = await fallbackResponse.json();
      res.status(200).json(fallbackData);
    } catch (fallbackErr) {
      console.error('Both services failed:', fallbackErr.message);
      res.status(502).json({ message: 'Les deux services /orders et /users/orders ont échoué' });
    }
  }
});

app.use('/menu', proxy(process.env.MENU_SERVICE_URL, {
  proxyReqPathResolver: req => {
    return `/menu${req.url}`;
  },
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    if (srcReq.headers['authorization']) {
      proxyReqOpts.headers['authorization'] = srcReq.headers['authorization'];
    }
    return proxyReqOpts;
  }
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Gateway running on http://localhost:${PORT}`);
});
