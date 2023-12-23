//矢印を描画する
function displayToArrow() {
  const svg = d3.select("#svg");
  let moveFlag = false;
  let arrow_startX, arrow_startY;
  let arrow_endX, arrow_endY;
  //グループ化図形の矢印を接続するための変数
  let selectedArrowHundle = "";
  //描画する矢印のid
  const arrowId = "contentBox" + count;

  //ホワイトボードをドラッグした直後の処理
  const start = (event) => {
    if (drawMode == "arrow") {
      arrow_startX = event.x;
      arrow_startY = event.y;

      // 矢印のハンドル上でドラッグしたとき
      if (event.sourceEvent.target.classList[0] == "arrow-hundle") {
        //ハンドルを始点に矢印を接続する
        const arrow_hundle = d3.select("#" + event.sourceEvent.target.id);
        selectedArrowHundle = arrow_hundle.attr("id");
        arrow_startX = arrow_hundle.attr("cx");
        arrow_startY = arrow_hundle.attr("cy");
        arrow_hundle.attr("fill", "blue");
      }

      arrow_endX = arrow_startX;
      arrow_endY = arrow_startY;

      const segs =
        "M " +
        arrow_startX +
        " " +
        arrow_startY +
        " L " +
        arrow_endX +
        " " +
        arrow_endY;

      //矢印グループ
      const arrow_group = svg
        .append("g")
        .attr("stroke", "black")
        .attr("strokeWeight", 2)
        .attr("id", "contentBox" + count)
        .attr("class", "contentBox");

      //矢印の始点と終点を自由に変えられるようにする
      //　目標
      // ・矢印の長さを始点と終点の位置を変更することで、変更可能にする
      // ・矢印が接続されたグループを移動する際、片方のグループの矢印ハンドルへ、矢印の始点が１箇所に集まってしまう不具合を修正する

      // 矢印
      const arrow = arrow_group
        .append("path")
        .attr("d", segs)
        .attr("stroke", "black")
        .attr("strokeWeight", 1)
        .attr("class", "arrow")
        .attr("marker-end", "url(#m_atr)");

      //ハンドルが矢印ハンドルのidを矢印のクラスに付与する
      if (selectedArrowHundle) {
        arrow_group.classed(selectedArrowHundle + "-start", true);
      }
      moveFlag = true;
    }
  };

  //ホワイトボードのドラッグ中の処理
  const drag = (event) => {
    if (drawMode == "arrow" && moveFlag == true) {
      // 終点の座標は、矢印が同じ座標にあるとハンドルが認識されないため-1している
      let margin = -1;
      if (arrow_endY < arrow_startY) {
        margin = 1;
      }
      arrow_endX = event.x;
      arrow_endY = event.y + margin;
      const arrow_group = d3.select("#" + arrowId);
      const arrow = arrow_group.select(".arrow");
      const segs =
        "M " +
        arrow_startX +
        " " +
        arrow_startY +
        " L " +
        arrow_endX +
        " " +
        arrow_endY;
      arrow.attr("d", segs);
    }
  };

  //ホワイトボードのドラッグが終了した際の処理
  const end = (event) => {
    //矢印の枠を設定する
    if (drawMode != "arrow") {
      return false;
    }
    const arrow_group = d3.select("#" + arrowId);
    const target = event.sourceEvent.target;

    // 矢印の終点
    const centerPos = {
      x: arrow_startX + (arrow_endX - arrow_startX) / 2,
      y: arrow_startY + (arrow_endY - arrow_startY) / 2,
    };

    // 矢印のハンドル
    const hundle_start = arrow_group
      .append("circle")
      .attr("fill", "red")
      .attr("class", "hundle-start hundle")
      .attr("cx", arrow_startX)
      .attr("cy", arrow_startY)
      .attr("r", 5);

    const hundle_center = arrow_group
      .append("circle")
      .attr("class", "hundle-center hundle")
      .attr("fill", "red")
      .attr("cx", centerPos.x)
      .attr("cy", centerPos.y)
      .attr("r", 5);

    // 矢印の終点
    const hundle_end = arrow_group
      .append("circle")
      .attr("fill", "red")
      .attr("class", "hundle-end hundle")
      .attr("cx", arrow_endX)
      .attr("cy", arrow_endY)
      .attr("r", 5);

    // 始点の座標の変更
    hundle_start.call(
      d3.drag().on("drag", (event) => {
        //現時点の矢印の始点と終点の座標
        //更新する終点の座標
        const startX = Number(hundle_start.attr("cx")) + Number(event.dx);
        const startY = Number(hundle_start.attr("cy")) + Number(event.dy);

        //グループの中の矢印とその座標を取得
        const arrow = arrow_group.select(".arrow");
        const seg = getArrowPos(arrow.attr("d"));
        // 矢印の座標を更新する
        arrow.attr("d", `M ${startX} ${startY} L ${seg.endX} ${seg.endY}`);
        hundle_start.attr("cx", startX).attr("cy", startY);
        const centerPos = {
          x: Number(hundle_center.attr("x")) + (startX + Number(seg.endX)) / 2,
          y: Number(hundle_center.attr("y")) + (startY + Number(seg.endY)) / 2,
        };
        hundle_center.attr("cx", centerPos.x).attr("cy", centerPos.y);
      })
    );

    //終点の座標の変更
    hundle_end.call(
      d3.drag().on("drag", (event) => {
        //現時点の矢印の始点と終点の座標
        //更新する終点の座標
        const endX = Number(hundle_end.attr("cx")) + Number(event.dx);
        const endY = Number(hundle_end.attr("cy")) + Number(event.dy);

        //グループの中の矢印とその座標を取得
        const arrow = arrow_group.select(".arrow");
        const seg = getArrowPos(arrow.attr("d"));
        // 矢印の座標を更新する
        arrow.attr("d", `M ${seg.x} ${seg.y} L ${endX} ${endY}`);
        hundle_end.attr("cx", endX).attr("cy", endY);
        const centerPos = {
          x: Number(hundle_center.attr("x")) + (Number(seg.x) + endX) / 2,
          y: Number(hundle_center.attr("y")) + (Number(seg.y) + endY) / 2,
        };
        hundle_center.attr("cx", centerPos.x).attr("cy", centerPos.y);
      })
    );

    // ハンドル上でマウスを離したとき
    if (target.classList[0] == "arrow-hundle") {
      //始点と終点の矢印ハンドルを取得
      const startArrowHundle = d3.select("#" + selectedArrowHundle);
      const endArrowHundle = d3.select("#" + target.id);
      //始点と終点のグループのid名（ハンドルのid: [グループid]-[t,b,l,r（方向）])
      const startGroupId = startArrowHundle.attr("id").split("-")[0];
      const endGroupId = endArrowHundle.attr("id").split("-")[0];

      // 同じグループ同士であれば接続しない
      if (startGroupId == endGroupId) {
        return;
      } else {
        //違うのであればハンドルを終点にして矢印を接続する
        arrow_endX = endArrowHundle.attr("cx");
        arrow_endY = endArrowHundle.attr("cy");
        startArrowHundle.classed(endArrowHundle.attr("id") + "-end", true);
        endArrowHundle.attr("fill", "blue");
        endArrowHundle.classed(startArrowHundle.attr("id") + "-start", true);
        arrow_group.classed(endArrowHundle.attr("id") + "-end", true);
      }
    }

    //矢印のフレームの設定
    const arrow_frame = arrow_group.select(".arrow_frame");
    const x = Math.min(arrow_startX, arrow_endX);
    const y = Math.min(arrow_startY, arrow_endY);
    const width = Math.abs(arrow_endX - arrow_startX);
    const height = Math.abs(arrow_endY - arrow_startY);
    arrow_frame
      .attr("x", x)
      .attr("y", y)
      .attr("width", width)
      .attr("height", height)
      .attr("opacity", 0);
    arrowMouseEvent(arrow_group);
    moveFlag = false;
    groupCnt++;
    count++;
  };

  //ドラッグイベントの登録
  svg.call(d3.drag().on("start", start).on("drag", drag).on("end", end));
}

