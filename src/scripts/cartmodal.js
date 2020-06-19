import css from '../styles/cartmodal.css';
import Mustache, { render } from 'mustache';
import cartModalTemplates from '../templates/cart-modal';
import cartItemTemplates from '../templates/cart-item';
import { getCustomerKey, getIframeHead, getIframeBody } from './utils';
import { matchOrder } from './request';

function getPOCData() {
  return JSON.parse(document.getElementById('poc-data').innerHTML);
}

function getCouponData() {
  return getPOCData().coupon;
}

function getProductData() {
  return getPOCData().product;
}

function closeModal() {
  document.getElementById('poc-cart-modal').classList.remove('is-active')
}

function formatMoney(price) {
  var currency_format = getProductData().currency_format;
  var currency_symbol = getProductData().currency_symbol;
  if(currency_format === 'left') {
    price = currency_symbol + price;
  } else {
    price = price + currency_symbol;
  }
  return price;
}

function getPrice(cartItem) {
  var price = '';
  getProductData().variations.forEach((variation) => {
    var attributes = variation.attributes;
    var matched = true;
    for (var key in attributes) {
      if (attributes.hasOwnProperty(key)) {
        var attribute = attributes[key];
        if(attribute.length === 0) {
          continue;
        }
        var name = key.replace('attribute_', '');
        var select = cartItem.querySelector('select[name=' + name + ']');
        var selectedValue = select.value;
        if(selectedValue === attribute) {
          continue;
        }
        matched = false;
      }
    }
    if(!matched) {
      return;
    }
    price = variation.regular_price;
  });
  var qty = cartItem.querySelector('.poc-cart__item-qty-input input').value;
  price = qty * price;
  return price;
}

function updatePrice(cartItem) {
  var price = getPrice(cartItem);
  price = formatMoney(price);
  cartItem.querySelector('.poc-cart__item-price .amount').innerHTML = price;
  updateTotalOff(cartItem);
  updateTotal(cartItem);
}

function getTotalOff(cartItem) {
  var discount = getCouponData().discount;
  return discount / 100 * getPrice(cartItem);
}

function updateTotalOff(cartItem) {
  var price = formatMoney(getTotalOff(cartItem));
  cartItem.querySelector('.poc-cart__item-coupon span.amount').innerHTML = price;
}

function updateTotal(cartItem) {
  var price = formatMoney(getPrice(cartItem) - getTotalOff(cartItem));
  cartItem.querySelector('.poc-cart__item-total span.amount').innerHTML = price;
}

function renderWrapper() {
  var cartModal = document.createElement('div');
  cartModal.setAttribute('id', 'poc-cart-modal');
  var iframe = document.createElement('iframe');
  cartModal.appendChild(iframe);
  document.body.appendChild(cartModal);
}

function renderIframe() {
  var iframe = document.querySelector('#poc-cart-modal iframe');
  getIframeHead(iframe).innerHTML += Mustache.render(cartModalTemplates.iframeHead, {style: css.toString()});
  getIframeBody(iframe).innerHTML += Mustache.render(cartModalTemplates.iframeBody, {});
}

function renderCartItem() {
  var iframe = document.querySelector('#poc-cart-modal iframe');
  var cartItem = document.createElement('div');
  cartItem.setAttribute('class', 'poc-cart__item');
  cartItem.innerHTML += Mustache.render(cartItemTemplates.title, {title: getProductData().title});
  cartItem.innerHTML += Mustache.render(cartItemTemplates.qtyInput, {})
  cartItem.innerHTML += '<div class="poc-cart__item-selects"></div>';
  getProductData().attributes.forEach((attribute) => {
    cartItem.querySelector('.poc-cart__item-selects').innerHTML += Mustache.render(cartItemTemplates.select, { 
      label: attribute.name,
      select_name: attribute.slug,
      options: attribute.terms
    })
  });
  cartItem.innerHTML += Mustache.render(cartItemTemplates.subTotal, {price: ''});
  cartItem.innerHTML += Mustache.render(cartItemTemplates.coupon, {coupon_code: getCouponData().code, total_off: 0});
  cartItem.innerHTML += Mustache.render(cartItemTemplates.total, {total: 100});
  getIframeBody(iframe).querySelector('.poc-cart__items').appendChild(cartItem);
}

