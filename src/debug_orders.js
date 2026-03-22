import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

async function checkOrders() {
  try {
    const querySnapshot = await getDocs(collection(db, "orders"));
    console.log(`Total orders found: ${querySnapshot.size}`);
    querySnapshot.forEach((doc) => {
      console.log(`${doc.id} =>`, doc.data());
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

checkOrders();
