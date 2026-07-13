CREATE TABLE public_enrollments (id uuid PRIMARY KEY DEFAULT concourse.uuid_generate_v7(), event_exhibitor_id uuid NOT NULL REFERENCES event_exhibitors(id) ON DELETE CASCADE, email text NOT NULL, status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed')), created_at timestamptz NOT NULL DEFAULT now(), completed_at timestamptz);
CREATE UNIQUE INDEX public_enrollments_pending_key ON public_enrollments(event_exhibitor_id, email) WHERE status = 'pending';
GRANT ALL PRIVILEGES ON public_enrollments TO app_platform;
