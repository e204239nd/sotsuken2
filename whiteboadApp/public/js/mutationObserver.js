
// DOMツリーが変更された際の処理
function mutationOberver() {
  // ターゲット要素を取得
  const targetNode = document.getElementById("#svg");
  
  // MutationObserverを生成
  const observer = new MutationObserver((mutationsList, observer) => {
    mutationsList.forEach((mutation) => {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        console.log(mutation.addedNodes);
        // 子ノードの追加が検出された場合の処理
        console.log("子ノードの追加が検出されました");
      }if (mutation.type === "childList") {
          console.log("子ノードの削除が検出されました");
      }
    });
  });
  
  // 監視オプションを設定
  const config = { childList: true };
  
  // オブザーバをターゲットに適用
  observer.observe(targetNode, config);
  }