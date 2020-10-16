# Breeze CHmS - Javascript Library

The Breeze CHmS Javascript library provides convenient access to the [Breeze REST API](https://app.breezechms.com/api) from applications written in server-side JavaScript (Node).

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
// TODO: Write example
```

Or using ES modules and `async`/`await`:

```js
// TODO: Write example
```

**NOTE**: DO NOT hardcode, expose, or otherwise commit your API key.

## Endpoints

Not all Breeze endpoints have been implemented. See below for which ones are currently available:

- [-] [People][https://app.breezechms.com/api#people]
- [ ] [Tags][https://app.breezechms.com/api#tags]
- [ ] [Events][https://app.breezechms.com/api#events]
- [ ] [Check In][https://app.breezechms.com/api#checkin]
- [ ] [Contributions][https://app.breezechms.com/api#contributions]
- [ ] [Pledges][https://app.breezechms.com/api#pledges]
- [ ] [Forms][https://app.breezechms.com/api#forms]
- [ ] [Volunteers][https://app.breezechms.com/api#volunteers]
- [ ] [Families][https://app.breezechms.com/api#families]
- [-] [Account][https://app.breezechms.com/api#account]

## Dependencies

- [Axios](https://www.npmjs.com/package/axios) - Promise based HTTP client for the browser and node.js

## Contributing

This is a work in progress and not actively maintained. Feel free to open a pull-request with any changes if you'd like to help out! If you need something specific or have any comments, you can open an issue.

## Versioning

This project uses [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/notebird-app/breeze-chms/tags).

## Authors

- **Chris Doe** - _Initial work_ - [Notebird](https://github.com/notebird-app)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
