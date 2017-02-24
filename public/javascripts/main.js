$('.diceForm').submit(function(event) {
  event.preventDefault();
  console.log('rolling dice');
  $.get('/api/'+$('#rollExpression').val())
  .then(function(res) {
    console.log(res);
    $('.responseTotal').html(res.total);
    $('.responseEntry').html(res.entry);
    // $('.responseType').html(res.type);
    // $('.responseFormat').html(res.format);
    $('.response').show();
  })
})
