function main(){ 

	include("scripts/File/Print/Print.js");
	var path = prepareDirectory(getArgument(args,"-f"));

	var doc = new RDocument(new RMemoryStorage(), new RSpatialIndexNavel());
	var di = new RDocumentInterface(doc);
	doc.setUnit(RS.Millimeter);

	var textFile = readTextFile(path+'layers.txt');
	var wallLayers = getWallLayers(textFile);
	importFiles(doc, di);
	removeText(doc,di);
	
	turnOnLayers(doc,di,textFile);
	var scene = new RGraphicsSceneQt(di);			  
	var view = new RGraphicsViewImage();
	setPageVariables(doc,di,view,scene);

	var exporter = new Print(undefined, doc, view);
	filename = inputfile.substring(inputfile.lastIndexOf("/")+1,inputfile.length-4);
	path2 = path+"Helperfiles/"+filename+".pdf";
	exporter.print(path2);							  //Export to PDF
	di.exportFile(path+"Helperfiles/"+filename+".dxf","DFX 2000");

	//This is sort of old code. It's nice to keep it in because for some buildings it is neccesary to turn of some layers to get a good outline of the outer walls.
	//Doesn't do any harm to keep it in. this function just checks if there are, in the layers.txt file layers preceded with ####, if so, it will only use those layers to calculate the outer walls.
	if(getArgument(args,"-o") == "true"){
		if(wallLayers==""){
			turnOnLayers(doc,di,textFile);
		}		
		else{
			turnOnLayers(doc,di,wallLayers);
		}
		var scene = new RGraphicsSceneQt(di);			  
		var view = new RGraphicsViewImage();
		setPageVariables(doc,di,view,scene);

		var exporter = new Print(undefined, doc, view);
		filename = inputfile.substring(inputfile.lastIndexOf("/")+1,inputfile.length-4);
		path2 = path+"Coordinatefiles/"+filename+".pdf";
		exporter.print(path2);
		di.exportFile(path+"Coordinatefiles/"+filename+".dxf","DFX 2000");
	}
	di.destroy()
}

function getWallLayers(textFile){
	var temp = "";
	textFile = textFile.split("\n");
	for (i = 0;i<textFile.length;i++){
		if(textFile[i].substring(0,4)=="####"){
			temp = temp.concat(textFile[i].substring(4,textFile[i].length)+"\n");
		}
	}
	return temp;
}

function prepareDirectory(path){
	while(!path.endsWith('/')){
		path = path.slice(0,-1);
	}
	return path;
}

function setPageVariables(doc,di,view,scene){
	var parameters = getParameters();
	view.setHairlineMode(true);
	view.setColorMode(RGraphicsView.BlackWhite);
	view.setScene(scene);
	scene.regenerate();
	var correctscale = "1:"+ parameters["scale"];
	doc.setVariable("PageSettings/PaperWidth", parameters["width"]);
	doc.setVariable("PageSettings/PaperHeight", parameters["height"]);
	doc.setVariable("PageSettings/Scale", correctscale);
	doc.setVariable("PageSettings/OffsetX", parameters["xoff"]);
	doc.setVariable("PageSettings/OffsetY", parameters["yoff"]);
	doc.setVariable("MultiPageSettings/Rows", 1);
	doc.setVariable("MultiPageSettings/Columns", 1);
	doc.setVariable("MultiPageSettings/PrintCropMarks", false);
	doc.setVariable("PageTagSettings/EnablePageTags", false);
}

