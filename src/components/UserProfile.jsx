import React from 'react';

function UserProfile() {
  // Sample data for now
  const userPlants = [
    { id: 1, image: 'path/to/image1.jpg', location: 'Park', carbonSaved: 10 },
    { id: 2, image: 'path/to/image2.jpg', location: 'Backyard', carbonSaved: 10 },
  ];

  return (
    <div className="user-profile">
      <h2>Your Plants</h2>
      <ul>
        {userPlants.map(plant => (
          <li key={plant.id}>
            <img src={plant.image} alt="Plant" width="100" />
            <p>Location: {plant.location}</p>
            <p>Carbon Saved: {plant.carbonSaved}kg CO2 annually</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserProfile;
