This is an assignment demonstrating shortening of url using AWS Lambda, API Gateway and AWS DynamoDb.
The steps to be followed are 
1. Send a POST request to the following URL--https://pgsgrucbm7.execute-api.us-east-1.amazonaws.com/prod/get-url-shortner
    This request should have a json body according to the below example
    ```json
    "longUrl":"https://www.google.com"
    ```
    You will get a shortUrl in the response body of the request.
2. Send a GET request to the shortUrl and you will be redirected to the original website.
