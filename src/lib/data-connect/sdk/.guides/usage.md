# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { createUser, updateUserProfile, createBusiness, updateBusiness, submitBusiness, approveBusiness, rejectBusiness, saveBusiness, upsertRegion, upsertProvince } from '@firebasegen/default-connector';


// Operation CreateUser:  For variables, look at type CreateUserVars in ../index.d.ts
const { data } = await CreateUser(dataConnect, createUserVars);

// Operation UpdateUserProfile:  For variables, look at type UpdateUserProfileVars in ../index.d.ts
const { data } = await UpdateUserProfile(dataConnect, updateUserProfileVars);

// Operation CreateBusiness:  For variables, look at type CreateBusinessVars in ../index.d.ts
const { data } = await CreateBusiness(dataConnect, createBusinessVars);

// Operation UpdateBusiness:  For variables, look at type UpdateBusinessVars in ../index.d.ts
const { data } = await UpdateBusiness(dataConnect, updateBusinessVars);

// Operation SubmitBusiness:  For variables, look at type SubmitBusinessVars in ../index.d.ts
const { data } = await SubmitBusiness(dataConnect, submitBusinessVars);

// Operation ApproveBusiness:  For variables, look at type ApproveBusinessVars in ../index.d.ts
const { data } = await ApproveBusiness(dataConnect, approveBusinessVars);

// Operation RejectBusiness:  For variables, look at type RejectBusinessVars in ../index.d.ts
const { data } = await RejectBusiness(dataConnect, rejectBusinessVars);

// Operation SaveBusiness:  For variables, look at type SaveBusinessVars in ../index.d.ts
const { data } = await SaveBusiness(dataConnect, saveBusinessVars);

// Operation UpsertRegion:  For variables, look at type UpsertRegionVars in ../index.d.ts
const { data } = await UpsertRegion(dataConnect, upsertRegionVars);

// Operation UpsertProvince:  For variables, look at type UpsertProvinceVars in ../index.d.ts
const { data } = await UpsertProvince(dataConnect, upsertProvinceVars);


```