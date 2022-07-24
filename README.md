# FormDataTree

FormDataTree fills a gap between the FormData interface and PHP superglobal variables.

## What problems does it solve?

To access user input data through a web form on client-side, you can use the [FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData) interface. A FormData object provides a set of key/value pairs representing form fields and their values, and the data model emulates the `multipart/form-data` encoding type.

Programming languages and libraries that can handle HTTP requests on server-side often provide their own methods to access user input data in the request. For instance, PHP provides ["superglobal" variables](https://www.php.net/manual/en/language.variables.superglobals.php) like `$_GET`, `$_POST`, and `$_FILES`.

What is worth noting here is that the data structure representing the same user input can look different on client-side and on server-side. For example, when the user input data is like this:

`country=China&country=India`

A FormData object representing it will be in a structure like this:

```
{
  [
    [ "country", "China" ],
    [ "country", "India" ]
  ]
}
```

On the other hand, PHP constructs an associative array based on the user input data. The `$_POST` variable will be like this:

```
{
  "country": "India"
}
```

When square bracket notation (`[]`) is used, the difference becomes more noticeable. When the user input data is like this:

`country[]=China&country[]=India`

A FormData object treats the square brackets as a meaningless part of a field name, so it will be like this:

```
{
  [
    [ "country[]", "China" ],
    [ "country[]", "India" ]
  ]
}
```

PHP treats the square brackets as an array literal, so the `$_POST` variable will be like this:

```
{
  "country": [ "China", "India" ]
}
```

This gap becomes a problem when you need to process user input data in a consistent way on client-side and on server-side. FormDataTree has been created to resolve this problem. A FormDataTree object works as a wrapper of a FormData object, and has the ability to provide user input data in a structure equivalent to PHP's `$_POST` variable.
