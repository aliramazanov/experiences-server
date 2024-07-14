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
