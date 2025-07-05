// This script handles the login page functionality, including animation and Firebase authentication.

// Import necessary functions from the Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// IMPORT firebaseConfig from its own module
import { firebaseConfig } from './firebase-config.js';

// IMPORT updateCartIcon and updateLoginButtonVisibility from main.js (for sitewide icon and button updates)
import { updateCartIcon, updateLoginButtonVisibility } from './main.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // REMOVED 'export' keyword here
const db = getFirestore(app); // REMOVED 'export' keyword here

let currentUser = null; // This variable's state is primarily for login.js's internal use. auth.currentUser is more reliable.

// --- UI Elements ---
const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.querySelector('.container-box');

const signUpForm = document.getElementById('signUpForm');
const signInForm = document.getElementById('signInForm');

const loginSuccessModal = document.getElementById('login-success-modal'); // New modal element
const loginSuccessCloseBtn = document.getElementById('login-success-close-btn');
const loginSuccessHomeBtn = document.getElementById('login-success-home-btn');


// --- Animation Logic ---
if (signUpButton) {
    signUpButton.addEventListener('click', () => {
        container.classList.add("right-panel-active");
    });
}

if (signInButton) {
    signInButton.addEventListener('click', () => {
        container.classList.remove("right-panel-active");
    });
}

// --- Cart Migration and State Management Functions ---

function getLocalCart() {
    return JSON.parse(localStorage.getItem('readyflow_cart')) || [];
}

async function migrateLocalCartToFirestore(uid) {
    const localCart = getLocalCart();
    if (localCart.length > 0) {
        const cartRef = doc(db, 'carts', uid);
        try {
            const docSnap = await getDoc(cartRef);
            let existingFirestoreItems = [];
            if (docSnap.exists()) {
                existingFirestoreItems = docSnap.data().items || [];
            }

            const mergedCartItems = [...existingFirestoreItems];
            localCart.forEach(localItem => {
                if (!mergedCartItems.some(fsItem => fsItem.id === localItem.id)) {
                    mergedCartItems.push(localItem);
                }
            });

            await setDoc(cartRef, { items: mergedCartItems });
            localStorage.removeItem('readyflow_cart');
            console.log('Local cart migrated/merged to Firestore successfully for user:', uid);
        } catch (error) {
            console.error('Error migrating local cart to Firestore:', error);
        }
    }
}

// --- Login Success Modal Functions ---
function showLoginSuccessModal() {
    if (loginSuccessModal) {
        loginSuccessModal.classList.add('show');
    }
}

function hideLoginSuccessModal() {
    if (loginSuccessModal) {
        loginSuccessModal.classList.remove('show');
    }
}

// Event listeners for the new modal
if (loginSuccessCloseBtn) {
    loginSuccessCloseBtn.addEventListener('click', hideLoginSuccessModal);
}

if (loginSuccessHomeBtn) {
    loginSuccessHomeBtn.addEventListener('click', () => {
        hideLoginSuccessModal();
        window.location.href = '../index.html'; // Redirect to home page
    });
}


// Listen for authentication state changes (This listener is now the primary trigger for updateCartIcon sitewide)
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user; // Update the local currentUser variable
        console.log('User signed in:', user.uid);
        await migrateLocalCartToFirestore(user.uid);
    } else {
        currentUser = null; // Clear the local currentUser variable
        console.log('User signed out.');
    }
    // IMPORTANT: Call updateCartIcon and updateLoginButtonVisibility AFTER the auth state is known (and migration is potentially done)
    // This ensures the icon and button reflect the correct state for logged-in or guest users across all pages.
    await updateCartIcon();
    updateLoginButtonVisibility();
});

// --- Firebase Authentication Logic ---

if (signUpForm) {
    signUpForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        createUserWithEmailAndPassword(auth, email, password)
            .then(userCredential => {
                const user = userCredential.user;
                console.log('Sign up successful!', user);
                showLoginSuccessModal(); // Show success modal
            })
            .catch(error => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error('Sign up error:', errorCode, errorMessage);
                alert(`Error: ${errorMessage}`);
            });
    });
}

if (signInForm) {
    signInForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('signin-email').value;
        const password = document.getElementById('signin-password').value;

        signInWithEmailAndPassword(auth, email, password)
            .then(userCredential => {
                const user = userCredential.user;
                console.log('Sign in successful!', user);
                showLoginSuccessModal(); // Show success modal
            })
            .catch(error => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error('Sign in error:', errorCode, errorMessage);
                if (errorCode === 'auth/wrong-password' || errorCode === 'auth/user-not-found') {
                    alert('Invalid email or password. Please try again.');
                } else {
                    alert(`Error: ${errorMessage}`);
                }
            });
    });
}

// Export auth and db for use in other modules like main.js and cart.js
// currentUser is less reliable for real-time auth state; prefer onAuthStateChanged or auth.currentUser
// But keeping for backward compatibility if other files directly use currentUser.
export { auth, db, currentUser };