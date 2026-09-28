// Firebase SDKを読み込む
import { initializeApp } from
  "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  sendEmailVerification,
  reload
} from
  "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from
  "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";


// Firebaseの設定
const firebaseConfig = {
  apiKey: "AIzaSyCYfqnqLJ1tB33q1b4gFvrDtX0LDFwtGuE",
  authDomain: "newlifeapp-4b7a5.firebaseapp.com",
  projectId: "newlifeapp-4b7a5",
  storageBucket: "newlifeapp-4b7a5.firebasestorage.app",
  messagingSenderId: "901170628141",
  appId: "1:901170628141:web:2a595e67675504f0a0daa4",
  measurementId: "G-FPHNTMR7Q9"
};

// Firebaseを起動
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// HTML要素
const authPage = document.getElementById("authPage");
const emailInput = document.getElementById("authEmail");
const passwordInput = document.getElementById("authPassword");
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const authMessage = document.getElementById("authMessage");


// ================================
// 新規登録
// ================================
registerBtn.addEventListener("click", async () => {

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    authMessage.textContent =
      "メールアドレスとパスワードを入力してください。";
    return;
  }

  try {

    const userCredential =
      await createUserWithEmailAndPassword(auth, email, password);

await sendEmailVerification(userCredential.user);

console.log("確認メール送信成功");

authMessage.textContent =
  "確認メールを送信しました。メール内のリンクを押してください。";

await signOut(auth);

  } catch (error) {

    console.error(error);

    if (error.code === "auth/email-already-in-use") {
      authMessage.textContent =
        "このメールアドレスは既に登録されています。";
    } else if (error.code === "auth/weak-password") {
      authMessage.textContent =
        "パスワードは6文字以上にしてください。";
    } else if (error.code === "auth/invalid-email") {
      authMessage.textContent =
        "メールアドレスの形式を確認してください。";
    } else {
      authMessage.textContent =
        "新規登録に失敗しました。";
    }
  }
});


// ================================
// ログイン
// ================================
loginBtn.addEventListener("click", async () => {

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    authMessage.textContent =
      "メールアドレスとパスワードを入力してください。";
    return;
  }

  try {

    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

  } catch (error) {

    console.error(error);

    authMessage.textContent =
      "メールアドレスまたはパスワードを確認してください。";
  }
});


// ================================
// ログイン状態を監視
// ================================
onAuthStateChanged(auth, async (user) => {

  if (user) {

    // Firebaseから最新のメール認証状態を取得
    await reload(user);

    // メール認証がまだ終わっていない場合
    if (!user.emailVerified) {

      authPage.classList.remove("hidden");

      document.getElementById("onboardingPage")
        .classList.add("hidden");

      document.getElementById("mainApp")
        .classList.add("hidden");

      authMessage.textContent =
        "メール認証が完了していません。確認メールのリンクを押してから、再度ログインしてください。";

      await signOut(auth);
      return;
    }

    // メール認証が完了している場合
    console.log("ログイン中:", user.email);
    console.log("UID:", user.uid);

    authPage.classList.add("hidden");

  // Firestoreからこのユーザーのデータを取得
  const cloudData = await window.loadFromFirestore();

  if (cloudData) {

    // script.jsのdataを更新
    window.setAppData(cloudData);

    console.log("クラウドデータをアプリに反映しました");

  }

  // アンケート or メイン画面
  if (window.getAppData().profile) {
    showMain();
  } else {
    showOnboarding();
  }
} else {

    console.log("ログアウト状態");

    authPage.classList.remove("hidden");

    document
      .getElementById("onboardingPage")
      .classList.add("hidden");

    document
      .getElementById("mainApp")
      .classList.add("hidden");
  }
});


// 後でscript.jsから使えるようにする
window.firebaseAuth = auth;

window.logoutFirebase = function () {
  return signOut(auth);
};

document.getElementById("logoutBtn").addEventListener("click", async () => {
  try {
    await signOut(auth);
    authMessage.textContent = "";
    emailInput.value = "";
    passwordInput.value = "";
  } catch (error) {
    console.error("ログアウトエラー:", error);
  }
});

window.saveToFirestore = async function(appData) {

  const user = auth.currentUser;

  if (!user) {
    console.log("ログインしていないためFirestoreには保存しません");
    return;
  }

  try {

    await setDoc(
      doc(db, "users", user.uid),
      appData
    );

    console.log("Firestoreへの保存成功");

  } catch (error) {

    console.error("Firestore保存エラー:", error);

  }
};

window.loadFromFirestore = async function () {

  const user = auth.currentUser;

  if (!user) {
    console.log("ログインしていません");
    return null;
  }

  try {

    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("Firestoreから読み込み成功");
      return docSnap.data();
    } else {
      console.log("Firestoreにデータがありません");
      return null;
    }

  } catch (error) {

    console.error("Firestore読み込みエラー:", error);
    return null;

  }
};