const fs = require("fs");
const he = require('he');

async function createSvg(host){
    let track = JSON.parse(fs.readFileSync("track.json", "utf-8"))
    let img = track.item.album.images[1].url;
    let title = track.item.name;
    let artist = track.item.artists[0].name; // Maybe change this later to include all artists;
    let duration = track.item.duration_ms / 1000; //in seconds;
    let offset = track.progress_ms / 1000; //in seconds;
    let isPlaying = track.is_playing ? "" : "1";
    let ratio = offset / duration;
    let isShuffled = track.shuffle_state;
    let repeat = track.repeat_state;

    let time = constructTime(track);


    let style = `
    <style>

        .startMoving{
            animation-name:move;
            animation-duration: ${duration}s;
            animation-iteration-count: 1;
            animation-timing-function: linear;
            animation-fill-mode: forwards;
            animation-delay: -${offset}s;
        }

        .startWidth{
            animation-name:addWidth;
            animation-duration: ${duration}s;
            animation-iteration-count: 1;
            animation-timing-function: linear;
            animation-fill-mode: forwards;
            animation-delay: -${offset}s;
        }


    </style>
    ${isPlaying.length ? time.prog: time.style}
    `




    let svg = `
    <image href="${img}" height="230" width="230" x="40" y="40" />
	<text class="track" x="40" y="293">${he.encode(title)}</text>
    <text class="artist" x="40" y="310">${he.encode(artist)}</text>
    <rect x="30" y="330" width="250" height="3" rx="2" fill="#696969" />
    <rect x="30" y="330" width="${ratio*250}" height="3" rx="2" fill="#495151" class="startWidth${isPlaying}"/>
    <circle r="5" cx="${isPlaying.length ? (ratio*250+30) : 30}" cy="331" fill="#969696" class="startMoving${isPlaying}"></circle>
    <text class="time" y="350" x="270">${time.end}</text>
    ${time.playing}
    <svg role="img" height="16" width="16" y="345" x="100" aria-hidden="true" viewBox="0 0 16 16" fill="${isShuffled ? "#21ca1e" : "#696969"}" data-encore-id="icon"><path d="M13.151.922a.75.75 0 1 0-1.06 1.06L13.109 3H11.16a3.75 3.75 0 0 0-2.873 1.34l-6.173 7.356A2.25 2.25 0 0 1 .39 12.5H0V14h.391a3.75 3.75 0 0 0 2.873-1.34l6.173-7.356a2.25 2.25 0 0 1 1.724-.804h1.947l-1.017 1.018a.75.75 0 0 0 1.06 1.06L15.98 3.75 13.15.922zM.391 3.5H0V2h.391c1.109 0 2.16.49 2.873 1.34L4.89 5.277l-.979 1.167-1.796-2.14A2.25 2.25 0 0 0 .39 3.5z"></path><path d="m7.5 10.723.98-1.167.957 1.14a2.25 2.25 0 0 0 1.724.804h1.947l-1.017-1.018a.75.75 0 1 1 1.06-1.06l2.829 2.828-2.829 2.828a.75.75 0 1 1-1.06-1.06L13.109 13H11.16a3.75 3.75 0 0 1-2.873-1.34l-.787-.938z"></path></svg>
    <svg role="img" height="16" width="16" y="346" x="196" aria-hidden="true" viewBox="0 0 16 16" fill="${repeat == "off" ? "#696969" : "#21ca1e"}" data-encore-id="icon"><path d="M0 4.75A3.75 3.75 0 0 1 3.75 1h8.5A3.75 3.75 0 0 1 16 4.75v5a3.75 3.75 0 0 1-3.75 3.75H9.81l1.018 1.018a.75.75 0 1 1-1.06 1.06L6.939 12.75l2.829-2.828a.75.75 0 1 1 1.06 1.06L9.811 12h2.439a2.25 2.25 0 0 0 2.25-2.25v-5a2.25 2.25 0 0 0-2.25-2.25h-8.5A2.25 2.25 0 0 0 1.5 4.75v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75v-5z"></path></svg>
    <text class="one" y="355" x="202" style="opacity:${repeat == "track" ? "1" : "0"}">1</text>
    <image href="${host}/redirect.png" width="20" height="20" y="375" x="147"></image>
    ${time.dur}
    <script>
    <![CDATA[
        var getTextWidth = (el)=>{
            return el.getBBox().width
        }
        var artist = document.querySelector(".artist");
        var track = document.querySelector(".track");
        var bb = getTextWidth(artist);

        if(bb > 230){
            let size = 18 - 0.25;
            for(let i = 0; i < Math.floor(bb); i++){
                artist.style.fontSize = size.toString()+"px";
                getTextWidth(artist) > 230 ? size-= 0.25 : i = Math.floor(bb);
            }
        }

        bb = getTextWidth(track) -20;
        console.log(bb);
        if(bb > 230){
            for(let i = 0; i < Math.floor(bb); i++){
                !i ? track.style.fontSize = "18px" : track.textContent = track.textContent.substring(0, track.textContent.length - (i > 1 ? 4: 1)) + "...";
                getTextWidth(track)-20 < 230 ? i = Math.floor(bb):i;
            }
        }


    ]]>
    </script>
</svg>
`;

    let temp = fs.readFileSync("web/temp.svg", "utf-8");
    fs.writeFileSync("web/player.svg", temp+style+svg);
}


