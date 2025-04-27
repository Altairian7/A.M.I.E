from django.db import models
from users.models import UserProfile

# Create your models here.

class AudioMemory(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='audio_memories')
    title = models.CharField(max_length=255,default='Audio Memory')
    created_at = models.DateTimeField(auto_now_add=True)
    audio_file = models.FileField(upload_to='audio_files/')
    score = models.FloatField(default=0.0)