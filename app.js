const express = require('express');
const proxy = require('express-http-proxy');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const cors = require('cors');
const jwt = require('jsonwebtoken');

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

app.use('/delivery', proxy(process.env.DELIVERY_SERVICE_URL, {
  proxyReqPathResolver: req => {
    return `/delivery${req.url}`;
  },
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    if (srcReq.headers['authorization']) {
      proxyReqOpts.headers['authorization'] = srcReq.headers['authorization'];
    }
    return proxyReqOpts;
  }
}));

app.use('/orders', proxy(process.env.ORDERS_SERVICE_URL, {
  proxyReqPathResolver: req => {
    return `/orders${req.url}`;
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
