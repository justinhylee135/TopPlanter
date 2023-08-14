import { db } from './firebase';

const FirestoreService = {

  addUserToFirestore: async (userId, data) => {
    try {
      await db.collection('users').doc(userId).set(data, { merge: true });
    } catch (error) {
      console.error('Error adding user to Firestore:', error);
    }
  },

  getAllUsers: async () => {
    try {
      const snapshot = await db.collection('users').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching users from Firestore:', error);
      return [];
    }
  }
};

export default FirestoreService;