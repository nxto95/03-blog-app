export * from './create-user.dto';
import { Transform } from 'class-transformer';
export function NormalizeString() {
  return Transform(({ value }): string =>
    typeof value === 'string' ? value.trim().toLocaleLowerCase() : value,
  );
}
