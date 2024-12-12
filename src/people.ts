import { AxiosInstance } from 'axios';

// Helper functions, types and defaults
const BREEZE_FILES_URL = 'https://files.breezechms.com/';

type Lookup = string | readonly string[];
// type Lookup = string | readonly string[];
type LookupKeys<L extends Lookup> = L extends readonly string[] ? L[0] : L;
const DEFAULT_FIELDS = [
  // Built-in
  'name',
  'phone',
  'email',
  'address',
  'family',
  // Pre-defined
  ['birthday', 'age'],
  ['gender', 'genderidentity', 'sex'],
  'status',
  'campus',
  ['maritalStatus', 'marriageStatus', 'relationshipStatus'],
  [
    'anniversary',
    'marriedon',
    'marriagedate',
    'weddingdate',
    'dateofwedding',
    'dateofmarriage',
    'anniversarydate',
    'weddinganniversary',
    'marriageanniversary',
    'weddinganniversarydate',
    'marriageanniversarydate',
  ],
  ['joinDate', 'datejoined'],
  ['school', 'highschool', 'college', 'university'],
  'grade',
  ['employer', 'employment', 'job', 'work', 'workplace'],
] as const;
const PREDEFINED_FIELDS = [
  'birthday',
  'gender',
  'status',
  'campus',
  'maritalStatus',
  'anniversary',
  'joinDate',
  'school',
  'grade',
  'employer',
] as const;

/** A fuzzy value is one that is all alphanumeric and lowercase
 * (without spaces or symbols) used liberally for comparisons.
 *
 * Ex. `fuzzy('3-Blind mice!') === '3blindmice'` */
const fuzzy = (val: string) => val.replace(/[^A-Z0-9]/gi, '').toLowerCase();
/** Identify if a string value is a date in MM/DD/YYYY and return in ISO format (YYYY-MM-DD) */
const makeDateIso = (val: string) => {
  const dateArray = val.split('/');
  if (dateArray.length === 3) {
    const month = Number(dateArray[0]);
    const day = Number(dateArray[1]);
    const year = Number(dateArray[2]);
    const validMonth = month >= 1 && month <= 12;
    const validDay = day >= 1 && day <= 31;
    const validYear = year >= 0 && year <= 9999;
    if (validMonth && validDay && validYear) {
      return `${dateArray[2]}-${dateArray[0]}-${dateArray[1]}`;
    }
  }
  return val;
};

// Class definition
export default class People {
  /** Callable http client with url and api key initialized */
  private axios: AxiosInstance;
  constructor(axios: AxiosInstance) {
    this.axios = axios;
    // Need to bind `this` for each .api sub-method
    this.api.get = this.api.get.bind(this);
    this.api.list = this.api.list.bind(this);
    this.api.add = this.api.add.bind(this);
    this.api.update = this.api.update.bind(this);
    this.api.delete = this.api.delete.bind(this);
    this.api.profileFields = this.api.profileFields.bind(this);
  }

