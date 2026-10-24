import { prisma } from "../../../lib/prisma";
import AppError from "../../errors/AppError";
import type { ChangeUserRoleInput, UserRoleResult } from "./user.type";
import type { z } from "zod";
import type { updateProfileSchema } from "./user.validation";

type UpdateProfileInput = z.infer<typeof updateProfileSchema>["body"];

type UserRoleResultWithoutRoleId = Omit<UserRoleResult, "role"> & {
  role: Omit<NonNullable<UserRoleResult["role"]>, "id"> | null;
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
