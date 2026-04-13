// Cashfree Order Token Generator (Node.js/Express)
// Save as: server.js
// Usage: node server.js

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Replace with your Cashfree test credentials
const CASHFREE_APP_ID = '227192201cfc960517b1860f21291722';
const CASHFREE_SECRET_KEY = '21ecc71455fb969d70affb9536706160522a702d';
const CASHFREE_API_URL = 'https://sandbox.cashfree.com/pg/orders';

// Endpoint to create order and get payment session token
app.post('/create-order', async (req, res) => {
  try {
    const { orderId, orderAmount, customerName, customerPhone, customerEmail } = req.body;
    const orderPayload = {
      order_id: orderId,
      order_amount: orderAmount,
      order_currency: 'INR',
      customer_details: {
        customer_id: customerPhone,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone
      }
    };
    const response = await axios.post(CASHFREE_API_URL, orderPayload, {
      headers: {
        'x-client-id': CASHFREE_APP_ID,
        'x-client-secret': CASHFREE_SECRET_KEY,
        'Content-Type': 'application/json',
      },
    });
    res.json({ paymentSessionId: response.data.payment_session_id });
  } catch (error) {
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Cashfree backend running on port ${PORT}`);
});
