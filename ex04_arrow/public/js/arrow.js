// デバッグ画面を表示
function debugFunc(str) {
  const debugTxt = document.querySelector("#debug");
  if (debugTxt) {
    debugTxt.textContent = str;
    return;
  }

  const elem = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "foreignObject"
  );
  elem.style = "position:fixed;background:aliceblue; y:0;width:500px;";
  elem.textContent = str;
  elem.id = "debug";
  document.querySelector("svg").appendChild(elem);
}
let tmpX, tmpY;
function arrow() {
  let mode = "arrow";
  const svg = document.querySelector("#svg-container");
  let segs = [];
  let px, py;
  let arrow;
  let tmp;
  let arrow_endX, arrow_endY;
  svg.addEventListener("mousedown", (e) => {
    if (mode != "arrow") {
      //   debugFunc(mode);
      return false;
    }
    const clientRect = e.target.getBoundingClientRect();
    // ページの左端から、要素の左端までの距離
    px = e.offsetX;
    // ページの上端から、要素の上端までの距離
    py = e.offsetY;

    const paper = Snap("#svg-container");
    arrow_endX = px+1;
    arrow_endY = py;
    segs = [
      ["M", px, py],
      ["L", arrow_endX, arrow_endY],
    ];

    //   debugFunc("x:" + px + " y:" + py);
    //矢印の描画
    //11/01 描画はできたが矢印の長さを調節できない。

    /* arrow.drag(
      function (dx, dy) {
        debugFunc(Number(px) + Number(dx) + " " + (Number(py) + Number(dy)));
        debugFunc("M " + px + " " + py + " L " + (px + 100) + " " + py);
        px = tmpX + dx;
        py = tmpY + dy;

        arrow.attr({
          d: "M " + px + " " + py + "L " + (px + 200) + " " + py,
        });
        // debugFunc("スタート");
      },
      function (x, y) {
        px += arrow.attr("x");
        py += arrow.attr("y");
        tmpX = px;
        tmpY = py;
        arrow.attr({ fill: "orange" });
        debugFunc("ドラッグ中");
      },
      function () {}
    ); */
    var moveFlag = false;
    var arrow;
    let tmpX, tmpY;
    // マウスダウンイベント
    paper.mousedown(function (e) {
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

    /* arrow.drag((dx, dy) => {
      //   arrow.attr({ x: px, y: py });
      //   debugFunc("px:" + dx + "py:" + dy);
    }); */

    //ドラッグ中に終点を変更
    /*  svg.addEventListener("drag", (e) => {
      console.log("haro");
      px += e.offsetX;
      py += e.offsetY;
      // arrow.attr({ d: "M " + px + " " + py + " " + "L " + px + " " + py });
      debugFunc("px:" + px + "py:" + py);
    }); */

    mode = false;
  });
}

document.addEventListener("DOMContentLoaded", arrow);
