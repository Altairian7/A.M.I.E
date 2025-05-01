from django.shortcuts import get_object_or_404
from .models import AudioMemory
from .serializers import AudioMemorySerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from users.authentication import firebase_auth_required
from .audio_processing import transcribe_audio, analyze_phrase
import os
import logging
import time
import threading

# Set up logging
logger = logging.getLogger(__name__)

def process_audio_in_background(audio_memory_id):
    """
    Process audio file in background thread
    """
    from .models import AudioMemory  # Import here to avoid circular imports
    
    try:
        # Get the audio memory object
        audio_memory = AudioMemory.objects.get(id=audio_memory_id)
        
        print("\n" + "="*50)
        print(f"🎵 STARTING BACKGROUND PROCESSING FOR AUDIO #{audio_memory_id} 🎵")
        print("="*50)
        
        # File path info
        audio_path = audio_memory.audio_file.path
        print(f"📁 Audio file path: {audio_path}")
        
        # Transcription begins
        print("\n" + "-"*40)
        print("🎤 STARTING TRANSCRIPTION PROCESS...")
        print("-"*40)
        start_time = time.time()
        
        text = transcribe_audio(audio_path)
        
        transcription_time = time.time() - start_time
        print(f"⏱️ Transcription completed in {transcription_time:.2f} seconds")
        print(f"📝 Transcription result:\n{text}")
        
        # Store the transcription
        audio_memory.transcription = text
        print("💾 Transcription saved to model")
        
        # Sentiment analysis begins
        print("\n" + "-"*40)
        print("😀 STARTING SENTIMENT ANALYSIS...")
        print("-"*40)
        start_time = time.time()
        
        score = analyze_phrase(text)
        
        sentiment_time = time.time() - start_time
        print(f"⏱️ Sentiment analysis completed in {sentiment_time:.2f} seconds")
        print(f"📊 Sentiment score: {score}")
        
        # Store score
        audio_memory.score = round(score, 4)
        
        # Update processing status
        audio_memory.processing_complete = True
        
        # Save changes
        print("💾 Saving final data to database...")
        audio_memory.save()
        
        print("\n" + "="*50)
        print(f"✅ AUDIO #{audio_memory_id} PROCESSED SUCCESSFULLY ✅")
        print("="*50 + "\n")
        
    except Exception as e:
        print(f"❌ ERROR PROCESSING AUDIO #{audio_memory_id}: {str(e)}")
        print(f"❌ Error type: {type(e).__name__}")
        import traceback
        print(f"❌ Traceback: {traceback.format_exc()}")
        
        # Try to update the status in the database
        try:
            audio_memory = AudioMemory.objects.get(id=audio_memory_id)
            audio_memory.processing_error = str(e)
            audio_memory.save()
        except:
            print("❌ Could not update error status in database")


class AudioMemoryListCreateView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    # @firebase_auth_required  # Uncomment when ready for production
    def post(self, request, *args, **kwargs):
        # Clear visual separators in console for easy tracking
        print("\n" + "="*50)
        print("🎵 RECEIVING AUDIO MEMORY REQUEST 🎵")
        print("="*50)
        
        # Debug information
        print(f"📝 Request received at: {time.strftime('%H:%M:%S')}")
        print(f"📝 Content-Type: {request.headers.get('Content-Type')}")
        
        # For testing only - remove in production
        from django.contrib.auth.models import User
        user = User.objects.first()  # Get any user for testing
        request.user = user
        
        # Real implementation
        # user = request.user
        print(f"👤 Processing for user: {user}")
        
        if 'audio_file' not in request.FILES:
            print("❌ ERROR: No audio_file in request")
            return Response({"error": "No audio file provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        print("🔍 Validating request data...")
        serializer = AudioMemorySerializer(data=request.data)
        if serializer.is_valid():
            print("✅ Serializer is valid")
            print("💾 Saving audio file to database...")
            
            # Set initial processing status
            audio_memory = serializer.save(user=user, processing_complete=False)
            
            # Start background processing
            print(f"🚀 Starting background processing for audio #{audio_memory.id}")
            processing_thread = threading.Thread(
                target=process_audio_in_background,
                args=(audio_memory.id,)
            )
            processing_thread.daemon = True
            processing_thread.start()
            
            # Return immediately with the created object
            print(f"✅ Audio file accepted, processing in background")
            return Response({
                "id": audio_memory.id,
                "message": "Audio file accepted and processing has started",
                "status": "processing"
            }, status=status.HTTP_202_ACCEPTED)
            
        else:
            print(f"❌ Serializer errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @firebase_auth_required
    def get(self, request, *args, **kwargs):
        user = request.user
        queryset = AudioMemory.objects.filter(user=user)
        serializer = AudioMemorySerializer(queryset, many=True)
        return Response(serializer.data)