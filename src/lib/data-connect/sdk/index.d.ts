import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface ActivityLog_Key {
  id: UUIDString;
  __typename?: 'ActivityLog_Key';
}

export interface ApproveBusinessData {
  business_update?: Business_Key | null;
}

export interface ApproveBusinessVariables {
  id: UUIDString;
}

export interface Barangay_Key {
  id: UUIDString;
  __typename?: 'Barangay_Key';
}

export interface BusinessDocument_Key {
  id: UUIDString;
  __typename?: 'BusinessDocument_Key';
}

export interface BusinessPhoto_Key {
  id: UUIDString;
  __typename?: 'BusinessPhoto_Key';
}

export interface BusinessProduct_Key {
  id: UUIDString;
  __typename?: 'BusinessProduct_Key';
}

export interface BusinessService_Key {
  id: UUIDString;
  __typename?: 'BusinessService_Key';
}

export interface Business_Key {
  id: UUIDString;
  __typename?: 'Business_Key';
}

export interface Category_Key {
  id: UUIDString;
  __typename?: 'Category_Key';
}

export interface City_Key {
  id: UUIDString;
  __typename?: 'City_Key';
}

export interface CreateBusinessData {
  business_insert: Business_Key;
}

export interface CreateBusinessVariables {
  ownerId: string;
  name: string;
  slug: string;
  description: string;
  categoryId: UUIDString;
  subcategoryId?: UUIDString | null;
  addressLine1: string;
  cityId: UUIDString;
  provinceId: UUIDString;
  regionId: UUIDString;
  barangayId?: UUIDString | null;
}

export interface CreateUserData {
  user_insert: User_Key;
}

export interface CreateUserVariables {
  id: string;
  email: string;
  displayName: string;
  photoUrl?: string | null;
  role: string;
}

export interface GetAllBusinessesData {
  businesses: ({
    id: UUIDString;
    name: string;
    slug: string;
    status: string;
    ownerId: string;
    createdAt: TimestampString;
    category: {
      name: string;
    };
    city: {
      name: string;
    };
  } & Business_Key)[];
}

export interface GetAllBusinessesVariables {
  status?: string | null;
}

export interface GetAllUsersData {
  users: ({
    id: string;
    email: string;
    displayName: string;
    photoUrl?: string | null;
    role: string;
    accountStatus: string;
    createdAt: TimestampString;
  } & User_Key)[];
}

export interface GetBusinessByIdData {
  business?: {
    id: UUIDString;
    name: string;
    slug: string;
    description: string;
    status: string;
    isVerified: boolean;
    isFeatured: boolean;
    contactEmail?: string | null;
    contactPhone?: string | null;
    websiteUrl?: string | null;
    addressLine1: string;
    latitude?: number | null;
    longitude?: number | null;
    categoryId: UUIDString;
    subcategoryId?: UUIDString | null;
    cityId: UUIDString;
    provinceId: UUIDString;
    regionId: UUIDString;
    category: {
      id: UUIDString;
      name: string;
      slug: string;
    } & Category_Key;
    subcategory?: {
      id: UUIDString;
      name: string;
    } & Subcategory_Key;
    city: {
      id: UUIDString;
      name: string;
    } & City_Key;
    province: {
      id: UUIDString;
      name: string;
    } & Province_Key;
    region: {
      id: UUIDString;
      name: string;
    } & Region_Key;
    businessPhotos_on_business: ({
      id: UUIDString;
      photoUrl: string;
      isPrimary: boolean;
    } & BusinessPhoto_Key)[];
    businessProducts_on_business: ({
      id: UUIDString;
      name: string;
      description?: string | null;
      price?: number | null;
    } & BusinessProduct_Key)[];
    businessServices_on_business: ({
      id: UUIDString;
      name: string;
      description?: string | null;
      priceRange?: string | null;
    } & BusinessService_Key)[];
  } & Business_Key;
}

export interface GetBusinessByIdVariables {
  id: UUIDString;
}

