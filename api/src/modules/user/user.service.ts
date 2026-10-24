import { prisma } from "../../../lib/prisma";
import AppError from "../../errors/AppError";
import QueryBuilder from "../../builder/queryBuilder";
import type { ChangeUserRoleInput, UserRoleResult } from "./user.type";
import type { z } from "zod";
import type { GetAllUsersQuery, updateProfileSchema } from "./user.validation";

type UpdateProfileInput = z.infer<typeof updateProfileSchema>["body"];

type UserRoleResultWithoutRoleId = Omit<UserRoleResult, "role"> & {
  role: Omit<NonNullable<UserRoleResult["role"]>, "id"> | null;
};

export const getAllUsers = async (query: GetAllUsersQuery) => {
  const { where, orderBy, skip, take, page, limit } = new QueryBuilder(query, {
    searchableFields: ["name", "email"],
    filterableFields: ["status", "roleKey"],
    sortableFields: ["createdAt", "name", "email", "status"],
    defaultSort: { field: "createdAt", direction: "desc" },
  })
    .search()
    .filter()
    .sort()
    .paginate()
    .build();

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: [...orderBy, { id: "asc" }],
      skip,
      take,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        role: { select: { key: true, name: true } },
        _count: { select: { submissions: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total, page, limit };
};

export const changeUserRole = async (
  userId: string,
  { roleKey}: ChangeUserRoleInput,
  id: string
): Promise<UserRoleResultWithoutRoleId> => {

  // user Can't change user own role. for safty purpose
   if (id === userId) {
    throw new AppError(403, "You cannot change your own role");
  }

  // user prisma transaction for rollback
  return prisma.$transaction(async (tx) => {
    const [user, role] = await Promise.all([
      tx.user.findUnique({
        where: { id: userId },
        select: { id: true, roleKey: true, role: { select: { key: true } } },
      }),
      tx.role.findUnique({
        where: { key: roleKey },
        select: { id: true, key: true, name: true },
      }),
    ]);

    if (!user) throw new AppError(404, "User not found");
    if (!role) throw new AppError(404, "Role not found");
    if (user?.role?.key === "SUPER_ADMIN") throw new AppError(403, "You don't have permission to change this user role.")
    
    if (user.roleKey === role.id) {
      return tx.user.findUniqueOrThrow({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: { select: { id: true, key: true, name: true } },
        },
      });
    }

    if (user.role?.key === "ADMIN" && role.key !== "ADMIN") {
      const adminCount = await tx.user.count({
        where: { role: { is: { key: "ADMIN" } } },
      });
      if (adminCount <= 1)
        throw new AppError(409, "Cannot remove the last admin role");
    }

    return tx.user.update({
      where: { id: userId },
      data: { roleKey: role.key },
      select: {
        id: true,
        name: true,
        email: true,
        role: { select: { key: true, name: true } },
      },
    });
  });
};

export const changeUserStatus = async (
  userId: string,
  status: "ACTIVE" | "INACTIVE",
  actorId: string,
) => {
  if (actorId === userId) {
    throw new AppError(403, "You cannot change your own account status");
  }

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, status: true, role: { select: { key: true } } },
    });

    if (!user) throw new AppError(404, "User not found");
    if (user.role?.key === "SUPER_ADMIN") throw new AppError(403, "You cannot change this protected account's status");
    if (user.status === status) return user;

    if (status === "INACTIVE" && user.role?.key === "ADMIN") {
      const activeAdmins = await tx.user.count({
        where: { status: "ACTIVE", role: { is: { key: "ADMIN" } } },
      });
      if (activeAdmins <= 1) throw new AppError(409, "Cannot deactivate the last active admin");
    }

    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: { status },
      select: { id: true, name: true, email: true, status: true },
    });

    if (status === "INACTIVE") {
      await tx.session.deleteMany({ where: { userId } });
    }

    return updatedUser;
  });
};

export const updateProfile = async (
  userId: string,
  payload: UpdateProfileInput,
) => {
  return prisma.user.update({
    where: { id: userId },
    data: payload,
    include: {
      role: {
        select: {
          name: true,
          key: true,
          overviewPermission: true,
          reviewPermission: true,
          submissionPermission: true,
          teamPermission: true,
        },
      },
    },
  });
};
