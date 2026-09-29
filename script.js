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

// Today's live study time

let todayStudySeconds = 0;
let progressInterval = null;

// ==============================
// UPDATE TODAY'S PROGRESS
// ==============================

function updateTodayProgress() {

    const progressElement =
        document.getElementById("todayProgress");

    if (!progressElement) return;

    const hours =
        Math.floor(todayStudySeconds / 3600);

    const minutes =
        Math.floor((todayStudySeconds % 3600) / 60);

    if (hours > 0) {

        progressElement.textContent =
            `${hours}h ${minutes}m`;

    } else {

        progressElement.textContent =
            `${minutes}m`;
    }
}


// ==============================
// UPDATE TIMER DISPLAY
// ==============================

function updateTimerDisplay() {

    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;

    document.getElementById("timerDisplay").textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}


// ==============================
// START / PAUSE TIMER
// ==============================

function toggleTimer() {

    const button = document.getElementById("timerStart");

    if (timerRunning) {

        clearInterval(timerInterval);

        timerRunning = false;

        button.textContent = "Resume Focus";

        return;
    }

    timerRunning = true;

    button.textContent = "Pause";

    timerInterval = setInterval(() => {

        todayStudySeconds++;
        updateTodayProgress();

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

    document.getElementById("timerStart").textContent = "Start Focus";

    updateTimerDisplay();
}


// ==============================
// EDIT TIMER
// ==============================

function editTimer() {

    if (timerRunning) {
        alert("Please pause the timer before changing the time.");
        return;
    }

    selectedMinutes = Math.floor(timerSeconds / 60);

    document.getElementById("editMinutes").textContent =
        selectedMinutes;

    document
        .getElementById("timerEditModal")
        .classList.add("show");
}

// ==============================
// EDIT TIMER MODAL
// ==============================

let selectedMinutes = 25;

const timerModal =
    document.getElementById("timerEditModal");

const editMinutes =
    document.getElementById("editMinutes");

const decreaseTime =
    document.getElementById("decreaseTime");

const increaseTime =
    document.getElementById("increaseTime");

const saveTimerEdit =
    document.getElementById("saveTimerEdit");

const cancelTimerEdit =
    document.getElementById("cancelTimerEdit");

const timerModalClose =
    document.getElementById("timerModalClose");


// ==============================
// OPEN EDIT MODAL
// ==============================

document
    .getElementById("timerEdit")
    .addEventListener("click", editTimer);


// ==============================
// DECREASE TIME
// ==============================

decreaseTime.addEventListener("click", () => {

    selectedMinutes =
        Math.max(1, selectedMinutes - 5);

    editMinutes.textContent =
        selectedMinutes;
});


// ==============================
// INCREASE TIME
// ==============================

increaseTime.addEventListener("click", () => {

    selectedMinutes =
        Math.min(180, selectedMinutes + 5);

    editMinutes.textContent =
        selectedMinutes;
});


// ==============================
// SAVE TIME
// ==============================

saveTimerEdit.addEventListener("click", () => {

    timerSeconds =
        selectedMinutes * 60;

    updateTimerDisplay();

    timerModal.classList.remove("show");
});


// ==============================
// CANCEL
// ==============================

cancelTimerEdit.addEventListener("click", () => {

    timerModal.classList.remove("show");
});


// ==============================
// CLOSE BUTTON
// ==============================

timerModalClose.addEventListener("click", () => {

    timerModal.classList.remove("show");
});


// ==============================
// CLICK OUTSIDE MODAL
// ==============================

timerModal.addEventListener("click", (event) => {

    if (event.target === timerModal) {

        timerModal.classList.remove("show");
    }
});


// ==============================
// TIMER BUTTON EVENTS
// ==============================

document
    .getElementById("timerStart")
    .addEventListener("click", toggleTimer);

document
    .getElementById("timerReset")
    .addEventListener("click", resetTimer);

const timerEditButton = document.getElementById("timerEdit");

if (timerEditButton) {
    timerEditButton.addEventListener("click", editTimer);
}

// ==============================
// INITIAL DISPLAY
// ==============================

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

    // Rooms created by me
    const { data: createdRooms, error: createdError } =
        await supabaseClient
            .from("rooms")
            .select("*")
            .eq("created_by", user.id);

    console.log("Created rooms:", createdRooms);
    if (createdError) {
        console.error("Load created rooms error:", createdError);
        return;
    }

    // Rooms I joined
    const { data: memberships, error: memberError } =
        await supabaseClient
            .from("room_members")
            .select("room_id")
            .eq("user_id", user.id);

    if (memberError) {
        console.error("Load memberships error:", memberError);
        return;
    }

    const joinedRoomIds =
        memberships.map(member => member.room_id);

    let joinedRooms = [];

    if (joinedRoomIds.length > 0) {

        const { data, error } =
            await supabaseClient
                .from("rooms")
                .select("*")
                .in("id", joinedRoomIds);

        if (error) {
            console.error("Load joined rooms error:", error);
            return;
        }

        joinedRooms = data || [];
    }

    // Combine created + joined rooms
    const allRooms = [
        ...(createdRooms || []),
        ...joinedRooms
    ];

    // Remove duplicate rooms
    const uniqueRooms = [
        ...new Map(
            allRooms.map(room => [room.id, room])
        ).values()
    ];

    const roomsList =
        document.getElementById("roomsList");

    if (!roomsList) {
        return;
    }

    if (uniqueRooms.length === 0) {
        roomsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🚪</div>

                <h3>No rooms yet</h3>

                <p>
                    Create or join a room to study with friends.
                </p>

                <button
                    class="outline-btn"
                    onclick="joinRoom()"
                >
                    Join a Room
                </button>
            </div>
        `;

        return;
    }

    roomsList.innerHTML = "";

    uniqueRooms.forEach(room => {

        const roomCard =
            document.createElement("div");

        roomCard.className = "room-item";

        roomCard.innerHTML =` 
            <div class="room-item-icon">
                📚
            </div>

            <div class="room-item-info">

                <h3>
                    ${room.name}
                </h3>

                <p>
                    Code:
                    <strong>${room.room_code}</strong>
                </p>

            </div>
        `;

        roomsList.appendChild(roomCard);
    });
}

// ==============================
// JOIN ROOM
// ==============================

async function joinRoom() {

    const roomCodeInput =
        prompt("Enter room code:");

    if (!roomCodeInput) {
        return;
    }

    const roomCode =
        roomCodeInput.trim().toUpperCase();

    if (!roomCode) {
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


    // Find room

    const { data: room, error: roomError } =
        await supabaseClient
            .from("rooms")
            .select("*")
            .eq("room_code", roomCode)
            .maybeSingle();


    if (roomError) {

        console.error("Find room error:", roomError);

        alert("Could not find the room.");

        return;
    }


    if (!room) {

        alert("Room not found. Please check the code.");

        return;
    }


    // Add user to room

   const { data: existingMember, error: memberCheckError } =
    await supabaseClient
        .from("room_members")
        .select("id")
        .eq("room_id", room.id)
        .eq("user_id", user.id)
        .maybeSingle();


if (memberCheckError) {

    console.error(
        "Membership check error:",
        memberCheckError
    );

    alert("Could not check room membership.");

    return;
}


if (existingMember) {

    alert("You are already a member of this room.");

    return;
}


const { error: joinError } =
    await supabaseClient
        .from("room_members")
        .insert({

            room_id: room.id,

            user_id: user.id

        });


    if (joinError) {

        console.error("Join room error:", joinError);

        alert("Could not join the room.");

        return;
    }


    alert(
        `Successfully joined ${room.name}!`
    );


    console.log("Joined room:", room);

}

alert("JavaScript loaded");