export interface GetBusinessBySlugData {
  businesses: ({
    id: UUIDString;
    name: string;
    slug: string;
    description: string;
    status: string;
    isVerified: boolean;
    isFeatured: boolean;
    contactEmail?: string | null;
    contactPhone?: string | null;
    websiteUrl?: string | null;
    addressLine1: string;
    latitude?: number | null;
    longitude?: number | null;
    category: {
      id: UUIDString;
      name: string;
      slug: string;
    } & Category_Key;
    subcategory?: {
      id: UUIDString;
      name: string;
    } & Subcategory_Key;
    city: {
      name: string;
    };
    province: {
      name: string;
    };
    region: {
      name: string;
    };
    businessPhotos_on_business: ({
      id: UUIDString;
      photoUrl: string;
      isPrimary: boolean;
    } & BusinessPhoto_Key)[];
    businessProducts_on_business: ({
      id: UUIDString;
      name: string;
      description?: string | null;
      price?: number | null;
    } & BusinessProduct_Key)[];
    businessServices_on_business: ({
      id: UUIDString;
      name: string;
      description?: string | null;
      priceRange?: string | null;
    } & BusinessService_Key)[];
  } & Business_Key)[];
}

export interface GetBusinessBySlugVariables {
  slug: string;
}

export interface GetBusinessesByCategoryData {
  businesses: ({
    id: UUIDString;
    name: string;
    slug: string;
    city: {
      name: string;
    };
    businessPhotos_on_business: ({
      photoUrl: string;
    })[];
  } & Business_Key)[];
}

export interface GetBusinessesByCategoryVariables {
  categoryId: UUIDString;
}

export interface GetBusinessesByCityData {
  businesses: ({
    id: UUIDString;
    name: string;
    slug: string;
    category: {
      name: string;
    };
    businessPhotos_on_business: ({
      photoUrl: string;
    })[];
  } & Business_Key)[];
}

export interface GetBusinessesByCityVariables {
  cityId: UUIDString;
}

export interface GetBusinessesByProvinceData {
  businesses: ({
    id: UUIDString;
    name: string;
    slug: string;
    category: {
      name: string;
    };
    city: {
      name: string;
    };
    businessPhotos_on_business: ({
      photoUrl: string;
    })[];
  } & Business_Key)[];
}

export interface GetBusinessesByProvinceVariables {
  provinceId: UUIDString;
}

export interface GetCategoriesData {
  categories: ({
    id: UUIDString;
    name: string;
    slug: string;
  } & Category_Key)[];
}

export interface GetCitiesData {
  cities: ({
    id: UUIDString;
    name: string;
    slug: string;
    provinceId: UUIDString;
  } & City_Key)[];
}

export interface GetCitiesVariables {
  provinceId?: UUIDString | null;
}

export interface GetFeaturedBusinessesData {
  businesses: ({
    id: UUIDString;
    name: string;
    slug: string;
    category: {
      name: string;
    };
    city: {
      name: string;
    };
    businessPhotos_on_business: ({
      photoUrl: string;
    })[];
  } & Business_Key)[];
}

export interface GetMyBusinessesData {
  businesses: ({
    id: UUIDString;
    name: string;
    slug: string;
    status: string;
    createdAt: TimestampString;
  } & Business_Key)[];
}

export interface GetMyBusinessesVariables {
  ownerId: string;
}

export interface GetProvincesData {
  provinces: ({
    id: UUIDString;
    name: string;
    slug: string;
    regionId: UUIDString;
  } & Province_Key)[];
}

export interface GetProvincesVariables {
  regionId?: UUIDString | null;
}

export interface GetRecentlyAddedBusinessesData {
  businesses: ({
    id: UUIDString;
    name: string;
    slug: string;
    category: {
      name: string;
    };
    city: {
      name: string;
    };
    businessPhotos_on_business: ({
      photoUrl: string;
    })[];
  } & Business_Key)[];
}

export interface GetRegionsData {
  regions: ({
    id: UUIDString;
    name: string;
    slug: string;
  } & Region_Key)[];
}

export interface GetSubcategoriesData {
  subcategories: ({
    id: UUIDString;
    name: string;
    slug: string;
    categoryId: UUIDString;
  } & Subcategory_Key)[];
}

export interface GetSubcategoriesVariables {
  categoryId?: UUIDString | null;
}

export interface GetUserByIdData {
  user?: {
    id: string;
    email: string;
    displayName: string;
    photoUrl?: string | null;
    role: string;
    accountStatus: string;
  } & User_Key;
}

