from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import JSONParser

import requests, os

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
