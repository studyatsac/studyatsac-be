#!/bin/bash

atlas schema inspect --config file://database/atlas.hcl --env sequelize --url env://src -w
