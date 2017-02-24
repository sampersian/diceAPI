$('.diceForm').submit(function(event) {
  event.preventDefault();
  console.log('rolling dice');
  $.get('/api/'+$('#rollExpression').val())
  .then(function(res) {
    console.log(res);
    if (res.error) {
      $('.response').hide();
      $('.responseErrorMessage').html(res.error);
      $('.responseErrorEntry').html(res.entry);
      $('.responseError').show();
    } else {
      $('.responseError').hide();
      $('.responseTotal').html(res.total);
      $('.responseEntry').html(res.entry);
      $('.responseType').html(res.type);
      $('.responseFormat').html(res.format);
      $('.response').show();
    }
  })
})

$('#showDirectionsButton').click(function() {
  if( $('.directions').css('display') == 'block') {
    $('.directions').hide();
    $(this).text("Show Directions");
  } else {
    $('.directions').show();
    $(this).text("Hide Directions");
  }
})
