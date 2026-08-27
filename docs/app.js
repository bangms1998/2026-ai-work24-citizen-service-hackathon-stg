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
if (status) status.textContent = siteConfig.state === 'OPEN' && siteConfig.formUrl ? '접수 버튼을 누르면 승인된 Google Form이 새 창에서 열립니다.' : '접수 예정 · 2026.09.09(수) — 10.06(화) · Google Form으로 진행됩니다.';

const resourcesDownload = document.querySelector('#resourcesDownload');
if (resourcesDownload) {
  if (siteConfig.resourcesUrl) {
    resourcesDownload.href = siteConfig.resourcesUrl;
    resourcesDownload.target = '_blank';
    resourcesDownload.rel = 'noopener noreferrer';
    resourcesDownload.removeAttribute('aria-disabled');
  } else {
    resourcesDownload.setAttribute('aria-disabled', 'true');
    resourcesDownload.setAttribute('title', '참고자료 외부 링크 확인 필요');
    resourcesDownload.addEventListener('click', (event) => event.preventDefault());
  }
}

const scheduleEvents = [...document.querySelectorAll('.schedule-event')];
const scheduleCalendar = document.querySelector('#scheduleCalendar');
const kstDateKey = (date) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
const todayKey = kstDateKey(new Date());

if (scheduleEvents.length && scheduleCalendar) {
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

  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const fragment = document.createDocumentFragment();
  for (const monthIndex of [8, 9, 10]) {
    const firstDay = new Date(Date.UTC(2026, monthIndex, 1)).getUTCDay();
    const daysInMonth = new Date(Date.UTC(2026, monthIndex + 1, 0)).getUTCDate();
    const cellCount = Math.ceil((firstDay + daysInMonth) / 7) * 7;
    const month = document.createElement('section');
    month.className = 'calendar-month';
    month.setAttribute('aria-labelledby', `calendar-month-${monthIndex + 1}`);
    month.innerHTML = `<header><span>2026</span><h3 id="calendar-month-${monthIndex + 1}">${monthIndex + 1}월</h3></header><div class="calendar-weekdays">${weekdays.map((day) => `<span>${day}</span>`).join('')}</div><div class="calendar-days"></div>`;
    const grid = month.querySelector('.calendar-days');
    for (let index = 0; index < cellCount; index += 1) {
      const day = index - firstDay + 1;
      const cell = document.createElement(day > 0 && day <= daysInMonth ? 'time' : 'span');
      cell.className = 'calendar-day';
      if (day > 0 && day <= daysInMonth) {
        const dateKey = `2026-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const matched = events.find((event) => dateKey >= event.start && dateKey <= event.end);
        cell.dateTime = dateKey;
        cell.dataset.date = dateKey;
        cell.innerHTML = `<b>${day}</b>`;
        if (matched) {
          cell.classList.add('has-event', `event-${matched.id}`);
          cell.dataset.event = matched.id;
          cell.setAttribute('aria-label', `${monthIndex + 1}월 ${day}일, ${matched.element.querySelector('h3').textContent}`);
          if (matched.element.classList.contains('is-current')) cell.classList.add('is-current-event');
        }
        if (dateKey === todayKey) {
          cell.classList.add('is-today');
          cell.setAttribute('aria-current', 'date');
        }
      } else {
        cell.classList.add('is-empty');
        cell.setAttribute('aria-hidden', 'true');
      }
      grid.append(cell);
    }
    fragment.append(month);
  }
  scheduleCalendar.append(fragment);
}

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
