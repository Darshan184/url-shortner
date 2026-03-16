import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    const shortId = event.pathParameters?.shortId;
    if (!shortId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "shortId is required in path parameters",
        }),
      };
    }
    const response = await docClient.send(
      new GetCommand({
        TableName: process.env.TABLE_NAME,
        Key: { shortId },
      }),
    );
    if (!response.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Short URL not found" }),
      };
    }
    const originalUrl = response.Item.longUrl;
    return {
      statusCode: 301,
      headers: {
        Location: originalUrl,
      },
      body: "",
    };
  } catch (error) {
    console.error("Error redirecting to original URL", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
