const STEP_IDS = Array.from({length:15}, (_,i)=>`step${i}`);
const STORAGE_KEY = "bayesian-ems-academy-complete-v1";

function getProgress(){
  try{return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}}
  catch(e){return {}}
}
function saveProgress(p){localStorage.setItem(STORAGE_KEY, JSON.stringify(p))}
function renderProgress(){
  const p=getProgress();
  let n=0;
  STEP_IDS.forEach(id=>{
    const done=!!p[id];
    if(done)n++;
    const link=document.querySelector(`#courseNav a[data-step="${id}"]`);
    if(link)link.classList.toggle("done",done);
    const btn=document.querySelector(`.complete-btn[data-complete="${id}"]`);
    if(btn){btn.classList.toggle("done",done);btn.textContent=done?"本步已完成 ✓":"標記本步完成"}
  });
  document.getElementById("progressText").textContent=`${n} / ${STEP_IDS.length} 完成`;
  const pct=Math.round(n/STEP_IDS.length*100);
  document.getElementById("progressPct").textContent=pct+"%";
  document.getElementById("progressFill").style.width=pct+"%";
}
document.querySelectorAll(".complete-btn").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const p=getProgress(), id=btn.dataset.complete;
    p[id]=!p[id];saveProgress(p);renderProgress();
  });
});
document.getElementById("resetProgress").addEventListener("click",()=>{
  if(confirm("確定清除學習進度？")){localStorage.removeItem(STORAGE_KEY);renderProgress()}
});
renderProgress();

// Mobile menu
const sidebar=document.getElementById("sidebar");
const mobileBtn=document.getElementById("mobileMenuBtn");
mobileBtn.addEventListener("click",()=>{
  const open=sidebar.classList.toggle("open");
  mobileBtn.setAttribute("aria-expanded",String(open));
});
document.querySelectorAll("#courseNav a").forEach(a=>a.addEventListener("click",()=>sidebar.classList.remove("open")));

// Scroll spy
const navLinks=[...document.querySelectorAll("#courseNav a")];
const sections=STEP_IDS.map(id=>document.getElementById(id));
function updateSpy(){
  const y=window.scrollY+130;
  let current=STEP_IDS[0];
  sections.forEach(s=>{if(s.offsetTop<=y)current=s.id});
  navLinks.forEach(a=>a.classList.toggle("active",a.dataset.step===current));
}
window.addEventListener("scroll",updateSpy,{passive:true});updateSpy();

// Micro quiz
document.querySelectorAll(".micro-quiz").forEach(box=>{
  box.querySelectorAll("button").forEach(btn=>btn.addEventListener("click",()=>{
    const ok=btn.dataset.choice===box.dataset.answer;
    const f=box.querySelector(".quiz-feedback");
    f.classList.add("show");
    f.innerHTML=ok?"<b>答對。</b> 新資訊出現後應該更新原本判斷，這就是 Bayesian 的核心動作。":"<b>再想一次。</b> 如果新資訊永遠不改變判斷，就沒有做到 Bayesian updating。";
  }));
});

