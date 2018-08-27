function downloadFile(data, fileName) {
        var csvData = data;
        var blob = new Blob([csvData] , {
            type : "application/csv;charset=utf-8;"
        });

        if (window.navigator.msSaveBlob) {
            // FOR IE BROWSER
            navigator.msSaveBlob(blob, fileName);
        } else {
            // FOR OTHER BROWSERS
            var link = document.createElement("a");
            var csvUrl = URL.createObjectURL(blob);
            link.href = csvUrl;
            link.style = "visibility:hidden";
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
}


function constructCSV(data){
    
    var start = true;
    var output = "";

    for (d in data){

        row = data[d];

        if (start){
            output += Object.keys(row).join(',') + "\n";
            start = false;
        }

        output += Object.values(row).map(x => '"'+x+'"').join(',') + "\n";

    }

    return output;


}

function allLinksCount(){
    
    var alinks = document.querySelectorAll("a");

    var data = {};

    for (a in alinks){
                
        var link = alinks[a];

        if (link.href != undefined){
            var pn = escape(link.href.replace(link.origin,""));

            if (data.hasOwnProperty(pn)){
                data[pn] ++;

            }else{

                data[pn] = 1;
            }
        }
    }

    return data;

}


function linkDataAll() {

    console.log('Gathering Link Data')

    var metrics =  window.wo.g.f.metrics;
    var daterange = window.wo.g.h;
    var gaData = window.wo.g.A.h;
    var linkCounts = allLinksCount();
    var totals = window.wo.g.f.views[daterange].totals;

    var data = [].map.call(document.querySelectorAll("a"), e=>{

        d = {};
        d.Page = e.baseURI.trim()
        d.Anchor = e.textContent.trim();
        d.Href = e.href.replace(e.origin,"").trim();
        d.Rel = e.rel.trim();
        d.Date_range = daterange;
        d.Ga_websiteUrl = gaData.websiteUrl;
        d.Ga_id =  gaData.webPropertyId;
        d.Link_count = linkCounts[escape(d.Href)] || 0;

        if (d.Anchor == "" || d.Anchor == undefined){
            
            cnt = e.childElementCount

            if (cnt > 0){
                for (var i = 0; i < cnt; i++){
                    c = e.children[i]
                    if(c.nodeName == "IMG"){
                       d.Anchor = "<img>"
                       d.Anchor += c.alt != "" ? " Alt: " + c.alt.trim() : c.title != "" ? " Title: " + c.title.trim() : "";
                       break;
                    }
                }
            }
        }

        if (e.hasOwnProperty('Ia') && e['Ia'] != null) {
           var td =  e.Ia.td;
           var dt = td[Object.keys(td)[0]]

           for (m in metrics){

               var name = metrics[m].name;

               d[name] = parseInt(dt[m].value.replace(/[^0-9\.]+/g, ""));

           }

          
        }else{


           for (m in metrics){

               var name = metrics[m].name;

               d[name] = 0;

           }
                    
        }


        if (d.hasOwnProperty('Clicks')){

            if (d.Link_count > 0){
                d.Clicks_per_link = (parseInt(d.Clicks) / parseInt(d.Link_count)).toFixed(0);
            }else{
                d.Clicks_per_link = 0
            }


        }
        
        return d;

    });

    var total_row = {}
    for (r in data[0]){
        
        total_row[r] = '';

    }

    for (m in metrics){
        
        var name = metrics[m].name;
        total_row[name] = parseInt(totals[m]);

    }    
    
    total_row.Href = "Totals"
    data.push(total_row)

    var csv = constructCSV(data)
    downloadFile(csv, 'linkinfo.csv')

}



function linkDataPA() {

    console.log('Gathering Link Data')

    var metrics =  window.wo.g.f.metrics;
    var daterange = window.wo.g.h;
    var linkKeys = window.wo.g.a.g.a.a;
    var linkValues = window.wo.g.a.g.a.b;
    var linkCounts = window.wo.g.u.b;
    var gaData = window.wo.g.A.h;
    var totals = window.wo.g.f.views[daterange].totals;

    var data = [].map.call(linkKeys, key=>{
        
        d = {};
        
        var el = linkValues[key];

        var a = el.b;
        var href = el.h;
        var dt = el.td[Object.keys(el.td)[0]]
        
        d.Ga_websiteUrl = gaData.websiteUrl
        d.Ga_id =  gaData.webPropertyId

        d.Page = a.baseURI.trim()
        d.Anchor = a.textContent.trim();
        d.Href = href.trim();
        d.Rel = a.rel.trim();
        d.Date_range = daterange
        d.Link_count = linkCounts[href].length || 0

        if (!d.Anchor || d.Anchor == ""){
            
            cnt = a.childElementCount

            if (cnt > 0){
                for (var i = 0; i < cnt; i++){
                    c = a.children[i]
                    if(c.nodeName == "IMG"){
                       d.Anchor = "<img>"
                       d.Anchor += c.alt != "" ? " Alt: " + c.alt.trim() : c.title != "" ? " Title: " + c.title.trim() : "";
                       break;
                    }
                }
            }
        }

        for (m in metrics){

            var name = metrics[m].name;

            d[name] = parseInt(dt[m].value.replace(/[^0-9\.]+/g, ""));

        }

        if (d.hasOwnProperty('Clicks')){

            if (d.Link_count > 0){
                d.Clicks_per_link = (parseInt(d.Clicks) / parseInt(d.Link_count)).toFixed(0);
            }else{
                d.Clicks_per_link = 0
            }


        }


        return d;

    });
    
    var total_row = {}
    for (r in data[0]){
        
        total_row[r] = '';

    }

    for (m in metrics){
        
        var name = metrics[m].name;
        total_row[name] = parseInt(totals[m]);

    }    
    
    total_row.Href = "Totals"
    data.push(total_row)

    //DEBUG: console.log(data)
    var csv = constructCSV(data)
    downloadFile(csv, 'linkinfo.csv')

}


function run(){

    var choice = prompt('Select report type: (All links: All found links on the page. PA links: Links reported in the Page Analytics object.)')
    
    switch(choice) {
        case "All links":
            linkDataAll();
            break;
        case "PA links":
            linkDataPA();
            break;
        default:
            alert('Incorrect choice. Choose either `All links` or `PA Links`');
            break;
    }    

}


run();


