import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  getDocs,
  limit,
} from "firebase/firestore";

function Leaderboard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const db = getFirestore();
      const q = query(
        collection(db, "users"),
        orderBy("plants", "desc"),
        limit(10)
      );

      const querySnapshot = await getDocs(q);
      const usersData = [];
      querySnapshot.forEach((doc) => {
        usersData.push(doc.data());
      });

      console.log(usersData); // Log the data
      setUsers(usersData);
    };

    fetchData();
  }, []);

  return (
    <div>
      <h2>Leaderboard</h2>
      <ul>
        {users.map((user, index) => (
          <li key={index}>
            {user.name}: {user.plants} plants
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Leaderboard;
