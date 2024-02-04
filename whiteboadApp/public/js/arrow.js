//矢印を描画する
function displayToArrow() {
  const svg = d3.select("#svg");
  const arrowId = "contentBox" + count;
  let moveFlag = false;
  let arrow_startX, arrow_startY;
  let arrow_endX, arrow_endY;
  //グループ化図形の矢印を接続するための変数
  let selectedArrowHundle = null;
  //描画する矢印のid

  //ホワイトボードをドラッグした直後の処理
  const start = (event) => {
    if (drawMode == "arrow") {
      arrow_startX = event.x;
      arrow_startY = event.y;

      // グループハンドル上でドラッグしたとき
      if (event.sourceEvent.target.classList[0] == "arrow-hundle") {
        //グループハンドルを始点に矢印を接続する
        const group_hundle = d3.select("#" + event.sourceEvent.target.id);
        selectedArrowHundle = group_hundle.attr("id");
        group_hundle.attr("fill", "blue");
        arrow_startX = group_hundle.attr("cx");
        arrow_startY = group_hundle.attr("cy");
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
        .attr("id", arrowId)
        .attr("class", "contentBox");
      // 矢印本体
      const arrow = arrow_group
        .append("path")
        .attr("class", "arrow")
        .attr("d", segs)
        .attr("stroke", "black")
        .attr("strokeWeight", 1)
        .attr("marker-end", "url(#m_atr)");

      //矢印の始点と終点を自由に変えられるようにする
      //　目標
      // ・矢印の長さを始点と終点の位置を変更することで、変更可能にする
      // ・矢印が接続されたグループを移動する際、片方のグループの矢印ハンドルへ、矢印の始点が１箇所に集まってしまう不具合を修正する
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
        .attr("cx", arrow_startX)
        .attr("cy", arrow_startY)
        .attr("r", 5);

      // 矢印の終点
      const hundle_end = arrow_group
        .append("circle")
        .attr("fill", "red")
        .attr("class", "hundle-end hundle")
        .attr("cx", arrow_endX)
        .attr("cy", arrow_endY)
        .attr("r", 5);

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
      x: Number(arrow_startX) + (Number(arrow_endX) - Number(arrow_startX)) / 2,
      y: Number(arrow_startY) + (Number(arrow_endY) - Number(arrow_startY)) / 2,
    };

    // 始点のハンドル
    const hundle_start = arrow_group.select(".hundle-start");
    // 中心点のハンドル
    const hundle_center = arrow_group
      .select(".hundle-center")
      .attr("cx", centerPos.x)
      .attr("cy", centerPos.y);

    // 矢印の終点
    const hundle_end = arrow_group
      .select(".hundle-end")
      .attr("cx", arrow_endX)
      .attr("cy", arrow_endY);

    // 始点の座標の変更
    hundle_start.call(
      d3.drag().on("drag", (event) => {
        //始点の座標
        const startX = Number(hundle_start.attr("cx")) + Number(event.dx);
        const startY = Number(hundle_start.attr("cy")) + Number(event.dy);
        //グループの中の矢印とその座標を取得
        const arrow = arrow_group.select(".arrow");
        // 矢印の座標を更新する
        arrow.attr(
          "d",
          `M ${startX} ${startY} L ${hundle_end.attr("cx")} ${hundle_end.attr(
            "cy"
          )}`
        );
        hundle_start.attr("cx", startX).attr("cy", startY);
        hundle_center
          .attr("cx", (startX + Number(hundle_end.attr("cx"))) / 2)
          .attr("cy", (startY + Number(hundle_end.attr("cy"))) / 2);
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
        // 矢印の座標を更新する
        arrow.attr(
          "d",
          `M ${hundle_start.attr("cx")} ${hundle_start.attr(
            "cy"
          )} L ${endX} ${endY}`
        );
        hundle_end.attr("cx", endX).attr("cy", endY);
        hundle_center
          .attr("cx", (Number(hundle_start.attr("cx")) + endX) / 2)
          .attr("cy", (Number(hundle_start.attr("cy")) + endY) / 2);
      })
    );

    // グループハンドル上でマウスを離したとき
    if (target.classList[0] == "arrow-hundle") {
      //始点と終点の矢印ハンドルを取得
      const startArrowHundle = d3.select("#" + selectedArrowHundle);
      const endArrowHundle = d3.select("#" + target.id);
      //始点と終点のグループのid名（ハンドルのid: [グループid]-[t,b,l,r（方向）])
      const endGroupId = endArrowHundle.attr("id").split("-")[0];

      // 違うグループ同士であれば矢印を接続する
      if (startGroupId != endGroupId) {
        // 終点をグループハンドルの座標に変更する
        arrow_endX = endArrowHundle.attr("cx");
        arrow_endY = endArrowHundle.attr("cy");

        //矢印ハンドルに始点と終点を表すクラスを付与する
        hundle_end.classed(endArrowHundle.attr("id") + "-end", true);
        //グループハンドルを青色に変更する
        endArrowHundle.attr("fill", "blue");
      } else return;
    }

    //矢印のフレームの設定
    arrowMouseEvent(arrow_group);
    moveFlag = false;
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
    debugFunc(arrow.attr("id"));
    const hundles = arrow.selectAll(`#${arrow.attr("id")}>circle`);
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
}
