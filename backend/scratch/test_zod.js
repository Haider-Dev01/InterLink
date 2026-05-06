const { z } = require('zod');

const optionalTrimmedString = z.preprocess((value) => {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}, z.string().optional());

const schema = z.object({
  firstName: optionalTrimmedString.pipe(z.string().min(2).optional()),
  lastName: optionalTrimmedString.pipe(z.string().min(2).optional()),
});

console.log('Testing empty strings:');
try {
  console.log(schema.parse({ firstName: '', lastName: '' }));
} catch (e) {
  console.log('Error for empty strings:', e.errors);
}

console.log('\nTesting 1 character strings:');
try {
  console.log(schema.parse({ firstName: 'a', lastName: 'b' }));
} catch (e) {
  console.log('Error for 1 character strings:', e.errors);
}

console.log('\nTesting missing fields:');
try {
  console.log(schema.parse({}));
} catch (e) {
  console.log('Error for missing fields:', e.errors);
}
