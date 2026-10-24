export type TeamRole = {
  id: string;
  key: string;
  name: string;
  overviewPermission: string[];
  reviewPermission: string[];
  submissionPermission: string[];
  teamPermission: string[];
  _count?: { users: number };
};

export type TeamUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  status: string | null;
  emailVerified: boolean;
  createdAt: string;
  role: { key: string; name: string } | null;
  _count: { submissions: number };
};
