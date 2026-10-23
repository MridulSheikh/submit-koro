export type ChangeUserRoleInput = {
  roleKey: string;
  id: string
};

export type UserRoleResult = {
  id: string;
  name: string;
  email: string;
  role: {
    id: string;
    key: string;
    name: string;
  } | null;
};
