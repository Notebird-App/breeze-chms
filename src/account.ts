import { AxiosInstance } from 'axios';

export default class Account {
  /** Callable http client with url and api key initialized */
  private api: AxiosInstance;
  constructor(api: AxiosInstance) {
    this.api = api;
  }

  /** Retrieve a summary overview of your account/organization details.
   *
   * [View docs for `account.summary()`](https://github.com/Notebird-App/breeze-chms/blob/main/docs/Account.md#accountsummary) */
  async summary() {
    const { data } = await this.api.get('account/summary');
    if (data.success === false) throw new Error(data.errors[0]);
    return data as AccountSummary;
  }

  /** Retrieve a list of events based on search criteria.
   *
   * [View docs for `account.logs()`](https://github.com/Notebird-App/breeze-chms/blob/main/docs/Account.md#accountlogs) */
  logs(params: { details?: 0 } & LogParams): Promise<AccountLog[]>;
  logs(params: { details: 1 } & LogParams): Promise<AccountLogDetail[]>;
  async logs(params: LogParams) {
    const { data } = await this.api.get('account/list_log', { params });
    if (data.success === false) throw new Error(data.errors[0]);
    return data;
  }
}

//////////////////
// RETURN TYPES //
//////////////////
export interface AccountSummary {
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
type LogAction =
  // Communications
  | 'email_sent'
  | 'text_sent'
  // Contributions
  | 'contribution_added'
  | 'contribution_updated'
  | 'contribution_deleted'
  | 'bulk_contributions_deleted'
  | 'envelope_created'
  | 'envelope_updated'
  | 'envelope_deleted'
  | 'payment_method_updated'
  | 'payment_method_deleted'
  | 'payment_method_created'
  | 'bank_account_added'
  | 'bank_account_updated'
  | 'transfer_day_changed'
  | 'bank_account_deleted'
  | 'payment_association_deleted'
  | 'payment_association_created'
  | 'bulk_import_contributions'
  | 'bulk_import_pledges'
  | 'bulk_pledges_deleted'
  | 'batch_updated'
  | 'batch_deleted'
  | 'bulk_envelopes_deleted'
  // Events
  | 'event_created'
  | 'event_updated'
  | 'event_deleted'
  | 'event_instance_deleted'
  | 'event_future_deleted'
  | 'events_calendar_created'
  | 'events_calendar_updated'
  | 'events_calendar_deleted'
  | 'bulk_import_attendance'
  | 'attendance_deleted'
  | 'bulk_attendance_deleted'
  // Volunteers
  | 'volunteer_role_created'
  | 'volunteer_role_deleted'
  // People
  | 'person_created'
  | 'person_updated'
  | 'person_deleted'
  | 'person_archived'
  | 'person_merged'
  | 'people_updated'
  | 'bulk_update_people'
  | 'bulk_people_deleted'
  | 'bulk_people_archived'
  | 'bulk_import_people'
  | 'bulk_notes_deleted'
  // Tags
  | 'tag_created'
  | 'tag_updated'
  | 'tag_deleted'
  | 'bulk_tags_deleted'
  | 'tag_folder_created'
  | 'tag_folder_updated'
  | 'tag_folder_deleted'
  | 'tag_assign'
  | 'tag_unassign'
  // Forms
  | 'form_created'
  | 'form_updated'
  | 'form_deleted'
  | 'form_entry_updated'
  | 'form_entry_deleted'
  // Follow Ups
  | 'followup_option_created'
  | 'followup_option_updated'
  | 'followup_option_deleted'
  // Users
  | 'user_created'
  | 'user_updated'
  | 'user_deleted'
  | 'role_created'
  | 'role_updated'
  | 'role_deleted'
  // Account
  | 'sub_payment_method_updated';

export interface AccountLog {
  id: string;
  oid: string;
  user_id: string;
  action: LogAction;
  object_json: string;
  created_on: string;
}
export interface AccountLogDetail extends AccountLog {
  details: string;
}

///////////////////
// Method Params //
///////////////////
interface LogParams {
  /** A required parameter indicating which type of logged action should be returned. */
  action: LogAction;
  /** The start date range for actions that should be returned.
   * If not provided, logged items will be fetched from as long ago as the log is storing. */
  start?: string;
  /** The end date range for actions that should be returned.
   * If not provided, logged items will be fetched up until the current moment. */
  end?: string;
  /** The user_id of the user who made the logged action.
   * If not provided, all users' actions will be returned. */
  user_id?: string;
  /** If details about the logged action should be returned.
   * Note that this column is not guaranteed to be standardized and should
   * not be relied upon for anything more than a description. */
  details?: 1 | 0;
  /** The number of logged items to return. Max is 3,000.
   *
   * @default 500
   */
  limit?: number;
}
