# SKLADKA

SKLADKA is a serverless, offline-first group expense splitting mobile application built with React Native CLI and Firebase. It provides concurrent-safe balance calculations, offline mutation queuing, receipt compression, deep-link invitations, exchange rate fallback feeds, and greedy debt settlements.

---

## 1. Architecture Overview (Feature-Sliced Design)

The project strictly follows the Feature-Sliced Design (FSD 2.1) architectural specification. The codebase is organized into layered slices where higher layers may only import from lower layers:

```text
apps/mobile/src/
├── app/                  # Application root, providers, navigation, headless tasks
├── pages/                # Thin route-level screen composers (30-80 lines)
│   ├── AuthScreen
│   ├── GroupsListScreen
│   ├── GroupDetailsScreen
│   ├── CreateExpenseScreen
│   └── DebtsScreen
├── widgets/              # Composite presentation blocks
│   ├── ExpensesFeed
│   └── DebtsSummary
├── features/             # User interactions and business workflows
│   ├── auth/             # Anonymous sign-in and Google credential account linking
│   ├── create-group/     # Group creation modal and form state
│   ├── create-expense/   # Split calculations, receipt attachment, currency rate conversion
│   ├── invites/          # Single-use deep link invite generation and acceptance
│   └── sync-offline-queue/# Optimistic mutations and online queue re-sync
├── entities/             # Domain entities, schemas, repositories, pure engines
│   ├── group/            # Group repository, balance engine, GroupCard
│   ├── expense/          # Expense repository, ExpenseRow, receipt modal
│   └── debt/             # Greedy debt minimization algorithm, DebtTransferCard
└── shared/               # Domain-agnostic primitives, UI kit, configs, APIs
    ├── ui/               # ScreenLayout, AppHeader, Button, Input, SyncBadge, ErrorBanner
    ├── api/              # Firebase SDK configuration with offline persistence
    ├── config/           # Environment switching (Emulator vs Production)
    └── lib/              # Pure utilities: image compressor, currency service
```

### Architectural Guarantees
* **Pure Presentation Layer**: UI components in `ui/` directories do not initiate direct Firebase calls, execute business transactions, or maintain calculation logic.
* **Separation of Concerns**: Complex state machine logic resides exclusively in `model/` custom hooks (such as `useCreateExpenseForm`, `useAcceptInvite`, `useOfflineMutationQueue`).
* **Storage Invariance**: All monetary amounts are stored exclusively in minor units (cents / kopecks as integers) to eliminate IEEE 754 floating point imprecision in balances and rules.

---

## 2. Local Setup and Firebase Emulator Suite

### Prerequisites
* Node.js >= 22.0.0
* Java Development Kit (JDK) 17
* Android Studio with Android SDK Platform 34/35 and Android Emulator
* Firebase CLI (`npm install -g firebase-tools`)

### Getting Started

1. **Clone and Install Dependencies**:
   ```bash
   git clone <repository_url>
   cd skladka-app
   npm install
   ```

2. **Start the Firebase Emulator Suite**:
   ```bash
   npm run emulators
   ```
   The local emulator suite provides:
   * Firebase Authentication on port `9099`
   * Cloud Firestore on port `8080`
   * Cloud Functions on port `5001`
   * Emulator UI on port `4000` (`http://localhost:4000`)

3. **Seed Emulator with Realistic Data**:
   Populates 5 users, 3 groups with different currencies (UAH, USD, EUR), and 200 expense records:
   ```bash
   npm run seed
   ```

4. **Run Security Rules and Unit Tests**:
   Executes all tests (Rules tests with `@firebase/rules-unit-testing`, Balance Engine, Debts Minimization, Offline Queue, Currency Conversion):
   ```bash
   npm test
   ```

5. **Typecheck Workspaces**:
   ```bash
   npm run typecheck
   ```

6. **Start Metro Bundler**:
   ```bash
   npm start
   ```

7. **Launch Android Application**:
   ```bash
   npm run android
   ```

---

## 3. Core Technical Solutions

### 1. Offline Queue and Concurrency (`runTransaction` vs `set()`)
* **Problem**: Firestore transactions (`runTransaction`) require an active network connection and fail immediately when offline. Plain document writes (`set()`) succeed instantly to the local disk cache with `metadata.hasPendingWrites = true`.
* **Solution**: When creating an expense, the client immediately persists the document to `groups/{groupId}/expenses/{expenseId}` with `balanceSynced: false`. The expense instantly appears in the feed with a syncing indicator (`SyncBadge`). The `useOfflineMutationQueue` hook monitors network status via `@react-native-community/netinfo`. Upon reconnecting, the queue sequentially triggers `syncExpenseBalance` transactions.
* **Idempotency**: The `computeUpdatedBalances` function checks `groupDoc.processedExpenseIds`. If an expense ID has already been recorded, the transaction safely no-ops without double-crediting balances.