  /** Private/internal helper to format profile properly */
  private formatPersonProfile<L extends Lookup = never>({
    person,
    fields,
    lookupFields,
  }: {
    person: BreezePersonDetail;
    fields: readonly L[];
    lookupFields: LookupField<L>[];
  }) {
    const {
      id,
      path,
      force_first_name,
      last_name,
      nick_name,
      middle_name,
      maiden_name,
      details,
      family,
    } = person;
    // Format name
    const first = force_first_name.trim();
    const last = last_name.trim();
    const nick = nick_name.trim() || null;
    const middle = middle_name.trim() || null;
    const maiden = maiden_name.trim() || null;
    const name = { first, last, nick, middle, maiden };

    // Find family role
    let familyRole: Person['familyRole'] = 'Unassigned';
    for (const { person_id, role_name } of family) {
      if (person_id === id) {
        familyRole = role_name;
        break;
      }
    }

    // Other default fields
    const birthday = details.birthdate || null;
    const grade = details.grade || null;
    const profile: Person<LookupKeys<L>> = {
      id,
      img: path.includes('generic') ? null : BREEZE_FILES_URL + path,
      name,
      phones: [],
      email: null,
      address: null,
      birthday,
      anniversary: null,
      gender: null,
      status: null,
      campus: null,
      maritalStatus: null,
      joinDate: null,
      school: null,
      grade,
      employer: null,
      familyRole,
      family,
      fields: Object.assign(
        {},
        ...fields.map((key) => ({ [Array.isArray(key) ? key[0] : key]: null })),
      ),
    };
    // Loop through all details on Breeze person
    for (const detailId of Object.keys(details)) {
      // Handle each detail value
      const detail = details[detailId];
      if (typeof detail === 'undefined') continue;

      // Phones, email, and address (and custom checkboxes) are only values in arrays
      if (Array.isArray(detail)) {
        for (const field of detail) {
          // Phones
          if (field.field_type === 'phone') {
            const { phone_type, phone_number, is_private, do_not_text } = field;
            const number = phone_number.trim();
            if (phone_type !== null && number) {
              profile.phones.push({
                type: phone_type,
                number,
                private: is_private === '1',
                disableText: do_not_text === '1',
              });
            }
            continue;
          }
          // Email
          if (field.field_type === 'email_primary') {
            const address = field.address.trim();
            const { is_private, allow_bulk } = field;
            if (address) {
              profile.email = {
                address,
                private: is_private === '1',
                bulk: allow_bulk === '1',
              };
            }
            continue;
          }
          // Address
          if (field.field_type === 'address_primary') {
            const { street_address, city, state, zip, latitude, longitude, is_private } = field;
            if (street_address) {
              const addressParts = street_address.split(/<br\s*\/?>/);
              profile.address = {
                street1: addressParts[0]?.trim() || null,
                street2: addressParts[1]?.trim() || null,
                city: city.trim() || null,
                state: state.trim() || null,
                zip: zip.trim() || null,
                lat: latitude.trim() || null,
                lng: longitude.trim() || null,
                private: is_private === '1',
              };
            }
            continue;
          }
          // Custom checkboxes ( joined into string separated by interpunct: ` · `)
          const match = lookupFields.find(({ field_id }) => field_id === detailId);
          // const match = customFieldIds[detailKey];
          const value = field.name?.trim() || null;
          if (!match || !value) continue;
          const key = match.key as LookupKeys<L>;
          const existingValue = profile.fields[key];
          profile.fields[key] = existingValue ? [existingValue, value].join(' · ') : value;
        }
        continue;
      }

      // Custom/user-specified fields to match and assign
      const match = lookupFields.find(({ field_id }) => field_id === detailId);
      // Handle files types (prepend host and use 'detail.value' instead of 'detail. name')
      if (match?.field_type === 'file' && typeof detail !== 'string' && detail.value) {
        const key = match.key as LookupKeys<L>;
        const value = BREEZE_FILES_URL + detail.value;
        profile.fields[key] = value;
        continue;
      }
      const value = (typeof detail === 'string' ? detail?.trim() : detail?.name?.trim()) || null;
      if (!match || !value) continue;
      // For predefined fields (birthday, gender, status, campus, maritalStatus, anniversary, school, grade, or employer)
      const predefinedKey = match.key as (typeof PREDEFINED_FIELDS)[number];
      if (PREDEFINED_FIELDS.includes(predefinedKey)) {
        profile[predefinedKey] = ['anniversary', 'joinDate'].includes(predefinedKey)
          ? makeDateIso(value)
          : value;
        continue;
      }
      // Not predefined
      const key = match.key as LookupKeys<L>;
      profile.fields[key] = makeDateIso(value);
    }

    return profile;
  }
  /** Get individual person record in your Breeze database with profile fields formatted and merged in.
   *
   * [View docs for `people.get()`](https://github.com/Notebird-App/breeze-chms/blob/main/docs/People.md#peopleget) */
  async get<L extends Lookup = never>(id: string, { fields = [] }: GetParams<L> = {}) {
    const [lookupFields, person] = await Promise.all([
      this.profileFields({ fields }),
      this.apiGet(id, { details: 1 }),
    ]);
    return this.formatPersonProfile({ person, fields, lookupFields });
  }
  /** List people in your Breeze database with profile fields formatted and merged in.
   *
   * [View docs for `people.list()`](https://github.com/Notebird-App/breeze-chms/blob/main/docs/People.md#peoplelist) */
  async list<L extends Lookup = never>({
    filter_json,
    limit,
    offset,
    fields = [],
  }: ListParams<L> = {}) {
    const [lookupFields, people] = await Promise.all([
      this.profileFields({ fields }),
      this.apiList({ details: 1, filter_json, limit, offset }),
    ]);
    return people.map((person) => this.formatPersonProfile({ person, fields, lookupFields }));
  }
  /** Update a person in your Breeze database with profile fields matched and formatted.
   *
   * [View docs for `people.update()`](https://github.com/Notebird-App/breeze-chms/blob/main/docs/People.md#peopleupdate) */
  async update(
    id: string,
    {
      name = {},
      birthday,
      phones = {},
      email,
      address,
      familyRole,
      fields = {},
      ...predefined
    }: UpdateParams,
  ) {
    const fields_json: ApiUpdateParams['fields_json'] = [];

    const profileFields = await this.profileFields({ fields: Object.keys(fields) });
    profileFieldsLoop: for (const profileField of profileFields) {
      const { field_id, field_type, options } = profileField;
      // For default fields (name, birthday, phone, email, address)
      switch (field_type) {
        // Handle all different parts of name
        case 'name':
          for (const namePart of Object.keys(name) as (keyof typeof name)[]) {
            if (typeof name[namePart] === 'undefined') continue;
            const value = `${name[namePart] || ''}`.trim();
            fields_json.push({
              field_id,
              field_type: 'name',
              response: 'undefined',
              details: { value, part: `${namePart}_name`, person_id: id },
            });
          }
          continue profileFieldsLoop;
        // Handle birthday
        case 'birthdate':
          if (typeof birthday === 'undefined') break;
          const response = birthday?.trim() ?? '';
          fields_json.push({ field_id, field_type: 'birthdate', response });
          continue profileFieldsLoop;
        // Handle all different parts of phone
        case 'phone':
          for (const phonePart of Object.keys(phones) as (keyof typeof phones)[]) {
            if (typeof phones[phonePart] === 'undefined') break;
            const value = `${phones[phonePart] || ''}`.trim();
            fields_json.push({
              field_id,
              field_type: 'phone',
              response: true,
              details: { [`phone_${phonePart}`]: value },
            });
          }
          continue profileFieldsLoop;
        // Handle email address
        case 'email':
          if (typeof email === 'undefined') break;
          const value = email?.trim() ?? '';
          fields_json.push({
            field_id,
            field_type: 'email',
            response: true,
            details: { address: value },
          });
          continue profileFieldsLoop;
        // Handle mailing address
        case 'address':
          if (typeof address === 'undefined') continue profileFieldsLoop;
          const details = { street_address: '', city: '', state: '', zip: '' };
          if (address !== null) {
            const { street1, street2, city, state, zip } = address;
            const line1 = street1?.trim() ?? '';
            const line2 = street2?.trim() ?? '';
            const separator = line1 && line2 ? '<br>' : '';
            details.street_address = line1 + separator + line2;
            details.city = city?.trim() ?? '';
            details.state = state?.trim() ?? '';
            details.zip = zip?.trim() ?? '';
          }
          fields_json.push({ field_id, field_type: 'address', response: true, details });
          continue profileFieldsLoop;
        // Handle family role
        case 'family':
          if (typeof familyRole === 'undefined') continue profileFieldsLoop;
          const roles: { [K in Person['familyRole']]: string } = {
            Unassigned: '1',
            Child: '2',
            Adult: '3',
            'Head of Household': '4',
            Spouse: '5',
          };
          const role_id = roles[familyRole];
          fields_json.push({
            field_id,
            field_type: 'family_role',
            response: 'undefined',
            details: { person_id: id, role_id },
          });
          continue profileFieldsLoop;
      }
      // For predefined fields (gender, status, campus, maritalStatus, school, grade, or employer)
      const predefinedKey = profileField.key as (typeof PREDEFINED_FIELDS)[number];
      if (PREDEFINED_FIELDS.includes(predefinedKey) && predefinedKey !== 'birthday') {
        if (typeof predefined[predefinedKey] === 'undefined') continue;
        const value = `${predefined[predefinedKey] || ''}`.trim();
        if (['multiple_choice', 'dropdown'].includes(field_type)) {
          // If value unset, clear value in Breeze
          if (!value) {
            const response = field_type === 'dropdown' ? 'BLANK' : '';
            fields_json.push({ field_id, field_type, response });
            continue;
          }
          // Otherwise, lookup option id
          let response = '';
          const fuzzyValue = fuzzy(value);
          let matchOption = options.find((option) => fuzzy(option.name) === fuzzyValue)?.option_id;
          // For gender, 'm' should match male and 'f' should match female too!
          if (!matchOption && predefinedKey === 'gender') {
            const fuzzyValue = fuzzy(value.substr(0, 1));
            matchOption = options.find(
              (option) => fuzzy(option.name.substr(0, 1)) === fuzzyValue,
            )?.option_id;
          }
          if (!matchOption) continue;
          response = matchOption;
          fields_json.push({ field_id, field_type: 'radio', response });
          continue;
        }
        const response = value;
        fields_json.push({ field_id, field_type, response });
        continue;
      }
      // For custom defined fields
      if (typeof fields[profileField.key] === 'undefined') continue;
      const fieldsValue = fields[profileField.key];
      // Multi-choice custom-fields
      if (['multiple_choice', 'dropdown'].includes(field_type)) {
        const value = (Array.isArray(fieldsValue) ? fieldsValue[0] : fieldsValue?.trim()) || '';
        // If value unset, clear value in Breeze
        if (!value) {
          const response = field_type === 'dropdown' ? 'BLANK' : '';
          fields_json.push({ field_id, field_type, response });
          continue;
        }
        // Otherwise, lookup option id
        let response = '';
        const fuzzyValue = fuzzy(value);
        let matchOption = options.find((option) => fuzzy(option.name) === fuzzyValue)?.option_id;
        if (!matchOption) continue;
        response = matchOption;
        fields_json.push({ field_id, field_type: 'radio', response });
        continue;
      }
      // Deal with checkboxes that can have multiple values
      if (field_type === 'checkbox') {
        const clearCheckbox = Array.isArray(fieldsValue)
          ? fieldsValue.length === 0
          : !fieldsValue?.trim();
        if (clearCheckbox) {
          fields_json.push({ field_id, field_type, response: '' });
          continue;
        }
        const fuzzyValues = (
          Array.isArray(fieldsValue) ? fieldsValue : fieldsValue?.split(' · ') || []
        ).map(fuzzy);
        for (const option of options) {
          const matchFound = fuzzyValues.includes(fuzzy(option.name));
          if (!matchFound) continue;
          fields_json.push({ field_id, field_type, response: option.option_id });
        }
        continue;
      }
      // If we got here, it's a custom, single-line response
      const response = (Array.isArray(fieldsValue) ? fieldsValue[0] : fieldsValue?.trim()) || '';
      fields_json.push({ field_id, field_type, response });
    }
    await this.apiUpdate(id, { fields_json });
    return fields_json;
  }
  /** Add a person to your Breeze database with profile fields matched and formatted.
   *
   * [View docs for `people.add()`](https://github.com/Notebird-App/breeze-chms/blob/main/docs/People.md#peopleadd) */
  async add(params: AddParams) {
    // Add person initially, primarily to get an id
    const addedPerson = await this.apiAdd({
      first: params.name.first.trim(),
      last: params.name.last.trim(),
    });
    // With that ID, update all other fields
    await this.update(addedPerson.id, params);
    return addedPerson.id;
  }
  /** Delete a person from your Breeze database. (This is an alias for `people.api.delete()`)*/
  delete = this.apiDelete;
  /** Get information about user-defined profile fields in your Breeze database
   * keyed by the field's name with auto-lookup based on an array of strings.
   *
   * [View docs for `people.profileFields()`](https://github.com/Notebird-App/breeze-chms/blob/main/docs/People.md#peopleprofilefields) */
  async profileFields<L extends Lookup = never>({ fields = [] }: { fields?: readonly L[] } = {}) {
    const profileFields = await this.apiProfileFields({ removeSections: true });
    const lookupFields: LookupField<L>[] = [];
    for (const key of [...DEFAULT_FIELDS, ...fields]) {
      for (const profileField of profileFields) {
        const keyMatch = Array.isArray(key) ? key.map(fuzzy) : [fuzzy(key as string)];
        const nameMatch = fuzzy(profileField.name);
        if (keyMatch.includes(nameMatch)) {
          const mainKey = Array.isArray(key) ? key[0] : key;
          lookupFields.push({ key: mainKey, ...profileField });
          break;
        }
      }
    }
    return lookupFields;
  }

