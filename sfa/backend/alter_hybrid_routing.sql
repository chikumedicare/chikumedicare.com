ALTER TABLE users ADD COLUMN reports_to_ids TEXT;
ALTER TABLE approvals ADD COLUMN assigned_manager_ids TEXT;
ALTER TABLE approvals ADD COLUMN requester_role TEXT;
ALTER TABLE approvals ADD COLUMN requester_hq_id TEXT;
