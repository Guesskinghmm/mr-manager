// DOM Elements
const loginForm = document.getElementById('l');
const signupForm = document.getElementById('s');
const tabLogin = document.getElementById('t1');
const tabSignup = document.getElementById('t2');

// Login Inputs
const loginCred = document.getElementById('login-cred');
const loginPass = document.getElementById('login-pass');

// Signup Inputs
const signupName = document.getElementById('signup-name');
const signupUser = document.getElementById('signup-user');
const signupEmail = document.getElementById('signup-email');
const signupPass = document.getElementById('signup-pass');
const signupConfirm = document.getElementById('signup-confirm');

// Tab Switching
tabLogin.addEventListener('click', () => {
    loginForm.style.display = 'flex';
    signupForm.style.display = 'none';
    tabLogin.classList.add('act');
    tabSignup.classList.remove('act');
});

tabSignup.addEventListener('click', () => {
    loginForm.style.display = 'none';
    signupForm.style.display = 'flex';
    tabSignup.classList.add('act');
    tabLogin.classList.remove('act');
});

// --- SIGN UP LOGIC ---
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Validation
    if(signupPass.value.length < 6) {
        return alert('Password must be at least 6 characters');
    }
    if(signupPass.value !== signupConfirm.value) {
        return alert('Passwords do not match');
    }
    
    // Save registration data to browser memory (simulating a database)
    localStorage.setItem('db_name', signupName.value);
    localStorage.setItem('db_username', signupUser.value);
    localStorage.setItem('db_email', signupEmail.value);
    localStorage.setItem('db_password', signupPass.value);
    
    alert('Signup Successful! Please log in with your new credentials.');
    
    // Clear forms and switch to login tab
    signupForm.reset();
    tabLogin.click(); 
});

// --- LOG IN LOGIC ---
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Fetch registered data from our "database"
    const dbName = localStorage.getItem('db_name');
    const dbUsername = localStorage.getItem('db_username');
    const dbEmail = localStorage.getItem('db_email');
    const dbPassword = localStorage.getItem('db_password');
    
    // Check if user has registered at all
    if (!dbEmail) {
        return alert('No account found. Please sign up first!');
    }

    // Check if the entered credential matches EITHER the email OR the username
    const isCredValid = (loginCred.value === dbEmail || loginCred.value === dbUsername);
    const isPassValid = (loginPass.value === dbPassword);
    
    if (isCredValid && isPassValid) {
        // Successful Login! Save active session data
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('active_name', dbName);
        localStorage.setItem('active_email', dbEmail);
        localStorage.setItem('active_username', dbUsername);
        
        // Redirect to home page
        window.location.href = "index.html"; 
    } else {
        alert('Invalid credentials. Please try again.');
    }
});