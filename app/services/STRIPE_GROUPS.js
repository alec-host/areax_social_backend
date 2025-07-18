// services/stripeService.js
const { STRIPE_CLIENT_ID,STRIPE_CLIENT_SECRET,STRIPE_WEBHOOK_SECRET,STRIPE_API_URL,STRIPE_ACCOUNT,STRIPE_REDIRECT_URL } = require("../constants/app_constants");
const stripe = require('stripe')(STRIPE_CLIENT_SECRET);

class StripeService {
  // Create a product and price for a group
  async createGroupProduct(group) {
    try {
      const product = await stripe.products.create({
        name: group.group_name,
        description: group.description,
        metadata: {
          group_id: group.group_id.toString(),
          group_type: group.group_type
        }
      });

      let price;
      if (group.payment_type === 'subscription') {
        price = await stripe.prices.create({
          product: product.id,
          unit_amount: Math.round(group.price_amount * 100), // Convert to cents
          currency: group.price_currency.toLowerCase(),
          recurring: {
            interval: group.subscription_interval
          }
        });
      } else {
        price = await stripe.prices.create({
          product: product.id,
          unit_amount: Math.round(group.price_amount * 100),
          currency: group.price_currency.toLowerCase()
        });
      }

      return [true,{ product, price }];
    } catch (error) {
      console.error(`Failed to create Stripe product: ${error.message}`);	    
      return [false,`Failed to create Stripe product: ${error.message}`];
    }
  }

  // Create payment intent for one-time payments
  async createPaymentIntent(amount, currency, metadata) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: currency.toLowerCase(),
        metadata: metadata
      });
      return paymentIntent;
    } catch (error) {
      throw new Error(`Failed to create payment intent: ${error.message}`);
    }
  }

  // Create subscription
  async createSubscription(customerId, priceId, metadata) {
    try {
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        metadata: metadata
      });
      return subscription;
    } catch (error) {
      throw new Error(`Failed to create subscription: ${error.message}`);
    }
  }

  // Handle webhook events
  async handleWebhook(event) {
    switch (event.type) {
      case 'payment_intent.succeeded':
        return await this.handlePaymentSuccess(event.data.object);
      case 'invoice.payment_succeeded':
        return await this.handleSubscriptionPayment(event.data.object);
      case 'customer.subscription.deleted':
        return await this.handleSubscriptionCancelled(event.data.object);
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  async handlePaymentSuccess(paymentIntent) {
    // Update payment status in database
    const { GroupPayments } = require('../models');
    await GroupPayments.update(
      { status: 'completed' },
      { where: { stripe_payment_intent_id: paymentIntent.id } }
    );
  }

  async handleSubscriptionPayment(invoice) {
    // Handle subscription payment success
    const { GroupSubscriptions } = require('../models');
    await GroupSubscriptions.update(
      { 
        status: 'active',
        current_period_start: new Date(invoice.period_start * 1000),
        current_period_end: new Date(invoice.period_end * 1000)
      },
      { where: { stripe_subscription_id: invoice.subscription } }
    );
  }

  async handleSubscriptionCancelled(subscription) {
    // Handle subscription cancellation
    const { GroupSubscriptions } = require('../models');
    await GroupSubscriptions.update(
      { status: 'canceled' },
      { where: { stripe_subscription_id: subscription.id } }
    );
  }
}

module.exports = new StripeService();
