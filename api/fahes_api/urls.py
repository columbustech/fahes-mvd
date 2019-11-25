from django.urls import path
from . import views

urlpatterns = [
    path('upload/', views.Upload.as_view()),
    path('client-id/', views.ClientId.as_view()),
    path('authentication-token/', views.AuthenticationToken.as_view()),
]
