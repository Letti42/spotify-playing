const fetch = require('cross-fetch');

function initFunctionTrack(){

    global.getPlayingTrack = async(ac)=>{
        let js = await makeRequest('https://api.spotify.com/v1/me/player', ac);
        return js;
    },

    global.getUser = async(ac) =>{
        let js = await makeRequest("https://api.spotify.com/v1/me", ac);
        return js;
    }

}

async function makeRequest(url, ac) {
    let response = await fetch(url, {
        headers: {
            "Authorization": "Bearer " + ac
        },
        method: "GET"
    });

    if (response.status > 206) return (console.log("Error @" + url + ": " + response.status), null);

    let text = await response.text(), json;
    json = text.length > 3 ? JSON.parse(text) : null;
    return json;
}

module.exports = initFunctionTrack();