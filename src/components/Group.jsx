import React from 'react';

function Group() {
  // Sample data for now
  const groups = [
    { id: 1, name: 'Gardeners', members: 10, totalPlants: 50 },
    { id: 2, name: 'Tree Lovers', members: 5, totalPlants: 30 },
  ];

  return (
    <div>
      <h2>Groups</h2>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {groups.map(group => (
          <li key={group.id} style={{ padding: '10px', borderBottom: '1px solid #eee', marginBottom: '10px' }}>
            <h3>{group.name}</h3>
            <p><strong>Members:</strong> {group.members}</p>
            <p><strong>Total Plants:</strong> {group.totalPlants}</p>
            {/* Optionally, you can add a button to join or view the group */}
            {/* <button>Join Group</button> */}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Group;
