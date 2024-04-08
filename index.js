const { Player, stringToDataUrl } = TextAliveApp;

// TextAlive Player を初期化
const player = new Player({
  // トークンは https://developer.textalive.jp/profile で取得したものを使う
  app: { token: "Z4LYBUot8J41BZOH" },
  mediaElement: document.querySelector("#media"),
  mediaBannerPosition: "bottom right",
  vocalAmplitudeEnabled: true,  //声量情報を取得します．

  // オプション一覧
  // https://developer.textalive.jp/packages/textalive-app-api/interfaces/playeroptions.html
});

const overlay = document.querySelector("#overlay");
const textContainer = document.querySelector("#text");
const seekbar = document.querySelector("#seekbar");
const paintedSeekbar = seekbar.querySelector("div");
const bito_info = document.getElementById("bito");//ビート情報書くとこ
const kodoshinko = document.getElementById("kodo");//コード進行書くとこ
const sabi_info = document.getElementById("sabi");//サビかどうか書くとこ
const seiryo = document.getElementById("seiryo");
let c;
let beat_bf = null; //一個前のビート進行
let chord_bf = null; //一個前のコード進行
let chorus_bf = null; //一個前のサビか
let voice_size_bf = null; //一個前声量

player.addListener({
  /* APIの準備ができたら呼ばれる */
  onAppReady(app) {
    if (app.managed) {
      document.querySelector("#control").className = "disabled";
    }
    if (!app.songUrl) {
      document.querySelector("#media").className = "disabled";

      // フューチャーノーツ / shikisai
    //   player.createFromSongUrl("https://piapro.jp/t/XiaI/20240201203346", {
    //     video: {
    //       // 音楽地図訂正履歴
    //        beatId: 4592297,
    //        chordId: 2727637,
    //        repetitiveSegmentId: 2824328,
    //        // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FXiaI%2F20240201203346
    //        lyricId: 59417,
    //        lyricDiffId: 13964
    //      },
    //    });
    
      // いつか君と話したミライは / タケノコ少年
      player.createFromSongUrl("https://piapro.jp/t/--OD/20240202150903", {
        video: {
          // 音楽地図訂正履歴
           beatId: 4592296,
           chordId: 2727636,
           repetitiveSegmentId: 2824327,
           // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2F--OD%2F20240202150903
           lyricId: 59416,
           lyricDiffId: 13963
         },
       });

      // SUPERHERO / めろくる
    //   player.createFromSongUrl("https://piapro.jp/t/hZ35/20240130103028", {
    //     video: {
    //       // 音楽地図訂正履歴
    //       beatId: 4592293,
    //       chordId: 2727635,
    //       repetitiveSegmentId: 2824326,
    //       // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FhZ35%2F20240130103028
    //       lyricId: 59415,
    //       lyricDiffId: 13962
    //     }
    //   });
    }
  },

  /* 楽曲が変わったら呼ばれる */
  onAppMediaChange() {
    // 画面表示をリセット
    overlay.className = "";
    resetChars();
  },

  /* 楽曲情報が取れたら呼ばれる */
  onVideoReady(video) {
    // 楽曲情報を表示
    document.querySelector("#artist span").textContent =
      player.data.song.artist.name;
    document.querySelector("#song span").textContent = player.data.song.name;

    // 最後に表示した文字の情報をリセット
    c = null;
  },

  /* 再生コントロールができるようになったら呼ばれる */
  onTimerReady() {
    overlay.className = "disabled";
    document.querySelector("#control > a#play").className = "";
    document.querySelector("#control > a#stop").className = "";
  },

  /* 再生位置の情報が更新されたら呼ばれる */
  onTimeUpdate(position) {
    // シークバーの表示を更新
    paintedSeekbar.style.width = `${
      parseInt((position * 1000) / player.video.duration) / 10
    }%`;

    // 現在のビート情報を取得
    let beat = player.findBeat(position);
    if (beat_bf !== beat) {
      if (beat) {
        // console.log(beat.length);
        // console.log(beat.position);
        bito_info.textContent = "ビート : " + beat.position + "/" + beat.length;
      }
      beat_bf = beat;
    }

    // コードの取得
    let chord = player.findChord(position);
    // console.log(chord.name);
    if (chord_bf != chord) {
      kodoshinko.textContent = "コード : " + chord.name;
      chord_bf = chord;
    }
    // サビの取得
    let chorus = player.findChorus(position);
    if (chorus_bf != chorus) {
      if (!chorus) {
        sabi_info.textContent = "サビじゃない..";
      }
      else{
        sabi_info.textContent = "サビキタ！！";
      }
      chorus_bf = chorus;
      // console.log(chorus);
    }

    // 音量の取得
    let max_voice_size = player.getMaxVocalAmplitude();
    let voice_base =  max_voice_size / 10;
    let voice_size = player.getVocalAmplitude(position);
    voice_size = Math.floor(voice_size / voice_base);
    if (voice_size_bf !=voice_size) {
      switch (voice_size) {
        case 0:
          seiryo.textContent = "＊";
          // console.log("0");
          break;
        case 1:
          seiryo.textContent = "＊＊";
          // console.log("1");
          break;
        case 2:
          seiryo.textContent = "＊＊＊";
          // console.log("2");
          break;
        case 3:
          seiryo.textContent = "＊＊＊＊";
          // console.log("3");
          break;
        case 4:
          seiryo.textContent = "＊＊＊＊＊";
          // console.log("4");
          break;
        case 5:
          seiryo.textContent = "＊＊＊＊＊＊";
          // console.log("5");
          break;
        case 6:
          seiryo.textContent = "＊＊＊＊＊＊＊";
          // console.log("6");
          break;
        case 7:
          seiryo.textContent = "＊＊＊＊＊＊＊＊";
          // console.log("7");
          break;
        case 8:
          seiryo.textContent = "＊＊＊＊＊＊＊＊＊";
          // console.log("8");
          break;
        default:
          seiryo.textContent = "＊＊＊＊＊＊＊＊＊＊";
          console.log("big");
          break;
      }
      voice_size_bf = voice_size;
    }
    // if (chorus_bf != chorus) {
    //   if (!chorus) {
    //     sabi_info.textContent = "サビじゃない..";
    //   }
    //   else{
    //     sabi_info.textContent = "サビキタ！！";
    //   }
    //   chorus_bf = chorus;
    //   // console.log(chorus);
    // }

    // 歌詞情報がなければこれで処理を終わる
    if (!player.video.firstChar) {
      return;
    }

    // 巻き戻っていたら歌詞表示をリセットする
    if (c && c.startTime > position + 1000) {
      resetChars();
    }

    // 500ms先に発声される文字を取得
    let current = c || player.video.firstChar;
    while (current && current.startTime < position + 500) {
      // 新しい文字が発声されようとしている
      if (c !== current) {
        newChar(current);
        c = current;
      }
      current = current.next;
    }
  },

  /* 楽曲の再生が始まったら呼ばれる */
  onPlay() {
    const a = document.querySelector("#control > a#play");
    while (a.firstChild) a.removeChild(a.firstChild);
    a.appendChild(document.createTextNode("▷"));
  },

  /* 楽曲の再生が止まったら呼ばれる */
  onPause() {
    const a = document.querySelector("#control > a#play");
    while (a.firstChild) a.removeChild(a.firstChild);
    a.appendChild(document.createTextNode("\uf144"));
  }
});

