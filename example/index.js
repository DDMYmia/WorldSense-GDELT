exports.handler = async (event, context) => {
  // Your function logic here
  console.log('Received event:', JSON.stringify(event, null, 2));

  const response = {
      statusCode: 200,
      body: JSON.stringify('Hello from Lambda222222!'),
  };
  return response;
};