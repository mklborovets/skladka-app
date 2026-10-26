export interface UserSeed {
  uid: string;
  email: string;
  displayName: string;
}

export interface GroupSeed {
  id: string;
  name: string;
  baseCurrency: 'UAH' | 'USD' | 'EUR' | 'PLN';
  memberIds: string[];
}

export interface ExpenseSeed {
  id: string;
  groupId: string;
  title: string;
  createdBy: string;
  paidBy: string;
  amount: number;
  currency: string;
  exchangeRateToBase: number;
  baseAmount: number;
  splitType: 'EQUAL' | 'SHARES' | 'EXACT';
  splits: Record<string, number>;
  hasReceipt: boolean;
  balanceSynced: boolean;
  createdAt: number;
}

export interface GroupDoc {
  id: string;
  name: string;
  baseCurrency: 'UAH' | 'USD' | 'EUR' | 'PLN';
  memberIds: string[];
  balances: Record<string, number>;
  processedExpenseIds: string[];
  updatedAt: number;
}

const USERS: UserSeed[] = [
  { uid: 'user_1', email: 'oleksandr@example.com', displayName: 'Oleksandr' },
  { uid: 'user_2', email: 'maria@example.com', displayName: 'Maria' },
  { uid: 'user_3', email: 'dmytro@example.com', displayName: 'Dmytro' },
  { uid: 'user_4', email: 'anna@example.com', displayName: 'Anna' },
  { uid: 'user_5', email: 'ivan@example.com', displayName: 'Ivan' },
];

const GROUPS: GroupSeed[] = [
  {
    id: 'group_carpathians',
    name: 'Carpathians Trip',
    baseCurrency: 'UAH',
    memberIds: ['user_1', 'user_2', 'user_3', 'user_4'],
  },
  {
    id: 'group_rent_apartment',
    name: 'Apartment Rent',
    baseCurrency: 'USD',
    memberIds: ['user_1', 'user_2', 'user_5'],
  },
  {
    id: 'group_krakow_weekend',
    name: 'Krakow Weekend',
    baseCurrency: 'PLN',
    memberIds: ['user_2', 'user_3', 'user_4', 'user_5'],
  },
];

const EXPENSE_TITLES: Record<string, string[]> = {
  UAH: [
    'Cottage Rental',
    'Supermarket Groceries',
    'Dinner at Kolyba',
    'Fuel Refill',
    'Bukovel Ski Passes',
    'Equipment Rental',
    'Hot Tub and Sauna',
    'Barbecue Supplies',
    'Souvenirs and Local Cheese',
    'Mountain Pass Coffee',
  ],
  USD: [
    'Current Month Rent',
    'Utility Bills',
    'Internet and TV',
    'Cleaning Supplies',
    'Plumbing Repair',
    'Household Essentials',
    'Water Filters',
    'Kitchen Utensils',
  ],
  PLN: [
    'Train Tickets Przemysl-Krakow',
    'Old Town Apartment',
    'Bakery Breakfast',
    'Wawel Castle Tickets',
    'Restaurant Lunch',
    'City Tram Transport',
    'Coffee and Desserts',
    'Biedronka Groceries',
  ],
};

function generateSplits(
  baseAmount: number,
  memberIds: string[]
): Record<string, number> {
  const count = memberIds.length;
  const baseShare = Math.floor(baseAmount / count);
  const remainder = baseAmount - baseShare * count;

  const splits: Record<string, number> = {};
  memberIds.forEach((uid, index) => {
    splits[uid] = index === 0 ? baseShare + remainder : baseShare;
  });

  return splits;
}

