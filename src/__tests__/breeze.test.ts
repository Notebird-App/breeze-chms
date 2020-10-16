test('Env subdomain and key variables are set', () => {
  expect(process.env.subdomain).toEqual(expect.any(String));
  expect(process.env.key).toEqual(expect.any(String));
});
