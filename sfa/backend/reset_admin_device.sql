UPDATE users 
SET device_id = NULL, 
    device_name = NULL, 
    device_model = NULL, 
    os_version = NULL, 
    app_version = NULL 
WHERE role = 'ADMIN' OR role = 'OWNER';