export function renderCartModal() {
  renderWrapper();
  renderIframe();
  renderCartItem();

  var modal = document.getElementById('poc-cart-modal');
  var iframe = modal.querySelector('iframe');
  var iframeBody = getIframeBody(iframe);
  var closeBtn = iframeBody.querySelector('.poc-cart__btn-close');
  var cartItemSelects = iframeBody.querySelectorAll('.poc-cart__item-select select');
  var cartItemQtyInputs = iframeBody.querySelectorAll('.poc-cart__item-qty-input input');
  var checkoutBtn = iframeBody.querySelector('.poc-cart__checkout-btn button');
  
  closeBtn.addEventListener('click', function() {
    closeModal();
  });

  document.addEventListener('click', function() {
    var isClickInside = modal.contains(event.target);
    if (!isClickInside) {
      closeModal();
    }
  });

  iframeBody.querySelectorAll('.poc-cart__item').forEach((cartItem) => {
    updatePrice(cartItem);
  });
    
  for (let i = 0; i < cartItemSelects.length; i++) {
    cartItemSelects[i].addEventListener('change', function(e) {
      var cartItem = event.target.closest('.poc-cart__item');
      updatePrice(cartItem);
    });
  }

  cartItemQtyInputs.forEach((qtyInput) => {
    qtyInput.addEventListener('keyup', function(e) {
      var cartItem = event.target.closest('.poc-cart__item');
      updatePrice(cartItem);
    });
    qtyInput.addEventListener('change', function(e) {
      var cartItem = event.target.closest('.poc-cart__item');
      updatePrice(cartItem);
    });
  });

  checkoutBtn.addEventListener('click', function() {
    var body = {
      customer_key: getCustomerKey(),
      attributes: {},
      quantity: iframeBody.querySelector('.poc-cart__item .poc-cart__item-qty-input input').value
    };
    iframeBody.querySelectorAll('.poc-cart__item .poc-cart__item-select select').forEach((select) => {
      body['attributes']['attribute_' + select.name] = select.value
    });
    checkoutBtn.setAttribute('disabled', 'disabled');
    matchOrder(body).then(() => {
      console.log('success');
    });
  });
}

