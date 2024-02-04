//図形の描画を行う
let count = 0;
//描画モード切り替え用
let drawMode = null;

//操作の状態
let opeStatus = null;

//基本図形の描画
let dx = 0;
let dy = 0;
// 四角の描画
function displayToRect() {
  const svg = d3.select("#svg");
  const width = 100;
  const height = 100;
  const rect = svg
    .append("rect")
    .attr("class", "contentBox")
    .attr("fill", "white")
    .attr("stroke", "black")
    .attr("x", event.x - width / 2)
    .attr("y", event.y - height / 2)
    .attr("width", width)
    .attr("height", height);

  //ドラッグ可能にする
  shapeDragEvent(rect);
  ContentBoxInc("contentBox");
}

// 円の描画
function displayToCircle() {
  const svg = d3.select("#svg");
  const r = 50;
  const circle = svg
    .append("circle")
    .attr("class", "contentBox")
    .attr("fill", "white")
    .attr("stroke", "black")
    .attr("cx", event.x)
    .attr("cy", event.y)
    .attr("r", r);
    ContentBoxInc("contentBox");  
  //ドラッグ可能にする
  shapeDragEvent(circle);
  
  
}



//画像・文章の描画
//テキストボックスを描画する
function displayToTextbox(e) {
  // SVG要素の位置とサイズを取得
  const svg = d3.select("#svg");
  const r = svg.node().getBoundingClientRect();
  // マウスの座標を計算
  const x = Math.round(e.clientX - r.left);
  const y = Math.round(e.clientY - r.top);
  // foreignObject要素を作成
  const foreignObject = svg
    .append("foreignObject")
    .attr("class", "contentBox")
    .attr("x", x)
    .attr("y", y)
    .attr("width", 100)
    .attr("height", 100);
// 図形のインクリメントを付け直す
ContentBoxInc("contentBox");

    
  // div要素を作成
  const div = foreignObject
    .append("xhtml:div")
    .attr("contenteditable", false)
    .text(" ");
  // テキストボックスのイベントを登録
  textBoxMouseEvent(foreignObject);
  
}

//テキストボックスのイベント登録
function textBoxMouseEvent(textbox) {
  const svg = d3.select("#svg");
  const div = textbox.select("div").node();
  //ダブルクリックされた時の処理

  textbox.on("dblclick", (event) => {
    //図形の始点とマウス座標までの距離
    dx = event.dx;
    dy = event.dx;

    if (drawMode == "textbox") {
      // divの文章を編集可能にする
      div.style.cursor = "auto";
      div.setAttribute("contenteditable", true);
      div.focus();
      //テキストボックスをドラッグ可能にする
      shapeDragEvent(textbox);
    } else {
      div.style.cursor = "auto";
      div.setAttribute("contenteditable", false);
      //クリックされたときに編集状態に変更
      drawMode = "textbox";
    }
  });

  //図形の外の領域をクリックした時の処理
  svg.on("click", (e) => {
    //ドラッグの無効化
    if (e.target.id == "svg") {
      IsClickArray = [];
      div.style.cursor = "default";
      textbox.call(d3.drag().on("start", null).on("drag", null));
    }
  });

  shapeDragEvent(textbox);
}

//画像を挿入するための図形を表示する
function displayToImgbox(e) {
  const foreignObject = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "foreignObject"
  );
  const div = document.createElement("div");
  const r = svg.getBoundingClientRect();
  const x = Math.round(e.clientX - r.left);
  const y = Math.round(e.clientY - r.top);
  div.innerHTML = `<form class="form" method="POST">
    <input class="input" type="file" style="margin-bottom:15px; name="img"  accept="image/*"></input>
    <input type="submit"></input>
  </form>`;

  setAttributes(foreignObject, {
    class: "image contentBox",
    x: x,
    y: y,
    width: 100,
    height: 100,
  });
  foreignObject.appendChild(div);
  svg.appendChild(foreignObject);
  ContentBoxInc("image");
  uploadImg(x, y,foreignObject);
  
}

//画像ファイルをアップロードしたときの処理
function uploadImg(x, y,foreignObject) {
  const imageForm = foreignObject;
  const formRef = foreignObject.querySelector(".form");
  const inputRef = formRef.querySelector(".input");
  const submitHundler = async (e) => {
    e.preventDefault();
    const file = inputRef.files[0];
    const formData = new FormData();
    formData.append("img", file);
    console.log(formData);
    const response = await fetch("upload", {
      method: "POST",
      body: formData,
    });

    // サーバからのレスポンスをJSONとしてパース
    const data = await response.json();

    // アップロード成功のメッセージをアラートで表示
    alert("画像をアップロードしました");

    //画像の挿入

    const image = d3
      .select("#svg")
      .append("image")
      .attr("id", foreignObject.id)
      .attr("class", "contentBox")
      .attr("href", data.imagePath)
      .attr("x", x)
      .attr("y", y);

    //ドラッグ可能にする
    shapeDragEvent(image);
    svg.removeChild(imageForm);
    svg.appendChild(image.node());
  };
  formRef.addEventListener("submit", submitHundler);
}

//要素の属性を一括で設定する
function setAttributes(element, attributes) {
  const arr = Object.entries(attributes);
  arr.forEach(function ([attribute, value]) {
    element.setAttribute(attribute, value);
  });
}
// デバッグ画面を表示
function debugFunc(str) {
  const debugTxt = document.querySelector("#debug");
  debugTxt.textContent = str;
}
