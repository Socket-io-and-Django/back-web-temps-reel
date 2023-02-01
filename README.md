### Installation et execution
- Create file .env.local and paste those line into :
    ```
    DB_HOST=mongodb.host
    DB_USER=root.user
    DB_PASSWORD=webTempsReal.password
    DB_NAME=webTempsReal.name
    DB_PORT=27017
    ```
- Build an run docker : docker compose up -d
- Install and run for the back side : 
    1) docker exec -it node_back /bin/sh
    2) npm install && rpm run dev

    > Host : http://localhost:9000
    
- Install and run for the back side : 
    1) docker exec -it node_front /bin/sh
    2) npm install && cd fron-web-real && npm install && vue serve

    > Host : http://localhost:8080

### Fonctionnement:
- Attribuer le rôle consultant à un utilisateur inscrit :
    ```
    URL : http://localhost:9000/users/role
    BODY :
        {
            "username": "username_VALUE",
            "roles": {"Consultant": 4242}
        }
    ```
    > `username_VALUE` : Changer cette variable avec le username de l'utilisateur.
