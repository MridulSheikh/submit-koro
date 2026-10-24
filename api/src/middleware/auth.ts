import { NextFunction, Request, Response } from "express";
import { auth as betterAuth } from "../lib/auth";
import AppError from "../errors/AppError";
import { prisma } from "../../lib/prisma";

export type OverviewPermission = "NO_ACCESS" | "VIEW";
export type ReviewPermission = "NO_ACCESS" | "VIEW" | "REVIEW";
export type SubmissionPermission = "NO_ACCESS" | "VIEW" | "SUBMIT";
export type TeamPermission = "NO_ACCESS" | "VIEW" | "MANAGE";

export type AccessRules = {
  overviewPermission?: OverviewPermission | OverviewPermission[];
  reviewPermission?: ReviewPermission | ReviewPermission[];
  submissionPermission?: SubmissionPermission | SubmissionPermission[];
  teamPermission?: TeamPermission | TeamPermission[];
};

const auth = (accessRules: AccessRules = {}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await betterAuth.api.getSession({
        headers: req.headers as any,
      });

      if (!session) {
        throw new AppError(401, "You are not authorized");
      }

      if (!session.user.emailVerified) {
        throw new AppError(
          401,
          "Email verification required. Please verify your email",
        );
      }

      const roleKey = session.user.roleKey;

      const role = roleKey
        ? await prisma.role.findUnique({
            where: { key: roleKey },
            select: {
              key: true,
              name: true,
              overviewPermission: true,
              reviewPermission: true,
              submissionPermission: true,
              teamPermission: true,
            },
          })
        : null;

      if (!role) {
        throw new AppError(403, "No valid role assigned");
      }

      const permissionChecks: [
        readonly string[],
        string | readonly string[] | undefined,
      ][] = [
        [role.overviewPermission, accessRules.overviewPermission],
        [role.reviewPermission, accessRules.reviewPermission],
        [role.submissionPermission, accessRules.submissionPermission],
        [role.teamPermission, accessRules.teamPermission],
      ];

      for (const [grantedPermissions, required] of permissionChecks) {
        const requiredPermissions = Array.isArray(required)
          ? required
          : required
            ? [required]
            : [];

        if (
          requiredPermissions.length > 0 &&
          !requiredPermissions.some((permission) =>
            grantedPermissions.includes(permission),
          )
        ) {
          throw new AppError(
            403,
            "Forbidden! You don't have permission to access this resource.",
          );
        }
      }

      req.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: role,
        emailVerified: session.user.emailVerified,
      };

      return next();
    } catch (err) {
      return next(err);
    }
  };
};

export default auth;
