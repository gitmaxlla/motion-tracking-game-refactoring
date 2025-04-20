export default function areCoordsClose(
  value1: number,
  value2: number,
): boolean {
  // REF: 0.05 => проблема Magic Number. 
  //      заменить на константу (как пример, DISTANCE_THRESHOLD, ERROR_MARGIN, другие подобные названия).
  return Math.abs(value1 - value2) <= 0.05
}