// Diagnostic Bayes natural-frequency calculator
const DX_PRESETS={low:{prior:1,sens:80,spec:97},mid:{prior:30,sens:80,spec:97},custom:{prior:10,sens:85,spec:85}};
const dxPrior=document.getElementById("dxPrior"),dxSens=document.getElementById("dxSens"),dxSpec=document.getElementById("dxSpec");
function runDx(){
  const prior=+dxPrior.value/100,sens=+dxSens.value/100,spec=+dxSpec.value/100;
  const tp=prior*sens, fp=(1-prior)*(1-spec), posterior=tp/(tp+fp);
  document.getElementById("dxPriorOut").textContent=Math.round(prior*100)+"%";
  document.getElementById("dxSensOut").textContent=Math.round(sens*100)+"%";
  document.getElementById("dxSpecOut").textContent=Math.round(spec*100)+"%";
  document.getElementById("dxPosterior").textContent=(posterior*100).toFixed(1)+"%";
  document.getElementById("dxTP").textContent=Math.round(1000*prior*sens);
  document.getElementById("dxFP").textContent=Math.round(1000*(1-prior)*(1-spec));
  document.getElementById("dxTN").textContent=Math.round(1000*(1-prior)*spec);
  document.getElementById("dxFN").textContent=Math.round(1000*prior*(1-sens));
}
[dxPrior,dxSens,dxSpec].forEach(el=>el.addEventListener("input",()=>{
  document.querySelectorAll("[data-dx-preset]").forEach(b=>b.classList.toggle("active",b.dataset.dxPreset==="custom"));runDx();
}));
document.querySelectorAll("[data-dx-preset]").forEach(btn=>btn.addEventListener("click",()=>{
  const p=DX_PRESETS[btn.dataset.dxPreset];dxPrior.value=p.prior;dxSens.value=p.sens;dxSpec.value=p.spec;
  document.querySelectorAll("[data-dx-preset]").forEach(b=>b.classList.toggle("active",b===btn));runDx();
}));
runDx();

// Research normal-approximation teaching calculator
function erf(x){
  const sign=x<0?-1:1; x=Math.abs(x);
  const a1=.254829592,a2=-.284496736,a3=1.421413741,a4=-1.453152027,a5=1.061405429,p=.3275911;
  const t=1/(1+p*x);
  const y=1-(((((a5*t+a4)*t+a3)*t+a2)*t+a1)*t)*Math.exp(-x*x);
  return sign*y;
}
function cdf(z){return .5*(1+erf(z/Math.sqrt(2)))}
function fmtP(p){
  if(p<.001)return "<.001";
  const s=p.toFixed(3);return s.startsWith("0")?s.slice(1):s;
}
const rEffect=document.getElementById("rEffect"),rSe=document.getElementById("rSe"),rPriorSd=document.getElementById("rPriorSd"),rThreshold=document.getElementById("rThreshold");
function runResearchCalc(){
  const y=+rEffect.value,se=+rSe.value,psd=+rPriorSd.value,thr=+rThreshold.value;
  const z=y/se;
  const p=2*(1-cdf(Math.abs(z)));
  const postVar=1/(1/(psd*psd)+1/(se*se));
  const postSd=Math.sqrt(postVar);
  const postMean=(y/(se*se))*postVar; // prior mean 0
  const probPos=1-cdf((0-postMean)/postSd);
  const probThr=1-cdf((thr-postMean)/postSd);
  const neg=1-probPos, small=Math.max(0,probPos-probThr), meaningful=probThr;

  document.getElementById("rEffectOut").textContent=(y>=0?"+":"")+y.toFixed(2);
  document.getElementById("rSeOut").textContent=se.toFixed(2);
  document.getElementById("rPriorSdOut").textContent=psd.toFixed(2);
  document.getElementById("rThresholdOut").textContent="+"+thr.toFixed(2);
  document.getElementById("rPvalue").textContent=fmtP(p);
  document.getElementById("rProbPositive").textContent=(probPos*100).toFixed(1)+"%";
  document.getElementById("rProbMeaningful").textContent=(probThr*100).toFixed(1)+"%";
  document.getElementById("posteriorNeg").style.width=(neg*100)+"%";
  document.getElementById("posteriorSmall").style.width=(small*100)+"%";
  document.getElementById("posteriorMeaningful").style.width=(meaningful*100)+"%";
  document.getElementById("rInterpretation").innerHTML=
    `同一批資料的傳統雙尾 p-value 約為 <b>${fmtP(p)}</b>。在「Prior 以 0 為中心、寬度 ${psd.toFixed(2)}」的簡化示範下，更新後效果大於 0 的機率約 <b>${(probPos*100).toFixed(1)}%</b>，而超過你設定的 +${thr.toFixed(2)} 實務門檻的機率約 <b>${(probThr*100).toFixed(1)}%</b>。這些機率不是由 1−p 換算，而是 Prior 與資料重新更新後得到。`;
}
[rEffect,rSe,rPriorSd,rThreshold].forEach(el=>el.addEventListener("input",runResearchCalc));runResearchCalc();

