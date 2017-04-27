"""HTTP Error codes."""

## Request was successful
SUCCESS                 = 200   #: everything is good
CREATED                 = 201   #: something was created
LONG_POLL               = 209   #: long poll connection created
## 4xx series - client-side problem
ERR_BAD_REQUEST         = 400   #: missing of invalid fields
ERR_UNAUTHORIZED        = 401   #: user is not logged in
ERR_PAYMENT_REQURED     = 402   #: unused code, maybe should use...
ERR_FORBIDDEN           = 403   #: user is logged in, but does not have permissions
ERR_NOT_FOUND           = 404   #: some resource is not found
ERR_METHOD_NOT_ALLOWED  = 405   #: GET/PUT wrong
ERR_CONFLICT            = 409   #: edit conflict
ERR_TOO_MANY_REQUESTS   = 429   #: velocity
# BL Errors
ERR_FATAL               = 430   #: some fatal error that prevents us from continuing
ERR_BL_ERROR            = 431   #: Business logic error (Message says what)

## 5xx series - client ok, but server is unhappy
ERR_SERVER_ERROR        = 500   #: generic server error
ERR_INSUFFICIENT_STORAGE = 507  #: quota full

## 46x+ series - custom business logic errors

