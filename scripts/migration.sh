#!/bin/bash

if [ -z "$1" ]; then
  echo "Please specify the command, either:"
  echo -e "\tgenerate"
  echo -e "\tstatus"
  echo -e "\tapply"
  echo -e "\thash"
  echo -e "\tother"

  exit 1
fi

command=""
another_command=""

case "$1" in
    generate)
        command="diff"
        ;;
    status)
        command="status"
        ;;
    apply)
        command="apply"
        ;;
    hash)
        command="hash"
        ;;
    other)
        shift
        another_command="$@"
        ;;
esac

if [ "$command" = "" ] && [ "$another_command" = "" ]; then
    echo "Invalid command!"

    exit 1
fi

export $(grep -v '^#' .env | xargs) && atlas migrate $command $another_command --config file://database/atlas.hcl --env sequelize
