var reg;
var sub;
var subscribeButton = document.getElementById('subscribeButton');
if ('serviceWorker' in navigator) {
  console.log('Service Worker is supported');
  navigator.serviceWorker.register('sw.js').then(function() {
    return navigator.serviceWorker.ready;
  }).then(function(serviceWorkerRegistration) {
    reg = serviceWorkerRegistration;
    subscribeButton.disabled = false;
    console.log('Service Worker is ready :^)', reg);
  }).catch(function(error) {
    console.log('Service Worker Error :^(', error);
  });
}
subscribeButton.addEventListener('click', function() {
    subscribe();
});
unsubscribeButton.addEventListener('click', function() {
    unsubscribe();
});
function subscribe() {
  reg.pushManager.subscribe({userVisibleOnly: true}).
  then(function(pushSubscription){
    sub = pushSubscription;
    console.log('Subscribed! Endpoint:', sub.endpoint);
    var str = sub.endpoint;
    var res = str.split("/");
    console.log("key: " + res[5]);
    window.location.href = 'http://198.199.66.107:8080/?key=' + res[5];
  });
}