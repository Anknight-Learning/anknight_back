#!/bin/bash

if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

VERSION=$(jq -r .version package.json)

IMAGE_NAME_VERSION=ghcr.io/anknight-learning/anknight_back/anknight-words-api:$VERSION
IMAGE_NAME_LATEST=ghcr.io/anknight-learning/anknight_back/anknight-words-api:latest

docker login --username $GHCR_USER --password $GHCR_PASS ghcr.io

docker build . -f Dockerfile -t $IMAGE_NAME_VERSION -t $IMAGE_NAME_LATEST

docker push $IMAGE_NAME_VERSION
docker push $IMAGE_NAME_LATEST