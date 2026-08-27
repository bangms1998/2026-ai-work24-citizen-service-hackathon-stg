import { siteConfig } from './site-config.js';

const menu = document.querySelector('.menu');
const nav = document.querySelector('#nav');
const siteHeader = document.querySelector('.site-header');
function setMenu(open,{focus=false}={}){
  if(!menu||!nav)return;
  menu.setAttribute('aria-expanded',String(open));
  menu.setAttribute('aria-label',open?'주요 메뉴 닫기':'주요 메뉴 열기');
  nav.classList.toggle('open',open);
  menu.classList.toggle('is-open',open);
  document.body.classList.toggle('menu-open',open);
  if(focus)menu.focus();
}
menu?.addEventListener('click',()=>setMenu(menu.getAttribute('aria-expanded')!=='true'));
nav?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>setMenu(false)));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu?.getAttribute('aria-expanded')==='true')setMenu(false,{focus:true})});
document.addEventListener('pointerdown',event=>{if(menu?.getAttribute('aria-expanded')==='true'&&!siteHeader?.contains(event.target))setMenu(false)});
window.addEventListener('resize',()=>{if(window.innerWidth>980)setMenu(false)});

const button = document.querySelector('#applyButton');
const status = document.querySelector('#applyStatus');
const labels = { PREOPEN: '접수 준비 중', OPEN: 'Google Form으로 접수하기', CLOSED: '접수 마감' };
if (button) {
  button.textContent = labels[siteConfig.state] || '접수 상태 확인';
  const ready = siteConfig.state === 'OPEN' && Boolean(siteConfig.formUrl);
  button.disabled = !ready;
  if (ready) button.addEventListener('click', () => window.open(siteConfig.formUrl, '_blank', 'noopener,noreferrer'));
}
if (status) status.textContent = siteConfig.state === 'OPEN' && siteConfig.formUrl ? '접수 버튼을 누르면 승인된 Google Form이 새 창에서 열립니다.' : '접수 일정 [미정] · 접수는 Google Form으로 진행됩니다.';

const inquiryForm = document.querySelector('#inquiryForm');
const inquiryStatus = document.querySelector('#inquiryStatus');
inquiryForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!inquiryForm.reportValidity()) return;
  const receipt = `TEST-${Date.now().toString().slice(-6)}`;
  inquiryStatus.textContent = `TEST 문의가 확인되었습니다. 확인번호 ${receipt} · 실제 전송·저장되지 않았습니다.`;
  inquiryForm.reset();
});

const toTop = document.querySelector('.to-top');
const updateScrollUi = () => {
  const scrolled = window.scrollY > 72;
  siteHeader?.classList.toggle('is-scrolled', scrolled);
  toTop?.classList.toggle('is-visible', window.scrollY > 520);
};
window.addEventListener('scroll', updateScrollUi, { passive: true });
updateScrollUi();

toTop?.addEventListener('click', () => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
});
