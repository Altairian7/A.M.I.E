from rest_framework import serializers
from .models import AudioMemory

class AudioMemorySerializer(serializers.ModelSerializer):
    class Meta:
        model = AudioMemory
        fields = '__all__'
        read_only_fields = ['user',]