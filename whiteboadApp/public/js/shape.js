const svg = document.getElementById("svg");

let count = 0;
//描画モード切り替え用
let drawMode = "";
//編集状態
let edit = false;

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
  textBoxMouseEvent(foreignObject);
  count++;
}

function textBoxMouseEvent(foreignObject) {
  //テキストボックスのイベント登録
  let dx = 0;
  let dy = 0;
  const textbox = d3.select("#svg").select("#" + foreignObject.id);

  const start = (event, d) => {
    //グループ化されている場合、発火しない
    if (textbox.node().parentNode.classList[0] == "groupObj") {
    }
    dx = Math.abs(Number(foreignObject.getAttribute("x")) - event.x);
    dy = Math.abs(Number(foreignObject.getAttribute("y")) - event.y);
    textbox.attr("x", event.x - dx).attr("y", event.y - dy);
  };

  const drag = (event, d) => {
    console.log(event.sourceEvent.target.parentNode);
    textbox.attr("x", event.x - dx).attr("y", event.y - dy);
  };

  //テキストボックスのドラッグ時の処理
  textbox.call(d3.drag().on("start", start).on("drag", drag));

  const div = foreignObject.firstChild;
  const svg = document.querySelector("#svg");

  //図形の外の領域をクリック
  svg.addEventListener("click", (e) => {
    if (e.target.id != "svg") return;

    div.style.cursor = "default";
    textbox.call(d3.drag().on("start", null).on("drag", null));
    drawMode = "";
  });

  //クリックされたときに編集状態に変更
  foreignObject.addEventListener("dblclick", (e) => {
    //図形の始点とマウス座標までの距離
    dx = e.offsetX;
    dx = e.offsetY;
    const g = textbox.node().parentNode;

    if (drawMode == "textbox") {
      div.style.cursor = "auto";
      div.setAttribute("contenteditable", true);
      div.focus();
      //テキストボックスのドラッグ時の処理
      textbox.call(d3.drag().on("start", start).on("drag", drag));
    } else {
      div.style.cursor = "auto";
      div.setAttribute("contenteditable", false);
      drawMode = "textbox";
    }
    //ドラッグの無効化
  });
}

//矢印を描画する
function arrow() {
  //矢印の描画
  let moveFlag = false;
  const paper = d3.select("#svg");
  let tmpX, tmpY;
  let arrow_endX, arrow_endY;

  // マウスダウンイベント
  paper.call(
    d3
      .drag()
      .on("start", (event, d) => {
        if (drawMode != "arrow") {
          return false;
        }

        // ページの左端から、要素の左端までの距離
        tmpX = event.x;
        // ページの上端から、要素の上端までの距離
        tmpY = event.y;
        //矢印の終点の距離
        arrow_endX = tmpX;
        arrow_endY = tmpY;

        const segs =
          "M" + " " + tmpX + " " + tmpY + " L " + arrow_endX + " " + arrow_endY;

        paper
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
        if (moveFlag) {
          arrow_endX = event.x;
          arrow_endY = event.y;
          const arrow = d3.select("#contentBox" + count);
          const segs =
            "M " + tmpX + " " + tmpY + " L " + arrow_endX + " " + arrow_endY;
          arrow.attr("d", segs);
          /*  console.log("tmpX: "+tmpX);
            console.log("tmpY: "+tmpY);
            console.log("endX: "+arrow_endX);
            console.log("endY: "+arrow_endY); */
        }
      })
      .on("end", () => {
        // マウスアップイベント
        // 矢印の周りに枠を作成する
        const group = paper
          .select("#contentBox" + count)
          .append("g")
          .attr("style", "blue")
          .attr("stroke", "black")
          .attr("strokeWeight", 2)
          .attr("id", "groupObj" + groupCnt)
          .attr("class", "groupObj contentBox");
        const arrow = d3.select("#contentBox" + count);
        const x = Math.min(tmpX, arrow_endX);
        const y = Math.min(tmpY, arrow_endY);
        const endX = Math.max(tmpX, arrow_endX);
        const endY = Math.max(tmpY, arrow_endY);

        group
          .append("rect")
          .attr("class", "contentBox")
          .attr("x", x)
          .attr("y", y)
          .attr("width", endX - x)
          .attr("height", endY - y)
          .attr("fill", "white")
          .attr("opacity", 0.7)
          .attr("strokeWidth", 1)
          .attr("stroke", "black");

        moveFlag = false;
        count++;
      })
  );
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
