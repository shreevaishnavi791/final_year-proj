/* server.js */
import express from 'express';
import Razorpay from 'razorpay';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const razorpay = new Razorpay({
  key_id: process.env.VITE_RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.use(cors());
app.use(express.json());

// Endpoint to create a Razorpay Order
app.post('/create-razorpay-order', async (req, res) => {
  const { amount } = req.body;
  console.log('Received order request for amount:', amount);
  try {
    const options = {
      amount: Math.round(amount * 100), // Razorpay expects paise (₹ * 100)
      currency: 'INR',
      receipt: 'order_' + Date.now(),
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    const errorMsg = error.error ? error.error.description : error.message || 'Unknown error occurred';
    console.error('Error creating Razorpay order:', errorMsg);
    res.status(500).send({ error: errorMsg });
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));
