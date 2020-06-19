import { renderBuyButton } from './buybutton';
import { renderCartModal } from './cartmodal';

function addScriptTag(data) {
  var script = document.createElement('script');
  script.setAttribute('type', 'application/json');
  script.setAttribute('id', 'poc-data');
  script.innerHTML = JSON.stringify(data);
  document.body.appendChild(script);
}

export function render(data) {
  addScriptTag(data.data);
  renderBuyButton();
  renderCartModal();
}