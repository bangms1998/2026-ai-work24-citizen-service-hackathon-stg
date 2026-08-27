const KEY='work24-admin-prototype-v2';
const defaults={
  notices:[
    {id:2,kind:'공지',title:'고용24 AI 공모전 테스트사이트 안내',date:'2026-08-27',visible:true},
    {id:1,kind:'예정',title:'최종 공모요강은 확정 후 게시됩니다',date:'[미정]',visible:true}
  ],
  faqs:[
    {id:1,question:'접수는 어디에서 하나요?',answer:'접수기간이 시작되면 메인 화면에서 승인된 Google Form으로 이동합니다.'},
    {id:2,question:'회원가입이 필요한가요?',answer:'사이트 별도 회원가입은 없으며 파일 업로드 정책은 확인 필요입니다.'},
    {id:3,question:'제출 후 수정할 수 있나요?',answer:'응답 수정 허용 여부와 기간은 확인 필요입니다.'}
  ],
  popup:{enabled:false,title:'공모전 안내',body:'현재 공모요강은 최종 확정 전입니다.',start:'',end:''},
  versions:[],draft:null
};
let state=loadState();
const $=(selector,scope=document)=>scope.querySelector(selector);
const $$=(selector,scope=document)=>[...scope.querySelectorAll(selector)];
const status=$('#adminStatus');
const form=$('#contentForm');
const applyButton=$('#applyButtonAdmin');
const saveState=$('#saveState');
const dialog=$('#previewDialog');
let baseline='';

