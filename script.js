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

let currentUser = null;


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

currentUser = data.user;
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

        loadSavedAvatar();
        loadDashboardUsername();
        loadMyRooms();
        loadStudySessions();

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

let currentRoomId = null;

// Today's live study time

let todayStudySeconds = 0;
let progressInterval = null;
let currentSessionSeconds = 0;

// Weekly study time
let weeklyStudySeconds = {
    Mon: 0,
    Tue: 0,
    Wed: 0,
    Thu: 0,
    Fri: 0,
    Sat: 0,
    Sun: 0
};

// ==============================
// UPDATE WEEKLY CHART
// ==============================

function updateWeeklyChart() {

    const chartBars =
        document.querySelectorAll(".chart-bar");

    const days = [
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
        "Sun"
    ];

    let maxSeconds = 1;

    days.forEach(day => {

        if (weeklyStudySeconds[day] > maxSeconds) {
            maxSeconds = weeklyStudySeconds[day];
        }

    });

    chartBars.forEach((bar, index) => {

        const day = days[index];

        const seconds =
            weeklyStudySeconds[day];

        const percentage =
            (seconds / maxSeconds) * 100;

        const barFill =
            bar.querySelector("div");

        if (barFill) {

            barFill.style.height =
                `${Math.max(percentage, 10)}%`;
        }

    });
}

// ==============================
// TODAY'S DAY
// ==============================

const dayNames = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat"
];

const todayName =
    dayNames[new Date().getDay()];

// ==============================
// UPDATE TODAY'S PROGRESS
// ==============================

