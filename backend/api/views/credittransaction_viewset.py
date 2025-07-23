# from rest_framework import viewsets, permissions
# from api.models import CreditTransaction
# from api.serializers import CreditTransactionSerializer
# from api.permission import TokenRequired
# from django.utils.decorators import method_decorator
# from django.views.decorators.csrf import csrf_exempt

# @method_decorator(csrf_exempt, name='dispatch')
# class CreditTransactionViewSet(viewsets.ReadOnlyModelViewSet):
#     serializer_class = CreditTransactionSerializer
#     permission_classes = [TokenRequired]

#     def get_queryset(self):
#         user = self.request.user
#         if user.is_superuser:
#             return CreditTransaction.objects.all()
#         return CreditTransaction.objects.filter(user=user)