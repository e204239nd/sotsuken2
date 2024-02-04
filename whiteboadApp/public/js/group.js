//グループ図形関係の処理
//選択図形を格納する配列
let IsClickArray;
let groupCnt = 0;
let IsClickContextMenu = false;

//グループ化用のコンテキストメニュー
function displayContextMenu(contentBox) {
  //右クリック時の処理
  contentBox.addEventListener("contextmenu", (e) => {
    if (IsClickContextMenu == false && IsClickArray.length <= 1) return;
    // グループ図形の枠の大きさを取得
    const clientRect = contentBox.getBoundingClientRect();

    // ページの左端から、要素の左端までの距離
    const px = window.scrollX + clientRect.left / 2;
    // ページの上端から、要素の上端までの距離
    const py = window.scrollY + clientRect.top / 2;
    const svg = d3.select("#svg");
    const foreignObject = svg
      .append("foreignObject")
      .attr("class", "contextMenu")
      .attr("x", px)
      .attr("y", py)
      .attr("width", 100)
      .attr("height", 100);
    // foreignObject内にHTML要素を追加
    const contextMenu = foreignObject
      .append("xhtml:div")
      .html(
        `<a class="groupBtn"><button style="background:gray; padding:5px;">グループ化</button></a>`
      );

    //メニューのボタンをクリックしたときの処理
    contextMenu.select(".groupBtn").on("click", (e) => {
      e.stopPropagation(); //親要素のイベントを実行しないようにする
      const group = d3
        .select("#svg")
        .append("g")
        .attr("style", "blue")
        .attr("stroke", "black")
        .attr("strokeWeight", 2)
        .attr("id", "groupObj" + groupCnt)
        .attr("class", "groupObj");

      //グループを囲むフレーム（枠）の追加
      const frame = group
        .append("rect")
        .attr("class", "group_frame")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 0)
        .attr("height", 0)
        .attr("fill", "white")
        .attr("opacity", 0.7)
        .attr("strokeWidth", 1)
        .attr("stroke", "black");
      //選択した図形をグループに追加する
      for (let i = 0; i < IsClickArray.length; i++) {
        const clickedElem = d3.select("#" + IsClickArray[i]);
        //グループに追加
        group.append(() => clickedElem.node());
      }

      // グループの枠の大きさを設定する
      setFrameSize(group);
      //グループ図形にマウスイベントを登録する
      groupDragEvent(group);

      //コンテキストメニューを閉じる
      svg.select(".contextMenu").remove();
      IsClickArray = [];
      groupCnt++;
    });
  });
}

//グループ図形を移動した際の処理
function groupDragEvent(group) {
  const drag = (event) => {
    const dx = event.dx;
    const dy = event.dy;
    const elems = group.selectAll(".contentBox");

    //グループ内のそれぞれの図形に対してドラッグイベントを付与する
    elems.each(function (p, j) {
      const elem = d3.select(this);

      //矢印の移動
      if (!elem.select(".arrow").empty()) {
        //矢印の移動
        const arrow = elem.select(".arrow");
        const seg = getArrowPos(elem.select(".arrow").attr("d"));
        const x = seg.x + dx;
        const y = seg.y + dy;
        const d = `M ${x} ${y} L ${seg.endX + dx} ${seg.endY + dy}`;
        arrow.attr("d", d);
      }
      //図形の座標を変更する
      const cx = elem.attr("cx");
      if (cx) {
        //円の移動
        elem
          .attr("cx", Number(elem.attr("cx")) + dx)
          .attr("cy", Number(elem.attr("cy")) + dy);
      } else {
        //四角の移動
        elem
          .attr("x", Number(elem.attr("x")) + dx)
          .attr("y", Number(elem.attr("y")) + dy);
      }
    });
    setFrameSize(group);
  };

  //グループをドラッグした時の処理
  group.call(
    d3
      .drag()
      .on("drag", drag)
      .on("end", () => setFrameSize(group))
  );

  //ダブルクリックした時の処理
  group.on("dblclick", () => {
    //グループ化の枠を表示する
    group.call(d3.drag().on("drag", drag));
  });
  document.querySelector("#svg").addEventListener("click", (e) => {
    if (e.target.id == "svg") {
      group.call(d3.drag().on("drag", null));
    }
  });
  //グループ選択図形を追加する処理
  addGroupEvent(group.node());
  groupedContextMenu(group);
}

