# Nouns API

This API provides endpoints to manage nouns in a database.

## Installation
1. Clone the repository.
2. Install dependencies using `npm install`.

## Usage
- Start the server using `npm start`.
- Access the API through `http://localhost:3000`.

## Endpoints

### GET /api/nouns
- Retrieves all nouns from the database.

### PUT /api/nouns
- Updates the list of nouns in the database based on the request body.
- Request Body Format: `{ "changes": ["newNoun", "-nounToRemove"] }`
- Example: `{ "changes": ["apple", "-banana"] }`

## Validation
- When adding a new noun:
  - Checks for duplicate entries.
  - Limits the length of the noun to 30 characters.
- Returns appropriate error messages if validation fails.

## Efficiency
<!-- - Utilizes database transactions for atomic operations. -->
- Fetches the maximum ID from the database for efficient ID management.

