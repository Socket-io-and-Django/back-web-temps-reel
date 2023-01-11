# dev environment:
## docker-compose:
```
docker compose up -d 
```
to rebuild the container add the flag--build

## run the server:
### install packages:
````
docker compose exec node npm i
````
### run server:
````
docker compose exec node npm run serve
````
