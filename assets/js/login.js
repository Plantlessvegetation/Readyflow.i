// This script handles the login page functionality, including animation and Firebase authentication.

// Import necessary functions from the Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Initialize Firebase using the config from firebase-config.js
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// --- UI Elements ---
const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.querySelector('.container-box');

const signUpForm = document.getElementById('signUpForm');
const signInForm = document.getElementById('signInForm');

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

// --- Firebase Authentication Logic ---

// Handle Sign Up
if (signUpForm) {
    signUpForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent the form from submitting the traditional way

        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        // const username = document.getElementById('signup-username').value; // We can use this later

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in 
                const user = userCredential.user;
                console.log('Sign up successful!', user);
                alert('Account created successfully! You are now logged in.');
                // Redirect to the homepage after successful sign up
                window.location.href = '../index.html';
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error('Sign up error:', errorCode, errorMessage);
                // Show a user-friendly error message
                alert(`Error: ${errorMessage}`);
            });
    });
}

// Handle Sign In
if (signInForm) {
    signInForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('signin-email').value;
        const password = document.getElementById('signin-password').value;

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in 
                const user = userCredential.user;
                console.log('Sign in successful!', user);
                alert('Welcome back! You are now logged in.');
                // Redirect to the homepage after successful sign in
                window.location.href = '../index.html';
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error('Sign in error:', errorCode, errorMessage);
                // Show a user-friendly error message
                if (errorCode === 'auth/wrong-password' || errorCode === 'auth/user-not-found') {
                    alert('Invalid email or password. Please try again.');
                } else {
                    alert(`Error: ${errorMessage}`);
                }
            });
    });
}
