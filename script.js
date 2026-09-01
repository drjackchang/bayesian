const IDS=Array.from({length:20},(_,i)=>`s${i}`);
const KEY="hbm-ttm-bayes-progress-v1";
function gp(){try{return JSON.parse(localStorage.getItem(KEY))||{}}catch(e){return{}}}
function rp(){
 const p=gp();let n=0;
 IDS.forEach(id=>{
   if(p[id])n++;
   const a=document.querySelector(`nav a[data-id="${id}"]`);
   const b=document.querySelector(`.done[data-done="${id}"]`);
   if(a)a.classList.toggle("done",!!p[id]);
   if(b){b.classList.toggle("complete",!!p[id]);b.textContent=p[id]?"本步已完成 ✓":"標記本步完成"}
 });
 document.getElementById("progressText").textContent=`${n} / ${IDS.length} 完成`;
 const pct=Math.round(n/IDS.length*100);
 document.getElementById("progressPct").textContent=pct+"%";
 document.getElementById("progressFill").style.width=pct+"%";
}
document.querySelectorAll(".done").forEach(b=>b.onclick=()=>{
 const p=gp(),id=b.dataset.done;p[id]=!p[id];
 localStorage.setItem(KEY,JSON.stringify(p));rp();
});
document.getElementById("reset").onclick=()=>{
 if(confirm("清除所有學習進度？")){localStorage.removeItem(KEY);rp()}
};
rp();

const side=document.getElementById("sidebar");
document.getElementById("mobileBtn").onclick=()=>side.classList.toggle("open");
document.querySelectorAll("nav a").forEach(a=>a.onclick=()=>side.classList.remove("open"));
function spy(){
 let c=IDS[0],y=scrollY+130;
 IDS.forEach(id=>{const s=document.getElementById(id);if(s.offsetTop<=y)c=id});
 document.querySelectorAll("nav a").forEach(a=>a.classList.toggle("active",a.dataset.id===c));
}
addEventListener("scroll",spy,{passive:true});spy();

document.querySelectorAll('input[name="stageDemo"]').forEach(x=>x.onchange=()=>{
 const names=["","前意圖期","意圖期","準備期","行動期","維持期"];
 document.getElementById("stageResult").innerHTML=
 `你選的是 <b>Stage ${x.value}：${names[x.value]}</b>。在資料中它應視為「有順序的類別」，不是單純把 ${x.value} 當成等距連續分數。`;
});

const pr=document.getElementById("priorSlider"), prr=document.getElementById("priorLabResult");
function priorLab(){
 const v=+pr.value;
 const t=v===1
 ?["較保守","極端效果被壓得較多；若資料不強，Posterior 通常會更靠近 0。"]
 :v===2
 ?["溫和弱資訊","正負方向都允許，但不先相信極端巨大效果；適合作為初學概念起點。"]
 :["較寬鬆","允許較大的效果，Posterior 會更受資料本身主導；仍要做 prior predictive check。"];
 prr.innerHTML=`<b>${t[0]}</b><p>${t[1]}</p>`;
}
pr.oninput=priorLab;priorLab();