function loadState(){try{return {...structuredClone(defaults),...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return structuredClone(defaults)}}
function persist(){localStorage.setItem(KEY,JSON.stringify(state))}
function announce(message){status.textContent=message}
function values(){return Object.fromEntries(new FormData(form))}
function serialize(){return JSON.stringify(values())}
function valid(){const data=values();return form.checkValidity()&&!(data.contestState==='OPEN'&&!data.formUrl)}
function setDirty(){const dirty=serialize()!==baseline;applyButton.disabled=!(dirty&&valid());saveState.textContent=dirty?'저장하지 않은 변경사항이 있습니다.':'저장된 변경사항 없음';saveState.classList.toggle('dirty',dirty)}
function showView(target){$$('[data-admin-view]').forEach(view=>view.classList.toggle('is-active',view.dataset.adminView===target));$$('[data-admin-target]').forEach(button=>button.setAttribute('aria-current',button.dataset.adminTarget===target?'page':'false'));location.hash=target==='home'?'':target;scrollTo({top:0,behavior:'instant'})}
$$('[data-admin-target]').forEach(button=>button.addEventListener('click',()=>showView(button.dataset.adminTarget)));
$$('[data-go]').forEach(button=>button.addEventListener('click',()=>showView(button.dataset.go)));

function renderNotices(){const list=$('#noticeAdminList');list.innerHTML='';state.notices.forEach(item=>{const li=document.createElement('li');li.innerHTML=`<div><span>${item.kind}</span><strong>${item.title}</strong><small>${item.date}</small></div>`;const remove=document.createElement('button');remove.type='button';remove.textContent='삭제';remove.addEventListener('click',()=>{state.notices=state.notices.filter(entry=>entry.id!==item.id);persist();renderAll();announce('TEST 공지를 삭제했습니다.')});li.append(remove);list.append(li)});$('#noticeListCount').textContent=`${state.notices.length}건`;$('#noticeCount').textContent=state.notices.length}
function renderFaqs(){const list=$('#faqAdminList');list.innerHTML='';state.faqs.forEach(item=>{const li=document.createElement('li');li.innerHTML=`<div><strong>${item.question}</strong><small>${item.answer}</small></div>`;const remove=document.createElement('button');remove.type='button';remove.textContent='삭제';remove.addEventListener('click',()=>{state.faqs=state.faqs.filter(entry=>entry.id!==item.id);persist();renderAll();announce('TEST FAQ를 삭제했습니다.')});li.append(remove);list.append(li)});$('#faqListCount').textContent=`${state.faqs.length}건`;$('#faqCount').textContent=state.faqs.length}
function renderVersions(){const list=$('#versionList');list.innerHTML='';if(!state.versions.length){list.innerHTML='<li><span>적용된 버전 없음</span><button type="button" disabled>롤백</button></li>'}else{[...state.versions].reverse().forEach(release=>{const li=document.createElement('li');li.innerHTML=`<span><strong>v${release.version}</strong><small>${release.appliedAt}</small></span>`;const button=document.createElement('button');button.type='button';button.textContent='롤백';button.addEventListener('click',()=>rollback(release));li.append(button);list.append(li)})}$('#versionCount').textContent=`v${state.versions.length}`}
function rollback(release){Object.entries(release.content).forEach(([key,value])=>{if(form.elements[key])form.elements[key].value=value});state.versions.push({version:state.versions.length+1,appliedAt:new Date().toLocaleString('ko-KR'),content:release.content,rollbackOf:release.version});baseline=serialize();state.draft=release.content;persist();setDirty();renderVersions();announce(`v${release.version} 기준 롤백 버전을 적용했습니다.`)}

$('#noticeForm').addEventListener('submit',event=>{event.preventDefault();const data=Object.fromEntries(new FormData(event.currentTarget));state.notices.unshift({id:Date.now(),...data,visible:true});persist();event.currentTarget.reset();$('#noticeDate').value='2026-08-27';renderAll();announce('TEST 공지를 추가했습니다.')});
$('#faqForm').addEventListener('submit',event=>{event.preventDefault();const data=Object.fromEntries(new FormData(event.currentTarget));state.faqs.push({id:Date.now(),...data});persist();event.currentTarget.reset();renderAll();announce('TEST FAQ를 추가했습니다.')});
$('#popupForm').addEventListener('submit',event=>{event.preventDefault();const data=Object.fromEntries(new FormData(event.currentTarget));state.popup={...data,enabled:$('#popupEnabled').checked};persist();announce('팝업 설정을 이 브라우저에 저장했습니다. 공개 사이트에는 게시되지 않았습니다.')});

form.addEventListener('input',setDirty);form.addEventListener('change',setDirty);
$('#draftButton').addEventListener('click',()=>{state.draft=values();persist();baseline=serialize();setDirty();announce('이 브라우저에 임시저장했습니다.')});
$('#discardButton').addEventListener('click',()=>{const saved=JSON.parse(baseline);Object.entries(saved).forEach(([key,value])=>{if(form.elements[key])form.elements[key].value=value});setDirty();announce('저장하지 않은 변경사항을 취소했습니다.')});
$('#previewButton').addEventListener('click',()=>{const data=values();$('#previewTitle').textContent=data.contestTitle;$('#previewHero').textContent=data.heroTitle;$('#previewLead').textContent=data.heroLead;$('#previewState').textContent=`접수 상태: ${data.contestState}`;dialog.showModal()});
$('#closePreview').addEventListener('click',()=>dialog.close());
applyButton.addEventListener('click',()=>{if(!valid()){form.reportValidity();announce('OPEN 상태에는 승인된 Form URL이 필요합니다.');return}const release={version:state.versions.length+1,appliedAt:new Date().toLocaleString('ko-KR'),content:values()};state.versions.push(release);state.draft=release.content;baseline=serialize();persist();setDirty();renderVersions();announce(`v${release.version}을 TEST 브라우저에 적용했습니다. 실제 공개 게시가 아닙니다.`)});

const inquiries=[
  {receipt:'W24-Q-TEST-001',status:'미답변',title:'접수 일정 문의',date:'2026-08-27',email:'sample1@example.test'},
  {receipt:'W24-Q-TEST-002',status:'확인',title:'팀 참가 자격 문의',date:'2026-08-26',email:'sample2@example.test'}
];
function renderInquiries(query=''){const normalized=query.trim().toLowerCase();const rows=inquiries.filter(item=>Object.values(item).some(value=>String(value).toLowerCase().includes(normalized)));$('#inquiryList').innerHTML=rows.map(item=>`<article><div><span>${item.status}</span><h2>${item.title}</h2><p>${item.receipt} · ${item.date}</p></div><dl><div><dt>문의자</dt><dd>${item.email}</dd></div><div><dt>개인정보</dt><dd>TEST 가상정보</dd></div></dl><button type="button" disabled>이메일 답변 · 운영 연결 필요</button></article>`).join('');$('#inquiryResult').textContent=`${rows.length}건`}
$('#inquirySearch').addEventListener('input',event=>renderInquiries(event.target.value));
function downloadInquiryCsv(){const lines=['접수번호,상태,제목,작성일',...inquiries.map(item=>[item.receipt,item.status,item.title,item.date].map(value=>`"${value}"`).join(','))];const blob=new Blob([`\ufeff${lines.join('\n')}`],{type:'text/csv;charset=utf-8'});const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download='work24-test-inquiries.csv';link.click();URL.revokeObjectURL(link.href);announce('가상 문의 TEST CSV를 내려받았습니다.')}
$('#inquiryCsv').addEventListener('click',downloadInquiryCsv);

function renderAll(){renderNotices();renderFaqs();renderVersions();renderInquiries($('#inquirySearch').value)}
function init(){if(state.draft)Object.entries(state.draft).forEach(([key,value])=>{if(form.elements[key])form.elements[key].value=value});Object.entries(state.popup).forEach(([key,value])=>{const control=$(`#popup${key[0].toUpperCase()}${key.slice(1)}`);if(control){if(control.type==='checkbox')control.checked=Boolean(value);else control.value=value}});baseline=serialize();setDirty();renderAll();showView(location.hash.slice(1)||'home')}
init();
