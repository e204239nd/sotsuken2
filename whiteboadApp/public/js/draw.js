const svg = document.getElementById("svg");

let count = 0;
//描画モード切り替え用
let drawMode = "";
//編集状態
let edit = false;

document.addEventListener("DOMContentLoaded", () => {
  //テキストボックスメニューがドラッグされているとき-
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
      .on("start", (event,d) => {
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
          .attr("stroke","black")
          .attr("strokeWeight",1)
          .attr("class", "arrow")
          .attr("marker-end", "url(#m_atr)");
          moveFlag=true;
      })
      .on("drag", (event,d) => {
        if (moveFlag) {
          arrow_endX = event.x;
          arrow_endY = event.y;
         
          const segs =
            "M " + tmpX + " " + tmpY + " L " + arrow_endX + " " + arrow_endY;
          d3.select("#contentBox"+count).attr("d", segs);
          /*  console.log("tmpX: "+tmpX);
          console.log("tmpY: "+tmpY);
          console.log("endX: "+arrow_endX);
          console.log("endY: "+arrow_endY); */
        }
      })
      .on("end", ()=> {
        // マウスアップイベント
        moveFlag = false;
        count++;
      })
  );
}


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
    class: "content",
    x: x,
    y: y,
    width: 100,
    height: 100,
  });
  div.setAttribute("contenteditable", true);
  div.textContent = " ";
  foreignObject.appendChild(div);
  svg.appendChild(foreignObject);
//この時点ではforeignObjectは生成されていない

  //テキストボックスのイベント登録
  let dx = 0;
  let dy = 0;
  const textbox = d3.select("#svg").select(foreignObject.id);
  console.log(textbox);
  document.querySelector("p").textContent = textbox;
  const start = (event,d) => {
    dx = Math.abs(Number(foreignObject.getAttribute("x")) - event.x);
    dy = Math.abs(Number(foreignObject.getAttribute("y")) - event.y);
    textbox.attr("x", event.x - dx).attr("y", event.y - dy);
  };
  const drag = (event,d) => {
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

  setAttributes(div, { class: "contentBox" });
  setAttributes(foreignObject, {
    id: "contentBox" + count,
    class: "content",
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


