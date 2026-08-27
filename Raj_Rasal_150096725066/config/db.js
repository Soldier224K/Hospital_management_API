const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const connString = process.env.MONGO_URI || 'mongodb+srv://stocklineowner_db_user:stockline%40mongodv@cluster0.dg7czb1.mongodb.net/hospitalDB?appName=Cluster0&retryWrites=true&w=majority';
        const conn = await mongoose.connect(connString);
        console.log(`MongoDB Connected: ${conn.connection.host} (Database: ${conn.connection.name})`);
    } catch (err) {
        console.error(`MongoDB Connection Error: ${err.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
