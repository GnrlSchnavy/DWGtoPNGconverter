Requirements:
-	All the to be converted DWG or DXF files in one directory.
-	3 files, which can be found here: Link to drive folder
- start.sh
- javascript.js
	- layers.txt
- 	ImageMagick's for Mac (https://www.imagemagick.org/script/download.php) which first needs (https://www.macports.org/install.php) 
-	Follow macports 3 steps first.  Then sudo port install ImageMagick and done. To test type convert in console and if you get a list of text explaining the command you know it worked. Don't forget to open a new terminal window after installing!

Preparation:
Place all the above mentioned files into the same folders that the .dwg(s) reside. To prepare the layers we have to open one of the DWG files and see what layers will fit the floorplan best. 
Some quick ease of use tip: Open the biggest and smallest .dwg files (in size) to compare what layers are missing between those files. Use layers from both files to decide which ones should be included.
When you have decided and selected the layers that should make up the complete floorplan all of the other floors, use the "MyTools" menu and select listActiveLayers. This will give a list in the command line of all the layers you chose to be active. Copy this list into the layers.txt file. You are of course also free to manually add some extra layers to file from different DWG files. Every layer should be on a new line. You are now all setup to run the script. Only the layers that are inside the layers.txt file will be turned on and shown.

Running the scripts:
Through terminal change to the directory that the scripts have been copied and the DWG reside. The script takes in the following parameters: -w, -h, -x, -y, -s.
There are 2 extra parameters: "-p" and "-t".
-p has to be followed by an integer and allows you to set the DPI or PPI for the eventual PNG. The -p parameter is not mandatory and is set by default to 1200.
-t is followed by a number that gives the percentage of opacity a pixel needs to have be either be completely visible or completely invisible. The default value for -t is very low already, namelijk 0.8. When should you fiddle with the threshold? Only if you think you are seeing either too many or too few lines. If you see to many lines or pixels, you will have to up the -t value. If you see full lines missing, you will have to lower the -t value even more. The -t value always has to be > 0. If a parameter is missing the script should automatically fill in a default value and give you a notice about this! 

Parameter explanation:
-w should be followed by the width of the pdf (Example "-w 310")
-h should be followed by the height of the pdf(Example "-h 110")
-x should be followed by the value of the offset for the x-axis (Example "-x 4000")
-y should be followed by the value of the offset for the y-axis (Example "-y -1200")
-s should be followed by the value for the scale of the drawing. This is usually just 1:1000. But in rare occasions this can be a different value. (Example "-s 1000"). This will give you a scale of 1:1000

A complete statement to run the program would look something like this. ./start -x -5000 -y -5000 -h 97 -w 310 -s 1000

When you have filled in all the parameters the script should do the rest of the job. Depending on how many layers and how big the original DWG file was, this can take up to 1 ~ 2 minutes per DWG. You can keep on working on something else while the script runs. 
The files will be put in their respective correct folders (PNG and Helperfiles). Also a standard Helperfile.txt will be created in the Helperfiles directory containing all the information that might be needed in the future. 

The inner workings of the script are very straight forward. 
Create 2 directories (Helperfiles and PNG)
Create a Helperfile.txt in Helperfile directory and fills it with useful info.
It finds a .dwg file. 
Applies the layers from the layers.txt.
Removes (as far as it is possible all the text). 
Converts the file to a PDF into the Helperfiles directory
Converts the file to a DXF into the Helperfiles directory
Converts the PDF to PNG into the PNG directory
Repeat until all .dwg files are found and processed.










