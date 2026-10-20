import { prisma } from "../lib/prisma";
import app from "./app";
import config from "./config";

async function main() {
    try{
      await prisma.$connect();
      console.log("Connected to the database successfully")  
      app.listen(config.PORT,()=>{
        console.log(`Server is running on http://localhost:${config.PORT}`)
      })
    }catch(error){
        console.error("An error occurred: ", error)
        await prisma.$disconnect();
        process.exit(1)
    }
}

main();