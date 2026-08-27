const KEY='work24-admin-prototype-v3';
const defaults={
  notices:[
    {id:2,kind:'공지',title:'고용24 AI 공모전 테스트사이트 안내',date:'2026-08-27',bodyBefore:'현재 페이지는 기능 검수를 위한 TEST 사이트입니다.',bodyAfter:'최종 내용은 확정 후 게시됩니다.',imageData:'',imageName:'',imageAlt:'',visible:true},
    {id:1,kind:'예정',title:'최종 공모요강은 확정 후 게시됩니다',date:'2026-08-27',bodyBefore:'공모요강은 [확인 필요]입니다.',bodyAfter:'',imageData:'',imageName:'',imageAlt:'',visible:true}
  ],
  faqs:[
    {id:1,question:'접수는 어디에서 하나요?',answer:'접수기간이 시작되면 메인 화면에서 승인된 Google Form으로 이동합니다.'},
    {id:2,question:'회원가입이 필요한가요?',answer:'사이트 별도 회원가입은 없으며 파일 업로드 정책은 확인 필요입니다.'},
    {id:3,question:'제출 후 수정할 수 있나요?',answer:'응답 수정 허용 여부와 기간은 확인 필요입니다.'}
  ],
  popup:{enabled:false,title:'공모전 안내',body:'현재 공모요강은 최종 확정 전입니다.',start:'',end:'',imageData:'',imageName:'',imageAlt:''},
  versions:[],draft:null
};
let state=loadState();
const $=(selector,scope=document)=>scope.querySelector(selector);
const $$=(selector,scope=document)=>[...scope.querySelectorAll(selector)];
const status=$('#adminStatus');
const contentForm=$('#contentForm');
const applyButton=$('#applyButtonAdmin');
const saveState=$('#saveState');
const dialog=$('#previewDialog');
let baseline='';
let editingNoticeId=null;
let editingFaqId=null;
let noticeImage={data:'',name:''};

function loadState(){try{return {...structuredClone(defaults),...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return structuredClone(defaults)}}
function announce(message){status.textContent=message}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(state));return true}catch{announce('브라우저 저장공간이 부족합니다. 이미지 용량을 줄이거나 기존 TEST 항목을 삭제해 주세요.');return false}}
function values(){return Object.fromEntries(new FormData(contentForm))}
function serialize(){return JSON.stringify(values())}
function valid(){const data=values();return contentForm.checkValidity()&&!(data.contestState==='OPEN'&&!data.formUrl)}
function setDirty(){const dirty=serialize()!==baseline;applyButton.disabled=!(dirty&&valid());saveState.textContent=dirty?'저장하지 않은 변경사항이 있습니다.':'저장된 변경사항 없음';saveState.classList.toggle('dirty',dirty)}
function showView(target){const known=$(`[data-admin-view="${target}"]`)?target:'home';$$('[data-admin-view]').forEach(view=>view.classList.toggle('is-active',view.dataset.adminView===known));$$('[data-admin-target]').forEach(button=>button.setAttribute('aria-current',button.dataset.adminTarget===known?'page':'false'));location.hash=known==='home'?'':known;scrollTo({top:0,behavior:'instant'})}
$$('[data-admin-target]').forEach(button=>button.addEventListener('click',()=>showView(button.dataset.adminTarget)));
$$('[data-go]').forEach(button=>button.addEventListener('click',()=>showView(button.dataset.go)));

