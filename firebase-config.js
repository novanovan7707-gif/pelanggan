// ===============================
//  Firebase Config
// ===============================
const firebaseConfig = {
  apiKey: "AIzaSyAdKDmGhBR1NVpc0OWYQECAgu7hJ8UzZao",
  authDomain: "kedai-h562-ec7e2.firebaseapp.com",
  projectId: "kedai-h562-ec7e2",
  storageBucket: "kedai-h562-ec7e2.appspot.com",
  messagingSenderId: "968139122736",
  appId: "1:968139122736:web:17eab3ad282e6d2cfe65f5"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ===============================
//  Firebase Helper
// ===============================
const FirebaseHelper = {

  // =======================
  //  LABA (NEW)
  // =======================

  /**
   * Hitung dan simpan data laba rugi ke Firebase
   * @param {Object} labaData - Data laba rugi
   * @returns {Promise<Object>} Result dengan success status
   */
  async saveLabaRugi(labaData) {
    try {
      const docId = `laba-${Date.now()}`;
      await db.collection("laba").doc(docId).set({
        ...labaData,
        id: docId,
        createdAt: Date.now(),
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
      console.log("✅ Laba rugi saved with ID:", docId);
      return { success: true, id: docId, data: labaData };
    } catch (error) {
      console.error("❌ Error saving laba rugi:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Ambil semua data laba rugi
   * @returns {Promise<Array>} Array of laba records
   */
  async getAllLaba() {
    try {
      const snapshot = await db.collection("laba")
        .orderBy("createdAt", "desc")
        .get();
      
      const labaData = [];
      snapshot.forEach(doc => {
        labaData.push({ 
          docId: doc.id,
          ...doc.data() 
        });
      });
      
      console.log(`📊 Loaded ${labaData.length} laba records`);
      return labaData;
    } catch (error) {
      console.error("❌ Error getting laba data:", error);
      // Fallback tanpa ordering
      try {
        const snapshot = await db.collection("laba").get();
        const labaData = [];
        snapshot.forEach(doc => {
          labaData.push({ 
            docId: doc.id,
            ...doc.data() 
          });
        });
        console.log(`📊 Loaded ${labaData.length} laba records (no ordering)`);
        return labaData;
      } catch (fallbackError) {
        console.error("❌ Error getting laba (fallback):", fallbackError);
        return [];
      }
    }
  },

  /**
   * Ambil data laba berdasarkan periode
   * @param {String} startDate - Tanggal mulai (YYYY-MM-DD)
   * @param {String} endDate - Tanggal akhir (YYYY-MM-DD)
   * @returns {Promise<Array>} Filtered laba records
   */
  async getLabaByPeriod(startDate, endDate) {
    try {
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).setHours(23, 59, 59, 999);
      
      const snapshot = await db.collection("laba")
        .where("createdAt", ">=", start)
        .where("createdAt", "<=", end)
        .orderBy("createdAt", "desc")
        .get();
      
      const labaData = [];
      snapshot.forEach(doc => {
        labaData.push({ 
          docId: doc.id,
          ...doc.data() 
        });
      });
      
      console.log(`📊 Loaded ${labaData.length} laba records for period`);
      return labaData;
    } catch (error) {
      console.error("❌ Error getting laba by period:", error);
      return [];
    }
  },

  /**
   * Hapus data laba berdasarkan ID
   * @param {String} labaId - ID dokumen laba
   * @returns {Promise<Object>} Result dengan success status
   */
  async deleteLabaRecord(labaId) {
    try {
      await db.collection("laba").doc(labaId).delete();
      console.log("✅ Laba record deleted:", labaId);
      return { success: true };
    } catch (error) {
      console.error("❌ Error deleting laba:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Real-time listener untuk data laba
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  listenToAllLaba(callback) {
    try {
      return db.collection("laba")
        .orderBy("createdAt", "desc")
        .onSnapshot(
          (snapshot) => {
            const labaData = [];
            snapshot.forEach(doc => {
              labaData.push({ 
                docId: doc.id,
                ...doc.data() 
              });
            });
            console.log(`📊 Real-time update: ${labaData.length} laba records`);
            callback({ success: true, data: labaData });
          },
          (error) => {
            console.error("❌ Error listening to laba:", error);
            // Fallback tanpa ordering
            return db.collection("laba").onSnapshot(
              (snapshot) => {
                const labaData = [];
                snapshot.forEach(doc => {
                  labaData.push({ 
                    docId: doc.id,
                    ...doc.data() 
                  });
                });
                console.log(`📊 Real-time update: ${labaData.length} laba records (no ordering)`);
                callback({ success: true, data: labaData });
              },
              (fallbackError) => {
                console.error("❌ Error listening (fallback):", fallbackError);
                callback({ success: false, error: fallbackError.message });
              }
            );
          }
        );
    } catch (error) {
      console.error("❌ Error setting up laba listener:", error);
      callback({ success: false, error: error.message });
      return null;
    }
  },

  /**
   * Update data laba
   * @param {String} labaId - ID dokumen laba
   * @param {Object} updateData - Data yang akan diupdate
   * @returns {Promise<Object>} Result dengan success status
   */
  async updateLabaRecord(labaId, updateData) {
    try {
      await db.collection("laba").doc(labaId).update({
        ...updateData,
        updatedAt: Date.now()
      });
      console.log("✅ Laba record updated:", labaId);
      return { success: true };
    } catch (error) {
      console.error("❌ Error updating laba:", error);
      return { success: false, error: error.message };
    }
  },

  // =======================
  //  EXPENSES
  // =======================

  async getAllExpenses() {
    try {
      const snapshot = await db.collection("expenses").orderBy("date", "desc").get();
      const expenses = [];
      snapshot.forEach(doc => {
        expenses.push({ 
          docId: doc.id,
          id: doc.id,
          ...doc.data() 
        });
      });
      console.log(`📊 Loaded ${expenses.length} expenses`);
      return expenses;
    } catch (error) {
      console.error("❌ Error getting expenses:", error);
      try {
        const snapshot = await db.collection("expenses").get();
        const expenses = [];
        snapshot.forEach(doc => {
          expenses.push({ 
            docId: doc.id,
            id: doc.id,
            ...doc.data() 
          });
        });
        console.log(`📊 Loaded ${expenses.length} expenses (no ordering)`);
        return expenses;
      } catch (fallbackError) {
        console.error("❌ Error getting expenses (fallback):", fallbackError);
        return [];
      }
    }
  },

  async addExpense(expenseData) {
    try {
      const docRef = await db.collection("expenses").add(expenseData);
      console.log("✅ Expense added with ID:", docRef.id);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("❌ Error adding expense:", error);
      return { success: false, error: error.message };
    }
  },

  async deleteExpense(expenseId) {
    try {
      console.log("🗑️ Deleting expense:", expenseId);
      await db.collection("expenses").doc(expenseId).delete();
      console.log("✅ Expense deleted successfully");
      return { success: true };
    } catch (error) {
      console.error("❌ Error deleting expense:", error);
      return { success: false, error: error.message };
    }
  },

  listenToAllExpenses(callback) {
    try {
      return db.collection("expenses")
        .orderBy("date", "desc")
        .onSnapshot(
          (snapshot) => {
            const expenses = [];
            snapshot.forEach(doc => {
              expenses.push({ 
                docId: doc.id,
                id: doc.id,
                ...doc.data() 
              });
            });
            console.log(`📊 Real-time update: ${expenses.length} expenses`);
            callback({ success: true, data: expenses });
          },
          (error) => {
            console.error("❌ Error listening to expenses:", error);
            return db.collection("expenses").onSnapshot(
              (snapshot) => {
                const expenses = [];
                snapshot.forEach(doc => {
                  expenses.push({ 
                    docId: doc.id,
                    id: doc.id,
                    ...doc.data() 
                  });
                });
                console.log(`📊 Real-time update: ${expenses.length} expenses (no ordering)`);
                callback({ success: true, data: expenses });
              },
              (fallbackError) => {
                console.error("❌ Error listening (fallback):", fallbackError);
                callback({ success: false, error: fallbackError.message });
              }
            );
          }
        );
    } catch (error) {
      console.error("❌ Error setting up listener:", error);
      callback({ success: false, error: error.message });
      return null;
    }
  },

  // =======================
  //  ORDERS
  // =======================

  async createOrder(orderData) {
    try {
      await db.collection("orders").doc(orderData.id).set(orderData);
      console.log("✅ Order created:", orderData.id);
      return { success: true, data: orderData };
    } catch (error) {
      console.error("❌ Error creating order:", error);
      return { success: false, error: error.message };
    }
  },

  async getAllOrders() {
    try {
      const snapshot = await db.collection("orders").orderBy("timestamp", "desc").get();
      const orders = [];
      snapshot.forEach(doc => orders.push(doc.data()));
      console.log(`📦 Loaded ${orders.length} orders`);
      return orders;
    } catch (error) {
      console.error("❌ Error getting orders:", error);
      return [];
    }
  },

  async updateOrderStatus(orderId, newStatus) {
    try {
      await db.collection("orders").doc(orderId).update({
        status: newStatus,
        updatedAt: Date.now()
      });
      console.log("✅ Order status updated:", orderId, "→", newStatus);
      return { success: true };
    } catch (error) {
      console.error("❌ Error updating status:", error);
      return { success: false, error: error.message };
    }
  },

  async deleteOrder(orderId) {
    try {
      await db.collection("orders").doc(orderId).delete();
      console.log("✅ Order deleted:", orderId);
      return { success: true };
    } catch (error) {
      console.error("❌ Error deleting order:", error);
      return { success: false, error: error.message };
    }
  },

  async deleteAllOrders() {
    try {
      const snapshot = await db.collection("orders").get();
      const batch = db.batch();
      let count = 0;

      snapshot.forEach(doc => {
        batch.delete(doc.ref);
        count++;
      });

      await batch.commit();
      console.log(`✅ Deleted ${count} orders`);
      return { success: true, count };
    } catch (error) {
      console.error("❌ Error deleting all orders:", error);
      return { success: false, error: error.message };
    }
  },

  listenToOrder(orderId, callback) {
    return db.collection("orders").doc(orderId).onSnapshot(
      (doc) => {
        if (doc.exists) {
          callback({ success: true, data: doc.data() });
        } else {
          callback({ success: false, error: "Order not found" });
        }
      },
      (error) => {
        console.error("❌ Error listening:", error);
        callback({ success: false, error: error.message });
      }
    );
  },

  listenToAllOrders(callback) {
    return db.collection("orders").orderBy("timestamp", "desc").onSnapshot(
      (snapshot) => {
        const orders = [];
        snapshot.forEach(doc => orders.push(doc.data()));
        console.log(`📦 Real-time update: ${orders.length} orders`);
        callback({ success: true, data: orders });
      },
      (error) => {
        console.error("❌ Error listening:", error);
        callback({ success: false, error: error.message });
      }
    );
  },

  // =======================
  //  FEEDBACK
  // =======================

  async createFeedback(feedbackData) {
    try {
      const docRef = await db.collection("feedback").add(feedbackData);
      console.log("✅ Feedback created:", docRef.id);
      return { success: true, data: { id: docRef.id, ...feedbackData } };
    } catch (error) {
      console.error("❌ Error creating feedback:", error);
      return { success: false, error: error.message };
    }
  },

  async getAllFeedback() {
    try {
      const snapshot = await db.collection("feedback").orderBy("timestamp", "desc").get();
      const feedback = [];
      snapshot.forEach(doc => feedback.push({ id: doc.id, ...doc.data() }));
      console.log(`💬 Loaded ${feedback.length} feedback`);
      return feedback;
    } catch (error) {
      console.error("❌ Error getting feedback:", error);
      return [];
    }
  },

  listenToAllFeedback(callback) {
    return db.collection("feedback").orderBy("timestamp", "desc").onSnapshot(
      (snapshot) => {
        const feedback = [];
        snapshot.forEach(doc => feedback.push({ id: doc.id, ...doc.data() }));
        console.log(`💬 Real-time update: ${feedback.length} feedback`);
        callback({ success: true, data: feedback });
      },
      (error) => {
        console.error("❌ Error listening feedback:", error);
        callback({ success: false, error: error.message });
      }
    );
  }
};

// Expose to window
window.FirebaseHelper = FirebaseHelper;
console.log("🔥 Firebase initialized and FirebaseHelper ready with Laba database!");