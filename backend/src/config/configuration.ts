export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'complementary_fashions',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  adminJwt: {
    secret: process.env.ADMIN_JWT_SECRET || 'admin-super-secret-jwt-key',
    expiresIn: '24h',
  },
  mail: {
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.MAIL_PORT, 10) || 587,
    user: process.env.MAIL_USER || '',
    pass: process.env.MAIL_PASS || '',
    from: process.env.MAIL_FROM || 'noreply@complementaryfashions.com',
  },
  upload: {
    dest: process.env.UPLOAD_DEST || './uploads',
    maxSize: 5 * 1024 * 1024,
  },
  paybill: {
    businessShortCode: process.env.PAYBILL_SHORT_CODE || '',
    passKey: process.env.PAYBILL_PASS_KEY || '',
    consumerKey: process.env.PAYBILL_CONSUMER_KEY || '',
    consumerSecret: process.env.PAYBILL_CONSUMER_SECRET || '',
    callbackUrl: process.env.PAYBILL_CALLBACK_URL || '',
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:4200',
    adminUrl: process.env.ADMIN_URL || 'http://localhost:4300',
  },
});
