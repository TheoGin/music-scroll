/**
 * 将'[03:52.20'转为秒
 * @param {string} time 接收'[03:52.20'
 */
function parseTimeToSecond(time) {
  var parts = time.split(":");
  return +parts[0].substring(1) * 60 + +parts[1];
}

/**
 * 将歌词字符串转为对象数组
 * @param {string} str 接收歌词字符串参数
 */
function parseSongStr(str) {
  var songArr = str.split("\n");
  var results = [];
  for (var i = 0; i < songArr.length; i++) {
    var partArr = songArr[i].split("]");
    var obj = {
      time: parseTimeToSecond(partArr[0]),
      words: partArr[1],
    };
    results.push(obj);
  }
  return results;
}

var lrcData = parseSongStr(lrc);
// console.log(lrcData);

var doms = {
  audio: document.querySelector("audio"),
  ul: document.querySelector(".container ul"),
  container: document.querySelector(".container"),
};

/**
 * 找到当前audio时间对应lrcData的下标
 * @returns lrcData数组的下标
 * 考虑边界问题：-1表示当前时间为0；超出部分显示最后一行歌词lrcData.length - 1
 */
function findIndex() {
  var curTime = doms.audio.currentTime;
  for (var i = 0; i < lrcData.length; i++) {
    if (lrcData[i].time > curTime) {
      return i - 1;
    }
  }
  // 超出部分显示最后一行歌词
  return lrcData.length - 1;
}

// function createLrcElements() {
//   for (var i = 0; i < lrcData.length; i++) {
//     var li = document.createElement("li");
//     li.textContent = lrcData[i].words;
//     doms.ul.appendChild(li) // 每加一个元素会导致reflow ---> 用document.createDocumentFragment()文档碎片
//   }
// }
/**
 * 根据lrcData数组创建每一个li元素，并用 文档碎片 来优化
 * 避免每加一个元素会导致reflow
 */
function createLrcElements() {
  var frament = document.createDocumentFragment();
  for (var i = 0; i < lrcData.length; i++) {
    var li = document.createElement("li");
    li.textContent = lrcData[i].words;
    frament.appendChild(li); // 每加一个元素会导致reflow
  }
  doms.ul.appendChild(frament);
}
createLrcElements();

var containerHeight = doms.container.clientHeight;
var liHeight = doms.ul.children[0].clientHeight;
var maxOffset = doms.ul.clientHeight - containerHeight;

/**
 * ul距离容器div的偏移量
 */
function setOffset() {
  var index = findIndex();
  var offset = index * liHeight + liHeight / 2 - containerHeight / 2;
  if (offset < 0) {
    offset = 0;
  }
  if (offset > maxOffset) {
    offset = maxOffset;
  }
  // 去掉之前的active类名
  var li = doms.ul.querySelector(".active");
  if (li) {
    // 一开始可能没有.active的类名
    li.classList.remove("active");
    // 或者，更推荐上面那种写法
    // li.className = ''
  }

  li = doms.ul.children[index];
  if (li) {
    // index有可能为-1
    // li.className = "active";
    li.classList.add("active");
  }
  doms.ul.style.transform = `translateY(-${offset}px)`;
  //   console.log(offset);
}


doms.audio.addEventListener('timeupdate', setOffset);