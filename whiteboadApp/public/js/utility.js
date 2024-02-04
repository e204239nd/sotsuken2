// 利用頻度が高い処理
//図形のイベント登録
function shapeDragEvent(shape) {
  const start = (event) => {
    if (shape.attr("cx")) {
      dx = Math.abs(Number(shape.attr("cx") - event.x));
      dy = Math.abs(Number(shape.attr("cy") - event.y));
    } else {
      dx = Math.abs(Number(shape.attr("x") - event.x));
      dy = Math.abs(Number(shape.attr("y") - event.y));
    }
  };

  const drag = (event) => {
    if (shape.attr("cx")) {
      shape.attr("cx", event.x - dx).attr("cy", event.y - dy);
    } else {
      shape.attr("x", event.x - dx / 2).attr("y", event.y - dy / 2);
    }
  };

  //テキストボックスのドラッグ時の処理
  shape.call(
    d3
      .drag()
      .on("start", start)
      .on("drag", drag)
      .on("end", () => {
        //グループ化されていれば
        if (shape.node().parentNode.id != "svg") {
          const group = d3.select("#" + shape.node().parentNode.id);
          setFrameSize(group);
        }
      })
  );
}

// グループ図形の枠のサイズを変更する:ChatGPT利用
function setFrameSize(group) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  // グループ内の全ての図形をループして、最小の矩形を計算
  group.selectAll(".contentBox").each(function () {
    const elem = d3.select(this);

    // 図形の位置とサイズを取得
    const bbox = elem.node().getBBox();
    let elemX = bbox.x;
    let elemY = bbox.y;
    let elemWidth = bbox.width;
    let elemHeight = bbox.height;
    // 最小のX座標とY座標を更新
    minX = Math.min(minX, elemX);
    minY = Math.min(minY, elemY);

    // 最大のX座標とY座標を更新
    maxX = Math.max(maxX, elemX + elemWidth);
    maxY = Math.max(maxY, elemY + elemHeight);
  });

  // 最小の矩形の位置とサイズを設定
  const frame = group.select(".group_frame");
  const x = minX;
  const y = minY;
  const width = maxX - minX;
  const height = maxY - minY;
  frame.attr("x", x).attr("y", y).attr("width", width).attr("height", height);

  //グループハンドルの円の大きさ
  const circleRadius = 5;
  const circlePositions = [
    { x: x + width / 2, y: y, vector: "t" }, // 上
    { x: x + width / 2, y: y + height, vector: "b" }, // 下
    { x: x, y: y + height / 2, vector: "l" }, // 左
    { x: x + width, y: y + height / 2, vector: "r" }, // 右
  ];
  const group_hundle = d3.select(
    `#${group.attr("id")}-${circlePositions[0].vector}`
  );
  console.log(!group_hundle.empty());
  //グループハンドルの設定
  if (group_hundle.empty()) {
    //グループハンドルがなければ描画する
    circlePositions.forEach((pos) => {
      const hundle = d3
        .select("#svg")
        .append("circle")
        .attr("id", group.attr("id") + "-" + pos.vector)
        .attr("class", "arrow-hundle")
        .attr("cx", pos.x)
        .attr("cy", pos.y)
        .attr("r", circleRadius)
        .attr("fill", "red");

      hundle.on("mouseup", (event) => {
        if (drawMode == "arrow") {
          hundle.classed(selectedArrowHundle + "-start", true);
          hundle.attr("fill", "blue");
          moveFlag = false;
        }
      });
      hundle.attr("cx", pos.x).attr("cy", pos.y);
    });
  } else {
    //既存のグループハンドルの座標を変更する
    circlePositions.forEach((pos) => {
      const hundle = d3.select(`#${group.attr("id")}-${pos.vector}`);
      hundle.attr("cx", pos.x).attr("cy", pos.y);
    });
    setArrowHundlePos(group);
  }
}

