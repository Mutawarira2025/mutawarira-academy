import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBw-jR6fzfwbR-XjCmoo38fNAXcK9pNC0k",
  authDomain: "mutawarira-life.firebaseapp.com",
  databaseURL: "https://mutawarira-life-default-rtdb.firebaseio.com",
  projectId: "mutawarira-life",
  storageBucket: "mutawarira-life.firebasestorage.app",
  messagingSenderId: "336813710825",
  appId: "1:336813710825:web:c4f9fc46d20d1196ff3f78"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
