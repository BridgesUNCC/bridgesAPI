$('#reset').submit(function(e) {
    e.preventDefault();
    var data = {};

    var postEmail = function() {
      $.ajax({
        type: "POST",
        url: '/forgot',
        data: data,
        success: function(res) {
          $('#reset').trigger('sent', res.email);
        },
        error: function (xhr, ajaxOptions, thrownError) {
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
      }
    })($('#email').val());
});

$('#reset').on('sent', function(e, email) {
  var contents =
    "<legend>Password reset email sent!</legend>" +
    "<p>We just sent a password reset email to your email address: <b>" +
    email +
    "</b><br /><br />Please check your inbox (or spam folder).</p>";
  $(this).html(contents);
});

$('#reset').on('notfound', function(e, response) {
  var contents =
    "<legend>No account found</legend>" +
    "<p>" + response.error + "</p><br /><br />" +
    "<div class='form-group'><label for='email'>" +
    "Email:</label><input id='email' type='email' name='email' autofocus='' class='form-control'>" +
    "</div><button type='submit' class='btn btn-primary'>Reset Password</button>";

  $(this).html(contents);
});

$('#email').on('focus click', function(e) {
  if($('#email').val() == "please enter a valid email")
    $('#email').val("");
});
