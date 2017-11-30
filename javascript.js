 function main(){ 

	//Start imports
	include("scripts/File/Print/Print.js");
	var path = prepareDirectory(getArgument(args,"-f"));

	//Start document initiation
	var doc = new RDocument(new RMemoryStorage(), new RSpatialIndexNavel());
	var di = new RDocumentInterface(doc);
	doc.setUnit(RS.Millimeter);

	//Do import, fix layers and remove text
	var textFile = readTextFile(path+'layers.txt');   //Read layers from text file
	var wallLayers = getWallLayers(textFile);
	importFiles(doc, di);							  //Import the dwg file passed through the bash script
	removeText(doc,di);								  //Remove all the text and text-based elements from the drawing
	
	turnOnLayers(doc,di,textFile);					  //Turn on the selected layers
	var scene = new RGraphicsSceneQt(di);			  
	var view = new RGraphicsViewImage();
	setPageVariables(doc,di,view,scene);			  //set offsets, page width and height, grayscale, hairlines etc.

	//Start export and creation of maps
	var exporter = new Print(undefined, doc, view);	  
	filename = inputfile.substring(inputfile.lastIndexOf("/")+1,inputfile.length-4);
	path2 = path+"Helperfiles/"+filename+".pdf";
	exporter.print(path2);							  //Export to PDF
	print("\n\nMESSAGE1:file exported to " + path2 + "\n\n");
	di.exportFile(path+"Helperfiles/"+filename+".dxf","DFX 2000");	//Export to dxf

	//This is sort of old code. It's nice to keep it in because for some buildings it is neccesary to turn of some layers to get a good outline of the outer walls.
	//Doesn't do any harm to keep it in. this function just checks if there are, in the layers.txt file layers preceded with ####, if so, it will only use those layers to calculate the outer walls.
	if(getArgument(args,"-o") == "true"){
		if(wallLayers==""){
			turnOnLayers(doc,di,textFile);
		}		
		else{
			turnOnLayers(doc,di,wallLayers);					  //Turn on the selected layers
		}			//turned on if outerwalls should also be printed
		var scene = new RGraphicsSceneQt(di);			  
		var view = new RGraphicsViewImage();
		setPageVariables(doc,di,view,scene);			  //set offsets, page width and height, grayscale, hairlines etc.

		//Start export and creation of maps
		var exporter = new Print(undefined, doc, view);	  
		filename = inputfile.substring(inputfile.lastIndexOf("/")+1,inputfile.length-4);
		path2 = path+"Coordinatefiles/"+filename+".pdf";
		exporter.print(path2);		
	}
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
			print("MESSAGE1:no x value found, setting it to default 0");
		}
		else{
			temp["xoff"] = getArgument(args, "-x");
			print("MESSAGE1:xoff set to "+ temp["xoff"]);
		}
	}
	if(testArgument(args, "-y")){
		if(getArgument(args, "-y")==''){
			temp["yoff"] = 0;
			print("MESSAGE1:no y value found, setting it to default 0");
		}
		else{
			temp["yoff"] = getArgument(args, "-y");
			print("MESSAGE1:yoff set to "+ temp["yoff"]);
		}
	}
	if(testArgument(args, "-w")){
		if(getArgument(args, "-w")==''){
			temp["width"] = 100;
			print("MESSAGE1:no width value found, setting it to default 100");
		}
		else{
			temp["width"] = getArgument(args, "-w");
			print("MESSAGE1:width set to "+ temp["width"]);
		}
	}
	if(testArgument(args, "-h")){
		if(getArgument(args, "-h")==''){
			temp["height"] = 100;
			print("MESSAGE1:no height value found, setting it to default 100");
		}
		else{
			temp["height"] = getArgument(args, "-h");
			print("MESSAGE1:height set to "+ temp["height"]);
		}
	}
	if(testArgument(args, "-s")){
		if(getArgument(args, "-s")==''){
			temp["scale"] = 1000;
			print("MESSAGE1:no scale value found, setting it to default 1000");
		}
		else{
			temp["scale"] = getArgument(args, "-s");
			print("MESSAGE1:scale set to "+ temp["scale"]);
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
		print("\n\nMESSAGE1:found file " + inputfile + " for processing\n\n");
		di.importFile(inputfile);
		// verify import:
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

