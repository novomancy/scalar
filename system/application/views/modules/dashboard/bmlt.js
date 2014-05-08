function bmlt($, user_id, api_key, book_id, api_url){
    dataArray = {
        'native': 0,
        'scalar:urn': '',
        'id': user_id,
        'api_key': api_key,
        'action': 'ADD',
        'scalar:child_urn': 'urn:scalar:book:'+book_id,
        'scalar:child_type': 'http://scalar.usc.edu/2012/01/scalar-ns#Book',
        'scalar:child_rel': 'page',
        'urn:scalar:book': 'urn:scalar:book:'+book_id,
        'dcterms:title': '',
        'dcterms:description': '',
        'dcterms:creator': '',                              //note that extra authors are discarded
        'scalar:thumbnail': '',
        'scalar:url': '',                                   //url of the media file
        'sioc:content': '',                                 //leave blank
        'scalar:default_view': 'plain',
        'scalar:is_live': 0,
        'dcterms:source': '',
        'rdf:type': 'http://scalar.usc.edu/2012/01/scalar-ns#Media'
    };

    var nodeMap = function(node){
        for(var key in node) dataArray[key] = node[key];
    };

    var submitMedia = function(){
        $.ajax({
            url : api_url, 
            type : 'POST', 
            data : dataArray,
            success : function(res) {
                if(confirm("Content saved. Would you like to go to Scalar now?")){
                    for(version in res){
                        window.location.href=version;
                    }
                }
            },
            error: function(){

            }
        });
    };

    var parents = new Array();
    $('meta').each(function(i){
        if(parents.length==0) parents.push(this.parentNode);
        else{
            var hit=false;
            for(var i=0; i<parents.length; i++) if(parents[i]==this.parentNode) hit=true;
            if(!hit) parents.push(this.parentNode);
        };
    });
    for(var i=parents.length-1; i>=0; i--){
        if($(parents[i]).attr('itemtype')!='http://schema.org/VideoObject') parents.splice(i,1);
    }
    var nodes = new Array();
    for(var i=0; i<parents.length; i++){
        var children = $(parents[i]).children();
        var node = new Array();
        for(var j=0; j<children.length; j++){
            if(!$(children[j]).attr) continue;      //just in case
            var data = $(children[j]);
            switch(data.attr('itemprop')){
                case 'url':             node['dcterms:source'] = data.attr('href'); break;
                case 'thumbnailUrl':    node['scalar:thumbnail'] = data.attr('href'); break;
                case 'embedURL':        node['scalar:url'] = data.attr('href').split('?')[0]; break;
                case 'name':            node['dcterms:title'] = data.attr('content'); break;
                case 'description':     node['dcterms:description'] = data.attr('content'); break;
                case 'author':          var subData = data.children('link');
                                        node['dcterms:creator'] = $(subData[0]).attr('href'); break;
                default: ;
            };
        };
        nodes.push(node);
    };
    if(nodes.length == 1){
        nodeMap(nodes[0]);
        submitMedia();
    };
};