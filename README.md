# STRIPE READY

## Overview

This project is a Next.js application that integrates with Stripe for e-commerce functionality, product and variant management, payment processing, Shipping Rate management and more.

## Main Features

- **Product Management**
- **Product Shop / Product Details**
- **Product variants**: This feature provides the ability to create variations of products with mutable cloned data. The feature allows your customers to select a product variant in the Cart. e.g. Size or Color Variations.
- **Shipping Rates**: This feature provides the ability to define shipping rates for your e-commerce store. Currently supporting weight & Cost based shipping costs.
- **Shopping Cart**
- **Checkout with Stripe hosted Checkout**

![Demo Image](https://github.com/yournextstore/yournextstore/blob/main/public/screenshot.jpg)

## Setup Instructions

### 1. Set Up a Stripe Account

To use Stripe for payment processing, you need to set up a Stripe account:

- Go to the [Stripe website](https://stripe.com) and sign up for an account.
- Once your account is set up, navigate to the [API keys section](https://dashboard.stripe.com/apikeys) of your Stripe dashboard.

### 2. Update Environment Variables

After obtaining your API keys, you need to copy the `.env-sample` file and save it as `.env` in the project root. Update with the following (at minimum):

- **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY**: This key is used in the frontend to initialize Stripe.js.
- **STRIPE_SECRET_KEY**: This key is used in the backend to create checkout sessions and manage payments.

![DevSettings Image](https://frontedgedigital.com/wp-content/uploads/2025/01/Screenshot-2025-01-29-at-11.12.06 AM.jpg)

![APIKeysLocation Image](https://frontedgedigital.com/wp-content/uploads/2025/01/Screenshot-2025-01-29-at-11.12.56 AM.jpg)

### 3. Install Dependencies

Make sure you have Node.js and npm installed. Then, navigate to your project directory and run the following command to install the necessary dependencies:
  ```bash
  npm install
  ```


### 4. Run the Development Server

To start the development server, use the following command:
- **Build the application** for development:

  ```bash
  npm run dev
  ```


Your application should now be running on [http://localhost:3000](http://localhost:3000).

## Additional Commands

- **Build the application** for production:
  ```bash
  npm run build
  ```

- **Start the production server**:
  ```bash
  npm start
  ```

## In App Authentication

The platform is setup to use NextAuth, with an administrator username, password and JWT secret stored in the .env file:

- **NEXTAUTH_USERNAME**=Username of your choice
- **NEXTAUTH_PASSWORD**=Password of your choice
- **NEXTAUTH_SECRET**=A Secrte of your choice, used for the authentication JWT

This is designed to eliminate additional 3rd party dependencies, however, you can modify [./app/api/auth/[...nextauth]/route.ts](./app/api/auth/[...nextauth]/route.ts) to connect to additional authentication services or databases.
All administration API callls are blocked without an authenticated JWT, as are pages and CTA's.
To authenticate, the Sign in Page can we accessed at: http://localhost:3000/sign-in

## Open Source Collaboration:

This is an open-source project, and we encourage collaboration from the community! If you have ideas for improvements, new features, or bug fixes, feel free to:

- **Submit an Issue**: Use the Issues tab to report bugs or suggest changes.
- **Create a Pull Request:**: Fork the repository, make your changes, and submit a pull request for review.

To contribute to **Stripe Ready**, please refer to the [CONTRIBUTING.md](./CONTRIBUTING.md) file for detailed guidelines.

## How to Contribute

If you're submitting a pull request, please follow the steps outlined in our [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md). This template will help you provide the necessary information and ensure your PR is reviewed smoothly.

## Reporting a Bug

If you’ve found a bug, please fill out the [Bug Report](.github/ISSUE_TEMPLATE/bug_report.md) template to provide us with the necessary details to investigate and resolve the issue.

## Requesting a Feature

If you have an idea for a new feature or improvement, please submit a [Feature Request](.github/ISSUE_TEMPLATE/feature_request.md) and tell us how it could benefit the project.

We value your contributions and are excited to see how this project can grow with your help. Together, we can build something even better!

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Stripe](https://stripe.com) for payment processing.
- [Next.js](https://nextjs.org) for the React framework.
