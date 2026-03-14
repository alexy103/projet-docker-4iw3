# Projet Docker 

Lien du dépôt [git](https://github.com/alexy103/projet-docker-4iw3)

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

Ouvrez votre navigateur et accédez à http://localhost:8080

Version de production (sans Docker Swarm) : 
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Ouvrez votre navigateur et accédez à http://localhost

Version de production (avec Docker Swarm) :

Il faut commencer par ajouter une valeur à la variable jwt_secret.
Pour cela, créer le fichier secrets/jwt_secret.txt avec la valeur “efrei_super_pass” à l’intérieur, puis exécuter la commande :

```bash
docker secret create jwt_secret secrets/jwt_secret.txt
```

Commande pour supprimer le secret en cas de besoin : 
```bash
docker secret rm jwt_secret 
```

Le contenu du fichier secrets/jwt_secrets.txt sera injecté dans la variable docker “jwt_secret” et donc accessible à l’adresse /run/secrets/JWT_SECRET grâce aux paramètres spécifiés dans le fichier docker-stack.yml.

Il faudra ensuite lancer les services avec la commande :
```bash
docker stack deploy -c docker-stack.yml ecommerce
```

Ouvrez votre navigateur et accédez à http://localhost

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

docker exec -it <frontend_container>

1. Auth

    - Inscription d'un Nouvel Utilisateur

        ```bash
        curl -X POST http://auth-service:3001/api/auth/register -H "Content-Type: application/json" -d '{"email": "user@example.com", "password": "password123"}'
        ```

2. Product

    - Récupération de la Liste des Produits

        ```bash
        curl -X GET http://localhost:3000/api/products
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



/order-service/.env :

VITE_PRODUCT_SERVICE_URL=http://product-service:3000

au lieu de 

VITE_PRODUCT_SERVICE_URL=http://127.0.0.1:3000

car n'arrivait pas à communiquer avec le conteneur des produits

.env :

MONGODB_URI=mongodb://mongodb:27017/ecommerce

au lieu de 

MONGODB_URI=mongodb://mongodb:27017

dockerfile front prod => creation d'un fichier de conf nginx
















2. Documentation :
• Un fichier README détaillant :
– Les étapes pour construire et exécuter les conteneurs.
– Les configurations spécifiques à chaque environnement.
– Les commandes pour tester les services.
– Les bonnes pratiques appliquées.
3. Fichier de logs des commits :
• Généré avec la commande :
git log --pretty=format:"%h %ad | %s%d [%an]" --date=short > logs_projet.txt
4. Rendu : Présentation écrite expliquant les choix techniques, les difficultés rencontrées, et les
solutions apportées.
• Démonstration du fonctionnement de l’application.
• Justifications techniques et gestion des problèmes rencontrés si applicable.


