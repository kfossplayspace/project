let apiKey = null;

function setApiKey(){
  apiKey = process.env.API_KEY;
  if(process.argv[2] != null){
      if(process.argv[2].indexOf('=') >= 0){
          apiKey = process.argv[2].substring(process.argv[2].indexOf('=')+1,process.argv[2].length );
      }
  }
  if(apiKey && apiKey.length >0){
      console.log("api-key: " + apiKey );
  }else{
      console.log("apiKey has no value. Please provide a value through the API_KEY env var or --api-key cmd line parameter.");
      process.exit(0);
  }  
}

function checkApiKey(req, res, next) {
    const apiKeyHeader = req.headers['x-api-key']; // Assuming the API key is sent in the header named 'x-api-key'
  
    // Check if API key is present
    if (!apiKeyHeader) {
      return res.status(401).json({ message: 'Unauthorized: Missing API key' });
    }
  
    // Compare the received key with the stored key (from environment variable or configuration file)
    //if (apiKeyHeader !== process.env.API_KEY) {
    if (apiKeyHeader !== apiKey ) {
      return res.status(403).json({ message: 'Forbidden: Invalid API key' });
    }
  
    // If valid key, continue processing the request
    next();
  }
  
  setApiKey();
  
  module.exports = {setApiKey, checkApiKey};


  
  
