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
  const circleRadius = 5;
  const circlePositions = [
    { x: x + width / 2, y: y, vector: "t" }, // 上
    { x: x + width / 2, y: y + height, vector: "b" }, // 下
    { x: x, y: y + height / 2, vector: "l" }, // 左
    { x: x + width, y: y + height / 2, vector: "r" }, // 右
  ];
  setArrowHundlePos(group);
  circlePositions.forEach((pos) => {
    //ハンドルがあれば矢印を設定する
    const arrow_hundle = d3.select(`#${group.attr("id")}-${pos.vector}`);
    if (arrow_hundle.empty()) {
      const arrow_hundle = d3
        .select("#svg")
        .append("circle")
        .attr("id", group.attr("id") + "-" + pos.vector)
        .attr("class", "arrow-hundle")
        .attr("cx", pos.x)
        .attr("cy", pos.y)
        .attr("r", circleRadius)
        .attr("fill", "red");
      arrow_hundle.on("mouseup", (event) => {
        if (drawMode == "arrow") {
          arrow_hundle.classed(selectedArrowHundle + "-start", true);
          arrow_hundle.attr("fill", "blue");
          moveFlag = false;
        }
      });
      arrow_hundle.attr("cx", pos.x).attr("cy", pos.y);
    } else {
      arrow_hundle.attr("cx", pos.x).attr("cy", pos.y);
      //矢印ハンドルが始点か終点かを求める

      // わかったら、矢印ハンドルの位置を始点とする矢印の値を更新する
      setArrowHundlePos(group);
    }
  });
}
let frcount = 0;
//グループ図形に接続された矢印の位置を変更する
function setArrowHundlePos(group) {
  frcount++;
  console.log(frcount);
  const vectors = ["t", "b", "l", "r"];
  //矢印ハンドルを取得
  vectors.forEach((vec) => {
    const id = group.attr("id") + "-" + vec;
    //矢印ハンドル
    const hundle = d3.select("#" + id);
    //始点になっている矢印を取得
    const startArrows = d3.selectAll(`.${id}-start`);
    const endArrows = d3.selectAll(`.${id}-end`);
    // console.log(arrows);

    // 矢印が存在すれば
    if (!startArrows.empty()) {
      startArrows.each(function (p, j) {
        const arrow = d3.select(this);

        if (!arrow.select(".arrow").empty()) {
          console.log("----------------------");

          const arrowPos = getArrowPos(arrow.select(".arrow").attr("d"));
          // 矢印の始点をハンドルの座標に設定
          const d =
            "M " +
            hundle.attr("cx") +
            " " +
            hundle.attr("cy") +
            " " +
            "L " +
            arrowPos.endX +
            " " +
            arrowPos.endY;
              // ハンドルのid名と同じクラスを持つ矢印を取得
          console.log(arrow.attr("id") + " ");
          console.log("start:" + hundle.attr("id"));
          console.log(
            "変更前： M " +
            arrowPos.x +
            " " +
            arrowPos.y +
            " " +
            "L " +
            arrowPos.endX +
            " " +
            arrowPos.endY+"\n変更後： "+d);
          arrow.select(".arrow").attr("d", d);
          const arrow_frame = arrow.select(".arrow-frame");
          const arrowSize = arrow.node().getBBox();
          arrow_frame
            .attr("x", arrowSize.x)
            .attr("y", arrowSize.y)
            .attr("width", arrowSize.width)
            .attr("height", arrowSize.height);
        
        }
      });
    }

    // 矢印が存在すれば
    if (!endArrows.empty()) {
      // 矢印の終点をハンドルの位置に変更する
      endArrows.each(function (p, j) {
        const arrow = d3.select(this);
        if (!arrow.select(".arrow").empty()) {
          console.log("----------------------");

          const arrowPos = getArrowPos(d3.select(".arrow").attr("d"));
          const d =
            "M " +
            arrowPos.x +
            " " +
            arrowPos.y +
            " " +
            "L " +
            hundle.attr("cx") +
            " " +
            hundle.attr("cy");
            console.log(arrow.attr("id") + ":");
          console.log("end:" + hundle.attr("id"));
          console.log(
            "変更前： M " +
            arrowPos.x +
            " " +
            arrowPos.y +
            " " +
            "L " +
            arrowPos.endX +
            " " +
            arrowPos.endY+"\n変更後： "+d);
          arrow.select(".arrow").attr("d", d);

          const arrow_frame = arrow.select(".arrow-frame");
          const arrowSize = arrow.node().getBBox();
          arrow_frame
            .attr("x", arrowSize.x)
            .attr("y", arrowSize.y)
            .attr("width", arrowSize.width)
            .attr("height", arrowSize.height);
          
        }
      });
      // ハンドルのid名と同じクラスを持つ矢印を取得
    }
  });
}

// 図形クリック時の処理
function clickEventHundler(contentBoxes) {
  for (let i = 0; i < contentBoxes.length; i++) {
    const contentBox = d3.select("#" + contentBoxes[i].id);
    contentBox.on("click", (e) => {
      //シフトキーを押していて、isclickArrayに図形のidが含まれていなければ
      const id = contentBox.attr("id");
      if (e.shiftKey && !IsClickArray.includes(id)) {
        if (contentBox.select(".arrow_frame").empty()) {
          const arrow_frame = contentBox.select(".arrow_frame");
          arrow_frame.attr("opacity", 0.7);
        }
        // 図形のidをisClickArrayに追加する
        IsClickArray.push(id);
      }
    });
    //コンテキストメニューの表示
    displayContextMenu(contentBox.node());
  }
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
