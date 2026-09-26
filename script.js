const KEY = "newLifeAppData_v2";

const appliances = [
  {id:"fridge", name:"冷蔵庫", category:"キッチン", price:40000},
  {id:"washer", name:"洗濯機", category:"洗濯", price:35000},
  {id:"microwave", name:"電子レンジ", category:"キッチン", price:15000},
  {id:"rice", name:"炊飯器", category:"キッチン", price:10000},
  {id:"vacuum", name:"掃除機", category:"掃除", price:15000},
  {id:"bed", name:"ベッド・寝具", category:"家具", price:30000},
  {id:"curtain", name:"カーテン", category:"家具", price:8000},
  {id:"desk", name:"机・椅子", category:"家具", price:15000}
];

const procedureMaster = [
  {id:"property", title:"引っ越し先の物件を決める", desc:"新居が決まっていない場合に最初に進めます。", condition:d=>d.profile.property==="looking", steps:["希望条件を整理する","物件を探す","気になる物件を比較する","物件を決定し、家賃・初期費用を確認する"], url:"https://www.mlit.go.jp/jutakukentiku/house/"},
  {id:"moving", title:"引っ越し業者を探す・見積もりを取る", desc:"荷物量や距離から概算を確認し、必要なら正式見積もりを取ります。", condition:()=>true, steps:["荷物量を確認する","複数の業者を比較する","訪問・オンライン見積もりを確認する","依頼する業者を決める"], url:"https://www.mlit.go.jp/jidosha/jidosha_tk4_000011.html"},
  {id:"electric", title:"電気の使用開始", desc:"新居で電気を使えるようにします。", condition:()=>true, steps:["新居の入居日を確認する","電力会社を決める","使用開始を申し込む","開始日・契約内容を確認する"], url:"https://www.enecho.meti.go.jp/"},
  {id:"gas", title:"ガスの使用開始", desc:"ガス会社への申し込みと、必要な場合は開栓立ち会いを確認します。", condition:()=>true, steps:["ガス会社を確認する","使用開始を申し込む","開栓立ち会いの日時を決める","当日の立ち会いを行う"], url:"https://www.enecho.meti.go.jp/"},
  {id:"water", title:"水道の使用開始", desc:"新居の自治体・水道事業者へ使用開始を申し込みます。", condition:()=>true, steps:["新居の水道事業者を確認する","使用開始日を確認する","使用開始を申し込む","受付内容を保存する"], url:"https://www.mlit.go.jp/mizukokudo/watersupply/"},
  {id:"moveout", title:"転出届", desc:"別の市区町村へ引っ越す場合に確認します。", condition:d=>d.profile.municipality==="different", steps:["現在の自治体の手続き方法を確認する","転出届の提出方法を確認する","必要書類を準備する","転出届を提出する"], url:"https://www.myna.go.jp/"},
  {id:"movein", title:"転入届", desc:"別の市区町村へ引っ越した場合に確認します。", condition:d=>d.profile.municipality==="different", steps:["新住所の自治体を確認する","必要書類を準備する","役所で転入届の手続きをする","完了をチェックする"], url:"https://www.myna.go.jp/"},
  {id:"movechange", title:"転居届", desc:"同じ市区町村内で住所が変わる場合に確認します。", condition:d=>d.profile.municipality==="same", steps:["自治体の窓口・オンライン対応を確認する","必要書類を準備する","転居届を提出する","完了をチェックする"], url:"https://www.myna.go.jp/"},
  {id:"mynumber", title:"マイナンバーカードの住所変更", desc:"マイナンバーカードを持っている場合に確認します。", condition:d=>d.profile.myNumber==="yes", steps:["住所変更の方法を確認する","カードを準備する","自治体で必要な手続きをする","署名用電子証明書等の扱いも確認する"], url:"https://www.kojinbango-card.go.jp/"},
  {id:"work", title:"勤務先・学校への住所変更", desc:"住所変更が必要な勤務先・学校がある場合に確認します。", condition:d=>["worker","student"].includes(d.profile.occupation), steps:["勤務先・学校の担当窓口を確認する","必要な届出を確認する","住所変更を提出する","反映を確認する"], url:"https://www.digital.go.jp/"},
  {id:"mail", title:"郵便物の転送届", desc:"旧住所への郵便物を新住所へ転送するための手続きです。", condition:()=>true, steps:["転送サービスの内容を確認する","本人確認等を準備する","転居届を申し込む","転送開始を確認する"], url:"https://www.post.japanpost.jp/service/tenkyo/"},
  {id:"bank", title:"銀行・クレジットカードの住所変更", desc:"利用している金融サービスの登録住所を更新します。", condition:()=>true, steps:["利用サービスを洗い出す","各サービスの変更方法を確認する","住所変更を行う","登録内容を確認する"], url:"https://www.fsa.go.jp/"},
  {id:"vehicle", title:"車・バイク関係の住所変更", desc:"車やバイクを所有している場合に、必要な登録・保険等を確認します。", condition:d=>d.profile.vehicle!=="none", steps:["車検証・登録情報を確認する","管轄の手続きを確認する","必要書類を準備する","住所変更・保険等を手続きする"], url:"https://www.mlit.go.jp/jidosha/"},
];

