import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as crypto from "node:crypto";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Request body is required" }),
      };
    }
    const { longUrl }: { longUrl: string } = JSON.parse(event.body);
    if (!longUrl || !isValidUrl(longUrl)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "A valid URL is required" }),
      };
    }
    const shortId: string = crypto.randomBytes(4).toString("hex");
    await docClient.send(
      new PutCommand({
        TableName: process.env.TABLE_NAME,
        Item: {
          shortId,
          longUrl,
        },
      }),
    );
    const domain = event.requestContext.domainName;
    const stage = event.requestContext.stage;
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        shortUrl: `https://${domain}/${stage}/short/${shortId}`,
      }),
    };
  } catch (error) {
    console.error("Error creating shortUrl", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
