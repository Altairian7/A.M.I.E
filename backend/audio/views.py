from django.shortcuts import get_object_or_404
from .models import AudioMemory
from .serializers import AudioMemorySerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from users.authentication import firebase_auth_required # Importing the decorator

class AudioMemoryListCreateView(APIView):

    @firebase_auth_required
    def post(self, request, *args, **kwargs):
        user = request.user  # Comes from the decorator

        serializer = AudioMemorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=user)  # Set the authenticated user
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @firebase_auth_required
    def get(self, request, *args, **kwargs):
        user = request.user
        queryset = AudioMemory.objects.filter(user=user)
        serializer = AudioMemorySerializer(queryset, many=True)
        return Response(serializer.data)
