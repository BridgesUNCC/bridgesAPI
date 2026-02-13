$('#reset').submit(function(e) {
    e.preventDefault();
    var data = {};

    // POST request to send the email with forgotten password
    var postEmail = function() {
      $.ajax({
        type: "POST",
        url: '/forgot',
        data: data,
        success: function(res) {
          // alert the user when the email has been sent
          $('#reset').trigger('sent', res.email);
        },
        error: function (xhr, ajaxOptions, thrownError) {
          // warn the user if the email could not be sent
          $('#reset').trigger('notfound', xhr.responseJSON);
        }
      });
    };

    // check for validity
    (function(input) {
      if(input.length === 0) {
        $('#email').val("please enter a valid email");
      }
      else {
        data.email = input;
        postEmail();
        // alert the user that the email is processing
        $('#reset').trigger('sending');
      }
    })($('#email').val());
});

$('#reset').on('sent', function(e, email) {
  var contents =
    "<legend>Password recovery email sent!</legend>" +
    "<p>We just sent a password reset email to your email address: <b>" +
    email +
    "</b><br /><br />Please check your inbox (or spam folder). The email should arrive in a few minutes.</p>";
  $(this).html(contents);
});

$('#reset').on('sending', function(e) {
  var contents =
    "<legend>Sending...</legend>" +
    "<p>We are processing your request now, please bear with us.</p>";
  $(this).html(contents);
});

$('#reset').on('notfound', function(e, response) {
  var contents =
    "<legend>No account found</legend>" +
    "<p>" + response.error + "</p><br />" +
    "<div class='form-group'><label for='email'>" +
    "Email:</label><input id='email' type='email' name='email' autofocus='' class='form-control'>" +
    "</div><button type='submit' class='btn btn-primary'>Reset Password</button>";

  $(this).html(contents);
});

$('#email').on('focus click', function(e) {
  if($('#email').val() == "please enter a valid email")
    $('#email').val("");
});
