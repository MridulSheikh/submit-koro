import { prisma } from "../../../lib/prisma";
import AppError from "../../errors/AppError";
import type { z } from "zod";
import type {
  createRoleSchema,
  updateRoleSchema,
} from "./role.validation";

type CreateRoleInput = z.infer<typeof createRoleSchema>["body"];
type UpdateRoleInput = z.infer<typeof updateRoleSchema>["body"];

const protectedRoleKeys = new Set(["SUPER_ADMIN", "STUDENT"]);

const getRoles = async () => {
  return prisma.role.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { users: true } } },
  });
};

const getRoleById = async (id: string) => {
  if (!id) throw new AppError(400, "Please provide a role id");

  const role = await prisma.role.findUnique({
    where: { id },
    include: { _count: { select: { users: true } } },
  });
  if (!role) throw new AppError(404, "Role not found");

  return role;
};

const createRole = async (payload: CreateRoleInput) => {
  if (protectedRoleKeys.has(payload.key)) {
    throw new AppError(409, `The ${payload.key} role key is reserved`);
  }

  return prisma.role.create({ data: payload });
};

const updateRole = async (id: string, payload: UpdateRoleInput) => {
  console.log(payload)
  const role = await getRoleById(id);
  if (protectedRoleKeys.has(role.key)) {
    throw new AppError(403, "System roles cannot be modified");
  }
  if (payload.key && protectedRoleKeys.has(payload.key)) {
    throw new AppError(409, `The ${payload.key} role key is reserved`);
  }

  return prisma.role.update({
    where: { id },
    data: payload,
  });
};

const deleteRole = async (id: string) => {
  const role = await getRoleById(id);
  if (protectedRoleKeys.has(role.key)) {
    throw new AppError(403, "System roles cannot be deleted");
  }
  if (role._count.users > 0) {
    throw new AppError(409, "Cannot delete a role that is assigned to users");
  }

  return prisma.role.delete({ where: { id } });
};

const roleService = {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
};

export default roleService;
