FROM python:3

COPY ./fahes/FAHES /fahes_build/

RUN mkdir /code
WORKDIR /code
COPY requirements.txt /code/
RUN pip install --trusted-host pypi.python.org -r requirements.txt

COPY ./api/ /code/

RUN apt-get update && apt-get install -y vim nginx
COPY nginx.conf /etc/nginx/
COPY frontend.conf /etc/nginx/conf.d/
COPY ./ui/build/ /var/www/frontend/

CMD service nginx start && python manage.py migrate && python manage.py runserver 0.0.0.0:8001