const CartModal = {
  pocData: function() {
    return JSON.parse(document.getElementById('poc-data').innerHTML);
  },
  couponData: function() {
    return CartModal.pocData().coupon;
  },
  productData: function() {
    return CartModal.pocData().product;
  },
  init: () => {
    var cartModal = document.createElement('div');
    cartModal.setAttribute('id', 'poc-cart-modal');
    cartModal.setAttribute('class', 'is-active');
    var iframe = document.createElement('iframe');
    cartModal.appendChild(iframe);
    document.body.appendChild(cartModal);
    var iframeDOM = document.getElementById('poc-cart-modal').getElementsByTagName('iframe')[0].contentDocument;
    CartModal.addStyle(iframeDOM);
    CartModal.addElements(iframeDOM);
    var closeBtn = iframeDOM.body.getElementsByClassName('poc-cart__btn-close')[0];
    var modal = document.getElementById('poc-cart-modal');
    closeBtn.addEventListener('click', function() {
      CartModal.closeModal(modal);
    });
    document.addEventListener('click', function() {
      var isClickInside = modal.contains(event.target);
      if (!isClickInside) {
        CartModal.closeModal(modal);
      }
    });

    iframeDOM.body.querySelectorAll('.poc-cart__item').forEach((cartItem) => {
      CartModal.updatePrice(cartItem);
    })
    
    var cartItemSelects = iframeDOM.body.querySelectorAll('.poc-cart__item-select select');
    
    for (let i = 0; i < cartItemSelects.length; i++) {
      cartItemSelects[i].addEventListener('change', function(e) {
        var cartItem = event.target.closest('.poc-cart__item');
        CartModal.updatePrice(cartItem);
      });
    }

    iframeDOM.body.querySelectorAll('.poc-cart__item-qty-input input').forEach((qtyInput) => {
      qtyInput.addEventListener('keyup', function(e) {
        var cartItem = event.target.closest('.poc-cart__item');
        CartModal.updatePrice(cartItem);
      });
    });

    iframeDOM.body.querySelector('.poc-cart__checkout-btn button').addEventListener('click', function() {
      var body = {
        customer_key: getCustomerKey(),
        attributes: {}
      };
      iframeDOM.body.querySelectorAll('.poc-cart__item .poc-cart__item-select select').forEach((select) => {
        body['attributes']['attribute_' + select.name] = select.value
      });
      fetch('https://7e288dfba5d8.ngrok.io/wp-json/poc-chatbot/v1/match_order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }).then((response) => {
        return response.json();
      }).then((data) => {
        return data;
      })
    });
  },
  addStyle: (iframe) => {
    var style = document.createElement('style');
    style.innerHTML = css.toString();
    iframe.head.appendChild(style);
  },
  addElements: (iframe) => {
    var cartInner = document.createElement('div');
    cartInner.setAttribute('class', 'poc-cart__inner');

    var cartHeader = document.createElement('div');
    cartHeader.setAttribute('class', 'poc-cart__header');
    cartHeader.innerHTML = '<h2 class="poc-cart__title">Cart</h2><button class="poc-cart__btn-close"><span>x</span></button>';
    cartInner.appendChild(cartHeader);

    var cartScroll = document.createElement('div');
    cartScroll.setAttribute('class', 'poc-cart__scroll');
    cartScroll.innerHTML = '<div class="poc-cart__items"></div>';

    var cartItem = document.createElement('div');
    cartItem.setAttribute('class', 'poc-cart__item');
    cartItem.innerHTML += Mustache.render(cartItemTemplates.title, {title: CartModal.productData().title});
    cartItem.innerHTML += Mustache.render(cartItemTemplates.qtyInput, {})
    cartItem.innerHTML += '<div class="poc-cart__item-selects"></div>';
    CartModal.productData().attributes.forEach((attribute) => {
      cartItem.querySelector('.poc-cart__item-selects').innerHTML += Mustache.render(cartItemTemplates.select, { 
        label: attribute.name,
        select_name: attribute.slug,
        options: attribute.terms
      })
    });
    cartItem.innerHTML += Mustache.render(cartItemTemplates.subTotal, {price: ''});
    cartItem.innerHTML += Mustache.render(cartItemTemplates.coupon, {coupon_code: CartModal.couponData().code, total_off: 0});
    cartItem.innerHTML += Mustache.render(cartItemTemplates.total, {total: 100});

    cartScroll.getElementsByClassName('poc-cart__items')[0].appendChild(cartItem);
    cartInner.appendChild(cartScroll);

    var cartBottom = document.createElement('div');
    cartBottom.setAttribute('class', 'poc-cart__bottom');
    cartBottom.innerHTML += Mustache.render(cartBottomTemplates.checkoutButton, {});
    cartInner.appendChild(cartBottom);

    iframe.body.appendChild(cartInner);
  },
  closeModal: (modal) => {
    modal.classList.remove('is-active')
  },
  formatMoney: (price) => {
    var currency_format = CartModal.productData().currency_format;
    var currency_symbol = CartModal.productData().currency_symbol;
    if(currency_format === 'left') {
      price = currency_symbol + price;
    } else {
      price = price + currency_symbol;
    }
    return price;
  },
  getPrice: (cartItem) => {
    var price = '';
    CartModal.productData().variations.forEach((variation) => {
      var attributes = variation.attributes;
      var matched = true;
      for (var key in attributes) {
        if (attributes.hasOwnProperty(key)) {
          var attribute = attributes[key];
          if(attribute.length === 0) {
            continue;
          }
          var name = key.replace('attribute_', '');
          var select = cartItem.querySelector('select[name=' + name + ']');
          var selectedValue = select.value;
          if(selectedValue === attribute) {
            continue;
          }
          matched = false;
        }
      }
      if(!matched) {
        return;
      }
      price = variation.regular_price;
    });
    var qty = cartItem.querySelector('.poc-cart__item-qty-input input').value;
    price = qty * price;
    return price;
  },
  updatePrice: (cartItem) => {
    var price = CartModal.getPrice(cartItem);
    price = CartModal.formatMoney(price);
    cartItem.querySelector('.poc-cart__item-price .amount').innerHTML = price;
    CartModal.updateTotalOff(cartItem);
    CartModal.updateTotal(cartItem);
  },
  getTotalOff: (cartItem) => {
    var discount = CartModal.couponData().discount;
    return discount / 100 * CartModal.getPrice(cartItem);
  },
  updateTotalOff: (cartItem) => {
    var price = CartModal.formatMoney(CartModal.getTotalOff(cartItem));
    cartItem.querySelector('.poc-cart__item-coupon span.amount').innerHTML = price;
  },
  updateTotal: (cartItem) => {
    var price = CartModal.formatMoney(CartModal.getPrice(cartItem) - CartModal.getTotalOff(cartItem));
    cartItem.querySelector('.poc-cart__item-total span.amount').innerHTML = price;
  },
}