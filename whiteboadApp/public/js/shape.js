const svg = document.getElementById("svg");

let count = 0;
//描画モード切り替え用
let drawMode = "";
//編集状態
let edit = false;
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
    .attr("id", "contentBox" + count)
    .attr("class", "contentBox")
    .attr("fill", "white")
    .attr("stroke", "black")
    .attr("x", event.x - width / 2)
    .attr("y", event.y - height / 2)
    .attr("width", width)
    .attr("height", height);
  //ドラッグ可能にする
  shapeDragEvent(rect);
  count++;
}

// 円の描画
function displayToCircle() {
  const svg = d3.select("#svg");
  const r = 50;
  const circle = svg
    .append("circle")
    .attr("id", "contentBox" + count)
    .attr("class", "contentBox circle")
    .attr("fill", "white")
    .attr("stroke", "black")
    .attr("cx", event.x)
    .attr("cy", event.y)
    .attr("r", r);
  //ドラッグ可能にする
  shapeDragEvent(circle);
  count++;
}

//矢印の座標を取得する
function getArrowPos(segs) {
  const words = segs.split(" ");
  const result = { x: 0, y: 0, endX: 0, endY: 0 };
  result.x = Number(words[1]);
  result.y = Number(words[2]);
  result.endX = Number(words[4]);
  result.endY = Number(words[5]);
  return result;
}
//矢印を描画する
function displayToArrow() {
  const svg = d3.select("#svg");
  let moveFlag = false;
  let tmpX, tmpY;
  let arrow_endX, arrow_endY;
  svg.call(
    d3
      .drag()
      .on("start", (event) => {
        if (drawMode != "arrow") {
          return false;
        }

        tmpX = event.x;
        tmpY = event.y;
        arrow_endX = tmpX;
        arrow_endY = tmpY;

        const segs =
          "M " + tmpX + " " + tmpY + " L " + arrow_endX + " " + arrow_endY;

        //矢印のg要素
        const group = svg
          .append("g")
          .attr("style", "blue")
          .attr("stroke", "black")
          .attr("strokeWeight", 2)
          .attr("id", "contentBox" + count)
          .attr("class", "groupObj contentBox");

        // 矢印を囲む枠
        group
          .append("rect")
          .attr("class", "arrow_frame")
          .attr("fill", "white")
          .attr("opacity", 0.7)
          .attr("strokeWidth", 1)
          .attr("stroke", "black");

        // 矢印
        group
          .append("path")
          .attr("d", segs)
          .attr("stroke", "black")
          .attr("strokeWeight", 1)
          .attr("class", "arrow")
          .attr("marker-end", "url(#m_atr)");

        moveFlag = true;
      })
      .on("drag", (event) => {
        if (drawMode != "arrow") return false;
        if (moveFlag) {
          arrow_endX = event.x;
          arrow_endY = event.y;
          const group = d3.select("#contentBox" + count);
          const arrow = group.select(".arrow");
          const segs =
            "M " + tmpX + " " + tmpY + " L " + arrow_endX + " " + arrow_endY;
          arrow.attr("d", segs);

          //矢印の枠の設定
          const arrow_frame = group.select(".arrow_frame");
          const x = Math.min(tmpX, arrow_endX);
          const y = Math.min(tmpY, arrow_endY);
          const width = Math.abs(arrow_endX - tmpX);
          const height = Math.abs(arrow_endY - tmpY);
          arrow_frame
            .attr("x", x)
            .attr("y", y)
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "white")
            .attr("opacity", 0.7)
            .attr("strokeWidth", 1)
            .attr("stroke", "black");
        }
      })
      .on("end", () => {
        if (drawMode != "arrow") {
          return false;
        }
        const group = d3.select("#contentBox" + count);
        const arrow_frame = group.select(".arrow_frame");
        const x = Math.min(tmpX, arrow_endX);
        const y = Math.min(tmpY, arrow_endY);
        const width = Math.abs(arrow_endX - tmpX);
        const height = Math.abs(arrow_endY - tmpY);

        //矢印の枠を設定する
        arrow_frame
          .attr("x", x)
          .attr("y", y)
          .attr("width", width)
          .attr("height", height)
          .attr("opacity", 0.7);
        arrowMouseEvent(group);
        moveFlag = false;
        groupCnt++;
        count++;
      })
  );
}