function constructTime(track){
    let d = track.item.duration_ms / 1000;
    let m_end = Math.floor(d / 60);
    let s_end = Math.floor(d % 60);
    let endTime = `${m_end}:${s_end < 10 ? "0" : ""}${s_end}`;
    
    let dur = initTimeElements();
    let style = initTransitionStyles(track.progress_ms / 1000); // in seconds
    let prog = getCurrentTime(track.progress_ms / 1000);
    let play = initPlayingIcon(track.is_playing);

    return {end:endTime, dur:dur, style:style, prog:prog, playing:play};


}

function initTimeElements(){
    return(
   `<text y="350" x="17" class="min time m0">0:</text>
    <text y="350" x="17" class="min time m1">1:</text>
    <text y="350" x="17" class="min time m2">2:</text>
    <text y="350" x="17" class="min time m3">3:</text>
    <text y="350" x="17" class="min time m4">4:</text>
    <text y="350" x="17" class="min time m5">5:</text>
    <text y="350" x="17" class="min time m6">6:</text>
    <text y="350" x="17" class="min time m7">7:</text>
    <text y="350" x="17" class="min time m8">8:</text>
    <text y="350" x="17" class="min time m9">9:</text>
    
    <text y="350" x="27" class="sec_ten time st0">0</text>
    <text y="350" x="27" class="sec_ten time st1">1</text>
    <text y="350" x="27" class="sec_ten time st2">2</text>
    <text y="350" x="27" class="sec_ten time st3">3</text>
    <text y="350" x="27" class="sec_ten time st4">4</text>
    <text y="350" x="27" class="sec_ten time st5">5</text>

    <text y="350" x="34" class="sec_one time so0">0</text>
    <text y="350" x="34" class="sec_one time so1">1</text>
    <text y="350" x="34" class="sec_one time so2">2</text>
    <text y="350" x="34" class="sec_one time so3">3</text>
    <text y="350" x="34" class="sec_one time so4">4</text>
    <text y="350" x="34" class="sec_one time so5">5</text>
    <text y="350" x="34" class="sec_one time so6">6</text>
    <text y="350" x="34" class="sec_one time so7">7</text>
    <text y="350" x="34" class="sec_one time so8">8</text>
    <text y="350" x="34" class="sec_one time so9">9</text>`);
}

function initTransitionStyles(prog){ //in seconds
    let style = "<style>";

    for(let i =0; i < 10; i++){
        style+=`.so${i}{
            animation-delay:-${(10-i)+prog}s;
            animation-name:seconds_one;
        }
        `
    }

    for(let i =0; i < 6; i++){
        style+=`.st${i}{
            animation-delay:-${((6-i)*10)+prog}s;
            animation-name:seconds_ten;
        }
        `
    }

    for(let i =0; i < 10; i++){
        style+=`.m${i}{
            animation-delay:-${((10-i)*60)+prog}s;
            animation-name:minutes;
        }
        `
    }

    style+="</style>"
    return style;
}

function getCurrentTime(prog){
    let m_end = Math.floor(prog/60);
    let seconds = prog%60;
    let s_ten = Math.floor(seconds/10);
    let s_one = Math.floor(seconds % 10);

    let style = 
    `<style>
        .m${m_end}{
            opacity:1;
        }
        .st${s_ten}{
            opacity:1;
        }
        .so${s_one}{
            opacity:1;
        }
    </style>`;

    return style;

}

function initPlayingIcon(p){
    return p ? `<rect height="16" width="4" y="345" x="150" stroke="#21ca1e" fill="#1bde18"></rect> <rect height="16" width="4" y="345" x="160" stroke="#21ca1e" fill="#1bde18"></rect>` :
    `<polygon points="150,344 150,362 165,353" style="fill:#696969;" />`
}

module.exports = {createSvg};

createSvg();