//グループ図形を右クリックしたときのコンテキストメニュー
function groupedContextMenu(group) {
  //コンテキストメニューの表示
  group.node().addEventListener("contextmenu", (e) => {
    if (!d3.select(".contextmenu").empty()) {
      d3.select(".contextmenu").remove();
    }
    const svg = d3.select("#svg");
    // グループ図形の枠の大きさを取得
    const clientRect = e.target.getBoundingClientRect();
    // ページの左端から、要素の左端までの距離
    const px = window.scrollX + clientRect.left / 2;
    // ページの上端から、要素の上端までの距離
    const py = window.scrollY + clientRect.top / 2;

    const foreignObject = svg
      .append("foreignObject")
      .attr("class", "contextMenu")
      .attr("x", px)
      .attr("y", py)
      .attr("width", 100)
      .attr("height", 100);
      
      const unGroupId="unGroup";//グループ解除ボタン
    // foreignObject内にHTML要素を追加
    const contextMenu = foreignObject.append("xhtml:div").html(
      `<ul>
      <li><button id="${unGroupId}" style="background:gray; padding:5px;">グループ化解除</button></li></ul>`
    );

    //グループ化解除のボタンがクリックされた時の処理
    const unGroupBtn = d3.select("#unGroup");
    unGroupBtn.on("click", () => {
      const childElems = group.selectAll(".contentBox");
      childElems.each(function () {
        const childElem = d3.select(this);
        d3.select("#svg").append(() => childElem.node());
      });

      //矢印ハンドルを削除
      const hundleIds = getArrowHundleId(group.attr("id"));
      hundleIds.forEach((id) => d3.select("#" + id).remove());
      //グループ図形を削除
      group.remove();
      foreignObject.remove();
    });
  });
}

//要素の属性を一括で設定する
// element:属性を指定したい要素 attributes:指定する属性と値をオブジェクト形式で指定（例：{attribute:value}）
function setAttributes(element, attributes) {
  const arr = Object.entries(attributes);
  arr.forEach(function ([attribute, value]) {
    element.setAttribute(attribute, value);
  });
}

// DOMツリーが変更された際の処理
function mutationOberver() {
  // ターゲット要素を取得
  const targetNode = document.getElementById("svg");

  // MutationObserverを生成
  const observer = new MutationObserver((mutationsList, observer) => {
    mutationsList.forEach((mutation) => {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        // 子ノードの追加が検出された場合の処理
        mutation.addedNodes.forEach((elem) => {
          if (elem.classList.contains("contentBox") == true)
            addGroupEvent(mutation.addedNodes);
          const shape = d3.select(elem);
          if (!shape.select(".arrow").empty()) {
            count++;
            displayToArrow(count);
          }
        });
      } else if (mutation.type === "childList") {
        IsClickArray = [];
      }
    });
  });

  // 監視オプションを設定
  const config = { childList: true };

  // オブザーバをターゲットに適用
  observer.observe(targetNode, config);
}

// 図形クリック時の処理
function addGroupEvent(contentBoxes) {
  for (let i = 0; i < contentBoxes.length; i++) {
    const contentBox = d3.select("#" + contentBoxes[i].id);
    contentBox.on("click", (e) => {
      //シフトキーを押していて、isclickArrayに図形のidが含まれていなければ
      const id = contentBox.attr("id");
      if (e.shiftKey && !IsClickArray.includes(id)) {
        // 図形のidをisClickArrayに追加する
        IsClickArray.push(id);
      }
    });
    //コンテキストメニューの表示
    displayContextMenu(contentBox.node());
  }
}
