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
        loadStudySessions().then(() => {
            restoreTimerState();
        });

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
// TIMER SESSION RECOVERY
// ==============================

const TIMER_STORAGE_KEY = "focusRoomTimerSession";

function saveTimerState() {
    if (!currentUser) return;

    const state = {
        userId: currentUser.id,
        timerSeconds: timerSeconds,
        currentSessionSeconds: currentSessionSeconds,
        timerRunning: timerRunning,
        savedAt: Date.now()
    };

    localStorage.setItem(
        TIMER_STORAGE_KEY,
        JSON.stringify(state)
    );
}

function clearSavedTimerState() {
    localStorage.removeItem(TIMER_STORAGE_KEY);
}

function restoreTimerState() {
    if (!currentUser) return;

    const saved = localStorage.getItem(TIMER_STORAGE_KEY);
    if (!saved) return;

    try {
        const state = JSON.parse(saved);

        if (state.userId !== currentUser.id) return;

        timerSeconds = Math.max(
            0,
            Number(state.timerSeconds) || 0
        );

        currentSessionSeconds = Math.max(
            0,
            Number(state.currentSessionSeconds) || 0
        );

        // Refresh ke baad timer paused rahega.
        // Start/Resume dabane par wahi se continue hoga.
        timerRunning = false;

        const button = document.getElementById("timerStart");
        if (button) {
            button.textContent =
                currentSessionSeconds > 0
                    ? "Resume Focus"
                    : "Start Focus";
        }

        updateTimerDisplay();

    } catch (error) {
        console.error("Timer recovery failed:", error);
    }
}



// ==============================
// UPDATE WEEKLY CHART
// ==============================

