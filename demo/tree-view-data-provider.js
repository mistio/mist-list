function treeViewDataProvider(opts, callback) {
  const mistList = this.querySelector('mist-list');
  if (!mistList) return;
  const items = Object.values(mistList.itemMap);

  let data = [];
  if (!mistList.treeView) data = items;
  else if (opts.parentItem) {
    data = items.filter(item => item.parent === opts.parentItem.id);
  } else {
    data = items.filter(item => item && item.parent.length === 0);
  }

  callback(data, data.length);
}

function hasChildren(item) {
  return item.hasChildren;
}

export { treeViewDataProvider, hasChildren };
