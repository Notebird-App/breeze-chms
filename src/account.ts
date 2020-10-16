import { AxiosInstance } from 'axios';

export default class Account {
  /** Callable http client with url and api key initialized */
  private api: AxiosInstance;
  constructor(axios: AxiosInstance) {
    this.api = axios;
  }

  async summary() {
    const { data } = await this.api.get('account/summary');
    if (data.success === false) throw 'Permission Denied';
    return data as AccountSummary;
  }
}

//////////////////
// RETURN TYPES //
//////////////////
interface AccountSummary {
  id: string;
  name: string;
  subdomain: string;
  status: string;
  created_on: string;
  details: {
    timezone: string;
    country: {
      id: string;
      name: string;
      abbreviation: string;
      abbreviation_2: string;
      currency: string;
      currency_symbol: string;
      date_format: string;
      sms_prefix: string;
    };
  };
}

///////////////////
// Method Params //
///////////////////
