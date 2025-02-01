import { registerAs } from '@nestjs/config';

export default registerAs('mongodb', () => ({
  uri:
    process.env.MONGODB_URI ||
    'mongodb://root:root123@mongodb:27017/invoicedb',
}));
