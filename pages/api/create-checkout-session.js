import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  try {
    const { amount, performerStripeId, taskId, description } = req.body;

    // 10% platform fee (you keep this)
    const appFee = Math.round(amount * 0.1);

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: description || "BearTask Payment",
            },
            unit_amount: amount * 100, // convert to cents
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: appFee,
        transfer_data: {
          destination: performerStripeId, // the performer’s connected account
        },
        metadata: {
          taskId,
        },
      },
      success_url: `${req.headers.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/payment-cancelled`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
