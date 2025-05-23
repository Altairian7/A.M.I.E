from django.urls import path
from .views import AudioMemoryListCreateView, AudioMemoryDetailView, AudioMemoryExportView

urlpatterns =[
    path('memories/', AudioMemoryListCreateView.as_view(), name='audio_memory_list_create'),
    path('memories/<int:pk>/', AudioMemoryDetailView.as_view(), name='audio-memory-detail'),
    path('memories/export/', AudioMemoryExportView.as_view(), name='audio-memory-export'),
]