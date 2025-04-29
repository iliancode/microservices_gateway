const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const app = express();
const port = 3000;  // L'API Gateway tourne sur ce port

// Middleware pour parser le corps des requêtes en JSON
app.use(express.json());

// Middleware pour vérifier le token JWT
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Récupère le token depuis l'en-tête Authorization
  
  if (!token) {
    return res.status(403).json({ message: 'Token is required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Ajoute l'ID de l'utilisateur décodé du token dans la requête
    req.user = decoded;
    next();
  });
};

// Middleware pour autoriser uniquement les administrateurs
const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }
  next();
};

// Exemple de route pour enregistrer un utilisateur
app.post('/users/register', async (req, res) => {
  try {
    const response = await axios.post(`${process.env.USERS_SERVICE_URL}/users/register`, req.body);
    res.json(response.data);  // Renvoie la réponse du microservice Users
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

// Exemple de route pour se connecter (login)
app.post('/users/login', async (req, res) => {
  try {
    const response = await axios.post(`${process.env.USERS_SERVICE_URL}/users/login`, req.body);
    res.json(response.data);  // Renvoie la réponse du microservice Users
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// Exemple de route pour obtenir les informations de l'utilisateur connecté (protégée par JWT)
app.get('/users/me', verifyToken, async (req, res) => {
  try {
    const response = await axios.get(`${process.env.USERS_SERVICE_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${req.headers.authorization.split(' ')[1]}`  // Passe le token au microservice
      }
    });
    res.json(response.data);  // Renvoie la réponse du microservice Users
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user information', error: error.message });
  }
});

// Exemple de route pour supprimer un utilisateur (protégée par JWT)
app.delete('/users/:id', verifyToken, async (req, res) => {
  try {
    const response = await axios.delete(`${process.env.USERS_SERVICE_URL}/users/${req.params.id}`, {
      headers: {
        Authorization: `Bearer ${req.headers.authorization.split(' ')[1]}`  // Passe le token au microservice
      }
    });
    res.json(response.data);  // Renvoie la réponse du microservice Users
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

// Exemple de route pour obtenir tous les restaurants (protégée par JWT et nécessite des droits d'admin)
app.get('/users/all', async (req, res) => {
    try {
      const response = await axios.get(`${process.env.USERS_SERVICE_URL}/users/all`);
      res.json(response.data);  // Renvoie la réponse du microservice Users
    } catch (error) {
      res.status(500).json({ message: 'Error fetching restaurants', error: error.message });
    }
  });

// Démarrer le serveur
app.listen(port, () => {
  console.log(`API Gateway is running on http://localhost:${port}`);
});