export interface GetUserByIdVariables {
  id: string;
}

export interface Notification_Key {
  id: UUIDString;
  __typename?: 'Notification_Key';
}

export interface Province_Key {
  id: UUIDString;
  __typename?: 'Province_Key';
}

export interface Region_Key {
  id: UUIDString;
  __typename?: 'Region_Key';
}

export interface RejectBusinessData {
  business_update?: Business_Key | null;
}

export interface RejectBusinessVariables {
  id: UUIDString;
}

export interface SaveBusinessData {
  savedBusiness_insert: SavedBusiness_Key;
}

export interface SaveBusinessVariables {
  userId: string;
  businessId: UUIDString;
}

export interface SavedBusiness_Key {
  id: UUIDString;
  __typename?: 'SavedBusiness_Key';
}

export interface SearchBusinessesData {
  businesses: ({
    id: UUIDString;
    name: string;
    slug: string;
    description: string;
    category: {
      name: string;
      slug: string;
    };
    city: {
      name: string;
    };
    province: {
      name: string;
    };
    isFeatured: boolean;
    businessPhotos_on_business: ({
      photoUrl: string;
    })[];
  } & Business_Key)[];
}

export interface SearchBusinessesVariables {
  query?: string | null;
  cityId?: UUIDString | null;
  categoryId?: UUIDString | null;
}

export interface Setting_Key {
  id: UUIDString;
  __typename?: 'Setting_Key';
}

export interface Subcategory_Key {
  id: UUIDString;
  __typename?: 'Subcategory_Key';
}

export interface SubmitBusinessData {
  business_update?: Business_Key | null;
}

export interface SubmitBusinessVariables {
  id: UUIDString;
}

export interface UpdateBusinessData {
  business_update?: Business_Key | null;
}

export interface UpdateBusinessVariables {
  id: UUIDString;
  name: string;
  description: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  websiteUrl?: string | null;
}

export interface UpdateUserProfileData {
  user_update?: User_Key | null;
}

export interface UpdateUserProfileVariables {
  id: string;
  displayName: string;
  photoUrl?: string | null;
}

export interface UpsertCategoryData {
  category_insert: Category_Key;
}

export interface UpsertCategoryVariables {
  name: string;
  slug: string;
}

export interface UpsertCityData {
  city_insert: City_Key;
}

export interface UpsertCityVariables {
  name: string;
  slug: string;
  provinceId: UUIDString;
}

export interface UpsertProvinceData {
  province_insert: Province_Key;
}

export interface UpsertProvinceVariables {
  name: string;
  slug: string;
  regionId: UUIDString;
}

export interface UpsertRegionData {
  region_insert: Region_Key;
}

export interface UpsertRegionVariables {
  name: string;
  slug: string;
}

export interface UpsertSubcategoryData {
  subcategory_insert: Subcategory_Key;
}

export interface UpsertSubcategoryVariables {
  name: string;
  slug: string;
  categoryId: UUIDString;
}

export interface User_Key {
  id: string;
  __typename?: 'User_Key';
}

interface CreateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
  operationName: string;
}
export const createUserRef: CreateUserRef;

export function createUser(vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;
export function createUser(dc: DataConnect, vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface UpdateUserProfileRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateUserProfileVariables): MutationRef<UpdateUserProfileData, UpdateUserProfileVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateUserProfileVariables): MutationRef<UpdateUserProfileData, UpdateUserProfileVariables>;
  operationName: string;
}
export const updateUserProfileRef: UpdateUserProfileRef;

export function updateUserProfile(vars: UpdateUserProfileVariables): MutationPromise<UpdateUserProfileData, UpdateUserProfileVariables>;
export function updateUserProfile(dc: DataConnect, vars: UpdateUserProfileVariables): MutationPromise<UpdateUserProfileData, UpdateUserProfileVariables>;

interface CreateBusinessRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateBusinessVariables): MutationRef<CreateBusinessData, CreateBusinessVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateBusinessVariables): MutationRef<CreateBusinessData, CreateBusinessVariables>;
  operationName: string;
}
export const createBusinessRef: CreateBusinessRef;

