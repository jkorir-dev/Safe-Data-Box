Safe Data Box

Safe Data Box is a synthetic test data generator built for developers who need realistic local data—like Kenyan phone numbers (+254), M-Pesa transaction codes, KRA PINs, and relational IDs—without using real customer information.

Visitors can generate sample records right from the home page, while logged-in developers can build custom JSON schemas, import fields from live REST APIs, and save their templates in Firebase Firestore.

Project Links

- Live Site:https://safe-data-box.vercel.app/
- Figma Wireframes:https://www.figma.com/make/dphA5MSkBv2d2PkRnqzARv/Safe-Data-Box-Wireframes?p=f&t=IJsGCMHkBfUuzKYo-0
- Project Board: https:https://github.com/users/jkorir-dev/projects/1/views/1

What You Can Do

- Quick Visitor Demo: Generate sample Kenyan M-Pesa records on the landing page and switch between Table view and raw JSON before signing up.
- Developer Accounts: Register or sign in with Email/Password or Google to access the private Generator Studio.
- Custom Schema Builder: Create your own JSON fields using localized Kenyan generators (+254 numbers, M-Pesa codes, KRA PINs, Kenyan counties, KES amounts) alongside standard types like UUIDs, emails, and timestamps.
- Clone from Live APIs: Paste any public REST API endpoint (such as JSONPlaceholder or DummyJSON) to pull in its keys automatically.
- Save and Export: Store, update, or delete custom schemas in Firebase Firestore, copy generated JSON to your clipboard, or download it as a .json file.

Built With

- React and Vite
- Tailwind CSS
- React Router
- Firebase Authentication and Cloud Firestore
- Vitest and React Testing Library
- GitHub Actions

Running Locally

1. Clone this repository:
   git clone git@github.com:jkorir-dev/Safe-Data-Box.git
   cd Safe-Data-Box

2. Install dependencies:
   npm install

3. Set up your environment variables:
   cp .env.example .env
   Open .env and add your Firebase project keys.

4. Start the local dev server:
   npm run dev

5. Run tests and check coverage:
   npm run test:coverage
