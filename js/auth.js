


import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDmmawVH2zJMqaL0bG8fzFpGMA4Pyy8DN8",
  authDomain: "jnr-games-store-new-games.firebaseapp.com",
  projectId: "jnr-games-store-new-games",
  storageBucket: "jnr-games-store-new-games.appspot.com",
  messagingSenderId: "380808423824",
  appId: "1:380808423824:web:c62f146ac2559f6f6c6b15"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

// DOM elements
const googleLoginBtn = document.getElementById('googleLogin');
const logoutBtn = document.getElementById('logout');
const notifBell = document.getElementById('notifBell');
const notifBadge = document.getElementById('notifBadge');
const notifPopup = document.getElementById('notifPopup');
const notifList = document.getElementById('notifList');
const userProfile = document.getElementById('userProfile');

// Google login handler
googleLoginBtn.addEventListener('click', async () => {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("Login error:", error);
  }
});

// Logout handler
logoutBtn.addEventListener('click', () => {
  signOut(auth);
  notifPopup.style.display = 'none';
});

// Notification bell click handler
notifBell.addEventListener('click', async (e) => {
  e.stopPropagation();
  const user = auth.currentUser;
  if (!user) return;

  // Toggle popup visibility
  const isVisible = notifPopup.style.display === 'block';
  notifPopup.style.display = isVisible ? 'none' : 'block';

  if (!isVisible) {
    try {
      // Fetch user data
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const lastChecked = userSnap.exists() ? userSnap.data().lastChecked?.toMillis?.() || 0 : 0;

      // Fetch games
      const gamesRef = collection(db, "games");
      const q = query(gamesRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      notifList.innerHTML = "";
      let newCount = 0;

      querySnapshot.forEach(docSnap => {
        const game = docSnap.data();
        const li = document.createElement("li");
        li.textContent = game.title;
        notifList.appendChild(li);

        if (game.createdAt?.toMillis?.() > lastChecked) {
          newCount++;
        }
      });

      // Update badge
      notifBadge.style.display = newCount > 0 ? 'inline' : 'none';
      notifBadge.textContent = newCount;

      // Update last checked time
      await setDoc(userRef, { lastChecked: serverTimestamp() }, { merge: true });
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  }
});

// Close popup when clicking outside
document.addEventListener('click', (e) => {
  if (!notifPopup.contains(e.target) && e.target !== notifBell) {
    notifPopup.style.display = 'none';
  }
});

// Auth state change handler
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // User is signed in
    googleLoginBtn.style.display = 'none';
    logoutBtn.style.display = 'inline';
    document.getElementById('notification').style.display = 'inline';
    userProfile.style.display = 'flex';
    
    // Set user profile
    document.getElementById('userName').textContent = user.displayName || 'User';
    document.getElementById('userPic').src = user.photoURL || 'https://via.placeholder.com/36';

    // Check for new games
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const lastChecked = userSnap.exists() ? userSnap.data().lastChecked?.toMillis?.() || 0 : 0;

      const gamesRef = collection(db, "games");
      const q = query(gamesRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      let newGames = 0;
      querySnapshot.forEach(docSnap => {
        const game = docSnap.data();
        if (game.createdAt?.toMillis?.() > lastChecked) {
          newGames++;
        }
      });

      // Update badge if new games
      if (newGames > 0) {
        notifBadge.style.display = 'inline';
        notifBadge.textContent = newGames;
      }
    } catch (error) {
      console.error("Error checking for new games:", error);
    }
  } else {
    // User is signed out
    googleLoginBtn.style.display = 'inline';
    logoutBtn.style.display = 'none';
    document.getElementById('notification').style.display = 'none';
    userProfile.style.display = 'none';
    notifBadge.style.display = 'none';
    notifPopup.style.display = 'none';
  }
});