function updateTodayProgress() {

    const progressElement =
        document.getElementById("todayProgress");

    const focusElement =
        document.getElementById("todayFocus");

    const hours =
        Math.floor(todayStudySeconds / 3600);

    const minutes =
        Math.floor((todayStudySeconds % 3600) / 60);

    const seconds =
        todayStudySeconds % 60;


    // PROGRESS CARD

    if (progressElement) {

        if (hours > 0) {

            progressElement.textContent =
                `${hours}h ${minutes}m`;

        } else {

            progressElement.textContent =
                `${minutes}m`;
        }
    }


    // TODAY'S FOCUS

    if (focusElement) {

        if (hours > 0) {

            focusElement.textContent =
                `${hours}h ${minutes}m`;

        } else {

            focusElement.textContent =
                `${minutes}m`;
        }
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

        saveStudySession(currentSessionSeconds);
        currentSessionSeconds = 0;

        button.textContent = "Resume Focus";

        return;
    }

    timerRunning = true;

    button.textContent = "Pause";

    timerInterval = setInterval(() => {

        todayStudySeconds++;
        currentSessionSeconds++;
        weeklyStudySeconds[todayName]++;

        updateWeeklyChart();
        
        updateTodayProgress();

        if (timerSeconds <= 0) {

            clearInterval(timerInterval);

            timerRunning = false;

            button.textContent = "Start Focus";

            alert("Focus session completed! 🎉");

            saveStudySession(currentSessionSeconds);
            currentSessionSeconds = 0;

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

    if (currentSessionSeconds > 0) {
    saveStudySession(currentSessionSeconds);
    currentSessionSeconds = 0;
}

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
// UPDATE STREAK
// ==============================

async function updateStreak() {

    if (!currentUser) return;

    const today =
        new Date().toISOString().split("T")[0];

    // Get existing streak
    const { data: streak, error: streakError } =
        await supabaseClient
            .from("streaks")
            .select("*")
            .eq("user_id", currentUser.id)
            .maybeSingle();

    if (streakError) {
        console.error("Failed to load streak:", streakError);
        return;
    }

    // First study ever
    if (!streak) {

        const { error } = await supabaseClient
            .from("streaks")
            .insert({
                user_id: currentUser.id,
                current_streak: 1,
                best_streak: 1,
                last_study_date: today
            });

        if (error) {
            console.error("Failed to create streak:", error);
        }

        return;
    }

    // Already studied today
    if (streak.last_study_date === today) {
        return;
    }

    const todayDate =
        new Date(today + "T00:00:00");

    const lastDate =
        new Date(streak.last_study_date + "T00:00:00");

    const difference =
        Math.floor(
            (todayDate - lastDate) /
            (1000 * 60 * 60 * 24)
        );

    let newCurrentStreak;

    // Studied yesterday
    if (difference === 1) {

        newCurrentStreak =
            streak.current_streak + 1;

    } else {

        // Missed one or more days
        newCurrentStreak = 1;
    }

    const newBestStreak =
        Math.max(
            streak.best_streak,
            newCurrentStreak
        );

    const { error } =
        await supabaseClient
            .from("streaks")
            .update({
                current_streak: newCurrentStreak,
                best_streak: newBestStreak,
                last_study_date: today,
                updated_at: new Date().toISOString()
            })
            .eq("user_id", currentUser.id);

    if (error) {
        console.error(
            "Failed to update streak:",
            error
        );

        return;
    }

    console.log(
        "🔥 Streak updated:",
        newCurrentStreak
    );
}

// ==============================
// SAVE STUDY SESSION
// ==============================

async function saveStudySession(seconds) {

    if (seconds <= 0) return;

    if (!currentUser) {
        console.error("No logged-in user found");
        return;
    }

    const { error } = await supabaseClient
        .from("study_sessions")
        .insert({
    user_id: currentUser.id,
    study_date: new Date().toISOString().split("T")[0],
    duration_seconds: seconds,
    room_id: currentRoomId
});

    if (error) {
        console.error(
            "Failed to save study session:",
            error
        );

        return;
    }

    console.log(
        "Study session saved:",
        seconds,
        "seconds"
    );
    await updateStreak();
}


// ==============================
// LOAD STUDY SESSIONS
// ==============================

async function loadStudySessions() {

    if (!currentUser) return;

    const { data, error } = await supabaseClient
        .from("study_sessions")
        .select("study_date, duration_seconds")
        .eq("user_id", currentUser.id);

    if (error) {
        console.error("Failed to load study sessions:", error);
        return;
    }

    // Reset values before loading
    todayStudySeconds = 0;

    weeklyStudySeconds = {
        Mon: 0,
        Tue: 0,
        Wed: 0,
        Thu: 0,
        Fri: 0,
        Sat: 0,
        Sun: 0
    };

    const today = new Date();

    const todayDate =
        today.toISOString().split("T")[0];

    data.forEach(session => {

        const seconds =
            session.duration_seconds || 0;

        // Today's total
        if (session.study_date === todayDate) {
            todayStudySeconds += seconds;
        }

        // Weekly total
        const sessionDate =
            new Date(session.study_date + "T00:00:00");

        const dayName =
            dayNames[sessionDate.getDay()];

        weeklyStudySeconds[dayName] += seconds;
    });

    updateTodayProgress();
    updateWeeklyChart();

    console.log(
        "Study sessions loaded:",
        data
    );
}


// ==============================
// RESTORE LOGIN SESSION
// ==============================

async function restoreSession() {

    const {
        data: { session },
        error
    } = await supabaseClient.auth.getSession();

    if (error) {
        console.error("Failed to restore session:", error);
        return;
    }

    if (session && session.user) {

        currentUser = session.user;

        console.log(
            "Session restored:",
            currentUser
        );

        loadStudySessions();
        await loadStreak();
        
        await loadStreak();
        setTimeout(() => {
            loadStreak();
        }, 500);
    }
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
    openRoom(data.id);
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

restoreSession();

// ==============================
// STREAK RULES POPUP
// ==============================

function toggleStreakRules() {

    const rules =
        document.getElementById("streakRules");

    if (!rules) return;

    rules.classList.toggle("show");
}

// ==============================
// LOAD STREAK
// ==============================

async function loadStreak() {

    if (!currentUser) return;

    const { data, error } =
        await supabaseClient
            .from("streaks")
            .select("current_streak, best_streak")
            .eq("user_id", currentUser.id)
            .maybeSingle();

    if (error) {
        console.error(
            "Failed to load streak:",
            error
        );
        return;
    }

    const currentStreak =
        data?.current_streak || 0;

    const bestStreak =
        data?.best_streak || 0;


    // Current streak card

    const currentStreakElement =
        document.getElementById("currentStreak");

    if (currentStreakElement) {

        currentStreakElement.textContent =
            `${currentStreak} days`;
    }


    // Profile popup streak

const profileStreak =
    document.getElementById("profileMenuStreak");

if (profileStreak) {

    profileStreak.textContent =
        `${currentStreak} ${currentStreak === 1 ? "day" : "days"}`;
 }

    console.log(
        "🔥 Streak loaded:",
        currentStreak,
        "| Best:",
        bestStreak
    );
}

// =========================
// FRIENDS MODAL
// =========================

function openFriends() {
    const modal = document.getElementById("friendsModal");

    if (modal) {
        modal.style.display = "flex";

        loadFriendRequests();
        loadMyFriends();
    }
}


function closeFriends() {

    const modal = document.getElementById("friendsModal");

    if (modal) {
        modal.style.display = "none";
    }

}


// =========================
// SEARCH FRIEND
// =========================

async function searchFriend() {

    const input = document.getElementById("friendSearchInput");
    const result = document.getElementById("friendSearchResult");

    const username = input.value.trim();

    if (!username) {
        result.innerHTML = `
            <p class="friends-empty">
                Please enter a username.
            </p>
        `;
        return;
    }

    result.innerHTML = `
        <p class="friends-empty">
            Searching...
        </p>
   ` ;

    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
        result.innerHTML = `
            <p class="friends-empty">
                Please login first.
            </p>
        `;
        return;
    }

    const { data, error } = await supabaseClient
        .from("profiles")
        .select("id, username")
        .ilike("username", `%${username}%`)
        .neq("id", user.id);

    if (error) {
        console.error("Search error:", error);

        result.innerHTML =` 
            <p class="friends-empty">
                Unable to search users.
            </p>
        `;

        return;
    }

    if (!data || data.length === 0) {
        result.innerHTML = `
            <p class="friends-empty">
                No user found.
            </p>
        `;

        return;
    }

    result.innerHTML = data.map(profile =>` 
        <div class="friend-result">

            <div>
                <strong>${profile.username}</strong>
            </div>

            <button
                class="small-btn"
                onclick="sendFriendRequest('${profile.id}')"
            >
                Add Friend
            </button>

        </div>
    `).join("");
}


// =========================
// SEND FRIEND REQUEST
// =========================

async function sendFriendRequest(friendId) {

    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
        alert("Please login first.");
        return;
    }

    const { data: existingRequest, error: checkError } =
        await supabaseClient
            .from("friendships")
            .select("id, status")
            .or(
                `and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`
            )
            .maybeSingle();

    if (checkError) {
        console.error("Friend check error:", checkError);
        alert("Something went wrong.");
        return;
    }

    if (existingRequest) {

        if (existingRequest.status === "accepted") {
           showToast(
               "Already Friends 👥",
               "You are already friends."
           );
        } else {
            showToast(
                "Already Exists 📩",
                "Friend request already exists."
            );
        }

        return;
    }

    const { error } = await supabaseClient
        .from("friendships")
        .insert({
            user_id: user.id,
            friend_id: friendId,
            status: "pending"
        });

    if (error) {
        console.error("Friend request error:", error);
        alert("Unable to send friend request.");
        return;
    }

    showToast(
    "Request Sent 🎉",
    "Friend request sent successfully."
);

}

// =========================
// CUSTOM TOAST
// =========================

let toastTimer;

function showToast(title, message) {

    const toast = document.getElementById("toastNotification");
    const toastTitle = document.getElementById("toastTitle");
    const toastMessage = document.getElementById("toastMessage");

    toastTitle.textContent = title;
    toastMessage.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        hideToast();
    }, 3000);
}


function hideToast() {

    const toast = document.getElementById("toastNotification");

    toast.classList.remove("show");
}


// =========================
// LOAD FRIEND REQUESTS
// =========================

async function loadFriendRequests() {

    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !user) return;


    // Get pending requests
    const { data: requests, error: requestError } =
        await supabaseClient
            .from("friendships")
            .select("id, user_id, status")
            .eq("friend_id", user.id)
            .eq("status", "pending");


    if (requestError) {

        console.error(
            "Friend requests error:",
            requestError
        );

        return;
    }


    const list =
        document.getElementById("friendRequestsList");


    if (!requests || requests.length === 0) {

        list.innerHTML = `
            <p class="friends-empty">
                No friend requests
            </p>
        `;

        return;
    }


    // Get usernames
    const userIds =
        requests.map(request => request.user_id);


    const { data: profiles, error: profileError } =
        await supabaseClient
            .from("profiles")
            .select("id, username")
            .in("id", userIds);


    if (profileError) {

        console.error(
            "Profile error:",
            profileError
        );

        return;
    }


    list.innerHTML = requests.map(request => {

        const profile =
            profiles.find(
                p => p.id === request.user_id
            );

        return `
        
    <div class="friend-result">

        <div>

            <div class="friend-avatar">
                ${(profile ? profile.username : "User").charAt(0).toUpperCase()}
            </div>

            <div>
                <strong>
                    ${profile ? profile.username : "User"}
                </strong>

                <small>
                    Wants to be your friend
                </small>
            </div>

        </div>

        <div>

            <button
                class="small-btn"
                onclick="acceptFriendRequest('${request.id}')"
            >
                Accept
            </button>

            <button
                class="small-btn"
                onclick="declineFriendRequest('${request.id}')"
            >
                Decline
            </button>

        </div>

    </div>
`;
        
    }).join("");
}

