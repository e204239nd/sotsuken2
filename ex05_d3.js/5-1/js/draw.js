let tmpX, tmpY;
let count = 0; //図形の番号
let editable = ""; //編集状態

//読み込み時の処理
document.addEventListener("DOMContentLoaded", () => {
  const textBox_menu = document.querySelector("#textBox_menu");
  arrow_menu.addEventListener("click", () => (editable = "arrow"));
  textBox_menu.addEventListener("dragstart", () => (editable = "textbox"));
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
  div.style.cursor = "default";
  foreignObject.appendChild(div);
  svg.appendChild(foreignObject);

  let dx = 0;
  let dy = 0;
  const textbox = d3.select("#contentBox" + count);
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
  textbox.call(d3.drag().on("start", start).on("drag", drag));

  //図形以外の領域をクリックすると編集状態をfalseへ
  svg.addEventListener("mousedown", () => {
    div.style.cursor = "default";
    //ドラッグの無効化
    textbox.call(d3.drag().on("drag", null));
    editable = "";
  });

  //クリックされたときに編集状態に変更
  foreignObject.addEventListener("dblclick", (e) => {
    //図形の始点とマウス座標までの距離
    // dx = e.offsetX;
    // dx = e.offsetY;
    if (editable == "textbox") {
      textbox.call(d3.drag().on("drag", null));
      div.style.cursor = "auto";
      editable = "";
    } else {
      textbox.call(d3.drag().on("start", start).on("drag", drag));
      div.style.cursor = "auto";
      editable = "textbox";
    }
    // ドラッグの無効化
  });

  count++;
}

// function rectDrag() {}
// //要素の属性を一括で設定する
// function setAttributes(element, attributes) {
//   const arr = Object.entries(attributes);
//   arr.forEach(function ([attribute, value]) {
//     element.setAttribute(attribute, value);
//   });
// }

// // function displayTextBox() {
// //   const textBox = d3.select("body").select("#textBox_menu");
// //   const svg = d3.select("#svg");
// //   textBox.call(
// //     d3.drag().on("end", () => {
// //       editable = "textBox";
// //       // テキストボックス要素：<foreignObject id="contentBox0" class="content" x="160" y="79" width="100" height="100"><div contenteditable="true"> </div></foreignObject> -->
// //       const foreignObject=svg
// //         .append("foreignObject")
// //         .attr("id", "contentBox" + count)
// //         .attr("class", "content")
// //         .attr("x", d3.event.x)
// //         .attr("y", d3.event.y)
// //         .attr("width", "100px")
// //         .attr("height", "100px");

// //         foreignObject.append("div")
// //         .text("fdsafdasfdsafdsafああああ")
// //         .attr("contenteditable","true")
// //         .attr("padding","10px");

// //       console.dir(d3.event.y, { depth: null });

// //       /*         setAttributes(foreignObject, {
// //           id: "contentBox" + count,
// //           class: "content",
// //           x: x,
// //           y: y,
// //           width: 100,
// //           height: 100,
// //         });
// //         div.setAttribute("contenteditable", true); */
// //     })
// //   );
// // }

// function arrow() {
//   const svg = d3.select("#svg");
//   let moveFlag = false;

//   //ドラッグスタート時の動作
//   svg.call(
//     d3
//       .drag()
//       .on("start", () => {
//         if (editable != "arrow") return;
//         moveFlag = true;
//         tmpX = d3.event.x;
//         tmpY = d3.event.y;
//         //矢印の描画
//         const path = svg.append("path");
//         const d = `M ${tmpX} ${tmpY} L ${tmpX} ${tmpY + 1}`;
//         path.attr("d", d);
//         path
//           .attr("stroke", "black")
//           .attr("id", "contentBox" + count)
//           .attr("class", "content")
//           .attr("marker-end", "url(#m_atr)"); //矢印の先端の設定
//       })
//       .on("drag", () => {
//         if (editable != "arrow" && !moveFlag) return;
//         const d = `M ${tmpX} ${tmpY} L ${d3.event.x} ${d3.event.y}`;
//         svg.select("#contentBox" + count).attr("d", d);
//         // console.log(d3.event.y);
//       })
//       .on("end", () => {
//         count++;
//         moveFlag = false;
//       })
//   );
//ドラッグ時の動作
// }

//要素の属性を一括で設定する
function setAttributes(element, attributes) {
  const arr = Object.entries(attributes);
  arr.forEach(function ([attribute, value]) {
    element.setAttribute(attribute, value);
  });
}

function mutationObserver() {
  // content属性を持つ図形は全てドラッグ可能にする
  // d3.selectAll(".content").call(d3.drag());
}

//d3.jsを利用した描画機能の実装
/* function d3d() {
  const debug = document.querySelector("p");

  // SVG要素を作成
  var svg = d3
    .select("body")
    .append("svg")
    .attr("width", 500)
    .attr("height", 500);

  // 円要素を追加
  var circle = svg
    .append("circle")
    .attr("id", "content")
    .attr("cx", 100) // 中心のx座標
    .attr("cy", 100) // 中心のy座標
    .attr("r", 50) // 半径
    .attr("fill", "red"); // 塗りつぶし色
  console.log(circle.id);
  let editable = false;
  // ドラッグの動作を定義
  var drag = d3.drag().on("drag", function (d) {
    debug.textContent = editable;
    if (!editable) return;
    // ドラッグ中に円の中心座標を更新
    d3.select(this).attr("cx", d3.event.x).attr("cy", d3.event.y);
  });

  // 円要素にドラッグの動作を適用
  circle.call(drag);
  circle.on("dblclick", (e) => {
    debug.textContent = "ダブルクリック";
    editable = true;
  });

  circle.on("click", () => {
    d3.event.stopPropagation();
  });

  svg.on("click", (d) => {
    debug.textContent = "svgクリック";
    console.log(d);
    editable = false;
  });
  //   circle.call(undrag);
} */
