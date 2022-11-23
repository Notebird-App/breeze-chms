import Axios from 'axios';
import People from './people';
import Account from './account';

export default class Breeze {
  /**
   * Initialize this class to interface with [Breeze API](https://app.breezechms.com/api).
   *
   * @param  subdomain
   * Enter your Breeze subdomain.
   *
   * (_You can find this in your web address bar when logged
   * into Breeze: `YOURSUBDOMAIN.breezechms.com`_)
   *
   * @param  key
   * Enter your unique/secret API key.
   *
   * (_You can find this on the `Extensions` page of your Breeze account:
   * `https://YOURSUBDOMAIN.breezechms.com/extensions/api`_)
   *
   * @returns Instace of callable Breeze API wrapper.
   */
  constructor(subdomain: string, key: string) {
    const api = Axios.create({
      baseURL: `https://${subdomain}.breezechms.com/api/`,
      headers: { 'Api-Key': key },
    });
    this.people = new People(api);
    this.account = new Account(api);
  }

  /** List, get, add, update, and delete people in Breeze.
   *
   * [API REF](https://app.breezechms.com/api#people) */
  people: People;

  /** Retrieve Breeze account details and activity log.
   *
   * [API REF](https://app.breezechms.com/api#account) */
  account: Account;
}

module.exports = Breeze;
module.exports.default = Breeze;
