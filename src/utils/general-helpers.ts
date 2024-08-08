export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const filterObjectValues = (
  obj: Record<string, any>,
  ...allowedItems: string[]
): Record<string, any> => {
  const newObject: Record<string, any> = {};

  Object.keys(obj).forEach((key) => {
    if (allowedItems.includes(key)) {
      newObject[key] = obj[key];
    }
  });

  return newObject;
};

const kmToRad = 6378.1;
const milesToRad = 3763.2;

export function convertDistanceToRadius(
  distance: number | string,
  unit: "km" | "miles"
): number {
  const distanceNumber =
    typeof distance === "number" ? distance : Number(distance);
  return unit === "km" ? distanceNumber / kmToRad : distanceNumber / milesToRad;
}
