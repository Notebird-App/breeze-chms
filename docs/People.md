# People

breeze-chms provides convenient access to **[Breeze's People API](https://app.breezechms.com/api#people)**. You can use these methods to create, read, update, and delete people in your Breeze database.

### Methods

- [people.fields()](<#people.fields()>)
- [people.getProfile()](<#people.getProfile()>)
- [people.listProfiles()](<#people.listProfiles()>)
- [people.list()](<#people.list()>)
- [people.get()](<#people.get()>)

---

## people.fields()

Get information about custom-defined profile fields in your Breeze database. <sup>[Breeze API](https://app.breezechms.com/api#list_profile_fields)</sup>

### Example:

```js
const fields = await breeze.people.fields();
```

<details>
<summary>Returns</summary>

```json
[
  {
    "id": "222222",
    "oid": "000000",
    "section_id": "1",
    "name": "Main",
    "column_id": "1",
    "position": "1",
    "profile_id": "1111111111111",
    "created_on": "2020-1-30 14:00:00",
    "fields": [
      {
        "id": "3333333",
        "oid": "000000",
        "field_id": "4444444444444",
        "profile_section_id": "1",
        "field_type": "multiple_choice",
        "name": "Gender",
        "position": "2",
        "profile_id": "4444444444444",
        "created_on": "2020-1-30 14:00:00",
        "options": [
          {
            "id": "5555555",
            "oid": "000000",
            "option_id": "1",
            "profile_field_id": "4444444444444",
            "name": "Female",
            "position": "3",
            "profile_id": "5f88f1582bff5",
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

---

## people.listProfiles()

Retrieve a list people in your Breeze database with special formatting that performs an extra lookup and properly labels custom-defined fields.

### Example:

```js
await breeze.people.listProfiles({ fields: [''] });
```

<details>
<summary>Returns</summary>

```json

```

</details>

---

## people.list()

Retrieve a list people in your Breeze database. <sup>[Breeze API](https://app.breezechms.com/api#list_people)</sup>

**NOTE:** For most cases, it's recommended to instead use [people.listProfiles()](<#people.listProfiles()>) as it returns results in a more consumable format.

### Example:

```js
await breeze.people.list();
```

<details>
<summary>Returns</summary>

```json

```

</details>
