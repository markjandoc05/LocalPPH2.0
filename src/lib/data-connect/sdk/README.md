# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `default`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*SearchBusinesses*](#searchbusinesses)
  - [*GetBusinessBySlug*](#getbusinessbyslug)
  - [*GetBusinessesByCategory*](#getbusinessesbycategory)
  - [*GetBusinessesByCity*](#getbusinessesbycity)
  - [*GetBusinessesByProvince*](#getbusinessesbyprovince)
  - [*GetFeaturedBusinesses*](#getfeaturedbusinesses)
  - [*GetRecentlyAddedBusinesses*](#getrecentlyaddedbusinesses)
  - [*GetMyBusinesses*](#getmybusinesses)
  - [*GetBusinessById*](#getbusinessbyid)
  - [*GetAllBusinesses*](#getallbusinesses)
  - [*GetRegions*](#getregions)
  - [*GetProvinces*](#getprovinces)
  - [*GetCities*](#getcities)
  - [*GetCategories*](#getcategories)
  - [*GetSubcategories*](#getsubcategories)
  - [*GetUserById*](#getuserbyid)
  - [*GetAllUsers*](#getallusers)
- [**Mutations**](#mutations)
  - [*CreateUser*](#createuser)
  - [*UpdateUserProfile*](#updateuserprofile)
  - [*CreateBusiness*](#createbusiness)
  - [*UpdateBusiness*](#updatebusiness)
  - [*SubmitBusiness*](#submitbusiness)
  - [*ApproveBusiness*](#approvebusiness)
  - [*RejectBusiness*](#rejectbusiness)
  - [*SaveBusiness*](#savebusiness)
  - [*UpsertRegion*](#upsertregion)
  - [*UpsertProvince*](#upsertprovince)
  - [*UpsertCity*](#upsertcity)
  - [*UpsertCategory*](#upsertcategory)
  - [*UpsertSubcategory*](#upsertsubcategory)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `default`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@firebasegen/default-connector` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@firebasegen/default-connector';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@firebasegen/default-connector';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `default` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## SearchBusinesses
You can execute the `SearchBusinesses` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [sdk/index.d.ts](./index.d.ts):
```typescript
searchBusinesses(vars?: SearchBusinessesVariables, options?: ExecuteQueryOptions): QueryPromise<SearchBusinessesData, SearchBusinessesVariables>;

interface SearchBusinessesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars?: SearchBusinessesVariables): QueryRef<SearchBusinessesData, SearchBusinessesVariables>;
}
export const searchBusinessesRef: SearchBusinessesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
searchBusinesses(dc: DataConnect, vars?: SearchBusinessesVariables, options?: ExecuteQueryOptions): QueryPromise<SearchBusinessesData, SearchBusinessesVariables>;

interface SearchBusinessesRef {
  ...
  (dc: DataConnect, vars?: SearchBusinessesVariables): QueryRef<SearchBusinessesData, SearchBusinessesVariables>;
}
export const searchBusinessesRef: SearchBusinessesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the searchBusinessesRef:
```typescript
const name = searchBusinessesRef.operationName;
console.log(name);
```

### Variables
The `SearchBusinesses` query has an optional argument of type `SearchBusinessesVariables`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface SearchBusinessesVariables {
  query?: string | null;
  cityId?: UUIDString | null;
  categoryId?: UUIDString | null;
}
```
### Return Type
Recall that executing the `SearchBusinesses` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `SearchBusinessesData`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `SearchBusinesses`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, searchBusinesses, SearchBusinessesVariables } from '@firebasegen/default-connector';

// The `SearchBusinesses` query has an optional argument of type `SearchBusinessesVariables`:
const searchBusinessesVars: SearchBusinessesVariables = {
  query: ..., // optional
  cityId: ..., // optional
  categoryId: ..., // optional
};

// Call the `searchBusinesses()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await searchBusinesses(searchBusinessesVars);
// Variables can be defined inline as well.
const { data } = await searchBusinesses({ query: ..., cityId: ..., categoryId: ..., });
// Since all variables are optional for this query, you can omit the `SearchBusinessesVariables` argument.
const { data } = await searchBusinesses();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await searchBusinesses(dataConnect, searchBusinessesVars);

console.log(data.businesses);

// Or, you can use the `Promise` API.
searchBusinesses(searchBusinessesVars).then((response) => {
  const data = response.data;
  console.log(data.businesses);
});
```

### Using `SearchBusinesses`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, searchBusinessesRef, SearchBusinessesVariables } from '@firebasegen/default-connector';

// The `SearchBusinesses` query has an optional argument of type `SearchBusinessesVariables`:
const searchBusinessesVars: SearchBusinessesVariables = {
  query: ..., // optional
  cityId: ..., // optional
  categoryId: ..., // optional
};

// Call the `searchBusinessesRef()` function to get a reference to the query.
const ref = searchBusinessesRef(searchBusinessesVars);
// Variables can be defined inline as well.
const ref = searchBusinessesRef({ query: ..., cityId: ..., categoryId: ..., });
// Since all variables are optional for this query, you can omit the `SearchBusinessesVariables` argument.
const ref = searchBusinessesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = searchBusinessesRef(dataConnect, searchBusinessesVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.businesses);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.businesses);
});
```

## GetBusinessBySlug
You can execute the `GetBusinessBySlug` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [sdk/index.d.ts](./index.d.ts):
```typescript
getBusinessBySlug(vars: GetBusinessBySlugVariables, options?: ExecuteQueryOptions): QueryPromise<GetBusinessBySlugData, GetBusinessBySlugVariables>;

interface GetBusinessBySlugRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetBusinessBySlugVariables): QueryRef<GetBusinessBySlugData, GetBusinessBySlugVariables>;
}
export const getBusinessBySlugRef: GetBusinessBySlugRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getBusinessBySlug(dc: DataConnect, vars: GetBusinessBySlugVariables, options?: ExecuteQueryOptions): QueryPromise<GetBusinessBySlugData, GetBusinessBySlugVariables>;

interface GetBusinessBySlugRef {
  ...
  (dc: DataConnect, vars: GetBusinessBySlugVariables): QueryRef<GetBusinessBySlugData, GetBusinessBySlugVariables>;
}
export const getBusinessBySlugRef: GetBusinessBySlugRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getBusinessBySlugRef:
```typescript
const name = getBusinessBySlugRef.operationName;
console.log(name);
```

### Variables
The `GetBusinessBySlug` query requires an argument of type `GetBusinessBySlugVariables`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetBusinessBySlugVariables {
  slug: string;
}
```
### Return Type
Recall that executing the `GetBusinessBySlug` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetBusinessBySlugData`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetBusinessBySlug`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getBusinessBySlug, GetBusinessBySlugVariables } from '@firebasegen/default-connector';

// The `GetBusinessBySlug` query requires an argument of type `GetBusinessBySlugVariables`:
const getBusinessBySlugVars: GetBusinessBySlugVariables = {
  slug: ..., 
};

// Call the `getBusinessBySlug()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getBusinessBySlug(getBusinessBySlugVars);
// Variables can be defined inline as well.
const { data } = await getBusinessBySlug({ slug: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getBusinessBySlug(dataConnect, getBusinessBySlugVars);

console.log(data.businesses);

// Or, you can use the `Promise` API.
getBusinessBySlug(getBusinessBySlugVars).then((response) => {
  const data = response.data;
  console.log(data.businesses);
});
```

### Using `GetBusinessBySlug`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getBusinessBySlugRef, GetBusinessBySlugVariables } from '@firebasegen/default-connector';

// The `GetBusinessBySlug` query requires an argument of type `GetBusinessBySlugVariables`:
const getBusinessBySlugVars: GetBusinessBySlugVariables = {
  slug: ..., 
};

// Call the `getBusinessBySlugRef()` function to get a reference to the query.
const ref = getBusinessBySlugRef(getBusinessBySlugVars);
// Variables can be defined inline as well.
const ref = getBusinessBySlugRef({ slug: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getBusinessBySlugRef(dataConnect, getBusinessBySlugVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.businesses);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.businesses);
});
```

## GetBusinessesByCategory
You can execute the `GetBusinessesByCategory` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [sdk/index.d.ts](./index.d.ts):
```typescript
getBusinessesByCategory(vars: GetBusinessesByCategoryVariables, options?: ExecuteQueryOptions): QueryPromise<GetBusinessesByCategoryData, GetBusinessesByCategoryVariables>;

interface GetBusinessesByCategoryRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetBusinessesByCategoryVariables): QueryRef<GetBusinessesByCategoryData, GetBusinessesByCategoryVariables>;
}
export const getBusinessesByCategoryRef: GetBusinessesByCategoryRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getBusinessesByCategory(dc: DataConnect, vars: GetBusinessesByCategoryVariables, options?: ExecuteQueryOptions): QueryPromise<GetBusinessesByCategoryData, GetBusinessesByCategoryVariables>;

interface GetBusinessesByCategoryRef {
  ...
  (dc: DataConnect, vars: GetBusinessesByCategoryVariables): QueryRef<GetBusinessesByCategoryData, GetBusinessesByCategoryVariables>;
}
export const getBusinessesByCategoryRef: GetBusinessesByCategoryRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getBusinessesByCategoryRef:
```typescript
const name = getBusinessesByCategoryRef.operationName;
console.log(name);
```

### Variables
The `GetBusinessesByCategory` query requires an argument of type `GetBusinessesByCategoryVariables`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetBusinessesByCategoryVariables {
  categoryId: UUIDString;
}
```
### Return Type
Recall that executing the `GetBusinessesByCategory` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetBusinessesByCategoryData`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetBusinessesByCategory`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getBusinessesByCategory, GetBusinessesByCategoryVariables } from '@firebasegen/default-connector';

// The `GetBusinessesByCategory` query requires an argument of type `GetBusinessesByCategoryVariables`:
const getBusinessesByCategoryVars: GetBusinessesByCategoryVariables = {
  categoryId: ..., 
};

// Call the `getBusinessesByCategory()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getBusinessesByCategory(getBusinessesByCategoryVars);
// Variables can be defined inline as well.
const { data } = await getBusinessesByCategory({ categoryId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getBusinessesByCategory(dataConnect, getBusinessesByCategoryVars);

console.log(data.businesses);

// Or, you can use the `Promise` API.
getBusinessesByCategory(getBusinessesByCategoryVars).then((response) => {
  const data = response.data;
  console.log(data.businesses);
});
```

### Using `GetBusinessesByCategory`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getBusinessesByCategoryRef, GetBusinessesByCategoryVariables } from '@firebasegen/default-connector';

// The `GetBusinessesByCategory` query requires an argument of type `GetBusinessesByCategoryVariables`:
const getBusinessesByCategoryVars: GetBusinessesByCategoryVariables = {
  categoryId: ..., 
};

// Call the `getBusinessesByCategoryRef()` function to get a reference to the query.
const ref = getBusinessesByCategoryRef(getBusinessesByCategoryVars);
// Variables can be defined inline as well.
const ref = getBusinessesByCategoryRef({ categoryId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getBusinessesByCategoryRef(dataConnect, getBusinessesByCategoryVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.businesses);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.businesses);
});
```

## GetBusinessesByCity
You can execute the `GetBusinessesByCity` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [sdk/index.d.ts](./index.d.ts):
```typescript
getBusinessesByCity(vars: GetBusinessesByCityVariables, options?: ExecuteQueryOptions): QueryPromise<GetBusinessesByCityData, GetBusinessesByCityVariables>;

interface GetBusinessesByCityRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetBusinessesByCityVariables): QueryRef<GetBusinessesByCityData, GetBusinessesByCityVariables>;
}
export const getBusinessesByCityRef: GetBusinessesByCityRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getBusinessesByCity(dc: DataConnect, vars: GetBusinessesByCityVariables, options?: ExecuteQueryOptions): QueryPromise<GetBusinessesByCityData, GetBusinessesByCityVariables>;

interface GetBusinessesByCityRef {
  ...
  (dc: DataConnect, vars: GetBusinessesByCityVariables): QueryRef<GetBusinessesByCityData, GetBusinessesByCityVariables>;
}
export const getBusinessesByCityRef: GetBusinessesByCityRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getBusinessesByCityRef:
```typescript
const name = getBusinessesByCityRef.operationName;
console.log(name);
```

### Variables
The `GetBusinessesByCity` query requires an argument of type `GetBusinessesByCityVariables`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetBusinessesByCityVariables {
  cityId: UUIDString;
}
```
### Return Type
Recall that executing the `GetBusinessesByCity` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetBusinessesByCityData`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetBusinessesByCity`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getBusinessesByCity, GetBusinessesByCityVariables } from '@firebasegen/default-connector';

// The `GetBusinessesByCity` query requires an argument of type `GetBusinessesByCityVariables`:
const getBusinessesByCityVars: GetBusinessesByCityVariables = {
  cityId: ..., 
};

// Call the `getBusinessesByCity()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getBusinessesByCity(getBusinessesByCityVars);
// Variables can be defined inline as well.
const { data } = await getBusinessesByCity({ cityId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getBusinessesByCity(dataConnect, getBusinessesByCityVars);

console.log(data.businesses);

// Or, you can use the `Promise` API.
getBusinessesByCity(getBusinessesByCityVars).then((response) => {
  const data = response.data;
  console.log(data.businesses);
});
```

### Using `GetBusinessesByCity`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getBusinessesByCityRef, GetBusinessesByCityVariables } from '@firebasegen/default-connector';

// The `GetBusinessesByCity` query requires an argument of type `GetBusinessesByCityVariables`:
const getBusinessesByCityVars: GetBusinessesByCityVariables = {
  cityId: ..., 
};

// Call the `getBusinessesByCityRef()` function to get a reference to the query.
const ref = getBusinessesByCityRef(getBusinessesByCityVars);
// Variables can be defined inline as well.
const ref = getBusinessesByCityRef({ cityId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getBusinessesByCityRef(dataConnect, getBusinessesByCityVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.businesses);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.businesses);
});
```

## GetBusinessesByProvince
You can execute the `GetBusinessesByProvince` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [sdk/index.d.ts](./index.d.ts):
```typescript
getBusinessesByProvince(vars: GetBusinessesByProvinceVariables, options?: ExecuteQueryOptions): QueryPromise<GetBusinessesByProvinceData, GetBusinessesByProvinceVariables>;

interface GetBusinessesByProvinceRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetBusinessesByProvinceVariables): QueryRef<GetBusinessesByProvinceData, GetBusinessesByProvinceVariables>;
}
export const getBusinessesByProvinceRef: GetBusinessesByProvinceRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getBusinessesByProvince(dc: DataConnect, vars: GetBusinessesByProvinceVariables, options?: ExecuteQueryOptions): QueryPromise<GetBusinessesByProvinceData, GetBusinessesByProvinceVariables>;

interface GetBusinessesByProvinceRef {
  ...
  (dc: DataConnect, vars: GetBusinessesByProvinceVariables): QueryRef<GetBusinessesByProvinceData, GetBusinessesByProvinceVariables>;
}
export const getBusinessesByProvinceRef: GetBusinessesByProvinceRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getBusinessesByProvinceRef:
```typescript
const name = getBusinessesByProvinceRef.operationName;
console.log(name);
```

### Variables
The `GetBusinessesByProvince` query requires an argument of type `GetBusinessesByProvinceVariables`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetBusinessesByProvinceVariables {
  provinceId: UUIDString;
}
```
### Return Type
Recall that executing the `GetBusinessesByProvince` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetBusinessesByProvinceData`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetBusinessesByProvince`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getBusinessesByProvince, GetBusinessesByProvinceVariables } from '@firebasegen/default-connector';

// The `GetBusinessesByProvince` query requires an argument of type `GetBusinessesByProvinceVariables`:
const getBusinessesByProvinceVars: GetBusinessesByProvinceVariables = {
  provinceId: ..., 
};

// Call the `getBusinessesByProvince()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getBusinessesByProvince(getBusinessesByProvinceVars);
// Variables can be defined inline as well.
const { data } = await getBusinessesByProvince({ provinceId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getBusinessesByProvince(dataConnect, getBusinessesByProvinceVars);

console.log(data.businesses);

// Or, you can use the `Promise` API.
getBusinessesByProvince(getBusinessesByProvinceVars).then((response) => {
  const data = response.data;
  console.log(data.businesses);
});
```

### Using `GetBusinessesByProvince`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getBusinessesByProvinceRef, GetBusinessesByProvinceVariables } from '@firebasegen/default-connector';

// The `GetBusinessesByProvince` query requires an argument of type `GetBusinessesByProvinceVariables`:
const getBusinessesByProvinceVars: GetBusinessesByProvinceVariables = {
  provinceId: ..., 
};

// Call the `getBusinessesByProvinceRef()` function to get a reference to the query.
const ref = getBusinessesByProvinceRef(getBusinessesByProvinceVars);
// Variables can be defined inline as well.
const ref = getBusinessesByProvinceRef({ provinceId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getBusinessesByProvinceRef(dataConnect, getBusinessesByProvinceVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.businesses);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.businesses);
});
```

## GetFeaturedBusinesses
You can execute the `GetFeaturedBusinesses` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [sdk/index.d.ts](./index.d.ts):
```typescript
getFeaturedBusinesses(options?: ExecuteQueryOptions): QueryPromise<GetFeaturedBusinessesData, undefined>;

interface GetFeaturedBusinessesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetFeaturedBusinessesData, undefined>;
}
export const getFeaturedBusinessesRef: GetFeaturedBusinessesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getFeaturedBusinesses(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetFeaturedBusinessesData, undefined>;

interface GetFeaturedBusinessesRef {
  ...
  (dc: DataConnect): QueryRef<GetFeaturedBusinessesData, undefined>;
}
export const getFeaturedBusinessesRef: GetFeaturedBusinessesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getFeaturedBusinessesRef:
```typescript
const name = getFeaturedBusinessesRef.operationName;
console.log(name);
```

### Variables
The `GetFeaturedBusinesses` query has no variables.
### Return Type
Recall that executing the `GetFeaturedBusinesses` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetFeaturedBusinessesData`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetFeaturedBusinesses`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getFeaturedBusinesses } from '@firebasegen/default-connector';


// Call the `getFeaturedBusinesses()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getFeaturedBusinesses();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getFeaturedBusinesses(dataConnect);

console.log(data.businesses);

// Or, you can use the `Promise` API.
getFeaturedBusinesses().then((response) => {
  const data = response.data;
  console.log(data.businesses);
});
```

### Using `GetFeaturedBusinesses`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getFeaturedBusinessesRef } from '@firebasegen/default-connector';


// Call the `getFeaturedBusinessesRef()` function to get a reference to the query.
const ref = getFeaturedBusinessesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getFeaturedBusinessesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.businesses);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.businesses);
});
```

## GetRecentlyAddedBusinesses
You can execute the `GetRecentlyAddedBusinesses` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [sdk/index.d.ts](./index.d.ts):
```typescript
getRecentlyAddedBusinesses(options?: ExecuteQueryOptions): QueryPromise<GetRecentlyAddedBusinessesData, undefined>;

interface GetRecentlyAddedBusinessesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetRecentlyAddedBusinessesData, undefined>;
}
export const getRecentlyAddedBusinessesRef: GetRecentlyAddedBusinessesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getRecentlyAddedBusinesses(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetRecentlyAddedBusinessesData, undefined>;

interface GetRecentlyAddedBusinessesRef {
  ...
  (dc: DataConnect): QueryRef<GetRecentlyAddedBusinessesData, undefined>;
}
export const getRecentlyAddedBusinessesRef: GetRecentlyAddedBusinessesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getRecentlyAddedBusinessesRef:
```typescript
const name = getRecentlyAddedBusinessesRef.operationName;
console.log(name);
```

### Variables
The `GetRecentlyAddedBusinesses` query has no variables.
### Return Type
Recall that executing the `GetRecentlyAddedBusinesses` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetRecentlyAddedBusinessesData`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetRecentlyAddedBusinesses`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getRecentlyAddedBusinesses } from '@firebasegen/default-connector';


// Call the `getRecentlyAddedBusinesses()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getRecentlyAddedBusinesses();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getRecentlyAddedBusinesses(dataConnect);

console.log(data.businesses);

// Or, you can use the `Promise` API.
getRecentlyAddedBusinesses().then((response) => {
  const data = response.data;
  console.log(data.businesses);
});
```

### Using `GetRecentlyAddedBusinesses`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getRecentlyAddedBusinessesRef } from '@firebasegen/default-connector';


// Call the `getRecentlyAddedBusinessesRef()` function to get a reference to the query.
const ref = getRecentlyAddedBusinessesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getRecentlyAddedBusinessesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.businesses);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.businesses);
});
```

## GetMyBusinesses
You can execute the `GetMyBusinesses` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [sdk/index.d.ts](./index.d.ts):
```typescript
getMyBusinesses(vars: GetMyBusinessesVariables, options?: ExecuteQueryOptions): QueryPromise<GetMyBusinessesData, GetMyBusinessesVariables>;

interface GetMyBusinessesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetMyBusinessesVariables): QueryRef<GetMyBusinessesData, GetMyBusinessesVariables>;
}
export const getMyBusinessesRef: GetMyBusinessesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getMyBusinesses(dc: DataConnect, vars: GetMyBusinessesVariables, options?: ExecuteQueryOptions): QueryPromise<GetMyBusinessesData, GetMyBusinessesVariables>;

interface GetMyBusinessesRef {
  ...
  (dc: DataConnect, vars: GetMyBusinessesVariables): QueryRef<GetMyBusinessesData, GetMyBusinessesVariables>;
}
export const getMyBusinessesRef: GetMyBusinessesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getMyBusinessesRef:
```typescript
const name = getMyBusinessesRef.operationName;
console.log(name);
```

### Variables
The `GetMyBusinesses` query requires an argument of type `GetMyBusinessesVariables`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetMyBusinessesVariables {
  ownerId: string;
}
```
### Return Type
Recall that executing the `GetMyBusinesses` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetMyBusinessesData`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetMyBusinessesData {
  businesses: ({
    id: UUIDString;
    name: string;
    slug: string;
    status: string;
    createdAt: TimestampString;
  } & Business_Key)[];
}
```
### Using `GetMyBusinesses`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getMyBusinesses, GetMyBusinessesVariables } from '@firebasegen/default-connector';

// The `GetMyBusinesses` query requires an argument of type `GetMyBusinessesVariables`:
const getMyBusinessesVars: GetMyBusinessesVariables = {
  ownerId: ..., 
};

// Call the `getMyBusinesses()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getMyBusinesses(getMyBusinessesVars);
// Variables can be defined inline as well.
const { data } = await getMyBusinesses({ ownerId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getMyBusinesses(dataConnect, getMyBusinessesVars);

console.log(data.businesses);

// Or, you can use the `Promise` API.
getMyBusinesses(getMyBusinessesVars).then((response) => {
  const data = response.data;
  console.log(data.businesses);
});
```

### Using `GetMyBusinesses`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getMyBusinessesRef, GetMyBusinessesVariables } from '@firebasegen/default-connector';

// The `GetMyBusinesses` query requires an argument of type `GetMyBusinessesVariables`:
const getMyBusinessesVars: GetMyBusinessesVariables = {
  ownerId: ..., 
};

// Call the `getMyBusinessesRef()` function to get a reference to the query.
const ref = getMyBusinessesRef(getMyBusinessesVars);
// Variables can be defined inline as well.
const ref = getMyBusinessesRef({ ownerId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getMyBusinessesRef(dataConnect, getMyBusinessesVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.businesses);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.businesses);
});
```

## GetBusinessById
You can execute the `GetBusinessById` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [sdk/index.d.ts](./index.d.ts):
```typescript
getBusinessById(vars: GetBusinessByIdVariables, options?: ExecuteQueryOptions): QueryPromise<GetBusinessByIdData, GetBusinessByIdVariables>;

interface GetBusinessByIdRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetBusinessByIdVariables): QueryRef<GetBusinessByIdData, GetBusinessByIdVariables>;
}
export const getBusinessByIdRef: GetBusinessByIdRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getBusinessById(dc: DataConnect, vars: GetBusinessByIdVariables, options?: ExecuteQueryOptions): QueryPromise<GetBusinessByIdData, GetBusinessByIdVariables>;

interface GetBusinessByIdRef {
  ...
  (dc: DataConnect, vars: GetBusinessByIdVariables): QueryRef<GetBusinessByIdData, GetBusinessByIdVariables>;
}
export const getBusinessByIdRef: GetBusinessByIdRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getBusinessByIdRef:
```typescript
const name = getBusinessByIdRef.operationName;
console.log(name);
```

### Variables
The `GetBusinessById` query requires an argument of type `GetBusinessByIdVariables`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetBusinessByIdVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetBusinessById` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetBusinessByIdData`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetBusinessById`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getBusinessById, GetBusinessByIdVariables } from '@firebasegen/default-connector';

// The `GetBusinessById` query requires an argument of type `GetBusinessByIdVariables`:
const getBusinessByIdVars: GetBusinessByIdVariables = {
  id: ..., 
};

// Call the `getBusinessById()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getBusinessById(getBusinessByIdVars);
// Variables can be defined inline as well.
const { data } = await getBusinessById({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getBusinessById(dataConnect, getBusinessByIdVars);

console.log(data.business);

// Or, you can use the `Promise` API.
getBusinessById(getBusinessByIdVars).then((response) => {
  const data = response.data;
  console.log(data.business);
});
```

### Using `GetBusinessById`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getBusinessByIdRef, GetBusinessByIdVariables } from '@firebasegen/default-connector';

// The `GetBusinessById` query requires an argument of type `GetBusinessByIdVariables`:
const getBusinessByIdVars: GetBusinessByIdVariables = {
  id: ..., 
};

// Call the `getBusinessByIdRef()` function to get a reference to the query.
const ref = getBusinessByIdRef(getBusinessByIdVars);
// Variables can be defined inline as well.
const ref = getBusinessByIdRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getBusinessByIdRef(dataConnect, getBusinessByIdVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.business);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.business);
});
```

## GetAllBusinesses
You can execute the `GetAllBusinesses` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [sdk/index.d.ts](./index.d.ts):
```typescript
getAllBusinesses(vars?: GetAllBusinessesVariables, options?: ExecuteQueryOptions): QueryPromise<GetAllBusinessesData, GetAllBusinessesVariables>;

interface GetAllBusinessesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars?: GetAllBusinessesVariables): QueryRef<GetAllBusinessesData, GetAllBusinessesVariables>;
}
export const getAllBusinessesRef: GetAllBusinessesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getAllBusinesses(dc: DataConnect, vars?: GetAllBusinessesVariables, options?: ExecuteQueryOptions): QueryPromise<GetAllBusinessesData, GetAllBusinessesVariables>;

interface GetAllBusinessesRef {
  ...
  (dc: DataConnect, vars?: GetAllBusinessesVariables): QueryRef<GetAllBusinessesData, GetAllBusinessesVariables>;
}
export const getAllBusinessesRef: GetAllBusinessesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getAllBusinessesRef:
```typescript
const name = getAllBusinessesRef.operationName;
console.log(name);
```

### Variables
The `GetAllBusinesses` query has an optional argument of type `GetAllBusinessesVariables`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetAllBusinessesVariables {
  status?: string | null;
}
```
### Return Type
Recall that executing the `GetAllBusinesses` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetAllBusinessesData`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetAllBusinesses`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getAllBusinesses, GetAllBusinessesVariables } from '@firebasegen/default-connector';

// The `GetAllBusinesses` query has an optional argument of type `GetAllBusinessesVariables`:
const getAllBusinessesVars: GetAllBusinessesVariables = {
  status: ..., // optional
};

// Call the `getAllBusinesses()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getAllBusinesses(getAllBusinessesVars);
// Variables can be defined inline as well.
const { data } = await getAllBusinesses({ status: ..., });
// Since all variables are optional for this query, you can omit the `GetAllBusinessesVariables` argument.
const { data } = await getAllBusinesses();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getAllBusinesses(dataConnect, getAllBusinessesVars);

console.log(data.businesses);

// Or, you can use the `Promise` API.
getAllBusinesses(getAllBusinessesVars).then((response) => {
  const data = response.data;
  console.log(data.businesses);
});
```

### Using `GetAllBusinesses`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getAllBusinessesRef, GetAllBusinessesVariables } from '@firebasegen/default-connector';

// The `GetAllBusinesses` query has an optional argument of type `GetAllBusinessesVariables`:
const getAllBusinessesVars: GetAllBusinessesVariables = {
  status: ..., // optional
};

// Call the `getAllBusinessesRef()` function to get a reference to the query.
const ref = getAllBusinessesRef(getAllBusinessesVars);
// Variables can be defined inline as well.
const ref = getAllBusinessesRef({ status: ..., });
// Since all variables are optional for this query, you can omit the `GetAllBusinessesVariables` argument.
const ref = getAllBusinessesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getAllBusinessesRef(dataConnect, getAllBusinessesVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.businesses);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.businesses);
});
```

## GetRegions
You can execute the `GetRegions` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [sdk/index.d.ts](./index.d.ts):
```typescript
getRegions(options?: ExecuteQueryOptions): QueryPromise<GetRegionsData, undefined>;

interface GetRegionsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetRegionsData, undefined>;
}
export const getRegionsRef: GetRegionsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getRegions(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetRegionsData, undefined>;

interface GetRegionsRef {
  ...
  (dc: DataConnect): QueryRef<GetRegionsData, undefined>;
}
export const getRegionsRef: GetRegionsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getRegionsRef:
```typescript
const name = getRegionsRef.operationName;
console.log(name);
```

### Variables
The `GetRegions` query has no variables.
### Return Type
Recall that executing the `GetRegions` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetRegionsData`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetRegionsData {
  regions: ({
    id: UUIDString;
    name: string;
    slug: string;
  } & Region_Key)[];
}
```
### Using `GetRegions`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getRegions } from '@firebasegen/default-connector';


// Call the `getRegions()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getRegions();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getRegions(dataConnect);

console.log(data.regions);

// Or, you can use the `Promise` API.
getRegions().then((response) => {
  const data = response.data;
  console.log(data.regions);
});
```

### Using `GetRegions`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getRegionsRef } from '@firebasegen/default-connector';


// Call the `getRegionsRef()` function to get a reference to the query.
const ref = getRegionsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getRegionsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.regions);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.regions);
});
```

## GetProvinces
You can execute the `GetProvinces` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [sdk/index.d.ts](./index.d.ts):
```typescript
getProvinces(vars?: GetProvincesVariables, options?: ExecuteQueryOptions): QueryPromise<GetProvincesData, GetProvincesVariables>;

interface GetProvincesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars?: GetProvincesVariables): QueryRef<GetProvincesData, GetProvincesVariables>;
}
export const getProvincesRef: GetProvincesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getProvinces(dc: DataConnect, vars?: GetProvincesVariables, options?: ExecuteQueryOptions): QueryPromise<GetProvincesData, GetProvincesVariables>;

interface GetProvincesRef {
  ...
  (dc: DataConnect, vars?: GetProvincesVariables): QueryRef<GetProvincesData, GetProvincesVariables>;
}
export const getProvincesRef: GetProvincesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getProvincesRef:
```typescript
const name = getProvincesRef.operationName;
console.log(name);
```

### Variables
The `GetProvinces` query has an optional argument of type `GetProvincesVariables`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetProvincesVariables {
  regionId?: UUIDString | null;
}
```
### Return Type
Recall that executing the `GetProvinces` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetProvincesData`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetProvincesData {
  provinces: ({
    id: UUIDString;
    name: string;
    slug: string;
    regionId: UUIDString;
  } & Province_Key)[];
}
```
### Using `GetProvinces`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getProvinces, GetProvincesVariables } from '@firebasegen/default-connector';

// The `GetProvinces` query has an optional argument of type `GetProvincesVariables`:
const getProvincesVars: GetProvincesVariables = {
  regionId: ..., // optional
};

// Call the `getProvinces()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getProvinces(getProvincesVars);
// Variables can be defined inline as well.
const { data } = await getProvinces({ regionId: ..., });
// Since all variables are optional for this query, you can omit the `GetProvincesVariables` argument.
const { data } = await getProvinces();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getProvinces(dataConnect, getProvincesVars);

console.log(data.provinces);

// Or, you can use the `Promise` API.
getProvinces(getProvincesVars).then((response) => {
  const data = response.data;
  console.log(data.provinces);
});
```

### Using `GetProvinces`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getProvincesRef, GetProvincesVariables } from '@firebasegen/default-connector';

// The `GetProvinces` query has an optional argument of type `GetProvincesVariables`:
const getProvincesVars: GetProvincesVariables = {
  regionId: ..., // optional
};

// Call the `getProvincesRef()` function to get a reference to the query.
const ref = getProvincesRef(getProvincesVars);
// Variables can be defined inline as well.
const ref = getProvincesRef({ regionId: ..., });
// Since all variables are optional for this query, you can omit the `GetProvincesVariables` argument.
const ref = getProvincesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getProvincesRef(dataConnect, getProvincesVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.provinces);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.provinces);
});
```

## GetCities
You can execute the `GetCities` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [sdk/index.d.ts](./index.d.ts):
```typescript
getCities(vars?: GetCitiesVariables, options?: ExecuteQueryOptions): QueryPromise<GetCitiesData, GetCitiesVariables>;

interface GetCitiesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars?: GetCitiesVariables): QueryRef<GetCitiesData, GetCitiesVariables>;
}
export const getCitiesRef: GetCitiesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getCities(dc: DataConnect, vars?: GetCitiesVariables, options?: ExecuteQueryOptions): QueryPromise<GetCitiesData, GetCitiesVariables>;

interface GetCitiesRef {
  ...
  (dc: DataConnect, vars?: GetCitiesVariables): QueryRef<GetCitiesData, GetCitiesVariables>;
}
export const getCitiesRef: GetCitiesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getCitiesRef:
```typescript
const name = getCitiesRef.operationName;
console.log(name);
```

### Variables
The `GetCities` query has an optional argument of type `GetCitiesVariables`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetCitiesVariables {
  provinceId?: UUIDString | null;
}
```
### Return Type
Recall that executing the `GetCities` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetCitiesData`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetCitiesData {
  cities: ({
    id: UUIDString;
    name: string;
    slug: string;
    provinceId: UUIDString;
  } & City_Key)[];
}
```
### Using `GetCities`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getCities, GetCitiesVariables } from '@firebasegen/default-connector';

// The `GetCities` query has an optional argument of type `GetCitiesVariables`:
const getCitiesVars: GetCitiesVariables = {
  provinceId: ..., // optional
};

// Call the `getCities()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getCities(getCitiesVars);
// Variables can be defined inline as well.
const { data } = await getCities({ provinceId: ..., });
// Since all variables are optional for this query, you can omit the `GetCitiesVariables` argument.
const { data } = await getCities();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getCities(dataConnect, getCitiesVars);

console.log(data.cities);

// Or, you can use the `Promise` API.
getCities(getCitiesVars).then((response) => {
  const data = response.data;
  console.log(data.cities);
});
```

### Using `GetCities`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getCitiesRef, GetCitiesVariables } from '@firebasegen/default-connector';

// The `GetCities` query has an optional argument of type `GetCitiesVariables`:
const getCitiesVars: GetCitiesVariables = {
  provinceId: ..., // optional
};

// Call the `getCitiesRef()` function to get a reference to the query.
const ref = getCitiesRef(getCitiesVars);
// Variables can be defined inline as well.
const ref = getCitiesRef({ provinceId: ..., });
// Since all variables are optional for this query, you can omit the `GetCitiesVariables` argument.
const ref = getCitiesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getCitiesRef(dataConnect, getCitiesVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.cities);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.cities);
});
```

## GetCategories
You can execute the `GetCategories` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [sdk/index.d.ts](./index.d.ts):
```typescript
getCategories(options?: ExecuteQueryOptions): QueryPromise<GetCategoriesData, undefined>;

interface GetCategoriesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetCategoriesData, undefined>;
}
export const getCategoriesRef: GetCategoriesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getCategories(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetCategoriesData, undefined>;

interface GetCategoriesRef {
  ...
  (dc: DataConnect): QueryRef<GetCategoriesData, undefined>;
}
export const getCategoriesRef: GetCategoriesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getCategoriesRef:
```typescript
const name = getCategoriesRef.operationName;
console.log(name);
```

### Variables
The `GetCategories` query has no variables.
### Return Type
Recall that executing the `GetCategories` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetCategoriesData`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetCategoriesData {
  categories: ({
    id: UUIDString;
    name: string;
    slug: string;
  } & Category_Key)[];
}
```
### Using `GetCategories`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getCategories } from '@firebasegen/default-connector';


// Call the `getCategories()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getCategories();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getCategories(dataConnect);

console.log(data.categories);

// Or, you can use the `Promise` API.
getCategories().then((response) => {
  const data = response.data;
  console.log(data.categories);
});
```

### Using `GetCategories`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getCategoriesRef } from '@firebasegen/default-connector';


// Call the `getCategoriesRef()` function to get a reference to the query.
const ref = getCategoriesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getCategoriesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.categories);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.categories);
});
```

## GetSubcategories
You can execute the `GetSubcategories` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [sdk/index.d.ts](./index.d.ts):
```typescript
getSubcategories(vars?: GetSubcategoriesVariables, options?: ExecuteQueryOptions): QueryPromise<GetSubcategoriesData, GetSubcategoriesVariables>;

interface GetSubcategoriesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars?: GetSubcategoriesVariables): QueryRef<GetSubcategoriesData, GetSubcategoriesVariables>;
}
export const getSubcategoriesRef: GetSubcategoriesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getSubcategories(dc: DataConnect, vars?: GetSubcategoriesVariables, options?: ExecuteQueryOptions): QueryPromise<GetSubcategoriesData, GetSubcategoriesVariables>;

interface GetSubcategoriesRef {
  ...
  (dc: DataConnect, vars?: GetSubcategoriesVariables): QueryRef<GetSubcategoriesData, GetSubcategoriesVariables>;
}
export const getSubcategoriesRef: GetSubcategoriesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getSubcategoriesRef:
```typescript
const name = getSubcategoriesRef.operationName;
console.log(name);
```

### Variables
The `GetSubcategories` query has an optional argument of type `GetSubcategoriesVariables`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetSubcategoriesVariables {
  categoryId?: UUIDString | null;
}
```
### Return Type
Recall that executing the `GetSubcategories` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetSubcategoriesData`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetSubcategoriesData {
  subcategories: ({
    id: UUIDString;
    name: string;
    slug: string;
    categoryId: UUIDString;
  } & Subcategory_Key)[];
}
```
### Using `GetSubcategories`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getSubcategories, GetSubcategoriesVariables } from '@firebasegen/default-connector';

// The `GetSubcategories` query has an optional argument of type `GetSubcategoriesVariables`:
const getSubcategoriesVars: GetSubcategoriesVariables = {
  categoryId: ..., // optional
};

// Call the `getSubcategories()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getSubcategories(getSubcategoriesVars);
// Variables can be defined inline as well.
const { data } = await getSubcategories({ categoryId: ..., });
// Since all variables are optional for this query, you can omit the `GetSubcategoriesVariables` argument.
const { data } = await getSubcategories();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getSubcategories(dataConnect, getSubcategoriesVars);

console.log(data.subcategories);

// Or, you can use the `Promise` API.
getSubcategories(getSubcategoriesVars).then((response) => {
  const data = response.data;
  console.log(data.subcategories);
});
```

### Using `GetSubcategories`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getSubcategoriesRef, GetSubcategoriesVariables } from '@firebasegen/default-connector';

// The `GetSubcategories` query has an optional argument of type `GetSubcategoriesVariables`:
const getSubcategoriesVars: GetSubcategoriesVariables = {
  categoryId: ..., // optional
};

// Call the `getSubcategoriesRef()` function to get a reference to the query.
const ref = getSubcategoriesRef(getSubcategoriesVars);
// Variables can be defined inline as well.
const ref = getSubcategoriesRef({ categoryId: ..., });
// Since all variables are optional for this query, you can omit the `GetSubcategoriesVariables` argument.
const ref = getSubcategoriesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getSubcategoriesRef(dataConnect, getSubcategoriesVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.subcategories);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.subcategories);
});
```

## GetUserById
You can execute the `GetUserById` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [sdk/index.d.ts](./index.d.ts):
```typescript
getUserById(vars: GetUserByIdVariables, options?: ExecuteQueryOptions): QueryPromise<GetUserByIdData, GetUserByIdVariables>;

interface GetUserByIdRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserByIdVariables): QueryRef<GetUserByIdData, GetUserByIdVariables>;
}
export const getUserByIdRef: GetUserByIdRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getUserById(dc: DataConnect, vars: GetUserByIdVariables, options?: ExecuteQueryOptions): QueryPromise<GetUserByIdData, GetUserByIdVariables>;

interface GetUserByIdRef {
  ...
  (dc: DataConnect, vars: GetUserByIdVariables): QueryRef<GetUserByIdData, GetUserByIdVariables>;
}
export const getUserByIdRef: GetUserByIdRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getUserByIdRef:
```typescript
const name = getUserByIdRef.operationName;
console.log(name);
```

### Variables
The `GetUserById` query requires an argument of type `GetUserByIdVariables`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetUserByIdVariables {
  id: string;
}
```
### Return Type
Recall that executing the `GetUserById` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetUserByIdData`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetUserById`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getUserById, GetUserByIdVariables } from '@firebasegen/default-connector';

// The `GetUserById` query requires an argument of type `GetUserByIdVariables`:
const getUserByIdVars: GetUserByIdVariables = {
  id: ..., 
};

// Call the `getUserById()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getUserById(getUserByIdVars);
// Variables can be defined inline as well.
const { data } = await getUserById({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getUserById(dataConnect, getUserByIdVars);

console.log(data.user);

// Or, you can use the `Promise` API.
getUserById(getUserByIdVars).then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

### Using `GetUserById`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getUserByIdRef, GetUserByIdVariables } from '@firebasegen/default-connector';

// The `GetUserById` query requires an argument of type `GetUserByIdVariables`:
const getUserByIdVars: GetUserByIdVariables = {
  id: ..., 
};

// Call the `getUserByIdRef()` function to get a reference to the query.
const ref = getUserByIdRef(getUserByIdVars);
// Variables can be defined inline as well.
const ref = getUserByIdRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getUserByIdRef(dataConnect, getUserByIdVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.user);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

## GetAllUsers
You can execute the `GetAllUsers` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [sdk/index.d.ts](./index.d.ts):
```typescript
getAllUsers(options?: ExecuteQueryOptions): QueryPromise<GetAllUsersData, undefined>;

interface GetAllUsersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetAllUsersData, undefined>;
}
export const getAllUsersRef: GetAllUsersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getAllUsers(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetAllUsersData, undefined>;

interface GetAllUsersRef {
  ...
  (dc: DataConnect): QueryRef<GetAllUsersData, undefined>;
}
export const getAllUsersRef: GetAllUsersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getAllUsersRef:
```typescript
const name = getAllUsersRef.operationName;
console.log(name);
```

### Variables
The `GetAllUsers` query has no variables.
### Return Type
Recall that executing the `GetAllUsers` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetAllUsersData`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetAllUsers`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getAllUsers } from '@firebasegen/default-connector';


// Call the `getAllUsers()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getAllUsers();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getAllUsers(dataConnect);

console.log(data.users);

// Or, you can use the `Promise` API.
getAllUsers().then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

### Using `GetAllUsers`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getAllUsersRef } from '@firebasegen/default-connector';


// Call the `getAllUsersRef()` function to get a reference to the query.
const ref = getAllUsersRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getAllUsersRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.users);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `default` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateUser
You can execute the `CreateUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [sdk/index.d.ts](./index.d.ts):
```typescript
createUser(vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface CreateUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
}
export const createUserRef: CreateUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createUser(dc: DataConnect, vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface CreateUserRef {
  ...
  (dc: DataConnect, vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
}
export const createUserRef: CreateUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createUserRef:
```typescript
const name = createUserRef.operationName;
console.log(name);
```

### Variables
The `CreateUser` mutation requires an argument of type `CreateUserVariables`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateUserVariables {
  id: string;
  email: string;
  displayName: string;
  photoUrl?: string | null;
  role: string;
}
```
### Return Type
Recall that executing the `CreateUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateUserData`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateUserData {
  user_insert: User_Key;
}
```
### Using `CreateUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createUser, CreateUserVariables } from '@firebasegen/default-connector';

// The `CreateUser` mutation requires an argument of type `CreateUserVariables`:
const createUserVars: CreateUserVariables = {
  id: ..., 
  email: ..., 
  displayName: ..., 
  photoUrl: ..., // optional
  role: ..., 
};

// Call the `createUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createUser(createUserVars);
// Variables can be defined inline as well.
const { data } = await createUser({ id: ..., email: ..., displayName: ..., photoUrl: ..., role: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createUser(dataConnect, createUserVars);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
createUser(createUserVars).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

### Using `CreateUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createUserRef, CreateUserVariables } from '@firebasegen/default-connector';

// The `CreateUser` mutation requires an argument of type `CreateUserVariables`:
const createUserVars: CreateUserVariables = {
  id: ..., 
  email: ..., 
  displayName: ..., 
  photoUrl: ..., // optional
  role: ..., 
};

// Call the `createUserRef()` function to get a reference to the mutation.
const ref = createUserRef(createUserVars);
// Variables can be defined inline as well.
const ref = createUserRef({ id: ..., email: ..., displayName: ..., photoUrl: ..., role: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createUserRef(dataConnect, createUserVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

## UpdateUserProfile
You can execute the `UpdateUserProfile` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [sdk/index.d.ts](./index.d.ts):
```typescript
updateUserProfile(vars: UpdateUserProfileVariables): MutationPromise<UpdateUserProfileData, UpdateUserProfileVariables>;

interface UpdateUserProfileRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateUserProfileVariables): MutationRef<UpdateUserProfileData, UpdateUserProfileVariables>;
}
export const updateUserProfileRef: UpdateUserProfileRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateUserProfile(dc: DataConnect, vars: UpdateUserProfileVariables): MutationPromise<UpdateUserProfileData, UpdateUserProfileVariables>;

interface UpdateUserProfileRef {
  ...
  (dc: DataConnect, vars: UpdateUserProfileVariables): MutationRef<UpdateUserProfileData, UpdateUserProfileVariables>;
}
export const updateUserProfileRef: UpdateUserProfileRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateUserProfileRef:
```typescript
const name = updateUserProfileRef.operationName;
console.log(name);
```

### Variables
The `UpdateUserProfile` mutation requires an argument of type `UpdateUserProfileVariables`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateUserProfileVariables {
  id: string;
  displayName: string;
  photoUrl?: string | null;
}
```
### Return Type
Recall that executing the `UpdateUserProfile` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateUserProfileData`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateUserProfileData {
  user_update?: User_Key | null;
}
```
### Using `UpdateUserProfile`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateUserProfile, UpdateUserProfileVariables } from '@firebasegen/default-connector';

// The `UpdateUserProfile` mutation requires an argument of type `UpdateUserProfileVariables`:
const updateUserProfileVars: UpdateUserProfileVariables = {
  id: ..., 
  displayName: ..., 
  photoUrl: ..., // optional
};

// Call the `updateUserProfile()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateUserProfile(updateUserProfileVars);
// Variables can be defined inline as well.
const { data } = await updateUserProfile({ id: ..., displayName: ..., photoUrl: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateUserProfile(dataConnect, updateUserProfileVars);

console.log(data.user_update);

// Or, you can use the `Promise` API.
updateUserProfile(updateUserProfileVars).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

### Using `UpdateUserProfile`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateUserProfileRef, UpdateUserProfileVariables } from '@firebasegen/default-connector';

// The `UpdateUserProfile` mutation requires an argument of type `UpdateUserProfileVariables`:
const updateUserProfileVars: UpdateUserProfileVariables = {
  id: ..., 
  displayName: ..., 
  photoUrl: ..., // optional
};

// Call the `updateUserProfileRef()` function to get a reference to the mutation.
const ref = updateUserProfileRef(updateUserProfileVars);
// Variables can be defined inline as well.
const ref = updateUserProfileRef({ id: ..., displayName: ..., photoUrl: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateUserProfileRef(dataConnect, updateUserProfileVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

## CreateBusiness
You can execute the `CreateBusiness` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [sdk/index.d.ts](./index.d.ts):
```typescript
createBusiness(vars: CreateBusinessVariables): MutationPromise<CreateBusinessData, CreateBusinessVariables>;

interface CreateBusinessRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateBusinessVariables): MutationRef<CreateBusinessData, CreateBusinessVariables>;
}
export const createBusinessRef: CreateBusinessRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createBusiness(dc: DataConnect, vars: CreateBusinessVariables): MutationPromise<CreateBusinessData, CreateBusinessVariables>;

interface CreateBusinessRef {
  ...
  (dc: DataConnect, vars: CreateBusinessVariables): MutationRef<CreateBusinessData, CreateBusinessVariables>;
}
export const createBusinessRef: CreateBusinessRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createBusinessRef:
```typescript
const name = createBusinessRef.operationName;
console.log(name);
```

### Variables
The `CreateBusiness` mutation requires an argument of type `CreateBusinessVariables`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `CreateBusiness` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateBusinessData`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateBusinessData {
  business_insert: Business_Key;
}
```
### Using `CreateBusiness`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createBusiness, CreateBusinessVariables } from '@firebasegen/default-connector';

// The `CreateBusiness` mutation requires an argument of type `CreateBusinessVariables`:
const createBusinessVars: CreateBusinessVariables = {
  ownerId: ..., 
  name: ..., 
  slug: ..., 
  description: ..., 
  categoryId: ..., 
  subcategoryId: ..., // optional
  addressLine1: ..., 
  cityId: ..., 
  provinceId: ..., 
  regionId: ..., 
  barangayId: ..., // optional
};

// Call the `createBusiness()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createBusiness(createBusinessVars);
// Variables can be defined inline as well.
const { data } = await createBusiness({ ownerId: ..., name: ..., slug: ..., description: ..., categoryId: ..., subcategoryId: ..., addressLine1: ..., cityId: ..., provinceId: ..., regionId: ..., barangayId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createBusiness(dataConnect, createBusinessVars);

console.log(data.business_insert);

// Or, you can use the `Promise` API.
createBusiness(createBusinessVars).then((response) => {
  const data = response.data;
  console.log(data.business_insert);
});
```

### Using `CreateBusiness`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createBusinessRef, CreateBusinessVariables } from '@firebasegen/default-connector';

// The `CreateBusiness` mutation requires an argument of type `CreateBusinessVariables`:
const createBusinessVars: CreateBusinessVariables = {
  ownerId: ..., 
  name: ..., 
  slug: ..., 
  description: ..., 
  categoryId: ..., 
  subcategoryId: ..., // optional
  addressLine1: ..., 
  cityId: ..., 
  provinceId: ..., 
  regionId: ..., 
  barangayId: ..., // optional
};

// Call the `createBusinessRef()` function to get a reference to the mutation.
const ref = createBusinessRef(createBusinessVars);
// Variables can be defined inline as well.
const ref = createBusinessRef({ ownerId: ..., name: ..., slug: ..., description: ..., categoryId: ..., subcategoryId: ..., addressLine1: ..., cityId: ..., provinceId: ..., regionId: ..., barangayId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createBusinessRef(dataConnect, createBusinessVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.business_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.business_insert);
});
```

## UpdateBusiness
You can execute the `UpdateBusiness` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [sdk/index.d.ts](./index.d.ts):
```typescript
updateBusiness(vars: UpdateBusinessVariables): MutationPromise<UpdateBusinessData, UpdateBusinessVariables>;

interface UpdateBusinessRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateBusinessVariables): MutationRef<UpdateBusinessData, UpdateBusinessVariables>;
}
export const updateBusinessRef: UpdateBusinessRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateBusiness(dc: DataConnect, vars: UpdateBusinessVariables): MutationPromise<UpdateBusinessData, UpdateBusinessVariables>;

interface UpdateBusinessRef {
  ...
  (dc: DataConnect, vars: UpdateBusinessVariables): MutationRef<UpdateBusinessData, UpdateBusinessVariables>;
}
export const updateBusinessRef: UpdateBusinessRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateBusinessRef:
```typescript
const name = updateBusinessRef.operationName;
console.log(name);
```

### Variables
The `UpdateBusiness` mutation requires an argument of type `UpdateBusinessVariables`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateBusinessVariables {
  id: UUIDString;
  name: string;
  description: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  websiteUrl?: string | null;
}
```
### Return Type
Recall that executing the `UpdateBusiness` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateBusinessData`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateBusinessData {
  business_update?: Business_Key | null;
}
```
### Using `UpdateBusiness`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateBusiness, UpdateBusinessVariables } from '@firebasegen/default-connector';

// The `UpdateBusiness` mutation requires an argument of type `UpdateBusinessVariables`:
const updateBusinessVars: UpdateBusinessVariables = {
  id: ..., 
  name: ..., 
  description: ..., 
  contactEmail: ..., // optional
  contactPhone: ..., // optional
  websiteUrl: ..., // optional
};

// Call the `updateBusiness()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateBusiness(updateBusinessVars);
// Variables can be defined inline as well.
const { data } = await updateBusiness({ id: ..., name: ..., description: ..., contactEmail: ..., contactPhone: ..., websiteUrl: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateBusiness(dataConnect, updateBusinessVars);

console.log(data.business_update);

// Or, you can use the `Promise` API.
updateBusiness(updateBusinessVars).then((response) => {
  const data = response.data;
  console.log(data.business_update);
});
```

### Using `UpdateBusiness`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateBusinessRef, UpdateBusinessVariables } from '@firebasegen/default-connector';

// The `UpdateBusiness` mutation requires an argument of type `UpdateBusinessVariables`:
const updateBusinessVars: UpdateBusinessVariables = {
  id: ..., 
  name: ..., 
  description: ..., 
  contactEmail: ..., // optional
  contactPhone: ..., // optional
  websiteUrl: ..., // optional
};

// Call the `updateBusinessRef()` function to get a reference to the mutation.
const ref = updateBusinessRef(updateBusinessVars);
// Variables can be defined inline as well.
const ref = updateBusinessRef({ id: ..., name: ..., description: ..., contactEmail: ..., contactPhone: ..., websiteUrl: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateBusinessRef(dataConnect, updateBusinessVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.business_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.business_update);
});
```

## SubmitBusiness
You can execute the `SubmitBusiness` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [sdk/index.d.ts](./index.d.ts):
```typescript
submitBusiness(vars: SubmitBusinessVariables): MutationPromise<SubmitBusinessData, SubmitBusinessVariables>;

interface SubmitBusinessRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: SubmitBusinessVariables): MutationRef<SubmitBusinessData, SubmitBusinessVariables>;
}
export const submitBusinessRef: SubmitBusinessRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
submitBusiness(dc: DataConnect, vars: SubmitBusinessVariables): MutationPromise<SubmitBusinessData, SubmitBusinessVariables>;

interface SubmitBusinessRef {
  ...
  (dc: DataConnect, vars: SubmitBusinessVariables): MutationRef<SubmitBusinessData, SubmitBusinessVariables>;
}
export const submitBusinessRef: SubmitBusinessRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the submitBusinessRef:
```typescript
const name = submitBusinessRef.operationName;
console.log(name);
```

### Variables
The `SubmitBusiness` mutation requires an argument of type `SubmitBusinessVariables`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface SubmitBusinessVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `SubmitBusiness` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `SubmitBusinessData`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface SubmitBusinessData {
  business_update?: Business_Key | null;
}
```
### Using `SubmitBusiness`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, submitBusiness, SubmitBusinessVariables } from '@firebasegen/default-connector';

// The `SubmitBusiness` mutation requires an argument of type `SubmitBusinessVariables`:
const submitBusinessVars: SubmitBusinessVariables = {
  id: ..., 
};

// Call the `submitBusiness()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await submitBusiness(submitBusinessVars);
// Variables can be defined inline as well.
const { data } = await submitBusiness({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await submitBusiness(dataConnect, submitBusinessVars);

console.log(data.business_update);

// Or, you can use the `Promise` API.
submitBusiness(submitBusinessVars).then((response) => {
  const data = response.data;
  console.log(data.business_update);
});
```

### Using `SubmitBusiness`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, submitBusinessRef, SubmitBusinessVariables } from '@firebasegen/default-connector';

// The `SubmitBusiness` mutation requires an argument of type `SubmitBusinessVariables`:
const submitBusinessVars: SubmitBusinessVariables = {
  id: ..., 
};

// Call the `submitBusinessRef()` function to get a reference to the mutation.
const ref = submitBusinessRef(submitBusinessVars);
// Variables can be defined inline as well.
const ref = submitBusinessRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = submitBusinessRef(dataConnect, submitBusinessVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.business_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.business_update);
});
```

## ApproveBusiness
You can execute the `ApproveBusiness` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [sdk/index.d.ts](./index.d.ts):
```typescript
approveBusiness(vars: ApproveBusinessVariables): MutationPromise<ApproveBusinessData, ApproveBusinessVariables>;

interface ApproveBusinessRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ApproveBusinessVariables): MutationRef<ApproveBusinessData, ApproveBusinessVariables>;
}
export const approveBusinessRef: ApproveBusinessRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
approveBusiness(dc: DataConnect, vars: ApproveBusinessVariables): MutationPromise<ApproveBusinessData, ApproveBusinessVariables>;

interface ApproveBusinessRef {
  ...
  (dc: DataConnect, vars: ApproveBusinessVariables): MutationRef<ApproveBusinessData, ApproveBusinessVariables>;
}
export const approveBusinessRef: ApproveBusinessRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the approveBusinessRef:
```typescript
const name = approveBusinessRef.operationName;
console.log(name);
```

### Variables
The `ApproveBusiness` mutation requires an argument of type `ApproveBusinessVariables`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ApproveBusinessVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `ApproveBusiness` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ApproveBusinessData`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ApproveBusinessData {
  business_update?: Business_Key | null;
}
```
### Using `ApproveBusiness`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, approveBusiness, ApproveBusinessVariables } from '@firebasegen/default-connector';

// The `ApproveBusiness` mutation requires an argument of type `ApproveBusinessVariables`:
const approveBusinessVars: ApproveBusinessVariables = {
  id: ..., 
};

// Call the `approveBusiness()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await approveBusiness(approveBusinessVars);
// Variables can be defined inline as well.
const { data } = await approveBusiness({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await approveBusiness(dataConnect, approveBusinessVars);

console.log(data.business_update);

// Or, you can use the `Promise` API.
approveBusiness(approveBusinessVars).then((response) => {
  const data = response.data;
  console.log(data.business_update);
});
```

### Using `ApproveBusiness`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, approveBusinessRef, ApproveBusinessVariables } from '@firebasegen/default-connector';

// The `ApproveBusiness` mutation requires an argument of type `ApproveBusinessVariables`:
const approveBusinessVars: ApproveBusinessVariables = {
  id: ..., 
};

// Call the `approveBusinessRef()` function to get a reference to the mutation.
const ref = approveBusinessRef(approveBusinessVars);
// Variables can be defined inline as well.
const ref = approveBusinessRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = approveBusinessRef(dataConnect, approveBusinessVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.business_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.business_update);
});
```

## RejectBusiness
You can execute the `RejectBusiness` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [sdk/index.d.ts](./index.d.ts):
```typescript
rejectBusiness(vars: RejectBusinessVariables): MutationPromise<RejectBusinessData, RejectBusinessVariables>;

interface RejectBusinessRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: RejectBusinessVariables): MutationRef<RejectBusinessData, RejectBusinessVariables>;
}
export const rejectBusinessRef: RejectBusinessRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
rejectBusiness(dc: DataConnect, vars: RejectBusinessVariables): MutationPromise<RejectBusinessData, RejectBusinessVariables>;

interface RejectBusinessRef {
  ...
  (dc: DataConnect, vars: RejectBusinessVariables): MutationRef<RejectBusinessData, RejectBusinessVariables>;
}
export const rejectBusinessRef: RejectBusinessRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the rejectBusinessRef:
```typescript
const name = rejectBusinessRef.operationName;
console.log(name);
```

### Variables
The `RejectBusiness` mutation requires an argument of type `RejectBusinessVariables`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface RejectBusinessVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `RejectBusiness` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `RejectBusinessData`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface RejectBusinessData {
  business_update?: Business_Key | null;
}
```
### Using `RejectBusiness`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, rejectBusiness, RejectBusinessVariables } from '@firebasegen/default-connector';

// The `RejectBusiness` mutation requires an argument of type `RejectBusinessVariables`:
const rejectBusinessVars: RejectBusinessVariables = {
  id: ..., 
};

// Call the `rejectBusiness()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await rejectBusiness(rejectBusinessVars);
// Variables can be defined inline as well.
const { data } = await rejectBusiness({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await rejectBusiness(dataConnect, rejectBusinessVars);

console.log(data.business_update);

// Or, you can use the `Promise` API.
rejectBusiness(rejectBusinessVars).then((response) => {
  const data = response.data;
  console.log(data.business_update);
});
```

### Using `RejectBusiness`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, rejectBusinessRef, RejectBusinessVariables } from '@firebasegen/default-connector';

// The `RejectBusiness` mutation requires an argument of type `RejectBusinessVariables`:
const rejectBusinessVars: RejectBusinessVariables = {
  id: ..., 
};

// Call the `rejectBusinessRef()` function to get a reference to the mutation.
const ref = rejectBusinessRef(rejectBusinessVars);
// Variables can be defined inline as well.
const ref = rejectBusinessRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = rejectBusinessRef(dataConnect, rejectBusinessVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.business_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.business_update);
});
```

## SaveBusiness
You can execute the `SaveBusiness` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [sdk/index.d.ts](./index.d.ts):
```typescript
saveBusiness(vars: SaveBusinessVariables): MutationPromise<SaveBusinessData, SaveBusinessVariables>;

interface SaveBusinessRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: SaveBusinessVariables): MutationRef<SaveBusinessData, SaveBusinessVariables>;
}
export const saveBusinessRef: SaveBusinessRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
saveBusiness(dc: DataConnect, vars: SaveBusinessVariables): MutationPromise<SaveBusinessData, SaveBusinessVariables>;

interface SaveBusinessRef {
  ...
  (dc: DataConnect, vars: SaveBusinessVariables): MutationRef<SaveBusinessData, SaveBusinessVariables>;
}
export const saveBusinessRef: SaveBusinessRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the saveBusinessRef:
```typescript
const name = saveBusinessRef.operationName;
console.log(name);
```

### Variables
The `SaveBusiness` mutation requires an argument of type `SaveBusinessVariables`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface SaveBusinessVariables {
  userId: string;
  businessId: UUIDString;
}
```
### Return Type
Recall that executing the `SaveBusiness` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `SaveBusinessData`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface SaveBusinessData {
  savedBusiness_insert: SavedBusiness_Key;
}
```
### Using `SaveBusiness`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, saveBusiness, SaveBusinessVariables } from '@firebasegen/default-connector';

// The `SaveBusiness` mutation requires an argument of type `SaveBusinessVariables`:
const saveBusinessVars: SaveBusinessVariables = {
  userId: ..., 
  businessId: ..., 
};

// Call the `saveBusiness()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await saveBusiness(saveBusinessVars);
// Variables can be defined inline as well.
const { data } = await saveBusiness({ userId: ..., businessId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await saveBusiness(dataConnect, saveBusinessVars);

console.log(data.savedBusiness_insert);

// Or, you can use the `Promise` API.
saveBusiness(saveBusinessVars).then((response) => {
  const data = response.data;
  console.log(data.savedBusiness_insert);
});
```

### Using `SaveBusiness`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, saveBusinessRef, SaveBusinessVariables } from '@firebasegen/default-connector';

// The `SaveBusiness` mutation requires an argument of type `SaveBusinessVariables`:
const saveBusinessVars: SaveBusinessVariables = {
  userId: ..., 
  businessId: ..., 
};

// Call the `saveBusinessRef()` function to get a reference to the mutation.
const ref = saveBusinessRef(saveBusinessVars);
// Variables can be defined inline as well.
const ref = saveBusinessRef({ userId: ..., businessId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = saveBusinessRef(dataConnect, saveBusinessVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.savedBusiness_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.savedBusiness_insert);
});
```

## UpsertRegion
You can execute the `UpsertRegion` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [sdk/index.d.ts](./index.d.ts):
```typescript
upsertRegion(vars: UpsertRegionVariables): MutationPromise<UpsertRegionData, UpsertRegionVariables>;

interface UpsertRegionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertRegionVariables): MutationRef<UpsertRegionData, UpsertRegionVariables>;
}
export const upsertRegionRef: UpsertRegionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
upsertRegion(dc: DataConnect, vars: UpsertRegionVariables): MutationPromise<UpsertRegionData, UpsertRegionVariables>;

interface UpsertRegionRef {
  ...
  (dc: DataConnect, vars: UpsertRegionVariables): MutationRef<UpsertRegionData, UpsertRegionVariables>;
}
export const upsertRegionRef: UpsertRegionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the upsertRegionRef:
```typescript
const name = upsertRegionRef.operationName;
console.log(name);
```

### Variables
The `UpsertRegion` mutation requires an argument of type `UpsertRegionVariables`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpsertRegionVariables {
  name: string;
  slug: string;
}
```
### Return Type
Recall that executing the `UpsertRegion` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpsertRegionData`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpsertRegionData {
  region_insert: Region_Key;
}
```
### Using `UpsertRegion`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertRegion, UpsertRegionVariables } from '@firebasegen/default-connector';

// The `UpsertRegion` mutation requires an argument of type `UpsertRegionVariables`:
const upsertRegionVars: UpsertRegionVariables = {
  name: ..., 
  slug: ..., 
};

// Call the `upsertRegion()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertRegion(upsertRegionVars);
// Variables can be defined inline as well.
const { data } = await upsertRegion({ name: ..., slug: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upsertRegion(dataConnect, upsertRegionVars);

console.log(data.region_insert);

// Or, you can use the `Promise` API.
upsertRegion(upsertRegionVars).then((response) => {
  const data = response.data;
  console.log(data.region_insert);
});
```

### Using `UpsertRegion`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upsertRegionRef, UpsertRegionVariables } from '@firebasegen/default-connector';

// The `UpsertRegion` mutation requires an argument of type `UpsertRegionVariables`:
const upsertRegionVars: UpsertRegionVariables = {
  name: ..., 
  slug: ..., 
};

// Call the `upsertRegionRef()` function to get a reference to the mutation.
const ref = upsertRegionRef(upsertRegionVars);
// Variables can be defined inline as well.
const ref = upsertRegionRef({ name: ..., slug: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upsertRegionRef(dataConnect, upsertRegionVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.region_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.region_insert);
});
```

## UpsertProvince
You can execute the `UpsertProvince` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [sdk/index.d.ts](./index.d.ts):
```typescript
upsertProvince(vars: UpsertProvinceVariables): MutationPromise<UpsertProvinceData, UpsertProvinceVariables>;

interface UpsertProvinceRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertProvinceVariables): MutationRef<UpsertProvinceData, UpsertProvinceVariables>;
}
export const upsertProvinceRef: UpsertProvinceRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
upsertProvince(dc: DataConnect, vars: UpsertProvinceVariables): MutationPromise<UpsertProvinceData, UpsertProvinceVariables>;

interface UpsertProvinceRef {
  ...
  (dc: DataConnect, vars: UpsertProvinceVariables): MutationRef<UpsertProvinceData, UpsertProvinceVariables>;
}
export const upsertProvinceRef: UpsertProvinceRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the upsertProvinceRef:
```typescript
const name = upsertProvinceRef.operationName;
console.log(name);
```

### Variables
The `UpsertProvince` mutation requires an argument of type `UpsertProvinceVariables`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpsertProvinceVariables {
  name: string;
  slug: string;
  regionId: UUIDString;
}
```
### Return Type
Recall that executing the `UpsertProvince` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpsertProvinceData`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpsertProvinceData {
  province_insert: Province_Key;
}
```
### Using `UpsertProvince`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertProvince, UpsertProvinceVariables } from '@firebasegen/default-connector';

// The `UpsertProvince` mutation requires an argument of type `UpsertProvinceVariables`:
const upsertProvinceVars: UpsertProvinceVariables = {
  name: ..., 
  slug: ..., 
  regionId: ..., 
};

// Call the `upsertProvince()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertProvince(upsertProvinceVars);
// Variables can be defined inline as well.
const { data } = await upsertProvince({ name: ..., slug: ..., regionId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upsertProvince(dataConnect, upsertProvinceVars);

console.log(data.province_insert);

// Or, you can use the `Promise` API.
upsertProvince(upsertProvinceVars).then((response) => {
  const data = response.data;
  console.log(data.province_insert);
});
```

### Using `UpsertProvince`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upsertProvinceRef, UpsertProvinceVariables } from '@firebasegen/default-connector';

// The `UpsertProvince` mutation requires an argument of type `UpsertProvinceVariables`:
const upsertProvinceVars: UpsertProvinceVariables = {
  name: ..., 
  slug: ..., 
  regionId: ..., 
};

// Call the `upsertProvinceRef()` function to get a reference to the mutation.
const ref = upsertProvinceRef(upsertProvinceVars);
// Variables can be defined inline as well.
const ref = upsertProvinceRef({ name: ..., slug: ..., regionId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upsertProvinceRef(dataConnect, upsertProvinceVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.province_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.province_insert);
});
```

## UpsertCity
You can execute the `UpsertCity` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [sdk/index.d.ts](./index.d.ts):
```typescript
upsertCity(vars: UpsertCityVariables): MutationPromise<UpsertCityData, UpsertCityVariables>;

interface UpsertCityRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertCityVariables): MutationRef<UpsertCityData, UpsertCityVariables>;
}
export const upsertCityRef: UpsertCityRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
upsertCity(dc: DataConnect, vars: UpsertCityVariables): MutationPromise<UpsertCityData, UpsertCityVariables>;

interface UpsertCityRef {
  ...
  (dc: DataConnect, vars: UpsertCityVariables): MutationRef<UpsertCityData, UpsertCityVariables>;
}
export const upsertCityRef: UpsertCityRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the upsertCityRef:
```typescript
const name = upsertCityRef.operationName;
console.log(name);
```

### Variables
The `UpsertCity` mutation requires an argument of type `UpsertCityVariables`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpsertCityVariables {
  name: string;
  slug: string;
  provinceId: UUIDString;
}
```
### Return Type
Recall that executing the `UpsertCity` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpsertCityData`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpsertCityData {
  city_insert: City_Key;
}
```
### Using `UpsertCity`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertCity, UpsertCityVariables } from '@firebasegen/default-connector';

// The `UpsertCity` mutation requires an argument of type `UpsertCityVariables`:
const upsertCityVars: UpsertCityVariables = {
  name: ..., 
  slug: ..., 
  provinceId: ..., 
};

// Call the `upsertCity()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertCity(upsertCityVars);
// Variables can be defined inline as well.
const { data } = await upsertCity({ name: ..., slug: ..., provinceId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upsertCity(dataConnect, upsertCityVars);

console.log(data.city_insert);

// Or, you can use the `Promise` API.
upsertCity(upsertCityVars).then((response) => {
  const data = response.data;
  console.log(data.city_insert);
});
```

### Using `UpsertCity`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upsertCityRef, UpsertCityVariables } from '@firebasegen/default-connector';

// The `UpsertCity` mutation requires an argument of type `UpsertCityVariables`:
const upsertCityVars: UpsertCityVariables = {
  name: ..., 
  slug: ..., 
  provinceId: ..., 
};

// Call the `upsertCityRef()` function to get a reference to the mutation.
const ref = upsertCityRef(upsertCityVars);
// Variables can be defined inline as well.
const ref = upsertCityRef({ name: ..., slug: ..., provinceId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upsertCityRef(dataConnect, upsertCityVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.city_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.city_insert);
});
```

## UpsertCategory
You can execute the `UpsertCategory` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [sdk/index.d.ts](./index.d.ts):
```typescript
upsertCategory(vars: UpsertCategoryVariables): MutationPromise<UpsertCategoryData, UpsertCategoryVariables>;

interface UpsertCategoryRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertCategoryVariables): MutationRef<UpsertCategoryData, UpsertCategoryVariables>;
}
export const upsertCategoryRef: UpsertCategoryRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
upsertCategory(dc: DataConnect, vars: UpsertCategoryVariables): MutationPromise<UpsertCategoryData, UpsertCategoryVariables>;

interface UpsertCategoryRef {
  ...
  (dc: DataConnect, vars: UpsertCategoryVariables): MutationRef<UpsertCategoryData, UpsertCategoryVariables>;
}
export const upsertCategoryRef: UpsertCategoryRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the upsertCategoryRef:
```typescript
const name = upsertCategoryRef.operationName;
console.log(name);
```

### Variables
The `UpsertCategory` mutation requires an argument of type `UpsertCategoryVariables`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpsertCategoryVariables {
  name: string;
  slug: string;
}
```
### Return Type
Recall that executing the `UpsertCategory` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpsertCategoryData`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpsertCategoryData {
  category_insert: Category_Key;
}
```
### Using `UpsertCategory`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertCategory, UpsertCategoryVariables } from '@firebasegen/default-connector';

// The `UpsertCategory` mutation requires an argument of type `UpsertCategoryVariables`:
const upsertCategoryVars: UpsertCategoryVariables = {
  name: ..., 
  slug: ..., 
};

// Call the `upsertCategory()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertCategory(upsertCategoryVars);
// Variables can be defined inline as well.
const { data } = await upsertCategory({ name: ..., slug: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upsertCategory(dataConnect, upsertCategoryVars);

console.log(data.category_insert);

// Or, you can use the `Promise` API.
upsertCategory(upsertCategoryVars).then((response) => {
  const data = response.data;
  console.log(data.category_insert);
});
```

### Using `UpsertCategory`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upsertCategoryRef, UpsertCategoryVariables } from '@firebasegen/default-connector';

// The `UpsertCategory` mutation requires an argument of type `UpsertCategoryVariables`:
const upsertCategoryVars: UpsertCategoryVariables = {
  name: ..., 
  slug: ..., 
};

// Call the `upsertCategoryRef()` function to get a reference to the mutation.
const ref = upsertCategoryRef(upsertCategoryVars);
// Variables can be defined inline as well.
const ref = upsertCategoryRef({ name: ..., slug: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upsertCategoryRef(dataConnect, upsertCategoryVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.category_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.category_insert);
});
```

## UpsertSubcategory
You can execute the `UpsertSubcategory` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [sdk/index.d.ts](./index.d.ts):
```typescript
upsertSubcategory(vars: UpsertSubcategoryVariables): MutationPromise<UpsertSubcategoryData, UpsertSubcategoryVariables>;

interface UpsertSubcategoryRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertSubcategoryVariables): MutationRef<UpsertSubcategoryData, UpsertSubcategoryVariables>;
}
export const upsertSubcategoryRef: UpsertSubcategoryRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
upsertSubcategory(dc: DataConnect, vars: UpsertSubcategoryVariables): MutationPromise<UpsertSubcategoryData, UpsertSubcategoryVariables>;

interface UpsertSubcategoryRef {
  ...
  (dc: DataConnect, vars: UpsertSubcategoryVariables): MutationRef<UpsertSubcategoryData, UpsertSubcategoryVariables>;
}
export const upsertSubcategoryRef: UpsertSubcategoryRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the upsertSubcategoryRef:
```typescript
const name = upsertSubcategoryRef.operationName;
console.log(name);
```

### Variables
The `UpsertSubcategory` mutation requires an argument of type `UpsertSubcategoryVariables`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpsertSubcategoryVariables {
  name: string;
  slug: string;
  categoryId: UUIDString;
}
```
### Return Type
Recall that executing the `UpsertSubcategory` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpsertSubcategoryData`, which is defined in [sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpsertSubcategoryData {
  subcategory_insert: Subcategory_Key;
}
```
### Using `UpsertSubcategory`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertSubcategory, UpsertSubcategoryVariables } from '@firebasegen/default-connector';

// The `UpsertSubcategory` mutation requires an argument of type `UpsertSubcategoryVariables`:
const upsertSubcategoryVars: UpsertSubcategoryVariables = {
  name: ..., 
  slug: ..., 
  categoryId: ..., 
};

// Call the `upsertSubcategory()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertSubcategory(upsertSubcategoryVars);
// Variables can be defined inline as well.
const { data } = await upsertSubcategory({ name: ..., slug: ..., categoryId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upsertSubcategory(dataConnect, upsertSubcategoryVars);

console.log(data.subcategory_insert);

// Or, you can use the `Promise` API.
upsertSubcategory(upsertSubcategoryVars).then((response) => {
  const data = response.data;
  console.log(data.subcategory_insert);
});
```

### Using `UpsertSubcategory`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upsertSubcategoryRef, UpsertSubcategoryVariables } from '@firebasegen/default-connector';

// The `UpsertSubcategory` mutation requires an argument of type `UpsertSubcategoryVariables`:
const upsertSubcategoryVars: UpsertSubcategoryVariables = {
  name: ..., 
  slug: ..., 
  categoryId: ..., 
};

// Call the `upsertSubcategoryRef()` function to get a reference to the mutation.
const ref = upsertSubcategoryRef(upsertSubcategoryVars);
// Variables can be defined inline as well.
const ref = upsertSubcategoryRef({ name: ..., slug: ..., categoryId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upsertSubcategoryRef(dataConnect, upsertSubcategoryVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.subcategory_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.subcategory_insert);
});
```

