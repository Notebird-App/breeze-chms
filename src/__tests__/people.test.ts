import { toMatchOneOf, toMatchShapeOf } from 'jest-to-match-shape-of';
expect.extend({ toMatchOneOf, toMatchShapeOf });

import Breeze from '../breeze';
import { AddParams, UpdateParams, Person } from '../people';

test("Throws 'Permission Denied' Error", async () => {
  const invalidBreeze = new Breeze('invalid', 'invalid');
  await expect(invalidBreeze.people.list()).rejects.toEqual(
    Error('Permission Denied - API key (invalid) does not match subdomain (invalid)'),
  );
});

// Test config
const breeze = new Breeze(process.env.subdomain as string, process.env.key as string);
let PERSON_ID = '';
const ADD_PARAMS: AddParams = {
  name: { first: 'William', last: 'Frost', nick: 'Bill', middle: 'Matthew' },
  birthday: '1980-06-14',
  email: 'Bill@email.com',
  phones: { mobile: '111-111-1111' },
  address: {
    street1: '444 Nowhere Ave',
    street2: 'Apt. 5',
    city: 'Someplace',
    state: 'OH',
    zip: '98374',
  },
  gender: 'Male',
  status: 'Visitor',
  maritalStatus: 'single',
  fields: { service: '3rd service', roomNumber: '1010' },
};
const ADD_PERSON: Person<'service' | 'roomNumber'> = {
  id: PERSON_ID,
  name: { first: 'William', last: 'Frost', nick: 'Bill', middle: 'Matthew', maiden: null },
  img: null,
  birthday: '1980-06-14',
  email: { address: 'Bill@email.com', private: false, bulk: true },
  phones: [{ type: 'mobile', number: '(111) 111-1111', private: false, disableText: false }],
  address: {
    street1: '444 Nowhere Ave',
    street2: 'Apt. 5',
    city: 'Someplace',
    state: 'OH',
    zip: '98374',
    lat: null,
    lng: null,
    private: false,
  },
  gender: 'Male',
  status: 'Visitor',
  campus: null,
  maritalStatus: 'Single',
  school: null,
  grade: null,
  employer: null,
  familyRole: 'Unassigned',
  family: [],
  fields: { service: '3rd Service', roomNumber: '1010' },
};
const UPDATE_PARAMS: UpdateParams = {
  name: { first: 'Samantha', last: 'Hargis', nick: 'Sam', middle: '', maiden: 'Martin' },
  birthday: '1975-06-22',
  email: 'sam@email.com',
  phones: { mobile: null, home: '222-222-2222', work: '333-333-3333' },
  address: null,
  gender: 'F',
  status: 'Member',
  maritalStatus: 'Married',
  fields: { service: null, roomNumber: '237' },
};
const UPDATE_PERSON: Person<'service' | 'roomNumber' | 'notFound'> = {
  id: PERSON_ID,
  name: { first: 'Samantha', last: 'Hargis', nick: 'Sam', middle: null, maiden: 'Martin' },
  img: null,
  birthday: '1975-06-22',
  email: { address: 'sam@email.com', private: false, bulk: true },
  phones: [
    { type: 'home', number: '(222) 222-2222', private: false, disableText: false },
    { type: 'work', number: '(333) 333-3333', private: false, disableText: false },
  ],
  address: null,
  gender: 'Female',
  status: 'Member',
  campus: null,
  maritalStatus: 'Married',
  school: null,
  grade: null,
  employer: null,
  familyRole: 'Unassigned',
  family: [],
  fields: { service: null, roomNumber: '237', notFound: null },
};

test('Add person', async () => {
  PERSON_ID = await breeze.people.add(ADD_PARAMS);
  await expect(
    breeze.people.get(PERSON_ID, { fields: ['service', 'roomNumber'] }),
  ).resolves.toStrictEqual({ ...ADD_PERSON, id: PERSON_ID });
});

test('Update person', async () => {
  await breeze.people.update(PERSON_ID, UPDATE_PARAMS);
  await expect(
    breeze.people.get(PERSON_ID, { fields: ['service', 'roomNumber', 'notFound'] }),
  ).resolves.toStrictEqual({ ...UPDATE_PERSON, id: PERSON_ID });
});

test('List people', async () => {
  const people = await breeze.people.list({ limit: 2 });
  expect(people.length).toEqual(2);
});

test('Delete person', async () => {
  await expect(breeze.people.delete(PERSON_ID)).resolves.toBe(undefined);
});