// =========================
// ACCEPT FRIEND REQUEST
// =========================

async function acceptFriendRequest(requestId) {

    const { error } = await supabaseClient
        .from("friendships")
        .update({
            status: "accepted"
        })
        .eq("id", requestId);

    if (error) {
        console.error("Accept request error:", error);

        showToast(
            "Something went wrong",
            "Could not accept friend request."
        );

        return;
    }

    showToast(
        "Friend Added 🎉",
        "You are now friends."
    );

    loadFriendRequests();
}


// =========================
// DECLINE FRIEND REQUEST
// =========================

async function declineFriendRequest(requestId) {

    const { error } = await supabaseClient
        .from("friendships")
        .delete()
        .eq("id", requestId);

    if (error) {
        console.error("Decline request error:", error);

        showToast(
            "Something went wrong",
            "Could not decline friend request."
        );

        return;
    }

    showToast(
        "Request Declined",
        "Friend request has been declined."
    );

    loadFriendRequests();
}

// =========================
// LOAD MY FRIENDS
// =========================

async function loadMyFriends() {

    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !user) return;


    const { data: friendships, error } =
        await supabaseClient
            .from("friendships")
            .select("id, user_id, friend_id")
            .or(
                `user_id.eq.${user.id},friend_id.eq.${user.id}`
            )
            .eq("status", "accepted");


    if (error) {
        console.error("My friends error:", error);
        return;
    }


    const list =
        document.getElementById("friendsList");

    const friendsCount =
        document.getElementById("friendsCount");


    if (!friendships || friendships.length === 0) {

        list.innerHTML = `
            <p class="friends-empty">
                You don't have any friends yet.
            </p>
        `;

        friendsCount.textContent = "0";

        return;
    }


    const friendIds = friendships.map(friendship => {

        if (friendship.user_id === user.id) {
            return friendship.friend_id;
        }

        return friendship.user_id;

    });


    const { data: profiles, error: profileError } =
        await supabaseClient
            .from("profiles")
            .select("id, username")
            .in("id", friendIds);


    if (profileError) {
        console.error(
            "Friends profile error:",
            profileError
        );
        return;
    }


    friendsCount.textContent = profiles.length;


    list.innerHTML = profiles.map(profile => `
        <div class="my-friend-card">

            <div class="my-friend-left">

                <div class="friend-avatar">
                    ${profile.username.charAt(0).toUpperCase()}
                </div>

                <div class="my-friend-info">
                    <strong>${profile.username}</strong>
                    <small>Focus Room friend</small>
                </div>

            </div>

           <div class="friend-actions">

    <span class="friend-status">
        ● Friends
    </span>

    <button
        class="remove-friend-btn"
        onclick="removeFriend('${profile.id}')"
    >
        Remove
    </button>

</div>

        </div>
    `).join("");
}


