# the assignment route - from the DB query to creating and visualizing
# the assignment

## the route itself

The routes themselves are configured in `config/routes.js`.

They are typically taking a path and forwarding it to a particular
javascript function, with a error handler.

For the assignment route, you can post and get assignment. To get the assignmentit is (`config/routes.js`) it is

app.get('/assignments/:assignmentNumber/:username', assignments.get, handleError);


## function answering the assignment path

The function that defines how to process a path are usually imported
from a controller in `app/controlers/assignments.js`.

The controller file puts the function in `exports` and the
`config/routes.js` uses it from there.

The function that processes the assignment  route is 

exports.get = function (req, res, next)

`req` defines the input of the function such as the `req.query`
parameters. It also contains the session variable such as `req.user`
(the username authenticated).

`res` is the response object that essentially is returned to the webclient.

`next'  handles errors

This function does a lot of checks - user name, api key, email, assignment
number, number of sub assignments, etc (catches errors at every instance).
Then it calls renderVis

### renderVis(res, assignment)

This function constructs gathers the needed information and resources 
that will be used to compose the HTML page (meta data, scripts). It checks
the type of visualization from the input JSON, sets visualization type  
and display modes, gets the appropriate scripts (corresponding JS files, like
`array2d.js`) and finally calls the `render()` function, passing a dictionary of all this information.

## outputting JSON

one would answer a route through with a JSON file with something like:

```
res.setHeader('Content-Type', 'application/json');
res.end(JSON.stringify({foo:1, bar:'soo'}));
```


## outputting HTML

If you want to return HTML, you typically dont directly return
HTML. You usually use a template to make the HTML. Here we use PUG as the templating language. And you can return static html with:

There is a `boilerplate` pug template that creates the `head` and `body` 
sections of the html document, which is further defined in other more 
specific pug template files (through `blocks`) See 
views/includes/boilerplate.pug and any other pug file for more information

```
return res.render('admin/help');
```

This will use the PUG template in `app/views/admin/help.pug`

You can also pass variables to the PUG template. For instance, the assignment gallery uses:
```
return res.render('assignments/gallery', {
    "title": "Assignment gallery",
    "user":req.user,
    "assignmentNumber":req.params.assignmentNumber,
    "assignments":assignmentResult
});
```

For instance the declared `assignmentNumber` is used in `gallery.pug` with:

```
      - if (assignmentNumber < 0)
             h1(style="text-align: left") Looks like there aren't any assignments here...    :(
        - else
             h1(style="text-align: left") Public Gallery for assignments with number '#{assignmentNumber}'
```
