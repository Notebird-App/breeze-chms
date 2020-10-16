import { toMatchOneOf, toMatchShapeOf } from 'jest-to-match-shape-of';
expect.extend({ toMatchOneOf, toMatchShapeOf });

import Breeze from '../breeze';
import { BreezePerson, BreezePersonDetail } from '../people';

const breeze = new Breeze(process.env.subdomain as string, process.env.key as string);
const invalidBreeze = new Breeze('invalid', 'invalid');

test("Throws 'Permission Denied' Error", async () => {
  await expect(invalidBreeze.people.list()).rejects.toBe('Permission Denied');
});

let personId = '';
const profile: BreezePerson = {
  id: '1',
  first_name: 'Bill',
  force_first_name: 'William',
  last_name: 'Frost',
  path: 'pathto/image.jpg',
};
const detailedProfile: BreezePersonDetail = {
  id: '1',
  first_name: 'Bill',
  force_first_name: 'William',
  last_name: 'Frost',
  nick_name: 'Bill',
  middle_name: 'Arthur',
  maiden_name: '',
  path: 'pathto/image.jpg',
  details: {
    person_id: '1',
    grade: '2020',
  },
  family: [],
};

// List people
test('List people response formatted correctly', async () => {
  const [person] = await breeze.people.list({ limit: 1 });
  personId = person.id;
  expect(person).toMatchShapeOf(profile);
});
test('Detailed list people response formatted correctly', async () => {
  const [person] = await breeze.people.list({ details: 1, limit: 1 });
  expect(person).toMatchShapeOf(detailedProfile);
});
test('Limit people list', async () => {
  await expect(breeze.people.list({ limit: 1 })).resolves.toHaveLength(1);
  await expect(breeze.people.list({ limit: 2 })).resolves.toHaveLength(2);
});
test('Offset people list', async () => {
  const [_, person] = await breeze.people.list({ limit: 2 });
  const [offsetPerson] = await breeze.people.list({ limit: 1, offset: 1 });
  expect(offsetPerson).toEqual(person);
});

// Get person
test('Get person response formatted correctly', async () => {
  const person = await breeze.people.get(personId);
  expect(person).toMatchShapeOf(profile);
});
test('Detailed get person response formatted correctly', async () => {
  const person = await breeze.people.get(personId, { details: 1 });
  expect(person).toMatchShapeOf(detailedProfile);
});