// =========================
// REMOVE FRIEND
// =========================

async function removeFriend(friendId) {


    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
        return;
    }

    const { error } = await supabaseClient
        .from("friendships")
        .delete()
        .or(
            `and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`
        );

    if (error) {

        console.error(
            "Remove friend error:",
            error
        );

        showToast(
            "Something went wrong",
            "Could not remove friend."
        );

        return;
    }

    showToast(
        "Friend Removed",
        "Friend has been removed."
    );

    loadMyFriends();
}

// =========================
// REMOVE FRIEND
// =========================

let friendToRemove = null;

function removeFriend(friendId) {

    friendToRemove = friendId;

    const modal =
        document.getElementById("removeFriendModal");

    if (modal) {
        modal.style.display = "flex";
    }
}


function closeRemoveFriendModal() {

    const modal =
        document.getElementById("removeFriendModal");

    if (modal) {
        modal.style.display = "none";
    }

    friendToRemove = null;
}


async function confirmRemoveFriend() {

    if (!friendToRemove) {
        return;
    }

    const friendId = friendToRemove;

    const { error } = await supabaseClient
        .from("friendships")
        .delete()
        .or(
            `and(user_id.eq.${(await supabaseClient.auth.getUser()).data.user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${(await supabaseClient.auth.getUser()).data.user.id})`
        );

    if (error) {

        console.error(
            "Remove friend error:",
            error
        );

        closeRemoveFriendModal();

        showToast(
            "Something went wrong",
            "Could not remove friend."
        );

        return;
    }

    closeRemoveFriendModal();

    showToast(
        "Friend Removed",
        "Friend has been removed."
    );

    loadMyFriends();
}


