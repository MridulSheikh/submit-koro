import { prisma } from "../../../lib/prisma";
import {
  deleteCachedValue,
  getCachedValue,
  setCachedValue,
} from "../../../lib/redis";

const overviewCacheKey = "overview:v1";
const overviewCacheTtlSeconds = 600; // 10 minute

const loadOverview = async () => {
  const [total, pending, approved, latestSubmissions] = await Promise.all([
    prisma.submission.aggregate({
      _count: { _all: true },
    }),
    prisma.submission.aggregate({
      where: { status: "PENDING" },
      _count: { _all: true },
    }),
    prisma.submission.aggregate({
      where: { status: "APPROVED" },
      _count: { _all: true },
    }),
    prisma.submission.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 10,
      select: {
        id: true,
        projectName: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
  ]);

  return {
    totalSubmission: total._count._all,
    pendingReview: pending._count._all,
    totalApproved: approved._count._all,
    latestSubmissions,
  };
};

const getOverview = async () => {
  const cached = await getCachedValue(overviewCacheKey);
  if (cached) {
    try {
      return JSON.parse(cached) as Awaited<ReturnType<typeof loadOverview>>;
    } catch (error) {
      console.error("Failed to parse cached overview data:", error);
      await deleteCachedValue(overviewCacheKey);
    }
  }

  const overview = await loadOverview();
  await setCachedValue(
    overviewCacheKey,
    JSON.stringify(overview),
    overviewCacheTtlSeconds,
  );

  return overview;
};

const overviewService = { getOverview };

export default overviewService;
