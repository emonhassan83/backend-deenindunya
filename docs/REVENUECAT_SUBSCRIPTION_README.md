# RevenueCat Subscription Developer Guideline

এই guideline Deenindunya backend-এ RevenueCat subscription setup, package mapping, backend API, webhook, এবং testing flow বুঝানোর জন্য।

## 1. Main Flow

এই project-এ subscription-এর main source হবে RevenueCat।

Flow:

1. Mobile app user login করবে।
2. App RevenueCat SDK configure করবে।
3. App user-এর backend `_id` RevenueCat app user id হিসেবে set করবে।
4. User RevenueCat SDK দিয়ে subscription কিনবে।
5. Purchase/restore শেষে app backend sync API call করবে।
6. Backend RevenueCat API দিয়ে subscription verify করবে।
7. Backend local `Subscription` collection update করবে।
8. RevenueCat renewal/cancel/expire/refund event webhook দিয়ে backend-এ পাঠাবে।
9. Backend webhook থেকে subscription এবং payment history update করবে।

## 2. Backend Env Setup

`server/.env` file-এ এই values লাগবে:

```env
REVENUECAT_API_KEY=your_revenuecat_secret_api_key
REVENUECAT_WEBHOOK_SECRET=your_custom_webhook_secret
REVENUECAT_PROJECT_ID=your_revenuecat_project_id
```

Important:

- `REVENUECAT_API_KEY` backend থেকে RevenueCat subscriber verify করার জন্য লাগে।
- `REVENUECAT_WEBHOOK_SECRET` webhook request protect করার জন্য লাগে।
- `REVENUECAT_PROJECT_ID` optional/helper config হিসেবে রাখা হয়েছে।

## 3. RevenueCat Dashboard Setup

RevenueCat dashboard-এ এই steps follow করতে হবে:

1. RevenueCat project create করো।
2. App Store / Play Store app connect করো।
3. Products add করো।
4. Entitlement create করো, যেমন `premium`।
5. Offering create করো, যেমন `default`।
6. Offering-এর মধ্যে monthly এবং annually package add করো।

Recommended product id:

```text
deenindunya_monthly
deenindunya_annually
```

Recommended entitlement id:

```text
premium
```

## 4. Backend Package Mapping

Backend package list frontend pricing দেখানোর জন্য থাকবে।

Package model-এর important fields:

```ts
title
billingCycle // monthly | annually
revenueCatProductId
entitlementId
description
price
```

Example package payload:

```json
{
  "title": "Deenindunya Premium Monthly",
  "billingCycle": "monthly",
  "revenueCatProductId": "deenindunya_monthly",
  "entitlementId": "premium",
  "description": ["Premium access", "All paid features"],
  "price": 9
}
```

Annually package example:

```json
{
  "title": "Deenindunya Premium Annually",
  "billingCycle": "annually",
  "revenueCatProductId": "deenindunya_annually",
  "entitlementId": "premium",
  "description": ["Premium access", "All paid features"],
  "price": 99
}
```

Important:

- `billingCycle` শুধু `monthly` অথবা `annually` হবে।
- `revenueCatProductId` অবশ্যই RevenueCat dashboard-এর product id-এর সাথে match করতে হবে।
- `entitlementId` RevenueCat entitlement id-এর সাথে match করা ভালো।

## 5. Mobile App Setup Rule

Mobile app-এ RevenueCat SDK configure করার সময় app user id হিসেবে backend user `_id` use করা recommended।

Example idea:

```ts
// login success হওয়ার পরে
await Purchases.logIn(user._id)
```

কেন এটা দরকার:

- RevenueCat webhook-এর `app_user_id` দিয়ে backend user খুঁজে পাবে।
- Backend sync API-তেও same id দিয়ে subscription verify হবে।
- আলাদা anonymous RevenueCat user id use করলে backend user mapping complex হবে।

## 6. Frontend Purchase Flow

Frontend flow:

1. `GET /api/v1/packages` call করে package list নাও।
2. User monthly/annually package choose করবে।
3. Selected package-এর `revenueCatProductId` দিয়ে RevenueCat package/product match করো।
4. RevenueCat SDK দিয়ে purchase করো।
5. Purchase success হলে backend sync API call করো।

Backend sync API:

```http
POST /api/v1/subscriptions/sync/revenuecat
Authorization: Bearer <access_token>
Content-Type: application/json
```

Body optional:

```json
{
  "revenueCatAppUserId": "backend_user_id"
}
```

যদি body না পাঠানো হয়, backend logged-in user `_id` RevenueCat app user id হিসেবে ধরে নিবে।

