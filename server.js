var http = require('http');
var url = require('url');
var fs = require('fs');
const { Client } = require('pg');
var StringDecoder = require('string_decoder').StringDecoder; 


const hostname = '127.0.0.1';
const port = 8080;
const dbname = "jubelioecommerce";

const con = new Client({
    host: "localhost",
    user: "postgres",
    password: "admin",
    database: "jubelioecommerce"
})
con.connect(function(err) {
    if (err) throw err;
});


const server = http.createServer(function (req, res) {
    var link = url.parse(req.url, true);

    // welcome home page 
    if (link.pathname == '' || link.pathname == '/') {
        if (req.method == 'GET') {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write("Welcome to Chirag Wadhwani's Jubelio Skill Test with Node.js!");
            return res.end();
        }
        else {
            res.writeHead(405, {'Content-Type': 'text/html'});
            res.end();
        }
    }


    // PRODUCTS


    // Get all product list
    else if (link.pathname == '/productlist') {
        if (req.method == 'GET') {
            con.query("SELECT Title, SKU, Image, Price, Stock FROM public.\"Product\"", function (err, result, fields) {
                res.writeHead(200, {'Content-Type': 'application/json'});
                if (result.rowCount > 0) {res.end(JSON.stringify(result['rows']));}
                else {res.end(JSON.stringify({"Message":"Product List is Empty"}));}
            });
        }
        else {
            res.writeHead(405, {'Content-Type': 'text/html'});
            res.end();
        }
    }

    // Get a specific product detail
    else if (link.pathname == '/productdetail') {
        if (req.method == 'POST') {

            // Get the request body
            var decoder = new StringDecoder('utf-8'); 
            var buffer = '', body = '', skuvalue = ''; 
            req.on('data', function(data) {
                buffer += decoder.write(data); 
            }); 
            req.on('end', function() { 
                buffer += decoder.end();
                body = JSON.parse(buffer);
                skuvalue = body['sku'];

                con.query("SELECT Title, SKU, Image, Price, Stock, Description FROM public.\"Product\" WHERE sku='" + skuvalue + "'", function (err, result, fields) {
                    if (err) {
                        res.writeHead(500, {'Content-Type': 'application/json'});
                        res.end(JSON.stringify({"Info":"Some Error Occured","Message":err}));
                    }
                    else {
                        res.writeHead(200, {'Content-Type': 'application/json'});
                        if (result.rowCount > 0) {res.end(JSON.stringify(result.rows));} 
                        else {res.end(JSON.stringify({"Message":"Product " + skuvalue + " Not Found"}));}
                    }
                });
            });
        }
        else {
            res.writeHead(405, {'Content-Type': 'text/html'});
            res.end();
        }
    }

    // Create or update a specific product detail
    else if (link.pathname == '/updateproduct') {
        if (req.method == 'POST') {

            // Get the request body
            var decoder = new StringDecoder('utf-8'); 
            var buffer = '', body = '', datafound = false; 
            req.on('data', function(data) {
                buffer += decoder.write(data); 
            }); 
            req.on('end', function() { 
                buffer += decoder.end();
                body = JSON.parse(buffer);

                if (body['title'] == undefined || body['sku'] == undefined || body['description'] == undefined || body['stock'] == undefined || body['price'] == undefined) {
                    res.writeHead(400, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({"Info":"Error Incomplete Fields","Message":"Product " + body['sku'] + " Details Incomplete"}));
                } else {
                    con.query("SELECT * FROM public.\"Product\" WHERE sku=$1",[body['sku']], function (err, result, fields) {
                        if (result.rowCount > 0) {
                            con.query("UPDATE public.\"Product\" SET title=$1, sku=$2, price=$3, description=$4, stock=$5 WHERE sku=$2",[body['title'],body['sku'],body['price'],body['description'],body['stock']], function (err2, result2, fields2) {
                                res.writeHead(202, {'Content-Type': 'application/json'});
                                res.end(JSON.stringify({"Info":"Success","Message":"Product " + body['sku'] + " Details Successfully Updated"}));
                            });
                        } else {
                            con.query("INSERT INTO public.\"Product\" (title,sku,price,description,stock) VALUES ($1, $2, $3, $4, $5)",[body['title'],body['sku'],body['price'],body['description'],body['stock']], function (err3, result3, fields3) {
                                res.writeHead(200, {'Content-Type': 'application/json'});
                                res.end(JSON.stringify({"Info":"Success","Message":"Row Inserted Successfully"}));
                            });
                        }
                    });
                }
            });
        }
        else {
            res.writeHead(405, {'Content-Type': 'text/html'});
            res.end();
        }
    }
   
    // Delete a specific product
    else if (link.pathname == '/deleteproduct') {
        if (req.method == 'POST' || req.method == 'DELETE') {

            // Get the request body
            var decoder = new StringDecoder('utf-8'); 
            var buffer = '', body = ''; 
            req.on('data', function(data) {
                buffer += decoder.write(data); 
            }); 
            req.on('end', function() { 
                buffer += decoder.end();
                body = JSON.parse(buffer);

                if (body['sku'] == undefined) {
                    res.writeHead(400, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({"Info":"Error Incomplete Fields","Message":"Product SKU Detail Not Found"}));
                } else {
                    con.query("DELETE FROM public.\"Product\" WHERE sku=$1",[body['sku']], function (err, result, fields) {
                        console.log({"del":result,"err":err});
                        res.writeHead(200, {'Content-Type': 'application/json'});
                        if (result.rowCount > 0) {res.end(JSON.stringify({"Info":"Success","Message":"Product " + body['sku'] + " Deleted Successfully"}));}
                        else {res.end(JSON.stringify({"Message":"Product " + body['sku'] + " Not Found"}));}
                    });
                }
            });
        }
        // else if (req.method == 'GET') {
        //     var q = url.parse(req.url, true).query;

        //     con.query("DELETE FROM public.\"Product\" WHERE sku=$1",[q.sku], function (err, result, fields) {
        //         res.writeHead(200, {'Content-Type': 'application/json'});
        //         if (result.rowCount > 0) {res.end(JSON.stringify(result));}
        //         // res.end(JSON.stringify({"Message":"Product " + skuvalue + " Not Found"}));
        //     });
        // }
    }

    // Create a specific product detail from dummyjson.com 
    else if (link.pathname.startsWith('/fetchnewproduct')) {
        if (req.method == 'GET') {

            var productid = link.pathname.split('/')[2], datafound = false;
            if (productid == undefined) {
                res.writeHead(406, {'Content-Type': 'text/html'});
                res.end(JSON.stringify({"Info": "Error Missing ProductID Parameter in URL", "Message": "Example: /fetchnewproduct/abc12345"}));    
            } else {
                fetch('https://dummyjson.com/products/' + productid)
                .then(data => data.json())
                .then((data) => {
                    con.query("SELECT * FROM public.\"Product\" WHERE sku=$1",[data['sku']], function (err, result, fields) {                 
                        if (result.rowCount > 0) {
                            datafound = true;
                            res.writeHead(409, {'Content-Type': 'application/json'});
                            res.end(JSON.stringify({"Info": "Error Data Conflict", "Message": "This Record Already Exists"}));
                        } else {
                            con.query("INSERT INTO public.\"Product\" (title,sku,price,description,stock) VALUES ($1, $2, $3, $4, $5)",[data.title,data.sku,data.price,data.description,data.stock], function (err2, result2, fields2) {
                                res.writeHead(200, {'Content-Type': 'application/json'});
                                res.end(JSON.stringify({"Info": "Success", "Message": "Row Inserted Successfully"}));
                            });
                        }
                    });
                });
            }
        }
        else {
            res.writeHead(405, {'Content-Type': 'text/html'});
            res.end();
        }
    }




    // TRANSACTIONS


    // Get all transactions list
    else if (link.pathname == '/transactionslist') {
        if (req.method == 'GET') {
            con.query("SELECT SKU, Qty, Amount FROM public.\"Transaction\"", function (err, result, fields) {
                res.writeHead(200, {'Content-Type': 'application/json'});
                if (result.rowCount > 0) {res.end(JSON.stringify(result['rows']));}
                else {res.end(JSON.stringify({"Message":"Transaction List is Empty"}));}
            });
        }
        else {
            res.writeHead(405, {'Content-Type': 'text/html'});
            res.end();
        }
    }

    // Get a specific transaction detail
    else if (link.pathname == '/transactiondetail') {
        if (req.method == 'POST') {

            // Get the request body
            var decoder = new StringDecoder('utf-8'); 
            var buffer = '', body = '', skuvalue = ''; 
            req.on('data', function(data) {
                buffer += decoder.write(data); 
            }); 
            req.on('end', function() { 
                buffer += decoder.end();
                body = JSON.parse(buffer);
                skuvalue = body['sku'];

                con.query("SELECT SKU, Qty, Amount FROM public.\"Transaction\" WHERE sku='" + skuvalue + "'", function (err, result, fields) {
                    if (err) {
                        res.writeHead(500, {'Content-Type': 'application/json'});
                        res.end(JSON.stringify({"Info":"Some Error Occured","Message":err}));
                    }
                    else {
                        res.writeHead(200, {'Content-Type': 'application/json'});
                        if (result.rowCount > 0) {res.end(JSON.stringify(result.rows));} 
                        else {res.end(JSON.stringify({"Message":"Transaction " + skuvalue + " Not Found"}));}
                    }
                });
            });
        }
        else {
            res.writeHead(405, {'Content-Type': 'text/html'});
            res.end();
        }
    }

    // Create or update a specific transaction detail
    else if (link.pathname == '/updatetransaction') {
        if (req.method == 'POST') {

            // Get the request body
            var decoder = new StringDecoder('utf-8'); 
            var buffer = '', body = '', datafound = false; 
            req.on('data', function(data) {
                buffer += decoder.write(data); 
            }); 
            req.on('end', function() { 
                buffer += decoder.end();
                body = JSON.parse(buffer);

                if (body['sku'] == undefined || body['qty'] == undefined) {
                    res.writeHead(400, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({"Info":"Error Incomplete Fields","Message":"Transaction Field Details Incomplete"}));
                } else {
                    con.query("SELECT * FROM public.\"Transaction\" WHERE sku=$1",[body['sku']], function (err, result, fields) {
                        if (result.rowCount > 0) {
                            con.query("UPDATE public.\"Transaction\" SET sku=$1, qty=$2, amount=$3 WHERE sku=$1",[body['sku'],body['qty'],body['amount']], function (err2, result2, fields2) {
                                res.writeHead(202, {'Content-Type': 'application/json'});
                                res.end(JSON.stringify({"Info":"Success","Message":"Transaction " + body['sku'] + " Details Successfully Updated"}));
                            });
                        } else {
                            con.query("INSERT INTO public.\"Transaction\" (sku,qty,amount) VALUES ($1, $2, $3)",[body['sku'],body['qty'],body['amount']], function (err3, result3, fields3) {
                                res.writeHead(200, {'Content-Type': 'application/json'});
                                res.end(JSON.stringify({"Info":"Success","Message":"Row Inserted Successfully"}));
                            });
                        }
                    });
                }
            });
        }
        else {
            res.writeHead(405, {'Content-Type': 'text/html'});
            res.end();
        }
    }

    // Delete a specific transaction
    else if (link.pathname == '/deletetransaction') {
        if (req.method == 'POST' || req.method == 'DELETE') {

            // Get the request body
            var decoder = new StringDecoder('utf-8'); 
            var buffer = '', body = ''; 
            req.on('data', function(data) {
                buffer += decoder.write(data); 
            }); 
            req.on('end', function() { 
                buffer += decoder.end();
                body = JSON.parse(buffer);

                if (body['sku'] == undefined) {
                    res.writeHead(400, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({"Info":"Error Incomplete Fields","Message":"Transaction SKU Detail Not Found"}));
                } else {
                    con.query("DELETE FROM public.\"Transaction\" WHERE sku=$1",[body['sku']], function (err, result, fields) {
                        res.writeHead(200, {'Content-Type': 'application/json'});
                        if (result.rowCount > 0) {res.end(JSON.stringify({"Info":"Success","Message":"Transaction " + body['sku'] + " Deleted Successfully"}));}
                        else {res.end(JSON.stringify({"Message":"Transaction " + body['sku'] + " Not Found"}));}
                    });
                }
            });
        }
    }


});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});