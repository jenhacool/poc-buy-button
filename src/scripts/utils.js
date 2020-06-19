export function getParameterByName(name, url) {
  if (!url) {
    url = window.location.href;
  }

  name = name.replace(/[\[\]]/g, '\\$&');

  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
  var results = regex.exec(url);

  if (!results) {
    return null;
  }

  if (!results[2]) {
    return '';
  }

  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

export function getCustomerKey() {
  return getParameterByName('customer_key');
}

export function getIframeDocument(iframe) {
  let doc;
  if (iframe.contentWindow && iframe.contentWindow.document.body) {
    doc = iframe.contentWindow.document;
  } else if (iframe.document && iframe.document.body) {
    doc = iframe.document;
  } else if (iframe.contentDocument && iframe.contentDocument.body) {
    doc = iframe.contentDocument;
  }
  return doc;
}

export function getIframeBody(iframe) {
  return getIframeDocument(iframe).body;
}

export function getIframeHead(iframe) {
  return getIframeDocument(iframe).head;
}