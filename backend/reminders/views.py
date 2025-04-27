from rest_framework import generics, permissions
from rest_framework.exceptions import ValidationError
from .models import Reminder, Wallpaper
from .serializers import ReminderSerializer, WallpaperSerializer
from users.models import UserProfile
import firebase_admin
from firebase_admin import auth
from rest_framework.response import Response
from users.authentication import firebase_auth_required
from rest_framework.decorators import api_view
from rest_framework import status

class ReminderListCreateView(generics.ListCreateAPIView):
    serializer_class = ReminderSerializer

    def get_queryset(self):
        # Get Firebase UID from the Authorization header
        firebase_uid = self.request.headers.get('Authorization')

        if not firebase_uid:
            raise ValidationError({'error': 'Firebase UID is required in the Authorization header'})

        # Filter reminders based on the user's Firebase UID
        try:
            user_profile = UserProfile.objects.get(firebase_uid=firebase_uid)
        except UserProfile.DoesNotExist:
            raise ValidationError({'error': f"User profile not found for UID: {firebase_uid}"})

        return Reminder.objects.filter(user=user_profile)

    def perform_create(self, serializer):
        # Get Firebase UID from the Authorization header
        firebase_uid = self.request.headers.get('Authorization')

        if not firebase_uid:
            raise ValidationError({'error': 'Firebase UID is required in the Authorization header'})

        # Fetch the user profile from Firebase UID
        try:
            user_profile = UserProfile.objects.get(firebase_uid=firebase_uid)
            serializer.save(user=user_profile)
        except UserProfile.DoesNotExist:
            raise ValidationError({'error': f"User profile not found for UID: {firebase_uid}"})



class ReminderDeleteView(generics.DestroyAPIView):
    serializer_class = ReminderSerializer

    def get_queryset(self):
        # Get Firebase UID from the Authorization header
        firebase_uid = self.request.headers.get('Authorization')
        print(firebase_uid)

        if not firebase_uid:
            raise ValidationError({'error': 'Firebase UID is required in the Authorization header'})

        try:
            user_profile = UserProfile.objects.get(firebase_uid=firebase_uid)
        except UserProfile.DoesNotExist:
            raise ValidationError({'error': f"User profile not found for UID: {firebase_uid}"})

        return Reminder.objects.filter(user=user_profile)

class GetallReminder(generics.ListAPIView):
    serializer_class = ReminderSerializer

    def get_queryset(self):
        # Get Firebase UID from the Authorization header
        firebase_uid = self.request.headers.get('Authorization')
        print(firebase_uid)

        if not firebase_uid:
            raise ValidationError({'error': 'Firebase UID is required in the Authorization header'})

        try:
            user_profile = UserProfile.objects.get(firebase_uid=firebase_uid)
        except UserProfile.DoesNotExist:
            raise ValidationError({'error': f"User profile not found for UID: {firebase_uid}"})

        return Reminder.objects.filter(user=user_profile)

@api_view(['POST'])
def upload_wallpaper(request):
    # Get Firebase UID from the Authorization header
    firebase_uid = request.headers.get('Authorization')

    if not firebase_uid:
        raise AuthenticationFailed({'detail': 'Firebase UID is required in the Authorization header'})

    # Validate user exists in the system
    try:
        user_profile = UserProfile.objects.get(firebase_uid=firebase_uid)
    except UserProfile.DoesNotExist:
        return Response({'detail': 'User not found with the provided Firebase UID'}, status=status.HTTP_404_NOT_FOUND)

    # Handle file upload
    if 'image' not in request.FILES:
        return Response({'detail': 'No image file provided.'}, status=status.HTTP_400_BAD_REQUEST)

    image = request.FILES['image']
    description = request.data.get('description', '')

    wallpaper = Wallpaper.objects.create(
        image=image,
        description=description,
        uploaded_by=user_profile
    )

    serializer = WallpaperSerializer(wallpaper)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

import random  # Needed for get_random_wallpaper
@api_view(['GET'])
def get_random_wallpaper(request):
    wallpapers = Wallpaper.objects.all()
    
    if not wallpapers:
        return Response({'detail': 'No wallpapers available'}, status=404)
    
    random_wallpaper = random.choice(wallpapers)

    return Response({
        'id': random_wallpaper.id,
        'image': random_wallpaper.image.url,
        'description': random_wallpaper.description
    }, status=200)