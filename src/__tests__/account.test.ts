import { toMatchOneOf, toMatchShapeOf } from 'jest-to-match-shape-of';
expect.extend({ toMatchOneOf, toMatchShapeOf });

import Breeze from '../breeze';
import { AccountSummary, AccountLog, AccountLogDetail } from '../account';

test("Throws 'Permission Denied' Error", async () => {
  const invalidBreeze = new Breeze('invalid', 'invalid');
  await expect(invalidBreeze.account.summary()).rejects.toEqual(
    Error('Permission Denied - API key (invalid) does not match subdomain (invalid)'),
  );
});

// Test config
const breeze = new Breeze(process.env.subdomain as string, process.env.key as string);
const ACCOUNT_SUMMARY: AccountSummary = {
  id: 'ORG_ID',
  name: 'ORG_NAME',
  subdomain: 'ORG_SUBDOMAIN',
  status: '1',
  created_on: '2020-01-30 01:23:45',
  details: {
    timezone: 'America/New_York',
    country: {
      id: '2',
      name: 'United States of America',
      abbreviation: 'USA',
      abbreviation_2: 'US',
      currency: 'USD',
      currency_symbol: '$',
      date_format: 'MDY',
      sms_prefix: '1',
    },
  },
};
const ACCOUNT_LOG: AccountLog = {
  id: 'LOG_ID',
  oid: 'ORG_ID',
  user_id: 'USER_ID',
  action: 'person_updated',
  object_json: '"5023943"',
  created_on: '2019-08-15 04:41:10',
};
const ACCOUNT_LOG_DETAIL: AccountLogDetail = {
  ...ACCOUNT_LOG,
  details: '[{"DETAIL_KEY": "DETAIL_VALUE"}]',
};

test('Fetch account summary', async () => {
  await expect(breeze.account.summary()).resolves.toMatchShapeOf(ACCOUNT_SUMMARY);
});

test('Fetch account logs', async () => {
  const [log] = await breeze.account.logs({ action: 'person_updated' });
  expect(log).toMatchShapeOf(ACCOUNT_LOG);
  const [logDetail] = await breeze.account.logs({ action: 'person_updated', details: 1 });
  expect(logDetail).toMatchShapeOf(ACCOUNT_LOG_DETAIL);
});
