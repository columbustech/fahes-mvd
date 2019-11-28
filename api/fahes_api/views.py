from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import JSONParser

import requests, os, subprocess, csv

# Create your views here.
class Upload(APIView):
    parser_class = (JSONParser,)

    @csrf_exempt
    def post(self, request):
        url = request.data['url']
        name = request.data['name']

        response = requests.get(url)

        with open('/storage/' + name, 'wb') as f:
            f.write(response.content)
        
        return Response(status=status.HTTP_201_CREATED)

class Execute(APIView):
    parser_class = (JSONParser,)

    @csrf_exempt
    def post(self, request):
        name = request.data['name']

        fahes_path = '/storage/' + name
        output_path = '/storage/results/'
        if not os.path.exists('/storage/results'):
            os.mkdir('/storage/results')

        subprocess.call(['/fahes_build/FAHES', fahes_path, output_path, '4'])

        return Response(status=status.HTTP_200_OK)

class Results(APIView):
    parser_class = (JSONParser,)

    def get(self, request):
        name = "DMV_" + request.query_params['name']
        path = '/storage/results/' + name

        data = []
        with open(path) as csvfile:
            csvReader = csv.DictReader(csvfile)
            for row in csvReader:
                data.append(row)
        return Response(data, status=status.HTTP_200_OK)

class Save(APIView):
    parser_class = (JSONParser,)

    @csrf_exempt
    def post(self, request, format=None):
        access_token = request.data['access_token']
        name = "DMV_" + request.data['name']
        path = request.data['path']

        container_path = '/storage/results/' + name
        with open(container_path, 'rb') as f:
            file_arg = {'file': (name, f), 'path': (None, path)}
            response = requests.post('https://api.cdrive.columbusecosystem.com/upload/', files=file_arg, headers={'Authorization':'Bearer ' + access_token})

        return Response(status=status.HTTP_200_OK)

class ClientId(APIView):
    parser_class = (JSONParser,)

    def get(self, request):
        client_id = os.environ['COLUMBUS_CLIENT_ID']
        return Response({"client_id": client_id})

class AuthenticationToken(APIView):
    parser_class = (JSONParser,)

    @csrf_exempt
    def post(self, request, format=None):
        code = request.data['code']
        redirect_uri = request.data['redirect_uri']
        data = {
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': redirect_uri,
            'client_id': os.environ['COLUMBUS_CLIENT_ID'],
            'client_secret': os.environ['COLUMBUS_CLIENT_SECRET']
        }
        response = requests.post(url=os.environ['AUTHENTICATION_URL'] + 'o/token/', data=data)

        return Response(response.json(), status=response.status_code)
