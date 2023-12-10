const svg = document.getElementById("svg");

let count = 0;
//描画モード切り替え用
let drawMode = "";
//編集状態
let edit = false;

document.addEventListener("DOMContentLoaded", () => {
  //テキストボックスメニューがドラッグされているとき-
  const textBox_menu = document.getElementById("textBox_menu");
  textBox_menu.addEventListener("dragstart", () => (drawMode = "textbox"));
  textBox_menu.addEventListener("dragend", displayToTextbox);
});

//テキストボックスを表示する
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

    let dx = 0;
  let dy = 0;
  const textbox = d3.select("#svg").select(foreignObject.id);
  console.log(textbox);
  document.querySelector("p").textContent =(textbox);
  const start = () => {
    dx = Math.abs(Number(foreignObject.getAttribute("x")) - d3.event.x);
    dy = Math.abs(Number(foreignObject.getAttribute("y")) - d3.event.y);
    
  };
  const drag = () => {
    /*         console.log(
        "x: " +
        e.target.getAttribute("x") +
            "y: " +
            e.target.getAttribute("y") +
            "\n" +
            "event.x: " +
            d3.event.x +
            " event.y: " +
            d3.event.y +
            (Number(e.target.getAttribute("x")) - d3.event.x) +
            "y - event.y:" +
            (Number(e.target.getAttribute("y")) - d3.event.y)
        ); */
    textbox.attr("x", d3.event.x - dx).attr("y", d3.event.y - dy);
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
      div.style.cursor = "auto"
      div.focus();
    } else {
      textbox.call(d3.drag().on("drag", null));
      div.style.cursor = "auto";
      drawMode = "textbox";
    }
    //ドラッグの無効化
  });






  count++;
}



//要素の属性を一括で設定する
function setAttributes(element, attributes) {
  const arr = Object.entries(attributes);
  arr.forEach(function ([attribute, value]) {
    element.setAttribute(attribute, value);
  });
}