/* 再生・一時停止ボタン */
document.querySelector("#control > a#play").addEventListener("click", (e) => {
  e.preventDefault();
  if (player) {
    if (player.isPlaying) {
      player.requestPause();
    } else {
      player.requestPlay();
    }
  }
  return false;
});

/* 停止ボタン */
document.querySelector("#control > a#stop").addEventListener("click", (e) => {
  e.preventDefault();
  if (player) {
    player.requestStop();

    // 再生を停止したら画面表示をリセットする
    bar.className = "";
    resetChars();
  }
  return false;
});

/* シークバー */
seekbar.addEventListener("click", (e) => {
  e.preventDefault();
  if (player) {
    player.requestMediaSeek(
      (player.video.duration * e.offsetX) / seekbar.clientWidth
    );
  }
  return false;
});

/**
 * 新しい文字の発声時に呼ばれる
 * Called when a new character is being vocalized
 */
function newChar(current) {
  // 品詞 (part-of-speech)
  // https://developer.textalive.jp/packages/textalive-app-api/interfaces/iword.html#pos
  const classes = [];
  if (
    current.parent.pos === "N" ||
    current.parent.pos === "PN" ||
    current.parent.pos === "X"
  ) {
    classes.push("noun");
  }

  // フレーズの最後の文字か否か
  if (current.parent.parent.lastChar === current) {
    classes.push("lastChar");
  }

  // 英単語の最初か最後の文字か否か
  if (current.parent.language === "en") {
    if (current.parent.lastChar === current) {
      classes.push("lastCharInEnglishWord");
    } else if (current.parent.firstChar === current) {
      classes.push("firstCharInEnglishWord");
    }
  }

  // noun, lastChar クラスを必要に応じて追加
  const div = document.createElement("span");
  div.appendChild(document.createTextNode(current.text));

  // 文字を画面上に追加
  const container = document.createElement("span");
  container.className = classes.join(" ");
  container.appendChild(div);
  container.addEventListener("click", () => {
    player.requestMediaSeek(current.startTime);
  });
  textContainer.appendChild(container);
}

/**
 * 歌詞表示をリセットする
 * Reset lyrics view
 */
function resetChars() {
  c = null;
  while (textContainer.firstChild)
    textContainer.removeChild(textContainer.firstChild);
}
