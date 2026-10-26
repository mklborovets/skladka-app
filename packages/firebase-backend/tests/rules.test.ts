import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { after, before, beforeEach, describe, it } from 'node:test';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

describe('Firestore Security Rules', () => {
  let testEnv: RulesTestEnvironment;

  before(async () => {
    const rules = readFileSync(
      resolve(process.cwd(), 'firestore.rules'),
      'utf8'
    );
    testEnv = await initializeTestEnvironment({
      projectId: 'demo-skladka-test',
      firestore: {
        host: process.env.FIRESTORE_EMULATOR_HOST?.split(':')[0] || '127.0.0.1',
        port: Number(process.env.FIRESTORE_EMULATOR_HOST?.split(':')[1]) || 8080,
        rules,
      },
    });
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
  });

  after(async () => {
    await testEnv.cleanup();
  });

  it('1. unauthenticated user cannot read any group document', async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      await setDoc(doc(context.firestore(), 'groups/group-1'), {
        name: 'Trip',
        memberIds: ['alice', 'bob'],
        baseCurrency: 'USD',
        balances: { alice: 0, bob: 0 },
        processedExpenseIds: [],
        updatedAt: Date.now(),
      });
    });

    const unauthDb = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(unauthDb, 'groups/group-1')));
  });

  it('2. group member can read group document', async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      await setDoc(doc(context.firestore(), 'groups/group-1'), {
        name: 'Trip',
        memberIds: ['alice', 'bob'],
        baseCurrency: 'USD',
        balances: { alice: 0, bob: 0 },
        processedExpenseIds: [],
        updatedAt: Date.now(),
      });
    });

    const aliceDb = testEnv.authenticatedContext('alice').firestore();
    await assertSucceeds(getDoc(doc(aliceDb, 'groups/group-1')));
  });

  it('3. non-member cannot read group document', async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      await setDoc(doc(context.firestore(), 'groups/group-1'), {
        name: 'Trip',
        memberIds: ['alice', 'bob'],
        baseCurrency: 'USD',
        balances: { alice: 0, bob: 0 },
        processedExpenseIds: [],
        updatedAt: Date.now(),
      });
    });

    const charlieDb = testEnv.authenticatedContext('charlie').firestore();
    await assertFails(getDoc(doc(charlieDb, 'groups/group-1')));
  });

  it('4. authenticated user can create group with themselves in memberIds', async () => {
    const aliceDb = testEnv.authenticatedContext('alice').firestore();
    await assertSucceeds(
      setDoc(doc(aliceDb, 'groups/group-new'), {
        name: 'Ski Trip',
        memberIds: ['alice'],
        baseCurrency: 'EUR',
        balances: { alice: 0 },
        processedExpenseIds: [],
        updatedAt: Date.now(),
      })
    );
  });

  it('5. user cannot create group without being in memberIds', async () => {
    const aliceDb = testEnv.authenticatedContext('alice').firestore();
    await assertFails(
      setDoc(doc(aliceDb, 'groups/group-invalid'), {
        name: 'Ski Trip',
        memberIds: ['bob', 'charlie'],
        baseCurrency: 'EUR',
        balances: { bob: 0, charlie: 0 },
        processedExpenseIds: [],
        updatedAt: Date.now(),
      })
    );
  });

  it('6. user cannot create group exceeding 10 members limit', async () => {
    const aliceDb = testEnv.authenticatedContext('alice').firestore();
    const elevenMembers = [
      'alice',
      'u1',
      'u2',
      'u3',
      'u4',
      'u5',
      'u6',
      'u7',
      'u8',
      'u9',
      'u10',
    ];
    await assertFails(
      setDoc(doc(aliceDb, 'groups/group-too-large'), {
        name: 'Large Group',
        memberIds: elevenMembers,
        baseCurrency: 'USD',
        balances: {},
        processedExpenseIds: [],
        updatedAt: Date.now(),
      })
    );
  });

  it('7. group member can create expense with valid split sum matching baseAmount', async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      await setDoc(doc(context.firestore(), 'groups/group-1'), {
        name: 'Trip',
        memberIds: ['alice', 'bob'],
        baseCurrency: 'USD',
        balances: { alice: 0, bob: 0 },
        processedExpenseIds: [],
        updatedAt: Date.now(),
      });
    });

    const aliceDb = testEnv.authenticatedContext('alice').firestore();
    await assertSucceeds(
      setDoc(doc(aliceDb, 'groups/group-1/expenses/exp-1'), {
        groupId: 'group-1',
        title: 'Dinner',
        createdBy: 'alice',
        paidBy: 'alice',
        amount: 3000,
        currency: 'USD',
        exchangeRateToBase: 1.0,
        baseAmount: 3000,
        splitType: 'EQUAL',
        splits: {
          alice: 1500,
          bob: 1500,
        },
        hasReceipt: false,
        balanceSynced: false,
        createdAt: Date.now(),
      })
    );
  });

  it('8. non-member cannot create expense in group', async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      await setDoc(doc(context.firestore(), 'groups/group-1'), {
        name: 'Trip',
        memberIds: ['alice', 'bob'],
        baseCurrency: 'USD',
        balances: { alice: 0, bob: 0 },
        processedExpenseIds: [],
        updatedAt: Date.now(),
      });
    });

    const charlieDb = testEnv.authenticatedContext('charlie').firestore();
    await assertFails(
      setDoc(doc(charlieDb, 'groups/group-1/expenses/exp-2'), {
        groupId: 'group-1',
        title: 'Snacks',
        createdBy: 'charlie',
        paidBy: 'charlie',
        amount: 1000,
        currency: 'USD',
        exchangeRateToBase: 1.0,
        baseAmount: 1000,
        splitType: 'EQUAL',
        splits: { charlie: 1000 },
        hasReceipt: false,
        balanceSynced: false,
        createdAt: Date.now(),
      })
    );
  });

  it('9. user cannot create expense with spoofed createdBy', async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      await setDoc(doc(context.firestore(), 'groups/group-1'), {
        name: 'Trip',
        memberIds: ['alice', 'bob'],
        baseCurrency: 'USD',
        balances: { alice: 0, bob: 0 },
        processedExpenseIds: [],
        updatedAt: Date.now(),
      });
    });

    const aliceDb = testEnv.authenticatedContext('alice').firestore();
    await assertFails(
      setDoc(doc(aliceDb, 'groups/group-1/expenses/exp-spoofed'), {
        groupId: 'group-1',
        title: 'Spoofed Author',
        createdBy: 'bob',
        paidBy: 'alice',
        amount: 2000,
        currency: 'USD',
        exchangeRateToBase: 1.0,
        baseAmount: 2000,
        splitType: 'EQUAL',
        splits: { alice: 1000, bob: 1000 },
        hasReceipt: false,
        balanceSynced: false,
        createdAt: Date.now(),
      })
    );
  });

  it('10. user cannot create expense where sum of splits does not equal baseAmount', async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      await setDoc(doc(context.firestore(), 'groups/group-1'), {
        name: 'Trip',
        memberIds: ['alice', 'bob'],
        baseCurrency: 'USD',
        balances: { alice: 0, bob: 0 },
        processedExpenseIds: [],
        updatedAt: Date.now(),
      });
    });

    const aliceDb = testEnv.authenticatedContext('alice').firestore();
    await assertFails(
      setDoc(doc(aliceDb, 'groups/group-1/expenses/exp-invalid-sum'), {
        groupId: 'group-1',
        title: 'Mismatched sum',
        createdBy: 'alice',
        paidBy: 'alice',
        amount: 3000,
        currency: 'USD',
        exchangeRateToBase: 1.0,
        baseAmount: 3000,
        splitType: 'EQUAL',
        splits: {
          alice: 1000,
          bob: 1000,
        },
        hasReceipt: false,
        balanceSynced: false,
        createdAt: Date.now(),
      })
    );
  });

  it('11. user cannot create expense with more than 10 split members', async () => {
    const elevenMembers = [
      'alice',
      'u1',
      'u2',
      'u3',
      'u4',
      'u5',
      'u6',
      'u7',
      'u8',
      'u9',
      'u10',
    ];
    await testEnv.withSecurityRulesDisabled(async context => {
      await setDoc(doc(context.firestore(), 'groups/group-1'), {
        name: 'Trip',
        memberIds: elevenMembers,
        baseCurrency: 'USD',
        balances: {},
        processedExpenseIds: [],
        updatedAt: Date.now(),
      });
    });

    const splitsMap: Record<string, number> = {};
    elevenMembers.forEach(uid => {
      splitsMap[uid] = 100;
    });

    const aliceDb = testEnv.authenticatedContext('alice').firestore();
    await assertFails(
      setDoc(doc(aliceDb, 'groups/group-1/expenses/exp-eleven-splits'), {
        groupId: 'group-1',
        title: 'Too many splits',
        createdBy: 'alice',
        paidBy: 'alice',
        amount: 1100,
        currency: 'USD',
        exchangeRateToBase: 1.0,
        baseAmount: 1100,
        splitType: 'EQUAL',
        splits: splitsMap,
        hasReceipt: false,
        balanceSynced: false,
        createdAt: Date.now(),
      })
    );
  });

  it('12. author can update expense preserving createdBy and valid split sum', async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      await setDoc(doc(context.firestore(), 'groups/group-1'), {
        name: 'Trip',
        memberIds: ['alice', 'bob'],
        baseCurrency: 'USD',
        balances: { alice: 0, bob: 0 },
        processedExpenseIds: [],
        updatedAt: Date.now(),
      });
      await setDoc(doc(context.firestore(), 'groups/group-1/expenses/exp-1'), {
        groupId: 'group-1',
        title: 'Dinner',
        createdBy: 'alice',
        paidBy: 'alice',
        amount: 2000,
        currency: 'USD',
        exchangeRateToBase: 1.0,
        baseAmount: 2000,
        splitType: 'EQUAL',
        splits: { alice: 1000, bob: 1000 },
        hasReceipt: false,
        balanceSynced: false,
        createdAt: Date.now(),
      });
    });

    const aliceDb = testEnv.authenticatedContext('alice').firestore();
    await assertSucceeds(
      updateDoc(doc(aliceDb, 'groups/group-1/expenses/exp-1'), {
        title: 'Fancy Dinner',
        amount: 4000,
        baseAmount: 4000,
        splits: { alice: 2000, bob: 2000 },
      })
    );
  });

  it('13. non-author group member cannot update expense', async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      await setDoc(doc(context.firestore(), 'groups/group-1'), {
        name: 'Trip',
        memberIds: ['alice', 'bob'],
        baseCurrency: 'USD',
        balances: { alice: 0, bob: 0 },
        processedExpenseIds: [],
        updatedAt: Date.now(),
      });
      await setDoc(doc(context.firestore(), 'groups/group-1/expenses/exp-1'), {
        groupId: 'group-1',
        title: 'Dinner',
        createdBy: 'alice',
        paidBy: 'alice',
        amount: 2000,
        currency: 'USD',
        exchangeRateToBase: 1.0,
        baseAmount: 2000,
        splitType: 'EQUAL',
        splits: { alice: 1000, bob: 1000 },
        hasReceipt: false,
        balanceSynced: false,
        createdAt: Date.now(),
      });
    });

    const bobDb = testEnv.authenticatedContext('bob').firestore();
    await assertFails(
      updateDoc(doc(bobDb, 'groups/group-1/expenses/exp-1'), {
        title: 'Tampered Title',
      })
    );
  });

  it('14. author can delete their own expense', async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      await setDoc(doc(context.firestore(), 'groups/group-1'), {
        name: 'Trip',
        memberIds: ['alice', 'bob'],
        baseCurrency: 'USD',
        balances: { alice: 0, bob: 0 },
        processedExpenseIds: [],
        updatedAt: Date.now(),
      });
      await setDoc(doc(context.firestore(), 'groups/group-1/expenses/exp-1'), {
        groupId: 'group-1',
        title: 'Dinner',
        createdBy: 'alice',
        paidBy: 'alice',
        amount: 2000,
        currency: 'USD',
        exchangeRateToBase: 1.0,
        baseAmount: 2000,
        splitType: 'EQUAL',
        splits: { alice: 1000, bob: 1000 },
        hasReceipt: false,
        balanceSynced: false,
        createdAt: Date.now(),
      });
    });

    const aliceDb = testEnv.authenticatedContext('alice').firestore();
    await assertSucceeds(
      deleteDoc(doc(aliceDb, 'groups/group-1/expenses/exp-1'))
    );
  });

  it('15. non-author cannot delete expense', async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      await setDoc(doc(context.firestore(), 'groups/group-1'), {
        name: 'Trip',
        memberIds: ['alice', 'bob'],
        baseCurrency: 'USD',
        balances: { alice: 0, bob: 0 },
        processedExpenseIds: [],
        updatedAt: Date.now(),
      });
      await setDoc(doc(context.firestore(), 'groups/group-1/expenses/exp-1'), {
        groupId: 'group-1',
        title: 'Dinner',
        createdBy: 'alice',
        paidBy: 'alice',
        amount: 2000,
        currency: 'USD',
        exchangeRateToBase: 1.0,
        baseAmount: 2000,
        splitType: 'EQUAL',
        splits: { alice: 1000, bob: 1000 },
        hasReceipt: false,
        balanceSynced: false,
        createdAt: Date.now(),
      });
    });

    const bobDb = testEnv.authenticatedContext('bob').firestore();
    await assertFails(deleteDoc(doc(bobDb, 'groups/group-1/expenses/exp-1')));
  });

  it('16. listing invites collection is forbidden, but get by exact token succeeds', async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      await setDoc(doc(context.firestore(), 'invites/token-secret-123'), {
        token: 'token-secret-123',
        groupId: 'group-1',
        createdBy: 'alice',
        isUsed: false,
        usedBy: null,
        expiresAt: Date.now() + 86400000,
      });
    });

    const charlieDb = testEnv.authenticatedContext('charlie').firestore();
    await assertFails(getDocs(collection(charlieDb, 'invites')));
    await assertSucceeds(getDoc(doc(charlieDb, 'invites/token-secret-123')));
  });
});
