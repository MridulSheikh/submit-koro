import { prisma } from "../../../lib/prisma";
import { deleteCachedValue } from "../../../lib/redis";
import AppError from "../../errors/AppError";
import QueryBuilder from "../../builder/queryBuilder";
import type { CreateSubmissionInput, UpdateSubmissionInput } from "./submission.type";
import type { GetAllSubmissionsQuery } from "./submission.validation";


const createSubmissionService = async (payload: CreateSubmissionInput, userId: string) => {
  const result = await prisma.submission.create({
    data: {
      projectName: payload.projectName,
      description: payload.description,
      liveUrl: payload.liveUrl,
      repositoryUrl: payload.repositoryUrl,
      userId: userId
    },
  });

  await deleteCachedValue("overview:v1");
  return result;
};

// Get all Submission from db

const getAllSubmissionService = async (query: GetAllSubmissionsQuery) => {
  const { where, orderBy, skip, take } = new QueryBuilder(query, {
    searchableFields: ["projectName", "description", "liveUrl", "repositoryUrl"],
    filterableFields: ["status"],
    sortableFields: ["createdAt", "projectName", "status"],
    defaultSort: { field: "createdAt", direction: "desc" },
  })
    .search()
    .filter()
    .sort()
    .paginate()
    .build();

  const [submissions, total] = await Promise.all([
    prisma.submission.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        reviews: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: {
              select: {
                id: true,
                key: true,
                name: true,
              },
            },
          },
        },
      },
    }),
    prisma.submission.count({ where }),
  ]);

  return { submissions, total };
};

// get single submission

const getSingleSubmissionService = async (id: string) => {
  
  // check if id not undefiend
  if(!id){
    throw new AppError(500, "Please provide a id")
  }

  const submission = await prisma.submission.findUnique({
    where: { id },
  });

  if (!submission) {
    throw new AppError(404, "Submission not found");
  }

  return submission;
};

// update submission
const updateSubmissionService = async (
  id: string,
  payload: UpdateSubmissionInput,
) => {
  if (!id) {
    throw new AppError(400, "Please provide an id");
  }

  await getSingleSubmissionService(id);

  const result = await prisma.submission.update({
    where: { id },
    data: payload,
  });
  await deleteCachedValue("overview:v1");
  return result;
};

const deleteSubmissionService = async (id: string, userId: string) => {
  if (!id) {
    throw new AppError(400, "Please provide an id");
  }

  const submission = await prisma.submission.findUnique({
    where: { id },
    select: { id: true, userId: true },
  });

  if (!submission) {
    throw new AppError(404, "Submission not found");
  }
  if (submission.userId !== userId) {
    throw new AppError(403, "You can only delete your own submissions");
  }

  const result = await prisma.submission.delete({ where: { id } });
  await deleteCachedValue("overview:v1");
  return result;
};

// get submission by user id 

const getSubmissionByUserId = async (
  id: string,
  query: GetAllSubmissionsQuery,
) => {
  const { where: queryWhere, orderBy, skip, take } = new QueryBuilder(query, {
    searchableFields: ["projectName", "description", "liveUrl", "repositoryUrl"],
    filterableFields: ["status"],
    sortableFields: ["createdAt", "projectName", "status"],
    defaultSort: { field: "createdAt", direction: "desc" },
  })
    .search()
    .filter()
    .sort()
    .paginate()
    .build();
  const where = { ...queryWhere, userId: id };

  const [submissions, total] = await Promise.all([
    prisma.submission.findMany({ where, orderBy, skip, take }),
    prisma.submission.count({ where }),
  ]);

  return { submissions, total };
}

 const submissionServices = {
    createSubmissionService,
    getAllSubmissionService,
    getSingleSubmissionService,
    updateSubmissionService,
    deleteSubmissionService,
    getSubmissionByUserId
}

export default submissionServices;