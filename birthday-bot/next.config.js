/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    MODULE_ADDRESS: "0x15ead142473563d1a07fae2aa04c6d38d19b33222c110a4667af357aa31439c2",
    MODULE_NAME: "birthday_bot",
    RESOURCE_ACCOUNT_ADDRESS: "0x770e0ac04e517bfe36a25e3f7cd8f303842ec9a819adb579167c9086cce74ebd",
    TRANSACTION_DELAY_MILLISECONDS: 3000,
  }
}

module.exports = nextConfig
