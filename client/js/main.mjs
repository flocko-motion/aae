import UI from "./UI.mjs";
import Log from "./Log.mjs";
import Com from "./Com.mjs";
import User from "./User.mjs";
import Game from "./Game.mjs";
import UIGameEditor from "./UIGameEditor.mjs";

/*-----------------------------------
Config
------------------------------------*/


/*-----------------------------------
Main
------------------------------------*/
window.aae = {Com: Com, Game: Game, UIGameEditor: UIGameEditor};

window.d1000 = async function() {

    let promise = new Promise((resolve, reject) => {
        setTimeout(() => resolve("done waiting!"), 1000)
    });
    let result = await promise; // wait until the promise resolves (*)
    console.log(result);
}

window.onload = async () => {

    // setup communications
    Com.init();

    // setup user
    let userRole = 'master';
    Log.assert(userRole, 'userRole missing');
    Log.assert(userRole == 'player' || userRole == 'master', 'userRole must be "player" or "master"');
    User.user = new User[userRole == 'player' ? 'Player':'Master']();
    await User.user.register();

    // init base modules
    await Game.init();

    // launch UI
    window.UI = new UI();

    // Auth0
    await configureClient();
    await updateUI(); // flo added "await"
    const isAuthenticated = await auth0.isAuthenticated();
    if (isAuthenticated) {
        // show the gated content
        return;
    }
    // Auth0: check url parameters
    const query = window.location.search;
    if (query.includes("code=") && query.includes("state=")) {
        // Process the login state
        await auth0.handleRedirectCallback();
        updateUI();
        // Use replaceState to redirect the user away and remove the querystring parameters
        window.history.replaceState({}, document.title, "/");
    }
    // init main
};

/*-----------------------------------
Tools
------------------------------------*/

Number.toFixedSafe = function (n, d) {
    if (!d) d = 0;
    if (isNaN(n)) return n;
    else return Number(n).toFixed(d);
};


/*-----------------------------------
Auth0
------------------------------------*/

let auth0 = null;
const fetchAuthConfig = () => fetch("./auth_config.json");
const configureClient = async () => {
    const response = await fetchAuthConfig();
    const config = await response.json();

    auth0 = await createAuth0Client({
        domain: config.domain,
        client_id: config.clientId
    });
};


// NEW
const updateUI = async () => {
    const isAuthenticated = await auth0.isAuthenticated();
    const buttonLogin = document.getElementById("btn-login");
    const buttonLogout = document.getElementById("btn-logout");

    buttonLogin.disabled = buttonLogin.hidden = isAuthenticated;
    buttonLogout.disabled = buttonLogout.hidden = !isAuthenticated;
};

const login = async () => {
    await auth0.loginWithRedirect({
        redirect_uri: window.location.origin
    });
};

const logout = () => {
    auth0.logout({
        returnTo: window.location.origin
    });
};
