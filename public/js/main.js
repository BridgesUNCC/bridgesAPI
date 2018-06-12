$(function() {
    $('#getKey').click(function(e) {
        $.get('/users/apikey', function(data) {
            $('#api').html(data);
        });
    });

    // keypress timers
    var courseTimer;
    var institutionTimer;
    var doneTypingInterval = 2000;

    // POST the institution name
    $('#setInstitution').unbind('keyup');
    $('#setInstitution').keyup(function(){
        clearTimeout(institutionTimer);
        institutionTimer = setTimeout(sendInstitution, doneTypingInterval);
    });
    function sendInstitution () {
        $.post('/users/setInstitution', { 'institution': $('#setInstitution').val()},
          function(status) {
            if(status == 'OK') {
              // change border color to green to indicate success
              $("#setInstitution").css("border", "3px solid green");
              setTimeout(function() {
                $("#setInstitution").css("border", "1px solid rgb(102, 175, 233)");
              }, 3000);
            } else {
              // change border color to red to indicate failure
              $("#setInstitution").css("border", "3px solid red");
              setTimeout(function() {
                $("#setInstitution").css("border", "1px solid rgb(102, 175, 233)");
              }, 3000);
            }
        });
    }

    // POST the course name
    $('#setCourse').unbind('keyup');
    $('#setCourse').keyup(function(){
        clearTimeout(courseTimer);
        courseTimer = setTimeout(sendCourse, doneTypingInterval);
    });
    function sendCourse () {
        $.post('/users/setCourse', { 'course': $('#setCourse').val()},
          function(status) {
            if(status == 'OK') {
              // change border color to green to indicate success
              $("#setCourse").css("border", "3px solid green");
              setTimeout(function() {
                $("#setCourse").css("border", "1px solid rgb(102, 175, 233)");
              }, 4000);
            } else {
              // change border color to red to indicate failure
              $("#setCourse").css("border", "3px solid red");
              setTimeout(function() {
                $("#setCourse").css("border", "1px solid rgb(102, 175, 233)");
              }, 4000);
            }
        });
    }
});
