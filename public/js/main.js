$(function() {
    $('#getKey').click(function(e) {
        $.get('/users/apikey', function(data) {
            $('#api').html(data);
        });
    });

    // keypress timers
    var courseTimer;
    var institutionTimer;
    var doneTypingInterval = 3000;

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
            } else {
              // change border color to red to indicate failure
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
            } else {
              // change border color to red to indicate failure
            }
        });
    }
});