function createButton(label,onClick){const button=document.createElement('button');button.type='button';button.textContent=label;button.addEventListener('click',onClick);return button}
function renderNotices(){
  const list=$('#noticeAdminList');list.replaceChildren();
  state.notices.forEach(item=>{
    const li=document.createElement('li');
    const copy=document.createElement('div');
    const kind=document.createElement('span');kind.textContent=item.kind;
    const title=document.createElement('strong');title.textContent=item.title;
    const meta=document.createElement('small');meta.textContent=`${item.date}${item.imageData?' · 이미지 포함':''}`;
    copy.append(kind,title,meta);
    const actions=document.createElement('div');actions.className='admin-record-actions';
    actions.append(createButton('수정',()=>startNoticeEdit(item)),createButton('삭제',()=>deleteNotice(item.id)));
    li.append(copy,actions);list.append(li);
  });
  $('#noticeListCount').textContent=`${state.notices.length}건`;$('#noticeCount').textContent=state.notices.length;
}
function startNoticeEdit(item){
  editingNoticeId=item.id;noticeImage={data:item.imageData||'',name:item.imageName||''};
  $('#noticeKind').value=item.kind;$('#noticeDate').value=item.date;$('#noticeTitle').value=item.title;$('#noticeBodyBefore').value=item.bodyBefore||'';$('#noticeBodyAfter').value=item.bodyAfter||'';$('#noticeImageAlt').value=item.imageAlt||'';
  $('#noticeFormTitle').textContent='공지 수정';$('#noticeEditState').textContent='수정 중';$('#noticeSubmit').textContent='공지 수정';$('#noticeCancel').hidden=false;updateMediaPreview('notice',noticeImage.data,noticeImage.name);$('#noticeTitle').focus();
}
function resetNoticeForm(){editingNoticeId=null;noticeImage={data:'',name:''};$('#noticeForm').reset();$('#noticeDate').value=new Date().toISOString().slice(0,10);$('#noticeFormTitle').textContent='공지 등록';$('#noticeEditState').textContent='새 항목';$('#noticeSubmit').textContent='공지 추가';$('#noticeCancel').hidden=true;updateMediaPreview('notice','','')}
function deleteNotice(id){state.notices=state.notices.filter(item=>item.id!==id);if(editingNoticeId===id)resetNoticeForm();persist();renderNotices();announce('TEST 공지를 삭제했습니다.')}
$('#noticeForm').addEventListener('submit',event=>{
  event.preventDefault();const data=Object.fromEntries(new FormData(event.currentTarget));
  const entry={id:editingNoticeId??Date.now(),kind:data.kind,title:data.title,date:data.date,bodyBefore:data.bodyBefore,bodyAfter:data.bodyAfter,imageData:noticeImage.data,imageName:noticeImage.name,imageAlt:data.imageAlt,visible:true};
  if(editingNoticeId===null)state.notices.unshift(entry);else state.notices=state.notices.map(item=>item.id===editingNoticeId?entry:item);
  const message=editingNoticeId===null?'TEST 공지를 추가했습니다.':'TEST 공지를 수정했습니다.';
  if(!persist())return;resetNoticeForm();renderNotices();announce(message);
});
$('#noticeCancel').addEventListener('click',resetNoticeForm);

function renderFaqs(){
  const list=$('#faqAdminList');list.replaceChildren();
  state.faqs.forEach(item=>{
    const li=document.createElement('li');const copy=document.createElement('div');const question=document.createElement('strong');question.textContent=item.question;const answer=document.createElement('small');answer.textContent=item.answer;copy.append(question,answer);
    const actions=document.createElement('div');actions.className='admin-record-actions';actions.append(createButton('수정',()=>startFaqEdit(item)),createButton('삭제',()=>deleteFaq(item.id)));li.append(copy,actions);list.append(li);
  });
  $('#faqListCount').textContent=`${state.faqs.length}건`;$('#faqCount').textContent=state.faqs.length;
}
function startFaqEdit(item){editingFaqId=item.id;$('#faqQuestion').value=item.question;$('#faqAnswer').value=item.answer;$('#faqFormTitle').textContent='FAQ 수정';$('#faqEditState').textContent='수정 중';$('#faqSubmit').textContent='FAQ 수정';$('#faqCancel').hidden=false;$('#faqQuestion').focus()}
function resetFaqForm(){editingFaqId=null;$('#faqForm').reset();$('#faqFormTitle').textContent='FAQ 추가';$('#faqEditState').textContent='새 항목';$('#faqSubmit').textContent='FAQ 추가';$('#faqCancel').hidden=true}
function deleteFaq(id){state.faqs=state.faqs.filter(item=>item.id!==id);if(editingFaqId===id)resetFaqForm();persist();renderFaqs();announce('TEST FAQ를 삭제했습니다.')}
$('#faqForm').addEventListener('submit',event=>{event.preventDefault();const data=Object.fromEntries(new FormData(event.currentTarget));const entry={id:editingFaqId??Date.now(),...data};if(editingFaqId===null)state.faqs.push(entry);else state.faqs=state.faqs.map(item=>item.id===editingFaqId?entry:item);const message=editingFaqId===null?'TEST FAQ를 추가했습니다.':'TEST FAQ를 수정했습니다.';persist();resetFaqForm();renderFaqs();announce(message)});
$('#faqCancel').addEventListener('click',resetFaqForm);

