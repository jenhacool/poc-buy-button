const cartItemTemplates = {
  title: '<div class="poc-cart__item-title">{{title}}</div>',
  qtyInput: '<div class="poc-cart__item-qty-input poc-cart__item-row"><label>Quantity</label><input name="quantity" value="1" type="number"></div>',
  select: '<div class="poc-cart__item-select poc-cart__item-row"><label>{{label}}</label><select name="{{select_name}}">{{#options}}<option value="{{slug}}">{{name}}</option>{{/options}}</select></div>',
  subTotal: '<div class="poc-cart__item-price poc-cart__item-row"><span>Price</span><span class="amount">{{price}}</span></div>',
  coupon: '<div class="poc-cart__item-coupon poc-cart__item-row"><span>Coupon: <strong>{{coupon_code}}</strong></span><span>- <span class="amount">{{total_off}}</span></span></div>',
  total: '<div class="poc-cart__item-total poc-cart__item-row"><span>Total</span><span class="amount">{{total}}</span></div>',
}

export default cartItemTemplates;