  // Native APIs as refelcted in Breeze Docs
  /** Get individual person record in your Breeze database. */
  private apiGet(id: string, params: { details: 0 }): Promise<BreezePerson>;
  private apiGet(id: string, params?: { details?: 1 }): Promise<BreezePersonDetail>;
  private async apiGet(id: string, params: ApiGetParams = {}) {
    const { data } = await this.axios.get('people/' + id, { params });
    if (data.success === false) throw new Error(data.errors[0]);
    return data;
  }
  /** Retrieve a list of people in your Breeze database. */
  private apiList(params?: { details?: 0 } & ApiListParams): Promise<BreezePerson[]>;
  private apiList(params: { details: 1 } & ApiListParams): Promise<BreezePersonDetail[]>;
  private async apiList({ filter_json, ...params }: ApiListParams = {}) {
    const { data } = await this.axios.get('people', {
      params: filter_json ? { filter_json: JSON.stringify(filter_json), ...params } : params,
    });
    if (data.success === false) throw new Error(data.errors[0]);
    return data;
  }
  /** Update a person in your Breeze database. */
  private async apiUpdate(id: string, { fields_json }: ApiUpdateParams) {
    const { data } = await this.axios.get('people/update', {
      params: { person_id: id, fields_json: JSON.stringify(fields_json) },
    });
    if (data.success === false) throw new Error(data.errors[0]);
    return data as BreezePerson;
  }
  /** Add a person to your Breeze database. */
  private async apiAdd({ first = '', last = '', fields_json = [] }: ApiAddParams = {}) {
    const { data } = await this.axios.get('people/add', {
      params: { first, last, fields_json: JSON.stringify(fields_json) },
    });
    if (data.success === false) throw new Error(data.errors[0]);
    return data as BreezePerson;
  }
  /** Delete a person from your Breeze database. */
  private async apiDelete(id: string) {
    const { data } = await this.axios.get('people/delete', { params: { person_id: id } });
    if (data.success === false) throw new Error(data.errors[0]);
  }
  /** Get information about user-defined profile fields in your Breeze database. */
  private apiProfileFields(params?: { removeSections?: false }): Promise<ProfileSection[]>;
  private apiProfileFields(params?: {
    removeSections: true;
  }): Promise<(FieldWithoutOptions | FieldWithOptions)[]>;
  private async apiProfileFields({ removeSections }: { removeSections?: boolean } = {}) {
    const { data } = await this.axios.get('profile');
    if (data.success === false) throw new Error(data.errors[0]);
    return removeSections
      ? (data as any[]).reduce((arr, { fields }) => (fields ? [...arr, ...fields] : arr), [])
      : data;
  }
  /** These methods are meant to mirror the API as it's described in the
   * [official Breeze documentation](https://app.breezechms.com/api#people),
   * but the [primary people methods](https://github.com/Notebird-App/breeze-chms/blob/main/docs/People.md#people)
   * are generally preferred for their ease-of-use. */
  api = {
    /** Get individual person record in your Breeze database.
     *
     * **NOTE:** For most cases, it's recommended to instead use
     * `people.get()` as it returns a result in a more consumable format.
     *
     * [View docs for `people.api.get()`](https://github.com/Notebird-App/breeze-chms/blob/main/docs/People.md#peopleapiget) */
    get: this.apiGet,
    /** Retrieve a list of people in your Breeze database.
     *
     * **NOTE:** For most cases, it's recommended to instead use
     * `people.list()` as it returns results in a more consumable format.
     *
     * [View docs for `people.api.list()`](https://github.com/Notebird-App/breeze-chms/blob/main/docs/People.md#peopleapilist) */
    list: this.apiList,
    /** Update a person in your Breeze database.
     *
     * **NOTE:** For most cases, it's recommended to instead use
     * `people.update()` as it allows you to construct the person object in a more friendly format.
     *
     * [View docs for `people.api.update()`](https://github.com/Notebird-App/breeze-chms/blob/main/docs/People.md#peopleapiupdate) */
    update: this.apiUpdate,
    /** Add a person to your Breeze database.
     *
     * * **NOTE:** For most cases, it's recommended to instead use
     * `people.add()` as it allows you to construct the person object in a more friendly format.
     *
     * [View docs for `people.api.add()`](https://github.com/Notebird-App/breeze-chms/blob/main/docs/People.md#peopleapiadd) */
    add: this.apiAdd,
    /** Delete a person from your Breeze database.
     *
     * **NOTE:** This is the same as `people.delete()`
     *
     * [View docs for `people.api.delete()`](https://github.com/Notebird-App/breeze-chms/blob/main/docs/People.md#peopleapidelete) */
    delete: this.apiDelete,
    /** Get information about user-defined profile fields in your Breeze database.
     *
     * * **NOTE:** For most cases, it's recommended to instead use
     * `people.profileFields()` as it returns results in a more consumable format.
     *
     * [View docs for `people.api.profileFields()`](https://github.com/Notebird-App/breeze-chms/blob/main/docs/People.md#peopleapiprofilefields) */
    profileFields: this.apiProfileFields,
  };
}