export function createBusiness(vars: CreateBusinessVariables): MutationPromise<CreateBusinessData, CreateBusinessVariables>;
export function createBusiness(dc: DataConnect, vars: CreateBusinessVariables): MutationPromise<CreateBusinessData, CreateBusinessVariables>;

interface UpdateBusinessRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateBusinessVariables): MutationRef<UpdateBusinessData, UpdateBusinessVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateBusinessVariables): MutationRef<UpdateBusinessData, UpdateBusinessVariables>;
  operationName: string;
}
export const updateBusinessRef: UpdateBusinessRef;

export function updateBusiness(vars: UpdateBusinessVariables): MutationPromise<UpdateBusinessData, UpdateBusinessVariables>;
export function updateBusiness(dc: DataConnect, vars: UpdateBusinessVariables): MutationPromise<UpdateBusinessData, UpdateBusinessVariables>;

interface SubmitBusinessRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: SubmitBusinessVariables): MutationRef<SubmitBusinessData, SubmitBusinessVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: SubmitBusinessVariables): MutationRef<SubmitBusinessData, SubmitBusinessVariables>;
  operationName: string;
}
export const submitBusinessRef: SubmitBusinessRef;

export function submitBusiness(vars: SubmitBusinessVariables): MutationPromise<SubmitBusinessData, SubmitBusinessVariables>;
export function submitBusiness(dc: DataConnect, vars: SubmitBusinessVariables): MutationPromise<SubmitBusinessData, SubmitBusinessVariables>;

interface ApproveBusinessRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ApproveBusinessVariables): MutationRef<ApproveBusinessData, ApproveBusinessVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ApproveBusinessVariables): MutationRef<ApproveBusinessData, ApproveBusinessVariables>;
  operationName: string;
}
export const approveBusinessRef: ApproveBusinessRef;

export function approveBusiness(vars: ApproveBusinessVariables): MutationPromise<ApproveBusinessData, ApproveBusinessVariables>;
export function approveBusiness(dc: DataConnect, vars: ApproveBusinessVariables): MutationPromise<ApproveBusinessData, ApproveBusinessVariables>;

interface RejectBusinessRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: RejectBusinessVariables): MutationRef<RejectBusinessData, RejectBusinessVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: RejectBusinessVariables): MutationRef<RejectBusinessData, RejectBusinessVariables>;
  operationName: string;
}
export const rejectBusinessRef: RejectBusinessRef;

export function rejectBusiness(vars: RejectBusinessVariables): MutationPromise<RejectBusinessData, RejectBusinessVariables>;
export function rejectBusiness(dc: DataConnect, vars: RejectBusinessVariables): MutationPromise<RejectBusinessData, RejectBusinessVariables>;

interface SaveBusinessRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: SaveBusinessVariables): MutationRef<SaveBusinessData, SaveBusinessVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: SaveBusinessVariables): MutationRef<SaveBusinessData, SaveBusinessVariables>;
  operationName: string;
}
export const saveBusinessRef: SaveBusinessRef;

export function saveBusiness(vars: SaveBusinessVariables): MutationPromise<SaveBusinessData, SaveBusinessVariables>;
export function saveBusiness(dc: DataConnect, vars: SaveBusinessVariables): MutationPromise<SaveBusinessData, SaveBusinessVariables>;

interface UpsertRegionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertRegionVariables): MutationRef<UpsertRegionData, UpsertRegionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpsertRegionVariables): MutationRef<UpsertRegionData, UpsertRegionVariables>;
  operationName: string;
}
export const upsertRegionRef: UpsertRegionRef;

export function upsertRegion(vars: UpsertRegionVariables): MutationPromise<UpsertRegionData, UpsertRegionVariables>;
export function upsertRegion(dc: DataConnect, vars: UpsertRegionVariables): MutationPromise<UpsertRegionData, UpsertRegionVariables>;

interface UpsertProvinceRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertProvinceVariables): MutationRef<UpsertProvinceData, UpsertProvinceVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpsertProvinceVariables): MutationRef<UpsertProvinceData, UpsertProvinceVariables>;
  operationName: string;
}
export const upsertProvinceRef: UpsertProvinceRef;

