var endPoint = 'https://1ty.in/wp-json/poc-chatbot/v1/';

function getDefaultConfig() {
  return {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }
}

function fetchJSON(url, config) {
  return fetch(url, config).then(function(response) {
    if(!response.ok) {
      throw response;
    }

    return response.json();
  });
}

export function getCustomerInfo(customer_key) {
  var config = getDefaultConfig();
  config.body = JSON.stringify({
    customer_key: customer_key
  });
  return fetchJSON(endPoint + 'customer_info', config);
}

export function matchOrder(body) {
  var config = getDefaultConfig();
  config.body = JSON.stringify(body);
  return fetchJSON(endPoint + 'match_order', config);
}