// =========================
 // AVATAR PICKER
 // =========================

 let selectedAvatar = null;


 function openAvatarPicker() {

     const modal =
         document.getElementById("avatarModal");

     if (modal) {
         modal.style.display = "flex";
     }
 }


 function closeAvatarPicker() {

     const modal =
         document.getElementById("avatarModal");

     if (modal) {
         modal.style.display = "none";
     }
 }


 async function selectAvatar(avatar) {

     console.log("Selected avatar:", avatar);

     selectedAvatar = avatar;

     const profileAvatar =
         document.getElementById("profileAvatar");

     if (profileAvatar) {
         profileAvatar.textContent = avatar;
     }

     const profileMenuAvatar =
    document.getElementById("profileMenuAvatar");

if (profileMenuAvatar) {
    profileMenuAvatar.textContent = avatar;
}


     const {
         data: { user },
         error: userError
     } = await supabaseClient.auth.getUser();


     if (userError || !user) {

         showToast(
             "Login Required",
             "Please login first."
         );

         return;
     }


     const { error } =
         await supabaseClient
             .from("profiles")
             .update({
                 avatar: avatar
             })
             .eq("id", user.id);


     if (error) {

         console.error(
             "Avatar save error:",
             error
         );

         showToast(
             "Something went wrong",
             "Could not save avatar."
         );

         return;
     }


     localStorage.setItem(
         "focusRoomAvatar",
         avatar
     );


     closeAvatarPicker();


     showToast(
         "Avatar Updated 🎉",
         "Your avatar has been saved."
     );
 }


 // =========================
 // LOAD SAVED AVATAR
 // =========================

 async function loadSavedAvatar() {

     const {
         data: { user },
         error: userError
     } = await supabaseClient.auth.getUser();


     if (userError || !user) {
         return;
     }


     const { data: profile, error } =
         await supabaseClient
             .from("profiles")
             .select("avatar")
             .eq("id", user.id)
             .single();


     if (error) {

         console.error(
             "Load avatar error:",
             error
         );

         return;
     }


     const profileAvatar =
         document.getElementById("profileAvatar");


     if (profileAvatar && profile?.avatar) {

         profileAvatar.textContent =
             profile.avatar;

     }
 }

// -----------------------------------//
//------------------------------------//
// Load Dashboard Username //

async function loadDashboardUsername() {

    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
        return;
    }

    const { data: profile, error } =
        await supabaseClient
            .from("profiles")
            .select("username")
            .eq("id", user.id)
            .single();

    if (error) {
        console.error(
            "Username load error:",
            error
        );
        return;
    }

    const usernameElement =
        document.getElementById("dashboardUsername");

    if (profile?.username) {

    if (usernameElement) {
        usernameElement.textContent =
            profile.username;
    }

    const profileMenuUsername =
        document.getElementById("profileMenuUsername");

    if (profileMenuUsername) {
        profileMenuUsername.textContent =
            profile.username;
    }
}
}
    async function changeUsername() {

    const newUsername =
        prompt("Enter your new username:");

    if (!newUsername) return;

    const username = newUsername.trim();

    if (username.length < 3) {
        alert("Username must be at least 3 characters.");
        return;
    }

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    if (!user) return;

    const { error } =
        await supabaseClient
            .from("profiles")
            .update({
                username: username
            })
            .eq("id", user.id);

    if (error) {
        console.error(
            "Username update error:",
            error
        );
        return;
    }

    const dashboardUsername =
        document.getElementById("dashboardUsername");

    const profileMenuUsername =
        document.getElementById("profileMenuUsername");

    if (dashboardUsername) {
        dashboardUsername.textContent = username;
    }

    if (profileMenuUsername) {
        profileMenuUsername.textContent = username;
    }

    closeProfileMenu();

    console.log("✅ Username updated:", username);
}


// ==============================
// OPEN ROOM
// ==============================

async function openRoom(roomId) {

   currentRoomId = roomId;

    const {
        data: room,
        error
    } = await supabaseClient
        .from("rooms")
        .select("*")
        .eq("id", roomId)
        .single();


    if (error) {

        console.error("Open room error:", error);

        alert("Could not open room.");

        return;
    }


    console.log("Opened room:", room);


    // Hide dashboard
    const dashboardPage =
        document.getElementById("dashboardPage");

    if (dashboardPage) {
        dashboardPage.style.display = "none";
    }


    // Show study room
    const studyRoomPage =
        document.getElementById("studyRoomPage");

    if (studyRoomPage) {
        studyRoomPage.style.display = "block";
    }


    // Set room information
    document.getElementById("studyRoomName").textContent =
        room.name;

    document.getElementById("studyRoomCode").textContent =
        room.room_code;
}


// ==============================
// CLOSE ROOM
// ==============================

function closeRoom() {

    const studyRoomPage =
        document.getElementById("studyRoomPage");

    const dashboardPage =
        document.getElementById("dashboardPage");


    if (studyRoomPage) {
        studyRoomPage.style.display = "none";
    }


    if (dashboardPage) {
        dashboardPage.style.display = "block";
    }
}

// Load rooms when dashboard opens
supabaseClient.auth.onAuthStateChange((event, session) => {

    if (session) {
        loadMyRooms();
    }

});


// ==============================
// OPEN MY ROOMS PAGE
// ==============================

