// ==============================
// SUPABASE CONNECTION
// ==============================

const SUPABASE_URL = "https://kczoxlotxamqommhgnrv.supabase.co";

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

    const input = document.getElementById(inputId);

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
        document.getElementById("loginEmail").value.trim();

    const password =
        document.getElementById("loginPassword").value;

    const message =
        document.getElementById("authMessage");


    if (!email || !password) {

        message.textContent =
            "Please enter email and password.";

        return;
    }


    message.textContent = "Logging in...";


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


    console.log("Logged in user:", data.user);


    // Temporary dashboard test

    setTimeout(() => {

        closeLogin();

        alert("Welcome to Focus Room!");

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

            options: {

                data: {
                    username: username
                }
            }
        });


    if (error) {

        message.textContent =
            error.message;

        return;
    }


    console.log("Signup user:", data.user);


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