function erf(x){
 const s=x<0?-1:1;x=Math.abs(x);
 const a1=.254829592,a2=-.284496736,a3=1.421413741,a4=-1.453152027,a5=1.061405429,p=.3275911,t=1/(1+p*x);
 return s*(1-(((((a5*t+a4)*t+a3)*t+a2)*t+a1)*t)*Math.exp(-x*x));
}
function cdf(z){return .5*(1+erf(z/Math.sqrt(2)))}
function fp(p){if(p<.001)return "<.001";let s=p.toFixed(3);return s.startsWith("0")?s.slice(1):s}
const E=document.getElementById("effect"),SE=document.getElementById("se"),PSD=document.getElementById("psd"),TH=document.getElementById("thr");
function bayesLab(){
 const y=+E.value,se=+SE.value,psd=+PSD.value,thr=+TH.value;
 const p=2*(1-cdf(Math.abs(y/se)));
 const postVar=1/(1/(psd*psd)+1/(se*se));
 const postSd=Math.sqrt(postVar), postMean=(y/(se*se))*postVar;
 const pos=1-cdf((0-postMean)/postSd), meaningful=1-cdf((thr-postMean)/postSd);
 document.getElementById("effOut").textContent=(y>=0?"+":"")+y.toFixed(2);
 document.getElementById("seOut").textContent=se.toFixed(2);
 document.getElementById("psdOut").textContent=psd.toFixed(2);
 document.getElementById("thrOut").textContent="+"+thr.toFixed(2);
 document.getElementById("pOut").textContent=fp(p);
 document.getElementById("posOut").textContent=(pos*100).toFixed(1)+"%";
 document.getElementById("meaningOut").textContent=(meaningful*100).toFixed(1)+"%";
 document.getElementById("labInterpret").innerHTML=
 `在這個<b>簡化教學模型</b>裡，傳統雙尾 p 約 <b>${fp(p)}</b>；指定 centered-at-zero、寬度 ${psd.toFixed(2)} 的 Prior 後，Posterior 中效果大於 0 的比例約 <b>${(pos*100).toFixed(1)}%</b>，超過 +${thr.toFixed(2)} 的比例約 <b>${(meaningful*100).toFixed(1)}%</b>。拖動 Prior 寬度，你會看到 posterior probability 會改變，因此它不是 1−p。`;
}
[E,SE,PSD,TH].forEach(x=>x.oninput=bayesLab);bayesLab();

document.querySelectorAll(".copy").forEach(b=>b.onclick=async()=>{
 try{await navigator.clipboard.writeText(b.nextElementSibling.innerText);b.textContent="已複製";setTimeout(()=>b.textContent="複製",900)}
 catch(e){b.textContent="請手動複製"}
});

const terms=[
["HBM","Health Belief Model","以風險、嚴重性、效益、障礙、自我效能與行動線索等認知來理解健康行為的架構。"],
["TTM","Transtheoretical Model","以階段描述行為改變位置。常見為前意圖、意圖、準備、行動、維持；理論本身有重要爭議。"],
["Prior","先驗","看這次資料前，對模型參數合理範圍的機率描述。"],
["Likelihood","似然","模型描述不同參數值與現在資料的相容程度；初學可理解成『資料如何推動不同答案』。"],
["Posterior","後驗","Prior 與資料更新後，對未知參數的完整機率分布。"],
["Posterior probability","後驗機率","例如 P(effect > 0 | data)，是在目前模型與資料下某條件成立的機率。"],
["Credible interval","可信區間","用 posterior 描述參數不確定範圍，不應只拿來當新的顯著性門檻。"],
["Ordinal outcome","有序結果","有順序但級距不必相等，例如 TTM stage 1–5。"],
["MCMC","馬可夫鏈蒙地卡羅","電腦用抽樣方式探索 posterior；初學重點是檢查探索是否穩定。"],
["R-hat","收斂診斷","檢查多條 MCMC chains 是否探索到相似分布。"],
["ESS","有效抽樣數","MCMC draws 中真正有效的資訊量；不是研究受試者人數。"],
["PPC","Posterior Predictive Check","用模型生成模擬資料，檢查模型能否重現真實資料樣貌。"],
["Multilevel","多層次模型","處理同一人重複測量、EMT 屬於分隊等相依資料結構。"],
["Partial pooling","部分匯聚","讓小群組估計同時參考群組自身與整體資料，減少極端不穩定估計。"],
["Interaction","交互作用","一個效果是否隨另一因素改變；前後測常以 group × time 直接估兩組變化差異。"],
["Sensitivity analysis","敏感度分析","用不同合理 Prior 或模型設定重跑，觀察結論是否穩健。"],
["Prior predictive check","先驗預測檢查","只從 Prior 與模型生成可能資料，檢查研究前的模型世界是否荒謬。"]
];
const dlg=document.getElementById("glossary"),gl=document.getElementById("glossaryList"),gs=document.getElementById("glossarySearch");
function rg(q=""){
 q=q.toLowerCase();
 gl.innerHTML=terms.filter(t=>t.join(" ").toLowerCase().includes(q))
 .map(t=>`<div class="gitem"><b>${t[0]}</b><small>${t[1]}</small><p>${t[2]}</p></div>`).join("");
}
document.getElementById("openGlossary").onclick=()=>{rg();dlg.showModal();gs.focus()};
document.getElementById("closeGlossary").onclick=()=>dlg.close();
gs.oninput=()=>rg(gs.value);