Expected response:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "RevenueCat subscription synced successfully!",
  "data": {
    "isActiveSubscription": true,
    "subscription": {}
  }
}
```

## 7. Restore Purchase Flow

App restore purchase করলে:

1. RevenueCat SDK restore call করবে।
2. Restore success হলে same sync API call করবে।

```http
POST /api/v1/subscriptions/sync/revenuecat
Authorization: Bearer <access_token>
```

এতে user-এর old active subscription backend DB-তে আবার sync হবে।

## 8. RevenueCat Webhook Setup

RevenueCat dashboard webhook URL:

```text
https://your-api-domain.com/api/v1/subscriptions/webhook/revenuecat
```

Local/dev testing হলে ngrok URL use করতে পারো:

```text
https://your-ngrok-url.ngrok-free.app/api/v1/subscriptions/webhook/revenuecat
```

Webhook secret:

RevenueCat dashboard-এ authorization/header secret হিসেবে `.env`-এর same value set করো:

```env
REVENUECAT_WEBHOOK_SECRET=your_custom_webhook_secret
```

Backend এই header গুলো support করে:

```http
Authorization: Bearer your_custom_webhook_secret
```

অথবা:

```http
x-revenuecat-webhook-secret: your_custom_webhook_secret
```

## 9. Supported Webhook Events

Backend এই RevenueCat events handle করবে:

- `INITIAL_PURCHASE`
- `RENEWAL`
- `CANCELLATION`
- `EXPIRATION`
- `BILLING_ISSUE`
- `PRODUCT_CHANGE`
- `REFUND`
- `UNCANCELLATION`

Event handling:

- `INITIAL_PURCHASE`, `RENEWAL`, `PRODUCT_CHANGE` হলে subscription active হবে।
- `EXPIRATION` হলে subscription expired হবে।
- `CANCELLATION` হলে subscription cancelled হবে, কিন্তু `expiresAt` future হলে user access expiry পর্যন্ত থাকতে পারে।
- `BILLING_ISSUE` হলে status `billing_issue` হবে।
- `REFUND` হলে payment refunded এবং subscription cancelled হবে।

## 10. Subscription DB Meaning

`Subscription` collection local cache/state হিসেবে কাজ করবে।

Important fields:

- `user`: local user id
- `revenueCatAppUserId`: RevenueCat user id
- `productId`: RevenueCat product id
- `entitlementId`: RevenueCat entitlement id
- `revenueCatTransactionId`: latest transaction id
- `revenueCatOriginalTransactionId`: original transaction id
- `status`: current subscription status
- `expiresAt`: subscription expiry date
- `store`: app store/play store
- `rawEventData`: RevenueCat raw event/subscriber data

## 11. Payment History Meaning

`Payment` collection এখন Stripe checkout payment না।

এখন এটা RevenueCat transaction/event history রাখবে।

Important fields:

- `user`
- `subscription`
- `revenueCatEventId`
- `revenueCatEventType`
- `revenueCatProductId`
- `revenueCatTransactionId`
- `amount`
- `currency`
- `status`
- `purchasedAt`
- `rawEventData`

Dashboard earning হিসাব হবে `status: paid` payment record থেকে।

## 12. User Profile Premium Status

User profile API active subscription check করবে local `Subscription` collection থেকে।

Active হিসেবে ধরা হবে:

- status `active`, `cancelled`, `grace_period`, বা `billing_issue`
- এবং `expiresAt` null অথবা future date

Profile response-এ useful fields:

```json
{
  "isActiveSubscription": true,
  "subscriptionType": "deenindunya_monthly",
  "billingCycle": "monthly",
  "expiresAt": "2026-09-11T00:00:00.000Z",
  "entitlementId": "premium",
  "revenueCatProductId": "deenindunya_monthly"
}
```

## 13. Manual Test Checklist

Development complete করার পর এইগুলো test করো:

1. Package create হচ্ছে কিনা with `billingCycle: monthly`।
2. Package create হচ্ছে কিনা with `billingCycle: annually`।
3. `billingCycle: yearly` দিলে validation error আসে কিনা।
4. RevenueCat purchase success হলে sync API active subscription return করে কিনা।
5. Restore purchase করলে sync API old subscription ফিরিয়ে আনে কিনা।
6. RevenueCat `INITIAL_PURCHASE` webhook subscription active করে কিনা।
7. RevenueCat `RENEWAL` webhook expiry extend করে কিনা।
8. RevenueCat `CANCELLATION` webhook status update করে কিনা।
9. RevenueCat `EXPIRATION` webhook status expired করে কিনা।
10. RevenueCat `REFUND` webhook payment refunded করে কিনা।
11. Same webhook duplicate পাঠালে duplicate payment তৈরি হয় কিনা check করো।
12. User profile `isActiveSubscription` correct আসছে কিনা check করো।

## 14. Common Mistakes

- Mobile app RevenueCat anonymous app user id use করলে backend user link নাও পেতে পারে।
- Backend package `revenueCatProductId` RevenueCat dashboard product id-এর সাথে mismatch হলে package mapping হবে না।
- `REVENUECAT_API_KEY` missing হলে sync API কাজ করবে না।
- `REVENUECAT_WEBHOOK_SECRET` mismatch হলে webhook unauthorized হবে।
- RevenueCat dashboard webhook URL `/api/v1` prefix ছাড়া দিলে backend route hit হবে না।
- `yearly` billing cycle পাঠালে validation fail করবে; এখন `annually` use করতে হবে।

## 15. Quick Endpoint List

```http
GET /api/v1/packages
POST /api/v1/subscriptions/sync/revenuecat
POST /api/v1/subscriptions/webhook/revenuecat
GET /api/v1/subscriptions/my-subscriptions
GET /api/v1/payments/dashboard-data
```

## 16. Developer Rule

RevenueCat subscription নিয়ে কাজ করার সময় এই rule follow করো:

Backend subscription create করবে না before payment. Purchase আগে RevenueCat SDK-তে complete হবে, তারপর backend sync/webhook local DB update করবে।
