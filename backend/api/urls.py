from rest_framework.routers import DefaultRouter
from django.urls import path, include
from api.views import UserViewSet, JobViewSet, CreditTransactionViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'jobs', JobViewSet, basename='job')
router.register(r'credit-transactions', CreditTransactionViewSet, basename='credittransaction')

urlpatterns = [
    path('', include(router.urls)),
]