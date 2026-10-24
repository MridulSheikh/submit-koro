import { serverApiFetch } from "@/lib/server-api";
import { redirect } from "next/navigation";
import { connection } from "next/server";

type AuthSession = {
  user: {
    emailVerified: boolean;
  };
};

export class AuthServiceUnavailableError extends Error {
  constructor() {
    super("The authentication service is unavailable.");
    this.name = "AuthServiceUnavailableError";
  }
}

export type PermissionLevel = string[];
export type DashboardUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: {
    key: string;
    name: string;
    overviewPermission: PermissionLevel;
    reviewPermission: PermissionLevel;
    submissionPermission: PermissionLevel;
    teamPermission: PermissionLevel;
  } | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function getServerAuthSession(): Promise<AuthSession | null> {
  let response: Response;

  try {
    await connection();
    response = await serverApiFetch("/auth/get-session");
  } catch (error) {
    if (error instanceof TypeError) {
      throw new AuthServiceUnavailableError();
    }
    throw error;
  }

  if (response.status === 401) return null;
  if (!response.ok) {
    throw new Error(
      `Unable to verify the authentication session (HTTP ${response.status}).`,
    );
  }

  const result: unknown = await response.json();
  if (result === null) return null;

  if (
    !isRecord(result) ||
    !isRecord(result.session) ||
    !isRecord(result.user) ||
    typeof result.user.emailVerified !== "boolean"
  ) {
    throw new Error("The authentication API returned an invalid session.");
  }

  return { user: { emailVerified: result.user.emailVerified } };
}

export async function getServerDashboardUser(): Promise<DashboardUser | null> {
  let response: Response;
  try {
    response = await serverApiFetch("/users/me");
  } catch (error) {
    if (error instanceof TypeError) throw new AuthServiceUnavailableError();
    throw error;
  }
  if (response.status === 401) return null;
  if (!response.ok) {
    throw new Error(`Unable to load the current user (HTTP ${response.status}).`);
  }

  const result: unknown = await response.json();
  if (!isRecord(result) || !isRecord(result.data)) {
    throw new Error("The authentication API returned an invalid user.");
  }

  const user = result.data;
  if (user.role === null) {
    return {
      id: String(user.id ?? ""),
      name: String(user.name ?? ""),
      email: String(user.email ?? ""),
      image: typeof user.image === "string" ? user.image : null,
      role: null,
    };
  }
  if (!isRecord(user.role)) {
    throw new Error("The authentication API returned an invalid user.");
  }
  const role = user.role;
  const permissions = [
    role.overviewPermission,
    role.reviewPermission,
    role.submissionPermission,
    role.teamPermission,
  ];
  if (
    typeof user.id !== "string" ||
    typeof user.name !== "string" ||
    typeof user.email !== "string" ||
    typeof role.key !== "string" ||
    typeof role.name !== "string" ||
    !permissions.every((items) => Array.isArray(items) && items.every((item) => typeof item === "string"))
  ) {
    throw new Error("The authentication API returned an invalid user.");
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: typeof user.image === "string" ? user.image : null,
    role: {
      key: role.key,
      name: role.name,
      overviewPermission: role.overviewPermission as string[],
      reviewPermission: role.reviewPermission as string[],
      submissionPermission: role.submissionPermission as string[],
      teamPermission: role.teamPermission as string[],
    },
  };
}

export async function requireDashboardUser(
  permission?: "overview" | "review" | "submission" | "team",
  value?: string,
) {
  const session = await getServerAuthSession();
  if (!session?.user.emailVerified) redirect("/login");

  const user = await getServerDashboardUser();
  if (!user) redirect("/login");
  if (permission && value) {
    const granted = user.role?.[`${permission}Permission`];
    if (!granted?.includes(value)) {
      redirect(user.role?.key === "STUDENT" ? "/submission" : "/forbidden");
    }
  }
  return user;
}