function updateWeeklyChart() {

    const chart = document.getElementById("weeklyChart");
    const yAxis = document.getElementById("weeklyYAxis");
    const grid = document.getElementById("weeklyGridLines");

    if (!chart || !yAxis || !grid) return;

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const formatTime = (seconds) => {
        seconds = Math.max(0, Number(seconds) || 0);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    const values = days.map(day => Number(weeklyStudySeconds[day]) || 0);
    const maxSeconds = Math.max(...values, 0);

    // Dynamic Y-axis scale
    const step = maxSeconds <= 1800 ? 600
        : maxSeconds <= 7200 ? 1800
        : maxSeconds <= 18000 ? 3600
        : maxSeconds <= 36000 ? 7200
        : 14400;

    const axisMax = Math.max(step * 4, Math.ceil(maxSeconds / step) * step);

    yAxis.innerHTML = "";
    grid.innerHTML = "";

    for (let i = 4; i >= 0; i--) {
        const value = step * i;

        const label = document.createElement("span");
        label.textContent = formatTime(value);
        yAxis.appendChild(label);

        const line = document.createElement("div");
        line.className = "weekly-grid-line";
        grid.appendChild(line);
    }

    const totalSeconds = values.reduce((sum, value) => sum + value, 0);
    const totalElement = document.getElementById("todayProgress");

    if (totalElement) totalElement.textContent = formatTime(totalSeconds);

    chart.querySelectorAll(".chart-bar").forEach((bar, index) => {

        const day = days[index];
        const seconds = values[index];
        const fill = bar.querySelector(".chart-bar-fill");

        if (!fill) return;

        fill.style.height = `${(seconds / axisMax) * 100}%`;
        fill.title = `${day}: ${formatTime(seconds)}`;

        bar.setAttribute("role", "button");
        bar.setAttribute("tabindex", "0");
        bar.setAttribute("aria-label", `${day}: ${formatTime(seconds)}`);

        if (day === todayName) {
            bar.classList.add("is-today");
        } else {
            bar.classList.remove("is-today");
        }

        // Prevent duplicate listeners when chart refreshes
        if (bar.dataset.popupReady === "true") return;
        bar.dataset.popupReady = "true";

        let holdTimer;
        let longPressTriggered = false;

        const showTotal = () => {
            longPressTriggered = true;
            if (typeof showToast === "function") {
                showToast("Weekly Study Time", formatTime(totalSeconds));
            } else {
                alert(`Total study time this week: ${formatTime(totalSeconds)}`);
            }
        };

        const startHold = () => {
            longPressTriggered = false;
            holdTimer = setTimeout(showTotal, 600);
        };

        const cancelHold = () => clearTimeout(holdTimer);

        bar.addEventListener("pointerdown", startHold);
        bar.addEventListener("pointerup", cancelHold);
        bar.addEventListener("pointerleave", cancelHold);
        bar.addEventListener("pointercancel", cancelHold);

        bar.addEventListener("click", () => {
            if (longPressTriggered) {
                longPressTriggered = false;
                return;
            }

            if (typeof openDayProgressPopup === "function") {
                openDayProgressPopup(day);
            }
        });

        bar.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                if (typeof openDayProgressPopup === "function") {
                    openDayProgressPopup(day);
                }
            }
        });
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

const todayName = dayNames[new Date().getDay()];




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

    // PAUSE
    if (timerRunning) {
        clearInterval(timerInterval);
        timerInterval = null;
        timerRunning = false;

        saveTimerState();

        if (currentSessionSeconds > 0) {
            const secondsToSave = currentSessionSeconds;

            saveStudySession(secondsToSave).then(() => {
                currentSessionSeconds = 0;
                saveTimerState();
            });
        }

        button.textContent = "Resume Focus";
        return;
    }

    // START / RESUME
    timerRunning = true;
    button.textContent = "Pause";
    saveTimerState();

    timerInterval = setInterval(() => {
        if (timerSeconds <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            timerRunning = false;

            const secondsToSave = currentSessionSeconds;

            if (secondsToSave > 0) {
                saveStudySession(secondsToSave).then(() => {
                    currentSessionSeconds = 0;
                    timerSeconds = 25 * 60;
                    clearSavedTimerState();
                    updateTimerDisplay();
                });
            }

            showFocusCompletePopup();
            button.textContent = "Start Focus";
            return;
        }

        timerSeconds--;
        todayStudySeconds++;
        currentSessionSeconds++;

        weeklyStudySeconds[todayName] =
            (weeklyStudySeconds[todayName] || 0) + 1;

        saveTimerState();

        updateWeeklyChart();
        updateTodayProgress();
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
        getLocalDateString();


    // Get all study sessions
    const { data: sessions, error: sessionsError } =
        await supabaseClient
            .from("study_sessions")
            .select("study_date, duration_seconds")
            .eq("user_id", currentUser.id);


    if (sessionsError) {

        console.error(
            "Failed to load study sessions:",
            sessionsError
        );

        return;
    }


    // ==============================
    // CALCULATE DAILY STUDY TIME
    // ==============================

    const dailyStudy = {};


    (sessions || []).forEach(session => {

        if (!dailyStudy[session.study_date]) {
            dailyStudy[session.study_date] = 0;
        }

        dailyStudy[session.study_date] +=
            Number(session.duration_seconds || 0);
    });


    // ==============================
    // QUALIFYING DAYS
    // 10+ MINUTES = VALID STUDY DAY
    // ==============================

    const qualifyingDates = new Set();


    Object.keys(dailyStudy).forEach(date => {

        if (dailyStudy[date] >= 600) {

            qualifyingDates.add(date);
        }
    });


    // ==============================
    // TODAY NOT QUALIFIED
    // ==============================

    if (!qualifyingDates.has(today)) {

        const { data: existingStreak } =
            await supabaseClient
                .from("streaks")
                .select("best_streak")
                .eq("user_id", currentUser.id)
                .maybeSingle();


        if (!existingStreak) {

            await supabaseClient
                .from("streaks")
                .insert({
                    user_id: currentUser.id,
                    current_streak: 0,
                    best_streak: 0,
                    last_study_date: null
                });

        } else {

            await supabaseClient
                .from("streaks")
                .update({
                    current_streak: 0,
                    updated_at: new Date().toISOString()
                })
                .eq("user_id", currentUser.id);
        }


        console.log(
            "🔥 Today has less than 10 minutes. Streak = 0"
        );

        return;
    }


    // ==============================
    // CALCULATE CURRENT STREAK
    // ==============================

    let currentStreak = 0;

    let checkDate =
        new Date(today + "T00:00:00");


    while (true) {

        const dateString = getLocalDateString(checkDate);


        if (!qualifyingDates.has(dateString)) {
            break;
        }


        currentStreak++;


        checkDate.setDate(
            checkDate.getDate() - 1
        );
    }


    // ==============================
    // GET EXISTING BEST STREAK
    // ==============================

    const { data: existingStreak, error: streakError } =
        await supabaseClient
            .from("streaks")
            .select("best_streak")
            .eq("user_id", currentUser.id)
            .maybeSingle();


    if (streakError) {

        console.error(
            "Failed to load streak:",
            streakError
        );

        return;
    }


    const oldBest =
        existingStreak?.best_streak || 0;


    const newBestStreak =
        Math.max(
            oldBest,
            currentStreak
        );


    // ==============================
    // SAVE STREAK
    // ==============================

    const { error } =
        await supabaseClient
            .from("streaks")
            .upsert({

                user_id: currentUser.id,

                current_streak:
                    currentStreak,

                best_streak:
                    newBestStreak,

                last_study_date:
                    today,

                updated_at:
                    new Date().toISOString()}, {
                onConflict: "user_id"
            });


    if (error) {

        console.error(
            "Failed to update streak:",
            error
        );

        return;
    }


    console.log(
        "🔥 Streak updated:",
        currentStreak,
        "| Best:",
        newBestStreak
    );
}



// ==============================
// LOCAL DATE — INDIA / DEVICE TIME
// ==============================

function getLocalDateString(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
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
    study_date: getLocalDateString(),
    duration_seconds: seconds
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
    const todayDate = getLocalDateString();

    // Find Monday of the current week
    const monday = new Date(today);
    monday.setHours(0, 0, 0, 0);

    const day = monday.getDay();

    monday.setDate(
        monday.getDate() - (day === 0 ? 6 : day - 1)
    );

    const weekStart = getLocalDateString(monday);

    data.forEach(session => {

        const seconds = Number(session.duration_seconds || 0);
        const sessionDate = session.study_date;

        // Today's focus time
        if (sessionDate === todayDate) {
            todayStudySeconds += seconds;
        }

        // Only sessions from Monday through today
        if (sessionDate >= weekStart && sessionDate <= todayDate) {

            const date = new Date(sessionDate + "T00:00:00");
            const dayName = dayNames[date.getDay()];

            if (weeklyStudySeconds[dayName] !== undefined) {
                weeklyStudySeconds[dayName] += seconds;
            }
        }
    });

    updateTodayProgress();
    updateWeeklyChart();

    console.log("Weekly study time:", weeklyStudySeconds);

    todayStudySeconds += currentSessionSeconds;
weeklyStudySeconds[todayName] =
    (weeklyStudySeconds[todayName] || 0) + currentSessionSeconds;

    updateTodayProgress();
    updateWeeklyChart();
    
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

        await loadStudySessions();
        restoreTimerState();
        await loadStreak();
    }
}

// ==============================
// INITIAL DISPLAY
// ==============================

updateTimerDisplay();




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

    const profileMenuAvatar =
        document.getElementById("profileMenuAvatar");


    if (profile?.avatar) {

        if (profileAvatar) {

            profileAvatar.textContent =
                profile.avatar;
        }


        if (profileMenuAvatar) {

            profileMenuAvatar.textContent =
                profile.avatar;
        }


        localStorage.setItem(
            "focusRoomAvatar",
            profile.avatar
        );
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


document.addEventListener("click", function (event) {

    const menu =
        document.getElementById("profileMenu");

    const profile =
        document.querySelector(".profile-mini");

    if (!menu || !profile) return;

    if (
        menu.style.display === "block" &&
        !menu.contains(event.target) &&
        !profile.contains(event.target)
    ) {
        closeProfileMenu();
    }

});


/* ================================= /
/ FOCUS COMPLETE POPUP /
/ ================================= */

function showFocusCompletePopup() {

const overlay = document.getElementById("focusCompleteOverlay");
const timeElement = document.getElementById("focusCompleteTime");

if (!overlay) return;

/* Show completed session time */
if (timeElement) {

    const completedSeconds =
        typeof currentSessionSeconds === "number"
            ? currentSessionSeconds
            : 0;

    const minutes = Math.floor(completedSeconds / 60);
    const seconds = completedSeconds % 60;

    timeElement.textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

overlay.classList.add("show");

}

function closeFocusCompletePopup() {

const overlay =
    document.getElementById("focusCompleteOverlay");

if (!overlay) return;

overlay.classList.remove("show");

}



// ==============================
// DAILY PROGRESS POPUP
// ==============================

async function openDayProgressPopup(day) {

    if (!currentUser) return;

    const overlay = document.getElementById("dayProgressOverlay");
    const title = document.getElementById("dayPopupTitle");
    const dateElement = document.getElementById("dayPopupDate");
    const totalElement = document.getElementById("dayPopupTotal");
    const countElement = document.getElementById("dayPopupSessionCount");
    const sessionsElement = document.getElementById("dayPopupSessions");

    if (!overlay || !sessionsElement) {
        console.error("Daily progress popup HTML not found");
        return;
    }

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const today = new Date();
    const monday = new Date(today);
    monday.setHours(0, 0, 0, 0);

    const offset = (monday.getDay() + 6) % 7;
    monday.setDate(monday.getDate() - offset);

    const dayIndex = days.indexOf(day);

    if (dayIndex < 0) return;

    const selectedDate = new Date(monday);
    selectedDate.setDate(monday.getDate() + dayIndex);

    const dateString = getLocalDateString(selectedDate);

    const { data, error } = await supabaseClient
        .from("study_sessions")
        .select("study_date, duration_seconds, created_at")
        .eq("user_id", currentUser.id)
        .eq("study_date", dateString)
        .order("created_at", { ascending: true });

    if (error) {
        console.error("Failed to load daily sessions:", error);
        sessionsElement.textContent = "Unable to load sessions. Please try again.";
        return;
    }

    const sessions = data || [];
    const totalSeconds = sessions.reduce(
        (sum, session) => sum + Number(session.duration_seconds || 0),
        0
    );

    function formatDuration(seconds) {
        seconds = Math.max(0, Number(seconds) || 0);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        return hours > 0
            ? `${hours}h ${minutes}m`
            : `${minutes}m`;
    }

    if (title) {
        title.textContent = `${day}'s Progress`;
    }

    if (dateElement) {
        dateElement.textContent = selectedDate.toLocaleDateString(
            "en-IN",
            { day: "numeric", month: "short", year: "numeric" }
        );
    }

    if (totalElement) {
        totalElement.textContent = formatDuration(totalSeconds);
    }

    if (countElement) {
        countElement.textContent =
            `${sessions.length} study session${sessions.length === 1 ? "" : "s"}`;
    }

    sessionsElement.replaceChildren();

    if (sessions.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.textContent = "No study sessions recorded for this day.";
        sessionsElement.appendChild(emptyMessage);
    } else {
        sessions.forEach((session, index) => {
            const item = document.createElement("div");
            item.className = "day-session-item";

            const sessionName = document.createElement("span");
            sessionName.textContent = `Session ${index + 1}`;

            const duration = document.createElement("strong");
            duration.textContent = formatDuration(session.duration_seconds);

            item.append(sessionName, duration);
            sessionsElement.appendChild(item);
        });
    }

    overlay.classList.add("active");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
}

function closeDayProgressPopup() {
    const overlay = document.getElementById("dayProgressOverlay");

    if (!overlay) return;

    overlay.classList.remove("active");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}

// Close popup when tapping outside the modal
document.addEventListener("click", function (event) {
    const overlay = document.getElementById("dayProgressOverlay");

    if (overlay && event.target === overlay) {
        closeDayProgressPopup();
    }
});

// Close popup using Escape key
document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeDayProgressPopup();
    }
});



