// Simple login simulation
let isLoggedIn = false;
const listeners: Array<(isLoggedIn: boolean) => void> = [];

function toggleLogin() {
  isLoggedIn = !isLoggedIn;
  updateLoginUI();
  // Notify all listeners
  listeners.forEach(fn => fn(isLoggedIn));
}

function updateLoginUI() {
  const btn = document.getElementById('login-toggle');
  if (btn) {
    btn.textContent = isLoggedIn ? 'Logout' : 'Login';
    (btn as HTMLElement).style.backgroundColor = isLoggedIn ? '#ef4444' : '#22c55e';
  }
  const status = document.getElementById('login-status');
  if (status) {
    status.textContent = isLoggedIn ? 'Logged in' : 'Logged out';
  }
}

// Create login toggle UI
function createLoginToggle() {
  const container = document.createElement('div');
  container.style.cssText = 'position: fixed; top: 10px; right: 10px; display: flex; align-items: center; gap: 10px; z-index: 9999;';
  
  const status = document.createElement('span');
  status.id = 'login-status';
  status.textContent = 'Logged out';
  status.style.cssText = 'color: #666; font-size: 14px;';
  
  const btn = document.createElement('button');
  btn.id = 'login-toggle';
  btn.textContent = 'Login';
  btn.style.cssText = 'padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; color: white; background-color: #22c55e;';
  btn.onclick = toggleLogin;
  
  container.appendChild(status);
  container.appendChild(btn);
  document.body.appendChild(container);
}

// Initialize login toggle when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createLoginToggle);
} else {
  createLoginToggle();
}

// Getter function to check login state
export function getIsLoggedIn() {
  return isLoggedIn;
}

// Subscribe to login state changes
export function onLoginChange(callback: (isLoggedIn: boolean) => void) {
  listeners.push(callback);
  // Return unsubscribe function
  return () => {
    const index = listeners.indexOf(callback);
    if (index > -1) listeners.splice(index, 1);
  };
}
