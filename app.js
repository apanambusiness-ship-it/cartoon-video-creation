const form = document.querySelector('#idea-form');
const idea = document.querySelector('#idea');
const format = document.querySelector('#format');
const language = document.querySelector('#language');
const title = document.querySelector('#preview-title');
const text = document.querySelector('#preview-text');
const art = document.querySelector('#preview-art');
const chips = document.querySelector('#preview-chips');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const concept = idea.value.trim();
  if (!concept) {
    idea.focus();
    text.textContent = 'Pehle apna idea likhiye, phir concept generate kijiye.';
    return;
  }
  title.textContent = `${format.value}: ${concept.slice(0, 48)}${concept.length > 48 ? '…' : ''}`;
  text.textContent = `${language.value} audience ke liye visual direction, scene flow aur creative tone tayyar hai. Full AI rendering launch ke saath available hogi.`;
  art.innerHTML = '<span>✦</span>';
  chips.innerHTML = `<span>${format.value}</span><span>${language.value}</span><span>Concept ready</span>`;
});

document.querySelector('#join-button').addEventListener('click', () => {
  document.querySelector('#join-note').textContent = 'Waitlist request noted locally. Payment checkout will be connected before launch.';
});
document.querySelector('#year').textContent = new Date().getFullYear();