/* OPEN ACTIVITIES PAGE */
function openActivitiesPage() {
    const page = document.getElementById("activitiesPage");

    if (page) {
        page.classList.remove("hidden");
    }
}

/* CLOSE ACTIVITIES PAGE */
function closeActivitiesPage() {
    const page = document.getElementById("activitiesPage");

    if (page) {
        page.classList.add("hidden");
    }
}


/* =========================================
   ACTIVITIES WEEKLY PERFORMANCE
========================================= */

function initActivitiesChart() {
    const chart = document.getElementById("activityWeeklyChart");
    const totalElement = document.getElementById("activityTotalTime");

    if (!chart || typeof weeklyStudySeconds === "undefined") return;

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const values = days.map(day => Number(weeklyStudySeconds[day]) || 0);
    const total = values.reduce((sum, value) => sum + value, 0);
    const maxValue = Math.max(...values, 0);

    function formatTime(seconds) {
        seconds = Math.max(0, Number(seconds) || 0);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    }

    if (totalElement) {
        totalElement.textContent = formatTime(total);
    }

    const today = new Date();
    const todayIndex = (today.getDay() + 6) % 7;

    chart.replaceChildren();

    days.forEach((day, index) => {
        const seconds = values[index];
        const height = maxValue > 0
            ? Math.max(3, (seconds / maxValue) * 100)
            : 3;

        const bar = document.createElement("button");
        bar.type = "button";
        bar.className = "activity-day-bar";
        bar.setAttribute("aria-label", `${day}: ${formatTime(seconds)}`);

        if (index === todayIndex) {
            bar.classList.add("is-today");
        }

        const valueLabel = document.createElement("span");
        valueLabel.className = "activity-bar-value";
        valueLabel.textContent = formatTime(seconds);

        const track = document.createElement("span");
        track.className = "activity-bar-track";

        const fill = document.createElement("span");
        fill.className = "activity-bar-fill";
        fill.style.height = `${height}%`;

        track.appendChild(fill);

        const dayLabel = document.createElement("span");
        dayLabel.className = "activity-day-name";
        dayLabel.textContent = day;

        bar.append(valueLabel, track, dayLabel);

        let holdTimer = null;
        let longPressTriggered = false;

        bar.addEventListener("pointerdown", () => {
            longPressTriggered = false;

            holdTimer = setTimeout(() => {
                longPressTriggered = true;
                valueLabel.textContent = formatTime(seconds);
                valueLabel.style.fontSize = "12px";
                bar.classList.add("is-selected");
            }, 550);
        });

        function cancelHold() {
            if (holdTimer !== null) {
                clearTimeout(holdTimer);
                holdTimer = null;
            }
        }

        bar.addEventListener("pointerup", cancelHold);
        bar.addEventListener("pointerleave", cancelHold);
        bar.addEventListener("pointercancel", cancelHold);

        bar.addEventListener("click", () => {
            if (longPressTriggered) {
                longPressTriggered = false;
                return;
            }

            if (typeof openActivityDayPopup === "function") {
                openActivityDayPopup(day, seconds);
            }
        });

        bar.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openActivityDayPopup(day, seconds);
            }
        });

        chart.appendChild(bar);
    });
}


