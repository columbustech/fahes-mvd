#!/bin/bash
(cd /ui && npm install)
(cd /ui && npm run build)
mkdir /var/www/frontend
cp -r /ui/build/* /var/www/frontend
service nginx start
python3 /api/manage.py makemigrations
python3 /api/manage.py runserver 0.0.0.0:8001
