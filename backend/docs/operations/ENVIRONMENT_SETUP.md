# Environment Setup Guide

## Overview
This guide explains how to properly configure environment variables for the backend application.

## Quick Start

### 1. Copy the example file
```bash
cp .env.example .env
```

### 2. Generate JWT Secrets
Run this command to generate secure random secrets:
```bash
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Configure Database
Update the database credentials in `.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_secure_password
```

### 4. Test Connection
```bash
npm start
```

## Environment Variables Reference

### Required Variables

| Variable | Description | Example | Notes |
|----------|-------------|---------|-------|
| `BACKEND_PORT` | Port for backend server | `3001` | Default: 3001 |
| `JWT_SECRET` | Secret for JWT tokens | `(64+ char hex)` | Generate with crypto |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | `(64+ char hex)` | Generate with crypto |
| `DB_HOST` | PostgreSQL host | `localhost` | Production: Use managed service |
| `DB_PORT` | PostgreSQL port | `5432` | Default PostgreSQL port |
| `DB_NAME` | Database name | `nextjs_enterprise_app` | |
| `DB_USER` | Database user | `app_user` | |
| `DB_PASSWORD` | Database password | `secure_password` | Use strong password |

### Optional Variables

| Variable | Description | Default | Notes |
|----------|-------------|---------|-------|
| `CORS_ORIGIN` | Allowed CORS origins | `http://localhost:3000` | Multiple: comma-separated |
| `DB_SSL` | Enable database SSL | `false` | Set `true` for production |
| `SESSION_TIMEOUT` | Session timeout (ms) | `1800000` (30 min) | |
| `SESSION_WARNING_TIME` | Warning before timeout (ms) | `120000` (2 min) | |
| `EMAIL_FROM` | Email sender address | `noreply@example.com` | For MFA codes |

## Production Deployment

### Security Best Practices

1. **Never commit `.env` files** - They are already in `.gitignore`
2. **Use secrets management** - AWS Secrets Manager, Azure Key Vault, HashiCorp Vault
3. **Enable database SSL** - Set `DB_SSL=true`
4. **Use strong secrets** - Minimum 64 characters for JWT secrets
5. **Rotate secrets regularly** - Especially after team member changes

### Using Secrets Manager (AWS Example)

```bash
# Store secret
aws secretsmanager create-secret \
  --name backend/jwt-secret \
  --secret-string "your-generated-secret"

# Retrieve in application
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager();
const secret = await secretsManager.getSecretValue({
  SecretId: 'backend/jwt-secret'
}).promise();
```

### Docker/Kubernetes

**Docker Compose:**
```yaml
services:
  backend:
    env_file:
      - .env
    environment:
      - DB_HOST=postgres
      - DB_PORT=5432
```

**Kubernetes Secret:**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: backend-secrets
type: Opaque
data:
  jwt-secret: <base64-encoded-secret>
  db-password: <base64-encoded-password>
```

### CI/CD Configuration

**GitHub Actions:**
```yaml
env:
  JWT_SECRET: ${{ secrets.JWT_SECRET }}
  DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
```

**GitLab CI:**
```yaml
variables:
  JWT_SECRET: $JWT_SECRET
  DB_PASSWORD: $DB_PASSWORD
```

## Troubleshooting

### Database Connection Fails
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution:** Check PostgreSQL is running and credentials are correct

### Invalid JWT Secret
```
Error: secretOrPrivateKey must have a value
```
**Solution:** Ensure `JWT_SECRET` is set and not empty

### CORS Errors
```
Access to fetch blocked by CORS policy
```
**Solution:** Update `CORS_ORIGIN` to include your frontend URL

## Environment-Specific Configurations

### Development
- Use `localhost` for all services
- Database: Local PostgreSQL
- Secrets: Can be simple for testing

### Staging
- Mirror production setup
- Use separate database
- Test secret rotation

### Production
- Use managed services (RDS, etc.)
- Enable SSL for all connections
- Use secrets management service
- Enable monitoring and logging
- Set up automatic backups

## Security Checklist

- [ ] `.env` is in `.gitignore`
- [ ] JWT secrets are 64+ characters
- [ ] Database password is strong (12+ chars, mixed)
- [ ] SSL enabled for production database
- [ ] Secrets stored in secrets manager (production)
- [ ] CORS configured for production domain
- [ ] No secrets in application code
- [ ] Environment variables documented
- [ ] Secret rotation policy defined
- [ ] Access to secrets is logged and audited

## Additional Resources

- [Node.js Best Practices - Security](https://github.com/goldbergyoni/nodebestpractices#6-security-best-practices)
- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [12 Factor App - Config](https://12factor.net/config)
