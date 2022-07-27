# People

`breeze-chms` provides convenient access to **[Breeze's People API](https://app.breezechms.com/api#people)**. You can use these methods to create, read, update, and delete people in your Breeze database.

These primary methods for the people collection have been slightly modified from the way they're documented on the Breeze website. They aim to provide you with an easier way to get people documents in a desired format. It does this by internally making a comparison with user-defined profile fields automatically.

These functions should work for 98% of use-cases—the only downside is that user-defined fields that you're retreiving or updating must be unique across your entire organization/account. Othwerwise, unexpected behavior might occur.

The [Breeze-native](#native-breeze-api) functions are still available if you have a special need for them, but try the ones immediately below first.

- [`people.get()`](#peopleget)
- [`people.list()`](#peoplelist)
- [`people.update()`](#peopleupdate)
- [`people.add()`](#peopleadd)
- [`people.delete()`](#peopledelete)
- [`people.profileFields()`](#peopleprofilefields)

<br/>

## `people.get()`

Get individual person record in your Breeze database with profile fields formatted and merged in. Some commonly-used predefined fields are included by default, but you can also define a list of your own to find and return with the results. Check out the `Sample response` below to see how the result is formatted and which fields are included by default.

A few extra notes:

- If a field can not be found or is empty, the value is set to null
- Fields you define are loosely matched (ignores spaces, special characters, and capitalization). So for example, a field you want returned as `1stGradeTeacher` it would match a the custom profile field you have defined in Breeze named `1st-grade teacher`.
- All dates are returned in ISO format _(Ex. `YYYY-MM-DD` or `2000-01-30`)_
- Checkbox fields with multiple values are returned as a single string separated by an interpunct. _(Ex. `Value1 · Value2`)_

<details>
<summary>Parameters:</summary>

| Option | Description                                                                   | Default                          |
| ------ | ----------------------------------------------------------------------------- | -------------------------------- |
| fields | An array of user-defined profile fields to lookup and include with the result | `[]` (no&nbsp;extra&nbsp;fields) |

</details>

### Example:

```js
const person = await breeze.people.get('PERSON_ID', { fields: ['service', 'roomNumber'] });
```

<details>
<summary>Sample response:</summary>

```json
{
  "id": "PERSON_ID",
  "img": "https://files.breezechms.com/img/profiles/upload/FILE_ID.jpg",
  "name": {
    "first": "William",
    "last": "Frost",
    "nick": "Bill",
    "middle": null,
    "maiden": null
  },
  "phones": [
    {
      "type": "home",
      "number": "(111) 111-1111",
      "private": false,
      "disableText": false
    },
    {
      "type": "mobile",
      "number": "(222) 222-2222",
      "private": false,
      "disableText": false
    },
    {
      "type": "work",
      "number": "(333) 333-3333",
      "private": false,
      "disableText": false
    }
  ],
  "email": {
    "address": "bill@email.com",
    "private": false,
    "bulk": true
  },
  "address": {
    "street1": "123 Sompelace Dr",
    "street2": null,
    "city": "Nowhere",
    "state": "MI",
    "zip": "55555",
    "lat": null,
    "lng": null,
    "private": false
  },
  "birthday": "1980-02-05",
  "gender": "Male",
  "status": "Member",
  "campus": "West",
  "maritalStatus": "Single", // Also matches fields named `Marriage status` and `Relationship status` (case-insensitive)
  "anniversary": "1985-01-25", // Also matches fields named `Married on`, `Marriage date`, `Wedding date`, `Date of wedding`, `Date of marriage`, `Anniversary date`, `Wedding anniversary`, `Marriage anniversary`, `Wedding anniversary date`, and `Marriage anniversary date` (case-insensitive)
  "joinDate": "1979-08-17", // Also matches field named `Date joined` (case-insenstive)
  "school": null, // Also matches fields named `Highschool`, `College`, and `University` (case-insenstive)
  "grade": null,
  "employer": "Breeze Industries", // Also matches fields named `Employer`, `Employment`, `Job`, `Work`, and `Workplace` (case-insensitive)
  "familyRole": "Head of Household",
  "family": [...],
  "fields": {
    "service": "2nd Service",
    "roomNumber": "1010"
  }
}
```

</details><br/>

## `people.list()`

Retrieve a list people in your Breeze database with special formatting that performs an extra lookup and properly labels custom-defined fields. This works similarly to the same way [`people.get()`](#peopleget) does, but returns a list of people instead of an individual.

<details>
<summary>Parameters:</summary>

| Option | Description                                                                                                                                                                                  | Default                               |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| limit  | Number of people to return. If 0 or not present, will return all people.                                                                                                                     | `0` _(no&nbsp;limit)_                 |
| offset | Number of people to skip before beginning to return results.<br>_(Can be used in conjunction with limit for pagination.)_                                                                    | `0` _(no&nbsp;offset)_                |
| fields | Array of custom fields to be matched up and included with each person result.<br>**NOTE:** This finds the first field that matches, so it's encouraged to use only fields with unique names. | `['']` _(no&nbsp;custom&nbsp;fields)_ |

</details>

### Example:

```js
const people = await breeze.people.list({ limit: 5, fields: ['service', 'roomNumber'] });
```

<details>
<summary>Sample response:</summary>

```json
[
  {
    "id": "PERSON_ID",
    "img": "https://files.breezechms.com/img/profiles/upload/FILE_ID.jpg",
    "name": {
      "first": "William",
      "last": "Frost",
      "nick": "Bill",
      "middle": null,
      "maiden": null
    },
    "phones": [...],
    "email": {...},
    "address": {...},
    "birthday": "1980-02-05",
    "gender": "Male",
    "status": "Member",
    "campus": "West",
    "maritalStatus": "Single", // Also matches fields named `Marriage status` and `Relationship status` (case-insensitive)
    "anniversary": "1985-01-25", // Also matches fields named `Married on`, `Marriage date`, `Wedding date`, `Date of wedding`, `Date of marriage`, `Anniversary date`, `Wedding anniversary`, `Marriage anniversary`, `Wedding anniversary date`, and `Marriage anniversary date` (case-insensitive)
    "joinDate": "1979-08-17", // Also matches field named `Date joined` (case-insenstive)
    "school": null, // Also matches fields named `Highschool`, `College`, and `University` (case-insenstive)
    "grade": null,
    "employer": "Breeze Industries", // Also matches fields named `Employer`, `Employment`, `Job`, `Work`, and `Workplace` (case-insensitive)
    "familyRole": "Adult",
    "family": [...],
    "fields": {
      "service": "2nd Service",
      "roomNumber": "1010"
    }
  },
  {
    "id": "PERSON_ID",
    "img": null,
    "name": {
      "first": "Nelly",
      "last": "Sams",
      "nick": null,
      "middle": null,
      "maiden": "Gates"
    },
    "phones": [...],
    "email": {...},
    "address": {...},
    ...
  },
  ...
```

</details><br/>

## `people.update()`

Update a person in your Breeze database with profile fields matched and formatted.

A few extra notes:

- Any field you don't include will remain the same.
- However, a `null` value or empty string will unset that field.
- Fields you define are loosely matched (ignores spaces, special characters, and capitalization). So for example, a field you want returned as `1stGradeTeacher` it would match a the custom profile field you have defined in Breeze named `1st-grade teacher`.
- Checkbox fields can be set with a string for a single value. For multiple values, you can use an array of strings or a interpunct delimited string. _(Ex. `'Value 1'`, `['Value 1', 'Value 2']`, `'Value 1 · Value 2'` are all valid)_

<details>
<summary>Parameters:</summary>

| Option        | Description                                                                                                                                                                                                                                                                                                                       | Default     |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| name          | Object to define any combination of different name parts to update. _(first, last, nick, middle, maiden)_                                                                                                                                                                                                                         | `undefined` |
| birthday      | Date of person's birthday in ISO format _`YYYY-MM-DD`_                                                                                                                                                                                                                                                                            | `undefined` |
| email         | String value of person's email address                                                                                                                                                                                                                                                                                            | `undefined` |
| phones        | Object to define any combination of different phone number types. _(mobile, home, work)_                                                                                                                                                                                                                                          | `undefined` |
| address       | Object to define a person's address _(street1, street2, city, state, zip)_                                                                                                                                                                                                                                                        | `undefined` |
| gender        | String value representing a person's gender                                                                                                                                                                                                                                                                                       | `undefined` |
| status        | String value representing a person's status                                                                                                                                                                                                                                                                                       | `undefined` |
| campus        | String value representing a person's campus                                                                                                                                                                                                                                                                                       | `undefined` |
| maritalStatus | String value representing a person's marital status<br/>_Also matches fields named `Marriage status` and `Relationship status` (case-insensitive)_                                                                                                                                                                                | `undefined` |
| anniversary   | Date of person's anniversary in ISO format _`YYYY-MM-DD`_<br/>_Also matches fields named `Married on`, `Marriage date`, `Wedding date`, `Date of wedding`, `Date of marriage`, `Anniversary date`, `Wedding anniversary`, `Marriage anniversary`, `Wedding anniversary date`, and `Marriage anniversary date` (case-insensitive)_ | `undefined` |
| joinDate      | Date person joined the congregation in ISO format _`YYYY-MM-DD`_<br/>_Also matches field named `Date joined` (case-insenstive)_                                                                                                                                                                                                   | `undefined` |
| campus        | String value representing a person's campus                                                                                                                                                                                                                                                                                       | `undefined` |
| school        | String value representing the school a student attends<br/>_Also matches fields named `Highschool`, `College`, and `University` (case-insenstive)_                                                                                                                                                                                | `undefined` |
| grade         | String value representing the year a student graduates                                                                                                                                                                                                                                                                            | `undefined` |
| employer      | String value representing a person's employer<br/>_Also matches fields named `Employer`, `Employment`, `Job`, `Work`, and `Workplace` (case-insensitive)_                                                                                                                                                                         | `undefined` |
| familyRole    | String value representing a person's role in the family _(Valid values include `Unassigned`, `Child`, `Adult`, `Head of Household`, or `Spouse`)_                                                                                                                                                                                 | `undefined` |
| fields        | An object that defines any other custom profile fields you want to update. Each key will loosely match the name of a custom-field and the value represets what you wish to update that field with. _(Ex. `{fields: {'service': '2nd service'}}`)_<br/>See the notes above for more details.                                       | `undefined` |

</details>

### Example:

```js
await breeze.people.update('PERSON_ID', {
  name: {
    first: 'Sally',
    last: 'Ridings',
    maiden: 'Jones',
  },
  birthday: '1980-06-14',
  email: 'sally@email.com',
  phones: {
    mobile: '111-222-3333',
    home: '', // Empty string unsets value
    work: null, // Similarly, null value can unset values too
  },
  address: {
    street1: '444 Nowhere Ave',
    street2: 'Apt. 5',
    city: 'Someplace',
    state: 'OH',
    zip: '98374',
  },
  gender: 'F', // This pacakge aims to work with either `Male/Female` or `M/F` values
  status: 'Visitor',
  campus: 'East',
  anniversary: '2003-06-20',
  joinDate: '1998-03-17',
  fields: {
    service: '3rd service',
    roomNumber: '2371010',
  },
});
```

### Returns: `void`

<br/>

## `people.add()`

Add a person to your Breeze database with profile fields matched and formatted. This works similarly to the same way [`people.update()`](#peopleupdate) does, but creates a new document instead of updates an existing one. Refer to the [`people.update()`](#peopleupdate) documenation for more info.

<details>
<summary>Parameters:</summary>

| Option        | Description                                                                                                                                                                                                                                                                                                                       | Default                               |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| name          | Object to define any combination of different name parts to update. _(first, last, nick, middle, maiden)_                                                                                                                                                                                                                         | `name.first` and `name.last` required |
| birthday      | Date of person's birthday in ISO format _`YYYY-MM-DD`_                                                                                                                                                                                                                                                                            | `undefined`                           |
| email         | String value of person's email address                                                                                                                                                                                                                                                                                            | `undefined`                           |
| phones        | Object to define any combination of different phone number types. _(mobile, home, work)_                                                                                                                                                                                                                                          | `undefined`                           |
| address       | Object to define a person's address _(street1, street2, city, state, zip)_                                                                                                                                                                                                                                                        | `undefined`                           |
| gender        | String value representing a person's gender                                                                                                                                                                                                                                                                                       | `undefined`                           |
| status        | String value representing a person's status                                                                                                                                                                                                                                                                                       | `undefined`                           |
| campus        | String value representing a person's campus                                                                                                                                                                                                                                                                                       | `undefined`                           |
| maritalStatus | String value representing a person's marital status<br/>_Also matches fields named `Marriage status` and `Relationship status` (case-insensitive)_                                                                                                                                                                                | `undefined`                           |
| anniversary   | Date of person's anniversary in ISO format _`YYYY-MM-DD`_<br/>_Also matches fields named `Married on`, `Marriage date`, `Wedding date`, `Date of wedding`, `Date of marriage`, `Anniversary date`, `Wedding anniversary`, `Marriage anniversary`, `Wedding anniversary date`, and `Marriage anniversary date` (case-insensitive)_ | `undefined`                           |
| joinDate      | Date person joined the congregation in ISO format _`YYYY-MM-DD`_<br/>_Also matches field named `Date joined` (case-insenstive)_                                                                                                                                                                                                   | `undefined`                           |
| campus        | String value representing a person's campus                                                                                                                                                                                                                                                                                       | `undefined`                           |
| school        | String value representing the school a student attends<br/>_Also matches fields named `Highschool`, `College`, and `University` (case-insenstive)_                                                                                                                                                                                | `undefined`                           |
| grade         | String value representing the year a student graduates                                                                                                                                                                                                                                                                            | `undefined`                           |
| employer      | String value representing a person's employer<br/>_Also matches fields named `Employer`, `Employment`, `Job`, `Work`, and `Workplace` (case-insensitive)_                                                                                                                                                                         | `undefined`                           |
| familyRole    | String value representing a person's role in the family _(Valid values include `Unassigned`, `Child`, `Adult`, `Head of Household`, or `Spouse`)_                                                                                                                                                                                 | `undefined`                           |
| fields        | An object that defines any other custom profile fields you want to update. Each key will loosely match the name of a custom-field and the value represets what you wish to update that field with. _(Ex. `{fields: {'service': '2nd service'}}`)_                                                                                 | `undefined`                           |

</details>

### Example:

```js
const personId = await breeze.people.add({
  name: {
    first: 'Sally',
    last: 'Ridings',
    maiden: 'Jones',
  },
  birthday: '1980-06-14',
  email: 'sally@email.com',
  phones: {
    mobile: '111-111-1111',
    home: '222-222-2222',
  },
  address: {
    street1: '444 Nowhere Ave',
    street2: 'Apt. 5',
    city: 'Someplace',
    state: 'OH',
    zip: '98374',
  },
  gender: 'F', // This pacakge aims to work with either `Male/Female` or `M/F` values
  status: 'Visitor',
  campus: 'East',
  fields: {
    service: '3rd service',
    roomNumber: '2371010',
  },
});
```

### Returns: newly created `PERSON_ID` string

<br/>

## `people.delete()`

Delete a person from your Breeze database.

</details>

### Example:

```js
await breeze.people.delete('PERSON_ID');
```

### Returns: `void`

</details><br/>

## `people.profileFields()`

Get information about user-defined profile fields in your Breeze database keyed by the field's name with auto-lookup based on an array of strings.

Some commonly-used predefined fields are included by default such as: `name`, `phone`, `email`, `address`, `family`, `birthday`, `gender`, `status`, `campus`, `maritalStatus`, `school`, `grade`, and `employer`. All other's can be passed in the `fields` array and will be returned if found.

** NOTE:** Ideally, you shouldn't need this function because the other `get()`, `list()`, `update()`, and `add()` methods perform this lookup automatically for you.

<details>
<summary>Parameters:</summary>

| Option | Description                                                                                                                                                                           | Default                               |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| fields | Array of custom fields to be matched up and included with the results.<br>**NOTE:** This finds the first field that matches, so it's encouraged to use only fields with unique names. | `['']` _(no&nbsp;custom&nbsp;fields)_ |

</details>

### Example:

```js
const profileFields = await breeze.people.profileFields({ fields: ['service', 'roomNumber'] });
```

<details>
<summary>Sample response:</summary>

```json
[
  {
    "key": "name",
    "id": "DOC_ID",
    "oid": "ORG_ID",
    "field_id": "FIELD_ID",
    "profile_section_id": "1",
    "field_type": "name",
    "name": "Name",
    "position": "2",
    "profile_id": "PROFILE_ID",
    "created_on": "2020-10-19 15:11:52",
    "options": []
  },
  {
    "key": "phone",
    "id": "DOC_ID",
    "oid": "ORG_ID",
    "field_id": "FIELD_ID",
    "profile_section_id": "4",
    "field_type": "phone",
    "name": "Phone",
    "position": "59",
    "profile_id": "PROFILE_ID",
    "created_on": "2020-10-19 15:11:52",
    "options": []
  },
  ...
  {
    "key": "service",
    "id": "DOC_ID",
    "oid": "ORG_ID",
    "field_id": "FIELD_ID",
    "profile_section_id": "1",
    "field_type": "dropdown",
    "name": "Service",
    "position": "20",
    "profile_id": "PROFILE_ID",
    "created_on": "2020-10-19 15:11:52",
    "options": [
      {
        "id": "DOC_ID",
        "oid": "ORG_ID",
        "option_id": "OPTION_ID",
        "profile_field_id": "FIELD_ID",
        "name": "1st Service",
        "position": "21",
        "profile_id": "PROFILE_ID",
        "created_on": "2020-10-19 15:11:52"
      },
      ...
    ]
  },
  {
    "key": "roomNumber",
    "id": "DOC_ID",
    "oid": "ORG_ID",
    "field_id": "FIELD_ID",
    "profile_section_id": "1",
    "field_type": "single_line",
    "name": "Room Number",
    "position": "24",
    "profile_id": "PROFILE_ID",
    "created_on": "2020-10-19 15:11:52",
    "options": []
  }
]
```

</details><br/>

---

---

# Native Breeze API

These methods are meant to mirror the API as it's described in the [official Breeze documentation](https://app.breezechms.com/api#people), but the [functions above](#people) are generally preferred for their ease-of-use.

- [`people.api.get()`](#peopleapiget)
- [`people.api.list()`](#peopleapilist)
- [`people.api.update()`](#peopleapiupdate)
- [`people.api.add()`](#peopleapiadd)
- [`people.api.delete()`](#peopleapidelete)
- [`people.api.profileFields()`](#peopleapiprofilefields)

<br/>

## `people.api.get()`

Get individual person record in your Breeze database. <sup>[Breeze API](https://app.breezechms.com/api#show_person)</sup>

**NOTE:** For most cases, it's recommended to instead use [`people.get()`](#peopleget) as it returns a result in a more consumable format.

<details>
<summary>Parameters:</summary>

| Option  | Description                                                                                                                               | Default                        |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| details | Option to return all information (slower) or just basic info. `1` = get all information pertaining to person. `0` = only get id and name. | `1` (shows&nbsp;all&nbsp;info) |

</details>

### Example:

```js
const person = await breeze.api.people.get('PERSON_ID');
```

<details>
<summary>Sample response:</summary>

```json
{
  "id": "PERSON_ID",
  "first_name": "Thomas",
  "last_name": "Anderson",
  "thumb_path": "",
  "path": "img/profiles/generic/blue.jpg",
  "details": {
    "street_address": "123 Test Ave",
    "city": "Grandville",
    "state": "MI",
    "zip": "49123",
    "longitude": "",
    "latitude": ""
  }
}
```

</details><br/>

## `people.api.list()`

Retrieve a list people in your Breeze database. <sup>[Breeze API](https://app.breezechms.com/api#list_people)</sup>

**NOTE:** For most cases, it's recommended to instead use [`people.list()`](#peoplelist) as it returns results in a more consumable format.

<details>
<summary>Parameters:</summary>

| Option      | Description                                                                                                                                                                                                                                                                                                                              | Default                       |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| details     | Option to return all information (slower) or just names. `1` = get all information pertaining to person. `0` = only get id and name.                                                                                                                                                                                                     | `0` (just&nbsp;names)         |
| filter_json | Option to filter through results based on criteria (tags, status, etc).<br/>Refer to [`people.profileFields()`](#peopleprofilefields) response to know values to search for or if you're hard-coding the field ids, watch the URL bar when filtering for people within Breeze's people filter page and use the variables you see listed. | `undefined` (no&nbsp;filters) |
| limit       | Number of people to return. If 0 or not present, will return all people.                                                                                                                                                                                                                                                                 | `0` (no&nbsp;limit)           |
| offset      | Number of people to skip before beginning to return results.<br/>Can be used in conjunction with limit for pagination.                                                                                                                                                                                                                   | `0` (no&nbsp;offset)          |

</details>

### Example:

```js
const people = await breeze.people.api.list();
```

<details>
<summary>Sample response:</summary>

```json
[
  {
    "id":"PERSON_ID",
    "first_name":"Thomas",
    "last_name":"Anderson",
    "path":"img\/profiles\/generic\/blue.jpg"
  },
  {
    "id":"PERSON_ID",
    "first_name":"Kate",
    "last_name":"Austen",
    "path":"img\/profiles\/upload\/2498d7f78s.jpg"
  },
  ...
]
```

</details><br/>

## `people.api.update()`

Update a person in your Breeze database. <sup>[Breeze API](https://app.breezechms.com/api#update_person)</sup>

**NOTE:** For most cases, it's recommended to instead use [`people.update()`](#peopleupdate) as it allows you to construct the person object in a more friendly format.

<details>
<summary>Parameters:</summary>

| Option      | Description                                                                                                                                                                                                                                                           |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| fields_json | Additional fields to update.<br/>These fields are passed as an array of fields, each containing a field id, field type, response, and in some cases, more information. The field information itself can be found on [`people.profileFields()`](#peopleprofilefields). |

</details>

### Example:

```js
const updatedPerson = await breeze.people.api.update('PERSON_ID', {
  fields_json: JSON.stringify([{ foo: 'bar' }, { bar: 'baz' }]),
});
```

<details>
<summary>Sample response:</summary>

```json
  // TODO: print response
```

</details><br/>

## `people.api.add()`

Add a person to your Breeze database. <sup>[Breeze API](https://app.breezechms.com/api#add_person)</sup>

**NOTE:** For most cases, it's recommended to instead use [`people.add()`](#peopleadd) as it allows you to construct the person object in a more friendly format.

<details>
<summary>Parameters:</summary>

| Option      | Description                                                                                                                                                                                                                                                        |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| first       | New person's first name                                                                                                                                                                                                                                            |
| last        | New person's last name                                                                                                                                                                                                                                             |
| fields_json | Additional fields to add.<br/>These fields are passed as an array of fields, each containing a field id, field type, response, and in some cases, more information. The field information itself can be found on [`people.profileFields()`](#peopleprofilefields). |

</details>

### Example:

```js
const addedPerson = await breeze.people.api.add({ first: 'Jiminy', last: 'Cricket' });
```

<details>
<summary>Sample response:</summary>

```json
{
  "id": "PERSON_ID",
  "first_name": "Jiminy",
  "force_first_name": "Jiminy",
  "last_name": "Cricket",
  "thumb_path": "",
  "path": "img/profiles/generic/gray.png",
  "street_address": null,
  "city": null,
  "state": null,
  "zip": null,
  "details": {
    "person_id": "PERSON_ID"
  },
  "family": []
}
```

</details><br/>

## `people.api.delete()`

Delete a person from your Breeze database. <sup>[Breeze API](https://app.breezechms.com/api#delete_person)</sup>

**NOTE:** This is the same as [`people.delete()`](#peopledelete)

</details>

### Example:

```js
await breeze.people.api.delete('PERSON_ID');
```

### Returns: `true`

<br/>

## `people.api.profileFields()`

Get information about user-defined profile fields in your Breeze database. <sup>[Breeze API](https://app.breezechms.com/api#list_profile_fields)</sup>

**NOTE:** For most cases, it's recommended to instead use [`people.profileFields()`](#peopleprofilefields) as it returns results in a more consumable format.

<details>
<summary>Parameters:</summary>

| Option         | Description                                                                      | Default                           |
| -------------- | -------------------------------------------------------------------------------- | --------------------------------- |
| removeSections | Whether or not to return the parent sections or just a flattened array of fields | `false` _(include&nbsp;sections)_ |

</details>

### Example:

```js
await breeze.api.profileFields();

// Or if you don't care about the parent sections,
// this will return an single-depth array of fields only
await breeze.api.profileFields({ removeSections: true });
```

<details>
<summary>Sample response:</summary>

```json
[
  {
    "id": "DOC_ID",
    "oid": "ORG_ID",
    "section_id": "1",
    "name": "Main",
    "column_id": "1",
    "position": "1",
    "profile_id": "PROFILE_ID",
    "created_on": "2020-1-30 14:00:00",
    "fields": [
      {
        "id": "DOC_ID", // Don't match on this field ID
        "oid": "000000",
        "field_id": "FIELD_ID", // Use this one instead
        "profile_section_id": "1",
        "field_type": "multiple_choice",
        "name": "Gender",
        "position": "2",
        "profile_id": "PROFILE_ID",
        "created_on": "2020-1-30 14:00:00",
        "options": [
          {
            "id": "DOC_ID", // Don't match on this option ID
            "oid": "000000",
            "option_id": "1", // Use this one instead
            "profile_field_id": "FIELD_ID",
            "name": "Female",
            "position": "3",
            "profile_id": "PROFILE_ID",
            "created_on": "2020-1-30 14:00:00",
          },
          ...
        ]
      },
      ...
    ]
  },
  ...
]
```

</details>

<details>
<summary>Sample response (removeSections):</summary>

```json
[
  {
    "id": "DOC_ID", // Don't match on this field ID
    "oid": "ORG_ID",
    "field_id": "FIELD_ID", // Use this one instead
    "profile_section_id": "1",
    "field_type": "name",
    "name": "Name",
    "position": "2",
    "profile_id": "PROFILE_ID",
    "created_on": "2020-10-17 15:13:48",
    "options": []
  },
  {
    "id": "DOC_ID", // Don't match on this field ID
    "oid": "ORG_ID",
    "field_id": "FIELD_ID", // Use this one instead
    "profile_section_id": "1",
    "field_type": "multiple_choice",
    "name": "Gender",
    "position": "3",
    "profile_id": "PROFILE_ID",
    "created_on": "2020-1-30 14:00:00",
    "options": [
      {
        "id": "DOC_ID",
        "oid": "ORG_ID",
        "option_id": "1",
        "profile_field_id": "FIELD_ID",
        "name": "Female",
        "position": "3",
        "profile_id": "PROFILE_ID",
        "created_on": "2020-1-30 14:00:00",
      },
      ...
    ]
  },
  ...
]
```

</details>
