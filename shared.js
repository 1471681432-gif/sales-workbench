/**
 * 运动场材料销售工作台 - 共享数据层 & 工具函数
 * shared.js — desktop.html / app.html / index.html 共用
 */

/* ========== 数据模型常量 ========== */
const KEY_P='sw_projects', KEY_F='sw_followups', KEY_PB='sw_pricebook',
      KEY_DV='sw_deliveries', KEY_CT='sw_contracts', KEY_AL='sw_alerts',
      KEY_SC='sw_scripts', KEY_TPL='sw_templates', KEY_TGT='sw_targets',
      KEY_CUST='sw_customers';

const STAGES=['初步沟通','现场踏勘','方案报价','商务谈判','已签合同','施工进场','竣工待回款','项目完结','丢失项目'];
const STAGE_NEG=[0,1,2,3];
const CUSTOMER_TYPES=['幼儿园','学校','园林总包','工程经销商'];
const FIELD_TYPES=['硅PU','EPDM现浇','人造草','硬地丙烯酸','混合型跑道'];
const COMM_TYPES=['微信','电话','现场面谈'];
const PB_GROUPS=['主材（液体/胶）','EPDM颗粒','再生颗粒','草坪颗粒'];

/* ========== 日期工具 ========== */
const todayStr=()=>{
  const d=new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};
const addDays=(s,n)=>{
  if(!s)return '';
  const d=new Date(s);d.setDate(d.getDate()+n);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};
const monthStr=(s)=>{
  const d=s?new Date(s):new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
};
const weekLabel=()=>{
  const d=new Date();
  const start=new Date(d);start.setDate(d.getDate()-d.getDay()+1);
  const end=new Date(start);end.setDate(start.getDate()+6);
  return `${start.getMonth()+1}/${start.getDate()} - ${end.getMonth()+1}/${end.getDate()}`;
};

/* ========== localStorage CRUD ========== */
const loadP=()=>JSON.parse(localStorage.getItem(KEY_P)||'[]');
const saveP=d=>localStorage.setItem(KEY_P,JSON.stringify(d));
const loadF=()=>JSON.parse(localStorage.getItem(KEY_F)||'[]');
const saveF=d=>localStorage.setItem(KEY_F,JSON.stringify(d));
const loadPB=()=>JSON.parse(localStorage.getItem(KEY_PB)||'{}');
const savePB=d=>localStorage.setItem(KEY_PB,JSON.stringify(d));
const loadDV=()=>JSON.parse(localStorage.getItem(KEY_DV)||'[]');
const saveDV=d=>localStorage.setItem(KEY_DV,JSON.stringify(d));
const loadCT=()=>JSON.parse(localStorage.getItem(KEY_CT)||'[]');
const saveCT=d=>localStorage.setItem(KEY_CT,JSON.stringify(d));
const loadAL=()=>JSON.parse(localStorage.getItem(KEY_AL)||'[]');
const saveAL=d=>localStorage.setItem(KEY_AL,JSON.stringify(d));
const loadSC=()=>JSON.parse(localStorage.getItem(KEY_SC)||'[]');
const saveSC=d=>localStorage.setItem(KEY_SC,JSON.stringify(d));
const loadTPL=()=>JSON.parse(localStorage.getItem(KEY_TPL)||'[]');
const saveTPL=d=>localStorage.setItem(KEY_TPL,JSON.stringify(d));
const loadTGT=()=>JSON.parse(localStorage.getItem(KEY_TGT)||'{}');
const saveTGT=d=>localStorage.setItem(KEY_TGT,JSON.stringify(d));

/* ========== ID生成 ========== */
const nextPid=()=>{const d=loadP();if(!d.length)return'P001';const m=Math.max(...d.map(x=>parseInt(x.id.replace('P',''))||0));return'P'+String(m+1).padStart(3,'0');};
const nextFid=()=>{const d=loadF();if(!d.length)return'F001';const m=Math.max(...d.map(x=>parseInt(x.id.replace('F',''))||0));return'F'+String(m+1).padStart(3,'0');};
const nextDvid=()=>{const d=loadDV();if(!d.length)return'D001';const m=Math.max(...d.map(x=>parseInt(x.id.replace('D',''))||0));return'D'+String(m+1).padStart(3,'0');};
const nextCtid=()=>{const d=loadCT();if(!d.length)return'Q001';const m=Math.max(...d.map(x=>parseInt(x.id.replace(/[QC]/,''))||0));const last=d[d.length-1];const prefix=last.type==='合同'?'C':'Q';return prefix+String(m+1).padStart(3,'0');};
const nextAid=()=>{const d=loadAL();if(!d.length)return'A001';const m=Math.max(...d.map(x=>parseInt(x.id.replace('A',''))||0));return'A'+String(m+1).padStart(3,'0');};

