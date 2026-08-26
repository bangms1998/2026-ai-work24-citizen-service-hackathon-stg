import { siteConfig } from './site-config.js';
const menu=document.querySelector('.menu');const nav=document.querySelector('#nav');menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')==='true';menu.setAttribute('aria-expanded',String(!open));nav?.classList.toggle('open',!open)});
const button=document.querySelector('#applyButton');const status=document.querySelector('#applyStatus');
const labels={PREOPEN:'접수 준비 중',OPEN:'Google Form으로 접수하기',CLOSED:'접수 마감'};
if(button){button.textContent=labels[siteConfig.state]||'접수 상태 확인';const ready=siteConfig.state==='OPEN'&&Boolean(siteConfig.formUrl);button.disabled=!ready;if(ready){button.addEventListener('click',()=>window.open(siteConfig.formUrl,'_blank','noopener,noreferrer'))}}
if(status){status.textContent=siteConfig.state==='OPEN'&&siteConfig.formUrl?'접수 버튼을 누르면 승인된 Google Form이 새 창에서 열립니다.':'접수 일정 [미정] · 접수는 Google Form으로 진행됩니다.'}
