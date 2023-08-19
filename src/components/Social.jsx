import React, { useState, useEffect } from "react";
import { db } from "../firebase.jsx";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  doc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { useAuth } from "../AuthContext.jsx";

// Add other users to Friends List
function AddFriend({ currentUser }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [sentRequests, setSentRequests] = useState(new Set());

  const handleSearch = async () => {
    try {
      const usersCollection = collection(db, "users");
      const userSnapshot = await getDocs(
        query(usersCollection, where("email", "==", searchTerm))
      );
      setUsers(userSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      console.log(users);
    } catch (err) {
      setError("Failed to fetch users. Please try again.");
      console.error(err);
    }
  };

  const handleAddFriend = async (friendId) => {
    // Debugging line to print the currentUser object to the console
    console.log("Current User:", currentUser);

    // Check that currentUser and currentUser.uid are not undefined
    if (!currentUser || !currentUser.uid) {
      console.error("Current user or user UID is undefined");
      return;
    }

    try {
      const friendsCollection = collection(db, "friends");
      await addDoc(friendsCollection, {
        user1Id: currentUser.uid, // Use currentUser.uid instead of currentUser.id
        user2Id: friendId,
      });
      console.log("Friend added successfully");
    } catch (error) {
      console.error("Error adding friend: ", error);
    }

    // After successfully adding a friend, add the friendId to the sentRequests Set
    setSentRequests((prevSentRequests) => {
      const newSentRequests = new Set(prevSentRequests);
      newSentRequests.add(friendId);
      return newSentRequests;
    });
  };

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search for friends... (Enter Email)"
      />
      <button onClick={handleSearch}>Search</button>
      {error && <p>{error}</p>}
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              {user.name}
              {sentRequests.has(user.id) ? (
                <button disabled={true}>Friend Successfully Added</button>
              ) : (
                <button onClick={() => handleAddFriend(user.id)}>
                  Add Friend
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Display users friends
function FriendList({ currentUser }) {
  const [friends, setFriends] = useState([]);
  const [error, setError] = useState(null);

  const fetchFriends = async () => {
    if (!currentUser || !currentUser.uid) {
      console.log("currentUser or currentUser.uid is not defined");
      return;
    }

    try {
      const friendsCollection = collection(db, "friends");
      const friendsSnapshot = await getDocs(
        query(friendsCollection, where("user1Id", "==", currentUser.uid))
      );

      const friendIds = friendsSnapshot.docs.map((doc) => doc.data().user2Id);

      if (friendIds.length === 0) return;

      const userCollection = collection(db, "users");
      const usersSnapshot = await getDocs(
        query(userCollection, where("uid", "in", friendIds))
      );

      setFriends(usersSnapshot.docs.map((doc) => doc.data()));
    } catch (err) {
      setError("Failed to fetch friends. Please try again.");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, [currentUser]);

  return (
    <div>
      <h2>My Friends</h2>
      {error && <p>{error}</p>}
      <ul>
        {friends.map((friend, index) => (
          <li key={index}>
            {friend.name} | {friend.email} | Plants: {friend.plants}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Display GroupMembers in Group
function GroupMembers({
  groupId,
  currentUserId,
  isCreator,
  setGroups,
  groupMembers,
}) {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    setMembers(groupMembers);
  }, [groupMembers]);

  const leaveGroup = async () => {
    if (!currentUserId || !groupId) return;

    const groupMembersCollection = collection(db, "groupMembers");
    const snapshot = await getDocs(
      query(
        groupMembersCollection,
        where("groupId", "==", groupId),
        where("userId", "==", currentUserId)
      )
    );
    const memberDoc = snapshot.docs[0];

    if (memberDoc) {
      await memberDoc.ref.delete();
      alert("You have left the group.");
    }
  };

  const deleteGroup = async () => {
    if (!groupId) return;

    try {
      // Step 1: Delete the group document from the 'groups' collection
      const groupDocRef = doc(db, "groups", groupId);
      await deleteDoc(groupDocRef);

      // Step 2: Query the 'groupMembers' collection to find all members of the deleted group
      const groupMembersCollection = collection(db, "groupMembers");
      const snapshot = await getDocs(
        query(groupMembersCollection, where("groupId", "==", groupId))
      );

      // Step 3: Delete each of these member documents from the 'groupMembers' collection
      const batch = writeBatch(db);
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      // Step 4: Update the groups state to remove the deleted group
      setGroups((prevGroups) =>
        prevGroups.filter((group) => group.id !== groupId)
      );

      alert("Group has been deleted.");
    } catch (error) {
      console.error("Error deleting group: ", error);
      alert("Failed to delete group. Please try again.");
    }
  };

  const removeMember = async (memberId) => {
    if (!isCreator) {
      alert("You are not authorized to remove members from this group.");
      return;
    }

    try {
      const groupMembersCollection = collection(db, "groupMembers");
      const snapshot = await getDocs(
        query(
          groupMembersCollection,
          where("groupId", "==", groupId),
          where("userId", "==", memberId)
        )
      );

      const memberDoc = snapshot.docs[0];

      if (memberDoc) {
        await deleteDoc(memberDoc.ref);
        // Update the members state
        setMembers((prevMembers) =>
          prevMembers.filter((member) => member.uid !== memberId)
        );
        alert("Member has been removed from the group.");
      }
    } catch (error) {
      console.error("Error removing member: ", error);
      alert("Failed to remove member. Please try again.");
    }
  };

  useEffect(() => {
    const fetchGroupMembers = async () => {
      if (!groupId) return;

      const groupMembersCollection = collection(db, "groupMembers");
      const groupMembersSnapshot = await getDocs(
        query(groupMembersCollection, where("groupId", "==", groupId))
      );

      const userIds = groupMembersSnapshot.docs.map((doc) => doc.data().userId);

      if (userIds.length === 0) {
        setMembers([]);
        return;
      }

      const usersCollection = collection(db, "users");
      const usersSnapshot = await getDocs(
        query(usersCollection, where("uid", "in", userIds))
      );

      const groupMembers = usersSnapshot.docs.map((doc) => doc.data());
      setMembers(groupMembers);
    };

    fetchGroupMembers();
  }, [groupId]);

  return (
    <div>
      <ul>
        {members.map((member, index) => (
          <li key={index}>
            {member.name} - {member.plants || 0} Plants
            {isCreator && (
              <button onClick={() => removeMember(member.uid)}>
                Remove Member
              </button>
            )}
          </li>
        ))}
      </ul>
      {isCreator ? (
        <button onClick={deleteGroup}>Delete Group</button>
      ) : (
        <button onClick={leaveGroup}>Leave Group</button>
      )}
    </div>
  );
}

// Create groups and show list
function Group() {
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [emailToAdd, setEmailToAdd] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchGroups = async () => {
      const groupsCollection = collection(db, "groups");
      const groupSnapshot = await getDocs(groupsCollection);
      const groupData = groupSnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      // Filter the groups to only include those that the current user is a member of
      const groupMembersCollection = collection(db, "groupMembers");
      const groupMembersSnapshot = await getDocs(
        query(groupMembersCollection, where("userId", "==", currentUser.uid))
      );
      
      const userGroupIds = groupMembersSnapshot.docs.map((doc) => doc.data().groupId);
      const filteredGroups = groupData.filter((group) => userGroupIds.includes(group.id));
      
      setGroups(filteredGroups);
    };

    fetchGroups();
  }, []);

  useEffect(() => {
    const fetchGroupMembers = async () => {
      if (!selectedGroupId) {
        setGroupMembers([]); // Clear the group members if no group is selected
        return;
      }

      const groupMembersCollection = collection(db, "groupMembers");
      const groupMembersSnapshot = await getDocs(
        query(groupMembersCollection, where("groupId", "==", selectedGroupId))
      );

      const userIds = groupMembersSnapshot.docs.map((doc) => doc.data().userId);

      if (userIds.length === 0) {
        setGroupMembers([]);
        return;
      }

      const usersCollection = collection(db, "users");
      const usersSnapshot = await getDocs(
        query(usersCollection, where("uid", "in", userIds))
      );

      const members = usersSnapshot.docs.map((doc) => doc.data());
      setGroupMembers(members);
    };

    fetchGroupMembers();
  }, [selectedGroupId]);

  const createGroup = async () => {
    if (!newGroupName || !newGroupDescription) {
      alert("Please enter a group name and description.");
      return;
    }

    try {
      const groupsCollection = collection(db, "groups");
      const groupDocRef = await addDoc(groupsCollection, {
        name: newGroupName,
        description: newGroupDescription,
        createdBy: currentUser.uid,
      });

      // Get the id of the newly created group
      const newGroupId = groupDocRef.id;

      // Add the creator as a member of the new group
      const groupMembersCollection = collection(db, "groupMembers");
      await addDoc(groupMembersCollection, {
        groupId: newGroupId,
        userId: currentUser.uid,
        role: "creator",
      });

      // Create a new group object
      const newGroup = {
        id: newGroupId,
        name: newGroupName,
        description: newGroupDescription,
        createdBy: currentUser.uid,
      };

      // Update the groups state to include the new group
      setGroups((prevGroups) => [...prevGroups, newGroup]);

      // Reset the input fields
      setNewGroupName("");
      setNewGroupDescription("");

      alert("Group created successfully and you are added as a member!");
    } catch (error) {
      console.error("Error creating group: ", error);
      alert("Failed to create group. Please try again.");
    }
  };

  const addUserToGroup = async () => {
    if (!selectedGroupId || !emailToAdd) {
      alert("Please select a group and enter a user's email.");
      return;
    }

    const usersCollection = collection(db, "users");
    const userSnapshot = await getDocs(
      query(usersCollection, where("email", "==", emailToAdd))
    );
    const userDoc = userSnapshot.docs[0];

    if (userDoc) {
      // Check if the user is already a member of the group
      const existingMember = groupMembers.find(
        (member) => member.uid === userDoc.id
      );
      if (existingMember) {
        alert("This user is already a member of the group.");
        return;
      }

      const groupMembersCollection = collection(db, "groupMembers");
      await addDoc(groupMembersCollection, {
        groupId: selectedGroupId,
        userId: userDoc.id,
        role: "member",
      });

      // Update the groupMembers state to trigger a re-render
      setGroupMembers((prevMembers) => [...prevMembers, userDoc.data()]);
    }

    setEmailToAdd("");
  };

  return (
    <div>
      <div>
        <h2>My Groups</h2>
        <ul>
          {groups.map((group) => (
            <li key={group.id}>
              <h3>{group.name}</h3>
              <GroupMembers
                groupId={group.id}
                currentUserId={currentUser.uid}
                isCreator={group.createdBy === currentUser.uid}
                setGroups={setGroups}
                groupMembers={groupMembers}
              />
            </li>
          ))}
        </ul>

        <h3>Create a New Group</h3>
        <input
          type="text"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          placeholder="Group Name"
        />
        <input
          type="text"
          value={newGroupDescription}
          onChange={(e) => setNewGroupDescription(e.target.value)}
          placeholder="Group Description"
        />
        <button onClick={createGroup}>Create Group</button>
      </div>

      <div>
        <h3>Add User to Group</h3>
        <select onChange={(e) => setSelectedGroupId(e.target.value)}>
          <option value="">Select a Group</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
        <input
          type="email"
          value={emailToAdd}
          onChange={(e) => setEmailToAdd(e.target.value)}
          placeholder="Enter user's email"
        />
        <button onClick={addUserToGroup}>Add User to Group</button>
      </div>

      {currentUser && <AddFriend currentUser={currentUser} />}
      {currentUser && <FriendList currentUser={currentUser} />}
    </div>
  );
}

export default Group;