/* REFRESH ACTIVITIES WHEN OPENING THE PAGE */

function openActivitiesPage() {
    const page = document.getElementById("activitiesPage");

    if (!page) return;

    page.classList.remove("hidden");

    if (typeof loadStudySessions === "function") {
        loadStudySessions();
    } else {
        initActivitiesChart();
    }
}


/* CLOSE ACTIVITIES PAGE */

function closeActivitiesPage() {
    const page = document.getElementById("activitiesPage");
    if (page) {
        page.classList.add("hidden");
    }

    closeActivityDayPopup();
}


/* DAILY BREAKDOWN POPUP */

async function openActivityDayPopup(day, chartSeconds) {
    if (!currentUser) return;

    const overlay = document.getElementById("activityDayOverlay");
    const title = document.getElementById("activityDayTitle");
    const dateElement = document.getElementById("activityDayDate");
    const totalElement = document.getElementById("activityDayTotal");
    const countElement = document.getElementById("activityDaySessionCount");
    const list = document.getElementById("activityDaySessions");

    if (!overlay || !list) return;

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const today = new Date();
    const monday = new Date(today);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));

    const dayIndex = days.indexOf(day);
    if (dayIndex < 0) return;

    const selectedDate = new Date(monday);
    selectedDate.setDate(monday.getDate() + dayIndex);

    const dateString = getLocalDateString(selectedDate);

    overlay.classList.add("active");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    title.textContent = `${day}'s Progress`;
    dateElement.textContent = selectedDate.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });

    totalElement.textContent = "Loading...";
    countElement.textContent = "";
    list.replaceChildren();

    const { data, error } = await supabaseClient
        .from("study_sessions")
        .select("duration_seconds, created_at")
        .eq("user_id", currentUser.id)
        .eq("study_date", dateString)
        .order("created_at", { ascending: true });

    if (error) {
        console.error("Failed to load activity sessions:", error);
        totalElement.textContent = "Unavailable";
        return;
    }

    const sessions = data || [];
    const totalSeconds = sessions.reduce(
        (sum, session) => sum + Number(session.duration_seconds || 0),
        0
    );

    function formatTime(seconds) {
        seconds = Math.max(0, Number(seconds) || 0);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    }

    totalElement.textContent = formatTime(totalSeconds);
    countElement.textContent =
        `${sessions.length} study session${sessions.length === 1 ? "" : "s"}`;

    if (sessions.length === 0) {
        const empty = document.createElement("p");
        empty.className = "activity-empty-message";
        empty.textContent = "No study sessions recorded for this day.";
        list.appendChild(empty);
        return;
    }

    sessions.forEach((session, index) => {
        const item = document.createElement("div");
        item.className = "activity-session-item";

        const label = document.createElement("span");
        label.textContent = `Session ${index + 1}`;

        const duration = document.createElement("strong");
        duration.textContent = formatTime(session.duration_seconds);

        item.append(label, duration);
        list.appendChild(item);
    });
}


/* CLOSE DAILY BREAKDOWN */

function closeActivityDayPopup() {
    const overlay = document.getElementById("activityDayOverlay");

    if (!overlay) return;

    overlay.classList.remove("active");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}


/* UPDATE ACTIVITIES CHART AFTER DATA LOAD */

const originalLoadStudySessionsForActivities = loadStudySessions;

loadStudySessions = async function () {
    await originalLoadStudySessionsForActivities();
    initActivitiesChart();
};


/* CLOSE DAILY POPUP ON BACKGROUND TAP */

document.getElementById("activityDayOverlay")?.addEventListener("click", event => {
    if (event.target.id === "activityDayOverlay") {
        closeActivityDayPopup();
    }
});
