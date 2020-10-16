import { AxiosInstance } from 'axios';

export default class People {
  /** Callable http client with url and api key initialized */
  private api: AxiosInstance;
  constructor(axios: AxiosInstance) {
    this.api = axios;
  }

  /** List people in your Breeze database.
   *
   * [API REF](https://app.breezechms.com/api#list_people) */
  list(params?: { details?: 0 } & ListParams): Promise<BreezePerson[]>;
  list(params: { details: 1 } & ListParams): Promise<BreezePersonDetail[]>;
  async list(params: ListParams = {}) {
    const { data } = await this.api.get('people', { params });
    if (data.success === false) throw 'Permission Denied';
    return data;
  }

  /** Get individual person record in your Breeze database.
   *
   * [API REF](https://app.breezechms.com/api#show_person) */
  get(id: string, params: { details: 0 }): Promise<BreezePerson>;
  get(id: string, params?: { details?: 1 }): Promise<BreezePersonDetail>;
  async get(id: string, params: GetParams = {}) {
    const { data } = await this.api.get('people/' + id, { params });
    if (data.success === false) throw 'Permission Denied';
    return data;
  }

  /** Get information about profile fields in your Breeze database.
   *
   * [API REF](https://app.breezechms.com/api#list_profile_fields) */
  async fields() {
    const { data } = await this.api.get('profile');
    if (data.success === false) throw 'Permission Denied';
    return data as ProfileSection[];
  }

  /** List people in your Breeze database with profile fields formatted and merged in. */
  async listProfiles<T extends string = never>({
    filter_json,
    limit,
    offset,
    customFields = [],
  }: ListProfilesParams<T> = {}) {
    // async listProfiles(params: ListProfilesParams = {}) {
    const [fields, people] = await Promise.all([
      this.fields(),
      this.list({ details: 1, filter_json, limit, offset }),
    ]);
    // Pluck out custom field ids
    const customFieldIds: { [id: string]: T } = {};
    for (const key of customFields) {
      fields.find((section) => {
        return section.fields.find((field) => {
          if (field.name === key) {
            customFieldIds[field.field_id] = key;
            return true;
          }
          return false;
        });
      });
    }

    const profiles: PersonProfile<T>[] = [];
    for (const {
      id,
      path,
      first_name,
      force_first_name,
      middle_name,
      last_name,
      maiden_name,
      details,
    } of people) {
      // Format name
      const first = first_name.trim() || null;
      const last = last_name.trim(); // Last name is required
      const legal = (force_first_name.trim() !== first && force_first_name.trim()) || null;
      const middle = middle_name.trim() || null;
      const maiden = maiden_name.trim() || null;
      const name = { first, last, legal, middle, maiden };

      // Other default fields
      const birthday = details.birthdate || null;
      const grade = details.grade || null;

      const profile: PersonProfile<T> = {
        id,
        img: path.includes('generic') ? null : 'https://files.breezechms.com/' + path,
        name,
        birthday,
        grade,
        phones: [],
        email: null,
        address: null,
        custom: Object.assign({}, ...customFields.map((field) => ({ [field]: null }))),
      };
      // Loop through all details
      for (const key of Object.keys(details)) {
        // Handle each detail value
        const detail = details[key];
        // Phones, email, and address (and custom checkboxes) are only values in arrays
        if (Array.isArray(detail)) {
          for (const field of detail) {
            if (field.field_type === 'phone') {
              // Phones
              const { phone_type, phone_number, is_private, do_not_text } = field;
              const number = phone_number.trim();
              if (phone_type !== null && number) {
                profile.phones.push({
                  type: phone_type,
                  number: phone_number,
                  private: is_private === '1',
                  disableText: do_not_text === '1',
                });
              }
            }
            // Email
            else if (field.field_type === 'email_primary') {
              const address = field.address.trim();
              const { is_private, allow_bulk } = field;
              if (address) {
                profile.email = {
                  address,
                  private: is_private === '1',
                  bulk: allow_bulk === '1',
                };
              }
            }
            // Address
            else if (field.field_type === 'address_primary') {
              const { street_address, city, state, zip, latitude, longitude, is_private } = field;
              if (street_address) {
                profile.address = {
                  street1: street_address.split('<br />')[0]?.trim() || null,
                  street2: street_address.split('<br />')[1]?.trim() || null,
                  city: city.trim() || null,
                  state: state.trim() || null,
                  zip: zip.trim() || null,
                  lat: latitude.trim() || null,
                  lng: longitude.trim() || null,
                  private: is_private === '1',
                };
              }
            }
            // Custom checkboxes ( joined into string separated by interpunct: ` · `)
            else {
              const match = customFieldIds[key];
              const value = field.name?.trim() || null;
              if (match && value) {
                profile.custom[match] = profile.custom[match]
                  ? [profile.custom[match], value].join(' · ')
                  : value;
              }
            }
          }
        }
        // Custome/user-specified fields to match and assign
        else {
          const match = customFieldIds[key];
          const value =
            (typeof detail === 'string' ? detail?.trim() : detail?.name?.trim()) || null;
          if (match && value) {
            profile.custom[match] = value;
            // If value is date, convert to ISO `YYYY-MM-DD` and override
            const dateArray = value.split('/');
            if (dateArray.length === 3) {
              const month = Number(dateArray[0]);
              const day = Number(dateArray[1]);
              const year = Number(dateArray[1]);
              const validMonth = month >= 1 && month <= 12;
              const validDay = day >= 1 && day <= 31;
              const validYear = year >= 0 && year <= 9999;
              if (validMonth && validDay && validYear) {
                profile.custom[match] = `${year}-${month}-${day}`;
              }
            }
          }
        }
      }
      profiles.push(profile);
    }
    return profiles;
  }
}

