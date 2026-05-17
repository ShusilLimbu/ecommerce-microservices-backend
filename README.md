# E-Commerce Microservices (Node.js + PostgreSQL)

Auth, User, and Order services with RabbitMQ events and an API gateway.

## Quick start (Docker)

```bash
docker compose up --build
```

- API Gateway: http://localhost:8080
- Auth: :3001 | User: :3002 | Order: :3003
- RabbitMQ UI: http://localhost:15672 (guest/guest)

## Local development

1. Start infrastructure:
   ```bash
   docker compose up postgres rabbitmq -d
   ```

2. Install dependencies:
   ```bash
   npm install
   npm run migrate:all
   ```

3. Run services (separate terminals):
   ```bash
   npm run dev:auth
   npm run dev:user
   npm run dev:order
   npm run dev:gateway
   ```

## Example flow

```bash
# Register
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"jane@example.com\",\"password\":\"SecureP@ss1\",\"firstName\":\"Jane\",\"lastName\":\"Doe\"}"

# Add address (use accessToken from register)
curl -X POST http://localhost:8080/api/v1/users/me/addresses \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"line1\":\"123 Main St\",\"city\":\"NYC\",\"postalCode\":\"10001\",\"country\":\"US\",\"isDefault\":true}"

# Create order
curl -X POST http://localhost:8080/api/v1/orders \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"items\":[{\"productId\":\"00000000-0000-0000-0000-000000000001\",\"productName\":\"Widget\",\"quantity\":2,\"unitPriceCents\":1999}],\"shippingAddressId\":\"ADDRESS_ID\"}"
```

## Structure

- `services/auth-service` - registration, login, JWT
- `services/user-service` - profiles, addresses (consumes user.registered)
- `services/order-service` - orders (calls user internal API, simulates payment)
- `packages/shared` - auth middleware, events, errors
- `api-gateway` - JWT validation + proxy

## CI/CD (GitHub Actions ? AWS EC2)

- Workflow: `.github/workflows/ci-cd.yml`
- **CI** on every push/PR: `npm ci`, syntax checks, Docker build
- **CD** on push to `main`: SSH deploy to Ubuntu EC2, `docker compose` production stack

See **[deploy/DEPLOY.md](deploy/DEPLOY.md)** for EC2 setup, security group, and GitHub secrets.
