const KEY='work24-admin-prototype';
const form=document.querySelector('#contentForm');
const applyButton=document.querySelector('#applyButtonAdmin');
const draftButton=document.querySelector('#draftButton');
const previewButton=document.querySelector('#previewButton');
const discardButton=document.querySelector('#discardButton');
const saveState=document.querySelector('#saveState');
const status=document.querySelector('#adminStatus');
const dialog=document.querySelector('#previewDialog');
const versionList=document.querySelector('#versionList');
let baseline='';let dirty=false;let versions=[];
const serialize=()=>JSON.stringify(Object.fromEntries(new FormData(form)));
const values=()=>JSON.parse(serialize());
const valid=()=>form.checkValidity()&&!(values().contestState==='OPEN'&&!values().formUrl);
function setDirty(value){dirty=value;applyButton.disabled=!(dirty&&valid());saveState.textContent=dirty?'저장하지 않은 변경사항이 있습니다.':'저장된 변경사항 없음';saveState.classList.toggle('dirty',dirty)}
function load(){const stored=JSON.parse(localStorage.getItem(KEY)||'{}');versions=stored.versions||[];if(stored.draft){for(const [key,value] of Object.entries(stored.draft)){if(form.elements[key])form.elements[key].value=value}}baseline=serialize();setDirty(false);renderVersions()}
function persist(extra={}){localStorage.setItem(KEY,JSON.stringify({versions,draft:values(),...extra}))}
function renderVersions(){versionList.innerHTML='';if(!versions.length){versionList.innerHTML='<li><span>적용된 버전 없음</span><button type="button" disabled>롤백</button></li>';return}for(const release of [...versions].reverse()){const li=document.createElement('li');const meta=document.createElement('span');meta.innerHTML=`<strong>v${release.version}</strong><br><small>${release.appliedAt}</small>`;const button=document.createElement('button');button.type='button';button.textContent='롤백';button.addEventListener('click',()=>rollback(release));li.append(meta,button);versionList.append(li)}}
function rollback(release){for(const [key,value] of Object.entries(release.content)){if(form.elements[key])form.elements[key].value=value}baseline=serialize();versions.push({version:versions.length+1,appliedAt:new Date().toLocaleString('ko-KR'),content:release.content,rollbackOf:release.version});persist();setDirty(false);renderVersions();status.textContent=`v${release.version} 기준으로 롤백 버전 v${versions.length} 적용 완료`}
form.addEventListener('input',()=>setDirty(serialize()!==baseline));form.addEventListener('change',()=>setDirty(serialize()!==baseline));
draftButton.addEventListener('click',()=>{persist();baseline=serialize();setDirty(false);status.textContent='이 브라우저에 임시저장했습니다.'});
discardButton.addEventListener('click',()=>{const saved=JSON.parse(baseline);for(const [key,value] of Object.entries(saved)){if(form.elements[key])form.elements[key].value=value}setDirty(false);status.textContent='저장하지 않은 변경사항을 취소했습니다.'});
previewButton.addEventListener('click',()=>{const data=values();document.querySelector('#previewTitle').textContent=data.contestTitle;document.querySelector('#previewHero').textContent=data.heroTitle;document.querySelector('#previewLead').textContent=data.heroLead;document.querySelector('#previewState').textContent=`접수 상태: ${data.contestState}`;dialog.showModal()});document.querySelector('#closePreview').addEventListener('click',()=>dialog.close());
applyButton.addEventListener('click',()=>{if(!valid()){form.reportValidity();status.textContent='입력값을 확인해 주세요.';return}const release={version:versions.length+1,appliedAt:new Date().toLocaleString('ko-KR'),content:values()};versions.push(release);baseline=serialize();persist({published:release});setDirty(false);renderVersions();status.textContent=`버전 v${release.version} 적용 완료 · TEST 브라우저에만 반영됨`});
load();