# STRIPE READY

## Overview

This project is a Next.js application that integrates with Stripe for e-commerce functionality, product and variant management, payment processing, Shipping Rate management and more.

## Main Features

- **Product Management**
- **Product Shop / Product Details**
- **Product variants**: This feature provides the ability to create variations of products with mutable cloned data. The feature allows your customers to select a product variant in the Cart. e.g. Size or Color Variations.
- **Shipping Rates**: This feature provides the ability to define shipping rates for your e-commerce store. Currently supporting weight based shipping costs. COMING SOON - Cost based shipping rates.
- **Shopping Cart**
- **Checkout with Stripe hosted Checkout**

## Setup Instructions

### 1. Set Up a Stripe Account

To use Stripe for payment processing, you need to set up a Stripe account:

- Go to the [Stripe website](https://stripe.com) and sign up for an account.
- Once your account is set up, navigate to the [API keys section](https://dashboard.stripe.com/apikeys) of your Stripe dashboard.

### 2. Update Environment Variables

After obtaining your API keys, you need to copy the `.env-sample` file and save it as `.env` in the project root. Update with the following (at minimum):

- **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY**: This key is used in the frontend to initialize Stripe.js.
- **STRIPE_SECRET_KEY**: This key is used in the backend to create checkout sessions and manage payments.

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

## Open Source Collaboration:

This is an open-source project, and we encourage collaboration from the community! If you have ideas for improvements, new features, or bug fixes, feel free to:

- **Submit an Issue**: Use the Issues tab to report bugs or suggest changes.
- **Create a Pull Request:**: Fork the repository, make your changes, and submit a pull request for review.

We value your contributions and are excited to see how this project can grow with your help. Together, we can build something even better!

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Stripe](https://stripe.com) for payment processing.
- [Next.js](https://nextjs.org) for the React framework.