const apiUrl = 'https://mockapi.io/projects/662075d03bf790e070afcd20#';

// Function to fetch and display user data
function fetchUserData() {
  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      // Update UI elements with user data
      document.getElementById('avatar').src = data.avatar;
      document.getElementById('name').textContent = `${data.name.first} ${data.name.last}`;
      document.getElementById('email').textContent = data.email;
      document.getElementById('id').textContent = data.id;
      document.getElementById('username').textContent = data.username;
      document.getElementById('street').textContent = data.address.street;
      document.getElementById('suite').textContent = data.address.suite;
      document.getElementById('city').textContent = data.address.city;
      document.getElementById('zipcode').textContent = data.address.zipcode;
    })
    .catch(error => console.error('Error fetching user data:', error));
}

// I'd never seen a command articulated like this before and wanted to see how it expressed differently than other versions?
window.onload = fetchUserData;