let data = loadData();
let currentOnboardingStep = 0;

function defaultData(){
  return {profile:null, tasks:[], procedures:{}, property:{}, movingDate:"", selectedAppliances:["fridge","washer","microwave","rice"], people:"1", luggage:"normal", distance:"short"};
}
function loadData(){
  try{return JSON.parse(localStorage.getItem(KEY)) || defaultData()}catch(e){return defaultData()}
}
function saveData(){localStorage.setItem(KEY, JSON.stringify(data))}
function yen(n){return Number(n||0).toLocaleString()+"円"}
function toast(msg){const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1800)}

document.addEventListener("DOMContentLoaded", ()=>{
  bindNavigation();
  bindOnboarding();
  bindActions();
  renderAppliances();
  if(data.profile) showMain(); else showOnboarding();
});

function showOnboarding(){
  document.getElementById("onboardingPage").classList.remove("hidden");
  document.getElementById("mainApp").classList.add("hidden");
  if(data.profile) fillQuestions(data.profile);
  showOnboardingStep(0);
}
function showMain(){
  document.getElementById("onboardingPage").classList.add("hidden");
  document.getElementById("mainApp").classList.remove("hidden");
  renderAll();
}
function bindNavigation(){
  document.querySelectorAll("[data-page]").forEach(btn=>btn.addEventListener("click",()=>showPage(btn.dataset.page)));
}
function showPage(id){
  document.querySelectorAll(".main-page").forEach(p=>p.classList.add("hidden"));
  const target=document.getElementById(id); if(target) target.classList.remove("hidden");
  document.querySelectorAll(".bottom-nav button").forEach(b=>b.classList.toggle("active",b.dataset.page===id));
  window.scrollTo({top:0,behavior:"smooth"});
  renderAll();
}
function bindOnboarding(){
  document.getElementById("onboardingNext").addEventListener("click",()=>{
    if(!validateCurrentQuestion()) return;
    if(currentOnboardingStep<5) showOnboardingStep(currentOnboardingStep+1);
  });
  document.getElementById("onboardingBack").addEventListener("click",()=>showOnboardingStep(currentOnboardingStep-1));
  document.getElementById("onboardingFinish").addEventListener("click",e=>{});
  document.getElementById("onboardingForm").addEventListener("submit",e=>{
    e.preventDefault();
    if(!document.getElementById("qAgree").checked){toast("確認にチェックを入れてください");return}
    const profile=readQuestions();
    data.profile=profile;
    generateInitialData();
    saveData();
    showMain();
    toast("あなた用の新生活プランを作成しました");
  });
  ["qName","qMovingTiming","qCurrentHome","qProperty","qMunicipality","qMyNumber","qVehicle","qOccupation","qLiving","qLuggage"].forEach(id=>{
    document.getElementById(id).addEventListener("input",updatePreview);
    document.getElementById(id).addEventListener("change",updatePreview);
  });
}
function showOnboardingStep(n){
  currentOnboardingStep=Math.max(0,Math.min(5,n));
  document.querySelectorAll(".question-step").forEach((el,i)=>el.classList.toggle("active",i===currentOnboardingStep));
  document.getElementById("onboardingStepLabel").textContent=`STEP ${currentOnboardingStep+1} / 6`;
  document.getElementById("onboardingBack").disabled=currentOnboardingStep===0;
  document.getElementById("onboardingNext").hidden=currentOnboardingStep===5;
  document.getElementById("onboardingFinish").hidden=currentOnboardingStep!==5;
  updatePreview();
}
function validateCurrentQuestion(){
  const step=document.querySelectorAll(".question-step")[currentOnboardingStep];
  const fields=[...step.querySelectorAll("input,select")].filter(x=>x.type!=="checkbox");
  for(const f of fields){if(!f.value){f.reportValidity();return false}}
  return true;
}
function readQuestions(){
  return {
    name:val("qName"),movingTiming:val("qMovingTiming"),currentHome:val("qCurrentHome"),property:val("qProperty"),
    municipality:val("qMunicipality"),myNumber:val("qMyNumber"),vehicle:val("qVehicle"),occupation:val("qOccupation"),
    living:val("qLiving"),luggage:val("qLuggage")
  };
}
function fillQuestions(p){
  const map={qName:p.name,qMovingTiming:p.movingTiming,qCurrentHome:p.currentHome,qProperty:p.property,qMunicipality:p.municipality,qMyNumber:p.myNumber,qVehicle:p.vehicle,qOccupation:p.occupation,qLiving:p.living,qLuggage:p.luggage};
  Object.entries(map).forEach(([id,v])=>{if(document.getElementById(id))document.getElementById(id).value=v||""});
}
function updatePreview(){
  if(currentOnboardingStep!==5)return;
  const p=readQuestions();
  document.getElementById("answerPreview").innerHTML=`<strong>${esc(p.name||"未入力")}</strong>さん向けに、<br>「${timingText(p.movingTiming)}」「${propertyText(p.property)}」「${municipalityText(p.municipality)}」などの回答をもとに必要な準備を作成します。`;
}
function generateInitialData(){
  const p=data.profile;
  data.tasks=[];
  const add=(name,detail)=>data.tasks.push({id:crypto.randomUUID(),name,detail,completed:false});
  if(p.property==="looking") add("引っ越し先を探す","希望条件を整理して物件を比較する");
  add("引っ越し費用を確認する","荷物量・距離をもとに概算");
  if(p.property==="found") add("物件情報を登録する","家賃・敷金・礼金などを登録");
  add("電気の使用開始を申し込む","入居日に合わせて申し込み");
  add("ガスの使用開始を申し込む","開栓立ち会いが必要か確認");
  add("水道の使用開始を申し込む","新居の水道事業者を確認");
  if(p.municipality==="different") add("転出届を確認する","引っ越し前の自治体の手続きを確認");
  if(p.municipality==="same") add("転居届を確認する","同一市区町村内の住所変更を確認");
  if(p.myNumber==="yes") add("マイナンバーカードの住所変更を確認する","必要な手続きを確認");
  if(["worker","student"].includes(p.occupation)) add("勤務先・学校の住所変更を確認する","担当窓口と期限を確認");
  add("郵便物の転送を申し込む","日本郵便の転居・転送サービスを確認");
  add("銀行・クレジットカードの住所を変更する","利用サービスを洗い出す");
  if(p.vehicle!=="none") add("車・バイクの住所変更を確認する","登録・保険などを確認");
  add("荷造りをする","不要なものを整理して梱包");
  add("引っ越し当日の準備をする","鍵・重要書類などを確認");
  data.procedures={};
}
function bindActions(){
  document.getElementById("resetProfileBtn").addEventListener("click",()=>{
    if(confirm("初期設定をやり直しますか？現在の保存データもリセットされます。")){data=defaultData();saveData();showOnboarding()}
  });
  document.getElementById("editProfileBtn").addEventListener("click",()=>{fillQuestions(data.profile);showOnboarding()});
  document.getElementById("addTaskBtn").addEventListener("click",addTask);
  document.getElementById("taskInput").addEventListener("keydown",e=>{if(e.key==="Enter")addTask()});
  document.getElementById("savePropertyBtn").addEventListener("click",saveProperty);
  ["people","luggage","distance"].forEach(id=>document.getElementById(id).addEventListener("change",()=>{data[id]=val(id);saveData();renderCost()}));
  document.getElementById("movingDate").addEventListener("change",e=>{data.movingDate=e.target.value;saveData();renderSchedule();});
}
function addTask(){
  const input=document.getElementById("taskInput"), name=input.value.trim();
  if(!name){toast("やることを入力してください");return}
  data.tasks.push({id:crypto.randomUUID(),name,detail:"自分で追加",completed:false});input.value="";saveData();renderAll();toast("追加しました");
}
function renderTasks(){
  const list=document.getElementById("taskList"); if(!list)return;
  list.innerHTML="";
  data.tasks.forEach(task=>{
    const row=document.createElement("div");row.className="task-item"+(task.completed?" completed":"");
    row.innerHTML=`<input type="checkbox" ${task.completed?"checked":""}><span class="task-name">${esc(task.name)}</span><button class="delete-button">削除</button>`;
    row.querySelector("input").addEventListener("change",e=>{task.completed=e.target.checked;saveData();renderAll()});
    row.querySelector(".delete-button").addEventListener("click",()=>{data.tasks=data.tasks.filter(t=>t.id!==task.id);saveData();renderAll()});
    list.appendChild(row);
  });
  const done=data.tasks.filter(x=>x.completed).length, total=data.tasks.length, pct=total?Math.round(done/total*100):0;
  document.getElementById("taskProgress").textContent=`完了：${done} / ${total}`;
  document.getElementById("taskProgressBar").style.width=pct+"%";
  document.getElementById("homeTaskCount").textContent=`${done} / ${total}`;
}
function renderHome(){
  const p=data.profile;if(!p)return;
  document.getElementById("welcomeTitle").textContent=`${p.name}さんの新生活`;
  document.getElementById("homeGreeting").textContent=`${p.name}さん、新生活の準備を進めよう`;
  document.getElementById("homeSummary").textContent=`${timingText(p.movingTiming)}・${propertyText(p.property)}。必要な準備を自動で表示しています。`;
  const doneT=data.tasks.filter(x=>x.completed).length,totalT=data.tasks.length;
  const proc=activeProcedures(),doneP=proc.filter(x=>data.procedures[x.id]).length;
  const overallTotal=totalT+proc.length, overallDone=doneT+doneP, pct=overallTotal?Math.round(overallDone/overallTotal*100):0;
  document.getElementById("homeProgress").textContent=pct+"%";
  document.getElementById("homeProcedureCount").textContent=`${doneP} / ${proc.length}`;
  document.getElementById("homeNextDate").textContent=data.movingDate?data.movingDate.replaceAll("-","/").slice(5):"未設定";
  const preview=document.getElementById("homeTaskPreview");preview.innerHTML="";
  data.tasks.filter(t=>!t.completed).slice(0,4).forEach(t=>{const div=document.createElement("div");div.className="task-item";div.innerHTML=`<span>○</span><span class="task-name">${esc(t.name)}</span>`;preview.appendChild(div)});
  if(!preview.children.length)preview.innerHTML='<p class="muted">すべてのやることを完了しました 🎉</p>';
  document.getElementById("profileSummary").innerHTML=[
    ["引っ越し予定",timingText(p.movingTiming)],["物件",propertyText(p.property)],["住所",municipalityText(p.municipality)],["マイナンバー",p.myNumber==="yes"?"あり":"なし"],["車・バイク",vehicleText(p.vehicle)],["仕事・学校",occupationText(p.occupation)]
  ].map(x=>`<div class="profile-item"><small>${x[0]}</small><strong>${x[1]}</strong></div>`).join("");
}
function activeProcedures(){return procedureMaster.filter(x=>!x.condition||x.condition(data))}
function renderProcedures(){
  const list=document.getElementById("procedureList");if(!list)return;
  const active=activeProcedures();list.innerHTML="";
  active.forEach(proc=>{
    const done=!!data.procedures[proc.id];
    const card=document.createElement("div");card.className="card procedure-card";
    card.innerHTML=`<div class="procedure-head"><input type="checkbox" ${done?"checked":""}><div><h3>${proc.title}</h3><p>${proc.desc}</p></div></div>
      <ol class="procedure-steps">${proc.steps.map(s=>`<li>${s}</li>`).join("")}</ol>
      <a class="procedure-link" href="${proc.url}" target="_blank" rel="noopener noreferrer">詳しい情報を公式サイトで確認 →</a>`;
    card.querySelector("input").addEventListener("change",e=>{data.procedures[proc.id]=e.target.checked;saveData();renderAll();});
    list.appendChild(card);
  });
  const done=active.filter(x=>data.procedures[x.id]).length,pct=active.length?Math.round(done/active.length*100):0;
  document.getElementById("procedureProgress").textContent=`完了：${done} / ${active.length}`;
  document.getElementById("procedureProgressBar").style.width=pct+"%";
}
function renderAppliances(){
  const list=document.getElementById("applianceList");list.innerHTML="";
  appliances.forEach(a=>{
    const row=document.createElement("div");row.className="appliance-item";
    row.innerHTML=`<input type="checkbox" ${data.selectedAppliances.includes(a.id)?"checked":""}><div class="appliance-info"><strong>${a.name}</strong><small>${a.category}・目安価格</small></div><span class="appliance-price">${yen(a.price)}</span>`;
    row.querySelector("input").addEventListener("change",e=>{
      if(e.target.checked)data.selectedAppliances.push(a.id);else data.selectedAppliances=data.selectedAppliances.filter(id=>id!==a.id);
      saveData();renderCost();
    });list.appendChild(row);
  });
}
function renderCost(){
  ["propertyName","rent","managementFee","deposit","keyMoney","brokerage","propertyOther"].forEach((id)=>{
    const key={propertyName:"name",rent:"rent",managementFee:"managementFee",deposit:"deposit",keyMoney:"keyMoney",brokerage:"brokerage",propertyOther:"other"}[id];
    document.getElementById(id).value=data.property[key]||"";
  });
  document.getElementById("people").value=data.people;document.getElementById("luggage").value=data.luggage;document.getElementById("distance").value=data.distance;
  const moving=calcMoving(), furniture=calcFurniture();
  document.getElementById("movingResult").textContent=yen(moving);
  document.getElementById("furnitureResult").textContent=yen(furniture);
  const p=data.property,total=Number(p.rent||0)+Number(p.managementFee||0)+Number(p.deposit||0)+Number(p.keyMoney||0)+Number(p.brokerage||0)+Number(p.other||0)+moving+furniture;
  document.getElementById("totalResult").textContent=yen(total);
  document.getElementById("homeCostTotal").textContent=yen(total);
}
function saveProperty(){
  data.property={name:val("propertyName"),rent:num("rent"),managementFee:num("managementFee"),deposit:num("deposit"),keyMoney:num("keyMoney"),brokerage:num("brokerage"),other:num("propertyOther")};
  saveData();renderAll();toast("物件情報を保存しました");
}
function calcMoving(){
  let base=30000;
  const people={1:0,2:20000,3:40000}[data.people]||0;
  const lug={small:0,normal:10000,large:20000}[data.luggage]||0;
  const dist={short:0,middle:20000,long:50000}[data.distance]||0;
  return base+people+lug+dist;
}
function calcFurniture(){return data.selectedAppliances.reduce((sum,id)=>sum+(appliances.find(a=>a.id===id)?.price||0),0)}
function renderSchedule(){
  const date=document.getElementById("movingDate");if(!date)return;
  date.value=data.movingDate||"";
  const list=document.getElementById("scheduleList");list.innerHTML="";
  if(!data.movingDate){list.innerHTML='<p class="muted">引っ越し予定日を設定すると、ここに目安の予定が表示されます。</p>';return}
  const d=new Date(data.movingDate+"T00:00:00");
  const items=[[-30,"引っ越し先・業者を決める"],[-21,"電気・ガス・水道を申し込む"],[-14,"転出届などの必要手続きを確認"],[-7,"荷造りを進める"],[-1,"最終確認・貴重品をまとめる"],[0,"引っ越し当日"],[1,"転入届など引っ越し後の手続き"],[14,"住所変更の抜け漏れを確認"]];
  items.forEach(([offset,name])=>{
    const x=new Date(d);x.setDate(x.getDate()+offset);
    const row=document.createElement("div");row.className="schedule-item";row.innerHTML=`<div class="date-chip">${x.getMonth()+1}/${x.getDate()}</div><div><strong>${name}</strong><div class="muted">${offset<0?"引っ越し前":offset===0?"引っ越し当日":"引っ越し後"}</div></div>`;list.appendChild(row);
  });
}
function renderAll(){renderHome();renderTasks();renderProcedures();renderCost();renderSchedule();renderAppliances()}
function val(id){return document.getElementById(id).value}
function num(id){return Number(document.getElementById(id).value||0)}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function timingText(v){return {oneMonth:"1か月以内", "1month":"1か月以内","2-3months":"2～3か月以内",later:"3か月以上先",unknown:"まだ未定"}[v]||"未設定"}
function propertyText(v){return {found:"物件決定済み",looking:"物件を探している"}[v]||"未設定"}
function municipalityText(v){return {same:"同じ市区町村",different:"別の市区町村",unknown:"まだ未定"}[v]||"未設定"}
function vehicleText(v){return {none:"なし",car:"車",bike:"バイク",both:"車・バイク"}[v]||"未設定"}
function occupationText(v){return {worker:"仕事あり",student:"学生",other:"その他"}[v]||"未設定"}
