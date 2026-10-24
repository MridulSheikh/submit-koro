type SortDirection = "asc" | "desc";

export type QueryBuilderResult = {
  where: Record<string, unknown>;
  orderBy: Array<Record<string, SortDirection>>;
  page: number;
  limit: number;
  skip: number;
  take: number;
};

export type QueryBuilderOptions = {
  searchableFields?: readonly string[];
  filterableFields?: readonly string[];
  sortableFields: readonly string[];
  defaultSort?: { field: string; direction: SortDirection };
  defaultLimit?: number;
  maxLimit?: number;
};

class QueryBuilder<TQuery extends object = Record<string, unknown>> {
  private readonly where: Record<string, unknown> = {};
  private orderBy: Array<Record<string, SortDirection>> = [];
  private page: number;
  private limit: number;

  constructor(
    private readonly query: TQuery,
    private readonly options: QueryBuilderOptions,
  ) {
    const defaultLimit = options.defaultLimit ?? 10;
    const maxLimit = options.maxLimit ?? 100;

    if (
      !Number.isSafeInteger(defaultLimit) ||
      !Number.isSafeInteger(maxLimit) ||
      defaultLimit < 1 ||
      maxLimit < defaultLimit
    ) {
      throw new RangeError("Query builder limits must be positive integers.");
    }

    if (
      options.defaultSort &&
      !options.sortableFields.includes(options.defaultSort.field)
    ) {
      throw new TypeError(
        `Default sort field "${options.defaultSort.field}" is not sortable.`,
      );
    }

    this.page = this.readPositiveInteger("page", 1);
    this.limit = Math.min(
      this.readPositiveInteger("limit", defaultLimit),
      maxLimit,
    );
  }

  search(): this {
    const value = this.readString("search");
    const term = value?.trim();

    delete this.where.OR;
    if (term) {
      const searchableFields = this.options.searchableFields ?? [];
      if (searchableFields.length > 0) {
        this.where.OR = searchableFields.map((field) => ({
          [field]: { contains: term, mode: "insensitive" },
        }));
      }
    }

    return this;
  }

  filter(): this {
    for (const field of this.options.filterableFields ?? []) {
      const value = this.readString(field)?.trim();
      if (value) this.where[field] = value;
      else delete this.where[field];
    }

    return this;
  }

  sort(): this {
    const value = this.readString("sort");
    const sortableFields = this.options.sortableFields;

    if (!value?.trim()) {
      const defaultSort = this.options.defaultSort;
      this.orderBy = defaultSort
        ? [{ [defaultSort.field]: defaultSort.direction }]
        : [];
      return this;
    }

    const requestedSorts = value.split(",").map((item) => item.trim());
    this.orderBy = requestedSorts.map((item) => {
      const descending = item.startsWith("-");
      const field = descending ? item.slice(1) : item;

      if (!field || !sortableFields.includes(field)) {
        throw new TypeError(`Unsupported sort field "${field}".`);
      }

      return { [field]: descending ? "desc" : "asc" };
    });

    return this;
  }

  paginate(): this {
    this.page = this.readPositiveInteger("page", 1);
    this.limit = Math.min(
      this.readPositiveInteger("limit", this.options.defaultLimit ?? 10),
      this.options.maxLimit ?? 100,
    );

    return this;
  }

  build(): QueryBuilderResult {
    return {
      where: { ...this.where },
      orderBy: this.orderBy.map((sort) => ({ ...sort })),
      page: this.page,
      limit: this.limit,
      skip: (this.page - 1) * this.limit,
      take: this.limit,
    };
  }

  private readString(key: string): string | undefined {
    const value: unknown = Reflect.get(this.query, key);
    if (value === undefined) return undefined;
    if (typeof value !== "string") {
      throw new TypeError(`Query parameter "${key}" must be a string.`);
    }

    return value;
  }

  private readPositiveInteger(key: string, fallback: number): number {
    const value: unknown = Reflect.get(this.query, key);
    if (value === undefined || value === "") return fallback;
    if (typeof value !== "string" && typeof value !== "number") {
      throw new TypeError(
        `Query parameter "${key}" must be a positive integer.`,
      );
    }
    if (typeof value === "string" && value.trim() === "") return fallback;

    const parsed = Number(value);
    if (!Number.isSafeInteger(parsed) || parsed < 1) {
      throw new TypeError(
        `Query parameter "${key}" must be a positive integer.`,
      );
    }

    return parsed;
  }
}

export default QueryBuilder;