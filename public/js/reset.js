$('#reset').submit(function(e) {
    e.preventDefault();

    // send the form data to the server
    var send = function() {
      $.ajax({
        method: 'POST',
        url: '/reset/'+token,
        processDataBoolean: false,
        data: $( "#reset" ).serialize(),
        success: function(data, textStatus, jqXHR) {
          window.location.replace(window.location.protocol + "//" + window.location.host + data.redirect);
        },
        error: function (xhr, ajaxOptions, thrownError) {
          console.log(xhr);
        }
      });
    };

    var clear = function() {
      $("#pass1").val("").focus();
      $("#pass2").val("");
    };

    var p1 = $("#pass1").val().trim(),
        p2 = $("#pass2").val().trim();

    if(p1.length < 6) {
      $("#msg").html("Please use at least 6 characters");
      clear();
      return;
    }

    if(p1 != p2) {
      $("#msg").html("Passwords must match");
      clear();
      return;
    }

    send();
});
