import React from 'react';

function Leaderboard() {
  // Sample data for now
  const users = [
    { name: 'John', plants: 10 },
    { name: 'Jane', plants: 8 },
    { name: 'Doe', plants: 5 },
  ];

  return (
    <div>
      <h2>Leaderboard</h2>
      <ul>
        {users.map((user, index) => (
          <li key={index}>{user.name}: {user.plants} plants</li>
        ))}
      </ul>
    </div>
  );
}

export default Leaderboard;
