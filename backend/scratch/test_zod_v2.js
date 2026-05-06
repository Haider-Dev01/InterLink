const { z } = require('zod');

const optionalTrimmedString = z.preprocess((value) => {
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}, z.string().optional());

const updateMeSchema = z.object({
  firstName: optionalTrimmedString.pipe(z.string().min(2).optional()),
  lastName: optionalTrimmedString.pipe(z.string().min(2).optional()),
  bio: optionalTrimmedString.pipe(z.string().max(500).optional()),
  linkedinUrl: z.preprocess((value) => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
  }, z.string().optional()),
  githubUsername: optionalTrimmedString,
  location: optionalTrimmedString,
  availabilityMonths: z.number().int().positive().optional(),
});

const testCases = [
  { name: 'Normal', body: { firstName: 'John', lastName: 'Doe', bio: 'Hello', location: 'Paris', linkedinUrl: 'url', githubUsername: 'user' } },
  { name: 'Empty strings', body: { firstName: '', lastName: '', bio: '', location: '', linkedinUrl: '', githubUsername: '' } },
  { name: 'Nulls', body: { firstName: null, lastName: null, bio: null, location: null, linkedinUrl: null, githubUsername: null } },
  { name: 'Missing some', body: { firstName: 'John' } },
  { name: 'Long bio', body: { bio: 'a'.repeat(501) } },
  { name: 'Short name', body: { firstName: 'a' } },
];

testCases.forEach(tc => {
  console.log(`\n--- Testing: ${tc.name} ---`);
  try {
    const result = updateMeSchema.parse(tc.body);
    console.log('Success:', result);
  } catch (e) {
    console.log('Error:', e.issues.map(i => `${i.path.join('.')}: ${i.message}`));
  }
});