function getParameters(){
	var temp = {};
	if(testArgument(args, "-x")){
		if(getArgument(args, "-x")==''){
			temp["xoff"] = 0;
		}
		else{
			temp["xoff"] = getArgument(args, "-x");
		}
	}
	if(testArgument(args, "-y")){
		if(getArgument(args, "-y")==''){
			temp["yoff"] = 0;
		}
		else{
			temp["yoff"] = getArgument(args, "-y");
		}
	}
	if(testArgument(args, "-w")){
		if(getArgument(args, "-w")==''){
			temp["width"] = 100;
		}
		else{
			temp["width"] = getArgument(args, "-w");
		}
	}
	if(testArgument(args, "-h")){
		if(getArgument(args, "-h")==''){
			temp["height"] = 100;
		}
		else{
			temp["height"] = getArgument(args, "-h");
		}
	}
	if(testArgument(args, "-s")){
		if(getArgument(args, "-s")==''){
			temp["scale"] = 1000;
		}
		else{
			temp["scale"] = getArgument(args, "-s");
		}
	}
	return temp;
}

function turnOnLayers(doc,di,textFile){
	textFile = textFile.split("\n");
	var operation = new RModifyObjectsOperation();
	var layers = doc.queryAllLayers();
		for (var l = 0; l < layers.length; l++) {
			var layer = doc.queryLayer(layers[l]);
			for(var i = 0; i<textFile.length;i++){
				if(textFile[i].indexOf('####') !== -1){
					if (layer.getName()===textFile[i].substring(4,textFile[i].length)) {
				        layer.setFrozen(false);
				        break;
			    	}
				}
			    if (layer.getName()===textFile[i]) {
			        layer.setFrozen(false);
			        print("turned on layer " + textFile[i]);
			        break;
			    } else {
			        layer.setFrozen(true);
			    }
			    operation.addObject(layer);
		}

	}
	di.applyOperation(operation);
}

function turnOnAllLayers(doc,di){
	var operation = new RModifyObjectsOperation();
	var layers = doc.queryAllLayers();
		for (var l = 0; l < layers.length; ++l) {
	    	var layer = doc.queryLayer(layers[l]);
	        layer.setFrozen(false);
	    	operation.addObject(layer);
		}
	di.applyOperation(operation);
}

function testArgument(args, shortFlag, longFlag) {
    if (shortFlag!=="" && args.indexOf(shortFlag)!==-1) {
        return true;
    }
    if (longFlag!=="") {
        if (args.indexOf(longFlag)!==-1) {
            return true;
        }
        for (var k=0; k<args.length; k++) {
            if (args[k].indexOf(longFlag+"=")===0) {
                return true;
            }
        }
    }
    return false;
}

function getArgument(args, shortFlag, longFlag, def) {
    var ret = getArguments(args, shortFlag, longFlag);
    if (ret.length===0) {
        return def;
    }
    return ret[0];
}

function removeText(doc, di){
	turnOnAllLayers(doc,di);
		var textID = doc.queryAllEntities(false,false,RS.EntityText);
	for(var i = 0;i<textID.length;i++){
			var op = new RMixedOperation();
			entity = doc.queryEntity(textID[i]);
			op.deleteObject(entity);
			di.applyOperation(op);
	}

	var textBasedID = doc.queryAllEntities(false,false,RS.EntityTextBased);
	for(var i = 0;i<textBasedID.length;i++){
			var op = new RMixedOperation();
			entity = doc.queryEntity(textBasedID[i]);
			op.deleteObject(entity);
			di.applyOperation(op);
	}
}

function getArguments(args, shortFlag, longFlag) {
    var ret = [];
    for (var k=0; k<args.length; k++) {
        if (args[k]===shortFlag) {
            if (k+1 < args.length) {
                ret.push(args[k+1]);
            }
        }

        if (args[k].indexOf(longFlag+"=")===0) {
            var j=args[k].indexOf("=");
            ret.push(args[k].substr(j+1));
        }
    }
    return ret;
}

function importFiles(doc,di){
		if(testArgument(args, "-f")){
		inputfile = getArgument(args, "-f");
		di.importFile(inputfile);
		if (di.importFile(inputfile) != RDocumentInterface.IoErrorNoError) {
			print("something went wrong with import");
		}
	}
}

function readTextFile(file){
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                alert(allText);
            }
        }
    }
    rawFile.send(null);
}

if (typeof(including)=='undefined' || including===false) {
    main();
}

