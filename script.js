// ==============================
// SUPABASE CONNECTION
// ==============================

const SUPABASE_URL = "https://kczoxlotxamqommhgnrv.supabase.co";

const SUPABASE_KEY = "sb_publishable_FEDDWMPP-wjRyOzEQbcOSQ_49dANp9m";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ==============================
// LOGIN BUTTON
// ==============================

function openLogin() {

    const email = prompt("Enter your email:");

    if (!email) return;

    const password = prompt("Enter your password:");

    if (!password) return;

    loginUser(email, password);
}


// ==============================
// LOGIN
// ==============================

async function loginUser(email, password) {

    const { data, error } =
        await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

    if (error) {

        alert("Login failed: " + error.message);

        return;
    }

    alert("Login successful!");

    console.log("Logged in user:", data.user);
}
