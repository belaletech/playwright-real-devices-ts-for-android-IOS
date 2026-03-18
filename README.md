# 📱 Playwright TypeScript – Real Device Testing (iOS & Android)

This project demonstrates how to run **end-to-end tests using Playwright with TypeScript** on **real mobile devices (Android & iOS)** using LambdaTest.

It includes separate test cases for Android and iOS to validate cross-platform behavior and highlight platform-specific differences.

---

## 🚀 How to Run

### 🔹 Prerequisites

* Install **Node.js** (v16 or above recommended)
* A **LambdaTest account** with real device access
* LambdaTest credentials:

  * Username
  * Access Key
    👉 Get them from: [https://accounts.lambdatest.com/security](https://accounts.lambdatest.com/security)

---

### 🔹 Setup

```bash
# 1. Install dependencies
npm install

# 2. Create your .env file
cp .env.example .env

# 3. Add your LambdaTest credentials inside .env
# LT_USERNAME=your_username
# LT_ACCESS_KEY=your_access_key
```

---

### ▶️ Run Tests

```bash
# Run Android test (expected to pass)
npm run test:android

# Run iOS test (used to demonstrate issue/behavior)
npm run test:ios
```

---

## 📁 Project Structure

```
├── tests/
│   ├── android.test.ts   — Android real device test
│   └── ios.test.ts       — iOS real device test
├── .env.example          — Environment variable template
├── .gitignore            — Ignores node_modules & secrets
├── package.json
├── tsconfig.json
└── README.md
```

---

## 📱 Devices Used

| Platform | Device    | OS Version |
| -------- | --------- | ---------- |
| Android  | Pixel 5   | Android 11 |
| iOS      | iPhone 16 | iOS 18     |

---

## ⚡ Notes

* Ensure your LambdaTest account has **real device cloud access enabled**
* Android test is used as a **baseline (working scenario)**
* iOS test helps in identifying **platform-specific issues**
* Tests are written using **Playwright with TypeScript**

---

## 🤝 Contributing

Feel free to fork this repository and raise a PR for improvements or additional test scenarios.

---

## 📄 License

This project is for learning and demonstration purposes.


