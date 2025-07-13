#!/bin/bash

if [ -z "$1" ]; then
    echo "Please provide the remote destination"
    exit 1
fi

rsync -avz package.json package-lock.json index.js ecosystem.config.js .eslintrc .env.example src $1
