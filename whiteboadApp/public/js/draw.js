const svg = document.getElementById("svg");

let count = 0;
//描画モード切り替え用
let drawMode = "";

document.addEventListener("DOMContentLoaded", () => {
  //テキストボックスメニューがドラッグされているとき

  const imgBox_menu = document.getElementById("imgBox_menu");
  const textBox_menu = document.getElementById("textBox_menu");
  const arrow_menu = document.getElementById("arrow_menu");
  imgBox_menu.addEventListener("dragstart", () => (drawMode = "imgbox"));
  imgBox_menu.addEventListener("dragend", displayToImgbox);
  textBox_menu.addEventListener("dragstart", () => (drawMode = "textbox"));
  textBox_menu.addEventListener("dragend", displayToTextbox);
  arrow_menu.addEventListener("click", () => (drawMode = "arrow"));
  arrow();
});

//テキストボックスを表示する
function displayToTextbox(e) {
  const foreignObject = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "foreignObject"
  );
  const r = svg.getBoundingClientRect();
  const x = Math.round(e.clientX - r.left);
  const y = Math.round(e.clientY - r.top);
  const textarea = document.createElement("textarea");
  setAttributes(foreignObject, {
    id: "contentBox" + count,
    x: x,
    y: y,
    width: 100,
    height: 100,
  });
  textarea.setAttribute("placeholder", "文字を入力してください");
  foreignObject.appendChild(textarea);
  svg.appendChild(foreignObject);
  count++;
}

//画像を挿入するためのボックスを表示する
function displayToImgbox(e) {
  
  const foreignObject = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "foreignObject"
  );
  const div = document.createElement("div");
  const r = svg.getBoundingClientRect();
  const x = Math.round(e.clientX - r.left);
  const y = Math.round(e.clientY - r.top);
  div.innerHTML = `<form id="form${count}">
  <input id="input${count}" type="file" style="margin-bottom:15px;  accept="image/*"></input>
  <input type="submit"></input>
</form>`;

  setAttributes(div, { id: "contentBox" });
  setAttributes(foreignObject, {
    id: "contentBox" + count,
    x: x,
    y: y,
    width: 100,
    height: 100,
  });
  foreignObject.appendChild(div);
  svg.appendChild(foreignObject);
  //画像ファイルをアップロードしたときの処理
  const formRef = document.querySelector(`#form${count}`);
  const inputRef = document.querySelector(`#input${count}`);
  const submitHundler = async (e) => {
    e.preventDefault();
    const file = inputRef.files[0];
    const formData = new FormData();
    formData.append("img", file);

    const response = await fetch("/upload", {
      method: "POST",
      body: formData,
    });

    // サーバからのレスポンスをJSONとしてパース
    const data = await response.json();

    // アップロード成功のメッセージをアラートで表示
    alert("画像をアップロードしました");

    //画像の挿入
    const image = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "image"
    );
    setAttributes(image, {
      id: "contentBox" + count,
      href: data.imagePath,
      x: x,
      y: y,
    });
    svg.removeChild(foreignObject);
    svg.appendChild(image);
    count++;
  };
  formRef.addEventListener("submit", submitHundler);

  count++;
}

//要素の属性を一括で設定する
function setAttributes(element, attributes) {
  const arr = Object.entries(attributes);
  arr.forEach(function ([attribute, value]) {
    element.setAttribute(attribute, value);
  });
}

let tmpX, tmpY;
function arrow() {
  const svg = document.querySelector("#svg");
  let segs = [];
  let px, py;
  let arrow_endX, arrow_endY;
  svg.addEventListener("mousedown", (e) => {
    if (drawMode != "arrow") {
      return false;
    }
    const clientRect = e.target.getBoundingClientRect();
    // ページの左端から、要素の左端までの距離
    px = e.offsetX;
    // ページの上端から、要素の上端までの距離
    py = e.offsetY;

    const paper = Snap("#svg");
    arrow_endX = px + 1;
    arrow_endY = py;
    segs = [
      ["M", px, py],
      ["L", arrow_endX, arrow_endY],
    ];

    //   debugFunc("x:" + px + " y:" + py);
    //矢印の描画

    let moveFlag = false;
    let arrow;
    let tmpX, tmpY;
    // マウスダウンイベント
    paper.mousedown(function (e) {
      if (drawMode != "arrow") {
      return false;
    }
      moveFlag = true;
      tmpX = e.offsetX;
      tmpY = e.offsetY;
      arrow = paper.path("M " + e.offsetX + " " + e.offsetY);
      paper.attr({ stroke: "black", strokeWeight: 1, id: "arrow" });
      // debugFunc("マウスダウン");
    });

    // マウスムーブイベント
    paper.mousemove(function (e) {
      if (moveFlag) {
        var d = "M " + tmpX + " " + tmpY + " L " + e.offsetX + " " + e.offsetY;
        arrow.attr({ d: d });
        const arrowElem = document.querySelector("#arrow");
        arrowElem.setAttribute("marker-end", "url(#m_atr)");
      }
      // debugFunc("マウスムーブ");
    });

    // マウスアップイベント
    paper.mouseup(function () {
      moveFlag = false;
      // debugFunc("マウスアップ");
    });
  });
}
