/**
 * 解析歌词字符串
 * 得到一个歌词对象的数组
 * 每个歌词对象：
 * {time:开始时间, words: 歌词内容}
 */
function parseSongStr() {
  // lrc在前面引入，所以不需要作为参数传递
  var lines = lrc.split("\n");
  var results = []; // 歌词对象数组
  for (var i = 0; i < lines.length; i++) {
    var partArr = lines[i].split("]");
    var obj = {
      time: parseTimeToSecond(partArr[0]),
      words: partArr[1],
    };
    results.push(obj);
  }
  return results;
}

/**
 * 将一个时间字符串'[03:52.20'解析为数字（秒）
 * @param {String} timeStr 接收'[03:52.20'
 */
function parseTimeToSecond(timeStr) {
  var parts = timeStr.split(":");
  return +parts[0].substring(1) * 60 + +parts[1];
}

var lrcData = parseSongStr();

// 获取需要的 dom
var doms = {
  audio: document.querySelector("audio"),
  ul: document.querySelector(".container ul"),
  container: document.querySelector(".container"),
};

/**
 * 找到当前audio时间对应lrcData的下标
 * @returns lrcData数组的下标
 * 考虑边界问题：如果没有任何一句歌词需要显示，则得到-1; 超出部分显示最后一行歌词lrcData.length - 1
 */
function findIndex() {
  // 播放器当前时间
  var curTime = doms.audio.currentTime;
  for (var i = 0; i < lrcData.length; i++) {
    if (lrcData[i].time > curTime) {
      return i - 1;
    }
  }
  // 找遍了都没找到（说明播放到最后一句），超出部分显示最后一行歌词
  return lrcData.length - 1;
}

// function createLrcElements() {
//   for (var i = 0; i < lrcData.length; i++) {
//     var li = document.createElement("li");
//     li.textContent = lrcData[i].words;
//     doms.ul.appendChild(li) // 每加一个元素会导致reflow ---> 用document.createDocumentFragment()文档碎片
//   }
// }

// 界面

/**
 * 创建歌词元素 li
 * 根据lrcData数组创建每一个li元素，并用 文档碎片 来优化
 * 避免每加一个元素会导致reflow
 */
function createLrcElements() {
  var fragment = document.createDocumentFragment();// 文档片段
  for (var i = 0; i < lrcData.length; i++) {
    var li = document.createElement("li");
    li.textContent = lrcData[i].words;
    fragment.appendChild(li); // 每加一个元素会导致reflow
  }
  doms.ul.appendChild(fragment);
}
createLrcElements();

// 容器高度
var containerHeight = doms.container.clientHeight;
// 每个 li 的高度
var liHeight = doms.ul.children[0].clientHeight;
// 最大偏移量
var maxOffset = doms.ul.clientHeight - containerHeight;

/**
 * 设置 ul 元素距离容器div的偏移量
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

// audio时间一遍，就会触发setOffset回调
doms.audio.addEventListener("timeupdate", setOffset);
