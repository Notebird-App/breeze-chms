# breeze-chms

The `breeze-chms` javascript library provides convenient access to the [Breeze REST API](https://app.breezechms.com/api) from applications written in server-side JavaScript (Node).

> **Disclaimer**: API wrappers are not necessarily created or maintained by Breeze.

## Installation

Install the package with:

```sh
npm install breeze-chms --save
# or
yarn add breeze-chms
```

## Usage

The package needs to be configured with your account's subdomain and secret API key. The subdomain is what comes before `breezechms.com` in your browser address bar. Your unique/secret API key is available on the `Extensions` page of your Breeze account `https://YOURSUBDOMAIN.breezechms.com/extensions/api`. Require the package and initialize it with values for your subdomain and API key.

> **NOTE**: DO NOT hardcode, expose, or otherwise commit your API key to a repository.

```js
const breeze = require('breeze-chms')('SUBDOMAIN', 'APIKEY');

breeze.people
  .get('PERSONID')
  .then((person) => console.log(person.id))
  .catch((error) => console.error(error));
```

Or using ES modules and `async`/`await`:

```js
import Breeze from 'breeze-chms';
const breeze = new Breeze('SUBDOMAIN', 'APIKEY');

(async () => {
  const person = await breeze.people.get('PERSONID');
  console.log(person.id);
})();
```

> This package uses Typescript and comes fully typed meaning it can provide code-hinting via Intellisense. If you're not familiar with Typescript—[get started today](https://www.typescriptlang.org/)!

## Endpoints

Not all Breeze endpoints have been accounted for. See below for which ones are currently available. If you need something specific or have any comments, please open an issue—new endpoints will be implemented based on demand.

- [x] [Account](docs/Account.md)
- [x] [People](docs/People.md)
- [ ] [Families](docs/Families.md)
- [ ] [Tags](docs/Tags.md)
- [ ] [Events](docs/Events.md)
- [ ] [Check In](docs/Check_In.md)
- [ ] [Contributions](docs/Contributions.md)
- [ ] [Pledges](docs/Pledges.md)
- [ ] [Forms](docs/Forms.md)
- [ ] [Volunteers](docs/Volunteers.md)

## Dependencies

- [Axios](https://www.npmjs.com/package/axios) - Promise based HTTP client for the browser and node.js

## Contributing

Feel free to open a pull-request with any changes if you'd like to help out! To develop locally, go through these few steps to get up and running:

```sh
> git clone https://github.com/Notebird-App/breeze-chms
> cd breeze-chms
> npm install
```

Next, you'll need to add a `.env` file to the root directory that looks something like this (replacing the values with your own, of course):

```
subdomain=YOURSUBDOMAIN
key=YOURAPIKEY
```

This let's you properly run the tests via [Jest](https://jestjs.io/). However, they might fail at first because they rely on a couple custom profile fields to be present in your account. So you can add `Anniversary`, `Date joined`, `Service`, and `Room Number` in your Breeze account as custom text fields. _(You can remove these later if you wish)_

## Versioning

This project uses [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/notebird-app/breeze-chms/tags).

## Authors

- [Notebird Inc](https://github.com/notebird-app)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
