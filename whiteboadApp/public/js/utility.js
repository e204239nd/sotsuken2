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
     /*   if (elem.select(".arrow_frame")) {
        const seg = getArrowPos(elem.select(".arrow").attr("d"));
        elemX = seg.x;
        elemY = seg.y;
        elemWidth = Math.abs(elemX -seg.endX);
      elemHeight = Math.abs(elemY - seg.endY);
      //   console.log(
      //     "elemX:" +
      //       elemX +
      //       " elemY:" +
      //       elemY +
      //       "\n" +
      //       "elemWidth:" +
      //       elemWidth +
      //       "elemHeight:" +
      //       elemHeight
      //   );
      }  */
      // 最小のX座標とY座標を更新
      minX = Math.min(minX, elemX);
      minY = Math.min(minY, elemY);
  
      // 最大のX座標とY座標を更新
      maxX = Math.max(maxX, elemX + elemWidth);
      maxY = Math.max(maxY, elemY + elemHeight);
    });
  
    // 最小の矩形の位置とサイズを設定
    const frame = group.select(".group_frame");
    frame
      .attr("x", minX)
      .attr("y", minY)
      .attr("width", maxX - minX)
      .attr("height", maxY - minY);
  }
  
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
    shape.call(d3.drag().on("start", start).on("drag", drag));
  }

  // 図形クリック時の処理
function clickEventHundler(contentBoxes) {
    for (let i = 0; i < contentBoxes.length; i++) {
      let contentBox = contentBoxes[i];
  
      contentBox.addEventListener("click", (e) => {
        // グループ化した図形は追加しない
        // if (contentBox.cla == "groupObj") return;
  
        //シフトキーを押していて、isclickArrayに図形のidが含まれていなければ
        if (e.shiftKey && !IsClickArray.includes(contentBox.id)) {
        //   if (contentBox.classList[0] == "groupObj") {
        //     const frame = contentBox.querySelector(".group_frame");
        //     frame.setAttribute("opacity", 0.7);
        //   }
  
          // 図形のidをisClickArrayに追加する
          IsClickArray.push(contentBox.id);
        }
      });
      //コンテキストメニューの表示
      displayContextMenu(contentBox);
    }
  }