function openMyRooms() {

    const dashboardPage =
        document.getElementById("dashboardPage");

    const myRoomsPage =
        document.getElementById("myRoomsPage");

    if (dashboardPage) {
        dashboardPage.style.display = "none";
    }

    if (myRoomsPage) {
        myRoomsPage.style.display = "block";
    }

    // Show Room Hub welcome screen
    const content =
        document.getElementById("roomHubContent");

    if (content) {

        content.innerHTML = `
            <div class="room-hub-welcome">

                <div class="welcome-icon">
                    📚
                </div>

                <h2>Your Study Rooms</h2>

                <p>
                    Create or join a room and study
                    together with your friends.
                </p>

            </div>
        `;

    }

}

// ==============================
// CLOSE MY ROOMS PAGE
// ==============================

function closeMyRooms() {

    const myRoomsPage =
        document.getElementById("myRoomsPage");

    const dashboardPage =
        document.getElementById("dashboardPage");


    if (myRoomsPage) {
        myRoomsPage.style.display = "none";
    }

    if (dashboardPage) {
        dashboardPage.style.display = "block";
    }
}


// ==============================
// LOAD ALL ROOMS
// ==============================

// ==============================
// LOAD ALL ROOMS
// ==============================

async function loadAllRooms() {

    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
        return;
    }

    // Get rooms created by me
    const { data: createdRooms, error: createdError } =
        await supabaseClient
            .from("rooms")
            .select("*")
            .eq("created_by", user.id)
            .order("created_at", { ascending: false });

    if (createdError) {
        console.error("Load created rooms error:", createdError);
        return;
    }


    // Get rooms I joined
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


    // Combine rooms
    const allRooms = [
        ...(createdRooms || []),
        ...joinedRooms
    ];


    // Remove duplicates
    const uniqueRooms = [
        ...new Map(
            allRooms.map(room => [room.id, room])
        ).values()
    ];


    const content =
        document.getElementById("roomHubContent");


    if (!content) {
        return;
    }


    // No rooms
    if (uniqueRooms.length === 0) {

        content.innerHTML = `
            <div class="room-hub-welcome">

                <div class="welcome-icon">
                    🚪
                </div>

                <h2>No rooms yet</h2>

                <p>
                    Create or join a study room
                    to get started.
                </p>

            </div>
        `;

        return;
    }


    // Rooms heading
    const allRoomsList =
    document.getElementById("allRoomsList");



    uniqueRooms.forEach(room => {

        const roomCard =
            document.createElement("div");


        roomCard.className =
            "all-room-card";


        const isOwner =
            room.created_by === user.id;


        roomCard.innerHTML = `

            <div class="all-room-icon">
                📚
            </div>


            <div class="all-room-info">

                <h3>
                    ${room.name}
                </h3>

                <p>
                    Room Code:
                    <strong>
                        ${room.room_code}
                    </strong>
                </p>

                <span class="room-role">
                    ${isOwner ? "Your Room" : "Joined Room"}
                </span>

            </div>


            <div class="room-actions">

                <button
                    class="room-open-btn"
                    onclick="event.stopPropagation(); openRoom('${room.id}')"
                >
                    Open
                </button>

                ${
                    isOwner
                    ? `
                        <button
                            class="room-edit-btn"
                            onclick="event.stopPropagation(); editRoom('${room.id}', '${room.name.replace(/'/g, "\\'")}')"
                        >
                            ✏️
                        </button>

                        <button
                            class="room-delete-btn"
                            onclick="event.stopPropagation(); deleteRoom('${room.id}')"
                        >
                            🗑️
                        </button>
                    `
                    : ""
                }

            </div>
        `;


        roomCard.onclick = function () {
            openRoom(room.id);
        };


        allRoomsList.appendChild(roomCard);

    });

}

// ==============================
// ROOM HUB
// ==============================

function showExploreRooms() {

    const myRoomsPage =
        document.getElementById("myRoomsPage");

    const exploreRoomsPage =
        document.getElementById("exploreRoomsPage");

    if (myRoomsPage) {
        myRoomsPage.style.display = "none";
    }

    if (exploreRoomsPage) {
        exploreRoomsPage.style.display = "block";
    }

    loadAllRooms();
}

function closeExploreRooms() {

    const exploreRoomsPage =
        document.getElementById("exploreRoomsPage");

    const myRoomsPage =
        document.getElementById("myRoomsPage");

    if (exploreRoomsPage) {
        exploreRoomsPage.style.display = "none";
    }

    if (myRoomsPage) {
        myRoomsPage.style.display = "block";
    }
}

// ==============================
// ROOM PROGRESS
// ==============================

// ==============================
// ROOM PROGRESS
// ==============================

