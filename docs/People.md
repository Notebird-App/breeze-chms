# People

`breeze-chms` provides convenient access to **[Breeze's People API](https://app.breezechms.com/api#people)**. You can use these methods to create, read, update, and delete people in your Breeze database.

These primary methods for the people collection have been slightly modified from the way they're documented on the Breeze website. They aim to provide you with an easier way to get people documents in a desired format. It does this by internally making a comparison with user-defined profile fields automatically.

These functions should work for 98% of use-cases—the only downside is that user-defined fields must be unique across your entire organization/account or unexpected behavior might occur.

The [Breeze-native](#native-breeze-api) functions are still available if you have a special need for them, but try the ones immediately below first.

- [`people.get()`](#peopleget)
- [`people.list()`](#peoplelist)
- [`people.add()`](#peopleadd)
- [`people.update()`](#peopleupdate)
- [`people.delete()`](#peopledelete)
- [`people.profileFields()`](#peopleprofilefields)

<br/>

## `people.get()`

Description

<details>
<summary>Parameters:</summary>

| Option  | Description   | Default   |
| ------- | ------------- | --------- |
| option1 | description 1 | default 1 |

</details>

### Example:

```js
// TODO: write example
```

<details>
<summary>Sample response:</summary>

```json
  // TODO: print response
```

</details><br/>

## `people.list()`

Retrieve a list people in your Breeze database with special formatting that performs an extra lookup and properly labels custom-defined fields.

<details>
<summary>Parameters:</summary>

| Option | Description                                                                                                                                                                             | Default                               |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| limit  | Number of people to return. If 0 or not present, will return all people.                                                                                                                | `0` _(no&nbsp;limit)_                 |
| offset | Number of people to skip before beginning to return results.<br>_(Can be used in conjunction with limit for pagination.)_                                                               | `0` _(no&nbsp;offset)_                |
| fields | Array of custom fields to be matched up and included with each person result.<br>**NOTE:** This finds the first field that matches, so it's encouraged to use only fields unique names. | `['']` _(no&nbsp;custom&nbsp;fields)_ |

</details>

### Example:

```js
await breeze.people.listProfiles({ fields: ['Service', 'Room Number'] });
```

<details>
<summary>Sample response:</summary>

```json
  // TODO: print response
```

</details><br/>

## `people.add()`

Description

<details>
<summary>Parameters:</summary>

| Option  | Description   | Default   |
| ------- | ------------- | --------- |
| option1 | description 1 | default 1 |

</details>

### Example:

```js
// TODO: write example
```

<details>
<summary>Sample response:</summary>

```json
  // TODO: print response
```

</details><br/>

## `people.update()`

Description

<details>
<summary>Parameters:</summary>

| Option  | Description   | Default   |
| ------- | ------------- | --------- |
| option1 | description 1 | default 1 |

</details>

### Example:

```js
// TODO: write example
```

<details>
<summary>Sample response:</summary>

```json
  // TODO: print response
```

</details><br/>

## `people.delete()`

Description

<details>
<summary>Parameters:</summary>

| Option  | Description   | Default   |
| ------- | ------------- | --------- |
| option1 | description 1 | default 1 |

</details>

### Example:

```js
// TODO: write example
```

<details>
<summary>Sample response:</summary>

```json
  // TODO: print response
```

</details><br/>

## `people.profileFields()`

Description

<details>
<summary>Parameters:</summary>

| Option  | Description   | Default   |
| ------- | ------------- | --------- |
| option1 | description 1 | default 1 |

</details>

### Example:

```js
// TODO: write example
```

<details>
<summary>Sample response:</summary>

```json
  // TODO: print response
```

</details><br/>

---

---

# Native Breeze API

These methods are meant to mirror the API as it's described in the [official Breeze documentation](https://app.breezechms.com/api#people), but the [functions above](#methods) are generally preferred for their ease-of-use.

- [`people.api.get()`](#peopleapiget)
- [`people.api.list()`](#peopleapilist)
- [`people.api.add()`](#peopleapiadd)
- [`people.api.update()`](#peopleapiupdate)
- [`people.api.delete()`](#peopleapidelete)
- [`people.api.profileFields()`](#peopleapiprofilefields)

<br/>

## `people.api.get()`

Description

<details>
<summary>Parameters:</summary>

| Option  | Description   | Default   |
| ------- | ------------- | --------- |
| option1 | description 1 | default 1 |

</details>

### Example:

```js
// TODO: write example
```

<details>
<summary>Sample response:</summary>

```json
  // TODO: print response
```

</details><br/>

## `people.api.list()`

Retrieve a list people in your Breeze database. <sup>[Breeze API](https://app.breezechms.com/api#list_people)</sup>

**NOTE:** For most cases, it's recommended to instead use [`people.list()`](#people.list) as it returns results in a more consumable format.

### Example:

```js
await breeze.people.api.list();
```

<details>
<summary>Sample response:</summary>

```json
  // TODO: print response
```

</details><br/>

## `people.api.add()`

Description

<details>
<summary>Parameters:</summary>

| Option  | Description   | Default   |
| ------- | ------------- | --------- |
| option1 | description 1 | default 1 |

</details>

### Example:

```js
// TODO: write example
```

<details>
<summary>Sample response:</summary>

```json
  // TODO: print response
```

</details><br/>

## `people.api.update()`

Description

<details>
<summary>Parameters:</summary>

| Option  | Description   | Default   |
| ------- | ------------- | --------- |
| option1 | description 1 | default 1 |

</details>

### Example:

```js
// TODO: write example
```

<details>
<summary>Sample response:</summary>

```json
  // TODO: print response
```

</details><br/>

## `people.api.delete()`

Description

<details>
<summary>Parameters:</summary>

| Option  | Description   | Default   |
| ------- | ------------- | --------- |
| option1 | description 1 | default 1 |

</details>

### Example:

```js
// TODO: write example
```

<details>
<summary>Sample response:</summary>

```json
  // TODO: print response
```

</details><br/>

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
