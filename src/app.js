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
const now = new Date();
const resolvedContestState = (date) => date < new Date(siteConfig.opensAt)
  ? 'SCHEDULED'
  : date <= new Date(siteConfig.closesAt) ? 'OPEN' : 'CLOSED';
const applicationState = siteConfig.state === 'OPEN' ? 'OPEN' : resolvedContestState(now);
const labels = { SCHEDULED: '접수하기', OPEN: '접수하기', CLOSED: '접수하기' };
const applicationReady = applicationState === 'OPEN' && Boolean(siteConfig.formUrl);
if (button) {
  button.textContent = labels[applicationState];
  button.disabled = !applicationReady;
  if (applicationReady) button.addEventListener('click', () => window.open(siteConfig.formUrl, '_blank', 'noopener,noreferrer'));
}

const applyFormLink = document.querySelector('#applyFormLink');
if (applyFormLink) {
  applyFormLink.textContent = labels[applicationState];
  if (applicationReady) {
    applyFormLink.href = siteConfig.formUrl;
    applyFormLink.target = '_blank';
    applyFormLink.rel = 'noopener noreferrer';
    applyFormLink.removeAttribute('aria-disabled');
  } else {
    applyFormLink.removeAttribute('href');
    applyFormLink.setAttribute('aria-disabled', 'true');
    applyFormLink.addEventListener('click', (event) => event.preventDefault());
  }
}

const resourcesDownload = document.querySelector('#resourcesDownload');
if (resourcesDownload) {
  if (siteConfig.resourcesUrl) {
    resourcesDownload.href = siteConfig.resourcesUrl;
    resourcesDownload.download = '';
    resourcesDownload.removeAttribute('aria-disabled');
  } else {
    resourcesDownload.setAttribute('aria-disabled', 'true');
    resourcesDownload.setAttribute('title', '참고자료 외부 링크 확인 필요');
    resourcesDownload.addEventListener('click', (event) => event.preventDefault());
  }
}

const inquiryForm = document.querySelector('#inquiryForm');
const inquiryResult = document.querySelector('#inquiryResult');
const inquiryStartedAt = Date.now();

inquiryForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!inquiryForm.reportValidity()) return;
  const data = new FormData(inquiryForm);
  const submitButton = inquiryForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = '전송 중…';
  inquiryResult.hidden = false;
  inquiryResult.textContent = '문의를 전송하고 있습니다.';
  try {
    const response = await fetch('/api/inquiry', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        type: data.get('type'), name: data.get('name'), email: data.get('email'),
        title: data.get('title'), message: data.get('message'), website: data.get('website'),
        consent: data.get('consent') === 'on', startedAt: inquiryStartedAt,
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.ok !== true) throw new Error(result.error || '문의 전송을 완료하지 못했습니다.');
    inquiryResult.textContent = `문의가 전송되었습니다. 문의번호 ${result.receipt} · 운영사무국에서 입력한 이메일로 답변드립니다.`;
    inquiryForm.reset();
  } catch (error) {
    inquiryResult.textContent = `문의 전송에 실패했습니다. ${error.message} 계속 실패하면 gongmo@stunning.kr로 보내 주세요.`;
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = '문의 전송';
    inquiryResult.scrollIntoView({ block: 'nearest', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    inquiryResult.focus({ preventScroll: true });
  }
});

const scheduleEvents = [...document.querySelectorAll('.schedule-event')];
const kstDateKey = (date) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
const todayKey = kstDateKey(new Date());

if (scheduleEvents.length) {
  const events = scheduleEvents.map((element) => ({ element, id: element.dataset.event, start: element.dataset.start, end: element.dataset.end }));
  let nextEvent = null;
  events.forEach((event) => {
    const state = event.element.querySelector('.schedule-state');
    event.element.classList.remove('is-complete', 'is-current', 'is-next');
    event.element.removeAttribute('aria-current');
    if (todayKey > event.end) {
      event.element.classList.add('is-complete');
      if (state) state.textContent = '완료';
    } else if (todayKey >= event.start && todayKey <= event.end) {
      event.element.classList.add('is-current');
      event.element.setAttribute('aria-current', 'step');
      if (state) state.textContent = '진행 중';
    } else {
      if (state) state.textContent = '예정';
      if (!nextEvent) nextEvent = event;
    }
  });
  if (!events.some(({ element }) => element.classList.contains('is-current')) && nextEvent) {
    nextEvent.element.classList.add('is-next');
    const state = nextEvent.element.querySelector('.schedule-state');
    if (state) state.textContent = '다음 일정';
  }
}

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
