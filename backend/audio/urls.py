from django.urls import path
from .views import AudioMemoryListCreateView

urlpatterns =[
    path('memories/', AudioMemoryListCreateView.as_view(), name='audio_memory_list_create'),
]