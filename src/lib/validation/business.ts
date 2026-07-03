export const validateBusinessForm = (data: Record<string, any>) => {
  const errors: Record<string, string> = {};

  if (!data.name || data.name.trim() === '') {
    errors.name = 'Business name is required';
  }

  if (!data.categoryId) {
    errors.categoryId = 'Category is required';
  }

  if (!data.regionId) {
    errors.regionId = 'Region is required';
  }

  if (!data.provinceId) {
    errors.provinceId = 'Province is required';
  }

  if (!data.cityId) {
    errors.cityId = 'City is required';
  }

  if (!data.addressLine1 || data.addressLine1.trim() === '') {
    errors.addressLine1 = 'Complete address is required';
  }

  if (!data.contactMobile && !data.contactPhone) {
    errors.contactMobile = 'Mobile or phone number is required';
  }

  if (!data.description || data.description.trim() === '') {
    errors.description = 'Description is required';
  }

  return errors;
};
