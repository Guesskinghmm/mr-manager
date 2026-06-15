// --- DOM Elements Configuration ---
const UI = {
    navLinks: document.querySelectorAll('.nav-links a'),
    searchButton: document.querySelector('.search-btn'),
    loginButton: document.querySelector('.login-btn')
};

// --- Action Handlers ---

/**
 * Handles the visual active state switching for navigation links.
 * @param {Event} event 
 */
const handleNavigation = (event) => {
    // Prevent default anchor behavior for the demo
    event.preventDefault(); 
    
    // Clear active states
    UI.navLinks.forEach(link => link.classList.remove('active'));
    
    // Set clicked link as active
    event.currentTarget.classList.add('active');
    console.log(`Mapsd to: ${event.currentTarget.textContent}`);
};

/**
 * Handles search button click behavior.
 */
const handleSearch = () => {
    console.log('Search modal triggered.');
    // Logic to open a search overlay would go here
};

/**
 * Handles the login/register button click.
 * @param {Event} event 
 */
const handleAuthRoute = (event) => {
    console.log('Routing to Auth portal...');
};

// --- Initialization ---

/**
 * Binds all event listeners to their respective DOM elements.
 */
const bindEvents = () => {
    // Bind Navigation Links
    UI.navLinks.forEach(link => {
        link.addEventListener('click', handleNavigation);
    });

    // Bind Action Buttons
    if (UI.searchButton) {
        UI.searchButton.addEventListener('click', handleSearch);
    }
    
    if (UI.loginButton) {
        UI.loginButton.addEventListener('click', handleAuthRoute);
    }
};

/**
 * Bootstrap the application
 */
const initApp = () => {
    bindEvents();
    console.log('Template initialized successfully.');
};

// Run app once the DOM is fully parsed
document.addEventListener('DOMContentLoaded', initApp);
// Check Authentication State on Page Load
const checkAuth = () => {
    // Target the new formal button ID
    const loginBtn = document.getElementById('main-auth-btn');
    if (!loginBtn) return; // Safety check

    const isLoggedIn = localStorage.getItem('isLoggedIn');

    if (isLoggedIn === 'true') {
        // Change button to Dashboard
        loginBtn.textContent = 'Go to Dashboard';
        loginBtn.href = 'dashboard.html';
        loginBtn.style.backgroundColor = '#3b6bdc'; // Corporate Blue
        loginBtn.style.color = '#ffffff';
    } else {
        // Default Login State
        loginBtn.textContent = 'Log In / Sign Up';
        loginBtn.href = 'login.html';
    }
};

document.addEventListener('DOMContentLoaded', checkAuth);