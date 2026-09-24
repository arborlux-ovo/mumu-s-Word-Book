// ========== 本地存储工具函数 ==========
const STORAGE_KEY = "mumu_wordbook";
function getWords(){
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
}
function saveWords(arr){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

// ========== 页面切换 ==========
function showPage(pageName){
    const pageHome = document.getElementById("page-home");
    const pageAdd = document.getElementById("page-add");
    const pageReview = document.getElementById("page-review");
    const pagePractice = document.getElementById("page-practice");

    pageHome.style.display = "none";
    pageAdd.style.display = "none";
    pageReview.style.display = "none";
    pagePractice.style.display = "none";

    if(pageName === "home"){
        pageHome.style.display = "block";
        renderHomeList();
    }else if(pageName === "add"){
        pageAdd.style.display = "flex";
        //切换到新词页面，清除绿色高亮
        clearInputHighlight();
    }else if(pageName === "review"){
        pageReview.style.display = "flex";
        renderAllWordList();
    }else if(pageName === "practice"){
        pagePractice.style.display = "flex";
    }
}

// 清除输入框绿色边框
function clearInputHighlight(){
    const eng = document.getElementById("engInput");
    const chn = document.getElementById("chnInput");
    eng.classList.remove("duplicate");
    chn.classList.remove("duplicate");
}

// ========== 添加单词【新增单词默认 status:new，进入首页新词栏】 ==========
function addWord(){
    const engInput = document.getElementById("engInput");
    const chnInput = document.getElementById("chnInput");
    const eng = engInput.value.trim();
    const chn = chnInput.value.trim();

    clearInputHighlight();

    if(!eng || !chn){
        alert("英文和中文不能为空！");
        return;
    }
    const words = getWords();
    // 判断是否存在完全相同英文+中文的单词
    const isDuplicate = words.some(w=> w.english === eng && w.chinese === chn);
    if(isDuplicate){
        alert("添加失败，该单词已存在");
        engInput.classList.add("duplicate");
        chnInput.classList.add("duplicate");
        return;
    }

    words.push({
        english: eng,
        chinese: chn,
        status:"new"
    });
    saveWords(words);
    clearInput();
    alert("添加成功！");
    showPage("home");
}
//清空输入框
function clearInput(){
    document.getElementById("engInput").value = "";
    document.getElementById("chnInput").value = "";
    clearInputHighlight();
}

// ========== 单词状态跳转逻辑 ==========
function wordCheck(index){
    const words = getWords();
    const word = words[index];
    if(word.status === "new"){
        //新词栏点√ → 移动到首页复习栏 status:review
        word.status = "review";
    }else if(word.status === "review"){
        //首页复习栏点√ → 完成，status:finished，首页不再出现
        word.status = "finished";
    }
    saveWords(words);
    renderHomeList();
    renderAllWordList();
}
//删除单词
function deleteWord(index){
    const words = getWords();
    words.splice(index,1);
    saveWords(words);
    renderHomeList();
    renderAllWordList();
}

// 首页左右两栏渲染：只展示 new 和 review 的单词，finished不显示在首页
function renderHomeList(){
    const words = getWords();
    const reviewDom = document.getElementById("home-review-list");
    const newDom = document.getElementById("home-new-list");
    reviewDom.innerHTML = "";
    newDom.innerHTML = "";

    //筛选并且最多取7条
    const newList = words.filter(item=>item.status === "new").slice(0,7);
    const reviewList = words.filter(item=>item.status === "review").slice(0,7);

    newList.forEach(item=>{
        const idx = words.indexOf(item);
        const row = document.createElement("div");
        row.className = "word-row";
        row.innerHTML = `
            <span>${item.english} : ${item.chinese}</span>
            <span class="check-mark">
                <span onclick="wordCheck(${idx})">✓</span>
                <span onclick="deleteWord(${idx})"> ×</span>
            </span>
        `;
        newDom.appendChild(row);
    })

    reviewList.forEach(item=>{
        const idx = words.indexOf(item);
        const row = document.createElement("div");
        row.className = "word-row";
        row.innerHTML = `
            <span>${item.english} : ${item.chinese}</span>
            <span class="check-mark">
                <span onclick="wordCheck(${idx})">✓</span>
                <span onclick="deleteWord(${idx})"> ×</span>
            </span>
        `;
        reviewDom.appendChild(row);
    })
}

// ========== 总复习页面：渲染【全部单词】不管任何状态 ==========
function renderAllWordList(){
    const words = getWords();
    const container = document.getElementById("all-word-list");
    container.innerHTML = "";

    words.forEach((item,index)=>{
        const row = document.createElement("div");
        row.className = "word-row";
        row.innerHTML = `
            <span>${item.english} : ${item.chinese}</span>
            <span class="check-mark">
                <span onclick="deleteWord(${index})">×</span>
            </span>
        `;
        container.appendChild(row);
    })
}

// ========== 练习页面功能（练习读取全部单词） ==========
// 顺序取前10个单词
function getOrderWords(){
    const allWords = getWords();
    if(allWords.length === 0){
        alert("还没有单词，请先添加单词！");
        return;
    }
    const pickWords = allWords.slice(0,10);
    renderPracticeCard(pickWords);
}
//随机抽取10个不重复单词
function getRandomWords(){
    const allWords = getWords();
    if(allWords.length === 0){
        alert("还没有单词，请先添加单词！");
    }
    //打乱数组
    const shuffleArr = [...allWords].sort(()=> Math.random()-0.5);
    const pickWords = shuffleArr.slice(0,10);
    renderPracticeCard(pickWords);
}
//渲染练习卡片，点击卡片切换显示英文/中文
function renderPracticeCard(wordList){
    const container = document.getElementById("practice-container");
    container.innerHTML = "";
    wordList.forEach(word=>{
        let showEng = true;
        const card = document.createElement("div");
        card.className = "practice-card";
        card.innerText = word.english;
        card.onclick = function(){
            showEng = !showEng;
            card.innerText = showEng ? word.english : word.chinese;
        }
        container.appendChild(card);
    })
}

// ========== 联系弹窗JS函数 ==========
function openContactModal(){
    document.getElementById("contactMask").style.display = "flex";
}
function closeContactModal(){
    document.getElementById("contactMask").style.display = "none";
}
//使用说明弹窗函数
function openHelpModal(){
    document.getElementById("helpMask").style.display = "flex";
}
function closeHelpModal(){
    document.getElementById("helpMask").style.display = "none";
}

// 页面初始化，进入页面立刻弹出使用说明弹窗
window.onload = function(){
    const initWords = getWords();
    if(initWords.length === 0){
        const demoList = [
            {english:"apple",chinese:"苹果",status:"new"},
            {english:"banana",chinese:"香蕉",status:"new"},
            {english:"cat",chinese:"猫",status:"new"},
            {english:"dog",chinese:"狗",status:"new"},
            {english:"egg",chinese:"鸡蛋",status:"new"},
            {english:"fish",chinese:"鱼",status:"new"},
            {english:"goat",chinese:"山羊",status:"new"},
            {english:"hat",chinese:"帽子",status:"new"},
            {english:"ice",chinese:"冰",status:"new"},
            {english:"juice",chinese:"果汁",status:"new"},
        ];
        saveWords(demoList);
    }

    showPage("home");
    openHelpModal();
}