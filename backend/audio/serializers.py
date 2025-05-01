from rest_framework import serializers
from .models import AudioMemory

class AudioMemorySerializer(serializers.ModelSerializer):
    class Meta:
        model = AudioMemory
        fields = [
            'id', 'user', 'audio_file', 'timestamp', 'transcription', 'score', 
            'sentiment_label', 'memory_references', 'routine_references',
            'time_indicators', 'location_indicators', 'severity_indicators',
            'potential_concerns', 'processing_complete', 'processing_error'
        ]
        read_only_fields = [
            'id', 'timestamp', 'transcription', 'score', 
            'sentiment_label', 'memory_references', 'routine_references',
            'time_indicators', 'location_indicators', 'severity_indicators',
            'potential_concerns', 'processing_complete', 'processing_error',
            'user'
        ]
