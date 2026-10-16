import assert from 'node:assert/strict';
import test from 'node:test';
import { isPostgresConfigured } from '../server/db/postgres/client.js';
import { withPostgresTransaction } from '../server/db/postgres/transaction.js';

test('PostgreSQL repository foundation is disabled by default', () => {
  assert.equal(isPostgresConfigured(), false);
});

test('PostgreSQL transaction helper requires an explicit postgres configuration', async () => {
  await assert.rejects(
    () => withPostgresTransaction(async () => 1),
    /POSTGRES_NOT_CONFIGURED/
  );
});
