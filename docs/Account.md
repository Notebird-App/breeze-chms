# Account

`breeze-chms` provides convenient access to **[Breeze's Account API](https://app.breezechms.com/api#account)**.

- [`account.summary()`](#accountsummary)
- [`account.logs()`](#accountlogs)

<br/>

## `account.summary()`

Retrieve a summary overview of your account/organization details.

### Example:

```js
const summary = await breeze.account.summary();
```

<details>
<summary>Sample response:</summary>

```json
{
  "id": "ORG_ID",
  "name": "Grace Church",
  "subdomain": "gracechurchdemo",
  "status": "1",
  "created_on": "2019-09-10 09:19:35",
  "details": {
    "timezone": "America/New_York",
    "country": {
      "id": "2",
      "name": "United States of America",
      "abbreviation": "USA",
      "abbreviation_2": "US",
      "currency": "USD",
      "currency_symbol": "$",
      "date_format": "MDY",
      "sms_prefix": "1"
    }
  }
}
```

</details><br/>

## `account.logs()`

Retrieve a list of events based on search criteria.

### Example:

```js
const logs = await breeze.account.logs({ action: 'person_updated' });
```

<details>
<summary>Sample response:</summary>

```json
[
  {
    "id": "LOG_ID",
    "oid": "ORG_ID",
    "user_id": "USER_ID",
    "action": "person_updated",
    "object_json": "\"5023943\"",
    "created_on": "2019-08-15 04:41:10"
  },
  {
    "id": "LOG_ID",
    "oid": "ORG_ID",
    "user_id": "USER_ID",
    "action": "person_updated",
    "object_json": "\"5023253\"",
    "created_on": "2019-08-15 04:44:25"
  },
  {
    "id": "LOG_ID",
    "oid": "ORG_ID",
    "user_id": "USER_ID",
    "action": "person_updated",
    "object_json": "\"5023129\"",
    "created_on": "2019-08-15 04:49:31"
  }
]
```

</details><br/>