async function showRoomProgress() {

    const content =
        document.getElementById("roomHubContent");

    if (!content) {
        return;
    }


    content.innerHTML = `

        <div class="explore-page-header">

            <button
                class="circle-back-btn"
                onclick="openMyRooms()"
            >
                ←
            </button>

            <div>

                <p class="card-label">
                    WEEKLY STATS
                </p>

                <h2>
                    Room Progress
                </h2>

                <p class="explore-subtitle">
                    Select a room to see this week's progress.
                </p>

            </div>

        </div>

        <div id="progressRoomsList"></div>

    `;


    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();


    if (userError || !user) {
        return;
    }


    // Created rooms
    const { data: createdRooms, error: createdError } =
        await supabaseClient
            .from("rooms")
            .select("*")
            .eq("created_by", user.id);


    if (createdError) {

        console.error(
            "Progress rooms error:",
            createdError
        );

        return;
    }


    // Joined rooms
    const { data: memberships, error: memberError } =
        await supabaseClient
            .from("room_members")
            .select("room_id")
            .eq("user_id", user.id);


    if (memberError) {

        console.error(
            "Progress memberships error:",
            memberError
        );

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

            console.error(
                "Progress joined rooms error:",
                error
            );

            return;
        }


        joinedRooms = data || [];
    }


    // Combine rooms
    const allRooms = [
        ...(createdRooms || []),
        ...joinedRooms
    ];


    // Remove duplicates
    const uniqueRooms = [
        ...new Map(
            allRooms.map(room => [room.id, room])
        ).values()
    ];


    const list =
        document.getElementById("progressRoomsList");


    if (!list) {
        return;
    }


    if (uniqueRooms.length === 0) {

        list.innerHTML = `

            <div class="room-hub-welcome">

                <div class="welcome-icon">
                    📊
                </div>

                <h2>
                    No rooms yet
                </h2>

                <p>
                    Create or join a room first.
                </p>

            </div>

        `;

        return;
    }


    uniqueRooms.forEach(room => {

        const card =
            document.createElement("div");


        card.className =
            "all-room-card";


        card.innerHTML = `

            <div class="all-room-icon">
                📊
            </div>

            <div class="all-room-info">

                <h3>
                    ${room.name}
                </h3>

                <p>
                    View this week's study progress
                </p>

            </div>

            <div class="room-actions">

                <button
                    class="room-open-btn"
                    onclick="openRoomProgress('${room.id}', '${room.name.replace(/'/g, "\\'")}')"
                >
                    View
                </button>

            </div>

        `;


        list.appendChild(card);

    });

}


async function deleteRoom(roomId) {

    const confirmed =
        confirm("Are you sure you want to delete this room?");

    if (!confirmed) {
        return;
    }

    console.log("Trying to delete room:", roomId);

    const { data, error } =
        await supabaseClient
            .from("rooms")
            .delete()
            .eq("id", roomId)
            .select();

    console.log("Delete result:", data);
    console.log("Delete error:", error);

    if (error) {
        console.error("DELETE ROOM ERROR:", error);
        return;
    }

    if (!data || data.length === 0) {
        console.warn("No room was deleted. RLS may be blocking the delete.");
        return;
    }

    console.log("Room deleted successfully:", data);

    await loadAllRooms();
}


// ==============================
// OPEN ROOM PROGRESS
// ==============================

