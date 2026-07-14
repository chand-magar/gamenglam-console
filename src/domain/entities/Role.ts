export interface RolePagePermission {
  page_id:    string;
  page_name:  string;
  page_path:  string;
  page_order: number;
  methods:    string[];
}

export interface RoleSectionPermission {
  section_id:    string;
  section_name:  string;
  section_path:  string;
  section_icon:  string;
  section_order: number;
  pages:         RolePagePermission[];
}

export interface Role {
  role_no:      number;
  role_id:      string;
  role_name:    string;
  role_details: RoleSectionPermission[];
  status:       'A' | 'I' | 'D';
  created_at:   string;
  created_by:   number | null;
  updated_at:   string;
  updated_by:   number | null;
}