$('.diceForm').submit((event)=> {
  event.preventDefault();
  console.log('rolling dice');
  $('#response').empty();
  $.get('/api/'+$('#rollExpression').val())
  .then((res)=> {
    console.log(res);
    $('#response').append("<h2> Total : "+res.total+"</h2>\
    <h2> Entry : "+res.entry+"</h2>")
  })
})
