// Authentication Script
// Export Function as Object. (this way of hding private functionality)
// How? Well We are only exporting the function(octoFarmOptions){}
// We are able to call function, and the properties of the object (function)
// So we cache our session access Token, and a getAccessToken to get the token.
const { access } = require('fs');
var https = require('https');

module.exports = function(octoFarmOptions){
    // This is for authentication, hid the functions here so even when called upon is not known.
    var accessToken;
    var KEY = 'EEE76D144F4F43B5A21FC6C7DDB93FE0';
    var OCTOIP = 'http://localhost:5000';
    function getAccessToken(cb){
        if(accessToken) return cb(accessToken);
        // What does this do?

    // ONLY FOR O-AUTH APPLICATIONs 
        // var bearerToken = Buffer(
        //     encodeURIComponent(octoFarmOptions.consumerKey)
        // ).toString('base64');

    // Store our POST Request to authnecticate
        // our HTTPS request Stored here
    var options = {
            url: OCTOIP + "/api/connection",
            method: "POST",
            headers:{
                "X-API-Key": KEY
            },
        };    

        https.request(options, function(res){
            var data = '';
            res.on('data', function(chunk){
                data += chunk;
            });
            res.on('end', function(){
                var auth = JSON.parse(data);
                console.log(auth)
                if(auth.token_type!=='bearer'){
                    console.log('OCTOFARM AUTH FAILED.');
                    return;
                }
                accessToken = auth.access_token;
                cb(accessToken);
            });
        }).end();
    }
    
    //look for .gcode file
    // This takes function getAccessToken, change options to fit the purpose
    return {
        uploadFile: function(cb){
            //what does this do?
            getAccessToken(function(accessToken)
            {
                var options =
                {
                    url: OCTOIP + "/api/connection",
                    method: "POST",
                    headers:{
                        "X-API-Key": KEY
                    },
                }; 
                https.request(options, function(res){
                    var data = '';
                    res.on('data', function(chunk){
                        data += chunk;
                    });
                    res.on('end', function(){
                        var auth = JSON.parse(data);
                        if(auth.token_type!=='bearer'){
                            console.log('OCTOFARM AUTH FAILED.');
                            return;
                        }
                        accessToken = auth.access_token;
                        cb(accessToken);
                    });
                }).end();


            })
        },
    };
};