function updateMediaPreview(kind,data,name){
  const frame=$(`#${kind}PreviewFrame`);const image=$(`#${kind}ImagePreview`);const mediaStatus=$(`#${kind}MediaStatus`);
  frame.hidden=!data;image.hidden=!data;image.src=data||'';mediaStatus.textContent=data?`업로드 완료 · ${name||'이미지'} · 브라우저 TEST 저장`:'선택된 이미지가 없습니다.';
}
function readMedia(file,kind,onSuccess){
  if(!file)return;const allowed=['image/png','image/jpeg','image/webp'];
  if(!allowed.includes(file.type)){announce('PNG, JPG, WebP 이미지만 등록할 수 있습니다.');return}
  if(file.size>2*1024*1024){announce('이미지는 2MB 이하만 등록할 수 있습니다.');return}
  const reader=new FileReader();reader.onload=()=>{onSuccess(String(reader.result),file.name);announce(`${kind==='notice'?'공지':'팝업'} 이미지를 TEST 브라우저에 불러왔습니다.`)};reader.onerror=()=>announce('이미지를 읽지 못했습니다. 다른 파일을 선택해 주세요.');reader.readAsDataURL(file);
}
function setupDropzone(kind,onSuccess){
  const zone=$(`#${kind}Dropzone`);const input=$(`#${kind}ImageFile`);const choose=()=>input.click();
  zone.addEventListener('click',choose);zone.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();choose()}});
  ['dragenter','dragover'].forEach(type=>zone.addEventListener(type,event=>{event.preventDefault();zone.classList.add('is-dragging')}));
  zone.addEventListener('dragleave',()=>zone.classList.remove('is-dragging'));
  zone.addEventListener('drop',event=>{event.preventDefault();zone.classList.remove('is-dragging');readMedia(event.dataTransfer?.files?.[0],kind,onSuccess)});
  input.addEventListener('change',event=>{readMedia(event.target.files?.[0],kind,onSuccess);event.target.value=''})
}
setupDropzone('notice',(data,name)=>{noticeImage={data,name};updateMediaPreview('notice',data,name)});
setupDropzone('popup',(data,name)=>{state.popup.imageData=data;state.popup.imageName=name;updateMediaPreview('popup',data,name)});
$('#noticeImageRemove').addEventListener('click',()=>{noticeImage={data:'',name:''};updateMediaPreview('notice','','');announce('공지 이미지를 제거했습니다.')});
$('#popupImageRemove').addEventListener('click',()=>{state.popup.imageData='';state.popup.imageName='';persist();updateMediaPreview('popup','','');announce('팝업 이미지를 삭제했습니다.')});
$('#popupForm').addEventListener('submit',event=>{event.preventDefault();const data=Object.fromEntries(new FormData(event.currentTarget));state.popup={...state.popup,...data,enabled:$('#popupEnabled').checked,imageAlt:data.imageAlt};persist();announce('팝업 수정사항을 이 브라우저에 저장했습니다. 공개 사이트에는 게시되지 않았습니다.')});

