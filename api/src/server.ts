import { Server } from "http";
import { prisma } from "../lib/prisma";
import { connectRedis, disconnectRedis } from "../lib/redis";
import app from "./app";
import config from "./config";

let server: Server;

async function main() {
    try{
      await prisma.$connect();
      console.log("Connected to the database successfully")  
      await connectRedis();
      console.log("Connected to Redis successfully");
      server =  app.listen(config.PORT,()=>{
      console.log(`Server is running on http://localhost:${config.PORT}`)
      })
    }catch(error){
        console.error("An error occurred: ", error)
        await disconnectRedis();
        await prisma.$disconnect();
        process.exit(1)
    }
}

main();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('\n⚠️ Unhandled Rejection detected, shutting down...');
  console.error(err);
  if (server) {
     server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('\n💥 Uncaught Exception detected, shutting down...');
  console.error(err);
  process.exit(1);
});