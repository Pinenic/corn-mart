import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import storeRoutes from './routes/storeRoutes.js';
import invetoryRoutes from './routes/inventoryRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import marketplaceRoutes from './routes/marketplaceRoutes.js'
// import checkoutRoute from './routes/checkout.js'
// import payoutRouter from './routes/payout.js'
// import momoCheckoutRoute from './routes/momoCheckout.js';
// import { pollPendingPayments } from './jobs/pollPendingPayments.js';
// import { pollEligiblePayouts } from './jobs/pollPayouts.js';



dotenv.config();
const app = express();

const corsOptions = { origin: '*' };

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/stores', storeRoutes);
// app.use('/api/checkout', momoCheckoutRoute);
// app.use('/api/payout', payoutRouter);
app.use('/api/inventory', invetoryRoutes)
app.use('/api/orders', orderRoutes);
app.use('/api/marketplace', marketplaceRoutes)

// pollPendingPayments();
// pollEligiblePayouts();
const PORT = process.env.PORT || 5000;
app.listen(PORT,"0.0.0.0", () => console.log(`Server running on port ${PORT}`));
