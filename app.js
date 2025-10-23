const http = require('http');
let servidor = http.createServer(function(request,response){});
servidor.listen(3000, function(error){
    if(error)
        console.log('error');
    else
        console.log('Servidos en 3000');
});