function renderVersions(){const list=$('#versionList');list.replaceChildren();if(!state.versions.length){const li=document.createElement('li');const span=document.createElement('span');span.textContent='적용된 버전 없음';const button=createButton('롤백',()=>{});button.disabled=true;li.append(span,button);list.append(li)}else{[...state.versions].reverse().forEach(release=>{const li=document.createElement('li');const span=document.createElement('span');const strong=document.createElement('strong');strong.textContent=`v${release.version}`;const small=document.createElement('small');small.textContent=release.appliedAt;span.append(strong,small);li.append(span,createButton('롤백',()=>rollback(release)));list.append(li)})}$('#versionCount').textContent=`v${state.versions.length}`}
function rollback(release){Object.entries(release.content).forEach(([key,value])=>{if(contentForm.elements[key])contentForm.elements[key].value=value});state.versions.push({version:state.versions.length+1,appliedAt:new Date().toLocaleString('ko-KR'),content:release.content,rollbackOf:release.version});baseline=serialize();state.draft=release.content;persist();setDirty();renderVersions();announce(`v${release.version} 기준 롤백 버전을 적용했습니다.`)}
$$('[data-content-tab]').forEach(tab=>tab.addEventListener('click',()=>{$$('[data-content-tab]').forEach(button=>button.setAttribute('aria-selected',String(button===tab)));$$('[data-content-panel]').forEach(panel=>panel.hidden=panel.dataset.contentPanel!==tab.dataset.contentTab)}));
contentForm.addEventListener('input',setDirty);contentForm.addEventListener('change',setDirty);
$('#draftButton').addEventListener('click',()=>{state.draft=values();if(!persist())return;baseline=serialize();setDirty();announce('페이지별 콘텐츠를 이 브라우저에 임시저장했습니다.')});
$('#discardButton').addEventListener('click',()=>{const saved=JSON.parse(baseline);Object.entries(saved).forEach(([key,value])=>{if(contentForm.elements[key])contentForm.elements[key].value=value});setDirty();announce('저장하지 않은 변경사항을 취소했습니다.')});
$('#previewButton').addEventListener('click',()=>{const data=values();$('#previewTitle').textContent=data.contestTitle;$('#previewHero').textContent=data.heroTitle;$('#previewLead').textContent=data.heroLead;$('#previewState').textContent=`접수 상태: ${data.contestState}`;dialog.showModal()});
$('#closePreview').addEventListener('click',()=>dialog.close());
applyButton.addEventListener('click',()=>{if(!valid()){contentForm.reportValidity();announce('OPEN 상태에는 승인된 Form URL이 필요합니다.');return}const release={version:state.versions.length+1,appliedAt:new Date().toLocaleString('ko-KR'),content:values()};state.versions.push(release);state.draft=release.content;baseline=serialize();if(!persist())return;setDirty();renderVersions();announce(`v${release.version}을 TEST 브라우저에 적용했습니다. 실제 공개 게시가 아닙니다.`)});

const inquiries=[
  {receipt:'W24-Q-TEST-001',category:'접수',title:'접수 일정 문의',message:'공모전 접수 시작일과 마감 시간을 알고 싶습니다.',date:'2026-08-27',email:'sample1@example.test'},
  {receipt:'W24-Q-TEST-002',category:'참가 자격',title:'팀 참가 자격 문의',message:'서로 다른 기관 소속 구성원이 한 팀으로 참가할 수 있는지 궁금합니다.',date:'2026-08-26',email:'sample2@example.test'}
];
function renderInquiries(query=''){const normalized=query.trim().toLowerCase();const rows=inquiries.filter(item=>Object.values(item).some(value=>String(value).toLowerCase().includes(normalized)));const list=$('#inquiryList');list.replaceChildren();rows.forEach(item=>{const article=document.createElement('article');const head=document.createElement('div');const category=document.createElement('span');category.textContent=item.category;const title=document.createElement('h2');title.textContent=item.title;const meta=document.createElement('p');meta.textContent=`${item.receipt} · ${item.date}`;head.append(category,title,meta);const body=document.createElement('div');body.className='admin-inquiry-body';const label=document.createElement('strong');label.textContent='문의 내용';const message=document.createElement('p');message.textContent=item.message;const sender=document.createElement('small');sender.textContent=`문의자 TEST 정보 · ${item.email}`;body.append(label,message,sender);article.append(head,body);list.append(article)});$('#inquiryResult').textContent=`${rows.length}건`}
$('#inquirySearch').addEventListener('input',event=>renderInquiries(event.target.value));

function renderAll(){renderNotices();renderFaqs();renderVersions();renderInquiries($('#inquirySearch').value)}
function init(){
  if(state.draft)Object.entries(state.draft).forEach(([key,value])=>{if(contentForm.elements[key])contentForm.elements[key].value=value});
  Object.entries(state.popup).forEach(([key,value])=>{const control=$(`#popup${key[0].toUpperCase()}${key.slice(1)}`);if(control){if(control.type==='checkbox')control.checked=Boolean(value);else if(key!=='imageData'&&key!=='imageName')control.value=value}});
  updateMediaPreview('popup',state.popup.imageData||'',state.popup.imageName||'');resetNoticeForm();baseline=serialize();setDirty();renderAll();showView(location.hash.slice(1)||'home');
}
init();
