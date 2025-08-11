#!/bin/bash

# Backend parameters
aws ssm put-parameter --name "/dicomanon/backend/DICOM_DE_ID_RDS_TABLE_NAME" --value "dicom-de-id-db" --type "String" --overwrite
aws ssm put-parameter --name "/dicomanon/backend/DICOM_DE_ID_RDS_TABLE_PASSWORD" --value "DICOMDeIdRDS" --type "SecureString" --overwrite
aws ssm put-parameter --name "/dicomanon/backend/DICOM_DE_ID_RDS_TABLE_USER" --value "postgres" --type "String" --overwrite
aws ssm put-parameter --name "/dicomanon/backend/DICOM_DE_ID_RDS_TABLE_HOST" --value "dicom-de-id-db.cdg2gsc0kilw.us-east-1.rds.amazonaws.com" --type "String" --overwrite
aws ssm put-parameter --name "/dicomanon/backend/DICOM_DE_ID_RDS_TABLE_PORT" --value "5432" --type "String" --overwrite
aws ssm put-parameter --name "/dicomanon/backend/COGNITO_REGION" --value "us-east-1" --type "String" --overwrite
aws ssm put-parameter --name "/dicomanon/backend/COGNITO_USER_POOL_ID" --value "us-east-1_ezWXR2qaX" --type "String" --overwrite
aws ssm put-parameter --name "/dicomanon/backend/COGNITO_APP_CLIENT_ID" --value "52jkhrsfstosrmf61obf4pthbj" --type "String" --overwrite
aws ssm put-parameter --name "/dicomanon/backend/AWS_ACCOUNT_ID" --value "975050380826" --type "String" --overwrite
aws ssm put-parameter --name "/dicomanon/backend/SQS_QUEUE_NAME" --value "dicom-processing-pipeline" --type "String" --overwrite

# Frontend parameters
aws ssm put-parameter --name "/dicomanon/frontend/NEXT_PUBLIC_API_URL" --value "http://dicomanon.yantrahealth.in/api" --type "String" --overwrite
aws ssm put-parameter --name "/dicomanon/frontend/NEXT_PUBLIC_AWS_REGION" --value "us-east-1" --type "String" --overwrite
aws ssm put-parameter --name "/dicomanon/frontend/NEXT_PUBLIC_COGNITO_USERPOOL_ID" --value "us-east-1_ezWXR2qaX" --type "String" --overwrite
aws ssm put-parameter --name "/dicomanon/frontend/NEXT_PUBLIC_COGNITO_APP_CLIENT_ID" --value "52jkhrsfstosrmf61obf4pthbj" --type "String" --overwrite
aws ssm put-parameter --name "/dicomanon/frontend/NEXT_PUBLIC_COGNITO_DOMAIN" --value "https://us-east-1ezwxr2qax.auth.us-east-1.amazoncognito.com" --type "String" --overwrite
aws ssm put-parameter --name "/dicomanon/frontend/NEXT_PUBLIC_COGNITO_REDIRECT_SIGNIN" --value "http://dicomanon.yantrahealth.in/redirect" --type "String" --overwrite
aws ssm put-parameter --name "/dicomanon/frontend/NEXT_PUBLIC_COGNITO_REDIRECT_SIGNOUT" --value "http://dicomanon.yantrahealth.in/" --type "String" --overwrite
aws ssm put-parameter --name "/dicomanon/frontend/NEXT_PUBLIC_COGNITO_AUTHORITY" --value "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_ezWXR2qaX" --type "String" --overwrite