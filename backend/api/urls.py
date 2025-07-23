from rest_framework.routers import DefaultRouter
from django.urls import path, include
from api.views import UserViewSet, JobViewSet, ConnectionViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'jobs', JobViewSet, basename='job')
router.register(r'connections', ConnectionViewSet, basename='connection')

urlpatterns = [
    path('', include(router.urls)),
]