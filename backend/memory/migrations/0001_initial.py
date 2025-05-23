# Generated by Django 4.2.20 on 2025-05-03 05:06

from django.db import migrations, models
import django.db.models.deletion
import memory.models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Memory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('person_name', models.CharField(max_length=100)),
                ('image_path', models.ImageField(upload_to=memory.models.person_directory_path)),
                ('face_encoding', models.BinaryField(blank=True, null=True)),
                ('onboarding', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='users.userprofile')),
            ],
            options={
                'unique_together': {('user', 'person_name')},
            },
        ),
    ]
