import mongoose from 'mongoose';

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// Reuse the connection across hot reloads (dev) and warm serverless invocations.
const globalWithMongoose = global as typeof globalThis & {
  mongoose?: MongooseCache;
};
const cached: MongooseCache = (globalWithMongoose.mongoose ??= {
  conn: null,
  promise: null,
});

export default async function dbConnect() {
  if (cached.conn) return cached.conn;

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error(`Please define the MONGODB_URI environment variable`);
  }

  cached.promise ??= mongoose.connect(MONGODB_URI).catch((err) => {
    cached.promise = null; // allow a retry on the next request
    throw err;
  });
  cached.conn = await cached.promise;
  return cached.conn;
}