// Model chooser
const MODEL_MAP={
  continuous:{plain:"Bayesian linear regression",multi:"Bayesian linear multilevel / mixed model",example:"安全搬運總分、知識分數"},
  binary:{plain:"Bayesian logistic regression",multi:"Bayesian logistic multilevel model",example:"ROSC、插管成功 / 失敗"},
  ordinal:{plain:"Bayesian ordinal regression",multi:"Bayesian ordinal multilevel model",example:"TTM stage 1–5、單題 Likert"},
  count:{plain:"Bayesian Poisson / negative-binomial regression",multi:"Bayesian count multilevel model",example:"錯誤事件次數、出勤事件數"},
  time:{plain:"Bayesian survival model",multi:"Bayesian survival model + group / frailty structure",example:"time-to-event、存活時間"}
};
document.getElementById("chooseModelBtn").addEventListener("click",()=>{
  const y=document.getElementById("modelOutcome").value;
  const clustered=document.getElementById("modelCluster").value==="yes";
  const m=MODEL_MAP[y];
  document.getElementById("modelRecommendation").innerHTML=`<b>${clustered?m.multi:m.plain}</b><br>例：${m.example}。${clustered?"因為資料有重複測量或群集，模型要明確處理這個層級。":""}`;
});
document.getElementById("chooseModelBtn").click();

// Copy buttons
document.querySelectorAll(".copy-btn").forEach(btn=>btn.addEventListener("click",async()=>{
  try{await navigator.clipboard.writeText(btn.nextElementSibling.innerText);btn.textContent="已複製";setTimeout(()=>btn.textContent="複製",1000)}
  catch(e){btn.textContent="請手動複製"}
}));

// Glossary
const GLOSSARY=[
  ["Prior","先驗","看這次資料以前，對未知效果合理範圍的設定。不是研究者先決定答案。"],
  ["Likelihood","似然 / 資料證據","資料在不同可能參數值下有多相容；小白先把它理解成「這次資料怎麼把答案往某些地方推」。"],
  ["Posterior","後驗","Prior 和這次資料更新完之後，對未知效果的完整機率分布。"],
  ["Posterior probability","後驗機率","在目前模型與資料下，某件你關心的條件成立的機率，例如效果 > 0。"],
  ["Credible interval","可信區間","用來呈現 posterior 不確定範圍；不要只把它當作「跨不跨 0」的門檻。"],
  ["Weakly informative prior","弱資訊先驗","不強迫答案方向，但排除太離譜的極端效果。"],
  ["Sensitivity analysis","敏感度分析","換幾個合理設定再分析，看結論會不會被某個 Prior 綁死。"],
  ["MCMC","馬可夫鏈蒙地卡羅","電腦反覆探索可能參數值，近似 posterior。初學者重點是會檢查，不必推導。"],
  ["Chain","抽樣鏈","MCMC 的一條探索路線。多條 chain 是從不同起點確認探索是否一致。"],
  ["R-hat","收斂診斷","看多條 chains 是否已經找到相似的 posterior 區域。"],
  ["ESS","有效抽樣數","MCMC draws 中真正提供多少有效資訊，不是研究受試者人數。"],
  ["Posterior predictive check","後驗預測檢查","讓模型模擬資料，看它能不能重現真實資料的大致樣貌。"],
  ["Multilevel model","多層次模型","用來處理病人巢狀於 EMT、分隊、機構，或同一個人重複測量的結構。"],
  ["Random effect","隨機效果","讓不同人、分隊或機構有自己的起點或軌跡；不是『亂數效果』。"],
  ["Ordinal model","有序模型","Outcome 有順序但階段距離未必相等，例如 TTM 1–5。"],
  ["Interaction","交互作用","一個因素的效果是否隨另一因素而變。前後測常關心 group × time。"],
  ["Clinically meaningful threshold","臨床 / 實務重要門檻","事先定義效果要大到多少才值得在實務上在意。"]
];
const dialog=document.getElementById("glossaryDialog"), list=document.getElementById("glossaryList"), search=document.getElementById("glossarySearch");
function renderGlossary(q=""){
  q=q.toLowerCase().trim();
  list.innerHTML=GLOSSARY.filter(x=>x.join(" ").toLowerCase().includes(q)).map(x=>`<div class="glossary-item"><b>${x[0]}</b><span>${x[1]}</span><p>${x[2]}</p></div>`).join("");
}
document.getElementById("openGlossary").addEventListener("click",()=>{renderGlossary();dialog.showModal();search.focus()});
search.addEventListener("input",()=>renderGlossary(search.value));

