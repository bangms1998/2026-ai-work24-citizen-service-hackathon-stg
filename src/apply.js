const form = document.querySelector('#applicationForm');
const status = document.querySelector('#applicationStatus');

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  status.textContent = '입력 내용 확인이 완료되었습니다. 운영 연결 전에는 서버로 전송하거나 저장하지 않습니다.';
});
