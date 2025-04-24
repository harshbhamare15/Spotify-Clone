let currentSong = new Audio();
let songs;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs() {
    try {
        let response = await fetch("http://127.0.0.1:5500/song/");

        let text = await response.text();
        let div = document.createElement("div");
        div.innerHTML = text;
        let as = div.getElementsByTagName("a");
        let songs = [];

        for (let index = 0; index < as.length; index++) {
            const element = as[index];
            if (element.href.endsWith(".mp3")) {
                const fullPath = decodeURIComponent(element.getAttribute("href"));
                const fileName = fullPath.split("/").pop();
                songs.push(fileName);
            }

        }

        console.log("Fetched Songs:", songs);
        return songs;
    } catch (error) {
        console.error("Error fetching songs:", error);
        return [];
    }
}


const playMusic = (track, pause = false) => {
    let songUrl = `http://127.0.0.1:5500/song/${track}`;
    console.log("Playing:", songUrl);

    currentSong.src = songUrl;

    if (!pause) {
        currentSong.play()
            .then(() => {
                play.src = "pause.svg";
            })
            .catch(error => {
                console.error("Playback failed:", error);
            });
    }

    let songName = decodeURI(track).replace(/^.*[\\/]/, '');
    document.querySelector(".songinfo").innerHTML = songName;
    document.querySelector(".songtime").innerHTML = "00:00/00:00";
};


async function main() {
    songs = await getSongs();
    playMusic(songs[0], true)

    let songUL = document.querySelector(".songlist ul");
    if (!songUL) {
        console.error("Error: Song list UL not found");
        return;
    }

    songUL.innerHTML = "";

    for (const song of songs) {
        let songName = song.split("/").pop();
        let listItem = document.createElement("li");

        listItem.innerHTML = `
            <img class="invert" src="music.svg" alt="">
            <div class="info">
                <div>${songName.replaceAll("%20", " ")}</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="play.svg" alt="">
            </div>`;

        listItem.addEventListener("click", () => {
            playMusic(songName.trim());
        });

        songUL.appendChild(listItem);
    }
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "play.svg"
        }
    })

    currentSong.addEventListener("timeupdate", () => {
        console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        const seekbar = e.currentTarget.getBoundingClientRect();
        const percentage = ((e.clientX - seekbar.left) / seekbar.width) * 100;

        const circle = document.querySelector(".circle");
        circle.style.left = `${percentage}%`;

        document.querySelector(".circle").style.left = percentage + "%";
        currentSong.currentTime = (currentSong.duration) * (percentage) / 100
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    previous.addEventListener("click", () => {
        console.log("Previous clicked");

        let currentFile = decodeURIComponent(currentSong.src.split("/").pop());
        let index = songs.indexOf(currentFile);

        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }
    });

    next.addEventListener("click", () => {
        console.log("Next clicked");

        let currentFile = decodeURIComponent(currentSong.src.split("/").pop());
        let index = songs.indexOf(currentFile);

        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
    });

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
        console.log("Setting volume to", e.target.value, "/ 100")
        currentSong.volume = parseInt(e.target.value)/100
    })

}
main()