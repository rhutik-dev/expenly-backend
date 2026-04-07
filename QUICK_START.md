# Quick Start Guide

## ⚡ 5 Minute Setup

### 1. Start the Server
```bash
cd backend
npm run dev
```

Expected output:
```
Server is running on http://localhost:5000
```

### 2. Create an Account
```bash
curl -X POST http://localhost:5000/api/users/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

Response (save the `token`):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": { "id": "...", "name": "John Doe", "email": "john@example.com", "role": "USER" },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 3. Add an Expense
```bash
TOKEN="your-token-here"

curl -X POST http://localhost:5000/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Grocery Shopping",
    "amount": 50.00,
    "currency": "INR",
    "notes": "Weekly groceries",
    "expenseDate": "2026-04-07T00:00:00Z"
  }'
```

### 4. Get Your Expenses
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/expenses
```

### 5. Chat with AI Chatbot
```bash
curl -X POST http://localhost:5000/api/chatbot/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "message": "How much have I spent?"
  }'
```

---

## 📋 Key Features

### Authentication
- **Signup:** `POST /api/users/signup`
- **Login:** `POST /api/users/signin`
- **Token:** Include in header: `Authorization: Bearer <token>`

### Expenses (Auth Required)
- **Create:** `POST /api/expenses`
- **List:** `GET /api/expenses` (own expenses only)
- **Update:** `PUT /api/expenses/:id` (own expenses only)
- **Delete:** `DELETE /api/expenses/:id` (own expenses only)

### Tags
- **List:** `GET /api/tags` (all users)
- **Create:** `POST /api/tags` (admin only)
- **Delete:** `DELETE /api/tags/:id` (admin only)

### Chatbot (Separate Module)
- **Chat:** `POST /api/chatbot/chat` (expense-aware, multi-turn)
- **Health:** `GET /api/chatbot/health` (public)

---

## 🔐 Security

✅ Passwords hashed with bcryptjs  
✅ JWT authentication  
✅ Role-based access control (RBAC)  
✅ CORS protection  
✅ Rate limiting (100 req/15min)  
✅ Security headers (helmet)  
✅ Input validation (Zod)  

---

## 📚 Full Documentation

See `API_DOCUMENTATION.md` for:
- All endpoints with examples
- Error codes and handling
- Rate limiting info
- Database schema
- Deployment checklist

---

## 🧪 Run Tests

```bash
chmod +x test-api.sh
npm run dev &   # Start server in background
./test-api.sh   # Run all tests
kill %1         # Stop server
```

---

## ⚙️ Environment Setup

The `.env` file is pre-configured with:
- `DATABASE_URL` - Supabase PostgreSQL connection
- `JWT_SECRET` - Your JWT signing key
- `GROQ_API_KEY` - For AI chatbot
- `NODE_ENV` - Set to `development`
- `CORS_ORIGIN` - Set to `http://localhost:3000`

**For production:**
- Change `NODE_ENV` to `production`
- Use a strong `JWT_SECRET` (min 32 chars)
- Update `CORS_ORIGIN` to your frontend domain
- Use production database credentials

---

## 🛠️ Database Commands

```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name add_feature

# Push schema (development)
npx prisma db push

# Seed tags
npx prisma db seed

# Inspect database
npx prisma studio
```

---

## 🚀 What You Get

**Complete Backend with:**
- ✅ User management (signup, signin, profiles)
- ✅ Expense tracking (CRUD + filtering)
- ✅ Tag categorization (28 pre-seeded)
- ✅ AI chatbot (expense-aware, financial insights)
- ✅ Production middleware (security, logging, rate limiting)
- ✅ Role-based access control (USER/ADMIN)
- ✅ Graceful error handling
- ✅ Comprehensive API documentation

**Ready to:**
- Connect to any frontend
- Deploy to production
- Scale with monitoring
- Extend with new features

---

## 📞 Troubleshooting

### Server won't start
- Check port 5000 is available
- Verify database credentials in `.env`
- Check Node.js version (12+)

### Authentication failing
- Verify token format: `Authorization: Bearer <token>`
- Token expires after 1 hour (configurable in `.env`)
- Check JWT_SECRET is set correctly

### Chatbot not responding
- Verify GROQ_API_KEY is set
- Check internet connection (calls Groq API)
- Rate limiting may apply

### Database connection error
- Check `DATABASE_URL` and `DIRECT_URL` in `.env`
- Verify network connectivity
- Check Supabase project is active

---

## 🎯 Next Steps

1. **Frontend Integration:**
   - Use signup/signin for auth
   - Store token in localStorage
   - Include token in all API requests

2. **Expense Tracking:**
   - Build expense list UI
   - Implement expense form (add/edit/delete)
   - Add tag filtering

3. **Chatbot Widget:**
   - Create chat UI component
   - Send messages to `/api/chatbot/chat`
   - Display financial insights

4. **Deployment:**
   - Set up CI/CD pipeline
   - Configure production database
   - Deploy to cloud (Render, Railway, Vercel, etc.)

---

**Happy Coding!** 🎉