//グループ図形に接続された矢印の位置を変更する
function setArrowHundlePos(group) {
  const vectors = ["t", "b", "l", "r"];
  //グループハンドルを取得
  vectors.forEach((vec) => {
    const id = group.attr("id") + "-" + vec;
    //グループハンドル
    const hundle = d3.select("#" + id);
    //始点になっている矢印を取得
    const startArrowHundles = d3.selectAll(`.${id}-start`);
    const endArrowHundles = d3.selectAll(`.${id}-end`);
console.log(startArrowHundles);
console.log(endArrowHundles);
    // 始点に矢印がつながっていれば
    if (!startArrowHundles.empty()) {
      startArrowHundles.each(function (p, j) {
        //矢印ハンドルを取得
        const arrowHundle = d3.select(this);
        const arrow_group = d3.select("#" + arrowHundle.node().parentNode.id);
        const arrow = arrow_group.select(".arrow");
        const arrowPos = getArrowPos(arrow.attr("d"));

        //矢印ハンドルの座標を取得
        const hundleX = hundle.attr("cx");
        const hundleY = hundle.attr("cy");

        // 矢印ハンドルの座標をグループハンドルの座標に変更する
        arrowHundle.attr("cx", hundleX).attr("cy", hundleY);

        // 矢印の始点をグループハンドルの座標に変更する
        const d = `M ${hundleX} ${hundleY} L ${arrowPos.endX} ${arrowPos.endY}`;
        arrow.attr("d", d);
        arrow_group
          .select(".hundle-center")
          .attr("cx", arrowPos.midPosX)
          .attr("cy", arrowPos.midPosY);
      });
    }

    // 終点に矢印がつながっていれば
    if (!endArrowHundles.empty()) {
      // 矢印の終点をハンドルの位置に変更する
      endArrowHundles.each(function (p, j) {
        const arrowHundle = d3.select(this);
        const arrow_group = d3.select("#" + arrowHundle.node().parentNode.id);
        console.log(arrow_group);
        const arrow = arrow_group.select(".arrow");
        const arrowPos = getArrowPos(arrow.attr("d"));

        const hundleEndX = hundle.attr("cx");
        const hundleEndY = hundle.attr("cy");
        // 矢印ハンドルの座標をグループハンドルの座標に変更する
        arrowHundle.attr("cx", hundleEndX).attr("cy", hundleEndY);

        // 矢印の始点をグループハンドルの座標に変更する
        const d = `M ${arrowPos.x} ${arrowPos.y} L ${hundleEndX} ${hundleEndY}`;
        arrow.attr("d", d);
        arrow_group
          .select(".hundle-center")
          .attr("cx", arrowPos.midPosX)
          .attr("cy", arrowPos.midPosY);
      });
      // ハンドルのid名と同じクラスを持つ矢印を取得
    }
  });
}

//矢印のハンドルの座標を変更する
function updateArrowHundle(group) {
  //矢印のハンドルを移動する
  //グループに接続済みの矢印の座標を変更する
  //接続済み矢印のハンドルを取得
  const startArrowHundles = d3.selectAll("." + group.attr("id") + "-start");
  const endHundles = d3.selectAll("." + group.attr("id") + "-end");

  //始点のハンドル
  if (!startArrowHundles.empty()) {
    startArrowHundles.each(function () {
      const arrowHundle = d3.select(this);
      //矢印の移動
      const arrow_group = d3.select("#" + arrowHundle.node().parentNode.id);
      const arrow = arrow_group.select(".arrow");
      const seg = getArrowPos(arrow.attr("d"));
      const x = seg.x + dx;
      const y = seg.y + dy;
      const d = `M ${x} ${y} L ${seg.endX} ${seg.endY}`;

      arrow.attr("d", d);
      arrowHundle.attr("cx", seg.x).attr("cy", seg.y);
      arrow_group
        .select("hundle-mid")
        .attr("cx", seg.midPosX)
        .attr("cy", seg.midPosY);
    });
  }

  //終点のハンドル
  if (!endHundles.empty()) {
    endHundles.each(function () {
      const endHundle = d3.select(this);
      //矢印の移動
      const arrow = endHundle.select(arrow);
      const seg = getArrowPos(arrow.attr("d"));
      const endX = seg.endX + dx;
      const endY = seg.endY + dy;
      const d = `M ${x} ${y} L ${endX} ${endY}`;
      arrow.attr("d", d);
      endHundle.attr("cx", seg.endX).attr("cy", seg.endY);
    });
  }
}

//矢印の座標を取得する
function getArrowPos(segs) {
  const words = segs.split(" ");
  const result = { x: 0, y: 0, endX: 0, endY: 0, midPosX: 0, midPosY: 0 };
  result.x = Number(words[1]);
  result.y = Number(words[2]);
  result.endX = Number(words[4]);
  result.endY = Number(words[5]);
  result.midPosX = result.x + (result.endX - result.x) / 2;
  result.midPosY = result.y + (result.endY - result.y) / 2;
  return result;
}

// 矢印ハンドルのidを取得する
function getArrowHundleId(groupId) {
  const vecs = ["t", "b", "l", "r"];
  const arr = [];
  vecs.forEach((vec) => {
    arr.push(groupId + "-" + vec);
  });
  return arr;
}

// デバッグ画面を表示
function debugFunc(str) {
  const debugTxt = document.querySelector("#debug");
  debugTxt.textContent = str;
}

//SVG図形に対して動的なidをつける
function ContentBoxInc(idName) {
  //複数のdiv要素に動的なidをつける

  var tmp = document.querySelectorAll("."+idName);
  for (var i = 0; i <= tmp.length - 1; i++) {
    //id追加
    tmp[i].setAttribute("id", idName + i);
  }
  
}