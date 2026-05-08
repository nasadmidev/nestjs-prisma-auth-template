import { SetMetadata } from '@nestjs/common';
import { Role } from '@/generated/prisma/enums';

export const Roles = (...role: Role[]) => SetMetadata('role', role);
