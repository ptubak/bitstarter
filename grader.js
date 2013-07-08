#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://pure-headland-9300.herokuapp.com/";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var assertCorrectURL = function(url) {
        var strRegex = "^((https|http|ftp|rtsp|mms)?://)"
            + "?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?" //ftp?user@
            + "(([0-9]{1,3}\.){3}[0-9]{1,3}" // IP???URL- 199.194.52.184
            + "|" // ??IP?DOMAIN????
            + "([0-9a-z_!~*'()-]+\.)*" // ??- www.
            + "([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\." // ????
            + "[a-z]{2,6})" // first level domain- .com or .museum
            + "(:[0-9]{1,4})?" // ??- :80
            + "((/?)|" // a slash isn't required if there is no file name
            + "(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$";
         var re=new RegExp(strRegex);
         return re.test(url);
};


var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var cheerioHtmlURL = function(htmlurl) {
    return cheerio.load(rest.get(htmlurl));
}; 

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var checkURL = function(htmlurl, checksfile) {                                                                              
    rest.get(htmlurl, {
    	}).on('complete', function (data) {
      		fs.writeFile('./test.html', data, function(err, data) {
      	});
	 return checkHtmlFile ('./test.html', checksfile);
    }); 
   // return checkHtmlFile ('./test.html', checksfile);
}; 

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
	.option('-u, --url <url>', 'URL to html to be checked', URL_DEFAULT)
        .parse(process.argv);
    var checkJson = null;
    if (program.file) checkJson = checkHtmlFile(program.file, program.checks);
    if (program.url) {
	checkURL(program.url, program.checks);
	checkJson = checkHtmlFile('./test.html', program.checks);
	//console.log('I was here');
    }
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
