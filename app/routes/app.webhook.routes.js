const express = require('express');
const { stripeService } = require("../services/STRIPE_GROUPS");

const { STRIPE_CLIENT_ID,STRIPE_CLIENT_SECRET,STRIPE_WEBHOOK_SECRET,STRIPE_API_URL,STRIPE_ACCOUNT,STRIPE_REDIRECT_URL } = require("../constants/app_constants");

const stripe = require('stripe')(STRIPE_CLIENT_SECRET);

module.exports = (app) => {
  const router = express.Router();
  router.post('/stripe/webhook',express.raw({ type: 'application/json' }),async (req,res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = STRIPE_WEBHOOK_SECRET;
  let event;
  try{
     event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  }catch (err){
     return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try{
      await stripeService.handleWebhook(event);
      res.json({ received: true });
  }catch (error){
      res.status(500).json({ error: 'Internal webhook error' });
  }    
  });
}//
