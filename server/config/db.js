import mongoose from 'mongoose';

// ─── connectDB ────────────────────────────────────────────────────────────────
//
// Connects to MongoDB Atlas using the URI stored in the MONGO_URI environment
// variable. This function is called once when the server starts.
//
// WHY async/await here?
// mongoose.connect() is asynchronous — it takes time to establish the network
// connection to Atlas. We use async/await to wait for it to finish (or fail)
// before the server starts accepting requests.
//
// WHY process.exit(1) on failure?
// If we can't connect to the database, the app can't function correctly.
// Exiting immediately is safer than letting the server run in a broken state.
// Exit code 1 signals an error (exit code 0 means success).

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
