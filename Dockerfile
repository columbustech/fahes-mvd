FROM node
RUN apt-get update && apt-get install -y vim nginx python3 build-essential libssl-dev libffi-dev python-dev python3-pip

COPY ./fahes/FAHES /fahes_build/

RUN mkdir /api
WORKDIR /api
COPY requirements.txt /api/
RUN pip3 install --trusted-host pypi.python.org -r requirements.txt
COPY ./api/ /api/

RUN mkdir /ui
WORKDIR /ui
COPY ./ui/package.json /ui/
COPY ./ui/package-lock.json /ui/
COPY ./ui/public/ /ui/public/
COPY ./ui/src/ /ui/src/
COPY ./ui/node_modules/ /ui/node_modules/

COPY nginx.conf /etc/nginx/
COPY frontend.conf /etc/nginx/conf.d/

COPY ./entrypoint.sh /

ENTRYPOINT ["/entrypoint.sh"]
