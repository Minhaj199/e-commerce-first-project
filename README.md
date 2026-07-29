# E-Commerce First Project

A full-stack e-commerce web application built with Node.js, Express, MongoDB, and Handlebars. It provides a customer storefront as well as an administration area for managing the catalogue, customers, orders, offers, coupons, and sales.

## Features

- Customer registration, login, password reset, and email OTP verification
- Product catalogue with categories, search, sorting, stock, and product variants
- Cart, wishlist, address management, checkout, order tracking, cancellation, and returns
- Razorpay payment integration, including payment retry handling
- Coupons, offers, wallets, invoices, and order history
- Admin dashboard with product, category, brand, customer, inventory, order, coupon, offer, and sales-report management
- Cloudinary image uploads, request logging, rate limiting, Helmet security headers, and custom error pages

## Tech Stack

- **Backend:** Node.js, Express
- **Database:** MongoDB with Mongoose
- **Views:** Handlebars (`hbs`)
- **Authentication:** Express sessions and bcrypt
- **Payments:** Razorpay
- **Media storage:** Cloudinary
- **Email:** Nodemailer

## Prerequisites

- Node.js 18 or later
- npm
- A MongoDB connection string
- Accounts/credentials for Cloudinary, Razorpay, an SMTP provider, and Cloudflare Turnstile

## Getting Started

1. Clone the repository and open the project folder.

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create `configaration.env` in the project root. The application is currently configured to load this exact filename.

4. Add your configuration values:

   ```env
   PORT=3000
   DB_STRING=mongodb://127.0.0.1:27017/ecommerce

   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_MAIL=your-email@example.com
   SMPT_PASSWORD=your-smtp-password

   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=change-this-password

   CLOUD_NAME=your-cloudinary-cloud-name
   CLOUD_SECRET_KEY=your-cloudinary-api-key
   CLOUD_API_KEY=your-cloudinary-api-secret

   UserID=your-user-id
   OrderID=your-order-id

   key_id=your-razorpay-key-id
   key_secret=your-razorpay-key-secret

   windowMs=time in ms
   max=100

   TURNSTILE_SITEKEY=your-turnstile-site-key
   TURNSTILE_SECRET=your-turnstile-secret-key
   TURNSTILE_HOSTNAMES=localhost
   ```

   Keep these credentials private; `configaration.env` is excluded from Git.

5. Start the application:

   ```bash
   node app.js
   ```

6. Visit `http://localhost:3000`. The root URL redirects to the customer storefront at `/user`; the admin login is at `/admin`.

## Project Structure

```text
controller/   Request handlers for user and admin features
middleware/   Authentication, uploads, rate limiting, security, and error handling
model/        Mongoose models and database connection
public/       Static CSS, JavaScript, and image assets
router/       User and admin routes
utils/        Email, Cloudinary, Handlebars helpers, and utility functions
views/        Handlebars pages and shared partials
uploads/      Local upload staging directory
app.js        Application entry point
```

## Available Script

| Command | Description |
| --- | --- |
| `npm start` | Runs `nodemon clusterSetup` as currently defined in `package.json`. This requires a `clusterSetup` entry file, which is not present in the repository. |
| `node app.js` | Starts the application directly. |

## Notes

- Access logs are written to `logs/access.log` while the server is running.
- Product images are uploaded through Cloudinary; the `uploads/` folder is used locally during upload handling.
- No automated test script is currently defined in `package.json`.

## License

This project is licensed under the ISC license.