//矢印のマウスイベント登録
function arrowMouseEvent(arrow) {
  const drag = (event) => {
    //矢印の移動：矢印が移動しない
    //現時点の矢印の始点と終点の座標
    const seg = getArrowPos(arrow.select(".arrow").attr("d"));
    const x = seg.x + event.dx;
    const y = seg.y + event.dy;
    const d = `M ${x} ${y} L ${seg.endX + event.dx} ${seg.endY + event.dy}`;
    arrow.select(".arrow").attr("d", d);
    arrow
      .select(".arrow_frame")
      .attr("x", Number(arrow.select(".arrow_frame").attr("x")) + event.dx)
      .attr("y", Number(arrow.select(".arrow_frame").attr("y")) + event.dy);
  };

  //グループをドラッグした時の処理
  arrow.call(d3.drag().on("drag", drag));

  //矢印の枠
  const frame = arrow.select(".arrow_frame");
  //ダブルクリックした時の処理
  arrow.on("dblclick", () => {
    //グループ化の枠を表示する
    frame.attr("opacity", 0.7);
    arrow.call(
      d3
        .drag()
        .on("drag", drag)
        .on("end", () => {})
    );
  });

  //図形の外をクリックした際の処理
  svg.addEventListener("click", (e) => {
    frame.attr("opacity", 0);
    arrow.call(d3.drag().on("drag", null));
  });

  clickEventHundler(arrow.node());
}

//画像・文章の描画
//テキストボックスを描画する
function displayToTextbox(e) {
  const svg = document.querySelector("#svg");
  const foreignObject = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "foreignObject"
  );
  const r = svg.getBoundingClientRect();
  const x = Math.round(e.clientX - r.left);
  const y = Math.round(e.clientY - r.top);
  const div = document.createElement("div");
  setAttributes(foreignObject, {
    id: "contentBox" + count,
    class: "contentBox",
    x: x,
    y: y,
    width: 100,
    height: 100,
  });
  div.setAttribute("contenteditable", false);
  div.textContent = " ";
  foreignObject.appendChild(div);
  svg.appendChild(foreignObject);
  const textbox = d3.select("#"+foreignObject.id);
  textBoxMouseEvent(textbox);
  count++;
}

//テキストボックスのイベント登録
function textBoxMouseEvent(textbox) {
  //ドラッグ可能にする
  const svg = d3.select("#svg");
  const div = textbox.select("div").node();
  //図形の外の領域をクリック
  svg.on("click", (e) => {
    if (e.target.id != "svg") return;
    IsClickArray = [];
    div.style.cursor = "default";
    textbox.call(d3.drag().on("start", null).on("drag", null));
  });

  //ダブルクリックされた時の処理
  textbox.on("dblclick", (event) => {
    //図形の始点とマウス座標までの距離
    dx = event.dx;
    dy = event.dx;

    if (drawMode == "textbox") {
      console.log(div);
      div.style.cursor = "auto";
      div.setAttribute("contenteditable", true);
      div.focus();
      //テキストボックスのドラッグ時の処理
      shapeDragEvent(textbox);
    } else {
      div.style.cursor = "auto";
      div.setAttribute("contenteditable", false);
      //クリックされたときに編集状態に変更
      drawMode = "textbox";
    }
    //ドラッグの無効化
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
  div.innerHTML = `<form id="form${count}">
    <input id="input${count}" type="file" style="margin-bottom:15px;  accept="image/*"></input>
    <input type="submit"></input>
  </form>`;

  setAttributes(div, { class: "contentBox" });
  setAttributes(foreignObject, {
    id: "contentBox" + count,
    class: "contentBox",
    x: x,
    y: y,
    width: 100,
    height: 100,
  });
  foreignObject.appendChild(div);
  svg.appendChild(foreignObject);
  uploadImg(x, y);
  count++;
}

//画像ファイルをアップロードしたときの処理
function uploadImg(x, y) {
  const formRef = document.querySelector(`#form${count}`);
  const inputRef = document.querySelector(`#input${count}`);
  let dx = 0;
  let dy = 0;
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

    const image = d3
      .select("#svg")
      .append("image")
      .attr("id", "contentBox" + count)
      .attr("class", "contentBox")
      .attr("href", data.imagePath)
      .attr("x", x)
      .attr("y", y);

    //ドラッグ可能にする
    shapeDragEvent(image);
    svg.removeChild(foreignObject);
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
