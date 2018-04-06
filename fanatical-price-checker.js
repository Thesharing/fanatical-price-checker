// ==UserScript==
// @name         Fanatical Price Checker
// @namespace    https://www.fanatical.com/en/bundle/
// @version      0.1
// @description  Check the price of different regions.
// @author       Thesharing
// @include      /^https?://www\.fanatical\.com/en/bundle/.+$
// @require      https://apps.bdimg.com/libs/jquery/2.1.4/jquery.min.js
// @grant        GM_xmlhttpRequest
// @run-at       document-idle
// ==/UserScript==

var totalNum = 0;

(function () {
    'use strict';
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    var target = document.querySelector('#root');
    var config = {
        attributes: true,
        childList: true,
        characterData: true
    };
    var subObserver = new MutationObserver(function (mutations, me) {
        var a = document.getElementsByClassName('product-commerce-container');
        if (a.length > 0) {
            addButton(a[0]);
            me.disconnect();
        }
    });

    var observer = new MutationObserver(function (mutations, me) {
        var content = document.querySelector('.content');
        if (content) {
            subObserver.observe(content, config);
            me.disconnect();
        }
    });
    observer.observe(target, config);
})();

function addButton(a) {
    var b = document.createElement('div');
    b.className = 'col-12 col-md-6 col-lg-12';
    a.appendChild(b);
    var c = document.createElement('div');
    c.className = 'p-3 pl-md-1 pl-lg-3 card-block';
    c.id = 'checkPrice';
    b.appendChild(c);
    var d = document.createElement('button');
    d.className = 'mt-3 cart-btn btn btn-primary btn-lg btn-block';
    d.id = 'checkPriceButton';
    d.onclick = checkPrice;
    e = document.createElement('b');
    e.id = 'checkPriceButtonText';
    e.appendChild(document.createTextNode('Check Price'));
    d.appendChild(e);
    c.appendChild(d);
    f = document.createElement('div');
    f.id = 'checkPriceList';
    c.appendChild(f);
}

function checkPrice() {
    var bundleName = document.URL.split('/')[5];
    var regionList = ["USD", "GBP", "EUR", "CAD"];
    var buttonText = document.getElementById('checkPriceButtonText');
    buttonText.innerText = 'Checking Price...';
    GM_xmlhttpRequest({
        method: "GET",
        url: "https://api.fanatical.com/api/products/" + bundleName,
        onload: function (response) {
            var bundle_data = JSON.parse(response.responseText);
            c = document.getElementById('checkPriceList');
            while (c.firstChild) {
                c.removeChild(c.firstChild);
            }
            totalNum = bundle_data.bundles.length * regionList.length;
            for (var i = 0; i < bundle_data.bundles.length; i++) {
                var container = document.createElement('div');
                c.appendChild(container);
                var title = document.createElement('h4');
                title.appendChild(document.createTextNode('Tier ' + (i + 1).toString()));
                container.appendChild(title);
                var price = bundle_data.bundles[i].price;
                for (var j = 0; j < regionList.length; j++) {
                    var p = price[regionList[j]] / 100;
                    GM_xmlhttpRequest({
                        method: "GET",
                        url: "https://finance.google.cn/finance/converter?a=" + p.toString() + "&from=" + regionList[j] + "&to=CNY",
                        context: {
                            'region': regionList[j],
                            'price': p.toString(),
                            'container': container,
                            'number': j
                        },
                        onload: function (response) {
                            var responseDocument = new DOMParser().parseFromString(response.responseText, "text/html");
                            var result = responseDocument.getElementById('currency_converter_result').innerText;
                            var price_item = document.createElement('span');
                            price_item.appendChild(document.createTextNode(result));
                            response.context.container.appendChild(price_item);
                            response.context.container.appendChild(document.createElement('br'));
                            totalNum -= 1;
                            if (totalNum == 0) {
                                buttonText.innerText = 'Finished!';
                            }
                        }
                    });
                }
            }
        }
    });
}