/* ========== 格式化工具 ========== */
const fmtMoney=n=>'¥'+Number(n||0).toFixed(2);
const fmt2=n=>{const v=Number(n||0).toFixed(2);return Number(n||0)<0?'-'+Math.abs(Number(n||0)).toFixed(2):v;};
const escapeHtml=s=>{if(!s)return'';return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');};
const escapeAttr=s=>{if(!s)return'';return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');};
const stagePill=s=>{const i=STAGES.indexOf(s)+1;return`<span class="pill pill-stage-${i}">${s}</span>`;};
const rowClass=stage=>{if(STAGE_NEG.includes(STAGES.indexOf(stage)))return'row-negotiating';if(stage==='竣工待回款')return'row-pending-pay';return'';};
const greet=()=>{const hr=new Date().getHours();return hr<6?'凌晨好':hr<11?'早上好':hr<14?'中午好':hr<18?'下午好':'晚上好';};

/* ========== Toast & Modal ========== */
function toast(msg,type='success'){
  const t=document.getElementById('toast');
  if(!t)return;
  t.textContent=msg;t.className='toast show '+type;
  setTimeout(()=>t.className='toast',2200);
}
function openModal(title,bodyHtml,footHtml){
  document.getElementById('modalTitle').textContent=title;
  document.getElementById('modalBody').innerHTML=bodyHtml;
  document.getElementById('modalFoot').innerHTML=footHtml;
  document.getElementById('mask').classList.add('show');
}
function closeModal(){document.getElementById('mask').classList.remove('show');}

/* ========== 材料价格查询 ========== */
function getMaterialPrice(name, atDate=todayStr()){
  const pb=loadPB();
  const dates=Object.keys(pb).filter(d=>d<=atDate).sort().reverse();
  for(const dt of dates){
    for(const gp of PB_GROUPS){
      const items=pb[dt]?.[gp]||[];
      const it=items.find(x=>x.name===name);
      if(it)return{price:Number(it.price||0),date:dt,pack:it.pack,note:it.note};
    }
  }
  return{price:0,date:'',pack:'',note:''};
}

/* ========== 数据统计汇总 ========== */
function getStats(){
  const ps=loadP(),als=loadAL(),t=todayStr();
  const total=ps.length;
  const active=ps.filter(p=>p.stage!=='项目完结'&&p.stage!=='丢失项目').length;
  const pendingPay=ps.reduce((s,p)=>s+Math.max(0,Number(p.contract||0)-Number(p.paid||0)),0);
  const estCommission=ps.reduce((s,p)=>{const pr=Number(p.contract||0)-Number(p.cost||0);return s+(pr>0?pr*0.35:0);},0);
  const toCallback=ps.filter(p=>p.nextVisit&&p.stage!=='项目完结'&&p.stage!=='丢失项目').length;
  const activeAlerts=als.filter(a=>!a.done&&a.dueDate<=addDays(t,3)).length;
  const totalContract=ps.reduce((s,p)=>s+Number(p.contract||0),0);
  const totalPaid=ps.reduce((s,p)=>s+Number(p.paid||0),0);
  const overdue=ps.filter(p=>p.nextVisit&&p.nextVisit<t&&p.stage!=='项目完结'&&p.stage!=='丢失项目').length;
  const todayTasks=als.filter(a=>!a.done&&a.dueDate===t).length;
  return{total,active,pendingPay,estCommission,toCallback,activeAlerts,totalContract,totalPaid,overdue,todayTasks};
}

/* ========== 客户聚合数据 ========== */
function getCustomerSummary(customerName){
  const ps=loadP().filter(p=>p.customer===customerName);
  const fs=loadF().filter(f=>f.customer===customerName);
  const cts=loadCT().filter(c=>c.customer===customerName);
  const dvs=loadDV().filter(d=>d.customer===customerName);
  const als=loadAL().filter(a=>a.customer===customerName);
  return{projects:ps,followups:fs,contracts:cts,deliveries:dvs,alerts:als,
    totalContract:ps.reduce((s,p)=>s+Number(p.contract||0),0),
    totalPaid:ps.reduce((s,p)=>s+Number(p.paid||0),0),
    activeProjects:ps.filter(p=>p.stage!=='项目完结'&&p.stage!=='丢失项目').length,
    lastContact:fs.length?fs.sort((a,b)=>(b.date||'').localeCompare(a.date||''))[0]:null};
}

/* ========== 所有客户列表 ========== */
function getAllCustomers(){
  const ps=loadP();
  const map={};
  ps.forEach(p=>{
    if(!p.customer)return;
    if(!map[p.customer])map[p.customer]={name:p.customer,type:p.ctype||'',city:p.city||'',contacts:[p.contact],phones:[p.phone],projects:[p.id]};
    else{map[p.customer].contacts.push(p.contact);map[p.customer].phones.push(p.phone);map[p.customer].projects.push(p.id);}
  });
  const fs=loadF();
  fs.forEach(f=>{if(f.customer&&!map[f.customer])map[f.customer]={name:f.customer,type:'',city:'',contacts:[],phones:[],projects:[]};});
  return Object.values(map).map(c=>({...c,contacts:[...new Set(c.contacts.filter(Boolean))],phones:[...new Set(c.phones.filter(Boolean))],projects:[...new Set(c.projects)]}));
}

/* ========== 月度目标 ========== */
function getMonthTarget(ym=monthStr()){
  const tgt=loadTGT();
  return tgt[ym]||{revenue:0,projects:0,actual:0,notes:''};
}
function saveMonthTarget(ym,data){
  const tgt=loadTGT();
  tgt[ym]={...tgt[ym],...data};
  saveTGT(tgt);
}

/* ========== 销售漏斗计算 ========== */
function getFunnelData(){
  const ps=loadP();
  const stages=['初步沟通','现场踏勘','方案报价','商务谈判','已签合同','施工进场','竣工待回款'];
  return stages.map(stage=>{
    const items=ps.filter(p=>p.stage===stage);
    return {
      stage,
      count:items.length,
      amount:items.reduce((s,p)=>s+Number(p.contract||0),0),
      profit:items.reduce((s,p)=>s+(Number(p.contract||0)-Number(p.cost||0)),0)
    };
  });
}

/* ========== 种子数据 ========== */
function seedIfEmpty(){
  if(loadP().length===0){
    const seeds=[
      {id:'P001',name:'阳光幼儿园硅PU球场改造',customer:'阳光幼儿园',contact:'王园长',phone:'138****8888',ctype:'幼儿园',city:'北京朝阳',ftype:'硅PU',area:680,contract:186000,cost:121000,stage:'施工进场',nextVisit:addDays(todayStr(),2),payNode:'施工完成付至80%',paid:148800,attach:'方案v2.pdf',remark:'黑颗粒打底，注意检测报告'},
      {id:'P002',name:'市第三中学EPDM跑道项目',customer:'市第三中学',contact:'李主任',phone:'139****6666',ctype:'学校',city:'北京海淀',ftype:'EPDM现浇',area:1200,contract:360000,cost:235000,stage:'商务谈判',nextVisit:addDays(todayStr(),1),payNode:'签约付30%预付款',paid:0,attach:'',remark:'竞品报低价，重点强调材料环保'},
      {id:'P003',name:'滨江公园人造草坪景观工程',customer:'滨江园林总公司',contact:'张经理',phone:'137****7777',ctype:'园林总包',city:'上海浦东',ftype:'人造草',area:2400,contract:528000,cost:358000,stage:'竣工待回款',nextVisit:addDays(todayStr(),5),payNode:'竣工付尾款20%',paid:422400,attach:'验收报告.pdf',remark:'尾款10.56万待催收'},
      {id:'P004',name:'社区运动中心丙烯酸场地',customer:'活力工程承包商',contact:'陈总',phone:'136****5555',ctype:'工程经销商',city:'广州天河',ftype:'硬地丙烯酸',area:540,contract:98000,cost:68000,stage:'初步沟通',nextVisit:todayStr(),payNode:'未定',paid:0,attach:'',remark:'客户对报价敏感，需提供性价比方案'},
      {id:'P005',name:'少年宫混合型跑道翻新',customer:'少年宫',contact:'刘老师',phone:'135****3333',ctype:'学校',city:'深圳南山',ftype:'混合型跑道',area:1800,contract:495000,cost:320000,stage:'方案报价',nextVisit:addDays(todayStr(),3),payNode:'未定',paid:0,attach:'报价单.pdf',remark:'已发报价，等待反馈'},
    ];
    saveP(seeds);
    saveP([...seeds,{id:'P006',name:'深圳眼苗幼儿园塑胶场地',customer:'深圳眼苗幼儿园',contact:'陈诗意',phone:'18820015321',ctype:'幼儿园',city:'深圳',ftype:'硅PU',area:540,contract:148000,cost:0,stage:'施工进场',nextVisit:addDays(todayStr(),7),payNode:'出厂付60%',paid:88800,attach:'',remark:'见出货单 2026072314'}]);
  }
  if(loadF().length===0){
    const fs=[
      {id:'F001',projectId:'P002',customer:'市第三中学',date:addDays(todayStr(),-3),comm:'电话',content:'确认场地尺寸，发送电子样本',concern:'担心EPDM褪色',todo:'提供3年质保承诺函',nextTime:addDays(todayStr(),1)},
      {id:'F002',projectId:'P002',customer:'市第三中学',date:addDays(todayStr(),-1),comm:'微信',content:'发送案例图及检测报告',concern:'价格比竞品高15%',todo:'准备性价比对比表',nextTime:todayStr()},
      {id:'F003',projectId:'P001',customer:'阳光幼儿园',date:addDays(todayStr(),-2),comm:'现场面谈',content:'现场确认基础平整度，签订施工合同',concern:'施工期间小朋友活动安排',todo:'协调周末施工',nextTime:addDays(todayStr(),2)},
      {id:'F004',projectId:'P005',customer:'少年宫',date:addDays(todayStr(),-4),comm:'电话',content:'首次沟通需求，确认翻新范围',concern:'预算有限',todo:'出三档方案供选择',nextTime:addDays(todayStr(),3)},
    ];
    saveF(fs);
  }
  if(loadDV().length===0){
    saveDV([{id:'D001',projectId:'P006',customer:'深圳眼苗幼儿园',receiver:'陈诗意',phone:'18820015321',address:'深圳眼苗幼儿园',date:'2026-07-23',serial:'2026072314',remark:'等通知放货',items:[
      {name:'胶水',pack:'200KG/桶',qty:42,unit:'桶',weightKg:8400},
      {name:'胶水',pack:'20KG/桶',qty:5,unit:'桶',weightKg:100},
      {name:'划线漆',pack:'6KG/组',qty:3,unit:'组',weightKg:18},
      {name:'打底红颗粒',pack:'25KG/包',qty:1200,unit:'包',weightKg:30000},
      {name:'EPDM面层颗粒1-3',pack:'25KG/包',qty:594,unit:'包',weightKg:14850},
    ]}]);
  }
  if(loadCT().length===0){
    const t=todayStr();
    saveCT([
      {id:'Q001',projectId:'P002',customer:'市第三中学',type:'报价',version:'V1',amount:385000,date:addDays(t,-7),expireDate:addDays(t,7),status:'已发送待反馈',content:'EPDM现浇13%含量,3年质保',payTerms:'签约付30%,施工付40%,验收付25%,质保金5%',attach:'报价单V1.pdf',remark:'竞品报360000,强调环保+质保',followUp:addDays(t,1)},
      {id:'Q002',projectId:'P002',customer:'市第三中学',type:'报价',version:'V2',amount:372000,date:addDays(t,-2),expireDate:addDays(t,14),status:'客户还价中',content:'调整方案:15%含量,含5年质保',payTerms:'签约付30%,施工付40%,验收付25%,质保金5%',attach:'报价单V2.pdf',remark:'让利13000,争取签单',followUp:t},
      {id:'C001',projectId:'P001',customer:'阳光幼儿园',type:'合同',version:'终版',amount:186000,date:addDays(t,-15),expireDate:'',status:'已签订',content:'硅PU球场改造680㎡,含3年质保',payTerms:'预付30%,材料到付40%,完工25%,质保金5%一年',attach:'施工合同.pdf',remark:'原件已寄回',followUp:''},
      {id:'C002',projectId:'P003',customer:'滨江园林总公司',type:'合同',version:'终版',amount:528000,date:addDays(t,-45),expireDate:'',status:'已签订',content:'人造草坪景观工程2400㎡',payTerms:'预付20%,施工50%,验收25%,质保金5%',attach:'工程合同.pdf',remark:'尾款10.56万待催',followUp:addDays(t,3)},
      {id:'Q003',projectId:'P005',customer:'少年宫',type:'报价',version:'V1',amount:495000,date:addDays(t,-5),expireDate:addDays(t,20),status:'已发送待反馈',content:'混合型跑道翻新1800㎡',payTerms:'预付30%,施工40%,验收25%,质保5%',attach:'报价单.pdf',remark:'预算紧张,考虑分档方案',followUp:addDays(t,2)},
    ]);
  }
  if(loadAL().length===0){
    const t=todayStr();
    saveAL([
      {id:'A001',projectId:'P002',customer:'市第三中学',title:'市三中报价V2跟进',priority:'高',dueDate:t,alertType:'报价反馈',note:'客户还价中,今日必须回复是否接受372000',done:false},
      {id:'A002',projectId:'P004',customer:'活力工程承包商',title:'社区运动中心今日回访',priority:'高',dueDate:t,alertType:'客户回访',note:'报价敏感性客户,带性价比方案上门',done:false},
      {id:'A003',projectId:'P003',customer:'滨江园林总公司',title:'滨江公园尾款催收',priority:'高',dueDate:addDays(t,3),alertType:'回款催收',note:'尾款10.56万,联系张经理确认付款流程',done:false},
      {id:'A004',projectId:'P005',customer:'少年宫',title:'少年宫报价跟进',priority:'中',dueDate:addDays(t,2),alertType:'报价反馈',note:'报价V1已发3天,跟进是否收到',done:false},
      {id:'A005',projectId:'P001',customer:'阳光幼儿园',title:'阳光幼儿园施工进度',priority:'中',dueDate:addDays(t,2),alertType:'施工协调',note:'本周末施工,提前协调场地',done:false},
    ]);
  }
  if(loadSC().length===0){
    saveSC([
      {id:'S001',title:'初次报价话术',scene:'电话报价',content:'您好X总，我是运动场材料的小X。上次和您沟通的球场方案已经出来了，我把三挡方案都整理好了，您方便的时候我发给您看看。价格这块我们是有竞争力的，而且全部材料都带检测报告，质保XX年。',tags:'报价,初次'},
      {id:'S002',title:'价格异议处理',scene:'客户嫌贵',content:'理解您的顾虑。我们的材料确实不是最便宜的，但您放心，我们用的是XX含量，检测报告和质保都齐全。市面上有些低价材料用一年就褪色起泡，后续维护成本更高。您看要不要我带个样品现场让您看看质感？',tags:'价格,异议'},
      {id:'S003',title:'催款话术',scene:'催收尾款',content:'张总好，咱们XX项目的尾款XX元快到付款节点了，您看这周方便安排一下吗？如果流程上有什么需要我配合的您随时说。',tags:'催款,回款'},
    ]);
  }
  if(loadTPL().length===0){
    saveTPL([
      {id:'T001',name:'硅PU标准方案',ftype:'硅PU',content:'厚度5mm: ¥XX/㎡\n厚度8mm: ¥XX/㎡\n含：底涂+弹性层+面层+划线\n不含：基础处理',items:[{name:'硅PU材料',qty:1,price:0}]},
      {id:'T002',name:'EPDM跑道方案',ftype:'EPDM现浇',content:'13mm厚: ¥XX/㎡\n含：底涂+EPDM颗粒层+面层+划线\n质保3-5年可选',items:[{name:'EPDM颗粒',qty:1,price:0}]},
    ]);
  }
}

/* ========== 页面导航基础（由HTML覆盖实现） ========== */
let currentPage='dashboard';
function go(page){
  if(!page)return;
  currentPage=page;
  document.querySelectorAll('.nav-item,.mobile-nav-item,[data-page]').forEach(b=>{
    if(b.dataset.page)b.classList.toggle('active',b.dataset.page===page);
  });
  if(typeof render==='function'){render();window.scrollTo(0,0);}
  closeDrawer();
}

/* ========== 快速跟进 ========== */
function openQuickFollowup(){
  const ps=loadP();
  if(!ps.length){toast('还没有项目，请先创建项目','error');return;}
  openModal('快速登记跟进',`
    <div style="font-size:13px;color:var(--muted);margin-bottom:10px">选一个项目，5秒完成跟进登记</div>
    <div class="form-grid">
      <div class="form-item full"><label>关联项目</label><select id="qf_pid">${ps.map(p=>`<option value="${p.id}">${p.id} · ${escapeHtml(p.name)}</option>`).join('')}</select></div>
      <div class="form-item full"><label>沟通方式</label><select id="qf_comm">${COMM_TYPES.map(c=>`<option>${c}</option>`).join('')}</select></div>
      <div class="form-item full"><label>沟通内容</label><textarea id="qf_content" placeholder="本轮沟通要点..."></textarea></div>
      <div class="form-item full"><label>下次联系</label><input id="qf_next" type="date"></div>
    </div>
  `,`<button class="btn btn-ghost" onclick="closeModal()">取消</button><button class="btn btn-primary" onclick="quickAddFollowup()">保存</button>`);
}
function quickAddFollowup(){
  const pid=document.getElementById('qf_pid').value;
  const p=loadP().find(x=>x.id===pid);if(!p){toast('请选项目','error');return;}
  const data={
    id:nextFid(),projectId:pid,customer:p.customer||'',date:todayStr(),
    comm:document.getElementById('qf_comm').value,
    content:document.getElementById('qf_content').value.trim(),
    concern:'',todo:'',
    nextTime:document.getElementById('qf_next').value,
  };
  const fs=loadF();fs.push(data);saveF(fs);
  closeModal();toast('已登记跟进');
  if(typeof render==='function')render();
}

/* ========== 提醒标记操作 ========== */
function setAlertDone(id,done){
  const als=loadAL();const i=als.findIndex(x=>x.id===id);
  if(i>=0){als[i].done=done;saveAL(als);if(typeof render==='function')render();}
}

/* ========== 数据导出 ========== */
function exportAllData(){
  const data={projects:loadP(),followups:loadF(),pricebook:loadPB(),deliveries:loadDV(),contracts:loadCT(),alerts:loadAL(),scripts:loadSC(),templates:loadTPL(),targets:loadTGT()};
  const json=JSON.stringify(data,null,2);
  const blob=new Blob([json],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='销售工作台_数据备份_'+todayStr()+'.json';
  a.click();toast('数据已导出');
}

/* ========== 数据导入 ========== */
function importAllData(jsonStr){
  try{
    const data=JSON.parse(jsonStr);
    if(data.projects)saveP(data.projects);
    if(data.followups)saveF(data.followups);
    if(data.pricebook)savePB(data.pricebook);
    if(data.deliveries)saveDV(data.deliveries);
    if(data.contracts)saveCT(data.contracts);
    if(data.alerts)saveAL(data.alerts);
    if(data.scripts)saveSC(data.scripts);
    if(data.templates)saveTPL(data.templates);
    if(data.targets)saveTGT(data.targets);
    toast('数据导入成功');if(typeof render==='function')render();
  }catch(e){toast('导入失败：数据格式错误','error');}
}

/* ========== 数据同步时间戳 ========== */
function getSyncStamp(){return localStorage.getItem('sd_sync_stamp')||'';}
function updateSyncStamp(){localStorage.setItem('sd_sync_stamp',new Date().toISOString());}

/* ========== PWA 安装提示 ========== */
let deferredPrompt;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;});
function installPWA(){
  if(deferredPrompt){deferredPrompt.prompt();deferredPrompt.userChoice.then(r=>{if(r.outcome==='accepted')toast('安装成功！');deferredPrompt=null;});}
  else{toast('请通过浏览器菜单安装','error');}
}

// 自动初始化种子数据
seedIfEmpty();