// Final quiz
const FINAL_QUIZ=[
  {q:"Bayesian 最核心的動作是什麼？",o:["找到 p<.05","新資訊出現後更新對未知事情的判斷","把所有變項都放進 regression","使用四條 chain"],a:1,e:"核心是 updating；其他都是特定分析或運算手段。"},
  {q:"如果傳統分析 p=.09，下列哪個說法正確？",o:["有效機率就是91%","沒有效果的機率是9%","不能只靠 p=.09 推出 posterior probability","Bayesian 一定也會得到不顯著"],a:2,e:"p-value 和 posterior probability 回答不同問題，不能用 1−p 換算。"},
  {q:"TTM 的 1–5 階段最常優先考慮哪種 Outcome 類型？",o:["二元","有序類別","存活時間","計數"],a:1,e:"TTM 有明確順序，但相鄰階段不一定等距。"},
  {q:"介入組與對照組的前後測，最重要通常看什麼？",o:["介入組自己 p<.05 就好","對照組 p>.05 就好","兩組隨時間的改變幅度是否不同","只看後測平均"],a:2,e:"核心常是 group × time / change contrast，而不是各組分開做顯著性判斷。"},
  {q:"R-hat 是用來判斷什麼？",o:["效果有多大","Prior 好不好","不同 MCMC chains 是否收斂到相似區域","樣本數夠不夠"],a:2,e:"R-hat 是 MCMC 收斂診斷，不是效果大小或研究樣本數。"},
  {q:"Posterior predictive check 的白話目的？",o:["把 p-value 轉成機率","看模型模擬的資料像不像真實資料","決定研究倫理","自動選 Prior"],a:1,e:"PPC 是模型合理性檢查：模型能否生成類似你實際看到的資料。"}
];
let ans=0,correct=0;
const fq=document.getElementById("finalQuiz");
fq.innerHTML=FINAL_QUIZ.map((x,i)=>`<div class="quiz-q" data-i="${i}"><div class="qtext">${i+1}. ${x.q}</div>${x.o.map((o,j)=>`<button data-j="${j}">${o}</button>`).join("")}<div class="quiz-explain">${x.e}</div></div>`).join("");
fq.querySelectorAll(".quiz-q").forEach(box=>{
  const i=+box.dataset.i,buttons=[...box.querySelectorAll("button")];
  buttons.forEach(b=>b.addEventListener("click",()=>{
    if(buttons[0].disabled)return;
    const j=+b.dataset.j;
    buttons.forEach(x=>x.disabled=true);
    b.classList.add(j===FINAL_QUIZ[i].a?"correct":"wrong");
    if(j!==FINAL_QUIZ[i].a)buttons[FINAL_QUIZ[i].a].classList.add("correct");
    box.querySelector(".quiz-explain").classList.add("show");
    ans++;if(j===FINAL_QUIZ[i].a)correct++;
    document.getElementById("finalScore").textContent=`已作答：${ans} / ${FINAL_QUIZ.length}　答對：${correct}`;
  }));
});
