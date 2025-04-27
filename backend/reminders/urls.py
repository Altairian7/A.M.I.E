from django.urls import path
from .views import GetallReminder, ReminderListCreateView, ReminderDeleteView, upload_wallpaper, get_random_wallpaper

urlpatterns = [
    path('create/', ReminderListCreateView.as_view(), name='reminder-list-create'),
    path('reminder/<int:pk>/', ReminderDeleteView.as_view(), name='reminder-delete'),
    path('getall/', GetallReminder.as_view(), name='get-all-reminders'),
   
    # Wallpaper upload endpoint
    path('upload_wallpaper/', upload_wallpaper, name='upload_wallpaper'),
    path('random_wallpaper/', get_random_wallpaper, name='random_wallpaper'),
]