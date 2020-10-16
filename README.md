# breeze-chms

The `breeze-chms` javascript library provides convenient access to the [Breeze REST API](https://app.breezechms.com/api) from applications written in server-side JavaScript (Node).

## Installation

Install the package with:

```sh
npm install breeze-chms --save
# or
yarn add breeze-chms
```

## Usage

The package needs to be configured with your account's subdomain and secret API key. The subdomain is what comes before `breezechms.com` in your browser address bar. Your unique/secret API key is available on the `Extensions` page of your Breeze account `https://YOURSUBDOMAIN.breezechms.com/extensions/api`. Require the package and initialize it with values for your subdomain and API key:

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

**NOTE**: DO NOT hardcode, expose, or otherwise commit your API key to a repository.

## Endpoints

Not all Breeze endpoints have been implemented. See below for which ones are currently available:

- [x] [People](docs/People.md)
- [ ] [Tags](docs/Tags.md)
- [ ] [Events](docs/Events.md)
- [ ] [Check In](docs/Check_In.md)
- [ ] [Contributions](docs/Contributions.md)
- [ ] [Pledges](docs/Pledges.md)
- [ ] [Forms](docs/Forms.md)
- [ ] [Volunteers](docs/Volunteers.md)
- [ ] [Families](docs/Families.md)
- [x] [Account](docs/Account.md)

## Dependencies

- [Axios](https://www.npmjs.com/package/axios) - Promise based HTTP client for the browser and node.js

## Contributing

This is a work in progress and not actively maintained. Feel free to open a pull-request with any changes if you'd like to help out! If you need something specific or have any comments, you can open an issue.

## Versioning

This project uses [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/notebird-app/breeze-chms/tags).

## Authors

- [Notebird Inc](https://github.com/notebird-app)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
