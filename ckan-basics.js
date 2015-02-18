/**
 *  @file This script is intended to help you bootstrap the connection between 
 *  your Javascript proiect and the ckan datastore API. Further reading on the
 *  datastore extension and its somewhat documented API can be found at:
 *  
 *   http://ckan.readthedocs.org/en/latest/maintaining/datastore.html
 *
 *  In addition to the basic functions of querying ckan, there are also some
 *  other useful helper functions that might come in handy. Though the goal
 *  of this script is moslty simple working examples to start with.
 *
 *  I will endeavor to list what functions or libraries a function may depend 
 *  on to work at all.
 **/

// the resource id is how ckan identifies what data set we're working with
// you can get it through the ckan web ui, cpy and paste it.
function getResourceID() { return '5e6cb5c8-8e69-4d0b-85c3-8765454e9667'; }

// the auth token is how you write applications against private data sets
// it is unique to your ckan user, and you can find it in the web UI
// uncomment and copy/past as needed.
function getAuthToken() { return auth; }

// this should not change very often, but it is the search endpoint we're using.
function getCkanUrl() { return 'https://data.opentechinstitute.org/api/3/action/datastore_search'; }


/**
 *  @function Build the basic data object that will be passed to CKan when
 *  you make a query
 *
 *  This function dedpends on getResourceID()
 * 
 *  Inside the function where you use this, you can add or modify values by
 *  doing something like:
 *     data['fields'] = 'Term';
 *     data['limit'] = 500;
 *
 *  @return The basic data object to send to ckan 
 **/ 
function buildDefaultDataObj() {
  var data = {
      resource_id : getResourceID(),
      // which fields to return, format like 
      //   fields
       limit: 500,
      // distinct : true, // this doesn't seem to work, but leaving in hope that it migh
  }
    //console.log(data);
    return data;
}

/**
 * @function Send a query to the Ckan datastore API
 *
 * @param query: the query string that you are sending to ckan
 *
 * This function depends on getAuthToken (if you're working with private data),
 * getCkanUrl, buildDefaultDataObj and jQuery to make the ajax request
 **/
function firequery(query) {
    // this is a jquery example of setting the value of a form field based on
    // the query param. Remove the "query" in the below line to get the current
    // value of the field
    //$('form#search-form #q').val(query);
    // this is a jquery ajax function. other implementations might look a little
    // bit different than this does.
    var data = buildDefaultDataObj();
    // put the query string in the data request object
    data["q"] = query;
    
    $.ajax({
        //  The authorization token must be sent in the request header,
        //  uncomment the line below to use a private data set
        headers: {Authorization: getAuthToken()},
        url: getCkanUrl(),
        data: data,
        dataType: 'jsonp',
        success: function(data) {
            // send the full result to the console, for learning
            //console.log(data);
            // at this point you have presumabely made a request, and gotten a result
            // and can start digging through the records.
            var records = data.result.records;
            console.log(records);
            // jquery loop through each of the returned result rows.
            $.each( records, function( k, v ) {
                // since this example comes from cyberdefinitions, the main field
                // is Term, so v.Term is just v.FIELDNAME for the value of that fi
               /* var term = v.name.replace(/ +$/, "");
                
                var imports = v.imports_from;
                var imp_arr = imports.split(",");
                //console.log(imp_arr);

                var exports = v.exports_to;
                var exp_arr = exports.split(",");
                //console.log(exp_arr);

                var nato = v.NATO;
                if(nato == 1) { imp_arr.push("NATO");}

                var domestic = v.domestic_production;
                var dom_arr = [];
                if(domestic == 1) { dom_arr.push(term);}
                //console.log(dom_arr);

                for(i = 0; i < imp_arr.length; i++){ 
                        var t = [imp_arr[i].trim(), term, "1", "something"];
                        sales_data.push(t);
                            for (j = 0; j < exp_arr.length; j++){
                                var t2 = [term, exp_arr[j].trim(), "1", "something"];
                                sales_data.push(t2);
                            }

                }*/

            })
            return records;
        }
    });
}



// these next three functions were written for cyberdefinitions, but are a good
// example of grabbing data from ckan, and caching it in the page DOM (using
// jquery). This is helpful for things like the values of a select list, which
// change, but not often enough to requre frequent ajax requests
//
// They require: buildDefaultDataObj, jQuery and each other to work
function loadYears() {
    if ($('body').data('years') === undefined) {
        var data = buildDefaultDataObj();
        data['fields'] = 'Year';
        data['limit'] = 1000;
        $.ajax({
            //  headers: {Authorization: getAuthToken()},
            url: getCkanUrl(),
            data: data,
            dataType: 'json',
            async: false,
            success: function(data) {
                years = {};
                for (i = 0; i < data.result.total; i++) {
                    var year = data.result.records[i];
                    year = year['Year'];
                    if (year === 'No year given') {
                        var ckanyear = '';
                        var year = year;
                    }
                    else {
                        var ckanyear = year;
                        year = year.substring(0, year.length -2);
                    }
                    if (!(year in years)) { years[year] = ckanyear; }
                }             
                $('body').data('years', years);
            }
        });
    }
    var years = $('body').data('years')
    return years;
}

function loadYearsArray() {
  var years = loadYears();
  var out = [];
  $.each(years, function( k, v ) {
    out.push(k);
  });
    return out.sort();
}

function buildYearSelect() {
    var ckanyears = loadYears();
    var years = loadYearsArray();
    var noyear = years.pop();
    var options = '<option value="'+ noyear +'">'+ noyear +'</option>';
    $.each(years, function(k, year) {
        options += '<option value="'+ ckanyears[year] +'">'+ year +'</option>';
    });
    $('select#Year').append(options);    
}


/**
 * @function Helper function to grab the value from a url query parameter
 * for example take the URI "http://example.com?q=SearchPhrase" this will return
 * the value of q.
 *
 * @param name: The name of the parameter in the query string
 *
 * @return: A string containing the value of the parameter or an empty string
 **/
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    // ternary - if there is no result return an empty string
    // else the param value
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

/**
 * @function Helper function to grab the value from all url query parameters
 * 
 * @return: An object containing the key value pairs for all params, or a
 * boolean false, if there are no strings.
 **/
function getAllParams() {
    var querystring = window.location.href.split('?')[1];
    if (querystring) {
        var queryparams = querystring.split('&');
        
        var params = {};
        $.each(queryparams, function(key, value) {
            var values = value.split('=');
            params[values[0]] = values[1];
        });
        return params;
    }
    else { return false; }
}





/**
 * @function: Helper function to do fuzzy case match
 *  eg: SearchTerm and searchterm
 *
 *  this is built for cyberdefinitions using Terms
 *  THIS WILL NOT WORK
 *  however it is a good learning experience
 **/
function caseMatch(query) {
    var terms = getTermsFromDataset();
    var term = $.each(terms, function(t, v) {
      if (t.toLowerCase() === query.toLowerCase()){
          query = t;
      }
    });
    return query
}

