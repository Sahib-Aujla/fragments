# Sending get requet to a non existent route
GET http://localhost:8080/no-such-route


# expected to get 404
HTTP/1.1 404
#asserting the status to be equal to error
[Asserts]
jsonpath "$.status" == "error"