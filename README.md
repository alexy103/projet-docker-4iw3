# Projet Docker 

Lien du dépôt [git](https://github.com/alexy103/projet-docker-4iw3)

Lien de la vidéo [YouTube](https://www.youtube.com/watch?v=1WVWsaBFSpA)

## Setup du projet

### Build des images
Nos images de production se trouvent actuellement sur une [registry](https://hub.docker.com/repositories/alexy103).

À côté de chaque Dockerfile.prod se trouve un Dockerfile.dev permettant de créer l’image correspondante, pour un environnement développement.

Pour créer les images manuellement, voici la marche à suivre en se trouvant à la racine du projet :

```bash
docker build -t frontend-prod:1 -f ./frontend/Dockerfile.prod ./frontend

docker build -t order-service-prod:1 -f ./services/order-service/Dockerfile.prod ./services/order-service

docker build -t product-service-prod:1 -f ./services/product-service/Dockerfile.prod ./services/product-service

docker build -t auth-service-prod:1 -f ./services/auth-service/Dockerfile.prod ./services/auth-service
```

### Lancement des containers
Version de développement :
```bash
docker compose up -d --build
```

Ouvrez votre navigateur et accédez à http://<IP_MACHINE>:8080

Version de production (sans Docker Swarm) :

Il faut commencer par ajouter une valeur à la variable jwt_secret.
Pour cela, créer le fichier secrets/jwt_secret.txt avec la valeur “efrei_super_pass” à l’intérieur, de cette façon :

```bash
efrei_super_pass
```

puis exécuter la commande :

```bash
docker secret create jwt_secret secrets/jwt_secret.txt
```

Commande pour supprimer le secret en cas de besoin : 
```bash
docker secret rm jwt_secret 
```

Le contenu du fichier secrets/jwt_secrets.txt sera injecté dans la variable docker “jwt_secret” et donc accessible à l’adresse /run/secrets/JWT_SECRET grâce aux paramètres spécifiés dans le fichier docker-stack.yml.

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Ouvrez votre navigateur et accédez à http://<IP_MACHINE>

Version de production (avec Docker Swarm) :

Le fichier secrets/jwt_secret.txt doit être créé de la même façon que pour la version de production sans Docker Swarm.

Il faut commencer par lancer les services avec la commande :
```bash
docker stack deploy -c docker-stack.yml ecommerce
```

Ouvrez votre navigateur et accédez à http://<IP_MACHINE>

Commande pour arrêter les services : 
```bash
docker stack rm ecommerce
```

La commande suivante permet de s’assurer que chaque service fonctionne correctement :
```bash
docker service ls
```
À exécuter quelques secondes après la commande deploy pour que les services aient le temps de se lancer.

## Tester nos services

### Pour la version de dev

Étant donné que les ports sont ouverts pour la version de développement, il suffit de se connecter à la machine et `localhost` sera accessible.

1. Auth

    - Inscription d'un Nouvel Utilisateur
        ```bash
        curl -X POST http://localhost:3001/api/auth/register \
            -H "Content-Type: application/json" \
            -d '{"email": "user@example.com", "password": "password123"}'
        ```

2. Product

    - Récupération de la Liste des Produits
        
        ```bash
        curl -X GET http://localhost:3000/api/products
        ```

    - Ajout d'un Produit au Panier

        ```bash
        curl -X POST http://localhost:3000/api/cart/add \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer efrei_super_pass" \
        -d '{
            "userId": ""<user_id>",
            "productId": ""<product_id>",
            "quantity": 2
        }'
        ```

3. Order

    - Passation d'une Commande
        ```bash
        curl -X POST http://localhost:3002/api/orders \
        -H "Authorization: Bearer <JWT_TOKEN>" \
        -H "Content-Type: application/json" \
        -d '{
            "products": [{
            "productId": "<product_id>",
            "quantity": 2
            }],
            "shippingAddress": {
            "street": "123 Test St",
            "city": "Test City",
            "postalCode": "12345"
            }
        }'
        ```

    - Consultation de l'Historique des Commandes
        
        ```bash
        curl -X GET http://localhost:3002/api/orders \
            -H "Authorization: Bearer <JWT_TOKEN>"
        ```

### Pour la version de prod

```bash
docker exec -it <frontend_container> sh
```

1. Auth

    - Inscription d'un Nouvel Utilisateur

        ```bash
        curl -X POST http://auth-service:3001/api/auth/register -H "Content-Type: application/json" -d '{"email": "user@example.com", "password": "password123"}'
        ```

    - Connexion (si besoin)

        ```bash
        curl -X POST http://auth-service:3001/api/auth/login -H "Content-Type: application/json" -d '{"email": "user@example.com", "password": "password123"}'
        ```
    

2. Product

    - Récupération de la Liste des Produits

        ```bash
        curl -X GET http://product-service:3000/api/products
        ```

    - Ajout d'un Produit au Panier
     
        ```bash
        curl -X POST http://product-service:3000/api/cart/add \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer <JWT_TOKEN>" \
        -d '{
            "userId": "<user_id>",
            "productId": "<product_id>",
            "quantity": 2
        }'

        ```

3. Order

    - Passation d'une Commande

        ```bash
        curl -X POST http://order-service:3002/api/orders \
        -H "Authorization: Bearer <JWT_TOKEN>" \
        -H "Content-Type: application/json" \
        -d '{
            "products": [{
            "productId": "<product_id>",
            "quantity": 2
            }],
            "shippingAddress": {
            "street": "123 Test St",
            "city": "Test City",
            "postalCode": "12345"
            }
        }'
        ```

    - Consultation de l'Historique des Commandes
      
        ```bash
        curl -X GET http://order-service:3002/api/orders \
            -H "Authorization: Bearer <JWT_TOKEN>"
        ```

## Synthèse
### Modifications du code
Au cours de ce projet, nous avons du modifier quelques parties du code, comme la variable `VITE_PRODUCT_SERVICE_URL`, de cette façon :
```bash
avant
VITE_PRODUCT_SERVICE_URL=http://127.0.0.1:3000

après
VITE_PRODUCT_SERVICE_URL=http://product-service:3000
```

Les conteneurs ne pouvaient pas communiquer entre eux sans cette modification ; de même pour la variable `MONGODB_URI` pour laquelle il fallait rajouter le nom de la base :
```bash
avant
MONGODB_URI=mongodb://mongodb:27017

après
MONGODB_URI=mongodb://mongodb:27017/ecommerce
```

Nous avons également du créer un fichier de configuration Nginx (utilisation d'une image Nginx pour le Dockerfile.prod du front) qui fait office de reverse proxy.

Par exemple, en appelant /api/auth, cela appelle le serveur correspondant à ce chemin (auth-service:3001).

```
server {
    listen 80;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/auth {
        proxy_pass http://auth-service:3001;

        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header Authorization $http_authorization;
        proxy_set_header Cookie $http_cookie;
    }

    location /api/products {
        proxy_pass http://product-service:3000;

        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header Authorization $http_authorization;
        proxy_set_header Cookie $http_cookie;
    }

    location /api/orders {
        proxy_pass http://order-service:3002;

        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header Authorization $http_authorization;
        proxy_set_header Cookie $http_cookie;
    }

    location /api/cart {
        proxy_pass http://product-service:3000;

        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header Authorization $http_authorization;
        proxy_set_header Cookie $http_cookie;
    }
}
```

### Bonnes pratiques

Nous avons créé pour chaque service deux Dockerfile différents, un Dockerfile.dev et un Dockerfile.prod afin de pouvoir différencier facilement les deux environnements et pouvoir les créer via deux docker-compose correspondants.

Pour les Dockerfile.prod, nos conteneurs ne sont pas exécutés en tant que root afin de garantir une sécurité en limitant les accès. 

Nos Dockerfile.dev comportent tous du hot-reload afin de relancer le build des conteneurs après toute modification du code.

Tous nos conteneurs possèdent des healthchecks afin de vérifier leur bon fonctionnement. Par exemple, nos services dépendent du lancement de la base de données et ne se lanceront uniquement si cette dernière est opérationnelle. 

L'image de production du frontend est créée en multi-stage afin de gagner en légèreté et réduire la taille de l'image finale. Nous avons choisi de remplacer l'image Node initiale par une image Nginx, cette dernière étant beaucoup plus légère et suffisante pour du multi-stage.

Les images de production de nos 3 services ne sont pas buildées en multi-stage car, suite à différents tests, cela n'impactait pas le résultat final et rendait uniquement les Dockerfile plus verbeux.

Évoqué plusieurs fois en cours, nous avons choisi d'utiliser Docker Swarm pour comprendre son fonctionnement. Tout le projet était déjà fonctionnel avant son intégration, ce qui l'a rendue assez naturelle et dans la continuité de ce que nous avions déjà produit.

Nous avons également choisi d'utiliser les secrets pour les variables sensibles comme le token JWT.

### Difficultés rencontrées

Nous avons choisi de gérer les secrets via Docker Swarm et avons choisi de créer un fichier `secrets/jwt_secret`, qui a fonctionné rapidement avec Docker Swarm.

Une condition a été rajoutée dans le app.js des deux services qui utilisent ce token JWT :

```js
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = fs.readFileSync("/run/secrets/JWT_SECRET", "utf8").trim();
}
```

Cela permet de lire la valeur contenu dans le fichier et de l'affecter à notre variable d'environnement JWT_SECRET. La compléxité résidait dans le fait de garder fonctionnel les 3 versions disponibles : développement, production et Docker Swarm.

Or, une fois toute cette configuration installée, la logique implémentée pour gérer le secret JWT ne fonctionnait pas avec le docker-compose.prod initial.

Nous avons du légèrement remanier ce fichier pour y inclure la logique de secrets.