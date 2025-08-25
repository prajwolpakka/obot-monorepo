import { SelectQueryBuilder, ObjectLiteral } from 'typeorm';
import { PaginatedResult, PaginationDto } from '../dto/pagination.dto';

export async function paginate<T extends ObjectLiteral>(
  query: SelectQueryBuilder<T>,
  paginationDto: PaginationDto
): Promise<PaginatedResult<T>> {
  const page = paginationDto.page || 1;
  const limit = paginationDto.limit || 10;
  const skip = (page - 1) * limit;

  if (paginationDto.sortBy) {
    const sortOrder = paginationDto.sortOrder || 'ASC';
    query.orderBy(paginationDto.sortBy, sortOrder);
  }

  const [data, total] = await query
    .skip(skip)
    .take(limit)
    .getManyAndCount();

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    total,
    page,
    limit,
    totalPages,
  };
}