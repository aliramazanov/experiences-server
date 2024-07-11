CONTAINER_NAME="experiences-server"

docker stop $CONTAINER_NAME

docker rm $CONTAINER_NAME

docker network prune --force

docker volume prune --force

echo "Cleanup complete."
