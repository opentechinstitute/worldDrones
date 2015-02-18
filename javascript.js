(function ($) { 
	$(document).ready(function() {

//ckan-basics.js
var auth = '167349b0-8a09-419f-a0e6-b0ff1b130733';

function getResourceID() { return '5e6cb5c8-8e69-4d0b-85c3-8765454e9667'; }
function getAuthToken() { return auth; }
function getCkanUrl() { return 'https://data.opentechinstitute.org/api/3/action/datastore_search'; }

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

function caseMatch(query) {
    var terms = getTermsFromDataset();
    var term = $.each(terms, function(t, v) {
      if (t.toLowerCase() === query.toLowerCase()){
          query = t;
      }
    });
    return query;
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    // ternary - if there is no result return an empty string
    // else the param value
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}



//biPartite2.js
  var bP={};  
  var b=50, bb=500, height=650, buffMargin=2, minHeight=10;
  var c1=[-130, 60], c2=[-50, 100], c3=[-10, 140]; //Column positions of labels.
  /*var colors = d3.scale.ordinal().domain(["North America","Asia","Europe","Middle East","Africa","South America"])
    .range( //colorbrewer.RdBu[6]);
      ["#3182bd", "#6baed6", "#9ecae1","#c6dbef","#e6550d","#fd8d3c","#fdae6b",
    "#fdd0a2", "#31a354", "#74c476", "#a1d99b", "#c7e9c0", "#756bb1", "#9e9ac8",
    "#bcbddc", "#dadaeb", "#636363", "#969696", "#bdbdbd", "#d9d9d9"]);*/
  
  var colors = ["#3182bd", "#6baed6", "#9ecae1","#c6dbef","#e6550d","#fd8d3c","#fdae6b",
  "#fdd0a2", "#31a354", "#74c476", "#a1d99b", "#c7e9c0", "#756bb1", "#9e9ac8",
  "#bcbddc", "#dadaeb", "#636363", "#969696", "#bdbdbd", "#d9d9d9"];
  
  bP.partData = function(data,p){
    var sData={};
    
    sData.keys=[
      d3.set(data.map(function(d){ return d[0];})).values().sort(function(a,b){ return ( a<b? -1 : a>b ? 1 : 0);}),
      d3.set(data.map(function(d){ return d[1];})).values().sort(function(a,b){ return ( a<b? -1 : a>b ? 1 : 0);})
    ];
    
    sData.data = [  sData.keys[0].map( function(d){ return sData.keys[1].map( function(v){ return 0; }); }),
            sData.keys[1].map( function(d){ return sData.keys[0].map( function(v){ return 0; }); })
    ];
    
    data.forEach(function(d){ 
      sData.data[0][sData.keys[0].indexOf(d[0])][sData.keys[1].indexOf(d[1])]=d[p];
      sData.data[1][sData.keys[1].indexOf(d[1])][sData.keys[0].indexOf(d[0])]=d[p];
    });
    
    return sData;
  }
  
  function visualize(data){
    var vis ={};
    function calculatePosition(a, s, e, b, m){
      var total=d3.sum(a);
      var sum=0, neededHeight=1, leftoverHeight= e-s-0.5*b*a.length;
      var ret =[];
      
      a.forEach(
        function(d){ 
          var v={};
          v.percent = (total == 0 ? 0 : d/total); 
          v.value=d;
          v.height=Math.max(v.percent*(e-s-0.5*b*a.length), m);
          (v.height==m ? leftoverHeight-=m : neededHeight+=v.height );
          ret.push(v);
        }
      );
      
      var scaleFact=leftoverHeight/Math.max(neededHeight,1), sum=0;
      
      ret.forEach(
        function(d){ 
          d.percent = scaleFact*d.percent; 
          d.height=(d.height==m? m : d.height*scaleFact);
          d.middle=sum+b+d.height/2;
          d.y=s + d.middle - d.percent*(e-s-2*b*a.length)/2;
          d.h= d.percent*(e-s-2*b*a.length);
          d.percent = (total == 0 ? 0 : d.value/total);
          sum+=2*b+d.height;
        }
      );
      return ret;
    }

    vis.mainBars = [ 
      calculatePosition( data.data[0].map(function(d){ return d3.sum(d);}), 0, height, buffMargin, minHeight),
      calculatePosition( data.data[1].map(function(d){ return d3.sum(d);}), 0, height, buffMargin, minHeight/2)
    ];
    
    vis.subBars = [[],[]];
    vis.mainBars.forEach(function(pos,p){
      pos.forEach(function(bar, i){ 
        calculatePosition(data.data[p][i], bar.y, bar.y+bar.h, 0, 0).forEach(function(sBar,j){ 
          sBar.key1=(p==0 ? i : j); 
          sBar.key2=(p==0 ? j : i); 
          vis.subBars[p].push(sBar); 
        });
      });
    });
    vis.subBars.forEach(function(sBar){
      sBar.sort(function(a,b){ 
        return (a.key1 < b.key1 ? -1 : a.key1 > b.key1 ? 
            1 : a.key2 < b.key2 ? -1 : a.key2 > b.key2 ? 1: 0 )});
    });
    
    vis.edges = vis.subBars[0].map(function(p,i){
      return {
        key1: p.key1,
        key2: p.key2,
        y1:p.y,
        y2:vis.subBars[1][i].y,
        h1:p.h,
        h2:vis.subBars[1][i].h
      };
    });
    vis.keys=data.keys;
    return vis;
  }
  
  function arcTween(a) {
    var i = d3.interpolate(this._current, a);
    this._current = i(0);
    return function(t) {
      return edgePolygon(i(t));
    };
  }
  
  function drawPart(data, id, p){
    d3.select("#"+id).append("g").attr("class","part"+p)
      .attr("transform","translate("+( p*(bb+b))+",0)");
    d3.select("#"+id).select(".part"+p).append("g").attr("class","subbars");
    d3.select("#"+id).select(".part"+p).append("g").attr("class","mainbars");
    
    var mainbar = d3.select("#"+id).select(".part"+p).select(".mainbars")
      .selectAll(".mainbar").data(data.mainBars[p])
      .enter().append("g").attr("class","mainbar");

    mainbar.append("rect").attr("class","mainrect")
      .attr("x", 0).attr("y",function(d){ return d.middle-d.height/2; })
      .attr("width",b).attr("height",function(d){ return d.height; })
      .style("shape-rendering","auto")
      .style("fill-opacity",0).style("stroke-width","0.5")
      .style("stroke","black").style("stroke-opacity",0);
      
    mainbar.append("text").attr("class","barlabel")
      .attr("x", c1[p]).attr("y",function(d){ return d.middle+5;})
      .text(function(d,i){ return data.keys[p][i];})
      .attr("text-anchor","start" );
      
    /*mainbar.append("text").attr("class","barvalue")
      .attr("x", c2[p]).attr("y",function(d){ return d.middle+5;})
      .text(function(d,i){ return d.value ;})
      .attr("text-anchor","end");
      
    mainbar.append("text").attr("class","barpercent")
      .attr("x", c3[p]).attr("y",function(d){ return d.middle+5;})
      .text(function(d,i){ return "( "+Math.round(100*d.percent)+"%)" ;})
      .attr("text-anchor","end").style("fill","grey");*/
      
    d3.select("#"+id).select(".part"+p).select(".subbars")
      .selectAll(".subbar").data(data.subBars[p]).enter()
      .append("rect").attr("class","subbar")
      .attr("x", 0).attr("y",function(d){ return d.y})
      .attr("width",b).attr("height",function(d){ return d.h})
      .style("fill",function(d){return colors[d.key1];});
  }
  
  function drawEdges(data, id){
    d3.select("#"+id).append("g").attr("class","edges").attr("transform","translate("+ b+",0)");

    d3.select("#"+id).select(".edges").selectAll(".edge")
      .data(data.edges).enter().append("polygon").attr("class","edge")
      .attr("points", edgePolygon).style("fill",function(d){ return colors[d.key1];})
      .style("opacity",0.5).each(function(d) { this._current = d; }); 
  } 
  
  function drawHeader(header, id){
    d3.select("#"+id).append("g").attr("class","header").append("text").text(header[2])
      .style("font-size","15").attr("x",150).attr("y",-20).style("text-anchor","middle")
      .style("font-weight","bold");
    
    [0,1].forEach(function(d){
      var h = d3.select("#"+id).select(".part"+d).append("g").attr("class","header");
      
      h.append("text").text(header[d]).attr("x", (c1[d]-5))
        .attr("y", -5).style("fill","grey");
      
      /*h.append("text").text("Count").attr("x", (c2[d]-10))
        .attr("y", -5).style("fill","grey");*/
      
      h.append("line").attr("x1",c1[d]-10).attr("y1", -2)
        .attr("x2",c3[d]+10).attr("y2", -2).style("stroke","black")
        .style("stroke-width","1").style("shape-rendering","crispEdges");
    });
  }
  
  function edgePolygon(d){
    return [0, d.y1, bb, d.y2, bb, d.y2+d.h2, 0, d.y1+d.h1].join(" ");
  } 
  
  function transitionPart(data, id, p){
    var mainbar = d3.select("#"+id).select(".part"+p).select(".mainbars")
      .selectAll(".mainbar").data(data.mainBars[p]);
    
    mainbar.select(".mainrect").transition().duration(500)
      .attr("y",function(d){ return d.middle-d.height/2;})
      .attr("height",function(d){ return d.height;});
      
    mainbar.select(".barlabel").transition().duration(500)
      .attr("y",function(d){ return d.middle+5;});
      
    /*mainbar.select(".barvalue").transition().duration(500)
      .attr("y",function(d){ return d.middle+5;}).text(function(d,i){ return d.value ;});
      
    mainbar.select(".barpercent").transition().duration(500)
      .attr("y",function(d){ return d.middle+5;})
      .text(function(d,i){ return "( "+Math.round(100*d.percent)+"%)" ;});*/
      
    d3.select("#"+id).select(".part"+p).select(".subbars")
      .selectAll(".subbar").data(data.subBars[p])
      .transition().duration(500)
      .attr("y",function(d){ return d.y}).attr("height",function(d){ return d.h});
  }
  
  function transitionEdges(data, id){
    d3.select("#"+id).append("g").attr("class","edges")
      .attr("transform","translate("+ b+",0)");

    d3.select("#"+id).select(".edges").selectAll(".edge").data(data.edges)
      .transition().duration(500)
      .attrTween("points", arcTween)
      .style("opacity",function(d){ return (d.h1 ==0 || d.h2 == 0 ? 0 : 0.5);});  
  }
  
  function transition(data, id){
    transitionPart(data, id, 0);
    transitionPart(data, id, 1);
    transitionEdges(data, id);
  }
  
  bP.draw = function(data, svg){
    data.forEach(function(biP,s){
      svg.append("g")
        .attr("id", biP.id)
        .attr("transform","translate("+ (550*s)+",0)");
        
      var visData = visualize(biP.data);
      drawPart(visData, biP.id, 0);
      drawPart(visData, biP.id, 1); 
      drawEdges(visData, biP.id);
      drawHeader(biP.header, biP.id);
      
      [0,1].forEach(function(p){      
        d3.select("#"+biP.id)
          .select(".part"+p)
          .select(".mainbars")
          .selectAll(".mainbar")
          .on("mouseover",function(d, i){ return bP.selectSegment(data, p, i); })
          .on("mouseout",function(d, i){ return bP.deSelectSegment(data, p, i); }); 
      });
    }); 
  }
  
  bP.selectSegment = function(data, m, s){
    data.forEach(function(k){
      var newdata =  {keys:[], data:[]};  
        
      newdata.keys = k.data.keys.map( function(d){ return d;});
      
      newdata.data[m] = k.data.data[m].map( function(d){ return d;});
      
      newdata.data[1-m] = k.data.data[1-m]
        .map( function(v){ return v.map(function(d, i){ return (s==i ? d : 0);}); });
      
      transition(visualize(newdata), k.id);
        
      var selectedBar = d3.select("#"+k.id).select(".part"+m).select(".mainbars")
        .selectAll(".mainbar").filter(function(d,i){ return (i==s);});
      
      selectedBar.select(".mainrect").style("stroke-opacity",1);      
      selectedBar.select(".barlabel").style('font-weight','bold');
      selectedBar.select(".barvalue").style('font-weight','bold');
      selectedBar.select(".barpercent").style('font-weight','bold');
    });
  } 
  
  bP.deSelectSegment = function(data, m, s){
    data.forEach(function(k){
      transition(visualize(k.data), k.id);
      
      var selectedBar = d3.select("#"+k.id).select(".part"+m).select(".mainbars")
        .selectAll(".mainbar").filter(function(d,i){ return (i==s);});
      
      selectedBar.select(".mainrect").style("stroke-opacity",0);      
      selectedBar.select(".barlabel").style('font-weight','normal');
      selectedBar.select(".barvalue").style('font-weight','normal');
      selectedBar.select(".barpercent").style('font-weight','normal');
    });   
  }

//helper load js file function
function loadjscssfile(filename, filetype){
    if (filetype=="js"){ //if filename is a external JavaScript file
        var fileref=document.createElement('script')
        fileref.setAttribute("type","text/javascript")
        fileref.setAttribute("src", filename)
    }
    else if (filetype=="css"){ //if filename is an external CSS file
        var fileref=document.createElement("link")
        fileref.setAttribute("rel", "stylesheet")
        fileref.setAttribute("type", "text/css")
        fileref.setAttribute("href", filename)
    }
    if (typeof fileref!="undefined")
        document.getElementsByTagName("head")[0].appendChild(fileref)
}

//new for parallel chart
  var sales_data = [];
  var width = 1100, height = 1200, margin ={b:0, t:40, l:170, r:50};

  var svg2 = d3.select("#content2")
  .append("svg").attr('width',width).attr('height',(height+margin.b+margin.t))
  .append("g").attr("transform","translate("+ margin.l+","+margin.t+")");

  d3.json("https://data.opentechinstitute.org/api/action/datastore_search?resource_id=5e6cb5c8-8e69-4d0b-85c3-8765454e9667&data=data")
    .header("Authorization", getAuthToken())
    .get(function(error, data){
      if (error) return console.warn(error);
        var records = data.result.records;

          $.each( records, function( k, v ) {

                var term = v.name.replace(/ +$/, "");
                
                var imports = v.imports_from;
                var imp_arr = imports.split(",");

                var exports = v.exports_to;
                var exp_arr = exports.split(",");

                var nato = v.NATO;
                if(nato == 1) { imp_arr.push("NATO");}

                var domestic = v.domestic_production;
                var dom_arr = [];
                if(domestic == 1) { dom_arr.push(term);}

                for(i = 0; i < imp_arr.length; i++){
                    if(imp_arr[i].trim() != "none"){
                         var t = [imp_arr[i].trim(), term, "1", "something"];
                          sales_data.push(t);
                      }
                            for (j = 0; j < exp_arr.length; j++){
                                if(exp_arr[j].trim() !="none"){
                                  var t2 = [term, exp_arr[j].trim(), "1", "something"];
                                  sales_data.push(t2);
                              }
                            }

                }

                var tier1, tier2, tier2plus;
                
                if(v.tier_i == 1) {tier1 = "Yes";}
                  else if (v.tier_i == 0) {tier1 = "No"}
                  else { tier1 == v.tier_i;}

                if(v.tier_ii == 1) {tier2 = "Yes";}
                  else if (v.tier_ii == 0) {tier2 = "No"}
                  else { tier2 == v.tier_ii;}

                if(v.tier_ii_plus == 1) {tier2plus = "Yes";}
                  else if (v.tier_ii_plus == 0) {tier2plus = "No"}
                  else { tier2plus == v.tier_ii_plus;}


                if(term == "Israel" || term == "United Kingdom" || term == "United States"){ 
                    $('table#table1').append('<tr><td>' + 
                      term + '</td><td>' + 
                      v.desc + '</td><td>' + 
                      tier1 + '</td><td>' + 
                      tier2 + '</td><td>' + 
                      tier2plus +'</td></tr>');
                }

                else if(term == "China"|| term == "France" || term == "Iran"){ 
                    $('table#table2').append('<tr><td>' + 
                      term + '</td><td>' + 
                      v.desc + '</td><td>' + 
                      tier1 + '</td><td>' + 
                      tier2 + '</td><td>' + 
                      tier2plus +'</td></tr>');
                }

                else {
                    $('table#table3').append('<tr><td>' + 
                      term + '</td><td>' + 
                      v.desc + '</td><td>' + 
                      tier1 + '</td><td>' + 
                      tier2 + '</td><td>' + 
                      tier2plus +'</td></tr>');
                }

            });

  var data = [ 
    {data:bP.partData(sales_data,2), id:'SalesAttempts', header:["From","To", "Export/Import", "Continent"]},
  ];

  bP.draw(data, svg2);


});
});
}(jQuery));