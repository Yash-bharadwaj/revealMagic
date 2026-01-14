# User Management Scripts

Utility scripts to create and manage users programmatically.

## Prerequisites

- Node.js installed
- `service-account-key.json` file in the project root
- Firebase Admin SDK installed (`npm install --save-dev firebase-admin`)

## Scripts

### 1. Create User (`createUser.js`)

Creates a new user in Firebase Authentication and Firestore.

**Usage:**
```bash
npm run create-user <email> <password> <role> [performerId]
```

**Arguments:**
- `email` - User email address (required)
- `password` - User password, minimum 6 characters (required)
- `role` - User role: `"admin"` or `"performer"` (required)
- `performerId` - (Optional) Performer ID to link to user

**Examples:**
```bash
# Create a performer user
npm run create-user user@example.com password123 performer

# Create an admin user
npm run create-user admin@example.com password123 admin

# Create a performer user and link to existing performer
npm run create-user performer@example.com password123 performer abc123xyz
```

**What it does:**
1. Creates a Firebase Authentication user
2. Creates a Firestore user document in the `users` collection
3. Links to performer if `performerId` is provided

---

### 2. Link User to Performer (`linkUserToPerformer.js`)

Links an existing Firebase Auth user to a performer.

**Usage:**
```bash
npm run link-user <userEmail> <performerId>
```

**Arguments:**
- `userEmail` - Email address of existing user (required)
- `performerId` - Performer ID to link to user (required)

**Example:**
```bash
npm run link-user user@example.com abc123xyz
```

**What it does:**
1. Finds the user by email in Firebase Authentication
2. Updates or creates the user document in Firestore
3. Sets the `performerId` field to link the user to the performer

**Note:** The user must already exist in Firebase Authentication. If the user document doesn't exist in Firestore, it will be created automatically.

---

## Common Workflows

### Create a new performer user from scratch:

1. First, create a performer in the Admin Dashboard (or manually in Firestore)
2. Note the Performer ID
3. Create the user and link to performer:
   ```bash
   npm run create-user performer@example.com password123 performer abc123xyz
   ```

### Link an existing user to a performer:

If you already have a user in Firebase Auth but they don't have a performer ID:

1. Get the Performer ID from Admin Dashboard
2. Link the user:
   ```bash
   npm run link-user user@example.com abc123xyz
   ```

### Create an admin user:

```bash
npm run create-user admin@example.com securepassword123 admin
```

---

## Troubleshooting

**Error: "service-account-key.json not found"**
- Make sure `service-account-key.json` exists in the project root
- This file should contain your Firebase service account credentials

**Error: "User with this email already exists"**
- The user already exists in Firebase Authentication
- Use `linkUserToPerformer.js` to link them to a performer instead

**Error: "Performer with ID does not exist"**
- The performer ID is incorrect or the performer hasn't been created yet
- Create the performer first in the Admin Dashboard

**Error: "Password must be at least 6 characters"**
- Firebase requires passwords to be at least 6 characters long

---

## Security Notes

- These scripts use Firebase Admin SDK with service account credentials
- Never commit `service-account-key.json` to version control
- These scripts bypass normal authentication checks - use with caution
- Only run these scripts in secure environments