### 2. Security Rules and Split Sum Validation (Method B)
* **Problem**: Firestore Common Expression Language (CEL) does not support loops (`for`, `while`) or dynamic iteration over maps. Indexing out of bounds on a list produces a runtime exception that aborts the request.
* **Solution (Method B)**: In `firestore.rules`, the split values list is padded with zeroes using `.concat([0, 0, 0, 0, 0, 0, 0, 0, 0, 0])`. Fixed index summation `v[0] + ... + v[9]` can safely handle groups of 1 to 10 participants without out-of-bounds errors while enforcing `sum(splits) == baseAmount`.

### 3. Client-Side Rules Invariants Limitations
In a client-driven architecture without a dedicated backend server, Firestore Security Rules cannot fully enforce the cross-document aggregate balance invariant (`groups/{id}.balances == sum(expenses)`). Because CEL cannot iterate over an entire subcollection during a write and cannot execute loops, a malicious client with modified credentials could technically send a direct `update` to the `balances` field or forge an artificial `exchangeRateToBase`.

In an enterprise production architecture, this limitation is addressed by moving mutations strictly to the server: the `balances` and `memberIds` fields are closed to client writes (`allow update: if false;`), and all aggregations are performed by Cloud Functions triggers (`onDocumentWritten`) using the Firebase Admin SDK.

### 4. Single-Use Deep Link Invites (`skladka://invite/:token`)
* **Configuration**: Configured via Android `intent-filter` with scheme `skladka` and host `invite`.
* **Atomic Consumption**: When opening `skladka://invite/:token`, the client executes a Firestore transaction reading both `invites/{token}` and `groups/{groupId}`. The transaction verifies `isUsed == false`, marks `isUsed = true`, records `usedBy = currentUser.uid`, and adds the user to `group.memberIds`.
* **Concurrent Openings**: If two users open the same invite link simultaneously, the first committed transaction sets `isUsed = true`. The second transaction aborts due to a document precondition conflict, restarts, detects `isUsed == true`, and terminates safely with a controlled error message.

### 5. Greedy Debt Minimization
* **Algorithm**: Implemented in `entities/debt/model/minimizeDebts.ts`.
* **Complexity**: Runs in $O(N \log N)$ where $N \le 10$.
* **Mechanism**: Partitions participants into debtors (`balance < 0`) and creditors (`balance > 0`). Sorts both lists in descending order of magnitudes. Iteratively matches the largest debtor with the largest creditor for `min(|debt|, credit)`, updating balances until all accounts reach zero. This reduces settlement friction to at most $N + M - 1$ bilateral transfers.

### 6. Receipt Image Compression & 1MB Document Size Guard
* **Pipeline**: Selected images from camera or gallery are compressed using `react-native-image-resizer` to a maximum dimension of 800x800 px with 75% JPEG quality (~150 KB).
* **Document Guard**: The base64 output is checked against a 900 KB threshold. If the image exceeds this size, a second pass compresses at 50% quality. If the image still exceeds safety limits, a `ReceiptTooLargeError` is thrown prior to Firestore dispatch, preventing 1 MB document quota rejections.

### 7. Android Headless JS, Foreground Service, and Doze Mode Analysis
* **Implementation**: An Android Foreground Service registered via `@notifee/react-native` runs a Firestore `collectionGroup('expenses')` snapshot listener registered as `BackgroundExpenseTask` in `AppRegistry.registerHeadlessTask`.

#### Why Headless JS is Unreliable When the App is Swiped Away:
Maintaining a persistent WebSocket connection to Firestore via Headless JS in the background conflicts with the battery-saving policies of modern Android versions (Doze Mode, App Standby Buckets) and aggressive OEM task managers (Xiaomi MIUI/HyperOS, Samsung OneUI).

When a user swipes the application away from the recent apps list (swipe-to-kill) or when the device enters deep sleep (Doze Mode), the operating system terminates running application processes and severs open TCP sockets. Even holding an ongoing notification with a Foreground Service in Android 14+ is subject to strict OS execution timeouts for `dataSync` service types.

In enterprise production environments, reliable background push delivery requires Firebase Cloud Messaging (FCM). An event trigger in Cloud Functions dispatches high-priority data messages via Google Play Services, which are natively authorized to wake the device radio and display notifications reliably regardless of application lifecycle state.

---

## 4. Continuous Integration (GitHub Actions)

The repository includes a GitHub Actions pipeline in `.github/workflows/ci.yml`:
1. **TypeScript Typecheck**: Runs `tsc --noEmit` on both workspaces in strict mode.
2. **Security Rules and Unit Tests**: Launches Firebase Emulator Suite in headless CI (`firebase emulators:exec`) and verifies all 7 test suites.
3. **Android Build**: Compiles Android debug APK (`./gradlew assembleDebug`) and stores the artifact for download.
