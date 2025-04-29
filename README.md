# 🍔 Projet Uber Eats - Architecture Microservices

Ce projet est une application de commande de repas en ligne inspirée d'Uber Eats. Il est construit avec une **architecture microservices** et une **API Gateway** centralisée pour orchestrer les échanges entre les services.

## 🔧 Stack technique

- **Node.js** (Express)

- **MySQL** pour chaque service

- **JWT** pour l'authentification

- **Vercel** pour le déploiement

- **Postman** 

---

## 📦 Architecture

```text

                                 +------------------+

                                 |     Frontend     |

                                 +------------------+

                                          |

                                          ▼

                               +----------------------+

                               |     API Gateway      |  ← centralise les appels

                               +----------------------+

                            /     |       |       |

                           ▼      ▼       ▼       ▼       

                        Users   Menu   Orders  Delivery  
```
Chaque microservice dispose de :

-   un **dépôt GitHub dédié**

-   une **base de données indépendante**

-   une **API REST** exposée via **Vercel**

* * * * *

🚪 Gateway API
--------------

| Service | Repo GitHub | URL déployée |
| --- | --- | --- |
| **Gateway** | <https://github.com/iliancode/microservices_gateway> | <https://microservices-gateway-fvog.vercel.app> |

La gateway centralise tous les appels aux microservices (`/users`, `/menu`, `/orders`, `/delivery`) et assure l'authentification centralisée via JWT.

* * * * *

🔌 Microservices
----------------

### 👤 Users (Gestion des utilisateurs)

-   Authentification (JWT)

-   Inscription / Connexion

-   Rôles : `client`, `restaurant`, `livreur`, `admin`

| Ressource | Détails |
| --- | --- |
| **Repo** | <https://github.com/iliancode/microservices_user> |
| **Vercel** | <https://microservices-user.vercel.app/> |

* * * * *

### 🍽️ Menu (Gestion des menus de restaurant)

-   CRUD des items de menu

-   Filtrage par restaurant

-   Protégé par JWT + rôle `admin` ou `restaurant`

| Ressource | Détails |
| --- | --- |
| **Repo** | <https://github.com/iliancode/microservices_menu> |
| **Vercel** | <https://microservices-menu.vercel.app/> |

* * * * *

### 🛒 Orders (Gestion des commandes)

-   Création de commande par les clients

-   Suivi d'état de commande

-   Consultation par rôle

| Ressource | Détails |
| --- | --- |
| **Repo** | <https://github.com/YanisHlali/orders-service> |
| **Vercel** | <https://orders-service-rho.vercel.app/> |

* * * * *

### 🚚 Delivery (Gestion des livraisons)

-   Attribution des livreurs

-   Mise à jour du statut de livraison

-   Visualisation des commandes en cours

| Ressource | Détails |
| --- | --- |
| **Repo** | <https://github.com/YanisHlali/delivery-service> |
| **Vercel** | <https://delivery-service-three.vercel.app> |

* * * * *

🔐 Authentification & Sécurité
------------------------------

-   Chaque microservice utilise **JWT** pour authentifier les requêtes via un middleware `protect`.

-   La **gateway** relaie les tokens pour les services nécessitant une autorisation.

-   Les routes sensibles sont protégées par un middleware `authorize(...)` basé sur le rôle utilisateur.

* * * * *

🧪 Test des APIs
----------------

-   Utiliser **Postman** avec la collection fournie pour tester toutes les routes (`/register`, `/login`, `/menu`, `/orders`, etc.)

-   Le token JWT doit être inséré dans l'en-tête `Authorization: Bearer <token>`

* * * * *

📁 Organisation du code
-----------------------

Chaque microservice suit une structure **MVC** :

`.
├── controllers
├── models
├── routes
├── middleware
├── config
└── server.js`

* * * * *

🚀 Déploiement
--------------

Tous les services sont déployés via **Vercel**. Les bases de données associées sont hébergées de manière indépendante (MySQL).

* * * * *

🧱 Scalabilité
--------------

L'architecture permet :

-   L'indépendance des services

-   La scalabilité horizontale

-   Une séparation claire des responsabilités

* * * * *

🤝 Contributeurs
----------------

-   [@iliancode](https://github.com/iliancode)

-   [@YanisHlali](https://github.com/YanisHlali)
  
-   [@GucluSefa](https://github.com/guclusefa)

* * * * *

📌 À venir
----------

-   Paiement Stripe

-   Notifications temps réel

-   Panel admin
