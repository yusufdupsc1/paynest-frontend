# Stripe Configuration Guide for PayNest

## Important Note
The PayNest **frontend** does NOT handle Stripe directly. All Stripe integration (API keys, webhooks, payment processing) occurs on the **backend** service. This frontend only communicates with your backend API.

## Step 1: Understand the Architecture
- **Frontend**: `/home/neo/Music/paynest-frontend` (what you're currently viewing)
- **Backend**: Separate service (not in this repository) that handles:
  - Stripe API integration
  - Webhook endpoint configuration
  - Secret key management
  - Payment processing logic

The frontend interacts with the backend via:
- `NEXT_PUBLIC_API_URL` (set in your `.env` file)
- API endpoints like `/api/v1/webhooks`, `/api/v1/transactions`

## Step 2: Backend Stripe Configuration (If You Control the Backend)

### A. Set Environment Variables
In your backend service's environment configuration, set:

```bash
# Stripe Secret Key (keep secret!)
STRIPE_SECRET_KEY=sk_test_...  # Get from Stripe Dashboard → Developers → API keys

# Stripe Webhook Secret (for verifying webhook signatures)
STRIPE_WEBHOOK_SECRET=whsec_...  # Get when configuring webhook in Stripe Dashboard

# Stripe Publishable Key (if frontend needs to initialize Stripe Elements)
# NOTE: This is safe to expose frontend but still sensitive
STRIPE_PUBLISHABLE_KEY=pk_test_...  # Get from Stripe Dashboard → Developers → API keys
```

### B. Configure Webhook Endpoints in Stripe Dashboard
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/) → Developers → Webhooks
2. Click "Add endpoint"
3. Enter your backend webhook URL:
   ```
   https://your-backend-domain.com/api/v1/webhooks/stripe
   ```
   (Adjust path based on your backend's actual route)
4. Select events to listen for (recommended minimum):
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click "Add endpoint"
6. Copy the **Signing secret** (starts with `whsec_...`) and set as `STRIPE_WEBHOOK_SECRET` above

### C. Backend Implementation Requirements
Your backend must implement:
1. A webhook handler at `/api/v1/webhooks/stripe` (or similar) that:
   - Verifies the Stripe signature using `STRIPE_WEBHOOK_SECRET`
   - Processes events (e.g., successful payments, refunds)
   - Updates your database/order status accordingly
2. Payment intent creation endpoints
3. Customer management endpoints
4. Refund processing endpoints

## Step 3: Frontend Configuration (Minimal)
The frontend requires **no Stripe-specific configuration**. You only need:

1. **Correct API URL** (already set in your `.env`):
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend-service.onrender.com
   ```

2. **Ensure the backend is running and accessible** from the frontend
3. **Verify CORS settings** on your backend allow requests from your frontend domain

## Step 4: Testing Stripe Integration
### A. Use Stripe Test Mode
1. In Stripe Dashboard, ensure you're in **Test Mode** (toggle top-left)
2. Use test API keys (start with `sk_test_` and `pk_test_`)
3. Use test card numbers:
   - `4242 4242 4242 4242` (successful payment)
   - `4000 0025 0000 3155` (requires authentication)
   - `4000 0000 0000 9995` (always fails)

### B. Verify Webhook Delivery
1. In Stripe Dashboard → Developers → Webhooks
2. Click your endpoint → "Send test webhook"
3. Select an event type (e.g., `checkout.session.completed`)
4. Verify your backend receives and processes it correctly
5. Check logs for any verification errors

### C. Frontend Testing
1. Start frontend: `npm run dev` (or appropriate command)
2. Attempt a payment/test transaction
3. Verify:
   - Payment processes without errors
   - Webhook events appear in frontend dashboard (if implemented)
   - Order/status updates correctly

## Step 5: Production Preparation
1. Switch to **Live Mode** in Stripe Dashboard
2. Replace test keys with live keys:
   - `STRIPE_SECRET_KEY` → `sk_live_...`
   - `STRIPE_WEBHOOK_SECRET` → `whsec_live_...` (recreate webhook in live mode)
   - `STRIPE_PUBLISHABLE_KEY` → `pk_live_...`
3. Update `NEXT_PUBLIC_API_URL` to your production backend URL
4. Ensure HTTPS is properly configured everywhere
5. Set up monitoring/alerts for webhook failures

## Step 6: Troubleshooting
### Common Issues:
1. **Webhook signature verification failed**:
   - Check `STRIPE_WEBHOOK_SECRET` matches what's in Stripe Dashboard
   - Ensure backend is using the exact secret (no extra spaces)
   - Verify you're not accidentally using test secret in live mode (or vice versa)

2. **Payments not recording in dashboard**:
   - Verify webhook endpoint is receiving Stripe events
   - Check backend logs for processing errors
   - Ensure database updates are happening after webhook processing

3. **Frontend showing API errors**:
   - Confirm `NEXT_PUBLIC_API_URL` is correct
   - Check backend is running and accessible
   - Verify network requests in browser dev tools
   - Check CORS configuration on backend

## Files You've Already Configured (Frontend Only)
Your current `.env` file contains:
```env
JWT_SECRET=Xr69a3+yKgVJocXcqcGCJjhU4Yr53eLCbSAY0rWLx2K80TXyAM4nzG/d0Wt8Wa+d1feknaUzjVpwlyFOFIQyzg==
JWT_EXPIRES_IN=24h
ADMIN_PASSWORD=19Kusum@yusuf.
OPERATOR_PASSWORD=19Kusum@yusuf.
VIEWER_PASSWORD=19Kusum@yusuf.
```

**Note**: These are for authentication/jwt purposes only - **NOT** for Stripe.

## Next Steps
1. Locate your backend service/repository
2. Apply the backend Stripe configuration steps above
3. Test with Stripe test mode before going live
4. Monitor webhook delivery and payment processing

If you don't have access to the backend code, you'll need to contact whoever manages the backend service to configure Stripe for you, providing them with this guide.