//////////////////
// RETURN TYPES //
//////////////////
export interface BreezePerson {
  /** A person's unique Breeze Identifier */
  id: string;
  /** A person's specified/legal first name */
  first_name: string;
  /** A person's nickname (if present)—legal first name otherwise */
  force_first_name: string;
  /** A person's last name */
  last_name: string;
  /** Relative file path to person's profile image */
  path: string;
}
export interface BreezePersonDetail extends BreezePerson {
  /** Person's nickname */
  nick_name: string;
  /** Person's middle name */
  middle_name: string;
  /** Person's maiden name */
  maiden_name: string;
  /** Person's maiden name */
  details: {
    /** Matches `id` value in root of object */
    person_id: string;
    /** ISO value for date of birth.
     *
     * _(Ex. `2000-01-30`)_ */
    birthdate?: string;
    /** Year in which student graduates */
    grade: string;
    [key: string]: //
    /** Phone numbers for this person (home, mobile, and work) */
    | [PhoneDetail<'home'>, PhoneDetail<'mobile'>, PhoneDetail<'work'>]
      /** Primary email address for this person */
      | [EmailDetail]
      /** Primary/home address for this person */
      | [AddressDetail]
      /** Custom checkbox fields */
      | { field_type: undefined; value: string; name: string }[]
      /** Custom non-checkbox field values */
      | { value: string; name: string }
      /** IGNORE: Only here to satisfy prior detail values */
      | string
      | undefined;
  };
  /** Array of family IDs */
  family: string[];
}
interface PhoneDetail<T extends 'home' | 'mobile' | 'work'> {
  field_type: 'phone';
  phone_number: string;
  phone_type: T | null;
  do_not_text: '0' | '1' | null;
  is_private: '0' | '1' | null;
}
interface EmailDetail {
  field_type: 'email_primary';
  address: string;
  is_primary: '0' | '1';
  allow_bulk: '0' | '1';
  is_private: '0' | '1';
}
interface AddressDetail {
  field_type: 'address_primary';
  street_address: string;
  city: string;
  state: string;
  zip: string;
  longitude: string;
  latitude: string;
  is_primary: '0' | '1';
  is_private: '0' | '1';
}

export interface PersonProfile<T extends string = never> {
  id: string;
  img: string | null;
  name: {
    first: string | null;
    last: string;
    legal: string | null;
    middle: string | null;
    maiden: string | null;
  };
  birthday: string | null;
  grade: string | null;
  phones: {
    type: 'home' | 'mobile' | 'work';
    number: string;
    private: boolean;
    disableText: boolean;
  }[];
  email: { address: string; private: boolean; bulk: boolean } | null;
  address: {
    street1: string | null;
    street2: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    lat: string | null;
    lng: string | null;
    private: boolean;
  } | null;
  custom: { [K in T]: string | null };
  // custom: T extends string ? { [K in T]: string | null } : {};
  // custom: { [K in T]: string | null };
  // custom: { [K in keyof T]: string | null };
  // custom: { [key: string]: { name: T[number]; value: string | null } };
}

