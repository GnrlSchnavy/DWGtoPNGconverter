<h2>Introduction</h2>
Some thrown together scripts that can convert DWG files to PNG files in batch. This was mostly used to convert DWG files of floorplans from buildings with multiple floors.

<h2>Requirements:</h2>

- All the to be converted DWG's in one directory.
- In same directory as DWG':
  - start.sh
  - javascript.js
  - layers.txt
  - lines.py
- 	Install Imagemagick using 'brew install imagemagick' in terminal. If brew is not installed do this first.
- 	To test type convert in console and if you get a list of text explaining the command you know it worked. Don't forget to open a new terminal window after installing!

<h2>Preparation:</h2>
Place all the above mentioned files into the same folders that the .dwg(s) reside. To prepare the layers we have to open one of the DWG files and see what layers will fit the floorplan best. 
Some quick ease of use tip: If there are a lot of floors you might not want to (and have to) open all of the individual dwg's. Open at least the biggest and smallest .dwg files (in size) to compare what layers are missing between those files. Use layers from both files to decide which ones should be included. 
When you have decided and selected the layers that should make up the complete floorplan for all of the other floors, use the "MyTools" menu and select listActiveLayers. This will give a list in the command line of all the layers you chose to be active. Copy this list into the layers.txt file. Any duplicate layers that are in the layers.txt file will be removed and skipped over. You are of course also free to manually add some extra layers to file from different DWG files. Every layer should be on a new line. You are now all setup to run the script. Only the layers that are inside the layers.txt file will be turned on and shown.

<h2>Running the script:</h2>
Through terminal change to the directory that the scripts have been copied and the DWG reside. The script takes in the following parameters: -w, -h, -x, -y, -s.
There are 2 extra parameters: "-p" and "-t".
-p has to be followed by an integer and allows you to set the DPI or PPI for the eventual PNG. The -p parameter is not mandatory and is set by default to 2400.
-t is followed by a number that gives the percentage of opacity a pixel needs to have be either be completely visible or completely invisible. The default value for -t is very low already: 0.8. When should you fiddle with the threshold? Only if you think you are seeing either too many or too few lines. If you see to many lines or pixels, you will have to up the -t value. If you see full lines missing, you will have to lower the -t value even more. The -t value always has to be > 0. If a parameter is missing the script should automatically fill in a default value. Experience has shown that most of the time, the default PPI and threshold work fine. 
Finally the parameter -o (for outline) will, if added, try to create the outlines of the building and put the coordinates of the lines into a separate folder called "Coordinatefiles". 
Sometimes there are to many layers or objects present for the outline algorithm to do it's work. If you find that more than just the outline of a building is show in the outline PNG's one will have to dive back into the DWG files and only use the layers that add to the outline of the building. Once those have been found. In the layers.txt these layers should be prepended with "####". This will make the algorithm take only those layers when creating the outer walls.

<h2>Parameter explanation:</h2>
-w should be followed by the width of the pdf (this can be either an int or float) (Example "-w 310.2")
-h should be followed by the height of the pdf(this can be either an int or float)(Example "-h 110.5")
-x should be followed by the value(int) of the offset for the x-axis (Example "-x 4000")
-y should be followed by the value(int) of the offset for the y-axis (Example "-y -1200")
-s should be followed by the value(int) for the scale of the drawing. This is usually just 1:1000. But in rare occasions this can be a different value. (Example "-s 1000"). This will give you a scale of 1:1000
-p should be followed by the prefered PPI value(int). This can range from 72 all the way up to 2400. Rule of thumb is the higher the PPI the better the drawing will look, but it will also take significantly longer to create the PNG's
-t should be followed by a number between 0 and 1. The lower the number will be, the more grey pixels will be converted to black(PRIME) or white(PNG used for customers).
-o should not be followed by anything. Adding the "-o" parameter just tells the script to also render the outlines of the building. 

A complete statement to run the program would look something like this.`./start -x -5000 -y -5000 -h 97 -w 310 -s 1000`

<h2>Philips example:</h2>
The layers and commands (with the correct parameters) can be found at the end of this document. 

When you have filled in all the parameters the script should do the rest of the job. Depending on how many layers and how big the original DWG files were, this may take up to 1 ~ 5 minutes per DWG. You can keep on working on something else while the script runs. 
The files will be put in their respective correct folders (PNG and Helperfiles). Also a standard Helperfile.txt will be created in the Helperfiles directory containing all the information that might be needed in the future. 

The inner workings of the script are very straight forward. 
Create directories
Create a Helperfile.txt in Helperfile directory and fills it with useful info.
It finds a .dwg file. 
Applies the layers from the layers.txt.
Removes (as far as it is possible all the text). 
Converts the file to a PDF into the Helperfiles and Coordinatefiles directory
Converts the file to a DXF into the Helperfiles directory
Converts the PDF to PNG into the PNG directory
Converts PDF in Coordinatefiles directory to suitable PNG with outlines of the building.
Repeat until all .dwg files are found and processed.


<h2>Philips commands and layers example:</h2>
`
--Command to run--

./start -x -66000 -y 4000 -w 117 -h 34.5 -s 1000 -p 2400 -t 0.08

 --Variables-- 

-xoffset: -66000
-yoffset: 4000
-width:   117
-height:  34.5
-scale:   1000
-PPI:     2400
-Threshold 0.08

----Active layer list---
0
A-ANNO-CATEGORY
A-ANNO-EMPFIRST
A-ANNO-EMPLAST
A-ANNO-ORGANIZATION
A-COLS
A-DOOR
A-EQPM
A-EQPM-FIXD
A-FLOR-EVTR
A-FLOR-HRAL
A-FLOR-LEVL
A-FLOR-OTLN
A-FLOR-STRS
A-FURN-FILE
A-FURN-FREE
A-FURN-IDEN
A-GLAZ
A-TITLE
A-WALL
A-WALL-FULL
A-WALL-MOVE
Defpoints
XRMNO
####ZB-GB
A-CEILING

`