async function openRoomProgress(roomId, roomName) {

    const content =
        document.getElementById("roomHubContent");

    if (!content) {
        return;
    }


    content.innerHTML = `

        <div class="explore-page-header">

            <button
                class="circle-back-btn"
                onclick="showRoomProgress()"
            >
                ←
            </button>

            <div>

                <p class="card-label">
                    THIS WEEK
                </p>

                <h2>
                    ${roomName}
                </h2>

                <p class="explore-subtitle">
                    Weekly study progress
                </p>

            </div>

        </div>

        <div id="roomProgressData">

            <div class="room-hub-welcome">

                <div class="welcome-icon">
                    ⏳
                </div>

                <h2>
                    Loading progress...
                </h2>

            </div>

        </div>

    `;


    // Get Monday of current week

    const today =
        new Date();

    const day =
        today.getDay();

    const diff =
        day === 0 ? -6 : 1 - day;


    const monday =
        new Date(today);

    monday.setDate(
        today.getDate() + diff
    );


    const mondayDate =
        monday.toISOString()
            .split("T")[0];


    const sunday =
        new Date(monday);

    sunday.setDate(
        monday.getDate() + 6
    );


    const sundayDate =
        sunday.toISOString()
            .split("T")[0];


    // Get study sessions for this room

    const { data: sessions, error: sessionError } =
        await supabaseClient
            .from("study_sessions")
            .select("user_id, duration_seconds, study_date")
            .eq("room_id", roomId)
            .gte("study_date", mondayDate)
            .lte("study_date", sundayDate);


    if (sessionError) {

        console.error(
            "Room progress error:",
            sessionError
        );

        document.getElementById("roomProgressData").innerHTML = `

            <div class="room-hub-welcome">

                <div class="welcome-icon">
                    ⚠️
                </div>

                <h2>
                    Could not load progress
                </h2>

                <p>
                    Please try again.
                </p>

            </div>

        `;

        return;
    }


    const progressData = {};


    (sessions || []).forEach(session => {

        if (!progressData[session.user_id]) {
            progressData[session.user_id] = 0;
        }

        progressData[session.user_id] +=
            session.duration_seconds;

    });


    const userIds =
        Object.keys(progressData);


    const progressContainer =
        document.getElementById("roomProgressData");


    if (userIds.length === 0) {

        progressContainer.innerHTML = `

            <div class="room-hub-welcome">

                <div class="welcome-icon">
                    📚
                </div>

                <h2>
                    No study data yet
                </h2>

                <p>
                    Start studying in this room
                    to see weekly progress here.
                </p>

            </div>

        `;

        return;
    }


    // Get usernames

    const { data: profiles, error: profileError } =
        await supabaseClient
            .from("profiles")
            .select("id, username")
            .in("id", userIds);


    if (profileError) {

        console.error(
            "Profile loading error:",
            profileError
        );

        return;
    }


    const profileMap = {};


    (profiles || []).forEach(profile => {

        profileMap[profile.id] =
            profile.username || "User";

    });


    // Create progress cards

    progressContainer.innerHTML = `

        <div class="weekly-progress-list">
        <div class="progress-list-header">

                <h3>
                    👥 Members
                </h3>

                <span>
                    ${userIds.length} studying
                </span>

            </div>

        </div>

    `;


    const list =
        progressContainer.querySelector(
            ".weekly-progress-list"
        );


    userIds.forEach(userId => {

        const seconds =
            progressData[userId];


        const hours =
            Math.floor(seconds / 3600);


        const minutes =
            Math.floor(
                (seconds % 3600) / 60
            );


        let timeText;


        if (hours > 0) {

            timeText =
                `${hours}h ${minutes}m`;

        } else {

            timeText =
                `${minutes}m`;

        }


        const card =
            document.createElement("div");


        card.className =
            "member-progress-card";


        card.innerHTML = `

            <div class="member-progress-avatar">
                👤
            </div>

            <div class="member-progress-info">

                <h3>
                    ${profileMap[userId] || "User"}
                </h3>

                <p>
                    Studied this week
                </p>

            </div>

            <div class="member-progress-time">
                ${timeText}
            </div>

        `;


        list.appendChild(card);

    });

}


// =========================
// PROFILE MENU
// =========================

function toggleProfileMenu() {

    const menu = document.getElementById("profileMenu");

    if (!menu) return;

    if (menu.style.display === "block") {
        menu.style.display = "none";
    } else {
        menu.style.display = "block";
    }
}


function closeProfileMenu() {

    const menu = document.getElementById("profileMenu");

    if (!menu) return;

    menu.style.display = "none";
}


// ==============================
// CHANGE USERNAME
// ==============================



function changeUsername() {

    const modal =
        document.getElementById("usernameModal");

    const input =
        document.getElementById("newUsernameInput");

    if (!modal || !input) return;

    input.value = "";

    modal.style.display = "flex";

    setTimeout(() => {
        input.focus();
    }, 100);
}


function closeUsernameModal() {

    const modal =
        document.getElementById("usernameModal");

    if (!modal) return;

    modal.style.display = "none";
}

async function saveNewUsername() {

    const input =
        document.getElementById("newUsernameInput");

    if (!input) return;

    const username =
        input.value.trim();

    if (username.length < 3) {
        showToast(
    "Invalid Username",
    "Username must be at least 3 characters."
);
        return;
    }

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    if (!user) return;

    const { error } =
        await supabaseClient
            .from("profiles")
            .update({
                username: username
            })
            .eq("id", user.id);

    if (error) {

        console.error(
            "Username update error:",
            error
        );

       showToast(
    "Update Failed",
    "Could not update your username."
);
    }

    const dashboardUsername =
        document.getElementById("dashboardUsername");

    const profileMenuUsername =
        document.getElementById("profileMenuUsername");

    if (dashboardUsername) {
        dashboardUsername.textContent =
            username;
    }

    if (profileMenuUsername) {
        profileMenuUsername.textContent =
            username;
    }

    closeUsernameModal();
    closeProfileMenu();

    console.log(
        "✅ Username updated:",
        username
    );
}