export function upsertProvince(vars: UpsertProvinceVariables): MutationPromise<UpsertProvinceData, UpsertProvinceVariables>;
export function upsertProvince(dc: DataConnect, vars: UpsertProvinceVariables): MutationPromise<UpsertProvinceData, UpsertProvinceVariables>;

interface UpsertCityRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertCityVariables): MutationRef<UpsertCityData, UpsertCityVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpsertCityVariables): MutationRef<UpsertCityData, UpsertCityVariables>;
  operationName: string;
}
export const upsertCityRef: UpsertCityRef;

export function upsertCity(vars: UpsertCityVariables): MutationPromise<UpsertCityData, UpsertCityVariables>;
export function upsertCity(dc: DataConnect, vars: UpsertCityVariables): MutationPromise<UpsertCityData, UpsertCityVariables>;

interface UpsertCategoryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertCategoryVariables): MutationRef<UpsertCategoryData, UpsertCategoryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpsertCategoryVariables): MutationRef<UpsertCategoryData, UpsertCategoryVariables>;
  operationName: string;
}
export const upsertCategoryRef: UpsertCategoryRef;

export function upsertCategory(vars: UpsertCategoryVariables): MutationPromise<UpsertCategoryData, UpsertCategoryVariables>;
export function upsertCategory(dc: DataConnect, vars: UpsertCategoryVariables): MutationPromise<UpsertCategoryData, UpsertCategoryVariables>;

interface UpsertSubcategoryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertSubcategoryVariables): MutationRef<UpsertSubcategoryData, UpsertSubcategoryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpsertSubcategoryVariables): MutationRef<UpsertSubcategoryData, UpsertSubcategoryVariables>;
  operationName: string;
}
export const upsertSubcategoryRef: UpsertSubcategoryRef;

export function upsertSubcategory(vars: UpsertSubcategoryVariables): MutationPromise<UpsertSubcategoryData, UpsertSubcategoryVariables>;
export function upsertSubcategory(dc: DataConnect, vars: UpsertSubcategoryVariables): MutationPromise<UpsertSubcategoryData, UpsertSubcategoryVariables>;

interface SearchBusinessesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: SearchBusinessesVariables): QueryRef<SearchBusinessesData, SearchBusinessesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: SearchBusinessesVariables): QueryRef<SearchBusinessesData, SearchBusinessesVariables>;
  operationName: string;
}
export const searchBusinessesRef: SearchBusinessesRef;

export function searchBusinesses(vars?: SearchBusinessesVariables, options?: ExecuteQueryOptions): QueryPromise<SearchBusinessesData, SearchBusinessesVariables>;
export function searchBusinesses(dc: DataConnect, vars?: SearchBusinessesVariables, options?: ExecuteQueryOptions): QueryPromise<SearchBusinessesData, SearchBusinessesVariables>;

interface GetBusinessBySlugRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetBusinessBySlugVariables): QueryRef<GetBusinessBySlugData, GetBusinessBySlugVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetBusinessBySlugVariables): QueryRef<GetBusinessBySlugData, GetBusinessBySlugVariables>;
  operationName: string;
}
export const getBusinessBySlugRef: GetBusinessBySlugRef;

export function getBusinessBySlug(vars: GetBusinessBySlugVariables, options?: ExecuteQueryOptions): QueryPromise<GetBusinessBySlugData, GetBusinessBySlugVariables>;
export function getBusinessBySlug(dc: DataConnect, vars: GetBusinessBySlugVariables, options?: ExecuteQueryOptions): QueryPromise<GetBusinessBySlugData, GetBusinessBySlugVariables>;

interface GetBusinessesByCategoryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetBusinessesByCategoryVariables): QueryRef<GetBusinessesByCategoryData, GetBusinessesByCategoryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetBusinessesByCategoryVariables): QueryRef<GetBusinessesByCategoryData, GetBusinessesByCategoryVariables>;
  operationName: string;
}
export const getBusinessesByCategoryRef: GetBusinessesByCategoryRef;

export function getBusinessesByCategory(vars: GetBusinessesByCategoryVariables, options?: ExecuteQueryOptions): QueryPromise<GetBusinessesByCategoryData, GetBusinessesByCategoryVariables>;
export function getBusinessesByCategory(dc: DataConnect, vars: GetBusinessesByCategoryVariables, options?: ExecuteQueryOptions): QueryPromise<GetBusinessesByCategoryData, GetBusinessesByCategoryVariables>;

