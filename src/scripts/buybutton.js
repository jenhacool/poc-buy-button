import css from '../styles/buybutton.css';
import Mustache from 'mustache';
import buyButtonTemplates from '../templates/buy-button';
import { getIframeHead, getIframeBody } from './utils';

export function renderBuyButton() {
  var container = document.getElementById('poc-buy-button');
  var iframe = document.createElement('iframe');
  container.appendChild(iframe);
  getIframeHead(iframe).innerHTML += Mustache.render(buyButtonTemplates.head, {style: css.toString()});
  getIframeBody(iframe).innerHTML += Mustache.render(buyButtonTemplates.body);

  getIframeBody(iframe).getElementsByClassName('poc-buy-button__btn')[0].addEventListener('click', function() {
    document.getElementById('poc-cart-modal').classList.toggle('is-active');
  });
}