//////////////////
// RETURN TYPES //
//////////////////
// Sections and Fields
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
  | 'name'
    | 'birthdate'
    | 'grade'
    | 'phone'
    | 'email'
    | 'address'
    | 'family'
    // Custom types
    | 'paragraph'
    | 'single_line'
    | 'notes'
    | 'date'
    | 'file';
  options: [];
}
interface FieldWithOptions extends ProfileField {
  field_type: 'multiple_choice' | 'dropdown' | 'checkbox';
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
type LookupField<T extends Lookup> = {
  key: LookupKeys<T | (typeof DEFAULT_FIELDS)[number]>;
} & (FieldWithoutOptions | FieldWithOptions);
// Person
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
type FamilyRole = 'Unassigned' | 'Child' | 'Adult' | 'Head of Household' | 'Spouse';
interface FamilyProfile {
  id: string;
  oid: string;
  person_id: string;
  family_id: string;
  family_role_id: '1' | '2' | '3' | '4' | '5';
  created_on: string;
  role_name: FamilyRole;
  role_id: '1' | '2' | '3' | '4' | '5';
  order: string;
  details: BreezePerson;
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
  /** Array of family info */
  family: FamilyProfile[];
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
export type Person<T extends string = never> = {
  id: string;
  img: string | null;
  name: {
    first: string;
    last: string;
    nick: string | null;
    middle: string | null;
    maiden: string | null;
  };
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
  familyRole: FamilyRole;
  family: FamilyProfile[];
  fields: { [K in T]: string | null };
} & { [K in (typeof PREDEFINED_FIELDS)[number]]: string | null };

///////////////////
// Method Params //
///////////////////
// Get
export interface ApiGetParams {
  /** Option to return all information (slower) or just basic info.
   *
   * 1 = get all information pertaining to person
   *
   * 0 = only get id and name
   *
   * @default 1 (shows all info )
   * */
  details?: 1 | 0;
}
export interface GetParams<L extends Lookup = never> {
  /**
   * Array of custom fields to be matched up and included with each person result.
   *
   * **NOTE:** This finds the first field that matches, so it's encouraged to use
   * only fields unique names.
   *
   * _(ex. ['Service', 'Room Number'])_
   * */
  fields?: readonly L[];
}
// List
export interface ApiListParams {
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
   * Refer to `people.profileFields()` response to know values to search for or if you're
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
export interface ListParams<L extends Lookup = never> {
  /** Option to filter through results based on criteria (tags, status, etc).
   *
   * Refer to `breeze.people.fields()` response to know values to search for or if you're
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
   * Array of custom fields to be matched up and included with each person result.
   *
   * **NOTE:** This finds the first field that matches, so it's encouraged to use
   * only fields unique names.
   *
   * _(ex. ['Service', 'Room Number'])_
   * */
  fields?: readonly L[];
}
// Update
export interface ApiUpdateParams {
  /** Additional fields to update. These fields are passed as a JSON encoded array of fields,
   * each containing a field id, field type, response, and in some cases, more information.
   * The field information itself can be found on `people.profileFields()`. */
  fields_json: {
    field_id: string;
    field_type: string;
    response: string | true;
    details?: string | { [key: string]: string };
  }[];
}
export interface UpdateParams {
  /** Person's name parts to update */
  name?: {
    /** Value to update person's first name with */
    first?: string | null;
    /** Value to update person's last name with */
    last?: string | null;
    /** Value to update person's nick name with */
    nick?: string | null;
    /** Value to update person's middle name with */
    middle?: string | null;
    /** Value to update person's maiden name with */
    maiden?: string | null;
  };
  /** Value to update person's birthday with (in ISO format `YYYY-MM-DD` OR `MM/DD/YYYY`) */
  birthday?: string | null;
  /** Value to update person's email with. */
  email?: string | null;
  /** Person's phone parts to update */
  phones?: {
    /** Value to update person's mobile phone with */
    mobile?: string | null;
    /** Value to update person's home phone with */
    home?: string | null;
    /** Value to update person's work phone with */
    work?: string | null;
  };
  /** Person's address parts to update */
  address?: {
    /** Value to update person's street address 1 with */
    street1?: string | null;
    /** Value to update person's street address 2 with */
    street2?: string | null;
    /** Value to update person's city with */
    city?: string | null;
    /** Value to update person's state with */
    state?: string | null;
    /** Value to update person's zip code with */
    zip?: string | null;
  } | null;
  /** Value to update person's gender with */
  gender?: string | null;
  /** Value to update person's status with */
  status?: string | null;
  /** Value to update person's campus with */
  campus?: string | null;
  /** Value to update person's maritalStatus with */
  maritalStatus?: string | null;
  /** Value to update person's anniversary with */
  anniversary?: string | null;
  /** Value to update person's join date with */
  joinDate?: string | null;
  /** Value to update person's school with */
  school?: string | null;
  /** Value to update person's grade with */
  grade?: string | null;
  /** Value to update person's employer with */
  employer?: string | null;
  /** Value to update person's family role with */
  familyRole?: FamilyRole;
  /** User-defined fields to update */
  fields?: { [key: string]: string | null | string[] };
}
// Add
export interface ApiAddParams {
  /** New person's first name */
  first?: string;
  /** New person's last name */
  last?: string;
  /** Any other fields to add.
   *
   * Additional fields to include. These fields are passed as a JSON encoded array of fields,
   * each containing a field id, field type, response, and in some cases, more information.
   * The field information itself can be found with `people.profileFields()`.
   * */
  fields_json?: {
    field_id: string;
    field_type: string;
    response: string | true;
    details?: string | { [key: string]: string };
  }[];
}
export interface AddParams extends UpdateParams {
  /** New person's name parts */
  name: {
    /** New person's first name */
    first: string;
    /** New person's last name */
    last: string;
    /** New person's nick name */
    nick?: string;
    /** New person's middle name */
    middle?: string;
    /** New person's maiden name */
    maiden?: string;
  };
}