//矢印のマウスイベント登録
function arrowMouseEvent(arrow) {
  const drag = (event) => {
    //現時点の矢印の始点と終点の座標
    const seg = getArrowPos(arrow.select(".arrow").attr("d"));
    const x = seg.x + event.dx;
    const y = seg.y + event.dy;
    const d = `M ${x} ${y} L ${seg.endX + event.dx} ${seg.endY + event.dy}`;
    arrow.select(".arrow").attr("d", d);
    const hundles = arrow.selectAll("circle");
    hundles.each(function () {
      const hundle = d3.select(this);
      const x = Number(hundle.attr("cx")) + Number(event.dx);
      const y = Number(hundle.attr("cy")) + Number(event.dy);
      hundle.attr("cx", x).attr("cy", y);
    });
  };
  //グループをドラッグした時の処理
  arrow.call(d3.drag().on("drag", drag));

  //ダブルクリックした時の処理
  arrow.on("dblclick", () => {
    //矢印の枠
    const frame = arrow.select(".arrow_frame");
    //グループ化の枠を表示する
    frame.attr("opacity", 0.7);
    arrow.call(d3.drag().on("drag", drag));
  });

  /* const svg = d3.select("#svg");
  //図形の外をクリックした際の処理
  svg.on("click", (e) => {
    //矢印の枠
    const frame = arrow.select(".arrow_frame");
    frame.attr("opacity", 0);
    arrow.call(d3.drag().on("drag", null));
  });

  clickEventHundler(arrow.node()); */
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
