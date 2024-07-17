POST http://localhost:8080/v1/fragments

Content-Type: invalid/invalid
[BasicAuth]
user1@email.com:password1
``


HTTP/1.1 415
[Asserts]
jsonpath "$.status" == "error"
