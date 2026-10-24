import { prisma } from "../../../lib/prisma";
import AppError from "../../errors/AppError";
import { TReview, TUpdateReview } from "./review.type";

// create review
const createReviewService = async (payload: TReview, userId: string) => {
  if (userId != payload.reviewerId) {
    throw new AppError(401, "You are not authorized");
  }

  const existingReview = await prisma.review.findFirst({
    where: { submissionId: payload.submissionId, reviewerId: userId },
    select: { id: true },
  });
  if (existingReview) {
    throw new AppError(409, "You have already reviewed this submission");
  }

  const { submission, reviewer, ...reviewData } = payload;

  return prisma.review.create({
    data: reviewData,
    include: {
      reviewer: {
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
  });
};

// get submission my submission
const getReviewBySubmissionIdService = async (id: string) => {
  if (!id) {
    throw new AppError(500, "Please provide a submission id");
  }

  const res = await prisma.review.findMany({
    where: { submissionId: id },
    include: {
      reviewer: {
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
  });

  if (res.length === 0) {
    throw new AppError(404, "Review not found!");
  }

  return res;
};

// get review by reviewer id
const getReviewByReviewerId = async (id: string) => {
  if (!id) throw new AppError(500, "Please provide a reviewer id");

  return prisma.review.findMany({
    where: { reviewerId: id },
    include: {
      reviewer: {
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
      submission: true,
    },
  });
};

const deletReviewById = async (id: string, reviewerId: string) => {
  if (!id) throw new AppError(500, "Please provide a reviewer id");

  const review = await prisma.review.findUnique({ where: { id }, select: { id: true, reviewerId: true } });

  if (!review) throw new AppError(404, "Review not found");
  if (review.reviewerId !== reviewerId) throw new AppError(403, "You can only withdraw your own review");

  const result = await prisma.review.delete({
    where: { id },
  });
  return result;
};

const updateReviewById = async (id: string, payload: TUpdateReview) => {
  if (!id) throw new AppError(500, "Please provide a reviewer id");

  const isReviewExists = await prisma.review.findUnique({where: {id}})

  if(!isReviewExists) throw new AppError(500, "Provided Review id not found!")

  

  const result = await prisma.review.update({
    where: { id },
    data: payload,
  });

  return result;
};
const reviewService = {
  createReviewService,
  getReviewBySubmissionIdService,
  getReviewByReviewerId,
  deletReviewById,
  updateReviewById,
};

export default reviewService;