const q=[
["HBM×TTM 在本課程中最正確的定位？",["一個官方固定的單一理論","HBM 作為解釋因素、TTM 作為 stage outcome 的研究整合","兩個總分直接相乘","只用來算 Cronbach α"],1,"這是研究者清楚定義角色的理論整合，不是一個官方固定的乘法模型。"],
["為什麼 TTM stage 不直接當普通連續 1–5 分？",["因為不能放進 R","因為有順序但相鄰階段不必等距","因為樣本一定太小","因為 Bayesian 不接受數字"],1,"TTM stage 的關鍵是 ordinal：有順序，不保證等距。"],
["p=.09 時，下列哪句正確？",["有效機率=91%","無效機率=9%","不能由 p=.09 單獨推出 posterior probability","Bayesian 一定也會說無效"],2,"p-value 與 posterior probability 條件不同，不能用 1−p 換算。"],
["介入組 pre/post 顯著、對照組不顯著，可以直接說兩組效果不同嗎？",["可以","不可以，應直接比較 group × time / change contrast","只要樣本>30就可以","Bayesian 才可以"],1,"兩個分開的顯著性判斷不是組間效果差異的檢定。"],
["R-hat 在看什麼？",["效果是否有臨床意義","多條 MCMC chains 是否收斂一致","問卷信度","受試者數是否足夠"],1,"R-hat 是 MCMC convergence diagnostic。"],
["Bayesian 能不能補救測量錯誤的 HBM 題目？",["可以，只要 prior 好","不行，理論與測量品質仍是前提","只要 posterior>95% 就可以","ordinal model 可以"],1,"Bayesian 不會把錯誤構念測量自動變正確。"],
["最適合呈現 HBM→TTM ordinal model 給臨床讀者的方式之一？",["只放 log-odds coefficient","畫不同 HBM profile 的各 stage predicted probabilities","只報 p-value","只報 α"],1,"預測機率通常比原始 ordinal log-odds 更有直覺。"],
["Posterior predictive check 在做什麼？",["把 Prior 改成無資訊","看模型模擬的資料像不像真資料","選出 p<.05 的變項","決定 TTM stage"],1,"PPC 是模型合理性檢查，不是顯著性檢定。"]
];
let answered=0,correct=0;
const qbox=document.getElementById("quiz");
qbox.innerHTML=q.map((x,i)=>`<article data-i="${i}"><b>${i+1}. ${x[0]}</b>${x[1].map((o,j)=>`<button data-j="${j}">${o}</button>`).join("")}<div class="explain">${x[3]}</div></article>`).join("");
qbox.querySelectorAll("article").forEach(a=>{
 const i=+a.dataset.i,bs=[...a.querySelectorAll("button")];
 bs.forEach(b=>b.onclick=()=>{
  if(bs[0].disabled)return;
  const j=+b.dataset.j;bs.forEach(x=>x.disabled=true);
  b.classList.add(j===q[i][2]?"correct":"wrong");
  if(j!==q[i][2])bs[q[i][2]].classList.add("correct");
  a.querySelector(".explain").classList.add("show");
  answered++;if(j===q[i][2])correct++;
  document.getElementById("score").textContent=`已作答 ${answered}/${q.length}｜答對 ${correct}`;
 });
});
