from rest_framework import serializers
from .models import User, Job, Connection


from rest_framework import serializers
from api.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'user_id',
            'email',
            'display_name',
            'role',
            'onboarding_complete',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['user_id', 'created_at', 'updated_at']

class ConnectionSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Connection
        fields = ['id', 'user', 'user_email', 'name', 'bucket_name', 'aws_role_arn', 'region', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

class JobSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    connection_name = serializers.CharField(source='connection.name', read_only=True)

    is_failed = serializers.ReadOnlyField()
    can_retry = serializers.ReadOnlyField()
    requires_resubmission = serializers.ReadOnlyField()
    duration = serializers.ReadOnlyField()

    progress_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = [
            'id', 'user', 'user_email', 'connection', 'connection_name',
            'source_prefix', 'destination_prefix', 'status',
            's3_cleaned_result_key', 's3_audit_log_key',
            'created_at', 'updated_at', 'started_at', 'completed_at',
            'error_message', 'retry_count',
            'files_processed', 'total_files',
            'is_failed', 'can_retry', 'requires_resubmission', 'duration',
            'progress_percentage'
        ]
        read_only_fields = [
            'id', 'user', 'user_email', 'connection_name',
            's3_cleaned_result_key', 's3_audit_log_key',
            'created_at', 'updated_at', 'started_at', 'completed_at',
            'error_message', 'retry_count',
            'is_failed', 'can_retry', 'requires_resubmission', 'duration',
            'progress_percentage'
        ]

    def get_progress_percentage(self, obj):
        if obj.total_files > 0:
            return round((obj.files_processed / obj.total_files) * 100, 2)
        return 0