interface GetBusinessesByCityRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetBusinessesByCityVariables): QueryRef<GetBusinessesByCityData, GetBusinessesByCityVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetBusinessesByCityVariables): QueryRef<GetBusinessesByCityData, GetBusinessesByCityVariables>;
  operationName: string;
}
export const getBusinessesByCityRef: GetBusinessesByCityRef;

export function getBusinessesByCity(vars: GetBusinessesByCityVariables, options?: ExecuteQueryOptions): QueryPromise<GetBusinessesByCityData, GetBusinessesByCityVariables>;
export function getBusinessesByCity(dc: DataConnect, vars: GetBusinessesByCityVariables, options?: ExecuteQueryOptions): QueryPromise<GetBusinessesByCityData, GetBusinessesByCityVariables>;

interface GetBusinessesByProvinceRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetBusinessesByProvinceVariables): QueryRef<GetBusinessesByProvinceData, GetBusinessesByProvinceVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetBusinessesByProvinceVariables): QueryRef<GetBusinessesByProvinceData, GetBusinessesByProvinceVariables>;
  operationName: string;
}
export const getBusinessesByProvinceRef: GetBusinessesByProvinceRef;

export function getBusinessesByProvince(vars: GetBusinessesByProvinceVariables, options?: ExecuteQueryOptions): QueryPromise<GetBusinessesByProvinceData, GetBusinessesByProvinceVariables>;
export function getBusinessesByProvince(dc: DataConnect, vars: GetBusinessesByProvinceVariables, options?: ExecuteQueryOptions): QueryPromise<GetBusinessesByProvinceData, GetBusinessesByProvinceVariables>;

interface GetFeaturedBusinessesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetFeaturedBusinessesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetFeaturedBusinessesData, undefined>;
  operationName: string;
}
export const getFeaturedBusinessesRef: GetFeaturedBusinessesRef;

export function getFeaturedBusinesses(options?: ExecuteQueryOptions): QueryPromise<GetFeaturedBusinessesData, undefined>;
export function getFeaturedBusinesses(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetFeaturedBusinessesData, undefined>;

interface GetRecentlyAddedBusinessesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetRecentlyAddedBusinessesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetRecentlyAddedBusinessesData, undefined>;
  operationName: string;
}
export const getRecentlyAddedBusinessesRef: GetRecentlyAddedBusinessesRef;

export function getRecentlyAddedBusinesses(options?: ExecuteQueryOptions): QueryPromise<GetRecentlyAddedBusinessesData, undefined>;
export function getRecentlyAddedBusinesses(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetRecentlyAddedBusinessesData, undefined>;

interface GetMyBusinessesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetMyBusinessesVariables): QueryRef<GetMyBusinessesData, GetMyBusinessesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetMyBusinessesVariables): QueryRef<GetMyBusinessesData, GetMyBusinessesVariables>;
  operationName: string;
}
export const getMyBusinessesRef: GetMyBusinessesRef;

export function getMyBusinesses(vars: GetMyBusinessesVariables, options?: ExecuteQueryOptions): QueryPromise<GetMyBusinessesData, GetMyBusinessesVariables>;
export function getMyBusinesses(dc: DataConnect, vars: GetMyBusinessesVariables, options?: ExecuteQueryOptions): QueryPromise<GetMyBusinessesData, GetMyBusinessesVariables>;

interface GetBusinessByIdRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetBusinessByIdVariables): QueryRef<GetBusinessByIdData, GetBusinessByIdVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetBusinessByIdVariables): QueryRef<GetBusinessByIdData, GetBusinessByIdVariables>;
  operationName: string;
}
export const getBusinessByIdRef: GetBusinessByIdRef;

export function getBusinessById(vars: GetBusinessByIdVariables, options?: ExecuteQueryOptions): QueryPromise<GetBusinessByIdData, GetBusinessByIdVariables>;
export function getBusinessById(dc: DataConnect, vars: GetBusinessByIdVariables, options?: ExecuteQueryOptions): QueryPromise<GetBusinessByIdData, GetBusinessByIdVariables>;

