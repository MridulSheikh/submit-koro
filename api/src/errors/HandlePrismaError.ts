import { Prisma } from "../../generated/prisma/client";
import { TGenaricErrorResponse } from "../interface/error";

const uniqueFieldNames = [
  "submissionId",
  "repositoryUrl",
  "projectName",
  "reviewerId",
  "teamId",
  "liveUrl",
  "userId",
  "email",
  "token",
  "name",
  "key",
  "id",
];

const getConstraintFields = (constraint: string): string[] => {
  const normalizedConstraint = constraint.replace(/_key$/, "");

  return uniqueFieldNames
    .map((field) => ({
      field,
      index: normalizedConstraint.search(
        new RegExp(`(?:^|[_."])${field}(?:$|[_."])`),
      ),
    }))
    .filter(({ index }) => index >= 0)
    .sort((left, right) => left.index - right.index)
    .map(({ field }) => field);
};

const getFieldsFromErrorMessage = (errorMessage: string): string[] => {
  const fieldsMatch = errorMessage.match(
    /unique constraint failed on the fields?:\s*\(([^)]+)\)/i,
  );

  if (fieldsMatch) {
    return [...fieldsMatch[1].matchAll(/[`"']([^`"']+)[`"']/g)].map(
      ([, field]) => field,
    );
  }

  const constraintMatch = errorMessage.match(
    /unique constraint failed on the constraint:\s*[`"']?([^`"'\s]+)/i,
  );

  return constraintMatch ? getConstraintFields(constraintMatch[1]) : [];
};

const handlePrismaError = (
  err: Prisma.PrismaClientKnownRequestError,
): TGenaricErrorResponse => {
  let statusCode = 500;
  let message = "Database Error";
  let errorMessage = "An unexpected database error occurred.";

  let errorDetails: Record<string, unknown> = {
    errorType: "DatabaseError",
    code: err.code,
  };

  switch (err.code) {
    case "P2002": {
      statusCode = 409;
      message = "Duplicate Entry";

      const target = err.meta?.target;
      let fields: string[] = [];

      if (Array.isArray(target)) {
        fields = target.map(String);
      } else if (typeof target === "string") {
        const targetFields = target.split(",").map((field) => field.trim());
        fields =
          targetFields.length > 1 || targetFields[0] !== target
            ? targetFields
            : getConstraintFields(target);
        if (fields.length === 0 && target.trim()) {
          fields = [target.trim()];
        }
      }

      if (fields.length === 0) {
        const adapterError = err.meta?.driverAdapterError;
        const adapterCause =
          adapterError &&
          typeof adapterError === "object" &&
          "cause" in adapterError
            ? adapterError.cause
            : undefined;
        const adapterConstraint =
          adapterCause &&
          typeof adapterCause === "object" &&
          "constraint" in adapterCause
            ? adapterCause.constraint
            : undefined;
        const constraint =
          err.meta?.constraint ?? adapterConstraint;

        if (typeof constraint === "string") {
          fields = getConstraintFields(constraint);
        }
      }

      if (fields.length === 0) {
        fields = getFieldsFromErrorMessage(err.message);
      }

      errorMessage = fields.length
        ? `Duplicate value found for: ${fields.join(", ")}.`
        : "A record with the same unique value already exists.";

      errorDetails = {
        errorType: "UniqueConstraintError",
        code: err.code,
        fields,
        reason: "Unique constraint violation",
      };

      break;
    }

    case "P2025":
      statusCode = 404;
      message = "Record Not Found";
      errorMessage = "The requested record could not be found.";

      errorDetails = {
        errorType: "RecordNotFoundError",
        code: err.code,
        reason: "The requested record does not exist.",
      };
      break;

    case "P2003":
      statusCode = 409;
      message = "Foreign Key Constraint Error";
      errorMessage =
        "The operation references a record that violates a foreign key constraint.";

      errorDetails = {
        errorType: "ForeignKeyConstraintError",
        code: err.code,
        field: err.meta?.field_name ?? "Unknown field",
        reason: "Foreign key constraint violation",
      };
      break;

    default:
      errorDetails = {
        errorType: "DatabaseError",
        code: err.code,
        reason: "Unhandled Prisma error",
      };
      break;
  }

  return {
    statusCode,
    message,
    errorMessage,
    errorDetails,
  };
};

export default handlePrismaError;
