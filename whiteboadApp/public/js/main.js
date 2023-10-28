//ページ読込み時の処理
document.addEventListener("DOMContentLoaded", function () {
  const whiteboadId = localStorage.getItem("whiteboad_id");
  if (!whiteboadId) {
    localStorage.setItem("whiteboad_id", "");
  }
});

const form1 = document.getElementById("form1");
const updateHundler = async (e) => {
  e.preventDefault();
  const svgData = document.getElementById("helo").innerHTML;
  const whiteboadId = localStorage.getItem("whiteboad_id");
  //ホワイトボードの保存
  if (whiteboadId) {
    //ローカルストレージにIDがあれば既存のデータを更新する
    const response = await fetch(`/whiteboad/${whiteboadId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ svgData: svgData }),
    });
    const data = await response.json();
    console.log(data);
  } else {
    // ローカルストレージにIDがなければデータを新規作成
    const response = await fetch("/whiteboad", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // JSON形式のデータのヘッダー
      },
      body: JSON.stringify({ svgData: svgData }), // JSON形式のデータ
    });
    const data = await response.json();
    console.log(data);

    //編集しているホワイトボードのIDをローカルストレージへ保存する
    localStorage.setItem("whiteboad_id", data);
  }
  alert("保存しました！");
};

//読込みボタンを押したときの処理
form1.addEventListener("submit", updateHundler);

const form2 = document.getElementById("form2");
const readHunder = async (e) => {
  e.preventDefault();
  const whiteboadId = localStorage.getItem("whiteboad_id");
  //IDがなければ終了
  if (!whiteboadId) return;
  //svgを置き換える
  await fetch(`/read/${whiteboadId}`)
    .then((res) => {
      return res.json();
    })
    .then((obj) => {
      document.getElementById("helo").innerHTML = obj.svgData;
    })
    .catch((err) => {
      console.log(err);
    });
};
form2.addEventListener("submit", readHunder);
