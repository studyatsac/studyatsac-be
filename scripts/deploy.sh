#!/bin/bash

if [ -z "$1" ]; then
  echo "Please specify the target deployment option, either:"
  echo -e "\t--production"
  echo -e "\t--development"

  exit 1
fi

environment_file=".env.deployment"

if [ -f "$environment_file" ]; then
  export $(grep -v '^#' $environment_file | xargs)
else
  echo "Please provide $environment_file file"
  
  exit 1
fi

target_port=""

if ! [ "$TARGET_PORT" = "" ]; then
  target_port="ssh -p $TARGET_PORT"
fi

if [ "$TARGET_HOST" = "" ]; then
  echo "Please provide TARGET_HOST variable"
  
  exit 1
fi

if [ "$TARGET_USER" = "" ]; then
  echo "Please provide TARGET_USER variable"
  
  exit 1
fi

target_path=""
target_path_name="" 

case "$1" in
    --production)
        target_path_name="TARGET_PRODUCTION_PATH"
        target_path="$TARGET_PRODUCTION_PATH"
        ;;
    --development)
        target_path_name="TARGET_DEVELOPMENT_PATH"
        target_path="$TARGET_DEVELOPMENT_PATH"
        ;;
esac

if [ "$target_path" = "" ]; then
  echo "Please provide $target_path_name variable"
  
  exit 1
fi

target_copy="$TARGET_USER@$TARGET_HOST:$target_path"

echo "The app will be deployed to $target_copy"

if [ "$target_port" = "" ]; then
    rsync -avz --delete package.json package-lock.json index.js ecosystem.config.js .eslintrc .env.example src "$target_copy"
else
    rsync -avz -e "$target_port" --delete package.json package-lock.json index.js ecosystem.config.js .eslintrc .env.example src "$target_copy"
fi
