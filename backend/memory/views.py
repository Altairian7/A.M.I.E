from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Memory
from users.models import UserProfile
from django.core.files.storage import default_storage
from django.conf import settings
import os
from .FT import FaceRecognitionSystem
from users.authentication import firebase_auth_required
from django.core.files.base import ContentFile
import face_recognition
from PIL import Image
from io import BytesIO
import numpy as np
import uuid 

# Create your views here.

class RegisterFace(APIView):
    """
    API view to register a face for a user.
    """
    @firebase_auth_required
    def post(self, request):
        user = request.user
        image = request.FILES.get("image")
        person_name = request.data.get("person_name")
        
        if not image:
            return Response({"message": "No image uploaded"}, status=400)
            
        if not person_name:
            # Try to extract person name from filename if not explicitly provided
            filename = image.name
            if '.' in filename:
                person_name = filename.rsplit('.', 1)[0]  # Remove extension
            else:
                return Response({"message": "Person name is required"}, status=400)
        
        # Register the face
        memory = FaceRecognitionSystem.register_face(user, person_name, image)
        
        if not memory:
            return Response({"message": "Failed to register face"}, status=500)
            
        # Check if face encoding was successful
        if memory.face_encoding:
            return Response({
                "message": f"Face for {person_name} registered successfully",
                "person_name": person_name,
                "image_url": memory.image_path.url if memory.image_path else None
            }, status=200)
        else:
            return Response({
                "message": "Image saved but no face was detected. Please try another image.",
                "person_name": person_name,
                "image_url": memory.image_path.url if memory.image_path else None
            }, status=200)

