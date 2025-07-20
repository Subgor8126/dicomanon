from rest_framework import serializers
from .models import User, Job, Connection, CreditTransaction


class UserSerializer(serializers.ModelSerializer):
    """One serializer for all User operations."""
    
    class Meta:
        model = User
        fields = '__all__'
        read_only_fields = ['user_id', 'created_at', 'updated_at', 'stripe_customer_id']


class ConnectionSerializer(serializers.ModelSerializer):
    """One serializer for all Connection operations."""
    
    # Include user email for context, but don't allow editing
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = Connection
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'user']


class JobSerializer(serializers.ModelSerializer):
    """Main Job serializer with all computed properties."""
    
    # Include computed properties
    is_failed = serializers.ReadOnlyField()
    can_retry = serializers.ReadOnlyField()
    requires_resubmission = serializers.ReadOnlyField()
    duration = serializers.ReadOnlyField()
    
    # Include related object info
    user_email = serializers.CharField(source='user.email', read_only=True)
    connection_name = serializers.CharField(source='connection.name', read_only=True)
    
    # Calculate progress
    progress_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = Job
        fields = '__all__'
        read_only_fields = [
            'id', 'user', 'source_artifact_id', 'destination_artifact_id',
            'created_at', 'updated_at', 'credits_charged'
        ]
    
    def get_progress_percentage(self, obj):
        if obj.total_files > 0:
            return round((obj.files_processed / obj.total_files) * 100, 2)
        return 0


class CreditTransactionSerializer(serializers.ModelSerializer):
    """One serializer for all CreditTransaction operations."""
    
    user_email = serializers.CharField(source='user.email', read_only=True)
    job_id = serializers.CharField(source='job.id', read_only=True)
    
    class Meta:
        model = CreditTransaction
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at']