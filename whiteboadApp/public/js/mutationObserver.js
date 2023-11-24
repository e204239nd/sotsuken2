

function mutationObserver() {
  // 変更を監視するノードを選択
const targetNode = document.getElementById("svg");

// (変更を監視する) オブザーバーのオプション
const config = { attributes: true, childList: true, subtree: true };

// 変更が発見されたときに実行されるコールバック関数
const callback = function (mutationsList, observer) {
  // Use traditional 'for loops' for IE 11
  for (const mutation of mutationsList) {
    if (mutation.type === "childList") {
      console.log("A child node has been added or removed.");
    } else if (mutation.type === "attributes") {
      console.log("The " + mutation.attributeName + " attribute was modified.");
    }
  }
};

// コールバック関数に結びつけられたオブザーバーのインスタンスを生成
const observer = new MutationObserver(callback);

// 対象ノードの設定された変更の監視を開始
observer.observe(targetNode, config);

// その後で、監視を停止することができる
observer.disconnect();

}

function textBoxEvent() {

  //テキストボックスのイベント登録
  let dx = 0;
  let dy = 0;
  const textbox = d3.select("#svg").select(foreignObject.id);
  console.log(textbox);
  document.querySelector("p").textContent = textbox;
  const start = (event, d) => {
    dx = Math.abs(Number(foreignObject.getAttribute("x")) - event.x);
    dy = Math.abs(Number(foreignObject.getAttribute("y")) - event.y);
    textbox.attr("x", event.x - dx).attr("y", event.y - dy);
  };
  const drag = (event, d) => {
    console.log(
      "x: " +
      e.target.getAttribute("x") +
      "y: " +
      e.target.getAttribute("y") +
      "\n" +
      "event.x: " +
      event.x +
      " event.y: " +
      event.y +
      (Number(e.target.getAttribute("x")) - event.x) +
      "y - event.y:" +
      (Number(e.target.getAttribute("y")) - event.y)
    );
    textbox.attr("x", event.x - dx).attr("y", event.y - dy);
  };

  //テキストボックスのドラッグ時の処理
  textbox.on("start", start).on("drag", drag);

  //図形以外の領域をクリックすると編集状態をfalseへ
  svg.addEventListener("mousedown", () => {
    div.style.cursor = "default";
    //ドラッグの無効化
    textbox.call(d3.drag().on("drag", null));
    drawMode = "";
  });

  //クリックされたときに編集状態に変更
  foreignObject.addEventListener("dblclick", (e) => {
    //図形の始点とマウス座標までの距離
    // dx = e.offsetX;
    // dx = e.offsetY;
    if (drawMode == "textbox") {
      div.style.cursor = "auto";
    } else {
      textbox.call(d3.drag().on("drag", null));
      div.style.cursor = "auto";
      drawMode = "textbox";
    }
    //ドラッグの無効化
  });
}
