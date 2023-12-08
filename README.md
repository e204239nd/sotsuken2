# 各関数の設計
## shape.jsで利用されている関数

#### 1. `displayToRect()`
- 描画モードを切り替え、指定された位置に四角形を描画する。

#### 2. `displayToCircle()`
- 描画モードを切り替え、指定された位置に円を描画する。

#### 3. `rectDragEvent(shape)`
- ドラッグ可能な図形（四角形または円）のドラッグを実装する。

#### 4. `arrow()`
- 矢印を描画するための関数。ページ上をドラッグして矢印の始点と終点を設定し、矢印を作成する。

#### 5. `displayToTextbox(e)`
- テキストボックスを指定された位置に描画し、イベントを設定する。

#### 6. `textBoxMouseEvent(textbox)`
- テキストボックスのマウスイベント（クリック、ダブルクリックなど）を管理する。

#### 7. `displayToImgbox(e)`
- 画像ボックスを指定された位置に描画し、画像のアップロードを処理する。

#### 8. `uploadImg(x, y)`
- 画像のアップロードを行い、指定された位置に画像を挿入する。

#### 9. `setAttributes(element, attributes)`
- 要素の属性を一括で設定する。


## group.jsで利用されている関数:
#### 10. `displayContextMenu(contentBox)`
- コンテキストメニューを表示するための関数。右クリック時の処理や図形のグループ化などを実行する。
  
#### 11. `clickEventHundler(contentBoxes)`
- 図形クリック時の処理を管理する関数。シフトキーの押下や図形のクリックなどを処理する。
  
#### 12. `setFrameSize(group)`
- グループ図形の枠のサイズを変更するための関数。指定されたグループのサイズを計算して枠の大きさを変更する。
  
#### 13. `mutationOberver()`
- DOMツリーが変更された際の処理を管理する関数。子ノードを追加した際に`clickEventHundler()`でグループ化するためのイベントを登録する。
  
#### 14. `debugFunc(str)`
- デバッグ画面を表示するための関数。指定されたテキストをデバッグ用のエリアに表示する。