interface GetAllBusinessesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: GetAllBusinessesVariables): QueryRef<GetAllBusinessesData, GetAllBusinessesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: GetAllBusinessesVariables): QueryRef<GetAllBusinessesData, GetAllBusinessesVariables>;
  operationName: string;
}
export const getAllBusinessesRef: GetAllBusinessesRef;

export function getAllBusinesses(vars?: GetAllBusinessesVariables, options?: ExecuteQueryOptions): QueryPromise<GetAllBusinessesData, GetAllBusinessesVariables>;
export function getAllBusinesses(dc: DataConnect, vars?: GetAllBusinessesVariables, options?: ExecuteQueryOptions): QueryPromise<GetAllBusinessesData, GetAllBusinessesVariables>;

interface GetRegionsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetRegionsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetRegionsData, undefined>;
  operationName: string;
}
export const getRegionsRef: GetRegionsRef;

export function getRegions(options?: ExecuteQueryOptions): QueryPromise<GetRegionsData, undefined>;
export function getRegions(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetRegionsData, undefined>;

interface GetProvincesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: GetProvincesVariables): QueryRef<GetProvincesData, GetProvincesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: GetProvincesVariables): QueryRef<GetProvincesData, GetProvincesVariables>;
  operationName: string;
}
export const getProvincesRef: GetProvincesRef;

export function getProvinces(vars?: GetProvincesVariables, options?: ExecuteQueryOptions): QueryPromise<GetProvincesData, GetProvincesVariables>;
export function getProvinces(dc: DataConnect, vars?: GetProvincesVariables, options?: ExecuteQueryOptions): QueryPromise<GetProvincesData, GetProvincesVariables>;

interface GetCitiesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: GetCitiesVariables): QueryRef<GetCitiesData, GetCitiesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: GetCitiesVariables): QueryRef<GetCitiesData, GetCitiesVariables>;
  operationName: string;
}
export const getCitiesRef: GetCitiesRef;

export function getCities(vars?: GetCitiesVariables, options?: ExecuteQueryOptions): QueryPromise<GetCitiesData, GetCitiesVariables>;
export function getCities(dc: DataConnect, vars?: GetCitiesVariables, options?: ExecuteQueryOptions): QueryPromise<GetCitiesData, GetCitiesVariables>;

interface GetCategoriesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetCategoriesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetCategoriesData, undefined>;
  operationName: string;
}
export const getCategoriesRef: GetCategoriesRef;

export function getCategories(options?: ExecuteQueryOptions): QueryPromise<GetCategoriesData, undefined>;
export function getCategories(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetCategoriesData, undefined>;

interface GetSubcategoriesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: GetSubcategoriesVariables): QueryRef<GetSubcategoriesData, GetSubcategoriesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: GetSubcategoriesVariables): QueryRef<GetSubcategoriesData, GetSubcategoriesVariables>;
  operationName: string;
}
export const getSubcategoriesRef: GetSubcategoriesRef;

export function getSubcategories(vars?: GetSubcategoriesVariables, options?: ExecuteQueryOptions): QueryPromise<GetSubcategoriesData, GetSubcategoriesVariables>;
export function getSubcategories(dc: DataConnect, vars?: GetSubcategoriesVariables, options?: ExecuteQueryOptions): QueryPromise<GetSubcategoriesData, GetSubcategoriesVariables>;

interface GetUserByIdRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserByIdVariables): QueryRef<GetUserByIdData, GetUserByIdVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetUserByIdVariables): QueryRef<GetUserByIdData, GetUserByIdVariables>;
  operationName: string;
}
export const getUserByIdRef: GetUserByIdRef;

export function getUserById(vars: GetUserByIdVariables, options?: ExecuteQueryOptions): QueryPromise<GetUserByIdData, GetUserByIdVariables>;
export function getUserById(dc: DataConnect, vars: GetUserByIdVariables, options?: ExecuteQueryOptions): QueryPromise<GetUserByIdData, GetUserByIdVariables>;

interface GetAllUsersRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetAllUsersData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetAllUsersData, undefined>;
  operationName: string;
}
export const getAllUsersRef: GetAllUsersRef;

export function getAllUsers(options?: ExecuteQueryOptions): QueryPromise<GetAllUsersData, undefined>;
export function getAllUsers(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetAllUsersData, undefined>;

