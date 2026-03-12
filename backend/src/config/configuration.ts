export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: process.env.DATABASE_HOST || "localhost",
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    username: process.env.DATABASE_USERNAME || "cf_user",
    password: process.env.DATABASE_PASSWORD || "cf_secure_password",
    database: process.env.DATABASE_NAME || "complementary_fashions",
  },
  jwt: {
    secret:
      process.env.JWT_SECRET ||
      "4507657485c72bec8e2ba186de4e845cb44e462d170bcf4de835a5f556d71475",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
  adminJwt: {
    secret:
      process.env.ADMIN_JWT_SECRET ||
      "00fc65f375909cf6250b386e915b48cea69a4e3b6db424f6a3c35345128bed12",
    expiresIn: "24h",
  },
  mail: {
    host: process.env.MAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.MAIL_PORT, 10) || 587,
    user: process.env.MAIL_USER || "ivusojohn.97@gmail.com",
    pass: process.env.MAIL_PASS || "ikyddmqjkbuzoimw",
    from: process.env.MAIL_FROM || "ivusojohn.97@gmail.com",
  },
  upload: {
    dest: process.env.UPLOAD_DEST || "./uploads",
    maxSize: 5 * 1024 * 1024,
  },
  paybill: {
    businessShortCode: process.env.MPESA_SHORTCODE || "",
    passKey: process.env.MPESA_PASSKEY || "",
    consumerKey: process.env.MPESA_CONSUMER_KEY || "",
    consumerSecret: process.env.MPESA_CONSUMER_SECRET || "",
    callbackUrl: process.env.MPESA_CALLBACK_URL || "",
  },
  frontend: {
    url: process.env.FRONTEND_URL || "http://localhost:4200",
    adminUrl: process.env.ADMIN_URL || "http://localhost:4300",
  },
});
