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

class IdentifyFaces(APIView):
    """ API view to identify faces in an image. """

    @firebase_auth_required
    def post(self, request):
        usesr = request.user
        image = request.FILES.get("image")

        if not image:
            return Respionse({"message": "No image uploaded"}, status=400)

        
        # Save the image file temporarily
        temp_filename = f"{uuid.uuid4().hex}.jpg"
        temp_path = os.path.join(settings.MEDIA_ROOT, "temp", temp_filename)

        # Ensuirng that the temp directory exists
        os.makedirs(os.path.dirname(temp_path), exist_ok=True)

        # Saving the image or file
        with open(temp_path, "wb") as f:
            for chunk in image.chunks():
                f.write(chunk)
        
        # Now loading the image using face_recognition

        try:
            #Identify the faces in the image
            results = FaceRecognitionSystem.identify_faces(user, temp_path)

            if not results:
                return Response({"message": "No known faces in the view"}, status=200)

            # Preparing the response data
            identified_people = []
            for result in results:
                identified_people.append({
                    "person_name": result["person_name"],
                    "confidence": f"{result['confidence']:.2f}%"
                })
                
            return Response({
                "message": "Face identification completed",
                "identified_people": identified_people
            }, status=200)
        
        except Exception as e:
            return Response({"message": f"Error processing image: {str(e)}"}, status=500)
        finally:
            # Clean up the temporary file
            if os.path.exists(temp_path):
                os.remove(temp_path)

class ListRegisteredFaces(APIView):
    """API endpoint to list all faces registered by the user"""
    
    @firebase_auth_required
    def get(self, request):
        user = request.user
        
        # Get all memory objects for this user
        memories = Memory.objects.filter(user=user)
        
        if not memories:
            return Response({"message": "No faces registered yet"}, status=200)
            
        # Format the response
        registered_faces = []
        for memory in memories:
            registered_faces.append({
                "person_name": memory.person_name,
                "image_url": memory.image_path.url if memory.image_path else None,
                "created_at": memory.created_at.strftime('%Y-%m-%d %H:%M')
            })
            
        return Response({
            "message": f"Found {len(registered_faces)} registered faces",
            "registered_faces": registered_faces
        }, status=200)

class DeleteFace(APIView):
    """API endpoint to delete a registered face"""
    
    @firebase_auth_required
    def delete(self, request, person_name):
        user = request.user
        
        try:
            # Get the memory object
            memory = Memory.objects.get(user=user, person_name=person_name)
            
            # Delete the image file
            if memory.image_path:
                if os.path.exists(memory.image_path.path):
                    os.remove(memory.image_path.path)
                    
                # Try to remove the directory if it's empty
                dir_path = os.path.dirname(memory.image_path.path)
                if os.path.exists(dir_path) and not os.listdir(dir_path):
                    os.rmdir(dir_path)
            
            # Delete the memory object
            memory.delete()
            
            return Response({
                "message": f"Face for {person_name} deleted successfully"
            }, status=200)
            
        except Memory.DoesNotExist:
            return Response({
                "message": f"No face registered for {person_name}"
            }, status=404)
        except Exception as e:
            return Response({
                "message": f"Error deleting face: {str(e)}"
            }, status=500)

class BulkRegisterFaces(APIView):
    """API endpoint to register multiple faces at once"""
    
    @firebase_auth_required
    def post(self, request):
        user = request.user
        files = request.FILES
        
        if not files:
            return Response({"message": "No images uploaded"}, status=400)
        
        results = []
        
        for key, image_file in files.items():
            # Extract person name from filename
            filename = image_file.name
            if '.' in filename:
                person_name = filename.rsplit('.', 1)[0]  # Remove extension
            else:
                person_name = filename
                
            # Register the face
            memory = FaceRecognitionSystem.register_face(user, person_name, image_file)
            
            if memory:
                result = {
                    "person_name": person_name,
                    "status": "success" if memory.face_encoding else "no_face_detected",
                    "image_url": memory.image_path.url if memory.image_path else None
                }
            else:
                result = {
                    "person_name": person_name,
                    "status": "failed",
                    "message": "Failed to register face"
                }
                
            results.append(result)
        
        return Response({
            "message": f"Processed {len(results)} images",
            "results": results
        }, status=200)