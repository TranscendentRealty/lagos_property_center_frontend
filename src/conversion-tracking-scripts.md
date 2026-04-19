# Conversion Tracking Scripts

## Floating Whatsapp Button:
```
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-18071781411"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'AW-18071781411');
</script>


<!-- Event snippet for Lead - Floating WhatsApp Click conversion page
In your html page, add the snippet and call gtag_report_conversion when someone clicks on the chosen link or button. -->
<script>
function gtag_report_conversion(url) {
  var callback = function () {
    if (typeof(url) != 'undefined') {
      window.location = url;
    }
  };
  gtag('event', 'conversion', {
      'send_to': 'AW-18071781411/fMnfCIjkmZwcEKOApqlD',
      'value': 35.0,
      'currency': 'USD',
      'event_callback': callback
  });
  return false;
}
</script>
```

## Floating Call Button:
```
<!-- Event snippet for Lead - Floating Call Click conversion page
In your html page, add the snippet and call gtag_report_conversion when someone clicks on the chosen link or button. -->
<script>
function gtag_report_conversion(url) {
  var callback = function () {
    if (typeof(url) != 'undefined') {
      window.location = url;
    }
  };
  gtag('event', 'conversion', {
      'send_to': 'AW-18071781411/jTWDCN-VyZ4cEKOApqlD',
      'value': 1.0,
      'currency': 'USD',
      'event_callback': callback
  });
  return false;
}
</script>
```