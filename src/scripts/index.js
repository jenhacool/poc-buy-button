import '../styles/style.scss';
import { getCustomerInfo } from './request';
import { render } from './view';
import { getCustomerKey } from './utils';

(function() {
  var customer_key = getCustomerKey();
  getCustomerInfo(customer_key).then(function(data) {
    render(data);
  });
})();