export function generateSeedData(): {
  users: UserSeed[];
  groups: GroupDoc[];
  expenses: ExpenseSeed[];
} {
  const expenses: ExpenseSeed[] = [];
  const groupsDocs: GroupDoc[] = [];

  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  const distribution = [
    { group: GROUPS[0], count: 80 },
    { group: GROUPS[1], count: 60 },
    { group: GROUPS[2], count: 60 },
  ];

  let totalExpenseCounter = 0;

  for (const { group, count } of distribution) {
    const balances: Record<string, number> = {};
    group.memberIds.forEach(uid => {
      balances[uid] = 0;
    });

    const processedExpenseIds: string[] = [];
    const titles = EXPENSE_TITLES[group.baseCurrency];

    for (let i = 0; i < count; i++) {
      totalExpenseCounter++;
      const expenseId = `exp_${group.id}_${String(i + 1).padStart(3, '0')}`;
      const titleTemplate = titles[i % titles.length];
      const title = `${titleTemplate} #${i + 1}`;

      const paidBy = group.memberIds[i % group.memberIds.length];
      const createdBy = paidBy;

      const baseAmount = (150 + ((i * 37) % 850)) * 100;
      const splits = generateSplits(baseAmount, group.memberIds);

      balances[paidBy] += baseAmount;
      for (const [uid, share] of Object.entries(splits)) {
        balances[uid] -= share;
      }

      const createdAt = now - (count - i) * (dayMs / 2);

      const expense: ExpenseSeed = {
        id: expenseId,
        groupId: group.id,
        title,
        createdBy,
        paidBy,
        amount: baseAmount,
        currency: group.baseCurrency,
        exchangeRateToBase: 1.0,
        baseAmount,
        splitType: 'EQUAL',
        splits,
        hasReceipt: i % 5 === 0,
        balanceSynced: true,
        createdAt,
      };

      expenses.push(expense);
      processedExpenseIds.push(expenseId);
    }

    groupsDocs.push({
      id: group.id,
      name: group.name,
      baseCurrency: group.baseCurrency,
      memberIds: group.memberIds,
      balances,
      processedExpenseIds,
      updatedAt: now,
    });
  }

  return {
    users: USERS,
    groups: groupsDocs,
    expenses,
  };
}

function toFirestoreValue(val: unknown): Record<string, unknown> {
  if (val === null || val === undefined) {
    return { nullValue: 'NULL_VALUE' };
  }
  if (typeof val === 'string') {
    return { stringValue: val };
  }
  if (typeof val === 'number') {
    if (Number.isInteger(val)) {
      return { integerValue: val.toString() };
    }
    return { doubleValue: val };
  }
  if (typeof val === 'boolean') {
    return { booleanValue: val };
  }
  if (Array.isArray(val)) {
    return {
      arrayValue: {
        values: val.map(toFirestoreValue),
      },
    };
  }
  if (typeof val === 'object') {
    const fields: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val)) {
      fields[k] = toFirestoreValue(v);
    }
    return {
      mapValue: {
        fields,
      },
    };
  }
  return { stringValue: String(val) };
}

function toFirestoreFields(obj: Record<string, unknown>): Record<string, unknown> {
  const fields: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    fields[k] = toFirestoreValue(v);
  }
  return fields;
}

export async function runSeed(): Promise<void> {
  const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080';
  const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099';
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || 'demo-skladka';

  const { users, groups, expenses } = generateSeedData();

  console.log(`Starting seed process for project: ${projectId}`);
  console.log(`Target Firestore: ${firestoreHost}`);
  console.log(`Target Auth: ${authHost}`);

  for (const user of users) {
    try {
      const url = `http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=dummy-api-key`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          localId: user.uid,
          email: user.email,
          password: 'password123',
          displayName: user.displayName,
        }),
      });
    } catch (err) {
      console.warn(`Could not seed user ${user.uid} into Auth:`, err);
    }
  }

  for (const group of groups) {
    const url = `http://${firestoreHost}/v1/projects/${projectId}/databases/(default)/documents/groups/${group.id}`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer owner',
      },
      body: JSON.stringify({
        fields: toFirestoreFields(group as unknown as Record<string, unknown>),
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.warn(`Failed to seed group ${group.id}: ${text}`);
    }
  }

  const batchSize = 25;
  for (let i = 0; i < expenses.length; i += batchSize) {
    const chunk = expenses.slice(i, i + batchSize);
    const writes = chunk.map(expense => {
      const documentPath = `projects/${projectId}/databases/(default)/documents/groups/${expense.groupId}/expenses/${expense.id}`;
      return {
        update: {
          name: documentPath,
          fields: toFirestoreFields(expense as unknown as Record<string, unknown>),
        },
      };
    });

    const batchUrl = `http://${firestoreHost}/v1/projects/${projectId}/databases/(default)/documents:batchWrite`;
    const res = await fetch(batchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer owner',
      },
      body: JSON.stringify({ writes }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.warn(`Failed to seed expense batch at ${i}: ${text}`);
    }
  }

  console.log(
    `Seeding complete: ${users.length} users, ${groups.length} groups, ${expenses.length} expenses generated.`
  );
}

if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  runSeed().catch(err => {
    console.error('Seed script encountered an error:', err);
    process.exit(1);
  });
}
