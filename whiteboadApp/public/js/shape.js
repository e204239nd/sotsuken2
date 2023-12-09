const svg = document.getElementById("svg");

let count = 0;
//描画モード切り替え用
let drawMode = "";
//編集状態
let edit = false;
//基本図形の描画
let dx = 0;
let dy = 0;

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

//図形のイベント登録
function shapeDragEvent(shape) {
  const start = (event, d) => {
    debugFunc(shape.attr("id"));

    if (shape.attr("cx")) {
      dx = Math.abs(Number(shape.attr("cx") - event.x));
      dy = Math.abs(Number(shape.attr("cy") - event.y));
    } else {
      dx = Math.abs(Number(shape.attr("x") - event.x));
      dy = Math.abs(Number(shape.attr("y") - event.y));
    }
  };

  const drag = (event, d) => {
    if (shape.attr("cx")) {
      shape.attr("cx", event.x - dx).attr("cy", event.y - dy);
    } else {
      shape.attr("x", event.x - dx / 2).attr("y", event.y - dy / 2);
    }
  };

  const end = () => {
    const groupId = shape.node().parentNode.id;
    const group = d3.select("#" + groupId);
    //グループ図形（矢印以外）は枠の大きさを変更する
    if (!group.empty()) {
      setFrameSize(group);
    }
  };
  //テキストボックスのドラッグ時の処理
  shape.call(d3.drag().on("start", start).on("drag", drag).on("end", end));
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
      .on("start", (event, d) => {
        if (drawMode != "arrow") {
          return false;
        }

        tmpX = event.x;
        tmpY = event.y;
        arrow_endX = tmpX;
        arrow_endY = tmpY;

        const segs =
          "M " + tmpX + " " + tmpY + " L " + arrow_endX + " " + arrow_endY;
        const group = svg
          .append("g")
          .attr("style", "blue")
          .attr("stroke", "black")
          .attr("strokeWeight", 2)
          .attr("id", "groupObj" + groupCnt)
          .attr("class", "groupObj contentBox");

        group
          .append("rect")
          .attr("class", "group_frame")
          .attr("fill", "white")
          .attr("opacity", 0.7)
          .attr("strokeWidth", 1)
          .attr("stroke", "black");

        group
          .append("path")
          .attr("d", segs)
          .attr("id", "contentBox" + count)
          .attr("stroke", "black")
          .attr("strokeWeight", 1)
          .attr("class", "arrow")
          .attr("marker-end", "url(#m_atr)");

        moveFlag = true;
      })
      .on("drag", (event, d) => {
        if (drawMode != "arrow") return false;
        if (moveFlag) {
          arrow_endX = event.x;
          arrow_endY = event.y;
          const arrow = d3.select("#contentBox" + count);
          const segs =
            "M " + tmpX + " " + tmpY + " L " + arrow_endX + " " + arrow_endY;
          arrow.attr("d", segs);

          //矢印の枠の設定
          const group = d3.select("#" + arrow.node().parentNode.id);
          const x = Math.min(tmpX, arrow_endX);
          const y = Math.min(tmpY, arrow_endY);
          const width = Math.abs(arrow_endX - tmpX);
          const height = Math.abs(arrow_endY - tmpY);
          group
            .select(".group_frame")
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
        const group = svg.select("#groupObj" + groupCnt);
        const x = Math.min(tmpX, arrow_endX);
        const y = Math.min(tmpY, arrow_endY);
        const width = Math.abs(arrow_endX - tmpX);
        const height = Math.abs(arrow_endY - tmpY);

        group
          .select(".group_frame")
          .attr("x", x)
          .attr("y", y)
          .attr("width", width)
          .attr("height", height)
          .attr("opacity", 0);
        shapeDragEvent(group);
        groupEvent(group);
        moveFlag = false;
        groupCnt++;
        count++;
      })
  );
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
  const textbox = d3.select("#contentBox" + count);
  textBoxMouseEvent(textbox);
  count++;
}

//テキストボックスのイベント登録
function textBoxMouseEvent(textbox) {
  //ドラッグ可能にする
  shapeDragEvent(textbox);
  const div = textbox.node().firstChild;
  const svg = document.querySelector("#svg");

  //図形の外の領域をクリック
  svg.addEventListener("click", (e) => {
    if (e.target.id != "svg") return;
    IsClickArray = [];
    div.style.cursor = "default";
    textbox.call(d3.drag().on("start", null).on("drag", null));
  });

  textbox.on("dblclick", (event, d) => {
    //図形の始点とマウス座標までの距離
    dx = event.dx;
    dy = event.dx;
    console.log(dx);
    if (drawMode == "textbox") {
      div.style.cursor = "auto";
      div.setAttribute("contenteditable", true);
      div.focus();
      //テキストボックスのドラッグ時の処理
      shapeDragEvent(textbox);
    } else {
      div.style.cursor = "auto";
      div.setAttribute("contenteditable", false);
      drawMode = "textbox";
    }
    //ドラッグの無効化
  });
  // foreignObject.addEventListener("click")
  //クリックされたときに編集状態に変更
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