export interface ProfileSection {
  /** Unique Breeze ID for object */
  id: string;
  /** ID of the current Breeze organization */
  oid: string;
  /** ID for this profile section. */
  section_id: string;
  /** Name of the profile section */
  name: string;
  /** Column in which this section appears. _(1st or 2nd)_ */
  column_id: '1' | '2';
  /** Position in profile in which this section appears.
   *
   * This is a stringified number. _(ex. `'1'` or `'42'`)_ */
  position: string;
  /** Profile ID is an ID that appears and is the same across all
   * profile sections and fields */
  profile_id: string;
  /** Profile section creation date/time in ISO format: `YYYY-MM-DD HH:MM:SS`
   *
   * _(Ex. `2020-01-30 14:00:00`)_ */
  created_on: string;
  fields: (FieldWithOptions | FieldWithoutOptions)[];
}
export interface ProfileField {
  /** Unique Breeze ID for object */
  id: string;
  /** ID of the current Breeze organization */
  oid: string;
  /** ID for this profile field.
   *
   * *NOTE:* This should be used to match with person's details instead of `id` value */
  field_id: string;
  /** Matches ID of parent section's `section_id` */
  profile_section_id: string;
  /** Label dexcribing type of field. _(ex. 'paragraph' or 'multiple_choice')_ */
  field_type: string;
  /** Custom name or title for this field */
  name: string;
  /** Position in profile in which this field appears.
   *
   * This is a stringified number. _(ex. `'1'` or `'42'`)_ */
  position: string;
  /** Profile ID is an ID that appears and is the same across all
   * profile sections and fields */
  profile_id: string;
  /** Profile field creation date/time in ISO format: `YYYY-MM-DD HH:MM:SS`
   *
   * _(Ex. `2020-01-01 14:00:00`)_ */
  created_on: string;
}
interface FieldWithoutOptions extends ProfileField {
  field_type: //
  // Built-in/locked types
  | 'family'
    | 'name'
    | 'birthdate'
    | 'grade'
    | 'phone'
    | 'email'
    | 'address'
    // Custom types
    | 'paragraph'
    | 'single_line'
    | 'notes'
    | 'date'
    | 'file';
  options: [];
}
interface FieldWithOptions extends ProfileField {
  field_type: 'multiple_choice' | 'dropdown';
  options: FieldOptions[];
}
interface FieldOptions {
  /** Unique Breeze ID for object */
  id: string;
  /** ID of the current Breeze organization */
  oid: string;
  /** ID for this profile field option.
   *
   * Can be used to compared/matched in a person's `value` attribute in details ' */
  option_id: string;
  /** Matches ID of parent field's `field_id` */
  profile_field_id: string;
  /** Custom name or value for this field option */
  name: string;
  /** Position in profile in which this field option appears.
   *
   * This is a stringified number. _(ex. `'1'` or `'42'`)_ */
  position: string;
  /** Profile ID is an ID that appears and is the same across all
   * profile sections and fields */
  profile_id: string;
  /** Profile field option creation date/time in ISO format: `YYYY-MM-DD HH:MM:SS`
   *
   * _(Ex. `2020-01-30 14:00:00`)_ */
  created_on: string;
}

///////////////////
// Method Params //
///////////////////
interface ListParams {
  /** Option to return all information (slower) or just names.
   *
   * 1 = get all information pertaining to person
   *
   * 0 = only get id and name
   *
   * @default 0 (just names)
   * */
  details?: 1 | 0;
  /** Option to filter through results based on criteria (tags, status, etc).
   *
   * Refer to `breeze.people.profile()` response to know values to search for or if you're
   * hard-coding the field ids, watch the URL bar when filtering for people
   * within Breeze's people filter page and use the variables you see listed.
   *
   * @default undefined (no filter)
   * */
  filter_json?: { [key: string]: string };
  /**
   * Number of people to return. If 0 or not present, will return all people.
   *
   * @default 0 (no limit)
   */
  limit?: number;
  /**
   * Number of people to skip before beginning to return results.
   *
   * Can be used in conjunction with limit for pagination.
   *
   * @default 0 (no offset)
   * */
  offset?: number;
}

interface GetParams {
  /** Option to return all information (slower) or just names.
   *
   * 1 = get all information pertaining to person
   *
   * 0 = only get id and name
   *
   * @default 1 (shows all info )
   * */
  details?: 1 | 0;
}

interface ListProfilesParams<T extends string = never> {
  /** Option to filter through results based on criteria (tags, status, etc).
   *
   * Refer to `breeze.people.profile()` response to know values to search for or if you're
   * hard-coding the field ids, watch the URL bar when filtering for people
   * within Breeze's people filter page and use the variables you see listed.
   *
   * @default undefined (no filter)
   * */
  filter_json?: { [key: string]: string };
  /**
   * Number of people to return. If 0 or not present, will return all people.
   *
   * @default 0 (no limit)
   */
  limit?: number;
  /**
   * Number of people to skip before beginning to return results.
   *
   * Can be used in conjunction with limit for pagination.
   *
   * @default 0 (no offset)
   * */
  offset?: number;
  /**
   * Name of custom fields to be matched up and included with each person result.
   *
   * *NOTE:* This finds the first field that matches, so it's encouraged to use
   * only fields unique names.
   *
   * _(ex. ['Gender','Marital Status', 'School'])_
   * */
  customFields?: T[];
}
