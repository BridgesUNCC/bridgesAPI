# How to add routes

## the route itself

The routes themselves are configured in `config/routes.js`.

They are typically taking a path and forwarding it to a particular
javascript function, with a error handler.

## function answering the path

The function that define how to process a path are usually imported
from a controller in `app/controlers`.

The controller file put the function in `exports` and the
`config/routes.js` use it from there.

The function that process a route takes two parameters: usually `req`
and `res`.

`req` defines the input of the function such as the `req.query`
parameters. It also contains the session variable such as `req.user`
(the username authenticated).

`res` is the response object that essentialyl is returned to the webclient.

## outputting JSON

one would answer a route through with a JSON file with something like:

```
res.setHeader('Content-Type', 'application/json');
res.end(JSON.stringify({foo:1, bar:'soo'}));
```


## outputting HTML

If you want to return HTML, you typically dont directly return
HTML. You usually use a template to make the HTML. Here we use PUG as the templating language. And you can return static html with:

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