// User management
const users = {
  'admin': { password: 'admin123', role: 'admin', name: 'Administrator' },
  'user': { password: 'user123', role: 'user', name: 'Regular User' }
};

let currentUser = null;
let totalSlots = 20;
let ratePerHour = 50; // Charging rate per hour
let slots = Array(totalSlots).fill(null); // null = empty, object = { carNumber, entryTime }

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  showLoginPage();
  setupEventListeners();
});

function setupEventListeners() {
  document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    login();
  });
}

function showLoginPage() {
  document.getElementById('loginPage').classList.add('active');
  document.getElementById('parkingPage').classList.remove('active');
}

function showParkingPage() {
  document.getElementById('loginPage').classList.remove('active');
  document.getElementById('parkingPage').classList.add('active');
  updateUI();
}

function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('loginError');

  if (users[username] && users[username].password === password) {
    currentUser = { username, ...users[username] };
    document.getElementById('welcomeMessage').textContent = `Welcome, ${currentUser.name}`;
    showParkingPage();
    showMessage(`Login successful! Welcome ${currentUser.name}`, 'success');
  } else {
    errorDiv.textContent = 'Invalid username or password';
    setTimeout(() => {
      errorDiv.textContent = '';
    }, 3000);
  }
}

function logout() {
  currentUser = null;
  document.getElementById('username').value = '';
  document.getElementById('password').value = '';
  showLoginPage();
}

function updateUI() {
  const lot = document.getElementById("lot");
  lot.innerHTML = "";

  slots.forEach((slot, index) => {
    const div = document.createElement("div");
    div.className = "slot";
    if (slot) {
      div.classList.add("occupied");
      div.innerHTML = `<div class="slot-number">${index + 1}</div><div class="car-number">${slot.carNumber}</div>`;
    } else {
      div.innerHTML = `<div class="slot-number">${index + 1}</div>`;
    }

    div.addEventListener('click', () => toggleSlot(index));
    lot.appendChild(div);
  });

  updateStats();
}

function updateStats() {
  const occupied = slots.filter(slot => slot !== null).length;
  const available = totalSlots - occupied;

  document.getElementById('totalSlots').textContent = totalSlots;
  document.getElementById('availableSlots').textContent = available;
  document.getElementById('occupiedSlots').textContent = occupied;
}

function toggleSlot(index) {
  if (slots[index]) {
    const car = slots[index];
    const parkedTime = Date.now() - car.entryTime;
    const hours = Math.ceil(parkedTime / (1000 * 60 * 60));
    const charge = hours * ratePerHour;

    showMessage(`Car ${car.carNumber} removed from slot ${index + 1}. Charge: ₹${charge} for ${hours} hour(s)`, 'success');
    slots[index] = null;
  } else {
    const carNumber = prompt('Enter car number:');
    if (carNumber && carNumber.trim()) {
      if (isCarAlreadyParked(carNumber.trim())) {
        showMessage(`Car ${carNumber.trim()} is already parked!`, 'error');
        return;
      }
      slots[index] = {
        carNumber: carNumber.trim().toUpperCase(),
        entryTime: Date.now()
      };
      showMessage(`Car ${carNumber.trim().toUpperCase()} parked in slot ${index + 1}`, 'success');
    }
  }
  updateUI();
}

function parkCar() {
  const carNumberInput = document.getElementById('carNumber');
  const carNumber = carNumberInput.value.trim().toUpperCase();

  if (!carNumber) {
    showMessage('Please enter a car number', 'error');
    return;
  }

  if (isCarAlreadyParked(carNumber)) {
    showMessage(`Car ${carNumber} is already parked!`, 'error');
    return;
  }

  const emptyIndex = slots.findIndex(slot => slot === null);
  if (emptyIndex === -1) {
    showMessage("No empty slots available!", 'error');
    return;
  }

  slots[emptyIndex] = {
    carNumber,
    entryTime: Date.now()
  };

  carNumberInput.value = '';
  showMessage(`Car ${carNumber} parked in slot ${emptyIndex + 1}`, 'success');
  updateUI();
}

function removeCarByNumber() {
  const carNumberInput = document.getElementById('carNumber');
  const carNumber = carNumberInput.value.trim().toUpperCase();

  if (!carNumber) {
    showMessage('Please enter a car number to remove', 'error');
    return;
  }

  const carIndex = slots.findIndex(slot => slot && slot.carNumber === carNumber);
  if (carIndex === -1) {
    showMessage(`Car ${carNumber} not found!`, 'error');
    return;
  }

  const parkedTime = Date.now() - slots[carIndex].entryTime;
  const hours = Math.ceil(parkedTime / (1000 * 60 * 60));
  const charge = hours * ratePerHour;

  slots[carIndex] = null;
  carNumberInput.value = '';
  showMessage(`Car ${carNumber} removed from slot ${carIndex + 1}. Charge: ₹${charge} for ${hours} hour(s)`, 'success');
  updateUI();
}

function findCar() {
  const carNumberInput = document.getElementById('carNumber');
  const carNumber = carNumberInput.value.trim().toUpperCase();

  if (!carNumber) {
    showMessage('Please enter a car number to find', 'error');
    return;
  }

  const carIndex = slots.findIndex(slot => slot && slot.carNumber === carNumber);
  if (carIndex === -1) {
    showMessage(`Car ${carNumber} not found in the parking lot`, 'error');
    return;
  }

  showMessage(`Car ${carNumber} is parked in slot ${carIndex + 1}`, 'info');

  const slotElements = document.querySelectorAll('.slot');
  const targetSlot = slotElements[carIndex];
  targetSlot.style.border = '4px solid #f39c12';
  targetSlot.style.boxShadow = '0 0 20px #f39c12';

  setTimeout(() => {
    targetSlot.style.border = '3px solid #fff';
    targetSlot.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
  }, 3000);
}

function isCarAlreadyParked(carNumber) {
  return slots.some(slot => slot && slot.carNumber === carNumber);
}

function showMessage(message, type = 'info') {
  const messageDiv = document.getElementById('message');
  messageDiv.textContent = message;
  messageDiv.className = `message ${type}`;

  setTimeout(() => {
    messageDiv.textContent = '';
    messageDiv.className = 'message';
  }, 4000);
}
