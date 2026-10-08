// =====================================================
// 1. GET ELEMENTS FROM THE PAGE
// =====================================================

const form = document.getElementById("registerForm");

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const dobInput = document.getElementById("dob");
const cityInput = document.getElementById("city");
// Note: every id on a page must be different.
// "about" is already used by the About Me section, so we use "aboutText".
const aboutInput = document.getElementById("aboutText");

const male = document.getElementById("male");
const female = document.getElementById("female");

// All skill checkboxes (they all have class="skill")
const skillBoxes = document.querySelectorAll(".skill");

const nameError = document.getElementById("nameError");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const genderError = document.getElementById("genderError");

const successMessage = document.getElementById("successMessage");
const savedUsersDiv = document.getElementById("savedUsers");
const apiUsersDiv = document.getElementById("apiUsers");


// =====================================================
// 2. SAVE AND LOAD USERS (localStorage)
// localStorage can only store text, so we use
// JSON.stringify (array -> text) and JSON.parse (text -> array)
// =====================================================

function getUsers() {
    const text = localStorage.getItem("users");

    // If nothing is saved yet, return an empty array
    if (text === null) {
        return [];
    }

    return JSON.parse(text);
}

function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}


// =====================================================
// 3. SHOW REGISTERED USERS ON THE PAGE
// =====================================================

function showUsers() {
    const users = getUsers();

    // No users? Show nothing.
    if (users.length === 0) {
        savedUsersDiv.innerHTML = "";
        return;
    }

    let html = "<h3>Registered Students (" + users.length + ")</h3>";

    // Make one card for each user
    for (let i = 0; i < users.length; i++) {
        const user = users[i];

        html += `
            <div class="user-card">
                <h4>${i + 1}. ${user.name}</h4>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>DOB:</strong> ${user.dob}</p>
                <p><strong>City:</strong> ${user.city}</p>
                <p><strong>Gender:</strong> ${user.gender}</p>
                <p><strong>Skills:</strong> ${user.skills.join(", ")}</p>
                <p><strong>About:</strong> ${user.about}</p>
                <button class="delete-btn" onclick="deleteUser(${i})">🗑 Delete</button>
            </div>
        `;
    }

    savedUsersDiv.innerHTML = html;
}


// =====================================================
// 4. DELETE A USER
// "index" is the position of the user in the array
// =====================================================

function deleteUser(index) {
    const users = getUsers();

    // Ask before deleting
    if (!confirm("Delete " + users[index].name + "?")) {
        return;
    }

    // Remove 1 user at this position
    users.splice(index, 1);

    saveUsers(users);
    showUsers();
}


// =====================================================
// 5. CLEAR ALL MESSAGES
// =====================================================

function clearMessages() {
    nameError.innerText = "";
    emailError.innerText = "";
    passwordError.innerText = "";
    genderError.innerText = "";
    successMessage.innerText = "";
}


// =====================================================
// 6. WHEN THE FORM IS SUBMITTED
// =====================================================

form.addEventListener("submit", function (event) {

    // Stop the page from reloading
    event.preventDefault();

    clearMessages();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    let isValid = true;


    // ----- Check name -----
    if (name === "") {
        nameError.innerText = "Name is required";
        isValid = false;
    }


    // ----- Check email -----
    if (email === "") {
        emailError.innerText = "Email is required";
        isValid = false;
    } else if (!email.includes("@")) {
        emailError.innerText = "Enter a valid email";
        isValid = false;
    }


    // ----- Check password -----
    if (password.length < 8) {
        passwordError.innerText = "Password must be at least 8 characters";
        isValid = false;
    } else if (!/[A-Z]/.test(password)) {
        passwordError.innerText = "Password must contain 1 capital letter";
        isValid = false;
    } else if (!/[0-9]/.test(password)) {
        passwordError.innerText = "Password must contain 1 number";
        isValid = false;
    } else if (!/[!@#$%^&*]/.test(password)) {
        passwordError.innerText = "Password must contain 1 special character (!@#$%^&*)";
        isValid = false;
    }


    // ----- Check gender -----
    let gender = "";

    if (male.checked) {
        gender = "Male";
    } else if (female.checked) {
        gender = "Female";
    } else {
        genderError.innerText = "Please select gender";
        isValid = false;
    }


    // If anything is wrong, stop here
    if (!isValid) {
        console.log("Form is invalid");
        return;
    }


    // ----- Get selected skills -----
    const skills = [];

    for (let i = 0; i < skillBoxes.length; i++) {
        if (skillBoxes[i].checked) {
            skills.push(skillBoxes[i].value);
        }
    }


    // ----- Make the user object -----
    // (We do NOT save the password)
    const user = {
        name: name,
        email: email,
        dob: dobInput.value,
        city: cityInput.value,
        gender: gender,
        skills: skills,
        about: aboutInput.value
    };


    // ----- Hash the password with bcrypt -----
    // The real password is turned into a secret code like "$2b$10$..."
    const hashedPassword = bcrypt.hashSync(password, 10);

    console.log("User Data:", user);
    console.log("Password (bcrypt hash):", hashedPassword);


    // ----- Save the user and update the page -----
    const users = getUsers();
    users.push(user);
    saveUsers(users);

    form.reset();
    successMessage.innerText = "✅ Registration successful, " + name + "!";

    showUsers();
});


// When the Reset button is clicked, clear the messages too
form.addEventListener("reset", clearMessages);


// =====================================================
// 7. LOAD USERS FROM THE API
// =====================================================

async function loadApiUsers() {
    try {
        // Ask the API for users and wait for the answer
        const response = await fetch("https://jsonplaceholder.typicode.com/users");

        // Turn the answer (JSON text) into a JavaScript array
        const users = await response.json();

        console.log("API Users:", users);

        let html = "";

        for (let i = 0; i < users.length; i++) {
            const user = users[i];

            html += `
                <div class="card">
                    <div class="avatar">${user.name[0]}</div>
                    <h4>${user.name}</h4>
                    <p>@${user.username}</p>
                    <p>📧 ${user.email}</p>
                    <p>📍 ${user.address.city}</p>
                    <p>🏢 ${user.company.name}</p>
                </div>
            `;
        }

        apiUsersDiv.innerHTML = html;

    } catch (error) {
        // Runs if there is no internet or the API is down
        console.error("API Error:", error);
        apiUsersDiv.innerHTML = '<p class="error">Could not load users. Check your internet.</p>';
    }
}


// =====================================================
// 8. RUN WHEN THE PAGE OPENS
// =====================================================

showUsers();
loadApiUsers();
