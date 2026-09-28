// ==============================
// SUPABASE CONNECTION
// ==============================

const SUPABASE_URL =
    "https://kczoxlotxamqommhgnrv.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_FEDDWMPP-wjRyOzEQbcOSQ_49dANp9m";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ==============================
// OPEN LOGIN
// ==============================

function openLogin() {

    document
        .getElementById("authOverlay")
        .classList.add("active");

    showLogin();
}


// ==============================
// CLOSE LOGIN
// ==============================

function closeLogin() {

    document
        .getElementById("authOverlay")
        .classList.remove("active");

    clearMessages();
}


// ==============================
// SHOW LOGIN
// ==============================

function showLogin() {

    document
        .getElementById("loginForm")
        .classList.remove("hidden");

    document
        .getElementById("signupForm")
        .classList.add("hidden");

    clearMessages();
}


// ==============================
// SHOW SIGNUP
// ==============================

function showSignup() {

    document
        .getElementById("loginForm")
        .classList.add("hidden");

    document
        .getElementById("signupForm")
        .classList.remove("hidden");

    clearMessages();
}


// ==============================
// PASSWORD SHOW / HIDE
// ==============================

function togglePassword(inputId, button) {

    const input =
        document.getElementById(inputId);

    if (input.type === "password") {

        input.type = "text";
        button.textContent = "🙈";

    } else {

        input.type = "password";
        button.textContent = "👁";
    }
}


// ==============================
// LOGIN
// ==============================

async function loginUser() {

    const email =
        document
            .getElementById("loginEmail")
            .value
            .trim();

    const password =
        document
            .getElementById("loginPassword")
            .value;

    const message =
        document.getElementById("authMessage");


    if (!email || !password) {

        message.textContent =
            "Please enter email and password.";

        return;
    }


    message.textContent =
        "Logging in...";


    const { data, error } =
        await supabaseClient.auth.signInWithPassword({

            email: email,

            password: password
        });


    if (error) {

        message.textContent =
            error.message;

        return;
    }


    message.textContent =
        "Login successful!";


    console.log(
        "Logged in user:",
        data.user
    );


    setTimeout(() => {

        closeLogin();

        document
            .getElementById("landingPage")
            .classList.add("hidden");

        document
            .getElementById("dashboardPage")
            .classList.remove("hidden");
        loadMyRooms();

    }, 700);
}


// ==============================
// SIGNUP
// ==============================

async function signupUser() {

    const username =
        document
            .getElementById("signupUsername")
            .value
            .trim();

    const email =
        document
            .getElementById("signupEmail")
            .value
            .trim();

    const password =
        document
            .getElementById("signupPassword")
            .value;

    const message =
        document.getElementById("signupMessage");


    if (!username || !email || !password) {

        message.textContent =
            "Please fill all fields.";

        return;
    }


    if (password.length < 6) {

        message.textContent =
            "Password must be at least 6 characters.";

        return;
    }


    message.textContent =
        "Creating account...";


    const { data, error } =
        await supabaseClient.auth.signUp({

            email: email,

            password: password,

            options: {data: {
                    username: username
                }
            }
        });


    if (error) {

        message.textContent =
            error.message;

        return;
    }


    console.log(
        "Signup user:",
        data.user
    );


    message.textContent =
        "Account created successfully!";


    setTimeout(() => {

        showLogin();

    }, 1200);
}


// ==============================
// CLEAR MESSAGES
// ==============================

function clearMessages() {

    const loginMessage =
        document.getElementById("authMessage");

    const signupMessage =
        document.getElementById("signupMessage");


    if (loginMessage) {

        loginMessage.textContent = "";
    }


    if (signupMessage) {

        signupMessage.textContent = "";
    }
}


// ==============================
// LOGOUT
// ==============================

async function logoutUser() {

    await supabaseClient.auth.signOut();


    document
        .getElementById("dashboardPage")
        .classList.add("hidden");


    document
        .getElementById("landingPage")
        .classList.remove("hidden");
}


// ==============================
// FOCUS TIMER
// ==============================

let timerSeconds = 25 * 60;
let timerInterval = null;
let timerRunning = false;


// ==============================
// UPDATE TIMER DISPLAY
// ==============================

function updateTimerDisplay() {

    const minutes =
        Math.floor(timerSeconds / 60);

    const seconds =
        timerSeconds % 60;

    document.getElementById("timerDisplay")
        .textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}


// ==============================
// START / PAUSE TIMER
// ==============================

function toggleTimer() {

    const button =
        document.getElementById("timerStart");


    if (timerRunning) {

        clearInterval(timerInterval);

        timerRunning = false;

        button.textContent = "Resume Focus";

        return;
    }


    timerRunning = true;

    button.textContent = "Pause";


    timerInterval = setInterval(() => {

        if (timerSeconds <= 0) {

            clearInterval(timerInterval);

            timerRunning = false;

            button.textContent = "Start Focus";

            alert("Focus session completed! 🎉");

            timerSeconds = 25 * 60;

            updateTimerDisplay();

            return;
        }


        timerSeconds--;

        updateTimerDisplay();

    }, 1000);
}


// ==============================
// RESET TIMER
// ==============================

function resetTimer() {

    clearInterval(timerInterval);

    timerRunning = false;

    timerSeconds = 25 * 60;

    document.getElementById("timerStart")
        .textContent = "Start Focus";

    updateTimerDisplay();
}


// ==============================
// TIMER BUTTON EVENTS
// ==============================

document
    .getElementById("timerStart")
    .addEventListener("click", toggleTimer);


document
    .getElementById("timerReset")
    .addEventListener("click", resetTimer);


// Initial display

updateTimerDisplay();


// ==============================
// CREATE ROOM
// ==============================

async function createRoom() {

    const roomName = prompt("Enter your room name:");

    if (!roomName) {
        return;
    }

    const name = roomName.trim();

    if (!name) {
        return;
    }


    // Get logged-in user

    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();


    if (userError || !user) {

        alert("Please login first.");

        return;
    }


    // Generate 6-character room code

    const roomCode =
        Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase();


    // Save room in Supabase

    const { data, error } =
        await supabaseClient
            .from("rooms")
            .insert({

                name: name,

                room_code: roomCode,

                created_by: user.id

            })
            .select()
            .single();


    if (error) {

        console.error("Create room error:", error);

        alert("Could not create room.");

        return;
    }


    alert(
        `Room created successfully!\n\nRoom: ${data.name}\nCode: ${data.room_code}`
    );


    console.log("Created room:", data);
}

// ==============================
// LOAD MY ROOMS
// ==============================

async function loadMyRooms() {

    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
        return;
    }

    const { data: rooms, error } =
        await supabaseClient
            .from("rooms")
            .select("*")
            .eq("created_by", user.id)
            .order("created_at", {
                ascending: false
            });

    if (error) {

        console.error("Load rooms error:", error);

        return;
    }

    const roomsList =
        document.getElementById("roomsList");

    if (!roomsList) {
        return;
    }

    if (!rooms || rooms.length === 0) {

        return;
    }

    roomsList.innerHTML = "";

    rooms.forEach(room => {

        const roomCard =
            document.createElement("div");

        roomCard.className = "room-item";

        roomCard.innerHTML = `
            <div class="room-item-icon">
                📚
            </div>

            <div class="room-item-info">

                <h3>
                    ${room.name}
                </h3>

                <p>
                    Code: <strong>${room.room_code}</strong>
                </p>

            </div>
        `;

        roomsList.appendChild(roomCard);

    });
}

alert("JavaScript loaded");
