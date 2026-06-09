-- Create initial admin staff user
-- Password: admin123 (hashed with bcrypt - this is just for demo)
-- In production, users should change this immediately

INSERT INTO staff_users (email, password_hash, role, first_name, last_name, active)
VALUES (
  'admin@clearchoicepharmacy.com',
  '$2a$10$rY8FvZ3jVvZ7y7Z7y7y7yOKT.kV5gV5gV5gV5gV5gV5gV5gV5g',  -- This is a placeholder
  'admin',
  'Admin',
  'User',
  true
);

-- Note: In actual implementation, we'll handle password hashing in the application code
-- This is just for initial setup
