# stutter.js
LISP in javascript.

My own dialect LISP. Just for funzies.  The goal of this project isn't to make a pretty compiler, or anything nice at all. 
It's to figure stuff out for myself and have fun.  I've done some research on how to make languages, but of course I'm probably
doing something wrong.  I hope to make a similar dialect in Rust when I'm done with this. Have fun reading my mess!

###Syntax overview:

**Expressions**  
expressions are wrapped in parenthases `( )`. They consist of a function and arguments `(func arg0 arg1 arg2 ... argN)`

**Lists**  
Lists are wrapped in square brackets `[ ]`. They consist of space separated items `[1 2 3 4 5 'six!']`

**Objects**  
Objects are wrapped in curly braces `{ }`.  They consist of keys every odd number and values every even number `{key0 value0 key1 value1}`

**Strings**  
Strings are wrapped in quotes `' '` or `" "`.  Stuff in strings becomes a string.

**Errors**  
don't exist unless they're thrown by javascript.  Because I don't wanna clean up after you mess!!!
