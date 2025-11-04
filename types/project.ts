export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_default: boolean;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  color?: string;
  is_default?: boolean;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  color?: string;
  is_default?: boolean;
}
